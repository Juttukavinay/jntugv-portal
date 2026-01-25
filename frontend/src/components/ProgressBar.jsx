import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ProgressBar = () => {
    const [progress, setProgress] = useState(0);
    const location = useLocation();

    useEffect(() => {
        // Reset and start animation on route change
        setProgress(0);

        const timer1 = setTimeout(() => setProgress(30), 100);
        const timer2 = setTimeout(() => setProgress(60), 300);
        const timer3 = setTimeout(() => setProgress(90), 500);
        const timer4 = setTimeout(() => setProgress(100), 800);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [location]);

    // Hide bar when complete (optional, or keep it at 100% briefly then fade)
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        if (progress === 100) {
            const t = setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 500);
            return () => clearTimeout(t);
        } else {
            setVisible(true);
        }
    }, [progress]);

    if (!visible && progress === 0) return null;

    return (
        <div className="nprogress-container">
            <div
                className="nprogress-bar"
                style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
            ></div>
        </div>
    );
};

export default ProgressBar;
