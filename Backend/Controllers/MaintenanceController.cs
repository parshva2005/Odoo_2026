using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaintenanceController : ControllerBase
    {
            private readonly AssetFlowDbContext _context;

            public MaintenanceController(AssetFlowDbContext context)
            {
                _context = context;
            }

            private int GetCurrentUserId()
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return int.TryParse(claim, out int id) ? id : 0;
            }

            // ==========================================
            // 1. GET MAINTENANCE BOARD (Screen 7 Kanban)
            // ==========================================

            [HttpGet]
            public async Task<IActionResult> GetMaintenanceBoard()
            {
                var requests = await _context.MaintenanceRequests
                    .Include(m => m.Asset)
                    .Include(m => m.RaisedByEmployee)
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new
                    {
                        m.RequestId,
                        AssetTag = m.Asset.AssetTag,
                        AssetName = m.Asset.Name,
                        m.IssueDescription,
                        m.Priority,
                        m.Status,
                        m.TechnicianName,
                        RaisedBy = m.RaisedByEmployee.Name,
                        m.CreatedAt
                    })
                    .ToListAsync();

                // Grouping by status makes it effortless for the frontend to render the columns
                var kanbanBoard = new
                {
                    Pending = requests.Where(r => r.Status == MaintenanceStatus.Pending),
                    Approved = requests.Where(r => r.Status == MaintenanceStatus.Approved),
                    TechnicianAssigned = requests.Where(r => r.Status == MaintenanceStatus.TechnicianAssigned),
                    InProgress = requests.Where(r => r.Status == MaintenanceStatus.InProgress),
                    Resolved = requests.Where(r => r.Status == MaintenanceStatus.Resolved)
                };

                return Ok(kanbanBoard);
            }

            // ==========================================
            // 2. RAISE A NEW MAINTENANCE TICKET
            // ==========================================

            [HttpPost]
            public async Task<IActionResult> RaiseRequest([FromBody] RaiseMaintenanceRequest request)
            {
                var asset = await _context.Assets.FindAsync(request.AssetId);
                if (asset == null) return NotFound("Asset not found.");

                var currentUserId = GetCurrentUserId();

                var maintenanceRequest = new MaintenanceRequest
                {
                    AssetId = request.AssetId,
                    RaisedBy = currentUserId,
                    IssueDescription = request.IssueDescription,
                    Priority = request.Priority,
                    PhotoUrl = request.PhotoUrl,
                    Status = MaintenanceStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                _context.MaintenanceRequests.Add(maintenanceRequest);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Maintenance request raised successfully.", RequestId = maintenanceRequest.RequestId });
            }

            // ==========================================
            // 3. UPDATE STATUS (The ERP Side-Effect Engine)
            // ==========================================

            [HttpPut("{requestId}/status")]
            [Authorize(Roles = "Admin,AssetManager")] // Only managers can move cards to approved
            public async Task<IActionResult> UpdateStatus(int requestId, [FromBody] UpdateMaintenanceStatusRequest request)
            {
                var maintenanceRecord = await _context.MaintenanceRequests
                    .Include(m => m.Asset)
                    .FirstOrDefaultAsync(m => m.RequestId == requestId);

                if (maintenanceRecord == null) return NotFound("Maintenance request not found.");

                var oldStatus = maintenanceRecord.Status;
                var newStatus = request.NewStatus;
                var currentUserId = GetCurrentUserId();

                if (oldStatus == newStatus) return Ok(new { Message = "Status is already set to this value." });

                // 1. Update the Maintenance Ticket
                maintenanceRecord.Status = newStatus;
                if (request.TechnicianName != null) maintenanceRecord.TechnicianName = request.TechnicianName;

                // 2. State Machine Side-Effects on the actual Asset
                if (newStatus == MaintenanceStatus.Approved || newStatus == MaintenanceStatus.InProgress)
                {
                    maintenanceRecord.ApprovedBy = currentUserId;
                    maintenanceRecord.ApprovedAt = DateTime.UtcNow;
                    maintenanceRecord.Asset.Status = AssetStatus.UnderMaintenance; // Locks the asset out of allocations
                }
                else if (newStatus == MaintenanceStatus.Resolved)
                {
                    maintenanceRecord.ResolvedAt = DateTime.UtcNow;
                    maintenanceRecord.Asset.Status = AssetStatus.Available; // Returns the asset to circulation
                }

                // 3. Log the status change
                var statusLog = new MaintenanceStatusLog
                {
                    RequestId = maintenanceRecord.RequestId,
                    FromStatus = oldStatus,
                    ToStatus = newStatus,
                    ChangedBy = currentUserId,
                    ChangedAt = DateTime.UtcNow
                };

                _context.MaintenanceStatusLogs.Add(statusLog);

                // 4. Save everything in one EF Core transaction
                await _context.SaveChangesAsync();

                return Ok(new { Message = $"Ticket successfully moved to {newStatus}." });
            }
        }

        // ==========================================
        // DTOs
        // ==========================================
        public class RaiseMaintenanceRequest
        {
            public int AssetId { get; set; }
            public string IssueDescription { get; set; } = string.Empty;
            public MaintenancePriority Priority { get; set; }
            public string? PhotoUrl { get; set; }
        }

        public class UpdateMaintenanceStatusRequest
        {
            public MaintenanceStatus NewStatus { get; set; }
            public string? TechnicianName { get; set; }
        }
}
