using AssetFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Text.RegularExpressions;

namespace AssetFlow.Infrastructure.Data
{
    // Resolves "who is calling right now" — implemented in the API layer,
    // typically reading a claim from the JWT set at login (see notes below).
    public interface ICurrentTenant
    {
        Guid ClientId { get; }
    }

    public class AssetFlowDbContext : DbContext
    {
        private readonly ICurrentTenant? _tenant;

        // ICurrentTenant is optional so this same DbContext also works for
        // design-time migration generation (dotnet ef ... has no request/tenant).
        public AssetFlowDbContext(DbContextOptions<AssetFlowDbContext> options, ICurrentTenant? tenant = null)
            : base(options)
        {
            _tenant = tenant;
        }

        public DbSet<Client> Clients => Set<Client>();
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
            // 0. TENANT TABLE
            // -----------------------------------------------------------
            modelBuilder.Entity<Client>(e =>
            {
                e.HasIndex(x => x.Subdomain).IsUnique();
                e.HasIndex(x => x.ContactEmail);
            });

            // -----------------------------------------------------------
            // 1. RELATIONSHIPS (unchanged from single-tenant version,
            //    plus ClientId FK to Client on every scoped entity below)
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
                // Email unique PER TENANT, not globally — two different
                // organizations can each have their own "priya@company.com".
                e.HasIndex(x => new { x.ClientId, x.Email }).IsUnique();
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

            modelBuilder.Entity<AssetCategory>(e =>
            {
                e.HasIndex(x => new { x.ClientId, x.Name }).IsUnique();
                e.Property(x => x.CustomFieldsJson).HasColumnType("jsonb");
            });

            modelBuilder.Entity<Asset>(e =>
            {
                e.HasIndex(x => new { x.ClientId, x.AssetTag }).IsUnique();
                e.Property(x => x.AcquisitionCost).HasColumnType("decimal(12,2)");
                e.Property(x => x.CustomFieldValuesJson).HasColumnType("jsonb");

                e.HasOne(x => x.Category).WithMany(c => c.Assets)
                    .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.CurrentHolderEmployee).WithMany()
                    .HasForeignKey(x => x.CurrentHolderEmployeeId).OnDelete(DeleteBehavior.SetNull);
                e.HasOne(x => x.CurrentHolderDepartment).WithMany()
                    .HasForeignKey(x => x.CurrentHolderDepartmentId).OnDelete(DeleteBehavior.SetNull);
                e.HasOne(x => x.CreatedByEmployee).WithMany()
                    .HasForeignKey(x => x.CreatedBy).OnDelete(DeleteBehavior.SetNull);

                e.HasIndex(x => new { x.ClientId, x.Status });
                e.HasIndex(x => new { x.ClientId, x.CategoryId });
                e.HasIndex(x => new { x.ClientId, x.Location });
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

                // Double-allocation guard — asset_id alone is enough here (an
                // asset already belongs to exactly one tenant), but ClientId
                // is included so the index also serves tenant-scoped lookups.
                e.HasIndex(x => new { x.ClientId, x.AssetId })
                    .IsUnique()
                    .HasFilter("\"status\" = 'Active'")
                    .HasDatabaseName("uq_one_active_allocation_per_asset");

                e.HasIndex(x => new { x.ClientId, x.EmployeeId });
                e.HasIndex(x => new { x.ClientId, x.ExpectedReturnDate })
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

                e.HasIndex(x => new { x.ClientId, x.AssetId, x.StartTime, x.EndTime });
                e.ToTable(t => t.HasCheckConstraint("chk_booking_time_order", "\"end_time\" > \"start_time\""));

                // *** Overlap guard: still not expressible via EF Core fluent API. ***
                // Hand-add to the generated migration's Up() method (Postgres):
                //   CREATE EXTENSION IF NOT EXISTS btree_gist;
                //   ALTER TABLE resource_bookings ADD CONSTRAINT no_overlapping_bookings
                //     EXCLUDE USING gist (
                //       client_id WITH =,          -- scope the exclusion per tenant too
                //       asset_id  WITH =,
                //       tsrange(start_time, end_time) WITH &&
                //     ) WHERE (status IN ('Upcoming','Ongoing'));
            });

            modelBuilder.Entity<MaintenanceRequest>(e =>
            {
                e.HasOne(x => x.Asset).WithMany(a => a.MaintenanceRequests)
                    .HasForeignKey(x => x.AssetId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.RaisedByEmployee).WithMany()
                    .HasForeignKey(x => x.RaisedBy).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.ApprovedByEmployee).WithMany()
                    .HasForeignKey(x => x.ApprovedBy).OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => new { x.ClientId, x.AssetId });
                e.HasIndex(x => new { x.ClientId, x.Status });
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
                e.HasIndex(x => new { x.ClientId, x.AuditCycleId, x.AssetId }).IsUnique();
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
                e.HasIndex(x => new { x.ClientId, x.RecipientId, x.IsRead });
            });

            modelBuilder.Entity<ActivityLog>(e =>
            {
                e.HasOne(x => x.Actor).WithMany()
                    .HasForeignKey(x => x.ActorId).OnDelete(DeleteBehavior.SetNull);
                e.HasIndex(x => new { x.ClientId, x.ActorId });
                e.HasIndex(x => new { x.ClientId, x.EntityType, x.EntityId });
                e.Property(x => x.DetailsJson).HasColumnType("jsonb");
            });

            // -----------------------------------------------------------
            // 2. ClientId -> Client FK on every ITenantScoped entity, plus
            //    a global query filter so every LINQ query run through this
            //    context is automatically scoped to the caller's tenant.
            //    This is the actual data-isolation guarantee — controllers
            //    and services never need to remember to add "where ClientId
            //    == ..." themselves.
            // -----------------------------------------------------------
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (!typeof(ITenantScoped).IsAssignableFrom(entityType.ClrType)) continue;

                modelBuilder.Entity(entityType.ClrType)
                    .HasOne(typeof(Client))
                    .WithMany()
                    .HasForeignKey(nameof(ITenantScoped.ClientId))
                    .OnDelete(DeleteBehavior.Restrict);

                modelBuilder.Entity(entityType.ClrType).HasIndex(nameof(ITenantScoped.ClientId));

                var method = typeof(AssetFlowDbContext)
                    .GetMethod(nameof(BuildTenantFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                    .MakeGenericMethod(entityType.ClrType);
                var filter = method.Invoke(this, null);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter((LambdaExpression)filter!);
            }

            // -----------------------------------------------------------
            // 3. Enums stored as strings (readable in the DB, matches the
            //    original CHECK-constraint values).
            // -----------------------------------------------------------
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
                foreach (var property in entityType.ClrType.GetProperties())
                    if (property.PropertyType.IsEnum ||
                        (Nullable.GetUnderlyingType(property.PropertyType)?.IsEnum ?? false))
                        modelBuilder.Entity(entityType.Name).Property(property.Name)
                            .HasConversion<string>()
                            .HasMaxLength(30);

            // -----------------------------------------------------------
            // 4. Table names matching the original SQL file exactly, and
            //    snake_case columns/keys/indexes (EF Core does not
            //    pluralize table names by default).
            // -----------------------------------------------------------
            var tableNames = new Dictionary<string, string>
            {
                [nameof(Client)] = "clients",
                [nameof(Department)] = "departments",
                [nameof(Employee)] = "employees",
                [nameof(RoleChangeLog)] = "role_change_log",
                [nameof(AssetCategory)] = "asset_categories",
                [nameof(Asset)] = "assets",
                [nameof(AssetDocument)] = "asset_documents",
                [nameof(AssetStatusHistory)] = "asset_status_history",
                [nameof(AssetAllocation)] = "asset_allocations",
                [nameof(TransferRequest)] = "transfer_requests",
                [nameof(ResourceBooking)] = "resource_bookings",
                [nameof(MaintenanceRequest)] = "maintenance_requests",
                [nameof(MaintenanceStatusLog)] = "maintenance_status_log",
                [nameof(AuditCycle)] = "audit_cycles",
                [nameof(AuditCycleAuditor)] = "audit_cycle_auditors",
                [nameof(AuditCycleAsset)] = "audit_cycle_assets",
                [nameof(DiscrepancyReport)] = "discrepancy_reports",
                [nameof(Notification)] = "notifications",
                [nameof(ActivityLog)] = "activity_logs",
            };

            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                entity.SetTableName(tableNames.TryGetValue(entity.ClrType.Name, out var t)
                    ? t
                    : ToSnakeCase(entity.GetTableName()!));

                foreach (var property in entity.GetProperties())
                    property.SetColumnName(ToSnakeCase(property.Name));

                foreach (var key in entity.GetKeys())
                    key.SetName(ToSnakeCase(key.GetName()!));

                foreach (var fk in entity.GetForeignKeys())
                    fk.SetConstraintName(ToSnakeCase(fk.GetConstraintName()!));

                foreach (var index in entity.GetIndexes())
                {
                    var name = index.GetDatabaseName();
                    if (!string.IsNullOrEmpty(name) && !name!.StartsWith("uq_") && !name.StartsWith("idx_"))
                        index.SetDatabaseName(ToSnakeCase(name));
                }
            }
        }

        // Builds: entity => entity.ClientId == _tenant.ClientId
        // (falls back to "always true" when no tenant is resolved, e.g. at
        // design time for `dotnet ef migrations add`).
        private LambdaExpression BuildTenantFilter<TEntity>() where TEntity : class, ITenantScoped
        {
            var currentClientId = _tenant?.ClientId ?? Guid.Empty;
            var hasTenant = _tenant is not null;
            Expression<Func<TEntity, bool>> expr = hasTenant
                ? e => e.ClientId == currentClientId
                : e => true;
            return expr;
        }

        // Belt-and-suspenders: auto-stamp ClientId on every new row so a
        // forgotten assignment in a service method can't create a row with
        // an empty/wrong tenant id.
        public override int SaveChanges()
        {
            StampTenant();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            StampTenant();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void StampTenant()
        {
            if (_tenant is null) return;
            foreach (var entry in ChangeTracker.Entries<ITenantScoped>())
                if (entry.State == EntityState.Added)
                    entry.Entity.ClientId = _tenant.ClientId;
        }

        private static string ToSnakeCase(string input) =>
            Regex.Replace(input, "([a-z0-9])([A-Z])", "$1_$2").ToLowerInvariant();
    }
}

// =====================================================================
// USAGE NOTES — multi-tenant setup
// =====================================================================
// 1. Implement ICurrentTenant in the API layer, resolving the tenant from
//    whatever identifies the caller — typically a "client_id" claim baked
//    into the JWT at login, or a header/subdomain for machine-to-machine
//    API keys:
//
//    public class HttpCurrentTenant : ICurrentTenant
//    {
//        public Guid ClientId { get; }
//        public HttpCurrentTenant(IHttpContextAccessor accessor)
//        {
//            var claim = accessor.HttpContext?.User.FindFirst("client_id")?.Value;
//            ClientId = claim is not null ? Guid.Parse(claim) : Guid.Empty;
//        }
//    }
//
// 2. Register both, scoped per-request:
//    builder.Services.AddHttpContextAccessor();
//    builder.Services.AddScoped<ICurrentTenant, HttpCurrentTenant>();
//    builder.Services.AddDbContext<AssetFlowDbContext>(opt =>
//        opt.UseNpgsql(builder.Configuration.GetConnectionString("AssetFlowDb")));
//
// 3. Every query through this context (websites, mobile clients, partner
//    API integrations — anything using the same DbContext) is now
//    automatically scoped to ClientId. No repository method needs a
//    manual "Where(x => x.ClientId == ...)" — the global query filter
//    does it, and SaveChanges stamps it on insert.
//
// 4. This is shared-database, shared-schema multi-tenancy — the simplest
//    and cheapest model, fine for most SaaS. If a future Enterprise tier
//    needs hard data isolation (its own DB/schema, dedicated backups),
//    that's a separate connection-string-per-tenant strategy layered on
//    top of this same entity model, not a schema change.
//
// 5. Rate-limiting / plan enforcement (e.g. "Trial = 50 assets max") is a
//    business rule, not a schema rule — check Client.Plan in the relevant
//    service before allowing an insert, not in the DbContext.