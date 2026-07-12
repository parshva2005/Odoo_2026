/**
 * AssetService
 * Handles API transactions relating to company physical assets.
 * Utilizes Axios dummy requests and persists mutations in localStorage.
 */

import axios from 'axios';
import { initializeData } from '../data/dummyData';

const API_BASE = 'https://jsonplaceholder.typicode.com';

// Ensure data is pre-populated
initializeData();

export const assetService = {
    /**
     * Fetch list of all assets
     */
    getAll: async () => {
        try {
            await axios.get(`${API_BASE}/posts/1`); // Dummy axios call
            const assetsStr = localStorage.getItem('assetflow_assets');
            return JSON.parse(assetsStr || '[]');
        } catch (error) {
            console.error('API Error in Fetch Assets:', error);
            throw new Error('Failed to fetch assets repository');
        }
    },

    /**
     * Fetch a specific asset by ID
     */
    getById: async (id) => {
        try {
            await axios.get(`${API_BASE}/posts/1`);
            const assets = JSON.parse(localStorage.getItem('assetflow_assets') || '[]');
            const asset = assets.find(a => a.id === id);
            if (!asset) throw new Error('Asset tag not found');
            return asset;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Register a new asset tag
     */
    register: async (assetData) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Asset intake simulation' });
            const assets = JSON.parse(localStorage.getItem('assetflow_assets') || '[]');

            // Check if tag is unique
            const exists = assets.some(a => a.tag.toLowerCase() === assetData.tag.toLowerCase());
            if (exists) throw new Error('Asset Tag ID already registered');

            const newAsset = {
                id: 'a_' + Date.now().toString(),
                name: assetData.name,
                tag: assetData.tag,
                category: assetData.category,
                serial: assetData.serial,
                status: 'Available', // Initially available
                allocatedTo: null,
                allocatedToName: '',
                department: assetData.department || 'IT Infrastructure',
                location: assetData.location || 'Central Storage',
                purchaseDate: assetData.purchaseDate || new Date().toISOString().split('T')[0],
                value: parseFloat(assetData.value) || 0,
                history: [
                    {
                        id: 'h_' + Date.now().toString(),
                        date: new Date().toISOString().split('T')[0],
                        action: 'Registered',
                        user: 'manager@assetflow.com',
                        notes: 'Initial registration'
                    }
                ]
            };

            assets.push(newAsset);
            localStorage.setItem('assetflow_assets', JSON.stringify(assets));
            return newAsset;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Update asset attributes
     */
    update: async (id, updatedFields) => {
        try {
            const assets = JSON.parse(localStorage.getItem('assetflow_assets') || '[]');
            const index = assets.findIndex(a => a.id === id);

            if (index === -1) throw new Error('Asset not found');

            assets[index] = {
                ...assets[index],
                ...updatedFields
            };

            localStorage.setItem('assetflow_assets', JSON.stringify(assets));
            return assets[index];
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
