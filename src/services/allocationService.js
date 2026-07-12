/**
 * AllocationService
 * Manages allocation requests, direct assignments, department transfers,
 * and return requests. Simulates state modifications in localStorage.
 */

import axios from 'axios';
import { initializeData } from '../data/dummyData';

const API_BASE = 'https://jsonplaceholder.typicode.com';
initializeData();

// Seed initial allocation requests if not present
const seedRequests = () => {
    if (!localStorage.getItem('assetflow_allocation_requests')) {
        const initialRequests = [
            {
                id: 'req_1',
                assetId: 'a3',
                assetName: 'Dell UltraSharp 34" Monitor',
                assetTag: 'AST-2026-002',
                requestedBy: 'employee@assetflow.com',
                requestedByName: 'David Employee',
                department: 'Software Engineering',
                type: 'Allocation',
                status: 'Pending',
                requestedDate: '2026-07-11',
                notes: 'Need a secondary screen for development and debug views.'
            },
            {
                id: 'req_2',
                assetId: 'a1',
                assetName: 'MacBook Pro M3',
                assetTag: 'AST-2026-001',
                requestedBy: 'head@assetflow.com',
                requestedByName: 'Sarah Head',
                department: 'Product Management',
                type: 'Return',
                status: 'Pending',
                requestedDate: '2026-07-12',
                notes: 'Returning backup machine as project cycle has ended.'
            }
        ];
        localStorage.setItem('assetflow_allocation_requests', JSON.stringify(initialRequests));
    }
};
seedRequests();

export const allocationService = {
    /**
     * Retrieve all requests
     */
    getAllRequests: async () => {
        try {
            await axios.get(`${API_BASE}/posts/1`);
            const reqs = localStorage.getItem('assetflow_allocation_requests');
            return JSON.parse(reqs || '[]');
        } catch (error) {
            throw new Error('Failed to retrieve allocation transactions list');
        }
    },

    /**
     * Raise a request (Allocation, Return, Transfer)
     */
    createRequest: async (reqData) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Create Allocation request' });
            const list = JSON.parse(localStorage.getItem('assetflow_allocation_requests') || '[]');

            const newRequest = {
                id: 'req_' + Date.now().toString(),
                ...reqData,
                status: 'Pending',
                requestedDate: new Date().toISOString().split('T')[0]
            };

            list.push(newRequest);
            localStorage.setItem('assetflow_allocation_requests', JSON.stringify(list));
            return newRequest;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Approve a pending request
     */
    approveRequest: async (reqId, approverEmail) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Approve request status' });
            const reqList = JSON.parse(localStorage.getItem('assetflow_allocation_requests') || '[]');
            const rIndex = reqList.findIndex(r => r.id === reqId);
            if (rIndex === -1) throw new Error('Request transaction not found');

            const request = reqList[rIndex];
            request.status = 'Approved';

            // Modify the target Asset status
            const assetList = JSON.parse(localStorage.getItem('assetflow_assets') || '[]');
            const aIndex = assetList.findIndex(a => a.id === request.assetId);
            if (aIndex !== -1) {
                const asset = assetList[aIndex];

                if (request.type === 'Allocation' || request.type === 'Transfer') {
                    asset.status = 'Allocated';
                    asset.allocatedTo = request.requestedBy;
                    asset.allocatedToName = request.requestedByName;
                    asset.department = request.department;
                    asset.history.unshift({
                        id: 'h_act_' + Date.now().toString(),
                        date: new Date().toISOString().split('T')[0],
                        action: request.type === 'Allocation' ? 'Allocated' : 'Transferred',
                        user: approverEmail,
                        notes: `Request approved. Notes: ${request.notes}`
                    });
                } else if (request.type === 'Return') {
                    asset.status = 'Available';
                    asset.allocatedTo = null;
                    asset.allocatedToName = '';
                    asset.history.unshift({
                        id: 'h_act_' + Date.now().toString(),
                        date: new Date().toISOString().split('T')[0],
                        action: 'Returned',
                        user: approverEmail,
                        notes: `Returned device. User notes: ${request.notes}`
                    });
                }

                localStorage.setItem('assetflow_assets', JSON.stringify(assetList));
            }

            localStorage.setItem('assetflow_allocation_requests', JSON.stringify(reqList));
            return request;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Reject/Cancel a pending request
     */
    rejectRequest: async (reqId, approverEmail) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Reject request status' });
            const reqList = JSON.parse(localStorage.getItem('assetflow_allocation_requests') || '[]');
            const rIndex = reqList.findIndex(r => r.id === reqId);
            if (rIndex === -1) throw new Error('Request transaction not found');

            reqList[rIndex].status = 'Rejected';
            localStorage.setItem('assetflow_allocation_requests', JSON.stringify(reqList));
            return reqList[rIndex];
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Allocate directly (Admin / Asset Manager bypassing request pipeline)
     */
    allocateDirectly: async (assetId, employeeEmail, employeeName, departmentName, returnDate, notes, managerEmail) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Direct allocation' });
            const assetList = JSON.parse(localStorage.getItem('assetflow_assets') || '[]');
            const aIndex = assetList.findIndex(a => a.id === assetId);

            if (aIndex === -1) throw new Error('Asset tag not found');
            const asset = assetList[aIndex];

            asset.status = 'Allocated';
            asset.allocatedTo = employeeEmail;
            asset.allocatedToName = employeeName;
            asset.department = departmentName;
            asset.history.unshift({
                id: 'h_act_' + Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                action: 'Direct Allocation',
                user: managerEmail,
                notes: `Directly allocated. Expected return: ${returnDate || 'No Limit'}. Notes: ${notes}`
            });

            localStorage.setItem('assetflow_assets', JSON.stringify(assetList));
            return asset;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Process return directly (Admin / Asset Manager clears allocate tag directly)
     */
    processReturnDirectly: async (assetId, managerEmail) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Direct return log' });
            const assetList = JSON.parse(localStorage.getItem('assetflow_assets') || '[]');
            const aIndex = assetList.findIndex(a => a.id === assetId);

            if (aIndex === -1) throw new Error('Asset record not found');
            const asset = assetList[aIndex];

            asset.status = 'Available';
            asset.allocatedTo = null;
            asset.allocatedToName = '';
            asset.history.unshift({
                id: 'h_act_' + Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                action: 'Direct Return Audit',
                user: managerEmail,
                notes: 'Force return processed by inventory manager.'
            });

            localStorage.setItem('assetflow_assets', JSON.stringify(assetList));
            return asset;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
