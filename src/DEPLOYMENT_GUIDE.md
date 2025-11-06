# Qatar Boat Show 2025 - Deployment Guide 🚀

## ✅ What's Already Done
- ✅ Backend is deployed on Supabase Edge Functions
- ✅ Database is configured (KV Store)
- ✅ File storage is configured (Supabase Storage)
- ✅ All configuration files created

## 🎯 Deploy to Vercel (Easiest - Recommended)

### Step 1: Push Code to GitHub
1. Go to [github.com](https://github.com) and create a new repository
2. Upload all your project files to that repository

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Vercel will auto-detect it's a Vite project ✅
6. Click **"Deploy"**
7. Wait 2-3 minutes ⏱️
8. Done! 🎉

### Step 3: Access Your Site
- Your site will be live at: `https://your-project.vercel.app`
- You can add a custom domain later in Vercel settings

---

## 🔧 Alternative: Deploy to Netlify

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **"Deploy site"**
6. Done! 🎉

---

## 📱 Alternative: Deploy to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click **"Create application"** → **"Pages"**
4. Connect GitHub repository
5. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output: `dist`
6. Click **"Save and Deploy"**
7. Done! 🎉

---

## 🔑 Important Notes

### Your Backend is Already Hosted
- Server: `https://sloltfzjerisswqmhcwk.supabase.co/functions/v1/make-server-ec240367`
- No additional backend deployment needed
- All API calls automatically go to your Supabase server

### Default Login Credentials
- Username: `superadmin`
- Password: `super123`
- **⚠️ Change this immediately after first login!**

### Default VIP Promo Codes
- `VIP2025QBS`
- `QBSVIP001`
- `ELITE2025`
- `GOLDTICKET`

### File Uploads
- All file uploads go to Supabase Storage
- Max file size: 10MB
- Supported formats: PDF, JPG, PNG, DOCX

---

## 🐛 Troubleshooting

### Build Fails
- Make sure all files are uploaded to GitHub
- Check that `package.json` exists in the root directory

### "Cannot connect to server"
- Your Supabase backend should already be running
- Check console for errors

### Admin Login Doesn't Work
- Use default credentials: `superadmin` / `super123`
- Check Network tab in browser DevTools

---

## 📞 Need Help?

The deployment should work automatically. If you encounter any issues:

1. Check the build logs in Vercel/Netlify/Cloudflare
2. Look for any error messages
3. Most issues are solved by ensuring all files are properly uploaded

---

## 🎊 You're Done!

Once deployed, you can:
- ✅ Access registration forms at `/` 
- ✅ Access admin login at `/#admin-login`
- ✅ Manage submissions in the admin dashboard
- ✅ Send email notifications to applicants
- ✅ Create and manage VIP promo codes
- ✅ Create additional admin accounts

**Your Qatar Boat Show registration system is now live!** 🎉
