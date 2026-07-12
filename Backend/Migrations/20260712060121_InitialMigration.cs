using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "clients",
                columns: table => new
                {
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_name = table.Column<string>(type: "text", nullable: false),
                    subdomain = table.Column<string>(type: "text", nullable: false),
                    contact_email = table.Column<string>(type: "text", nullable: false),
                    plan = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    trial_ends_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    subscription_expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_clients", x => x.client_id);
                });

            migrationBuilder.CreateTable(
                name: "asset_categories",
                columns: table => new
                {
                    category_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    custom_fields_json = table.Column<string>(type: "jsonb", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asset_categories", x => x.category_id);
                    table.ForeignKey(
                        name: "fk_asset_categories_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "activity_logs",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_id = table.Column<int>(type: "integer", nullable: true),
                    action = table.Column<string>(type: "text", nullable: false),
                    entity_type = table.Column<string>(type: "text", nullable: false),
                    entity_id = table.Column<int>(type: "integer", nullable: true),
                    details_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_activity_logs", x => x.log_id);
                    table.ForeignKey(
                        name: "fk_activity_logs_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "asset_allocations",
                columns: table => new
                {
                    allocation_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    asset_id = table.Column<int>(type: "integer", nullable: false),
                    employee_id = table.Column<int>(type: "integer", nullable: true),
                    department_id = table.Column<int>(type: "integer", nullable: true),
                    allocated_by = table.Column<int>(type: "integer", nullable: false),
                    allocated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expected_return_date = table.Column<DateOnly>(type: "date", nullable: true),
                    actual_return_date = table.Column<DateOnly>(type: "date", nullable: true),
                    return_condition_notes = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asset_allocations", x => x.allocation_id);
                    table.CheckConstraint("chk_holder_present", "\"employee_id\" IS NOT NULL OR \"department_id\" IS NOT NULL");
                    table.ForeignKey(
                        name: "fk_asset_allocations_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "asset_documents",
                columns: table => new
                {
                    document_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    asset_id = table.Column<int>(type: "integer", nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    file_type = table.Column<string>(type: "text", nullable: true),
                    uploaded_by = table.Column<int>(type: "integer", nullable: true),
                    uploaded_by_employee_employee_id = table.Column<int>(type: "integer", nullable: true),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asset_documents", x => x.document_id);
                    table.ForeignKey(
                        name: "fk_asset_documents_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "asset_status_history",
                columns: table => new
                {
                    history_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    asset_id = table.Column<int>(type: "integer", nullable: false),
                    from_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    to_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    changed_by = table.Column<int>(type: "integer", nullable: true),
                    changed_by_employee_employee_id = table.Column<int>(type: "integer", nullable: true),
                    reason = table.Column<string>(type: "text", nullable: true),
                    changed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_asset_status_history", x => x.history_id);
                    table.ForeignKey(
                        name: "fk_asset_status_history_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "assets",
                columns: table => new
                {
                    asset_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    asset_tag = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    category_id = table.Column<int>(type: "integer", nullable: false),
                    serial_number = table.Column<string>(type: "text", nullable: true),
                    qr_code = table.Column<string>(type: "text", nullable: true),
                    acquisition_date = table.Column<DateOnly>(type: "date", nullable: true),
                    acquisition_cost = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    condition = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    location = table.Column<string>(type: "text", nullable: true),
                    is_bookable = table.Column<bool>(type: "boolean", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    current_holder_employee_id = table.Column<int>(type: "integer", nullable: true),
                    current_holder_department_id = table.Column<int>(type: "integer", nullable: true),
                    custom_field_values_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_by = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_assets", x => x.asset_id);
                    table.ForeignKey(
                        name: "fk_assets_asset_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "asset_categories",
                        principalColumn: "category_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_assets_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "audit_cycle_assets",
                columns: table => new
                {
                    audit_cycle_asset_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    audit_cycle_id = table.Column<int>(type: "integer", nullable: false),
                    asset_id = table.Column<int>(type: "integer", nullable: false),
                    verification_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    verified_by = table.Column<int>(type: "integer", nullable: true),
                    verified_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_cycle_assets", x => x.audit_cycle_asset_id);
                    table.ForeignKey(
                        name: "fk_audit_cycle_assets_assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "assets",
                        principalColumn: "asset_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_audit_cycle_assets_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "audit_cycle_auditors",
                columns: table => new
                {
                    audit_cycle_id = table.Column<int>(type: "integer", nullable: false),
                    auditor_id = table.Column<int>(type: "integer", nullable: false),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_cycle_auditors", x => new { x.audit_cycle_id, x.auditor_id });
                    table.ForeignKey(
                        name: "fk_audit_cycle_auditors_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "audit_cycles",
                columns: table => new
                {
                    audit_cycle_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    scope_department_id = table.Column<int>(type: "integer", nullable: true),
                    scope_location = table.Column<string>(type: "text", nullable: true),
                    start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    end_date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_by = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    closed_by = table.Column<int>(type: "integer", nullable: true),
                    closed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_cycles", x => x.audit_cycle_id);
                    table.CheckConstraint("chk_audit_dates", "\"end_date\" >= \"start_date\"");
                    table.ForeignKey(
                        name: "fk_audit_cycles_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "departments",
                columns: table => new
                {
                    department_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    parent_department_id = table.Column<int>(type: "integer", nullable: true),
                    department_head_id = table.Column<int>(type: "integer", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_departments", x => x.department_id);
                    table.ForeignKey(
                        name: "fk_departments_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_departments_departments_parent_department_id",
                        column: x => x.parent_department_id,
                        principalTable: "departments",
                        principalColumn: "department_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "employees",
                columns: table => new
                {
                    employee_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    department_id = table.Column<int>(type: "integer", nullable: true),
                    role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_employees", x => x.employee_id);
                    table.ForeignKey(
                        name: "fk_employees_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_employees_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "department_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "discrepancy_reports",
                columns: table => new
                {
                    discrepancy_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    audit_cycle_id = table.Column<int>(type: "integer", nullable: false),
                    asset_id = table.Column<int>(type: "integer", nullable: false),
                    discrepancy_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    resolution_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    resolved_by = table.Column<int>(type: "integer", nullable: true),
                    resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_discrepancy_reports", x => x.discrepancy_id);
                    table.ForeignKey(
                        name: "fk_discrepancy_reports_assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "assets",
                        principalColumn: "asset_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_discrepancy_reports_audit_cycles_audit_cycle_id",
                        column: x => x.audit_cycle_id,
                        principalTable: "audit_cycles",
                        principalColumn: "audit_cycle_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_discrepancy_reports_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_discrepancy_reports_employees_resolved_by",
                        column: x => x.resolved_by,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "maintenance_requests",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    asset_id = table.Column<int>(type: "integer", nullable: false),
                    raised_by = table.Column<int>(type: "integer", nullable: false),
                    issue_description = table.Column<string>(type: "text", nullable: false),
                    priority = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    photo_url = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    approved_by = table.Column<int>(type: "integer", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    technician_name = table.Column<string>(type: "text", nullable: true),
                    resolved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_maintenance_requests", x => x.request_id);
                    table.ForeignKey(
                        name: "fk_maintenance_requests_assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "assets",
                        principalColumn: "asset_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_maintenance_requests_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_maintenance_requests_employees_approved_by",
                        column: x => x.approved_by,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_maintenance_requests_employees_raised_by",
                        column: x => x.raised_by,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    notification_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    recipient_id = table.Column<int>(type: "integer", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    reference_type = table.Column<string>(type: "text", nullable: true),
                    reference_id = table.Column<int>(type: "integer", nullable: true),
                    message = table.Column<string>(type: "text", nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.notification_id);
                    table.ForeignKey(
                        name: "fk_notifications_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_notifications_employees_recipient_id",
                        column: x => x.recipient_id,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "resource_bookings",
                columns: table => new
                {
                    booking_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    asset_id = table.Column<int>(type: "integer", nullable: false),
                    booked_by = table.Column<int>(type: "integer", nullable: false),
                    department_id = table.Column<int>(type: "integer", nullable: true),
                    start_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_resource_bookings", x => x.booking_id);
                    table.CheckConstraint("chk_booking_time_order", "\"end_time\" > \"start_time\"");
                    table.ForeignKey(
                        name: "fk_resource_bookings_assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "assets",
                        principalColumn: "asset_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_resource_bookings_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_resource_bookings_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "department_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_resource_bookings_employees_booked_by",
                        column: x => x.booked_by,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "role_change_log",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<int>(type: "integer", nullable: false),
                    old_role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    new_role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    changed_by = table.Column<int>(type: "integer", nullable: false),
                    changed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_role_change_log", x => x.log_id);
                    table.ForeignKey(
                        name: "fk_role_change_log_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_role_change_log_employees_changed_by",
                        column: x => x.changed_by,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_role_change_log_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "transfer_requests",
                columns: table => new
                {
                    transfer_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    asset_id = table.Column<int>(type: "integer", nullable: false),
                    from_employee_id = table.Column<int>(type: "integer", nullable: true),
                    to_employee_id = table.Column<int>(type: "integer", nullable: false),
                    requested_by = table.Column<int>(type: "integer", nullable: false),
                    requested_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    approved_by = table.Column<int>(type: "integer", nullable: true),
                    approved_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_transfer_requests", x => x.transfer_id);
                    table.ForeignKey(
                        name: "fk_transfer_requests_assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "assets",
                        principalColumn: "asset_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_transfer_requests_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_transfer_requests_employees_approved_by",
                        column: x => x.approved_by,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_transfer_requests_employees_from_employee_id",
                        column: x => x.from_employee_id,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_transfer_requests_employees_requested_by",
                        column: x => x.requested_by,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_transfer_requests_employees_to_employee_id",
                        column: x => x.to_employee_id,
                        principalTable: "employees",
                        principalColumn: "employee_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "maintenance_status_log",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    request_id = table.Column<int>(type: "integer", nullable: false),
                    from_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    to_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    changed_by = table.Column<int>(type: "integer", nullable: true),
                    changed_by_employee_employee_id = table.Column<int>(type: "integer", nullable: true),
                    changed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_maintenance_status_log", x => x.log_id);
                    table.ForeignKey(
                        name: "fk_maintenance_status_log_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_maintenance_status_log_employees_changed_by_employee_employ~",
                        column: x => x.changed_by_employee_employee_id,
                        principalTable: "employees",
                        principalColumn: "employee_id");
                    table.ForeignKey(
                        name: "fk_maintenance_status_log_maintenance_requests_request_id",
                        column: x => x.request_id,
                        principalTable: "maintenance_requests",
                        principalColumn: "request_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_activity_logs_actor_id",
                table: "activity_logs",
                column: "actor_id");

            migrationBuilder.CreateIndex(
                name: "ix_activity_logs_client_id",
                table: "activity_logs",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_activity_logs_client_id_actor_id",
                table: "activity_logs",
                columns: new[] { "client_id", "actor_id" });

            migrationBuilder.CreateIndex(
                name: "ix_activity_logs_client_id_entity_type_entity_id",
                table: "activity_logs",
                columns: new[] { "client_id", "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "idx_allocations_overdue",
                table: "asset_allocations",
                columns: new[] { "client_id", "expected_return_date" },
                filter: "\"status\" = 'Active'");

            migrationBuilder.CreateIndex(
                name: "ix_asset_allocations_allocated_by",
                table: "asset_allocations",
                column: "allocated_by");

            migrationBuilder.CreateIndex(
                name: "ix_asset_allocations_asset_id",
                table: "asset_allocations",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_allocations_client_id",
                table: "asset_allocations",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_allocations_client_id_employee_id",
                table: "asset_allocations",
                columns: new[] { "client_id", "employee_id" });

            migrationBuilder.CreateIndex(
                name: "ix_asset_allocations_department_id",
                table: "asset_allocations",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_allocations_employee_id",
                table: "asset_allocations",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "uq_one_active_allocation_per_asset",
                table: "asset_allocations",
                columns: new[] { "client_id", "asset_id" },
                unique: true,
                filter: "\"status\" = 'Active'");

            migrationBuilder.CreateIndex(
                name: "ix_asset_categories_client_id",
                table: "asset_categories",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_categories_client_id_name",
                table: "asset_categories",
                columns: new[] { "client_id", "name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_asset_documents_asset_id",
                table: "asset_documents",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_documents_client_id",
                table: "asset_documents",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_documents_uploaded_by_employee_employee_id",
                table: "asset_documents",
                column: "uploaded_by_employee_employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_status_history_asset_id",
                table: "asset_status_history",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_status_history_changed_by_employee_employee_id",
                table: "asset_status_history",
                column: "changed_by_employee_employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_asset_status_history_client_id",
                table: "asset_status_history",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_assets_category_id",
                table: "assets",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_assets_client_id",
                table: "assets",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_assets_client_id_asset_tag",
                table: "assets",
                columns: new[] { "client_id", "asset_tag" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_assets_client_id_category_id",
                table: "assets",
                columns: new[] { "client_id", "category_id" });

            migrationBuilder.CreateIndex(
                name: "ix_assets_client_id_location",
                table: "assets",
                columns: new[] { "client_id", "location" });

            migrationBuilder.CreateIndex(
                name: "ix_assets_client_id_status",
                table: "assets",
                columns: new[] { "client_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_assets_created_by",
                table: "assets",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_assets_current_holder_department_id",
                table: "assets",
                column: "current_holder_department_id");

            migrationBuilder.CreateIndex(
                name: "ix_assets_current_holder_employee_id",
                table: "assets",
                column: "current_holder_employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycle_assets_asset_id",
                table: "audit_cycle_assets",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycle_assets_audit_cycle_id",
                table: "audit_cycle_assets",
                column: "audit_cycle_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycle_assets_client_id",
                table: "audit_cycle_assets",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycle_assets_client_id_audit_cycle_id_asset_id",
                table: "audit_cycle_assets",
                columns: new[] { "client_id", "audit_cycle_id", "asset_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycle_assets_verified_by",
                table: "audit_cycle_assets",
                column: "verified_by");

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycle_auditors_auditor_id",
                table: "audit_cycle_auditors",
                column: "auditor_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycle_auditors_client_id",
                table: "audit_cycle_auditors",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycles_client_id",
                table: "audit_cycles",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycles_closed_by",
                table: "audit_cycles",
                column: "closed_by");

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycles_created_by",
                table: "audit_cycles",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_audit_cycles_scope_department_id",
                table: "audit_cycles",
                column: "scope_department_id");

            migrationBuilder.CreateIndex(
                name: "ix_clients_contact_email",
                table: "clients",
                column: "contact_email");

            migrationBuilder.CreateIndex(
                name: "ix_clients_subdomain",
                table: "clients",
                column: "subdomain",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_departments_client_id",
                table: "departments",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_departments_department_head_id",
                table: "departments",
                column: "department_head_id");

            migrationBuilder.CreateIndex(
                name: "ix_departments_parent_department_id",
                table: "departments",
                column: "parent_department_id");

            migrationBuilder.CreateIndex(
                name: "ix_discrepancy_reports_asset_id",
                table: "discrepancy_reports",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_discrepancy_reports_audit_cycle_id",
                table: "discrepancy_reports",
                column: "audit_cycle_id");

            migrationBuilder.CreateIndex(
                name: "ix_discrepancy_reports_client_id",
                table: "discrepancy_reports",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_discrepancy_reports_resolved_by",
                table: "discrepancy_reports",
                column: "resolved_by");

            migrationBuilder.CreateIndex(
                name: "ix_employees_client_id",
                table: "employees",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_employees_client_id_email",
                table: "employees",
                columns: new[] { "client_id", "email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_employees_department_id",
                table: "employees",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_requests_approved_by",
                table: "maintenance_requests",
                column: "approved_by");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_requests_asset_id",
                table: "maintenance_requests",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_requests_client_id",
                table: "maintenance_requests",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_requests_client_id_asset_id",
                table: "maintenance_requests",
                columns: new[] { "client_id", "asset_id" });

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_requests_client_id_status",
                table: "maintenance_requests",
                columns: new[] { "client_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_requests_raised_by",
                table: "maintenance_requests",
                column: "raised_by");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_status_log_changed_by_employee_employee_id",
                table: "maintenance_status_log",
                column: "changed_by_employee_employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_status_log_client_id",
                table: "maintenance_status_log",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_maintenance_status_log_request_id",
                table: "maintenance_status_log",
                column: "request_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_client_id",
                table: "notifications",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_client_id_recipient_id_is_read",
                table: "notifications",
                columns: new[] { "client_id", "recipient_id", "is_read" });

            migrationBuilder.CreateIndex(
                name: "ix_notifications_recipient_id",
                table: "notifications",
                column: "recipient_id");

            migrationBuilder.CreateIndex(
                name: "ix_resource_bookings_asset_id",
                table: "resource_bookings",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_resource_bookings_booked_by",
                table: "resource_bookings",
                column: "booked_by");

            migrationBuilder.CreateIndex(
                name: "ix_resource_bookings_client_id",
                table: "resource_bookings",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_resource_bookings_client_id_asset_id_start_time_end_time",
                table: "resource_bookings",
                columns: new[] { "client_id", "asset_id", "start_time", "end_time" });

            migrationBuilder.CreateIndex(
                name: "ix_resource_bookings_department_id",
                table: "resource_bookings",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_role_change_log_changed_by",
                table: "role_change_log",
                column: "changed_by");

            migrationBuilder.CreateIndex(
                name: "ix_role_change_log_client_id",
                table: "role_change_log",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_role_change_log_employee_id",
                table: "role_change_log",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_transfer_requests_approved_by",
                table: "transfer_requests",
                column: "approved_by");

            migrationBuilder.CreateIndex(
                name: "ix_transfer_requests_asset_id",
                table: "transfer_requests",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_transfer_requests_client_id",
                table: "transfer_requests",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_transfer_requests_from_employee_id",
                table: "transfer_requests",
                column: "from_employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_transfer_requests_requested_by",
                table: "transfer_requests",
                column: "requested_by");

            migrationBuilder.CreateIndex(
                name: "ix_transfer_requests_to_employee_id",
                table: "transfer_requests",
                column: "to_employee_id");

            migrationBuilder.AddForeignKey(
                name: "fk_activity_logs_employees_actor_id",
                table: "activity_logs",
                column: "actor_id",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_asset_allocations_assets_asset_id",
                table: "asset_allocations",
                column: "asset_id",
                principalTable: "assets",
                principalColumn: "asset_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_asset_allocations_departments_department_id",
                table: "asset_allocations",
                column: "department_id",
                principalTable: "departments",
                principalColumn: "department_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_asset_allocations_employees_allocated_by",
                table: "asset_allocations",
                column: "allocated_by",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_asset_allocations_employees_employee_id",
                table: "asset_allocations",
                column: "employee_id",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_asset_documents_assets_asset_id",
                table: "asset_documents",
                column: "asset_id",
                principalTable: "assets",
                principalColumn: "asset_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_asset_documents_employees_uploaded_by_employee_employee_id",
                table: "asset_documents",
                column: "uploaded_by_employee_employee_id",
                principalTable: "employees",
                principalColumn: "employee_id");

            migrationBuilder.AddForeignKey(
                name: "fk_asset_status_history_assets_asset_id",
                table: "asset_status_history",
                column: "asset_id",
                principalTable: "assets",
                principalColumn: "asset_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_asset_status_history_employees_changed_by_employee_employee~",
                table: "asset_status_history",
                column: "changed_by_employee_employee_id",
                principalTable: "employees",
                principalColumn: "employee_id");

            migrationBuilder.AddForeignKey(
                name: "fk_assets_departments_current_holder_department_id",
                table: "assets",
                column: "current_holder_department_id",
                principalTable: "departments",
                principalColumn: "department_id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_assets_employees_created_by",
                table: "assets",
                column: "created_by",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_assets_employees_current_holder_employee_id",
                table: "assets",
                column: "current_holder_employee_id",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_audit_cycle_assets_audit_cycles_audit_cycle_id",
                table: "audit_cycle_assets",
                column: "audit_cycle_id",
                principalTable: "audit_cycles",
                principalColumn: "audit_cycle_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_audit_cycle_assets_employees_verified_by",
                table: "audit_cycle_assets",
                column: "verified_by",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_audit_cycle_auditors_audit_cycles_audit_cycle_id",
                table: "audit_cycle_auditors",
                column: "audit_cycle_id",
                principalTable: "audit_cycles",
                principalColumn: "audit_cycle_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_audit_cycle_auditors_employees_auditor_id",
                table: "audit_cycle_auditors",
                column: "auditor_id",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_audit_cycles_departments_scope_department_id",
                table: "audit_cycles",
                column: "scope_department_id",
                principalTable: "departments",
                principalColumn: "department_id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_audit_cycles_employees_closed_by",
                table: "audit_cycles",
                column: "closed_by",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_audit_cycles_employees_created_by",
                table: "audit_cycles",
                column: "created_by",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_departments_employees_department_head_id",
                table: "departments",
                column: "department_head_id",
                principalTable: "employees",
                principalColumn: "employee_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_departments_clients_client_id",
                table: "departments");

            migrationBuilder.DropForeignKey(
                name: "fk_employees_clients_client_id",
                table: "employees");

            migrationBuilder.DropForeignKey(
                name: "fk_departments_employees_department_head_id",
                table: "departments");

            migrationBuilder.DropTable(
                name: "activity_logs");

            migrationBuilder.DropTable(
                name: "asset_allocations");

            migrationBuilder.DropTable(
                name: "asset_documents");

            migrationBuilder.DropTable(
                name: "asset_status_history");

            migrationBuilder.DropTable(
                name: "audit_cycle_assets");

            migrationBuilder.DropTable(
                name: "audit_cycle_auditors");

            migrationBuilder.DropTable(
                name: "discrepancy_reports");

            migrationBuilder.DropTable(
                name: "maintenance_status_log");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "resource_bookings");

            migrationBuilder.DropTable(
                name: "role_change_log");

            migrationBuilder.DropTable(
                name: "transfer_requests");

            migrationBuilder.DropTable(
                name: "audit_cycles");

            migrationBuilder.DropTable(
                name: "maintenance_requests");

            migrationBuilder.DropTable(
                name: "assets");

            migrationBuilder.DropTable(
                name: "asset_categories");

            migrationBuilder.DropTable(
                name: "clients");

            migrationBuilder.DropTable(
                name: "employees");

            migrationBuilder.DropTable(
                name: "departments");
        }
    }
}
