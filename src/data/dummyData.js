/**
 * dummyData.js
 * Definitions and initialization of realistic mock datasets.
 * Pre-populates localStorage for shared state across services.
 */

// Initial Departments
export const INITIAL_DEPARTMENTS = [
    { id: 'd1', name: 'Software Engineering', code: 'SWE', head: 'Sarah Head', employeeCount: 15 },
    { id: 'd2', name: 'IT Infrastructure', code: 'ITI', head: 'System Admin', employeeCount: 5 },
    { id: 'd3', name: 'Operations', code: 'OPS', head: 'John AssetMgr', employeeCount: 12 },
    { id: 'd4', name: 'Finance', code: 'FIN', head: 'Robert Fin', employeeCount: 4 },
    { id: 'd5', name: 'Human Resources', code: 'HR', head: 'Emma HR', employeeCount: 3 }
];

// Initial Employees
export const INITIAL_EMPLOYEES = [
    { id: 'e1', name: 'System Admin', email: 'admin@assetflow.com', role: 'admin', department: 'IT Infrastructure', status: 'Active' },
    { id: 'e2', name: 'John AssetMgr', email: 'manager@assetflow.com', role: 'asset_manager', department: 'Operations', status: 'Active' },
    { id: 'e3', name: 'Sarah Head', email: 'head@assetflow.com', role: 'department_head', department: 'Software Engineering', status: 'Active' },
    { id: 'e4', name: 'David Employee', email: 'employee@assetflow.com', role: 'employee', department: 'Software Engineering', status: 'Active' },
    { id: 'e5', name: 'Michael Tech', email: 'tech@assetflow.com', role: 'employee', department: 'IT Infrastructure', status: 'Active' },
    { id: 'e6', name: 'Anna Analyst', email: 'anna@assetflow.com', role: 'employee', department: 'Finance', status: 'Active' }
];

// Initial Corporate Assets
export const INITIAL_ASSETS = [
    {
        id: 'a1',
        name: 'MacBook Pro 16" M3',
        tag: 'AST-2026-001',
        category: 'Laptops',
        serial: 'C02F8XYZQ05D',
        status: 'Allocated',
        allocatedTo: 'e4', // David Employee
        allocatedToName: 'David Employee',
        department: 'Software Engineering',
        location: 'HQR-3F-Desk 4',
        purchaseDate: '2026-01-15',
        value: 2499,
        history: [
            { id: 'h1_1', date: '2026-01-15', action: 'Purchase & Register', user: 'admin@assetflow.com', notes: 'Initial intake' },
            { id: 'h1_2', date: '2026-01-16', action: 'Allocation Approved', user: 'manager@assetflow.com', notes: 'Assigned to David Employee (Software Engineering)' }
        ]
    },
    {
        id: 'a2',
        name: 'Dell UltraSharp 34" Monitor',
        tag: 'AST-2026-002',
        category: 'Displays',
        serial: 'D3421WE-9876',
        status: 'Available',
        allocatedTo: null,
        allocatedToName: '',
        department: 'IT Infrastructure',
        location: 'Storage Cage B',
        purchaseDate: '2026-02-10',
        value: 899,
        history: [
            { id: 'h2_1', date: '2026-02-10', action: 'Purchase & Register', user: 'admin@assetflow.com', notes: 'Added to inventory' }
        ]
    },
    {
        id: 'a3',
        name: 'iPhone 15 Pro Max',
        tag: 'AST-2026-003',
        category: 'Mobile Devices',
        serial: 'SN-IPH15-9922',
        status: 'Available',
        allocatedTo: null,
        allocatedToName: '',
        department: 'Operations',
        location: 'Storage Cage B',
        purchaseDate: '2026-03-01',
        value: 1199,
        history: [
            { id: 'h3_1', date: '2026-03-01', action: 'Purchase & Register', user: 'admin@assetflow.com', notes: 'QA Testing Pool device' }
        ]
    },
    {
        id: 'a4',
        name: 'iPad Pro 12.9" with Pencil',
        tag: 'AST-2026-004',
        category: 'Mobile Devices',
        serial: 'GHP881267D2',
        status: 'Under Maintenance',
        allocatedTo: null,
        allocatedToName: '',
        department: 'Software Engineering',
        location: 'IT Lab A',
        purchaseDate: '2026-03-05',
        value: 1099,
        history: [
            { id: 'h4_1', date: '2026-03-05', action: 'Purchase & Register', user: 'admin@assetflow.com', notes: 'Designer toolkit' },
            { id: 'h4_2', date: '2026-07-01', action: 'Sent to Maintenance', user: 'manager@assetflow.com', notes: 'Battery draining fast' }
        ]
    },
    {
        id: 'a5',
        name: 'ThinkPad T14 Gen 4',
        tag: 'AST-2026-005',
        category: 'Laptops',
        serial: 'PF-3B3Y9X',
        status: 'Allocated',
        allocatedTo: 'e3', // Sarah Head
        allocatedToName: 'Sarah Head',
        department: 'Software Engineering',
        location: 'Remote Work',
        purchaseDate: '2026-02-20',
        value: 1450,
        history: [
            { id: 'h5_1', date: '2026-02-20', action: 'Purchase & Register', user: 'admin@assetflow.com', notes: 'Manager standard configuration' }
        ]
    },
    {
        id: 'a6',
        name: 'Conference Room E Audio System',
        tag: 'AST-2026-006',
        category: 'AV Equipment',
        serial: 'YA-AV-99120',
        status: 'Reserved',
        allocatedTo: null,
        allocatedToName: '',
        department: 'Operations',
        location: 'Conf Room E (Ground Flr)',
        purchaseDate: '2026-01-20',
        value: 3200,
        history: [
            { id: 'h6_1', date: '2026-01-20', action: 'Purchase & Register', user: 'admin@assetflow.com', notes: 'Fixed AV utility' }
        ]
    }
];

// Initial Bookings
export const INITIAL_BOOKINGS = [
    {
        id: 'b1',
        resourceId: 'res_1',
        resourceName: 'Main Conference Room A',
        date: '2026-07-15',
        startTime: '09:00',
        endTime: '12:00',
        purpose: 'Q3 Board Presentation Setup',
        requestedBy: 'head@assetflow.com',
        requestedByName: 'Sarah Head',
        status: 'Approved'
    },
    {
        id: 'b2',
        resourceId: 'res_2',
        resourceName: 'Hardware Testing Lab Suite',
        date: '2026-07-20',
        startTime: '10:00',
        endTime: '17:00',
        purpose: 'Mobile App Testing Sprint',
        requestedBy: 'employee@assetflow.com',
        requestedByName: 'David Employee',
        status: 'Pending'
    }
];

// Initial Maintenance Requests
export const INITIAL_MAINTENANCE = [
    {
        id: 'm1',
        assetId: 'a4',
        assetName: 'iPad Pro 12.9" with Pencil',
        assetTag: 'AST-2026-004',
        raisedBy: 'Sarah Head',
        description: 'Battery drains from 100% to 0% in less than 2 hours. Requires battery replacement diagnosis.',
        priority: 'Medium',
        status: 'In Progress',
        assignedTechnician: 'Michael Tech',
        scheduledDate: '2026-07-12',
        notes: 'Waiting for replacement power kit from local supplier.',
        createdAt: '2026-07-10'
    }
];

// Initial Notifications
export const INITIAL_NOTIFICATIONS = [
    {
        id: 'n1',
        title: 'New Maintenance Logged',
        message: 'iPad Pro 12.9" has been sent to technical team for diagnostics.',
        type: 'info',
        date: '2026-07-10 14:30',
        read: false
    },
    {
        id: 'n2',
        title: 'Pending Asset Allocation Request',
        message: 'David Employee has requested allocation approval for a MacBook Pro M3.',
        type: 'warning',
        date: '2026-07-12 08:15',
        read: false
    },
    {
        id: 'n3',
        title: 'System Database Audit Triggered',
        message: 'Annual corporate resource verification audit is scheduled for next Mon.',
        type: 'success',
        date: '2026-07-11 18:00',
        read: true
    }
];

// Initial Activity Logs
export const INITIAL_ACTIVITY_LOGS = [
    { id: 'al1', action: 'User Login', user: 'admin@assetflow.com', details: 'Successful session login', date: '2026-07-12 09:05' },
    { id: 'al2', action: 'Asset Registered', user: 'admin@assetflow.com', details: 'Registered iPhone 15 Pro Max (AST-2026-003)', date: '2026-07-12 08:30' },
    { id: 'al3', action: 'Booking Request Raised', user: 'head@assetflow.com', details: 'Booked AV Audio system for Q3 Presentation', date: '2026-07-11 11:20' }
];

// Initial Asset Categories
export const INITIAL_CATEGORIES = [
    { id: 'c1', name: 'Laptops', code: 'LPT', description: 'Development and general office laptops', assetCount: 2 },
    { id: 'c2', name: 'Displays', code: 'DSP', description: 'Desktop monitors and conference screens', assetCount: 1 },
    { id: 'c3', name: 'Mobile Devices', code: 'MOB', description: 'Corporate smartphones and tablets', assetCount: 2 },
    { id: 'c4', name: 'AV Equipment', code: 'AVQ', description: 'Audio-visual and video conferencing gear', assetCount: 1 }
];

/**
 * Initializes localStorage items if they do not exist.
 */
export const initializeData = () => {
    if (!localStorage.getItem('assetflow_departments')) {
        localStorage.setItem('assetflow_departments', JSON.stringify(INITIAL_DEPARTMENTS));
    }
    if (!localStorage.getItem('assetflow_employees')) {
        localStorage.setItem('assetflow_employees', JSON.stringify(INITIAL_EMPLOYEES));
    }
    if (!localStorage.getItem('assetflow_assets')) {
        localStorage.setItem('assetflow_assets', JSON.stringify(INITIAL_ASSETS));
    }
    if (!localStorage.getItem('assetflow_bookings')) {
        localStorage.setItem('assetflow_bookings', JSON.stringify(INITIAL_BOOKINGS));
    }
    if (!localStorage.getItem('assetflow_maintenance')) {
        localStorage.setItem('assetflow_maintenance', JSON.stringify(INITIAL_MAINTENANCE));
    }
    if (!localStorage.getItem('assetflow_notifications')) {
        localStorage.setItem('assetflow_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem('assetflow_activity_logs')) {
        localStorage.setItem('assetflow_activity_logs', JSON.stringify(INITIAL_ACTIVITY_LOGS));
    }
    if (!localStorage.getItem('assetflow_categories')) {
        localStorage.setItem('assetflow_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
};

// Auto-run initialization
initializeData();
