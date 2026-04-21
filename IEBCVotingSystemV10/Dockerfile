# Use the .NET 10.0 SDK to match your project's TargetFramework
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy and restore
COPY ["IEBCVotingSystemV10.csproj", "./"]
# Note: If this project references IEBC-Kenya.ServiceDefaults, you must 
# ensure the build context includes that directory as well.
RUN dotnet restore "IEBCVotingSystemV10.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "IEBCVotingSystemV10.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Run as a non-privileged user for improved security
USER app
EXPOSE 8080
COPY --from=build /app/publish .

# Use the port expected by Render/Railway
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "IEBCVotingSystemV10.dll"]