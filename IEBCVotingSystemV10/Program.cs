using System.Text;
using IEBCVotingSystemV10;
using IEBCVotingSystemV10.Data;
using IEBCVotingSystemV10.Model;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionPolicy", policy =>
    {
        // In Production, allow the specific frontend URL provided in settings
        var frontendUrls = builder.Configuration["FRONTEND_BASE_URL"]?
                            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                           ?? new[] { "http://localhost:3000" };
        Console.WriteLine($"[CORS]: Allowing origins: {string.Join(", ", frontendUrls)}");

        policy.WithOrigins(frontendUrls)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// --- 1. CONFIGURATION & ENVIRONMENT ---
// Aspire handles environment variables; DotNetEnv is only needed for standalone local runs.
if (builder.Environment.IsDevelopment() && File.Exists(".env")) DotNetEnv.Env.Load();

builder.Configuration.AddEnvironmentVariables();

// handle null values
var signInKey = builder.Configuration["JWT_KEY"]
?? throw new InvalidOperationException("Missing JWT_KEY. Ensure it is provided via AppHost parameters.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"]
?? throw new InvalidOperationException("Missing Jwt:Issuer configuration.");
var jwtAudience = builder.Configuration["Jwt:Audience"]
?? throw new InvalidOperationException("Missing Jwt:Audience configuration.");

// --- 2. CORE SERVICES ---

// . Register the health check service
builder.Services.AddHealthChecks();

// Add services to the container.
builder.Services.AddControllersWithViews(options =>
{
    options.SuppressAsyncSuffixInActionNames = false;
})
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Register Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// --- 3. DATABASE & IDENTITY ---
var connectionString = builder.Configuration.GetConnectionString("votingdb")
    ?? throw new InvalidOperationException("Connection string 'votingdb' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddIdentity<ApplicationUser, AppUserRoles>(options =>
{
    options.SignIn.RequireConfirmedEmail = true;
    options.Password.RequireDigit = true;
})
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<IGenerateJwtBearerToken, GenerateJwtTokentService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// --- 4. AUTHENTICATION (JWT) ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signInKey))


    };
});


var app = builder.Build();

// --- 5. MIDDLEWARE PIPELINE ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("ProductionPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
