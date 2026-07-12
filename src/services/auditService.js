/**
 * AuditService
 * Manages tracking of scheduled corporate physical verification checkups,
 * discrepancy logs, and auditor allocations.
 */

import axios from 'axios';
import { initializeData } from '../data/dummyData';

const API_BASE = 'https://jsonplaceholder.typicode.com';
initializeData();

const seedAudits = () => {
    if (!localStorage.getItem('assetflow_audits')) {
        const initialAudits = [
            {
                id: 'aud_1',
                title: 'Q3 Software Dev Hardware Audit',
                department: 'Software Engineering',
                assignedAuditor: 'head@assetflow.com',
                assignedAuditorName: 'Sarah Head',
                status: 'In Progress',
                scheduledDate: '2026-07-15',
                items: [
                    { assetId: 'a1', assetName: 'MacBook Pro M3', tag: 'AST-2026-001', status: 'Pending', verificationStatus: '', notes: '' },
                    { assetId: 'a3', assetName: 'Dell UltraSharp 34" Monitor', tag: 'AST-2026-002', status: 'Pending', verificationStatus: '', notes: '' }
                ]
            },
            {
                id: 'aud_2',
                title: 'Q2 Product Hub Inventory Audit',
                department: 'Product Management',
                assignedAuditor: 'manager@assetflow.com',
                assignedAuditorName: 'Inventory Manager',
                status: 'Completed',
                scheduledDate: '2026-06-10',
                items: [
                    { assetId: 'a2', assetName: 'iPad Pro 12.9"', tag: 'AST-2026-002', status: 'Verified', verificationStatus: 'Matches Catalog', notes: 'Checked without damages.' }
                ]
            }
        ];
        localStorage.setItem('assetflow_audits', JSON.stringify(initialAudits));
    }
};
seedAudits();

export const auditService = {
    /**
     * Retrieve all audit campaigns
     */
    getAll: async () => {
        try {
            await axios.get(`${API_BASE}/posts/1`);
            const data = localStorage.getItem('assetflow_audits');
            return JSON.parse(data || '[]');
        } catch (error) {
            throw new Error('Failed to retrieve audit schedules.');
        }
    },

    /**
     * Spawn a new audit verification cycle
     */
    create: async (auditData) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Create Audit Campaign' });
            const list = JSON.parse(localStorage.getItem('assetflow_audits') || '[]');

            const newCampaign = {
                id: 'aud_' + Date.now().toString(),
                ...auditData,
                status: 'In Progress',
                scheduledDate: new Date().toISOString().split('T')[0]
            };

            list.push(newCampaign);
            localStorage.setItem('assetflow_audits', JSON.stringify(list));
            return newCampaign;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Submit single asset verification item feedback
     */
    verifyItem: async (campaignId, assetId, verificationStatus, notes, auditorEmail) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Verify Audit Item' });
            const list = JSON.parse(localStorage.getItem('assetflow_audits') || '[]');
            const cIdx = list.findIndex(c => c.id === campaignId);
            if (cIdx === -1) throw new Error('Audit campaign not found');

            const campaign = list[cIdx];
            const aIdx = campaign.items.findIndex(item => item.assetId === assetId);
            if (aIdx === -1) throw new Error('Asset item not found in campaign');

            campaign.items[aIdx].status = verificationStatus; // 'Verified' or 'Discrepancy'
            campaign.items[aIdx].verificationStatus = verificationStatus;
            campaign.items[aIdx].notes = notes;

            // Check if all items in this campaign are verification statuses
            const allReviewed = campaign.items.every(item => item.status !== 'Pending');
            if (allReviewed) {
                campaign.status = 'Completed';
            }

            // Sync with global asset lifecycle log
            const assets = JSON.parse(localStorage.getItem('assetflow_assets') || '[]');
            const globalAIdx = assets.findIndex(a => a.id === assetId);
            if (globalAIdx !== -1) {
                assets[globalAIdx].history.unshift({
                    id: 'act_' + Date.now().toString(),
                    date: new Date().toISOString().split('T')[0],
                    action: 'Audit Logged',
                    user: auditorEmail,
                    notes: `Audited in cycle ${campaign.title}. Status: ${verificationStatus}. Notes: ${notes}`
                });
                localStorage.setItem('assetflow_assets', JSON.stringify(assets));
            }

            localStorage.setItem('assetflow_audits', JSON.stringify(list));
            return campaign;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
