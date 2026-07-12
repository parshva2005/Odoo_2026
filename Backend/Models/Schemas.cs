using System;
using System.Collections.Generic;

namespace Backend.Models
{
    // =====================================================================
    // ENUMS — mirror the CHECK constraints from the SQL schema
    // =====================================================================

    public enum ActiveStatus { Active, Inactive }

    public enum EmployeeRole { Admin, AssetManager, DepartmentHead, Employee }

    public enum AssetCondition { New, Good, Fair, Poor, Damaged }

    public enum AssetStatus
    {
        Available, Allocated, Reserved, UnderMaintenance, Lost, Retired, Disposed
    }

    public enum AllocationStatus { Active, Returned, Overdue }

    public enum TransferStatus { Requested, Approved, Rejected, Completed }

    public enum BookingStatus { Upcoming, Ongoing, Completed, Cancelled }

    public enum MaintenancePriority { Low, Medium, High, Critical }

    public enum MaintenanceStatus
    {
        Pending, Approved, Rejected, TechnicianAssigned, InProgress, Resolved
    }

    public enum AuditCycleStatus { Open, Closed }

    public enum VerificationStatus { Pending, Verified, Missing, Damaged }

    public enum DiscrepancyType { Missing, Damaged }

    public enum ResolutionStatus { Open, Resolved }

    // =====================================================================
    // 1. ORGANIZATION SETUP
    // =====================================================================

    public class Department
    {
        public int DepartmentId { get; set; }
        public string Name { get; set; } = null!;
        public int? ParentDepartmentId { get; set; }
        public Department? ParentDepartment { get; set; }
        public int? DepartmentHeadId { get; set; }
        public Employee? DepartmentHead { get; set; }
        public ActiveStatus Status { get; set; } = ActiveStatus.Active;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ICollection<Department> ChildDepartments { get; set; } = new List<Department>();
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }

    public class Employee
    {
        public int EmployeeId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }
        public EmployeeRole Role { get; set; } = EmployeeRole.Employee;
        public ActiveStatus Status { get; set; } = ActiveStatus.Active;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // Every role change (Admin action only) is logged — signup never writes here
    public class RoleChangeLog
    {
        public int LogId { get; set; }
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;
        public EmployeeRole? OldRole { get; set; }
        public EmployeeRole NewRole { get; set; }
        public int ChangedBy { get; set; }
        public Employee ChangedByEmployee { get; set; } = null!;
        public DateTime ChangedAt { get; set; }
    }

    public class AssetCategory
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? CustomFieldsJson { get; set; } // JSONB: field DEFINITIONS, e.g. warranty period
        public ActiveStatus Status { get; set; } = ActiveStatus.Active;
        public DateTime CreatedAt { get; set; }

        public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    }

    // =====================================================================
    // 2. ASSET REGISTRY
    // =====================================================================

    public class Asset
    {
        public int AssetId { get; set; }
        public string AssetTag { get; set; } = null!;      // AF-0001, generated on insert
        public string Name { get; set; } = null!;
        public int CategoryId { get; set; }
        public AssetCategory Category { get; set; } = null!;
        public string? SerialNumber { get; set; }
        public string? QrCode { get; set; }
        public DateOnly? AcquisitionDate { get; set; }
        public decimal? AcquisitionCost { get; set; }        // reporting only, not linked to accounting
        public AssetCondition? Condition { get; set; }
        public string? Location { get; set; }
        public bool IsBookable { get; set; }
        public AssetStatus Status { get; set; } = AssetStatus.Available;
        public int? CurrentHolderEmployeeId { get; set; }
        public Employee? CurrentHolderEmployee { get; set; }
        public int? CurrentHolderDepartmentId { get; set; }
        public Department? CurrentHolderDepartment { get; set; }
        public string? CustomFieldValuesJson { get; set; }   // JSONB: values matching category fields
        public int? CreatedBy { get; set; }
        public Employee? CreatedByEmployee { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ICollection<AssetDocument> Documents { get; set; } = new List<AssetDocument>();
        public ICollection<AssetStatusHistory> StatusHistory { get; set; } = new List<AssetStatusHistory>();
        public ICollection<AssetAllocation> Allocations { get; set; } = new List<AssetAllocation>();
        public ICollection<TransferRequest> TransferRequests { get; set; } = new List<TransferRequest>();
        public ICollection<ResourceBooking> Bookings { get; set; } = new List<ResourceBooking>();
        public ICollection<MaintenanceRequest> MaintenanceRequests { get; set; } = new List<MaintenanceRequest>();
    }

    public class AssetDocument
    {
        public int DocumentId { get; set; }
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        public string FileUrl { get; set; } = null!;
        public string? FileType { get; set; }               // photo / warranty_doc / invoice_ref
        public int? UploadedBy { get; set; }
        public Employee? UploadedByEmployee { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    // Full lifecycle trail: Available <-> UnderMaintenance, Allocated -> Available, etc.
    public class AssetStatusHistory
    {
        public int HistoryId { get; set; }
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        public AssetStatus? FromStatus { get; set; }
        public AssetStatus ToStatus { get; set; }
        public int? ChangedBy { get; set; }
        public Employee? ChangedByEmployee { get; set; }
        public string? Reason { get; set; }
        public DateTime ChangedAt { get; set; }
    }

    // =====================================================================
    // 3. ALLOCATION & TRANSFER
    // =====================================================================

    public class AssetAllocation
    {
        public int AllocationId { get; set; }
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        public int? EmployeeId { get; set; }
        public Employee? Employee { get; set; }
        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }
        public int AllocatedBy { get; set; }
        public Employee AllocatedByEmployee { get; set; } = null!;
        public DateTime AllocatedAt { get; set; }
        public DateOnly? ExpectedReturnDate { get; set; }
        public DateOnly? ActualReturnDate { get; set; }
        public string? ReturnConditionNotes { get; set; }
        public AllocationStatus Status { get; set; } = AllocationStatus.Active;
        // Business rule enforced in DB too: only one Active allocation per asset
        // (see uq_one_active_allocation_per_asset filtered unique index in DbContext)
    }

    // Requested -> Approved (Asset Manager / Dept Head) -> Completed (history updated)
    public class TransferRequest
    {
        public int TransferId { get; set; }
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        public int? FromEmployeeId { get; set; }
        public Employee? FromEmployee { get; set; }
        public int ToEmployeeId { get; set; }
        public Employee ToEmployee { get; set; } = null!;
        public int RequestedBy { get; set; }
        public Employee RequestedByEmployee { get; set; } = null!;
        public DateTime RequestedAt { get; set; }
        public TransferStatus Status { get; set; } = TransferStatus.Requested;
        public int? ApprovedBy { get; set; }
        public Employee? ApprovedByEmployee { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? Notes { get; set; }
    }

    // =====================================================================
    // 4. RESOURCE BOOKING
    // =====================================================================

    public class ResourceBooking
    {
        public int BookingId { get; set; }
        public int AssetId { get; set; }         // must have Asset.IsBookable == true
        public Asset Asset { get; set; } = null!;
        public int BookedBy { get; set; }
        public Employee BookedByEmployee { get; set; } = null!;
        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public BookingStatus Status { get; set; } = BookingStatus.Upcoming;
        public DateTime CreatedAt { get; set; }
        // Overlap rule enforced in DB via a Postgres EXCLUDE constraint (raw SQL migration,
        // see AssetFlowDbContext comments) — EF Core has no fluent API for this.
    }

    // =====================================================================
    // 5. MAINTENANCE WORKFLOW
    // =====================================================================

    public class MaintenanceRequest
    {
        public int RequestId { get; set; }
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        public int RaisedBy { get; set; }
        public Employee RaisedByEmployee { get; set; } = null!;
        public string IssueDescription { get; set; } = null!;
        public MaintenancePriority Priority { get; set; } = MaintenancePriority.Medium;
        public string? PhotoUrl { get; set; }
        public MaintenanceStatus Status { get; set; } = MaintenanceStatus.Pending;
        public int? ApprovedBy { get; set; }
        public Employee? ApprovedByEmployee { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? TechnicianName { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<MaintenanceStatusLog> StatusLogs { get; set; } = new List<MaintenanceStatusLog>();
    }

    public class MaintenanceStatusLog
    {
        public int LogId { get; set; }
        public int RequestId { get; set; }
        public MaintenanceRequest Request { get; set; } = null!;
        public MaintenanceStatus? FromStatus { get; set; }
        public MaintenanceStatus ToStatus { get; set; }
        public int? ChangedBy { get; set; }
        public Employee? ChangedByEmployee { get; set; }
        public DateTime ChangedAt { get; set; }
    }

    // =====================================================================
    // 6. AUDIT CYCLES
    // =====================================================================

    public class AuditCycle
    {
        public int AuditCycleId { get; set; }
        public string Name { get; set; } = null!;
        public int? ScopeDepartmentId { get; set; }
        public Department? ScopeDepartment { get; set; }
        public string? ScopeLocation { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public AuditCycleStatus Status { get; set; } = AuditCycleStatus.Open;
        public int CreatedBy { get; set; }
        public Employee CreatedByEmployee { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public int? ClosedBy { get; set; }
        public Employee? ClosedByEmployee { get; set; }
        public DateTime? ClosedAt { get; set; }

        public ICollection<AuditCycleAuditor> Auditors { get; set; } = new List<AuditCycleAuditor>();
        public ICollection<AuditCycleAsset> ScopedAssets { get; set; } = new List<AuditCycleAsset>();
        public ICollection<DiscrepancyReport> DiscrepancyReports { get; set; } = new List<DiscrepancyReport>();
    }

    // Many-to-many: auditors assigned to a cycle (composite PK)
    public class AuditCycleAuditor
    {
        public int AuditCycleId { get; set; }
        public AuditCycle AuditCycle { get; set; } = null!;
        public int AuditorId { get; set; }
        public Employee Auditor { get; set; } = null!;
    }

    // Every asset in scope, and its verification result
    public class AuditCycleAsset
    {
        public int AuditCycleAssetId { get; set; }
        public int AuditCycleId { get; set; }
        public AuditCycle AuditCycle { get; set; } = null!;
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;
        public int? VerifiedBy { get; set; }
        public Employee? VerifiedByEmployee { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? Notes { get; set; }
    }

    // Auto-generated whenever an AuditCycleAsset is marked Missing/Damaged
    public class DiscrepancyReport
    {
        public int DiscrepancyId { get; set; }
        public int AuditCycleId { get; set; }
        public AuditCycle AuditCycle { get; set; } = null!;
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        public DiscrepancyType DiscrepancyType { get; set; }
        public ResolutionStatus ResolutionStatus { get; set; } = ResolutionStatus.Open;
        public int? ResolvedBy { get; set; }
        public Employee? ResolvedByEmployee { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // =====================================================================
    // 7. NOTIFICATIONS & ACTIVITY LOGS
    // =====================================================================

    public class Notification
    {
        public int NotificationId { get; set; }
        public int RecipientId { get; set; }
        public Employee Recipient { get; set; } = null!;
        public string Type { get; set; } = null!;         // AssetAssigned, MaintenanceApproved, ...
        public string? ReferenceType { get; set; }         // e.g. "asset_allocations"
        public int? ReferenceId { get; set; }
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ActivityLog
    {
        public int LogId { get; set; }
        public int? ActorId { get; set; }
        public Employee? Actor { get; set; }
        public string Action { get; set; } = null!;        // e.g. "ALLOCATE_ASSET"
        public string EntityType { get; set; } = null!;
        public int? EntityId { get; set; }
        public string? DetailsJson { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}