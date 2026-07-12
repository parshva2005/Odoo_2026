/**
 * EmployeeService
 * Handles CRUD operations relating to the employee directory database.
 */

import axios from 'axios';
import { initializeData } from '../data/dummyData';

const API_BASE = 'https://jsonplaceholder.typicode.com';
initializeData();

export const employeeService = {
    getAll: async () => {
        try {
            await axios.get(`${API_BASE}/posts/1`);
            const list = localStorage.getItem('assetflow_employees');
            return JSON.parse(list || '[]');
        } catch (error) {
            throw new Error('Failed to retrieve employee listing');
        }
    },

    add: async (empData) => {
        try {
            await axios.post(`${API_BASE}/posts`, { title: 'New employee intake' });

            // Check in localStorage if employee exists
            const list = JSON.parse(localStorage.getItem('assetflow_employees') || '[]');
            const exists = list.some(e => e.email.toLowerCase() === empData.email.toLowerCase());
            if (exists) throw new Error('An employee with this email is already registered');

            const newEmp = {
                id: 'emp_' + Date.now().toString(),
                name: empData.name,
                email: empData.email,
                role: empData.role || 'employee',
                department: empData.department,
                status: 'Active'
            };

            list.push(newEmp);
            localStorage.setItem('assetflow_employees', JSON.stringify(list));

            // Also increment employeeCount for the chosen department
            const depts = JSON.parse(localStorage.getItem('assetflow_departments') || '[]');
            const dIndex = depts.findIndex(d => d.name === empData.department);
            if (dIndex !== -1) {
                depts[dIndex].employeeCount = (depts[dIndex].employeeCount || 0) + 1;
                localStorage.setItem('assetflow_departments', JSON.stringify(depts));
            }

            // Also register in raw auth user list if they want to login later
            const authUsers = JSON.parse(localStorage.getItem('assetflow_users') || '[]');
            const authExists = authUsers.some(u => u.email.toLowerCase() === empData.email.toLowerCase());
            if (!authExists) {
                authUsers.push({
                    id: newEmp.id,
                    name: newEmp.name,
                    email: newEmp.email,
                    password: 'password123', // Default credentials
                    role: newEmp.role,
                    department: newEmp.department
                });
                localStorage.setItem('assetflow_users', JSON.stringify(authUsers));
            }

            return newEmp;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    update: async (id, updatedData) => {
        try {
            const list = JSON.parse(localStorage.getItem('assetflow_employees') || '[]');
            const index = list.findIndex(e => e.id === id);

            if (index === -1) throw new Error('Employee not found');

            const oldDept = list[index].department;
            const newDept = updatedData.department;

            list[index] = {
                ...list[index],
                name: updatedData.name,
                role: updatedData.role || list[index].role,
                department: newDept,
                status: updatedData.status || list[index].status
            };

            localStorage.setItem('assetflow_employees', JSON.stringify(list));

            // If the department changed, adjust counts
            if (oldDept !== newDept) {
                const depts = JSON.parse(localStorage.getItem('assetflow_departments') || '[]');
                const oldIndex = depts.findIndex(d => d.name === oldDept);
                if (oldIndex !== -1 && depts[oldIndex].employeeCount > 0) {
                    depts[oldIndex].employeeCount -= 1;
                }
                const newIndex = depts.findIndex(d => d.name === newDept);
                if (newIndex !== -1) {
                    depts[newIndex].employeeCount = (depts[newIndex].employeeCount || 0) + 1;
                }
                localStorage.setItem('assetflow_departments', JSON.stringify(depts));
            }

            // Update auth credential details too
            const authUsers = JSON.parse(localStorage.getItem('assetflow_users') || '[]');
            const authIndex = authUsers.findIndex(u => u.email.toLowerCase() === list[index].email.toLowerCase());
            if (authIndex !== -1) {
                authUsers[authIndex].name = list[index].name;
                authUsers[authIndex].role = list[index].role;
                authUsers[authIndex].department = list[index].department;
                localStorage.setItem('assetflow_users', JSON.stringify(authUsers));
            }

            return list[index];
        } catch (error) {
            throw new Error(error.message);
        }
    },

    delete: async (id) => {
        try {
            const list = JSON.parse(localStorage.getItem('assetflow_employees') || '[]');
            const emp = list.find(e => e.id === id);

            if (!emp) throw new Error('Employee not found');

            const updatedList = list.filter(e => e.id !== id);
            localStorage.setItem('assetflow_employees', JSON.stringify(updatedList));

            // Decrement department count
            const depts = JSON.parse(localStorage.getItem('assetflow_departments') || '[]');
            const dIndex = depts.findIndex(d => d.name === emp.department);
            if (dIndex !== -1 && depts[dIndex].employeeCount > 0) {
                depts[dIndex].employeeCount -= 1;
                localStorage.setItem('assetflow_departments', JSON.stringify(depts));
            }

            // Remove from login credentials too
            const authUsers = JSON.parse(localStorage.getItem('assetflow_users') || '[]');
            const updatedAuth = authUsers.filter(u => u.email.toLowerCase() !== emp.email.toLowerCase());
            localStorage.setItem('assetflow_users', JSON.stringify(updatedAuth));

            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
