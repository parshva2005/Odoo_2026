using System.Text.RegularExpressions;
using AssetFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AssetFlowDbContext : DbContext
    {
        public AssetFlowDbContext(DbContextOptions<AssetFlowDbContext> options) : base(options) { }

        public DbSet<Department> Departments => Set<Department>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<RoleChangeLog> RoleChangeLogs => Set<RoleChangeLog>();
        public DbSet<AssetCategory> AssetCategories => Set<AssetCategory>();
        public DbSet<Asset> Assets => Set<Asset>();
        public DbSet<AssetDocument> AssetDocuments => Set<AssetDocument>();
        public DbSet<AssetStatusHistory> AssetStatusHistories => Set<AssetStatusHistory>();
        public DbSet<AssetAllocation> AssetAllocations => Set<AssetAllocation>();
        public DbSet<TransferRequest> TransferRequests => Set<TransferRequest>();
        public DbSet<ResourceBooking> ResourceBookings => Set<ResourceBooking>();
        public DbSet<MaintenanceRequest> MaintenanceRequests => Set<MaintenanceRequest>();
        public DbSet<MaintenanceStatusLog> MaintenanceStatusLogs => Set<MaintenanceStatusLog>();
        public DbSet<AuditCycle> AuditCycles => Set<AuditCycle>();
        public DbSet<AuditCycleAuditor> AuditCycleAuditors => Set<AuditCycleAuditor>();
        public DbSet<AuditCycleAsset> AuditCycleAssets => Set<AuditCycleAsset>();
        public DbSet<DiscrepancyReport> DiscrepancyReports => Set<DiscrepancyReport>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // -----------------------------------------------------------
            // Relationships that need explicit config (multiple FKs to the
            // same table, restrict-delete to avoid cascade cycles, etc.)
            // -----------------------------------------------------------

            modelBuilder.Entity<Department>(e =>
            {
                e.HasOne(d => d.ParentDepartment)
                    .WithMany(d => d.ChildDepartments)
                    .HasForeignKey(d => d.ParentDepartmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                e.HasOne(d => d.DepartmentHead)
                    .WithMany()
                    .HasForeignKey(d => d.DepartmentHeadId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Employee>(e =>
            {
                e.HasIndex(x => x.Email).IsUnique();
                e.HasOne(x => x.Department)
                    .WithMany(d => d.Employees)
                    .HasForeignKey(x => x.DepartmentId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<RoleChangeLog>(e =>
            {
                e.HasOne(x => x.Employee).WithMany().HasForeignKey(x => x.EmployeeId)
                    .OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.ChangedByEmployee).WithMany().HasForeignKey(x => x.ChangedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AssetCategory>()
                .HasIndex(x => x.Name).IsUnique();

            modelBuilder.Entity<Asset>(e =>
            {
                e.HasIndex(x => x.AssetTag).IsUnique();
                e.Property(x => x.AcquisitionCost).HasColumnType("decimal(12,2)");

                e.HasOne(x => x.Category).WithMany(c => c.Assets)
                    .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.CurrentHolderEmployee).WithMany()
                    .HasForeignKey(x => x.CurrentHolderEmployeeId).OnDelete(DeleteBehavior.SetNull);
                e.HasOne(x => x.CurrentHolderDepartment).WithMany()
                    .HasForeignKey(x => x.CurrentHolderDepartmentId).OnDelete(DeleteBehavior.SetNull);
                e.HasOne(x => x.CreatedByEmployee).WithMany()
                    .HasForeignKey(x => x.CreatedBy).OnDelete(DeleteBehavior.SetNull);

                e.HasIndex(x => x.Status);
                e.HasIndex(x => x.CategoryId);
                e.HasIndex(x => x.Location);
            });

            modelBuilder.Entity<AssetAllocation>(e =>
            {
                e.HasOne(x => x.Asset).WithMany(a => a.Allocations)
                    .HasForeignKey(x => x.AssetId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.Employee).WithMany()
                    .HasForeignKey(x => x.EmployeeId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.Department).WithMany()
                    .HasForeignKey(x => x.DepartmentId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.AllocatedByEmployee).WithMany()
                    .HasForeignKey(x => x.AllocatedBy).OnDelete(DeleteBehavior.Restrict);

                // *** Double-allocation guard, enforced at the DB level ***
                // Only one row with Status = Active may exist per asset.
                e.HasIndex(x => x.AssetId)
                    .IsUnique()
                    .HasFilter("\"status\" = 'Active'")   // Postgres syntax; SQL Server: [status] = 'Active'
                    .HasDatabaseName("uq_one_active_allocation_per_asset");

                e.HasIndex(x => x.EmployeeId);
                e.HasIndex(x => x.ExpectedReturnDate)
                    .HasFilter("\"status\" = 'Active'")
                    .HasDatabaseName("idx_allocations_overdue");

                e.ToTable(t => t.HasCheckConstraint(
                    "chk_holder_present",
                    "\"employee_id\" IS NOT NULL OR \"department_id\" IS NOT NULL"));
            });

            modelBuilder.Entity<TransferRequest>(e =>
            {
                e.HasOne(x => x.Asset).WithMany(a => a.TransferRequests)
                    .HasForeignKey(x => x.AssetId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.FromEmployee).WithMany()
                    .HasForeignKey(x => x.FromEmployeeId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.ToEmployee).WithMany()
                    .HasForeignKey(x => x.ToEmployeeId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.RequestedByEmployee).WithMany()
                    .HasForeignKey(x => x.RequestedBy).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.ApprovedByEmployee).WithMany()
                    .HasForeignKey(x => x.ApprovedBy).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ResourceBooking>(e =>
            {
                e.HasOne(x => x.Asset).WithMany(a => a.Bookings)
                    .HasForeignKey(x => x.AssetId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.BookedByEmployee).WithMany()
                    .HasForeignKey(x => x.BookedBy).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.Department).WithMany()
                    .HasForeignKey(x => x.DepartmentId).OnDelete(DeleteBehavior.SetNull);

                e.HasIndex(x => new { x.AssetId, x.StartTime, x.EndTime });

                e.ToTable(t => t.HasCheckConstraint("chk_booking_time_order", "\"end_time\" > \"start_time\""));

                // *** Overlap guard: NOT expressible via EF Core fluent API. ***
                // After scaffolding this migration, hand-add (Postgres):
                //   CREATE EXTENSION IF NOT EXISTS btree_gist;
                //   ALTER TABLE resource_bookings ADD CONSTRAINT no_overlapping_bookings
                //     EXCLUDE USING gist (asset_id WITH =, tsrange(start_time, end_time) WITH &&)
                //     WHERE (status IN ('Upcoming','Ongoing'));
                // On SQL Server: enforce via a trigger or SERIALIZABLE + UPDLOCK/HOLDLOCK check
                // in the booking service instead (no native exclusion constraint).
            });

            modelBuilder.Entity<MaintenanceRequest>(e =>
            {
                e.HasOne(x => x.Asset).WithMany(a => a.MaintenanceRequests)
                    .HasForeignKey(x => x.AssetId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.RaisedByEmployee).WithMany()
                    .HasForeignKey(x => x.RaisedBy).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.ApprovedByEmployee).WithMany()
                    .HasForeignKey(x => x.ApprovedBy).OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => x.AssetId);
                e.HasIndex(x => x.Status);
            });

            modelBuilder.Entity<MaintenanceStatusLog>()
                .HasOne(x => x.Request).WithMany(r => r.StatusLogs)
                .HasForeignKey(x => x.RequestId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AuditCycle>(e =>
            {
                e.HasOne(x => x.ScopeDepartment).WithMany()
                    .HasForeignKey(x => x.ScopeDepartmentId).OnDelete(DeleteBehavior.SetNull);
                e.HasOne(x => x.CreatedByEmployee).WithMany()
                    .HasForeignKey(x => x.CreatedBy).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.ClosedByEmployee).WithMany()
                    .HasForeignKey(x => x.ClosedBy).OnDelete(DeleteBehavior.Restrict);

                e.ToTable(t => t.HasCheckConstraint("chk_audit_dates", "\"end_date\" >= \"start_date\""));
            });

            modelBuilder.Entity<AuditCycleAuditor>(e =>
            {
                e.HasKey(x => new { x.AuditCycleId, x.AuditorId });
                e.HasOne(x => x.AuditCycle).WithMany(c => c.Auditors)
                    .HasForeignKey(x => x.AuditCycleId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Auditor).WithMany()
                    .HasForeignKey(x => x.AuditorId).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<AuditCycleAsset>(e =>
            {
                e.HasIndex(x => new { x.AuditCycleId, x.AssetId }).IsUnique();
                e.HasOne(x => x.AuditCycle).WithMany(c => c.ScopedAssets)
                    .HasForeignKey(x => x.AuditCycleId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Asset).WithMany()
                    .HasForeignKey(x => x.AssetId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.VerifiedByEmployee).WithMany()
                    .HasForeignKey(x => x.VerifiedBy).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<DiscrepancyReport>(e =>
            {
                e.HasOne(x => x.AuditCycle).WithMany(c => c.DiscrepancyReports)
                    .HasForeignKey(x => x.AuditCycleId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Asset).WithMany()
                    .HasForeignKey(x => x.AssetId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.ResolvedByEmployee).WithMany()
                    .HasForeignKey(x => x.ResolvedBy).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Notification>(e =>
            {
                e.HasOne(x => x.Recipient).WithMany()
                    .HasForeignKey(x => x.RecipientId).OnDelete(DeleteBehavior.Cascade);
                e.HasIndex(x => new { x.RecipientId, x.IsRead });
            });

            modelBuilder.Entity<ActivityLog>(e =>
            {
                e.HasOne(x => x.Actor).WithMany()
                    .HasForeignKey(x => x.ActorId).OnDelete(DeleteBehavior.SetNull);
                e.HasIndex(x => x.ActorId);
                e.HasIndex(x => new { x.EntityType, x.EntityId });
            });

            // -----------------------------------------------------------
            // All enums stored as their string name, not int, so the DB
            // stays human-readable and matches the CHECK-constraint values
            // in the original SQL design.
            // -----------------------------------------------------------
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
                foreach (var property in entityType.ClrType.GetProperties())
                    if (property.PropertyType.IsEnum)
                        modelBuilder.Entity(entityType.Name).Property(property.Name)
                            .HasConversion<string>()
                            .HasMaxLength(30);

            // -----------------------------------------------------------
            // snake_case table/column names, to match the hand-written SQL
            // schema exactly. Remove this block if you'd rather let EF use
            // its default PascalCase naming for a fresh migration.
            // -----------------------------------------------------------
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                entity.SetTableName(ToSnakeCase(entity.GetTableName()!));

                foreach (var property in entity.GetProperties())
                    property.SetColumnName(ToSnakeCase(property.Name));

                foreach (var key in entity.GetKeys())
                    key.SetName(ToSnakeCase(key.GetName()!));

                foreach (var fk in entity.GetForeignKeys())
                    fk.SetConstraintName(ToSnakeCase(fk.GetConstraintName()!));

                foreach (var index in entity.GetIndexes())
                    if (string.IsNullOrEmpty(index.GetDatabaseName()) is false
                        && !index.GetDatabaseName()!.StartsWith("uq_") && !index.GetDatabaseName()!.StartsWith("idx_"))
                        index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()!));
            }
        }

        private static string ToSnakeCase(string input) =>
            Regex.Replace(input, "([a-z0-9])([A-Z])", "$1_$2").ToLowerInvariant();
    }
}

// =====================================================================
// USAGE NOTES
// =====================================================================
// 1. Register in Program.cs:
//      builder.Services.AddDbContext<AssetFlowDbContext>(opt =>
//          opt.UseNpgsql(builder.Configuration.GetConnectionString("AssetFlowDb")));
//      // or opt.UseSqlServer(...) for MS SQL Server
//
// 2. Create the first migration:
//      dotnet ef migrations add InitialCreate -o Data/Migrations
//      dotnet ef database update
//
// 3. After scaffolding, manually add the booking-overlap EXCLUDE constraint
//    (see comment inside OnModelCreating under ResourceBooking) into the
//    generated migration's Up() method via migrationBuilder.Sql("...").
//    EF Core cannot express PostgreSQL EXCLUDE constraints natively.
//
// 4. Asset tag generation (AF-0001 style), status-history writes on every
//    asset.Status change, and discrepancy-report auto-creation on
//    Missing/Damaged verification are business rules, not schema rules —
//    implement them in your service/application layer (or as DB triggers
//    if you prefer enforcement closer to the data).