var builder = DistributedApplication.CreateBuilder(args);

// Use external Neon PostgreSQL database
var db = builder.AddConnectionString("votingdb");
var jwtKey = builder.Configuration["JWT_KEY"];
var api = builder.AddProject<Projects.IEBCVotingSystemV10>("api")
    .WithEnvironment("JWT_KEY", jwtKey) // This maps the Host's key to the API
    .WithReference(db)
    .WithHttpHealthCheck("/health")
    .WithEndpoint(
        targetPort: 5007,
        port: 5007,
        scheme: "http",
        name: "api-http",
        isProxied: false)
    .WithExternalHttpEndpoints();

if (builder.ExecutionContext.IsPublishMode)
{
    //Build and run frontend as Docker container
    builder.AddDockerfile("frontend", "../iebc-voting-system-frontend")
        .WithHttpEndpoint(targetPort: 3000, env: "PORT")
        .WithReference(api);
}
else
{
    //local dev:run with npm dev




    builder.AddNpmApp("frontend", "../iebc-voting-system-frontend", "dev")
            .WithReference(api) // Injects the API URL into the frontend
            .WithEnvironment("NEXT_PUBLIC_API_URL", "http://192.168.100.34:5007")
            .WithHttpEndpoint(targetPort: 3000, port: 3000, env: "PORT", isProxied: false) // Bind frontend to 3000 externally without proxying
            .WithExternalHttpEndpoints();

}
//Pass external URL for email links
api.WithEnvironment("FRONTEND_BASE_URL", "http://192.168.100.34:3000");

builder.AddDockerComposeEnvironment("docker-env");


builder.Build().Run();