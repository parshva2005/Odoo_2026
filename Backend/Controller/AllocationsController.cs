using AssetFlow.Domain.Entities;
using AssetFlow.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AllocationsController : ControllerBase
    {
        private readonly AssetFlowDbContext _context;

        public AllocationsController(AssetFlowDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out int id) ? id : 0;
        }

        // ==========================================
        // 1. ALLOCATE ASSET (With Double-Allocation Guard)
        // ==========================================
        [HttpPost("allocate")]
        [Authorize(Roles = "Admin,AssetManager,DepartmentHead")]
        public async Task<IActionResult> AllocateAsset([FromBody] AllocateRequest request)
        {
            // Include CurrentHolderEmployee to get their name if it's already taken
            var asset = await _context.Assets
                .Include(a => a.CurrentHolderEmployee)
                .FirstOrDefaultAsync(a => a.AssetId == request.AssetId);

            if (asset == null) return NotFound("Asset not found.");

            // THE DOUBLE-ALLOCATION GUARD
            if (asset.Status != AssetStatus.Available)
            {
                var holderName = asset.CurrentHolderEmployee?.Name ?? "Another Department/User";

                // Return a 409 Conflict with the exact data the frontend needs to trigger the Transfer UI
                return StatusCode(409, new
                {
                    Message = "Allocation blocked.",
                    IsAllocated = true,
                    CurrentHolder = holderName,
                    Suggestion = "Please initiate a Transfer Request instead."
                });
            }

            // If we pass the guard, proceed with the allocation
            var currentUserId = GetCurrentUserId();

            var allocation = new AssetAllocation
            {
                AssetId = asset.AssetId,
                EmployeeId = request.EmployeeId,
                DepartmentId = request.DepartmentId,
                AllocatedBy = currentUserId,
                AllocatedAt = DateTime.UtcNow,
                ExpectedReturnDate = request.ExpectedReturnDate,
                Status = AllocationStatus.Active
            };

            // Update the Asset's state machine
            asset.Status = AssetStatus.Allocated;
            asset.CurrentHolderEmployeeId = request.EmployeeId;
            asset.CurrentHolderDepartmentId = request.DepartmentId;
            asset.UpdatedAt = DateTime.UtcNow;

            _context.AssetAllocations.Add(allocation);

            // EF Core SaveChanges is naturally transactional. It updates the Asset and 
            // creates the Allocation together. If one fails, they both roll back.
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Asset allocated successfully." });
        }


        // ==========================================
        // 2. INITIATE A TRANSFER REQUEST
        // ==========================================
        [HttpPost("transfer-request")]
        public async Task<IActionResult> RequestTransfer([FromBody] TransferDataRequest request)
        {
            var asset = await _context.Assets.FindAsync(request.AssetId);
            if (asset == null || asset.CurrentHolderEmployeeId == null)
                return BadRequest("Asset is not currently held by an employee.");

            var currentUserId = GetCurrentUserId();

            var transfer = new TransferRequest
            {
                AssetId = asset.AssetId,
                FromEmployeeId = asset.CurrentHolderEmployeeId, // The person who has it now
                ToEmployeeId = request.ToEmployeeId,            // The person who wants it
                RequestedBy = currentUserId,
                RequestedAt = DateTime.UtcNow,
                Status = TransferStatus.Requested,
                Notes = request.Notes
            };

            _context.TransferRequests.Add(transfer);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Transfer request submitted for approval." });
        }


        // ==========================================
        // 3. RETURN AN ASSET
        // ==========================================
        [HttpPost("{assetId}/return")]
        [Authorize(Roles = "Admin,AssetManager")]
        public async Task<IActionResult> ReturnAsset(int assetId, [FromBody] ReturnAssetRequest request)
        {
            var asset = await _context.Assets.FindAsync(assetId);
            if (asset == null) return NotFound("Asset not found.");

            // Find the currently active allocation record
            var activeAllocation = await _context.AssetAllocations
                .FirstOrDefaultAsync(a => a.AssetId == assetId && a.Status == AllocationStatus.Active);

            if (activeAllocation != null)
            {
                activeAllocation.Status = AllocationStatus.Returned;
                activeAllocation.ActualReturnDate = DateOnly.FromDateTime(DateTime.UtcNow);
                activeAllocation.ReturnConditionNotes = request.ReturnConditionNotes;
            }

            // Revert asset to available
            asset.Status = AssetStatus.Available;
            asset.CurrentHolderEmployeeId = null;
            asset.CurrentHolderDepartmentId = null;
            asset.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Asset returned successfully and is now Available." });
        }
    }

    // ==========================================
    // DTOs
    // ==========================================
    public class AllocateRequest
    {
        public int AssetId { get; set; }
        public int? EmployeeId { get; set; }
        public int? DepartmentId { get; set; }
        public DateOnly? ExpectedReturnDate { get; set; }
    }

    public class TransferDataRequest
    {
        public int AssetId { get; set; }
        public int ToEmployeeId { get; set; }
        public string? Notes { get; set; }
    }

    public class ReturnAssetRequest
    {
        public string? ReturnConditionNotes { get; set; }
    }
}