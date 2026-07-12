/**
 * MaintenanceService
 * Manages repair ticketing, status pipelines, technician assignments,
 * and cost logging persisted in localStorage.
 */

import axios from 'axios';
import { initializeData } from '../data/dummyData';

const API_BASE = 'https://jsonplaceholder.typicode.com';
initializeData();

// Seed initial reports if not present
const seedTickets = () => {
    if (!localStorage.getItem('assetflow_maintenance')) {
        const initialTickets = [
            {
                id: 'tkt_1',
                assetId: 'a1',
                assetName: 'MacBook Pro M3',
                assetTag: 'AST-2026-001',
                reportedBy: 'employee@assetflow.com',
                reportedByName: 'David Employee',
                description: 'Screen flickering when running heavy rendering processes.',
                priority: 'High',
                status: 'In Progress',
                technician: 'Alex Fixer',
                cost: 150,
                reportedDate: '2026-07-10',
                resolvedDate: null
            },
            {
                id: 'tkt_2',
                assetId: 'a2',
                assetName: 'iPad Pro 12.9"',
                assetTag: 'AST-2026-002',
                reportedBy: 'head@assetflow.com',
                reportedByName: 'Sarah Head',
                description: 'Battery draining faster than expected under typical workspace usage.',
                priority: 'Medium',
                status: 'Pending',
                technician: '',
                cost: 0,
                reportedDate: '2026-07-12',
                resolvedDate: null
            }
        ];
        localStorage.setItem('assetflow_maintenance', JSON.stringify(initialTickets));
    }
};
seedTickets();

export const maintenanceService = {
    /**
     * Retrieve all tickets
     */
    getAll: async () => {
        try {
            await axios.get(`${API_BASE}/posts/1`);
            const data = localStorage.getItem('assetflow_maintenance');
            return JSON.parse(data || '[]');
        } catch (error) {
            throw new Error('Failed to retrieve maintenance tickets.');
        }
    },

    /**
     * Create/file a maintenance ticket
     */
    create: async (ticketData) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Create Ticket' });
            const list = JSON.parse(localStorage.getItem('assetflow_maintenance') || '[]');

            const newTicket = {
                id: 'tkt_' + Date.now().toString(),
                ...ticketData,
                status: 'Pending',
                technician: '',
                cost: 0,
                reportedDate: new Date().toISOString().split('T')[0],
                resolvedDate: null
            };

            list.push(newTicket);
            localStorage.setItem('assetflow_maintenance', JSON.stringify(list));

            // Also temporarily set the target asset's status to 'Under Maintenance' to reflect blockings
            const assets = JSON.parse(localStorage.getItem('assetflow_assets') || '[]');
            const aIdx = assets.findIndex(a => a.id === ticketData.assetId);
            if (aIdx !== -1) {
                assets[aIdx].status = 'Under Maintenance';
                assets[aIdx].history.unshift({
                    id: 'act_' + Date.now().toString(),
                    date: new Date().toISOString().split('T')[0],
                    action: 'Maintenance Filed',
                    user: ticketData.reportedBy,
                    notes: `Ticket #${newTicket.id} raised due to: ${ticketData.description}`
                });
                localStorage.setItem('assetflow_assets', JSON.stringify(assets));
            }

            return newTicket;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Update maintenance ticket parameters (technician, status, cost)
     */
    update: async (ticketId, updateData, managerEmail) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Update Ticket' });
            const list = JSON.parse(localStorage.getItem('assetflow_maintenance') || '[]');
            const idx = list.findIndex(t => t.id === ticketId);
            if (idx === -1) throw new Error('Ticket not found');

            const item = { ...list[idx], ...updateData };
            if (updateData.status === 'Resolved') {
                item.resolvedDate = new Date().toISOString().split('T')[0];

                // Change the target asset state back to 'Available'
                const assets = JSON.parse(localStorage.getItem('assetflow_assets') || '[]');
                const aIdx = assets.findIndex(a => a.id === item.assetId);
                if (aIdx !== -1) {
                    assets[aIdx].status = 'Available';
                    assets[aIdx].history.unshift({
                        id: 'act_' + Date.now().toString(),
                        date: new Date().toISOString().split('T')[0],
                        action: 'Maintenance Resolved',
                        user: managerEmail,
                        notes: `Resolved. Tech: ${item.technician}, Cost: $${item.cost}. Notes: ${updateData.notes || 'None'}`
                    });
                    localStorage.setItem('assetflow_assets', JSON.stringify(assets));
                }
            }

            list[idx] = item;
            localStorage.setItem('assetflow_maintenance', JSON.stringify(list));
            return item;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
