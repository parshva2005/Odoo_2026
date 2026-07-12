using Backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. TENANT & DATABASE CONFIGURATION
// ==========================================
builder.Services.AddHttpContextAccessor();

// Note: Make sure you have this class defined in your Services folder!
// builder.Services.AddScoped<ICurrentTenant, HttpCurrentTenantResolver>(); 

builder.Services.AddDbContext<AssetFlowDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ==========================================
// 2. JWT AUTHENTICATION
// ==========================================
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ThisIsAHighlySecureKeyForAssetFlowHackathon2026!@#";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// ==========================================
// 3. CORS (CRITICAL FOR FRONTEND)
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("HackathonCors", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ==========================================
// 4. CONTROLLERS & OPEN API (Scalar)
// ==========================================
builder.Services.AddControllers();
builder.Services.AddOpenApi(); // .NET 9/10 built-in OpenAPI

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// Fixed typo here: redirecting to /scalar instead of /scaler
app.MapGet("/", () => Results.Redirect("/scalar"));

app.UseHttpsRedirection();

// Middlewares must be in this exact order!
app.UseCors("HackathonCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();