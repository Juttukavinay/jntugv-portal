import React from 'react';

const GlobalLoader = () => {
    return (
        <div className="loader-overlay">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="spinner-circle"></div>
                <div className="loading-text">Loading...</div>
            </div>
        </div>
    );
};

export default GlobalLoader;
