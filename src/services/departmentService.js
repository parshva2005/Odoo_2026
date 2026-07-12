/**
 * DepartmentService
 * Handles CRUD operations relating to organizational departments.
 */

import axios from 'axios';
import { initializeData } from '../data/dummyData';

const API_BASE = 'https://jsonplaceholder.typicode.com';
initializeData();

export const departmentService = {
    getAll: async () => {
        try {
            await axios.get(`${API_BASE}/posts/1`);
            const list = localStorage.getItem('assetflow_departments');
            return JSON.parse(list || '[]');
        } catch (error) {
            throw new Error('Failed to retrieve departments list');
        }
    },

    add: async (deptData) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'New department intake' });
            const list = JSON.parse(localStorage.getItem('assetflow_departments') || '[]');

            // Check uniqueness of code
            const exists = list.some(d => d.code.toLowerCase() === deptData.code.toLowerCase());
            if (exists) throw new Error('Department code already registered');

            const newDept = {
                id: 'dept_' + Date.now().toString(),
                name: deptData.name,
                code: deptData.code.toUpperCase(),
                head: deptData.head || 'Not Assigned',
                employeeCount: 0
            };

            list.push(newDept);
            localStorage.setItem('assetflow_departments', JSON.stringify(list));
            return newDept;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    update: async (id, updatedData) => {
        try {
            const list = JSON.parse(localStorage.getItem('assetflow_departments') || '[]');
            const index = list.findIndex(d => d.id === id);

            if (index === -1) throw new Error('Department not found');

            list[index] = {
                ...list[index],
                name: updatedData.name,
                head: updatedData.head || list[index].head
            };

            localStorage.setItem('assetflow_departments', JSON.stringify(list));
            return list[index];
        } catch (error) {
            throw new Error(error.message);
        }
    },

    delete: async (id) => {
        try {
            const list = JSON.parse(localStorage.getItem('assetflow_departments') || '[]');
            const dept = list.find(d => d.id === id);

            if (!dept) throw new Error('Department not found');
            if (dept.employeeCount > 0) {
                throw new Error('Cannot delete department containing active employees');
            }

            const updatedList = list.filter(d => d.id !== id);
            localStorage.setItem('assetflow_departments', JSON.stringify(updatedList));
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
