# CORS and Environment Configuration Guide

## Issues Fixed

### 1. **CORS Error (Main Issue)** ✅ FIXED

**Problem**: Your frontend at `https://iebc-kenya.vercel.app` was being blocked when trying to call `https://ebc-backend.onrender.com/api/voter/registerVoter`

**Root Cause**: The backend's CORS policy wasn't configured to allow the Vercel frontend URL.

**Solution Applied**:

- Updated [Program.cs](./IEBCVotingSystemV10/Program.cs) CORS configuration to include `https://iebc-kenya.vercel.app` as a default fallback URL
- Now the backend will accept requests from both localhost and production URLs

### 2. **Font Preload Warnings** ✅ FIXED

**Problem**: Browser console showing: `"The resource at ... was not used within a few seconds"`

**Root Cause**: Google Fonts were being preloaded but not used in the critical rendering path

**Solution Applied**:

- Updated [app/layout.tsx](./iebc-voting-system-frontend/app/layout.tsx) to add `display: "swap"` and explicit `preload: true`
- Updated [next.config.mjs](./iebc-voting-system-frontend/next.config.mjs) with font optimization settings

---

## Environment Variables for Production

You need to set the following environment variables on your **Render backend deployment**:

### For Backend (Render Deployment)

```bash
# Set in Render Dashboard > Environment Variables
FRONTEND_BASE_URL=https://iebc-kenya.vercel.app,http://localhost:3000
JWT_KEY=<your-32-char-min-secret-key>
Jwt__Issuer=IEBCVotingAPI
Jwt__Audience=IEBCWebPortal
# Add other DB and email settings as needed
```

### For Frontend (Vercel Deployment)

```bash
# In .env.production or Vercel Environment Variables
NEXT_PUBLIC_API_URL=https://ebc-backend.onrender.com
```

---

## Verification Steps

1. **Clear browser cache** and reload the page
2. **Test the voter registration**:
   - Go to voter registration page
   - Fill in the form
   - You should NOT see the CORS error anymore
3. **Check browser console** (F12):
   - Font preload warnings should be gone or significantly reduced
   - Network tab should show successful POST to `/api/voter/registerVoter`

---

## Endpoint Confirmation

✅ **Yes, the endpoint exists!**

- **File**: [VoterController.cs](./IEBCVotingSystemV10/Controller/RegistrationController/VoterController.cs)
- **Route**: `POST /api/voter/registerVoter`
- **Line**: ~45-227

The issue was NOT a missing endpoint—it was the CORS configuration blocking the request.

---

## Additional Notes

### CORS Policy Explanation

The backend now:

1. Checks for `FRONTEND_BASE_URL` environment variable (comma-separated URLs)
2. Falls back to `https://iebc-kenya.vercel.app` and `http://localhost:3000` if not set
3. Allows all methods, headers, and credentials from those origins

### Font Optimization

- `display: "swap"` allows fallback fonts to display while Google Fonts load
- `preload: true` ensures fonts are fetched early
- This prevents "unused preload" warnings from being too aggressive

---

## Quick Deployment Checklist

- [ ] Add `FRONTEND_BASE_URL=https://iebc-kenya.vercel.app,http://localhost:3000` to Render backend
- [ ] Rebuild and deploy backend on Render
- [ ] Redeploy frontend on Vercel (or it auto-deploys)
- [ ] Test voter registration from production URL
- [ ] Verify no CORS errors in browser console
