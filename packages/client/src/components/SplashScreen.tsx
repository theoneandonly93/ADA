import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation((r) => (r + 6) % 360);
        }, 16); // ~60fps
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <img
                src="/elizaos-icon.png"
                alt="ADA Logo"
                style={{ width: 96, height: 96, transform: `rotate(${rotation}deg)`, transition: 'transform 0.1s linear' }}
                className="mb-8"
            />
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Starting ADA's Server...</h1>
            <p className="text-gray-700">Please wait while we start the backend services.</p>
        </div>
    );
}
