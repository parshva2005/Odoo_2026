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
    [Authorize] // Requires login, but specific endpoints will have stricter role checks
    public class AssetsController : ControllerBase
    {
        private readonly AssetFlowDbContext _context;

        public AssetsController(AssetFlowDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. REGISTER A NEW ASSET
        // ==========================================

        [HttpPost]
        [Authorize(Roles = "Admin,AssetManager")] // Strict restriction
        public async Task<IActionResult> RegisterAsset([FromBody] RegisterAssetRequest request)
        {
            // Extract the user ID from the JWT to log who created the asset
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdClaim, out int createdById);

            // Generate the Asset Tag (e.g., AF-0001)
            // Note: In a massive enterprise system, we'd use a database sequence to prevent race conditions.
            // For a hackathon, counting existing records is perfectly fine.
            var assetCount = await _context.Assets.IgnoreQueryFilters().CountAsync();
            var nextNumber = assetCount + 1;
            var assetTag = $"AF-{nextNumber:D4}";

            var asset = new Asset
            {
                AssetTag = assetTag,
                Name = request.Name,
                CategoryId = request.CategoryId,
                SerialNumber = request.SerialNumber,
                AcquisitionDate = request.AcquisitionDate,
                AcquisitionCost = request.AcquisitionCost,
                Condition = request.Condition,
                Location = request.Location,
                IsBookable = request.IsBookable,
                // Business Logic: All new assets enter the system as Available
                Status = AssetStatus.Available,
                CreatedBy = createdById != 0 ? createdById : null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Asset registered successfully.", AssetTag = asset.AssetTag });
        }

        // ==========================================
        // 2. SEARCH & DIRECTORY
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> GetAssets(
            [FromQuery] string? search, // Can be Name, Tag, or Serial Number
            [FromQuery] int? categoryId,
            [FromQuery] AssetStatus? status,
            [FromQuery] string? location)
        {
            // Start building the query dynamically
            var query = _context.Assets
                .Include(a => a.Category)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(a =>
                    a.Name.ToLower().Contains(lowerSearch) ||
                    a.AssetTag.ToLower().Contains(lowerSearch) ||
                    (a.SerialNumber != null && a.SerialNumber.ToLower().Contains(lowerSearch)));
            }

            if (categoryId.HasValue)
                query = query.Where(a => a.CategoryId == categoryId.Value);

            if (status.HasValue)
                query = query.Where(a => a.Status == status.Value);

            if (!string.IsNullOrWhiteSpace(location))
                query = query.Where(a => a.Location != null && a.Location.Contains(location));

            // Execute the query and project the results for the frontend table
            var results = await query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.AssetId,
                    a.AssetTag,
                    a.Name,
                    CategoryName = a.Category.Name,
                    a.Status,
                    a.Location,
                    a.Condition
                })
                .ToListAsync();

            return Ok(results);
        }

        // ==========================================
        // 3. ASSET DETAILS & HISTORY
        // ==========================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAssetDetails(int id)
        {
            var asset = await _context.Assets
                .Include(a => a.Category)
                .Include(a => a.CurrentHolderEmployee)
                .Include(a => a.CurrentHolderDepartment)
                .Include(a => a.Allocations.OrderByDescending(al => al.AllocatedAt).Take(5)) // Get recent allocations
                .Include(a => a.MaintenanceRequests.OrderByDescending(m => m.CreatedAt).Take(5)) // Get recent maintenance
                .FirstOrDefaultAsync(a => a.AssetId == id);

            if (asset == null) return NotFound("Asset not found.");

            return Ok(new
            {
                asset.AssetTag,
                asset.Name,
                Category = asset.Category.Name,
                asset.SerialNumber,
                asset.Status,
                asset.Location,
                asset.IsBookable,
                CurrentHolder = asset.CurrentHolderEmployee?.Name ?? asset.CurrentHolderDepartment?.Name ?? "None",
                RecentAllocations = asset.Allocations.Select(al => new { al.AllocationId, al.AllocatedAt, al.ExpectedReturnDate, al.Status }),
                RecentMaintenance = asset.MaintenanceRequests.Select(m => new { m.RequestId, m.IssueDescription, m.Status, m.CreatedAt })
            });
        }
    }

    // ==========================================
    // DTO
    // ==========================================
    public class RegisterAssetRequest
    {
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public string? SerialNumber { get; set; }
        public DateOnly? AcquisitionDate { get; set; }
        public decimal? AcquisitionCost { get; set; }
        public AssetCondition? Condition { get; set; }
        public string? Location { get; set; }
        public bool IsBookable { get; set; }
    }
}