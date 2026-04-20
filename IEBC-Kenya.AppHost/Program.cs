var builder = DistributedApplication.CreateBuilder(args);

// Use external Neon PostgreSQL database
var db = builder.AddConnectionString("votingdb");

// Use a parameter for the JWT Key so azd can prompt for it or use secrets
var jwtKey = builder.AddParameter("jwt-key", secret: true);

var api = builder.AddProject<Projects.IEBCVotingSystemV10>("api")
    .WithEnvironment("JWT_KEY", jwtKey)
    .WithReference(db)
    .WithHttpHealthCheck("/health")
    .WithHttpEndpoint(targetPort: 5007, name: "api-http");

// Define the frontend using AddDockerfile
// This avoids the 'executable.v0' error because azd can host Docker containers, but not raw host executables.
var frontend = builder.AddDockerfile("frontend", "../iebc-voting-system-frontend")
    .WithReference(api)
    // Inject the internal URL of the API into the frontend
    .WithEnvironment("BACKEND_URL", api.GetEndpoint("api-http"))
    .WithHttpEndpoint(targetPort: 3000, env: "PORT")
    .WithExternalHttpEndpoints();

// Link the frontend URL back to the API for email verification links
api.WithEnvironment("FRONTEND_BASE_URL", frontend.GetEndpoint("http"));

builder.Build().Run();