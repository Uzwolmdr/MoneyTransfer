using System.Data;
using Microsoft.Data.SqlClient;
using MoneyTransfer.DAL.ADO;
using MoneyTransfer.DAL.Dapper;
using MoneyTransfer.DAL.StoredProcedure;
using MoneyTransfer.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Return detailed validation errors
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => new
                {
                    field = x.Key,
                    message = e.ErrorMessage
                }))
                .ToList();

            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new
            {
                error = "Validation failed",
                details = errors
            });
        };
    });

// Database connection
builder.Services.AddScoped<IDbConnection>(sp =>
{
    var connectionString = sp.GetRequiredService<IConfiguration>().GetConnectionString("Default");
    if (string.IsNullOrEmpty(connectionString))
    {
        throw new InvalidOperationException("Connection string 'Default' is not configured.");
    }
    return new SqlConnection(connectionString);
});

// Repositories and services
builder.Services.AddScoped<ContactsRepository>();
builder.Services.AddScoped<WalletRepository>();
builder.Services.AddScoped<TransactionsRepository>();
builder.Services.AddScoped<SendMoneyService>();

// CORS - Configure for both development and production
builder.Services.AddCors(opt =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
        ?? new[] { "http://localhost:5173" }; // Default to dev port
    
    opt.AddPolicy("AllowReact", p =>
        p.WithOrigins(allowedOrigins)
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());
});

// Optional: Serve static files from React build (if frontend is in wwwroot)
// Uncomment if you want to serve React app from the same .NET server
// builder.Services.AddStaticFiles();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseCors("AllowReact");

// Serve static files in production (if React app is in wwwroot folder)
// Uncomment these lines if you want to serve React from the same server:
// if (app.Environment.IsProduction())
// {
//     app.UseStaticFiles();
//     app.UseDefaultFiles(); // Serves index.html for SPA routing
// }

app.MapControllers();
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.Run();
