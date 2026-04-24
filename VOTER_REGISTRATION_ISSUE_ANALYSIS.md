# Voter Registration Error Analysis & Fixes

## Issue Summary

The voter registration endpoint was returning **HTTP 500 "Something went wrong on our end please try again later"** without providing useful debugging information.

---

## Root Causes Identified

### 1. **CRITICAL: Missing Static Files Middleware** ⚠️

- **Location:** `Program.cs`
- **Problem:** `app.UseStaticFiles()` was not called in the middleware pipeline
- **Impact:** Even if biometric images were saved to disk, they couldn't be served to the frontend
- **Fix:** Added `app.UseStaticFiles();` before authentication/authorization middleware

### 2. **Insufficient Error Logging & Debugging**

- **Location:** `VoterController.cs`
- **Problem:** Generic try-catch with minimal error information
- **Impact:** Impossible to diagnose actual failure point
- **Issues masked:**
  - File system permission errors
  - Directory creation failures
  - JSON deserialization errors
  - Database constraint violations
- **Fix:**
  - Injected `ILogger<VoterController>`
  - Added specific exception handling for each failure point
  - Log detailed error messages and stack traces

### 3. **Improper File Path Handling**

- **Location:** `VoterController.cs` line 94
- **Problem:** Used `Directory.GetCurrentDirectory()` instead of `IWebHostEnvironment.WebRootPath`
- **Impact:** File paths can be unreliable in containerized/ASP.NET environments
- **Fix:** Replaced with `_env.WebRootPath` for proper wwwroot resolution

### 4. **Inadequate File I/O Error Handling**

- **Location:** `VoterController.cs` lines 95-104
- **Problem:** No try-catch around file creation and writing operations
- **Specific issues that could occur:**
  - `UnauthorizedAccessException` - wwwroot directory not writable
  - `DirectoryNotFoundException` - wwwroot doesn't exist
  - `IOException` - Disk full or file locked
- **Fix:** Added granular exception handling for each file operation

### 5. **Missing Dependency Injection**

- **Location:** `VoterController` constructor
- **Problem:** ILogger and IWebHostEnvironment not injected
- **Fix:** Added both to constructor and assigned to private fields

### 6. **Weak Logging Configuration**

- **Location:** `appsettings.Development.json`
- **Problem:** Log level was "Information" instead of "Debug"
- **Fix:** Changed to "Debug" level and added application-specific logging

---

## Complete Data Flow

```
Frontend (registerVoter/page.tsx)
    ↓
FaceRecognition Component captures:
  - Facial image (jpg/png)
  - Face descriptor embeddings (float[])
    ↓
Creates FormData with:
  - Text fields (name, email, phone, location, etc.)
  - File: faceBiometricFile (multipart/form-data)
  - Text: faceEmbeddings (JSON stringified float array)
    ↓
POST /api/voter/registerVoter
    ↓
Backend VoterController.RegisterVoter()
    ↓
1. Validate ModelState ✓
2. Check for duplicate voter ✓
3. Check for duplicate email ✓
4. Verify user exists ✓
5. Verify role exists ✓
6. Process biometric file:
   - Deserialize embeddings JSON → float[]
   - Create directory: wwwroot/Biometrics/Voters/
   - Save image file
7. Create VoterModel record
8. Save to PostgreSQL
    ↓
Return 200 OK
    ↓
Frontend receives success message
```

---

## File Storage Architecture

```
wwwroot/
├── Biometrics/
│   └── Voters/
│       ├── FaceRef_{NationalId}_{Guid}.jpg
│       ├── FaceRef_{NationalId}_{Guid}.jpg
│       └── ...
└── VoterImages/
```

**File Naming Convention:**

- `FaceRef_{NationalIdNo}_{Guid}.{extension}`
- Example: `FaceRef_123456789_550e8400-e29b-41d4-a716-446655440000.jpg`
- Allows easy lookup during face verification

**Access URL:**

```
http://localhost:5007/Biometrics/Voters/FaceRef_123456789_550e8400-e29b-41d4-a716-446655440000.jpg
```

---

## Database Storage

**VoterModel fields:**

- `FaceBiometricImage` (string) - Stores only the filename
- `FaceEmbeddings` (string) - JSON serialized float array

**Example stored embeddings:**

```json
"[0.123, -0.456, 0.789, ..., 0.012]"
```

---

## Applied Fixes

### Fix #1: Program.cs - Enable Static Files

```csharp
app.UseRouting();
app.UseCors("ProductionPolicy");

// CRITICAL: Enable static files serving (for biometric images, etc.)
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
```

### Fix #2: VoterController.cs - Enhanced Dependency Injection

```csharp
private readonly ApplicationDbContext _dbContext;
private readonly RoleManager<AppUserRoles> _roleManager;
private readonly IBiometricService _biometricService;
private readonly ILogger<VoterController> _logger;           // NEW
private readonly IWebHostEnvironment _env;                    // NEW

public VoterController(ApplicationDbContext dbContext,
                        RoleManager<AppUserRoles> roleManager,
                        IBiometricService biometricService,
                        ILogger<VoterController> logger,      // NEW
                        IWebHostEnvironment env)              // NEW
{
    this._dbContext = dbContext;
    this._roleManager = roleManager;
    this._biometricService = biometricService;
    this._logger = logger;
    this._env = env;
}
```

### Fix #3: VoterController.cs - Enhanced RegisterVoter Method

- Added `_logger.LogInformation()` at key checkpoints
- Added `_logger.LogWarning()` for validation failures
- Added `_logger.LogError()` for exception handling
- Replaced `Directory.GetCurrentDirectory()` with `_env.WebRootPath`
- Added specific exception handling:
  ```csharp
  catch (UnauthorizedAccessException ex)
  {
      _logger.LogError(ex, "Permission denied when saving biometric file");
      return StatusCode(500, "Server error: Unable to save biometric file due to permission issues.");
  }
  catch (DirectoryNotFoundException ex)
  {
      _logger.LogError(ex, "Directory not found when saving biometric file");
      return StatusCode(500, "Server error: Unable to create biometric storage directory.");
  }
  catch (IOException ex)
  {
      _logger.LogError(ex, "I/O error when saving biometric file");
      return StatusCode(500, "Server error: Unable to save biometric file.");
  }
  ```

### Fix #4: appsettings.Development.json - Enhanced Logging

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "IEBCVotingSystemV10": "Debug"
    }
  }
}
```

### Fix #5: Created Directory Structure

```bash
mkdir -p /home/hozy/IEBC-Kenya/IEBCVotingSystemV10/wwwroot/Biometrics/Voters
```

---

## Debugging Checklist

When troubleshooting voter registration:

- [ ] Backend logs show detailed error messages (check console output)
- [ ] wwwroot/Biometrics/Voters directory exists and is writable
- [ ] User account exists in AspNetUsers table before voter registration
- [ ] Selected role exists in AppUserRoles table
- [ ] Face embeddings are valid JSON array: `[0.123, -0.456, ...]`
- [ ] Biometric file is not empty and in valid format (jpg/png)
- [ ] Database connection string is valid
- [ ] CORS allows frontend URL in FRONTEND_BASE_URL env var
- [ ] Face recognition models are available in `/public/models/`

---

## Testing the Fix

### Step 1: Start the Backend

```bash
cd /home/hozy/IEBC-Kenya/IEBCVotingSystemV10
dotnet run
```

### Step 2: Monitor Logs

Watch for detailed logging in console output, including:

- "RegisterVoter called for email: {Email}"
- "Processing biometric file: {FileName}"
- "Face embeddings parsed successfully"
- "Biometric file saved successfully"
- "Voter registered successfully"

### Step 3: Register User First

Navigate to signup and create a user account with email and password

### Step 4: Register Voter

Navigate to voter registration:

1. Capture face using live face recognition
2. Fill in all voter details
3. Select voter role
4. Submit form

### Step 5: Verify Success

- Frontend shows "Voter Registered successfully!"
- Backend logs show completion without errors
- Check database for new voter record: `SELECT * FROM "Voters" ORDER BY "CreatedAt" DESC LIMIT 1;`
- Check file system: `ls -la wwwroot/Biometrics/Voters/`

---

## What Was Changed

| Component      | File                           | Change                                                              | Severity |
| -------------- | ------------------------------ | ------------------------------------------------------------------- | -------- |
| Middleware     | `Program.cs`                   | Added `app.UseStaticFiles()`                                        | CRITICAL |
| Controller     | `VoterController.cs`           | Added ILogger & IWebHostEnvironment                                 | HIGH     |
| File Path      | `VoterController.cs`           | Use `_env.WebRootPath` instead of `Directory.GetCurrentDirectory()` | HIGH     |
| Error Handling | `VoterController.cs`           | Added specific exception handlers                                   | HIGH     |
| Logging        | `VoterController.cs`           | Added detailed logging at each step                                 | HIGH     |
| Config         | `appsettings.Development.json` | Changed log level to Debug                                          | MEDIUM   |
| File System    | `wwwroot/Biometrics/Voters/`   | Created directory                                                   | MEDIUM   |

---

## Next Steps

1. **Test the registration flow end-to-end**
2. **Monitor logs for any remaining errors**
3. **Verify biometric images are saved correctly**
4. **Test face verification endpoint with saved embeddings**
5. **Check file accessibility from frontend** (images should load via URL)
6. **Load test with multiple concurrent registrations**

---

## Related Files

- [VoterModel.cs](./IEBCVotingSystemV10/Model/Entity/VoterModel.cs) - Entity definition
- [VoterDTO.cs](./IEBCVotingSystemV10/Model/DTOs/VoterDTO.cs) - Data transfer object
- [VoterController.cs](./IEBCVotingSystemV10/Controller/RegistrationController/VoterController.cs) - API endpoint
- [BiometricService.cs](./IEBCVotingSystemV10/Services/BiometricService.cs) - Face comparison logic
- [FaceRecognition.tsx](./iebc-voting-system-frontend/components/FaceRecognition.tsx) - Frontend capture component
- [registerVoter/page.tsx](./iebc-voting-system-frontend/app/registration/registerVoter/page.tsx) - Registration form
