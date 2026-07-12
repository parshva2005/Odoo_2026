/**
 * PlaceholderPage Component
 * A reusable component to render mock indicators for modules under development.
 */

import React from 'react';

export default function PlaceholderPage({ title, description }) {
    return (
        <div className="py-5 text-center">
            <div className="mb-4">
                <span className="p-3 bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                    ⚙️
                </span>
            </div>
            <h2 className="fw-bold text-dark">{title} Module</h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
                {description || `The ${title} management screen. This setup is prepared and will be fully implemented in a subsequent module.`}
            </p>
            <div className="mt-4">
                <span className="badge bg-warning text-dark px-3 py-2 fw-semibold">Under Construction</span>
            </div>
        </div>
    );
}
