using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AssetFlowDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AssetFlowDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupRequest request)
        {
            // 1. Logic Check: Does the email already exist for this tenant?
            var existingUser = await _context.Employees
                .FirstOrDefaultAsync(e => e.Email == request.Email && e.ClientId == request.ClientId);

            if (existingUser != null)
                return BadRequest("An account with this email already exists in this organization.");

            // 2. Create the Employee. 
            // Note: Role is strictly forced to Employee. Admins must promote later.
            var newEmployee = new Employee
            {
                ClientId = request.ClientId,
                Name = request.Name,
                Email = request.Email,
                // In a production app, use BCrypt to hash this! Keeping it simple for architecture focus.
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = EmployeeRole.Employee,
                Status = ActiveStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Employees.Add(newEmployee);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Account created successfully. Please log in." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. Find the user across the database
            var user = await _context.Employees
                .FirstOrDefaultAsync(e => e.Email == request.Email);

            // 2. Validate user and password
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password.");

            if (user.Status == ActiveStatus.Inactive)
                return Unauthorized("This account has been deactivated.");

            // 3. Generate the JWT with the critical 'client_id' claim
            var token = GenerateJwtToken(user);

            return Ok(new
            {
                Token = token,
                User = new { user.EmployeeId, user.Name, user.Email, user.Role, user.ClientId }
            });
        }

        private string GenerateJwtToken(Employee user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.EmployeeId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("role", user.Role.ToString()),
                // THIS IS CRITICAL: Your ICurrentTenant service relies on this claim to filter data
                new Claim("client_id", user.ClientId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // DTOs for the requests
    public class SignupRequest
    {
        public Guid ClientId { get; set; } // Passed from frontend based on the organization signing up for
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}