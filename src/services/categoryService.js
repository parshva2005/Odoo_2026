/**
 * CategoryService
 * Handles CRUD operations relating to Asset Categories.
 */

import axios from 'axios';
import { initializeData } from '../data/dummyData';

const API_BASE = 'https://jsonplaceholder.typicode.com';
initializeData();

export const categoryService = {
    getAll: async () => {
        try {
            await axios.get(`${API_BASE}/posts/1`);
            const list = localStorage.getItem('assetflow_categories');
            return JSON.parse(list || '[]');
        } catch (error) {
            throw new Error('Failed to retrieve categories list');
        }
    },

    add: async (catData) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'New category intake' });
            const list = JSON.parse(localStorage.getItem('assetflow_categories') || '[]');

            // Check uniqueness of code
            const exists = list.some(c => c.code.toLowerCase() === catData.code.toLowerCase());
            if (exists) throw new Error('Category code already registered');

            const newCategory = {
                id: 'cat_' + Date.now().toString(),
                name: catData.name,
                code: catData.code.toUpperCase(),
                description: catData.description || '',
                assetCount: 0
            };

            list.push(newCategory);
            localStorage.setItem('assetflow_categories', JSON.stringify(list));
            return newCategory;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    update: async (id, updatedData) => {
        try {
            const list = JSON.parse(localStorage.getItem('assetflow_categories') || '[]');
            const index = list.findIndex(c => c.id === id);

            if (index === -1) throw new Error('Category not found');

            list[index] = {
                ...list[index],
                name: updatedData.name,
                description: updatedData.description || ''
            };

            localStorage.setItem('assetflow_categories', JSON.stringify(list));
            return list[index];
        } catch (error) {
            throw new Error(error.message);
        }
    },

    delete: async (id) => {
        try {
            const list = JSON.parse(localStorage.getItem('assetflow_categories') || '[]');
            const category = list.find(c => c.id === id);

            if (!category) throw new Error('Category not found');
            if (category.assetCount > 0) {
                throw new Error('Cannot delete category containing registered assets');
            }

            const updatedList = list.filter(c => c.id !== id);
            localStorage.setItem('assetflow_categories', JSON.stringify(updatedList));
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
