/**
 * BookingService
 * Manages resource reservations, calendar listings, and enforces
 * business rules preventing double bookings for overlapping slots.
 */

import axios from 'axios';
import { initializeData } from '../data/dummyData';

const API_BASE = 'https://jsonplaceholder.typicode.com';
initializeData();

export const bookingService = {
    /**
     * Retrieve all bookings
     */
    getAll: async () => {
        try {
            await axios.get(`${API_BASE}/posts/1`);
            const bookings = localStorage.getItem('assetflow_bookings');
            return JSON.parse(bookings || '[]');
        } catch (error) {
            throw new Error('Failed to retrieve reservations database');
        }
    },

    /**
     * Check if a resource has schedule conflicts on date and time range
     * Returns true if there is a collision, false otherwise
     */
    checkCollision: (resourceId, date, startTime, endTime) => {
        const bookings = JSON.parse(localStorage.getItem('assetflow_bookings') || '[]');

        // Convert input times to absolute numeric minutes for easy linear comparison
        const parseTimeToMinutes = (timeStr) => {
            if (!timeStr) return 0;
            const [hours, minutes] = timeStr.split(':').map(Number);
            return (hours * 60) + minutes;
        };

        const targetStart = parseTimeToMinutes(startTime);
        const targetEnd = parseTimeToMinutes(endTime);

        if (targetStart >= targetEnd) {
            throw new Error('Start time must precede end time');
        }

        // Find conflicts
        const conflict = bookings.find(b => {
            // Only compare approved or pending bookings for the same resource on the same date
            if (b.resourceId === resourceId && b.date === date && b.status !== 'Rejected' && b.status !== 'Cancelled') {
                const existingStart = parseTimeToMinutes(b.startTime);
                const existingEnd = parseTimeToMinutes(b.endTime);

                // Overlap condition: (StartA < EndB) && (EndA > StartB)
                if (targetStart < existingEnd && targetEnd > existingStart) {
                    return true;
                }
            }
            return false;
        });

        return conflict;
    },

    /**
     * Create a new reservation request after collision checking
     */
    create: async (bookingData) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'Create Room Booking' });

            // Enforce double booking business rules
            const conflict = bookingService.checkCollision(
                bookingData.resourceId,
                bookingData.date,
                bookingData.startTime,
                bookingData.endTime
            );

            if (conflict) {
                throw new Error(
                    `Scheduling Conflict: This resource is already reserved by ${conflict.requestedByName} from ${conflict.startTime} to ${conflict.endTime} for ${conflict.purpose}. Please choose another slot.`
                );
            }

            const bookings = JSON.parse(localStorage.getItem('assetflow_bookings') || '[]');

            const newBooking = {
                id: 'b_' + Date.now().toString(),
                resourceId: bookingData.resourceId,
                resourceName: bookingData.resourceName,
                date: bookingData.date,
                startTime: bookingData.startTime,
                endTime: bookingData.endTime,
                purpose: bookingData.purpose,
                requestedBy: bookingData.requestedBy,
                requestedByName: bookingData.requestedByName,
                status: 'Approved' // Self-approved for testing labs to simulate immediate locking
            };

            bookings.push(newBooking);
            localStorage.setItem('assetflow_bookings', JSON.stringify(bookings));
            return newBooking;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * Cancel an active booking
     */
    cancel: async (id) => {
        try {
            const list = JSON.parse(localStorage.getItem('assetflow_bookings') || '[]');
            const index = list.findIndex(b => b.id === id);

            if (index !== -1) {
                list[index].status = 'Cancelled';
                localStorage.setItem('assetflow_bookings', JSON.stringify(list));
            }
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
