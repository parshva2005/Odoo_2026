import React from 'react';
import Header from './header';
import Sidebar from './sidebar';

export default function Layout({ children }) {
    return (
        <div className="layout-container min-vh-100 bg-light d-flex flex-column">

            {/* Top Header */}
            <Header />

            {/* Body */}
            <div className="d-flex flex-grow-1">

                {/* Sidebar Navigation */}
                <Sidebar />

                {/* Main Content */}
                <main className="layout-main flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
                    <div className="container-fluid page-transition">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}
