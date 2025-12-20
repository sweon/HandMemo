import Peer, { type DataConnection } from 'peerjs';
import { getBackupData, mergeBackupData } from '../utils/backup';

export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'completed' | 'error' | 'ready';

export interface SyncServiceOptions {
    onStatusChange: (status: SyncStatus, message?: string) => void;
    onDataReceived: () => void;
}

export const cleanRoomId = (roomId: string): string => {
    return roomId.trim().replace(/[^a-zA-Z0-9_-]/g, '-');
};

export class SyncService {
    private peer: Peer | null = null;
    private conn: DataConnection | null = null;
    private options: SyncServiceOptions;
    private heartbeatInterval: any = null;
    private lastPong: number = 0;
    private isHost: boolean = false;
    private isInitiator: boolean = false;

    constructor(options: SyncServiceOptions) {
        this.options = options;
        this.handleConnection = this.handleConnection.bind(this);
    }

    public async initialize(roomId: string): Promise<string> {
        this.isHost = true;
        this.isInitiator = false;

        if (this.peer) {
            this.peer.destroy();
            await new Promise(r => setTimeout(r, 500));
        }

        this.options.onStatusChange('connecting', 'Starting sync server...');

        return new Promise((resolve, reject) => {
            const cleanId = cleanRoomId(roomId);

            // Back to basics: use default PeerJS configuration
            this.peer = new Peer(cleanId, {
                debug: 2,
                secure: true
            });

            this.peer.on('open', (id) => {
                this.options.onStatusChange('ready', `ID: ${id}`);
                resolve(id);
            });

            this.peer.on('connection', (conn) => {
                console.log('Peer connected as client');
                this.handleConnection(conn);
            });

            this.peer.on('error', (err: any) => {
                console.error('PeerJS error:', err.type);
                let msg = 'Connection failed';
                if (err.type === 'unavailable-id') msg = 'ID already in use';
                if (err.type === 'network') msg = 'Network issue';

                this.options.onStatusChange('error', msg);
                reject(err);
            });

            this.peer.on('disconnected', () => {
                if (this.peer && !this.peer.destroyed) {
                    this.peer.reconnect();
                }
            });
        });
    }

    public async connect(targetPeerId: string) {
        const cleanTargetId = cleanRoomId(targetPeerId);

        // Always start fresh for a new connection attempt
        if (this.peer) {
            this.peer.destroy();
            await new Promise(r => setTimeout(r, 500));
        }

        this.isHost = false;
        this.isInitiator = true;
        this.options.onStatusChange('connecting', 'Linking...');

        this.peer = new Peer({
            debug: 2,
            secure: true
        });

        this.peer.on('open', (id) => {
            console.log('Client identity established:', id);
            this._connect(cleanTargetId);
        });

        this.peer.on('error', (err: any) => {
            console.error('Client error:', err.type);
            this.options.onStatusChange('error', `Fail: ${err.type}`);
        });
    }

    private _connect(targetPeerId: string) {
        if (!this.peer) return;
        const conn = this.peer.connect(targetPeerId, { reliable: true });
        this.handleConnection(conn);
    }

    private handleConnection(conn: DataConnection) {
        // Prevent duplicate connection handling for the same peer
        if (this.conn && this.conn.peer === conn.peer && this.conn.open) {
            console.log('Ignoring redundant connection from:', conn.peer);
            return;
        }

        if (this.conn) {
            this.conn.close();
        }

        this.conn = conn;

        conn.on('open', async () => {
            console.log('Data channel open with:', conn.peer);
            this.options.onStatusChange('connected', 'Peers linked.');

            this.lastPong = Date.now();
            this.startHeartbeat();

            // Sequential Sync: Initiator (Client) sends first
            if (this.isInitiator) {
                console.log('Initiating data transfer...');
                setTimeout(() => this.syncData(), 1000);
            }
        });

        conn.on('data', async (data: any) => {
            if (data?.type === 'ping') {
                this.conn?.send({ type: 'pong' });
                return;
            }
            if (data?.type === 'pong') {
                this.lastPong = Date.now();
                return;
            }

            // Sync Payload
            if (data && data.logs && data.models) {
                const logCount = data.logs.length;
                this.options.onStatusChange('syncing', `Merging ${logCount} logs...`);

                try {
                    await mergeBackupData(data);
                    console.log('Merge complete.');

                    // Host: Now send our data back to client to complete bilateral sync
                    if (this.isHost) {
                        this.options.onStatusChange('syncing', 'Updating client with merged data...');
                        setTimeout(() => this.syncData(), 500);
                    } else {
                        // Client: We are done
                        this.options.onStatusChange('completed', 'Sync finalized.');
                        this.options.onDataReceived();
                    }
                } catch (err: any) {
                    this.options.onStatusChange('error', `Sync failed: ${err.message}`);
                }
            }
        });

        conn.on('close', () => {
            console.log('Connection closed.');
            this.stopHeartbeat();
            if (this.conn === conn) {
                this.options.onStatusChange('disconnected', 'Disconnected');
                this.conn = null;
            }
        });

        conn.on('error', (err) => {
            console.error('Socket error:', err);
            this.options.onStatusChange('error', 'Socket error occurred.');
        });
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.conn && this.conn.open) {
                if (Date.now() - this.lastPong > 20000) {
                    console.warn('Heartbeat timeout.');
                    this.conn.close();
                    return;
                }
                this.conn.send({ type: 'ping' });
            } else {
                this.stopHeartbeat();
            }
        }, 5000);
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    public async syncData() {
        if (!this.conn || !this.conn.open) return;

        try {
            const data = await getBackupData();
            if (this.conn && this.conn.open) {
                console.log('Sending payload, size:', data.logs.length);
                this.conn.send(data);
            }
        } catch (err: any) {
            this.options.onStatusChange('error', 'Data preparation failed.');
        }
    }

    public destroy() {
        this.stopHeartbeat();
        if (this.conn) {
            this.conn.close();
            this.conn = null;
        }
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }
}
