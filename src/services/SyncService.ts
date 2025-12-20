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

        this.options.onStatusChange('connecting', 'Connecting to global server...');

        if (this.peer && !this.peer.destroyed) {
            if (this.peer.id === cleanRoomId(roomId)) {
                return this.peer.id;
            }
            this.peer.destroy();
            await new Promise(r => setTimeout(r, 500));
        }

        return new Promise((resolve, reject) => {
            const cleanId = cleanRoomId(roomId);

            this.peer = new Peer(cleanId, {
                debug: 1,
                secure: true,
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            });

            this.peer.on('open', (id) => {
                this.options.onStatusChange('ready', `Room: ${id}`);
                resolve(id);
            });

            this.peer.on('connection', (conn) => {
                this.handleConnection(conn);
            });

            this.peer.on('error', (err: any) => {
                console.error('Peer Error:', err.type);
                if (err.type === 'unavailable-id') {
                    this.options.onStatusChange('error', 'Room already in use');
                } else if (!this.conn?.open) {
                    this.options.onStatusChange('error', `Server error: ${err.type}`);
                }
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

        this.isHost = false;
        this.isInitiator = true;

        const setupClient = () => {
            this.options.onStatusChange('connecting', `Searching for ${cleanTargetId}...`);
            this._connect(cleanTargetId);
        };

        if (!this.peer || this.peer.destroyed) {
            this.options.onStatusChange('connecting', 'Connecting to server...');
            this.peer = new Peer({
                debug: 1,
                secure: true,
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            });

            this.peer.on('open', setupClient);
            this.peer.on('error', (err: any) => {
                if (!this.conn?.open) {
                    this.options.onStatusChange('error', `Server error: ${err.type}`);
                }
            });
        } else {
            setupClient();
        }
    }

    private _connect(targetPeerId: string) {
        if (!this.peer || this.peer.destroyed) return;

        const conn = this.peer.connect(targetPeerId, {
            reliable: true,
            serialization: 'json'
        });

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
