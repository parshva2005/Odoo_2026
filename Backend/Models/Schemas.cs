using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    // =====================================================================
    // MULTI-TENANCY MARKER
    // =====================================================================
    // Every table except Client itself implements this. The DbContext uses
    // it to auto-apply a global query filter (ClientId == current tenant)
    // and to auto-stamp ClientId on insert — see AssetFlowDbContext.
    public interface ITenantScoped
    {
        Guid ClientId { get; set; }
    }

    // =====================================================================
    // ENUMS
    // =====================================================================

    public enum ActiveStatus { Active, Inactive }
    public enum EmployeeRole { Admin, AssetManager, DepartmentHead, Employee }
    public enum AssetCondition { New, Good, Fair, Poor, Damaged }
    public enum AssetStatus { Available, Allocated, Reserved, UnderMaintenance, Lost, Retired, Disposed }
    public enum AllocationStatus { Active, Returned, Overdue }
    public enum TransferStatus { Requested, Approved, Rejected, Completed }
    public enum BookingStatus { Upcoming, Ongoing, Completed, Cancelled }
    public enum MaintenancePriority { Low, Medium, High, Critical }
    public enum MaintenanceStatus { Pending, Approved, Rejected, TechnicianAssigned, InProgress, Resolved }
    public enum AuditCycleStatus { Open, Closed }
    public enum VerificationStatus { Pending, Verified, Missing, Damaged }
    public enum DiscrepancyType { Missing, Damaged }
    public enum ResolutionStatus { Open, Resolved }

    public enum SubscriptionPlan { Trial, Basic, Pro, Enterprise }
    public enum ClientStatus { Active, Suspended, Cancelled }

    // =====================================================================
    // 0. TENANT (one row per organization / customer using AssetFlow)
    // =====================================================================

    public class Client
    {
        [Key]
        public Guid ClientId { get; set; } = Guid.NewGuid();
        public string CompanyName { get; set; } = null!;
        public string Subdomain { get; set; } = null!;      // e.g. "acme" -> acme.assetflow.app, used to resolve tenant
        public string ContactEmail { get; set; } = null!;
        public SubscriptionPlan Plan { get; set; } = SubscriptionPlan.Trial;
        public ClientStatus Status { get; set; } = ClientStatus.Active;
        public DateTime? TrialEndsAt { get; set; }
        public DateTime? SubscriptionExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // =====================================================================
    // 1. ORGANIZATION SETUP
    // =====================================================================

    public class Department : ITenantScoped
    {
        [Key]
        public int DepartmentId { get; set; }
        public Guid ClientId { get; set; }
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

    public class Employee : ITenantScoped
    {
        [Key]
        public int EmployeeId { get; set; }
        public Guid ClientId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;           // unique per tenant, not globally
        public string PasswordHash { get; set; } = null!;
        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }
        public EmployeeRole Role { get; set; } = EmployeeRole.Employee;
        public ActiveStatus Status { get; set; } = ActiveStatus.Active;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class RoleChangeLog : ITenantScoped
    {
        [Key]
        public int LogId { get; set; }
        public Guid ClientId { get; set; }
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;
        public EmployeeRole? OldRole { get; set; }
        public EmployeeRole NewRole { get; set; }
        public int ChangedBy { get; set; }
        public Employee ChangedByEmployee { get; set; } = null!;
        public DateTime ChangedAt { get; set; }
    }

    public class AssetCategory : ITenantScoped
    {
        [Key]
        public int CategoryId { get; set; }
        public Guid ClientId { get; set; }
        public string Name { get; set; } = null!;             // unique per tenant, not globally
        public string? Description { get; set; }
        public string? CustomFieldsJson { get; set; }
        public ActiveStatus Status { get; set; } = ActiveStatus.Active;
        public DateTime CreatedAt { get; set; }

        public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    }

    // =====================================================================
    // 2. ASSET REGISTRY
    // =====================================================================

    public class Asset : ITenantScoped
    {
        [Key]
        public int AssetId { get; set; }
        public Guid ClientId { get; set; }
        public string AssetTag { get; set; } = null!;         // unique per tenant, not globally
        public string Name { get; set; } = null!;
        public int CategoryId { get; set; }
        public AssetCategory Category { get; set; } = null!;
        public string? SerialNumber { get; set; }
        public string? QrCode { get; set; }
        public DateOnly? AcquisitionDate { get; set; }
        public decimal? AcquisitionCost { get; set; }
        public AssetCondition? Condition { get; set; }
        public string? Location { get; set; }
        public bool IsBookable { get; set; }
        public AssetStatus Status { get; set; } = AssetStatus.Available;
        public int? CurrentHolderEmployeeId { get; set; }
        public Employee? CurrentHolderEmployee { get; set; }
        public int? CurrentHolderDepartmentId { get; set; }
        public Department? CurrentHolderDepartment { get; set; }
        public string? CustomFieldValuesJson { get; set; }
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

    public class AssetDocument : ITenantScoped
    {
        [Key]
        public int DocumentId { get; set; }
        public Guid ClientId { get; set; }
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        public string FileUrl { get; set; } = null!;
        public string? FileType { get; set; }
        public int? UploadedBy { get; set; }
        public Employee? UploadedByEmployee { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class AssetStatusHistory : ITenantScoped
    {
        [Key]
        public int HistoryId { get; set; }
        public Guid ClientId { get; set; }
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

    public class AssetAllocation : ITenantScoped
    {
        [Key]
        public int AllocationId { get; set; }
        public Guid ClientId { get; set; }
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
    }

    public class TransferRequest : ITenantScoped
    {
        [Key]
        public int TransferId { get; set; }
        public Guid ClientId { get; set; }
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

    public class ResourceBooking : ITenantScoped
    {
        [Key]
        public int BookingId { get; set; }
        public Guid ClientId { get; set; }
        public int AssetId { get; set; }
        public Asset Asset { get; set; } = null!;
        public int BookedBy { get; set; }
        public Employee BookedByEmployee { get; set; } = null!;
        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public BookingStatus Status { get; set; } = BookingStatus.Upcoming;
        public DateTime CreatedAt { get; set; }
    }

    // =====================================================================
    // 5. MAINTENANCE WORKFLOW
    // =====================================================================

    public class MaintenanceRequest : ITenantScoped
    {
        [Key]
        public int RequestId { get; set; }
        public Guid ClientId { get; set; }
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

    public class MaintenanceStatusLog : ITenantScoped
    {
        [Key]
        public int LogId { get; set; }
        public Guid ClientId { get; set; }
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

    public class AuditCycle : ITenantScoped
    {
        [Key]
        public int AuditCycleId { get; set; }
        public Guid ClientId { get; set; }
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

    public class AuditCycleAuditor : ITenantScoped
    {
        public Guid ClientId { get; set; }
        public int AuditCycleId { get; set; }
        public AuditCycle AuditCycle { get; set; } = null!;
        public int AuditorId { get; set; }
        public Employee Auditor { get; set; } = null!;
    }

    public class AuditCycleAsset : ITenantScoped
    {
        [Key]
        public int AuditCycleAssetId { get; set; }
        public Guid ClientId { get; set; }
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

    public class DiscrepancyReport : ITenantScoped
    {
        [Key]
        public int DiscrepancyId { get; set; }
        public Guid ClientId { get; set; }
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

    public class Notification : ITenantScoped
    {
        [Key]
        public int NotificationId { get; set; }
        public Guid ClientId { get; set; }
        public int RecipientId { get; set; }
        public Employee Recipient { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string? ReferenceType { get; set; }
        public int? ReferenceId { get; set; }
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ActivityLog : ITenantScoped
    {
        [Key]
        public int LogId { get; set; }
        public Guid ClientId { get; set; }
        public int? ActorId { get; set; }
        public Employee? Actor { get; set; }
        public string Action { get; set; } = null!;
        public string EntityType { get; set; } = null!;
        public int? EntityId { get; set; }
        public string? DetailsJson { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}