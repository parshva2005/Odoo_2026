using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AssetFlowDbContext _context;

        public DashboardController(AssetFlowDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardSummary()
        {
            // Capture 'today' once to ensure all queries use the exact same reference point
            var today = DateTime.UtcNow.Date;
            var todayDateOnly = DateOnly.FromDateTime(today);

            // ==========================================
            // 1. KPI COUNTS
            // ==========================================
            var availableCount = await _context.Assets.CountAsync(a => a.Status == AssetStatus.Available);

            var allocatedCount = await _context.Assets.CountAsync(a => a.Status == AssetStatus.Allocated);

            // Only count maintenance requests raised today
            var maintenanceTodayCount = await _context.MaintenanceRequests.CountAsync(m => m.CreatedAt.Date == today);

            var activeBookingsCount = await _context.ResourceBookings.CountAsync(b =>
                b.Status == BookingStatus.Ongoing || b.Status == BookingStatus.Upcoming);

            var pendingTransfersCount = await _context.TransferRequests.CountAsync(t =>
                t.Status == TransferStatus.Requested);

            var upcomingReturnsCount = await _context.AssetAllocations.CountAsync(a =>
                a.Status == AllocationStatus.Active &&
                a.ExpectedReturnDate.HasValue &&
                a.ExpectedReturnDate.Value >= todayDateOnly);

            // ==========================================
            // 2. ACTIONABLE ALERTS (Overdue Returns)
            // ==========================================
            var overdueAllocations = await _context.AssetAllocations
                .Include(a => a.Asset)
                .Include(a => a.Employee)
                .Where(a => a.Status == AllocationStatus.Active &&
                            a.ExpectedReturnDate.HasValue &&
                            a.ExpectedReturnDate.Value < todayDateOnly)
                .Select(a => new
                {
                    a.Asset.AssetTag,
                    a.Asset.Name,
                    CurrentHolder = a.Employee != null ? a.Employee.Name : "Unknown",
                    a.ExpectedReturnDate
                })
                .ToListAsync();

            // ==========================================
            // 3. RECENT ACTIVITY FEED
            // ==========================================
            var recentActivity = await _context.ActivityLogs
                .Include(a => a.Actor)
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .Select(a => new
                {
                    Action = a.Action,
                    EntityType = a.EntityType,
                    ActorName = a.Actor != null ? a.Actor.Name : "System",
                    Timestamp = a.CreatedAt
                })
                .ToListAsync();

            // Assemble the master payload directly mirroring the Screen 2 wireframe
            return Ok(new
            {
                KPIs = new
                {
                    Available = availableCount,
                    Allocated = allocatedCount,
                    MaintenanceToday = maintenanceTodayCount,
                    ActiveBookings = activeBookingsCount,
                    PendingTransfers = pendingTransfersCount,
                    UpcomingReturns = upcomingReturnsCount
                },
                OverdueReturns = overdueAllocations,
                RecentActivity = recentActivity
            });
        }
    }
}