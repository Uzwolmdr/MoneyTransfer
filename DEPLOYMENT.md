# Windows Server Deployment Guide

## Prerequisites

### 1. Install on Windows Server:
- **.NET 9.0 Runtime** (for backend) - Download from Microsoft
- **Node.js** (for building React app - can be removed after build)
- **IIS** (Internet Information Services) - Optional, for hosting
- **SQL Server** (for database)

### 2. Required Packages:
- **Microsoft.Data.SqlClient** - Already included
- **Dapper** - Already included
- **React dependencies** - Only needed for build, not runtime

## Deployment Steps

### Step 1: Build React Frontend

```bash
cd UI-React/vite-project
npm install
npm run build
```

This creates a `dist` folder with production-ready static files.

### Step 2: Configure Production API URL

The app now uses environment variables. Create a `.env.production` file in `UI-React/vite-project/`:
```
VITE_API_URL=https://yourdomain.com/api/wallet
```

Or set it during build:
```bash
VITE_API_URL=https://yourdomain.com/api/wallet npm run build
```

**Note:** The app will automatically use `http://localhost:5047` if no environment variable is set (for development).

### Step 3: Deploy Backend (.NET)

#### Option A: Self-Hosted (Recommended)
1. Publish the .NET app:
```bash
cd MoneyTransfer
dotnet publish -c Release -o ./publish
```

2. Copy `publish` folder to Windows Server
3. Run as Windows Service or use `dotnet run` in production

#### Option B: IIS Deployment
1. Install ASP.NET Core Hosting Bundle on Windows Server
2. Create IIS Application Pool
3. Point to published folder
4. Configure bindings (port 80/443)

### Step 4: Serve React Frontend

#### Option A: Serve from .NET Backend (Recommended)
1. Copy React `dist` folder contents to `MoneyTransfer/wwwroot/`
2. Uncomment static file serving in `Program.cs` (lines 70-74)
3. The backend will serve both API and frontend from the same port

#### Option B: Separate IIS Site (Alternative)
1. Create new IIS site
2. Point to React `dist` folder
3. Configure URL rewrite for SPA routing
4. Update CORS to allow your frontend domain

### Step 5: Update CORS for Production

Create `appsettings.Production.json` (copy from `appsettings.Production.json.example`):
```json
{
  "Cors": {
    "AllowedOrigins": [
      "https://yourdomain.com",
      "http://yourdomain.com"
    ]
  }
}
```

The `Program.cs` is already configured to read CORS origins from configuration. If not set, it defaults to `http://localhost:5173` for development.

### Step 6: Environment Configuration

Create `appsettings.Production.json`:
```json
{
  "ConnectionStrings": {
    "Default": "Server=YOUR_SERVER;Database=SendMoneyDemo;Integrated Security=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning"
    }
  }
}
```

## Production Checklist

- [ ] Build React app (`npm run build`)
- [ ] Update API URL in React app
- [ ] Publish .NET backend
- [ ] Configure production connection string
- [ ] Update CORS origins
- [ ] Test database connectivity
- [ ] Configure SSL/HTTPS
- [ ] Set up Windows Service or IIS
- [ ] Configure firewall rules
- [ ] Test end-to-end functionality

## Windows Service Setup (Optional)

Create a Windows Service to run the .NET app:

1. Install NSSM (Non-Sucking Service Manager)
2. Create service:
```bash
nssm install MoneyTransferAPI "C:\Program Files\dotnet\dotnet.exe" "C:\path\to\MoneyTransfer.dll"
```

## IIS Configuration

1. Install ASP.NET Core Hosting Bundle
2. Create Application Pool (No Managed Code)
3. Create Website pointing to published folder
4. Configure web.config if needed

## Security Considerations

- Use HTTPS in production
- Update CORS to only allow your domain
- Use strong connection strings
- Enable Windows Authentication if needed
- Configure firewall rules
- Regular security updates

