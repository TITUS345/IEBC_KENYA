using System.Text;
using IEBCVotingSystemV10;
using IEBCVotingSystemV10.Data;
//using IEBCVotingSystemV10.DataSeeder;
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
//uncheck for production
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowNextJS",
//         policy => policy.WithOrigins("http://localhost:3000") // Your UI URL
//                         .AllowAnyMethod()
//                         .AllowAnyHeader());
// });

//comment on production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

//---1. CONFIGURATION & ENVIRONMENT---
DotNetEnv.Env.Load(); // This reads your .env file

builder.Configuration.AddEnvironmentVariables();

//handle null vallues
var signInKey = builder.Configuration["JWT_KEY"]
?? throw new InvalidOperationException("Missing or invalid signin key");

// --- 2. CORE SERVICES ---

// . Register the health check service
builder.Services.AddHealthChecks();
// . Add Aspire Service Defaults (Important!)
builder.AddServiceDefaults();

// Add services to the container.
builder.Services.AddControllers()
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
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("votingdb")));

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
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signInKey))


    };
});


var app = builder.Build();

// using (var scope = app.Services.CreateScope())
// {
//     var services = scope.ServiceProvider;
//     await DataSeeder.SeedRolesAsync(services);
// }

// --- 5. MIDDLEWARE PIPELINE ---
app.MapDefaultEndpoints();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}



app.UseCors("AllowAll");
// app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();


