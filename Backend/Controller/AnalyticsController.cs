using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,AssetManager,DepartmentHead")] // Restrict analytics to leadership
    public class AnalyticsController : ControllerBase
    {
        private readonly AssetFlowDbContext _context;

        public AnalyticsController(AssetFlowDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. UTILIZATION BY DEPARTMENT (Bar Chart)
        // ==========================================

        [HttpGet("utilization-by-department")]
        public async Task<IActionResult> GetUtilizationByDepartment()
        {
            // We count assets directly held by the department OR held by employees in that department
            var utilization = await _context.Departments
                .Select(d => new
                {
                    DepartmentName = d.Name,
                    AllocatedCount = _context.Assets.Count(a =>
                        a.CurrentHolderDepartmentId == d.DepartmentId ||
                        a.CurrentHolderEmployee!.DepartmentId == d.DepartmentId)
                })
                .Where(d => d.AllocatedCount > 0) // Only return departments that actually have assets
                .OrderByDescending(d => d.AllocatedCount)
                .ToListAsync();

            return Ok(utilization);
        }

        // ==========================================
        // 2. MAINTENANCE FREQUENCY (Line/Pie Chart)
        // ==========================================

        [HttpGet("maintenance-frequency")]
        public async Task<IActionResult> GetMaintenanceFrequency()
        {
            // Group by Category to see if Electronics break more often than Furniture
            var frequency = await _context.MaintenanceRequests
                .Include(m => m.Asset)
                .ThenInclude(a => a.Category)
                .GroupBy(m => m.Asset.Category.Name)
                .Select(g => new
                {
                    CategoryName = g.Key,
                    TotalRequests = g.Count()
                })
                .OrderByDescending(x => x.TotalRequests)
                .ToListAsync();

            return Ok(frequency);
        }

        // ==========================================
        // 3. MOST USED VS IDLE ASSETS (List/Cards)
        // ==========================================

        [HttpGet("asset-insights")]
        public async Task<IActionResult> GetAssetInsights()
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            // Idle: Available, and hasn't changed state in 30+ days
            var idleAssets = await _context.Assets
                .Where(a => a.Status == AssetStatus.Available && a.UpdatedAt < thirtyDaysAgo)
                .OrderBy(a => a.UpdatedAt)
                .Take(5)
                .Select(a => new
                {
                    a.AssetTag,
                    a.Name,
                    LastActive = a.UpdatedAt
                })
                .ToListAsync();

            // Most Used: Count the total historical allocations per asset
            var mostUsedAssets = await _context.Assets
                .Select(a => new
                {
                    a.AssetTag,
                    a.Name,
                    UsageCount = a.Allocations.Count + a.Bookings.Count
                })
                .OrderByDescending(a => a.UsageCount)
                .Take(5)
                .ToListAsync();

            return Ok(new { IdleAssets = idleAssets, MostUsedAssets = mostUsedAssets });
        }

        // ==========================================
        // 4. RESOURCE BOOKING HEATMAP
        // ==========================================

        [HttpGet("booking-heatmap")]
        public async Task<IActionResult> GetBookingHeatmap()
        {
            // Pull bookings from the last 90 days to establish a trend
            var ninetyDaysAgo = DateTime.UtcNow.AddDays(-90);

            var bookings = await _context.ResourceBookings
                .Where(b => b.StartTime >= ninetyDaysAgo && b.Status != BookingStatus.Cancelled)
                .Select(b => new { b.StartTime })
                .ToListAsync();

            // Perform the time-extraction grouping in memory because EF Core 
            // sometimes struggles to translate date-part extraction perfectly to all SQL dialects.
            // Since we are only pulling a single datetime column, the memory footprint is tiny.
            var heatmap = bookings
                .GroupBy(b => b.StartTime.ToLocalTime().Hour)
                .Select(g => new
                {
                    HourOfDay = g.Key,
                    BookingCount = g.Count()
                })
                .OrderBy(h => h.HourOfDay)
                .ToList();

            return Ok(heatmap);
        }
    }
}