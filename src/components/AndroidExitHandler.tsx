import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Toast } from './UI/Toast';

export const AndroidExitHandler: React.FC = () => {
    const location = useLocation();
    const [showExitToast, setShowExitToast] = useState(false);
    const lastPressTime = useRef<number>(0);

    const isAtRoot = location.pathname === '/' || location.pathname === '';

    useEffect(() => {
        // We only care about the back button at the root of the app
        if (!isAtRoot) return;

        // Push a state so we can intercept the next back button
        window.history.pushState({ noExit: true }, '');

        const handlePopState = () => {
            // At root logic
            const now = Date.now();
            const timeDiff = now - lastPressTime.current;

            if (timeDiff < 2000) {
                // Second press: allow exit
                window.history.back();
            } else {
                // First press: prevent exit and show warning
                lastPressTime.current = now;
                setShowExitToast(true);
                // Re-push the state to stay on the page
                window.history.pushState({ noExit: true }, '');
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isAtRoot]);

    if (!showExitToast) return null;

    return (
        <Toast
            message="뒤로 가기 버튼을 한 번 더 누르면 종료됩니다."
            onClose={() => setShowExitToast(false)}
        />
    );
};
