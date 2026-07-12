/**
 * NotificationService
 * Fetches recent alerts, alarms, and tracks read status toggling.
 */

import axios from 'axios';
import { initializeData } from '../data/dummyData';

const API_BASE = 'https://jsonplaceholder.typicode.com';
initializeData();

export const notificationService = {
    getAll: async () => {
        try {
            await axios.get(`${API_BASE}/posts/1`);
            const notes = localStorage.getItem('assetflow_notifications');
            return JSON.parse(notes || '[]');
        } catch (error) {
            throw new Error('Failed to fetch notifications');
        }
    },

    markAsRead: async (id) => {
        try {
            const list = JSON.parse(localStorage.getItem('assetflow_notifications') || '[]');
            const index = list.findIndex(n => n.id === id);

            if (index !== -1) {
                list[index].read = true;
                localStorage.setItem('assetflow_notifications', JSON.stringify(list));
            }
            return list;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
