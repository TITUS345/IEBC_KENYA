# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["IEBCVotingSystemV10.csproj", "."]
RUN dotnet restore "IEBCVotingSystemV10.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "IEBCVotingSystemV10.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "IEBCVotingSystemV10.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 5007
ENTRYPOINT ["dotnet", "IEBCVotingSystemV10.dll"]