// ==============================================================
// MOCK DATA — Replace API calls with real endpoints
// for ASP.NET Core 8 integration
// ==============================================================

// ---- Departments ----
export const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Engineering',      head: 'Aditi Rao',   parentDept: null,       status: 'Active' },
  { id: 2, name: 'Facilities',       head: 'Rohan Mehta', parentDept: null,       status: 'Active' },
  { id: 3, name: 'Field Ops (East)', head: 'Sana Iqbal',  parentDept: 'Field Ops', status: 'Inactive' },
  { id: 4, name: 'HR',               head: 'Priya Shah',  parentDept: null,       status: 'Active' },
  { id: 5, name: 'Procurement',      head: 'Arjun Nair',  parentDept: null,       status: 'Active' },
];

// ---- Asset Categories ----
export const MOCK_CATEGORIES = [
  { id: 1, name: 'Electronics',  description: 'Laptops, projectors, phones',  assetCount: 45, status: 'Active' },
  { id: 2, name: 'Furniture',    description: 'Chairs, desks, tables',        assetCount: 30, status: 'Active' },
  { id: 3, name: 'Vehicles',     description: 'Company cars and bikes',       assetCount: 8,  status: 'Active' },
  { id: 4, name: 'Tools',        description: 'Hand tools, equipment',        assetCount: 22, status: 'Active' },
  { id: 5, name: 'Conference',   description: 'Rooms, AV equipment',          assetCount: 6,  status: 'Active' },
];

// ---- Employees ----
export const MOCK_EMPLOYEES = [
  { id: 1, name: 'Priya Shah',   email: 'priya@company.com',  department: 'Engineering', role: 'Employee', status: 'Active' },
  { id: 2, name: 'Rohan Mehta',  email: 'rohan@company.com',  department: 'Facilities',  role: 'Admin',    status: 'Active' },
  { id: 3, name: 'Sana Iqbal',   email: 'sana@company.com',   department: 'Field Ops',   role: 'Employee', status: 'Active' },
  { id: 4, name: 'Arjun Nair',   email: 'arjun@company.com',  department: 'Procurement', role: 'Employee', status: 'Active' },
  { id: 5, name: 'Aditi Rao',    email: 'aditi@company.com',  department: 'Engineering', role: 'Manager',  status: 'Active' },
  { id: 6, name: 'R Varma',      email: 'rvarma@company.com', department: 'Facilities',  role: 'Technician',status: 'Active' },
];

// ---- Assets ----
export const MOCK_ASSETS = [
  { id: 1, tag: 'AF-0012', name: 'Dell Laptop',      category: 'Electronics', status: 'Allocated',    location: 'Bengaluru',   department: 'Engineering', assignedTo: 'Priya Shah',  purchaseDate: '2023-01-15', value: 85000 },
  { id: 2, tag: 'AF-0062', name: 'Projector',         category: 'Electronics', status: 'Maintenance',  location: 'HQ Floor 2',  department: 'Facilities',  assignedTo: null,          purchaseDate: '2022-06-10', value: 45000 },
  { id: 3, tag: 'AF-0201', name: 'Office Chair',      category: 'Furniture',   status: 'Available',    location: 'Warehouse',   department: null,          assignedTo: null,          purchaseDate: '2023-03-20', value: 8000  },
  { id: 4, tag: 'AF-0114', name: 'Dell Laptop',       category: 'Electronics', status: 'Allocated',    location: 'Bengaluru',   department: 'Engineering', assignedTo: 'Priya Shah',  purchaseDate: '2023-02-10', value: 82000 },
  { id: 5, tag: 'AF-0078', name: 'Forklift',          category: 'Vehicles',    status: 'Allocated',    location: 'Warehouse',   department: 'Facilities',  assignedTo: 'R Varma',     purchaseDate: '2020-11-05', value: 350000 },
  { id: 6, tag: 'AF-0003', name: 'AC Unit',           category: 'Electronics', status: 'Maintenance',  location: 'HQ Floor 1',  department: 'Facilities',  assignedTo: null,          purchaseDate: '2021-04-18', value: 55000 },
  { id: 7, tag: 'AF-0897', name: 'Printer',           category: 'Electronics', status: 'Maintenance',  location: 'HQ Floor 3',  department: 'HR',          assignedTo: null,          purchaseDate: '2022-09-01', value: 25000 },
  { id: 8, tag: 'AF-0873', name: 'Chair',             category: 'Furniture',   status: 'Available',    location: 'HQ Floor 2',  department: null,          assignedTo: null,          purchaseDate: '2023-01-20', value: 7500  },
  { id: 9, tag: 'AF-0455', name: 'MacBook Pro',       category: 'Electronics', status: 'Available',    location: 'IT Store',    department: null,          assignedTo: null,          purchaseDate: '2024-01-15', value: 150000 },
  { id: 10,tag: 'AF-0321', name: 'Conference Table',  category: 'Furniture',   status: 'Available',    location: 'HQ Floor 2',  department: 'Engineering', assignedTo: null,          purchaseDate: '2022-08-12', value: 35000 },
];

// ---- Allocation History ----
export const MOCK_ALLOCATION_HISTORY = [
  { id: 1, assetTag: 'AF-0114', action: 'Allocated',  person: 'Priya Shah',  department: 'Engineering', date: '2024-03-12', condition: 'Good' },
  { id: 2, assetTag: 'AF-0114', action: 'Returned',   person: 'Arjun Nair',  department: 'Procurement', date: '2024-01-09', condition: 'Good' },
  { id: 3, assetTag: 'AF-0114', action: 'Allocated',  person: 'Arjun Nair',  department: 'Procurement', date: '2023-11-15', condition: 'Good' },
];

// ---- Transfer Requests ----
export const MOCK_TRANSFERS = [
  { id: 1, assetTag: 'AF-0114', assetName: 'Dell Laptop', from: 'Priya Shah', to: 'Rohan Mehta', reason: 'New project requirement', status: 'Pending', date: '2024-07-10' },
  { id: 2, assetTag: 'AF-0201', assetName: 'Office Chair', from: 'Warehouse',  to: 'Sana Iqbal',  reason: 'Field ops setup',         status: 'Approved',date: '2024-07-08' },
];

// ---- Resources (Bookable) ----
export const MOCK_RESOURCES = [
  { id: 1, name: 'Conference Room B2', type: 'Room',      capacity: 12, location: 'HQ Floor 2' },
  { id: 2, name: 'Conference Room A1', type: 'Room',      capacity: 6,  location: 'HQ Floor 1' },
  { id: 3, name: 'Projector #1',       type: 'Equipment', capacity: 1,  location: 'HQ Floor 2' },
  { id: 4, name: 'Training Lab',       type: 'Room',      capacity: 25, location: 'HQ Floor 3' },
];

// ---- Bookings ----
export const MOCK_BOOKINGS = [
  { id: 1, resourceId: 1, resourceName: 'Conference Room B2', bookedBy: 'Procurement Team', date: '2024-07-07', startTime: '09:00', endTime: '10:00', status: 'Confirmed' },
  { id: 2, resourceId: 1, resourceName: 'Conference Room B2', bookedBy: 'Engineering Team',  date: '2024-07-07', startTime: '14:00', endTime: '15:00', status: 'Confirmed' },
  { id: 3, resourceId: 2, resourceName: 'Conference Room A1', bookedBy: 'HR Team',           date: '2024-07-08', startTime: '10:00', endTime: '11:00', status: 'Confirmed' },
];

// ---- Maintenance Tickets ----
export const MOCK_MAINTENANCE = {
  Pending: [
    { id: 1, tag: 'AF-0062', name: 'Projector', issue: 'Projector bulb not turning on',  reportedBy: 'Rohan Mehta', date: '2024-07-10', priority: 'High' },
  ],
  Approved: [
    { id: 2, tag: 'AF-003',  name: 'AC Unit',   issue: 'AC unit noisy compressor',        reportedBy: 'Aditi Rao',   date: '2024-07-09', priority: 'Medium' },
  ],
  'Technician Assigned': [
    { id: 3, tag: 'AF-0078', name: 'Forklift',  issue: 'Hydraulic oil leak',              reportedBy: 'Sana Iqbal',  date: '2024-07-08', priority: 'Critical', tech: 'R Varma' },
  ],
  'In Progress': [
    { id: 4, tag: 'AF-897',  name: 'Printer',   issue: 'Printer jam parts ordered',       reportedBy: 'Priya Shah',  date: '2024-07-07', priority: 'Low',  tech: 'R Varma' },
  ],
  Resolved: [
    { id: 5, tag: 'AF-873',  name: 'Chair',     issue: 'Chair repair resolved 7 Jul',     reportedBy: 'Arjun Nair',  date: '2024-07-07', priority: 'Low',  tech: 'R Varma' },
  ],
};

// ---- Audit Logs ----
export const MOCK_AUDIT_LOGS = [
  { id: 1,  action: 'Asset Allocated',      entity: 'AF-0114 Dell Laptop',  user: 'Rohan Mehta',  timestamp: '2024-07-12 09:15', details: 'Allocated to Priya Shah – Engineering' },
  { id: 2,  action: 'Booking Created',      entity: 'Room B2',              user: 'Arjun Nair',   timestamp: '2024-07-12 08:45', details: 'Booked 9:00–10:00 by Procurement Team' },
  { id: 3,  action: 'Maintenance Raised',   entity: 'AF-0062 Projector',    user: 'Aditi Rao',    timestamp: '2024-07-11 17:30', details: 'Bulb not turning on' },
  { id: 4,  action: 'Transfer Approved',    entity: 'AF-0201 Office Chair', user: 'Rohan Mehta',  timestamp: '2024-07-11 14:22', details: 'Transferred from Warehouse to Sana Iqbal' },
  { id: 5,  action: 'Asset Registered',     entity: 'AF-0455 MacBook Pro',  user: 'Rohan Mehta',  timestamp: '2024-07-10 11:00', details: 'New asset registered in IT Store' },
  { id: 6,  action: 'Employee Added',       entity: 'R Varma',              user: 'Rohan Mehta',  timestamp: '2024-07-09 10:15', details: 'Added as Technician in Facilities' },
  { id: 7,  action: 'Department Updated',   entity: 'Field Ops (East)',     user: 'Rohan Mehta',  timestamp: '2024-07-08 16:40', details: 'Status changed to Inactive' },
  { id: 8,  action: 'Maintenance Resolved', entity: 'AF-873 Chair',         user: 'R Varma',      timestamp: '2024-07-07 15:00', details: 'Chair repair completed' },
  { id: 9,  action: 'Booking Cancelled',    entity: 'Training Lab',         user: 'Priya Shah',   timestamp: '2024-07-06 12:10', details: 'Cancelled by requester' },
  { id: 10, action: 'Asset Returned',       entity: 'AF-0114 Dell Laptop',  user: 'Arjun Nair',   timestamp: '2024-07-05 09:00', details: 'Returned in good condition' },
];

// ---- Dashboard Stats ----
export const MOCK_DASHBOARD_STATS = {
  availableAssets:    128,
  allocatedAssets:    76,
  maintenanceAssets:  4,
  activeBookings:     9,
  pendingTransfers:   3,
  upcomingReturns:    12,
  overdueAssets:      3,
};

// ---- Recent Activity ----
export const MOCK_RECENT_ACTIVITY = [
  { id: 1, message: 'Laptop AF-0114 – allocated to Priya Shah – IT dept',  time: '10 min ago', type: 'allocation' },
  { id: 2, message: 'Room B2 – booking confirmed – 2:00 to 3:00 PM',        time: '22 min ago', type: 'booking' },
  { id: 3, message: 'Projector AF-0062 – maintenance resolved',             time: '1 hr ago',   type: 'maintenance' },
  { id: 4, message: 'Office Chair AF-0201 – transfer approved',             time: '2 hrs ago',  type: 'transfer' },
  { id: 5, message: 'MacBook Pro AF-0455 – newly registered',               time: '3 hrs ago',  type: 'asset' },
];

// ---- Notifications ----
export const MOCK_NOTIFICATIONS = [
  { id: 1, title: '3 assets overdue for return',    message: 'AF-0114, AF-0078, AF-0062 are flagged for follow-up', type: 'danger',  read: false, time: '5 min ago' },
  { id: 2, title: 'Transfer request approved',      message: 'Office Chair AF-0201 transferred to Sana Iqbal',     type: 'success', read: false, time: '1 hr ago' },
  { id: 3, title: 'Maintenance ticket assigned',    message: 'Forklift AF-0078 assigned to R Varma',               type: 'info',    read: false, time: '2 hrs ago' },
  { id: 4, title: 'Booking conflict detected',      message: 'Room B2 has a conflict at 9:30–10:30',               type: 'warning', read: true,  time: '3 hrs ago' },
  { id: 5, title: 'New asset registered',           message: 'MacBook Pro AF-0455 added to inventory',             type: 'info',    read: true,  time: '5 hrs ago' },
  { id: 6, title: 'Department updated',             message: 'Field Ops (East) marked Inactive',                   type: 'warning', read: true,  time: '1 day ago' },
];

// ---- Asset Usage Chart Data ----
export const MOCK_ASSET_USAGE = [
  { month: 'Feb', allocated: 65, available: 35, maintenance: 5 },
  { month: 'Mar', allocated: 70, available: 28, maintenance: 8 },
  { month: 'Apr', allocated: 68, available: 30, maintenance: 6 },
  { month: 'May', allocated: 75, available: 20, maintenance: 9 },
  { month: 'Jun', allocated: 72, available: 22, maintenance: 10 },
  { month: 'Jul', allocated: 76, available: 18, maintenance: 4  },
];

// ---- Maintenance Status Chart ----
export const MOCK_MAINTENANCE_CHART = [
  { name: 'Resolved',   value: 24, color: '#10b981' },
  { name: 'In Progress',value: 8,  color: '#3b82f6' },
  { name: 'Pending',    value: 5,  color: '#f59e0b' },
  { name: 'Approved',   value: 3,  color: '#8b5cf6' },
];
