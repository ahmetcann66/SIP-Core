using Microsoft.EntityFrameworkCore;
using SipCore.Api.Middleware;
using SipCore.Api.Services;
using SipCore.Data;
using SipCore.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Configuration: MySQL connection (replace with your values)
var conn = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Server=localhost;Database=sip_core_db;User=root;Password=secret;";
var mysqlVersion = builder.Configuration["Database:MySqlVersion"] ?? "8.0.36";
var parsed = Version.Parse(mysqlVersion);
var serverVersion = new MySqlServerVersion(parsed);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(conn, serverVersion));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IEnglishHubStateRepository, EnglishHubStateRepository>();
builder.Services.AddScoped<IEnglishHubStateService, EnglishHubStateService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
