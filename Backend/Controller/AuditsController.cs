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
    [Authorize]
    public class AuditsController : ControllerBase
    {
        private readonly AssetFlowDbContext _context;

        public AuditsController(AssetFlowDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out int id) ? id : 0;
        }

        // ==========================================
        // 1. CREATE AN AUDIT CYCLE
        // ==========================================

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAuditCycle([FromBody] CreateAuditCycleRequest request)
        {
            var currentUserId = GetCurrentUserId();

            var cycle = new AuditCycle
            {
                Name = request.Name,
                ScopeDepartmentId = request.ScopeDepartmentId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = AuditCycleStatus.Open,
                CreatedBy = currentUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.AuditCycles.Add(cycle);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Audit cycle created successfully.", AuditCycleId = cycle.AuditCycleId });
        }


        // ==========================================
        // 2. VERIFY AN ASSET & FLAG DISCREPANCIES
        // ==========================================

        [HttpPost("{auditCycleId}/verify")]
        [Authorize(Roles = "Admin,AssetManager")]
        public async Task<IActionResult> VerifyAsset(int auditCycleId, [FromBody] VerifyAssetRequest request)
        {
            var cycle = await _context.AuditCycles.FindAsync(auditCycleId);
            if (cycle == null) return NotFound("Audit cycle not found.");
            if (cycle.Status == AuditCycleStatus.Closed) return BadRequest("Cannot verify assets in a closed audit cycle.");

            var asset = await _context.Assets.FindAsync(request.AssetId);
            if (asset == null) return NotFound("Asset not found.");

            var currentUserId = GetCurrentUserId();

            // 1. Record the verification
            var auditAsset = new AuditCycleAsset
            {
                AuditCycleId = auditCycleId,
                AssetId = request.AssetId,
                VerificationStatus = request.VerificationStatus,
                VerifiedBy = currentUserId,
                VerifiedAt = DateTime.UtcNow,
                Notes = request.Notes
            };

            _context.AuditCycleAssets.Add(auditAsset);

            // 2. Auto-generate a Discrepancy Report if something is wrong
            if (request.VerificationStatus == VerificationStatus.Missing || request.VerificationStatus == VerificationStatus.Damaged)
            {
                var discrepancy = new DiscrepancyReport
                {
                    AuditCycleId = auditCycleId,
                    AssetId = request.AssetId,
                    DiscrepancyType = request.VerificationStatus == VerificationStatus.Missing
                        ? DiscrepancyType.Missing
                        : DiscrepancyType.Damaged,
                    ResolutionStatus = ResolutionStatus.Open,
                    Notes = request.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.DiscrepancyReports.Add(discrepancy);
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Asset marked as {request.VerificationStatus}." });
        }


        // ==========================================
        // 3. CLOSE CYCLE & APPLY GLOBAL STATUS UPDATES
        // ==========================================

        [HttpPut("{auditCycleId}/close")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CloseAuditCycle(int auditCycleId)
        {
            var cycle = await _context.AuditCycles
                .Include(c => c.DiscrepancyReports)
                .FirstOrDefaultAsync(c => c.AuditCycleId == auditCycleId);

            if (cycle == null) return NotFound("Audit cycle not found.");
            if (cycle.Status == AuditCycleStatus.Closed) return BadRequest("Audit cycle is already closed.");

            // 1. Lock the cycle
            cycle.Status = AuditCycleStatus.Closed;
            cycle.ClosedBy = GetCurrentUserId();
            cycle.ClosedAt = DateTime.UtcNow;

            // 2. The ERP Side-Effect: Update actual asset statuses based on discrepancies
            foreach (var report in cycle.DiscrepancyReports.Where(r => r.ResolutionStatus == ResolutionStatus.Open))
            {
                var asset = await _context.Assets.FindAsync(report.AssetId);
                if (asset != null)
                {
                    if (report.DiscrepancyType == DiscrepancyType.Missing)
                    {
                        asset.Status = AssetStatus.Lost;
                        // Strip the current holder since the item is gone
                        asset.CurrentHolderEmployeeId = null;
                        asset.CurrentHolderDepartmentId = null;
                    }
                    // If it's Damaged, you might want to leave it Allocated but flag it, 
                    // or automatically raise a Maintenance Request here!
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Audit cycle closed. Asset statuses have been updated.",
                DiscrepanciesFound = cycle.DiscrepancyReports.Count
            });
        }
    }

    // ==========================================
    // DTOs
    // ==========================================
    public class CreateAuditCycleRequest
    {
        public string Name { get; set; } = string.Empty;
        public int? ScopeDepartmentId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
    }

    public class VerifyAssetRequest
    {
        public int AssetId { get; set; }
        public VerificationStatus VerificationStatus { get; set; }
        public string? Notes { get; set; }
    }
}