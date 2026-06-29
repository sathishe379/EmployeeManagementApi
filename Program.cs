using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using EmployeeManagementApi.Data;
using EmployeeManagementApi.Middleware;
using EmployeeManagementApi.Repositories;
using EmployeeManagementApi.Services.Implementations;
using EmployeeManagementApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Employee Management API",
        Version = "v1",
        Description = "API for managing employees, departments, and authentication"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database - InMemory for development, PostgreSQL for production
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("EmployeeManagementDb"));

// Repositories
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();

// Services
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddAuthorization();

// CORS for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Seed data for InMemory database (data is not persisted across restarts)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Departments.Any())
    {
        db.Departments.AddRange(
            new EmployeeManagementApi.Models.Department { Name = "Engineering", Description = "Software development and engineering" },
            new EmployeeManagementApi.Models.Department { Name = "Human Resources", Description = "HR and people operations" },
            new EmployeeManagementApi.Models.Department { Name = "Finance", Description = "Financial planning and accounting" },
            new EmployeeManagementApi.Models.Department { Name = "Marketing", Description = "Marketing and communications" }
        );
        db.SaveChanges();
    }

    if (!db.Users.Any())
    {
        db.Users.Add(new EmployeeManagementApi.Models.User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Email = "admin@ems.com",
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Employee Management API v1");
        options.RoutePrefix = "swagger";
    });
}

// Global Exception Handling Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("ReactApp");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
