using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Reflection;
using System.Text;

namespace Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
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

            try
            {
                app.MapControllers();
            }
            catch (ReflectionTypeLoadException ex)
            {
                Console.WriteLine("ReflectionTypeLoadException:");

                foreach (var loaderException in ex.LoaderExceptions)
                {
                    Console.WriteLine(loaderException?.Message);
                }

                throw;
            }

            app.Run();        }
    }
}