using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AssetFlowDbContext _context;

        public NotificationsController(AssetFlowDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out int id) ? id : 0;
        }

        // ==========================================
        // 1. GET MY NOTIFICATIONS (Employee View)
        // ==========================================

        [HttpGet("my-alerts")]
        public async Task<IActionResult> GetMyNotifications([FromQuery] bool unreadOnly = false)
        {
            var currentUserId = GetCurrentUserId();

            var query = _context.Notifications
                .Where(n => n.RecipientId == currentUserId);

            if (unreadOnly)
            {
                query = query.Where(n => !n.IsRead);
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(50) // Don't overwhelm the frontend payload
                .Select(n => new
                {
                    n.NotificationId,
                    n.Type,
                    n.Message,
                    n.IsRead,
                    n.ReferenceType,
                    n.ReferenceId,
                    n.CreatedAt
                })
                .ToListAsync();

            return Ok(notifications);
        }

        // ==========================================
        // 2. MARK NOTIFICATION AS READ
        // ==========================================

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var currentUserId = GetCurrentUserId();

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == id && n.RecipientId == currentUserId);

            if (notification == null) return NotFound("Notification not found.");

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Marked as read." });
        }

        // ==========================================
        // 3. GET GLOBAL ACTIVITY LOGS (Admin/Manager View)
        // ==========================================

        [HttpGet("activity-logs")]
        [Authorize(Roles = "Admin,AssetManager")]
        public async Task<IActionResult> GetActivityLogs([FromQuery] string? entityType)
        {
            var query = _context.ActivityLogs
                .Include(a => a.Actor)
                .AsQueryable();

            // Allow the frontend to filter logs (e.g., just show "Booking" logs or "Maintenance" logs)
            if (!string.IsNullOrWhiteSpace(entityType))
            {
                query = query.Where(a => a.EntityType == entityType);
            }

            var logs = await query
                .OrderByDescending(a => a.CreatedAt)
                .Take(100)
                .Select(a => new
                {
                    a.LogId,
                    ActorName = a.Actor != null ? a.Actor.Name : "System",
                    a.Action,
                    a.EntityType,
                    a.EntityId,
                    a.DetailsJson,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(logs);
        }
    }
}