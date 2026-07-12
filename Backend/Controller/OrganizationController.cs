using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Strictly limits this entire controller to Admins
    public class OrganizationController : ControllerBase
    {
        private readonly AssetFlowDbContext _context;

        public OrganizationController(AssetFlowDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // TAB A: DEPARTMENT MANAGEMENT
        // ==========================================

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var departments = await _context.Departments
                .Include(d => d.DepartmentHead)
                .Select(d => new
                {
                    d.DepartmentId,
                    d.Name,
                    d.Status,
                    ParentDepartmentId = d.ParentDepartmentId,
                    DepartmentHeadName = d.DepartmentHead != null ? d.DepartmentHead.Name : "Unassigned"
                })
                .ToListAsync();

            return Ok(departments);
        }

        [HttpPost("departments")]
        public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentRequest request)
        {
            var dept = new Department
            {
                Name = request.Name,
                ParentDepartmentId = request.ParentDepartmentId,
                DepartmentHeadId = request.DepartmentHeadId,
                Status = ActiveStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Departments.Add(dept);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Department created successfully.", DepartmentId = dept.DepartmentId });
        }


        // ==========================================
        // TAB B: ASSET CATEGORY MANAGEMENT
        // ==========================================

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.AssetCategories
                .Select(c => new { c.CategoryId, c.Name, c.Description, c.Status })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            // Optional: You could parse request.CustomFields into a JSON string here
            var category = new AssetCategory
            {
                Name = request.Name,
                Description = request.Description,
                CustomFieldsJson = request.CustomFieldsJson, // e.g., '["WarrantyPeriod", "Brand"]'
                Status = ActiveStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            _context.AssetCategories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Category created successfully.", CategoryId = category.CategoryId });
        }


        // ==========================================
        // TAB C: EMPLOYEE DIRECTORY & ROLE PROMOTION
        // ==========================================

        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            var employees = await _context.Employees
                .Include(e => e.Department)
                .Select(e => new
                {
                    e.EmployeeId,
                    e.Name,
                    e.Email,
                    e.Role,
                    e.Status,
                    DepartmentName = e.Department != null ? e.Department.Name : "Unassigned"
                })
                .ToListAsync();

            return Ok(employees);
        }

        [HttpPut("employees/{id}/role")]
        public async Task<IActionResult> ChangeEmployeeRole(int id, [FromBody] ChangeRoleRequest request)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound("Employee not found.");

            var oldRole = employee.Role;

            // Get the Admin's ID who is making this change (from the JWT token)
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(adminIdClaim, out int adminId);

            // 1. Update the role
            employee.Role = request.NewRole;
            employee.UpdatedAt = DateTime.UtcNow;

            // 2. Log the change for audit purposes (Crucial for ERP architecture)
            var auditLog = new RoleChangeLog
            {
                EmployeeId = employee.EmployeeId,
                OldRole = oldRole,
                NewRole = request.NewRole,
                ChangedBy = adminId,
                ChangedAt = DateTime.UtcNow
            };

            _context.RoleChangeLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Role updated from {oldRole} to {request.NewRole} successfully." });
        }
    }

    // ==========================================
    // DTOs (Data Transfer Objects)
    // ==========================================
    public class CreateDepartmentRequest
    {
        public string Name { get; set; } = string.Empty;
        public int? ParentDepartmentId { get; set; }
        public int? DepartmentHeadId { get; set; }
    }

    public class CreateCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CustomFieldsJson { get; set; }
    }

    public class ChangeRoleRequest
    {
        public EmployeeRole NewRole { get; set; }
    }
}