import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();
    // White background, black and grey text for landing page
    return (
        <div
            className="fixed inset-0 min-h-screen w-full flex flex-col items-center justify-center px-4 z-50 bg-white"
        >
            <img src="/elizaos-icon.png" alt="ElizaOS Icon" className="w-40 h-40 mb-8" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black text-center">Welcome to Ada</h1>
            <p className="text-lg md:text-xl mb-8 max-w-xl text-center text-gray-600">
                The universal AI chat platform. Sign in with your wallet, create or use powerful agents, and chat with the latest SOTA models. Secure, cloud-based, and ready for the future.
            </p>
            <button
                onClick={() => navigate('/app')}
                className="px-8 py-3 rounded-lg bg-black text-white font-semibold text-lg shadow-lg hover:bg-gray-800 transition w-full max-w-xs"
            >
                Launch App
            </button>
        </div>
    );
}
