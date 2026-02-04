# 🎯 COMPLETE STEP-BY-STEP DEPLOYMENT GUIDE
## For Complete Beginners (With Screenshots Descriptions)

---

## 🚀 PART 1: PREPARE GITHUB (20 minutes)

### Step 1.1: Create GitHub Account
1. Go to **https://github.com**
2. Click **"Sign up"** (top right)
3. Enter:
   - Email: your email
   - Password: create a password
   - Username: your name (e.g., "john-maurichesse")
4. Click **"Create account"**
5. Complete verification (email check)

### Step 1.2: Create a New Repository
1. After signing in, click **"+"** icon (top right)
2. Click **"New repository"**
3. Fill in:
   - **Repository name:** `maurichesse`
   - **Description:** "MauRichesse - Heritage discovery app"
   - **Public** cd C:\maurichesse

git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

git init
git add .
git commit -m "MauRichesse - Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/maurichesse.git
git push -u origin main(so Render can access it)
4. Click **"Create repository"**
5. You'll see an empty repo with setup instructions

### Step 1.3: Upload Your Files to GitHub
You have 2 options:

#### **OPTION A: Using Git Commands (Recommended)**

1. **Open Command Prompt** (Windows):
   - Press `Win + R`
   - Type `cmd`
   - Press Enter

2. **Go to your project folder:**
   ```bash
   cd C:\maurichesse
   ```

3. **Initialize Git (do this only once):**
   ```bash
   git config --global user.name "KaMiPo"
   git config --global user.email "harinjiva.rabarijohn@umail.utm.ac.mu"
   ```
   ✅ Already configured!

4. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "MauRichesse - Initial deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/maurichesse.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your actual GitHub username!

5. **Expected output:**
   ```
   Creating your initial commit...
   Counting objects: 1275, done...
   Pushing to GitHub...
   ```

6. **Verify:** Go to https://github.com/YOUR_USERNAME/maurichesse
   You should see all your files uploaded! ✅

#### **OPTION B: Using GitHub Desktop (Easier for beginners)**

1. Download **GitHub Desktop**: https://desktop.github.com
2. Install it
3. Sign in with your GitHub account
4. Click **"File"** → **"Clone repository"**
5. Paste your repo URL
6. Choose location: `C:\maurichesse`
7. Click **"Clone"**
8. Right-click → **"Open in Explorer"**
9. Drag all files from `C:\maurichesse` into the cloned folder
10. Back in GitHub Desktop, you'll see "Changes"
11. Click **"Commit to main"** at bottom
12. Click **"Push origin"** at top

---

## 🗄️ PART 2: DEPLOY BACKEND (MySQL + API) (20 minutes)

### Step 2.1: Create Render Account
1. Go to **https://render.com**
2. Click **"Sign up"** (top right)
3. Click **"Sign up with GitHub"**
4. Authorize GitHub connection
5. Complete registration

### Step 2.2: Create MariaDB Database (External Provider)
Render does **not** provide MySQL/MariaDB. To keep MariaDB, create it with a managed provider (recommended: **Aiven**).

1. Go to **https://console.aiven.io**
2. Click **"Create service"**
3. Select **MariaDB**
4. Choose the closest region
5. Pick the **Free** plan (or the smallest available)
6. Name it **`maurichesse-db`**
7. Create the service and wait 2–3 minutes
8. Open the service and **copy these values**:
   ```
   Host
   Port
   Database name
   Username
   Password
   ```
   Save them safely!

### Step 2.3: Import Database Schema
1. Use a MySQL/MariaDB client (HeidiSQL, MySQL Workbench, or DBeaver)
2. Connect using the credentials from Step 2.2
3. Import the schema file:
   - File: `C:\maurichesse\backend\db\mauheritage.sql`
   - Run the full script to create all tables

### Step 2.4: Deploy Backend API
1. On Render dashboard, click **"New +"** (top right)
2. Click **"Web Service"**
3. Click **"Connect a repository"**
4. Find and select **`maurichesse`** repository
5. Fill in settings:
   - **Name:** `maurichesse-api`
   - **Environment:** `PHP`
   - **Build Command:** `composer install --no-dev`
   - **Start Command:** `php -S 0.0.0.0:$PORT -t backend`
   - **Instance Type:** Free

6. **Add Environment Variables (VERY IMPORTANT!):**
   - Click **"Advanced"** or **"Environment"**
   - Click **"Add Variable"** for each:
   
   | Key | Value |
   |-----|-------|
   | MYSQL_HOST | (your host from step 2.2) |
   | MYSQL_PORT | 3306 |
   | MYSQL_USER | maurichesse_user |
   | MYSQL_PASSWORD | (your password from step 2.2) |
   | MYSQL_DATABASE | mauheritage |

7. Click **"Create Web Service"**
8. Wait 3-5 minutes for deployment
9. **When complete, copy this URL:**
   ```
   https://maurichesse-api.render.com
   (or whatever Render gives you)
   ```
   **Save it! You'll need it next!** 📝

---

## 🌐 PART 3: DEPLOY FRONTEND (Netlify) (15 minutes)

### Step 3.1: Create Netlify Account
1. Go to **https://netlify.com**
2. Click **"Sign up"** (top right)
3. Click **"Sign up with GitHub"**
4. Authorize GitHub
5. Complete registration

### Step 3.2: Update Frontend Config
1. **IMPORTANT:** Before deploying, update the backend URL!
2. Open file: `C:\maurichesse\frontend\config.js`
3. Find this line:
   ```javascript
   fallback = protocol + '//' + location.hostname.replace('netlify.app', '') + '.onrender.com' + '/api';
   ```
4. Replace with your actual Render URL (from step 2.4):
   ```javascript
   fallback = 'https://maurichesse-api.render.com';
   ```
5. Save the file
6. Go to GitHub Desktop (or command line)
7. Commit and push:
   ```bash
   git add frontend/config.js
   git commit -m "Update backend API URL"
   git push
   ```

### Step 3.3: Deploy to Netlify
1. On Netlify dashboard, click **"Add new site"** (or "Import an existing project")
2. Click **"Import an existing project"**
3. Click **"GitHub"**
4. Find and select `maurichesse` repository
5. **Deploy Settings:**
   - **Base directory:** `frontend`
   - **Build command:** (leave empty)
   - **Publish directory:** `frontend`
6. Click **"Deploy site"**
7. Wait 1-2 minutes
8. **When complete, you'll get a URL like:**
   ```
   https://maurichesse.netlify.app
   ```
   This is your live website! 🎉

---

## ✅ PART 4: TEST EVERYTHING (10 minutes)

### Step 4.1: Test Frontend
1. Open **https://maurichesse.netlify.app** in browser
2. You should see:
   - Logo + splash screen for 3 seconds
   - Then the home page with the map
   - Navigation menu at top

### Step 4.2: Test Registration
1. Click **"Login"** or go to index.html first
2. Create an account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123`
3. You should be able to register ✅

### Step 4.3: Test Login
1. Go back to index.html
2. Login with the account you just created ✅

### Step 4.4: Test QR Scanning
1. Click **"Scan"** tab
2. Allow camera permission
3. Try scanning a QR code (if you have one)
4. Should show a riddle modal ✅

### Step 4.5: Test Admin Dashboard
1. Go to **https://maurichesse-api.render.com/admin/dashboard.html**
2. Login with admin credentials (set in your database)
3. You should see:
   - User list with points
   - Location management
   - Photo verification

---

## 🔧 PART 5: TROUBLESHOOTING (If Something Breaks)

### Problem: Frontend shows blank page
**Solution:**
1. Hard refresh (Ctrl+Shift+R)
2. Check browser console (F12)
3. Look for red error messages
4. If it says "API error", check config.js is correct

### Problem: Can't login
**Solution:**
1. Check database was imported (has `user` table)
2. Check browser console for specific error
3. Try different username/email

### Problem: Backend not working
**Solution:**
1. Go to Render dashboard
2. Click `maurichesse-api` service
3. Check "Runtime Logs" for errors
4. Verify all environment variables are set correctly

### Problem: Points not showing
**Solution:**
1. Check database has `user_points` table
2. Scan a QR code
3. Check if points appear in admin dashboard

---

## 📱 PART 6: MAKE IT WORK ON YOUR PHONE

### Install as App (PWA)
1. Open https://maurichesse.netlify.app on your phone
2. Look for **"Install"** or **"Add to Home Screen"** popup
3. Click it
4. Now it's on your home screen as an app! 📱

### Test on Phone
1. Tap the app icon
2. Try scanning QR codes
3. Should work just like the website

---

## 🎉 YOU'RE DONE!

Your app is now live at:
- **Website:** https://maurichesse.netlify.app
- **Backend API:** https://maurichesse-api.render.com
- **Admin Dashboard:** https://maurichesse-api.render.com/admin/dashboard.html

### What to do next:
1. **Share the website URL** with friends
2. **Generate QR codes** for locations
3. **Test all features** with real users
4. **Make improvements** by editing code → git push → auto-deploys!

---

## 💡 COMMON QUESTIONS

**Q: Do I need to pay?**
A: No! Everything is free tier.

**Q: Can I make changes?**
A: Yes! Edit code → git push → automatically deploys in 1-2 minutes.

**Q: Where are my files stored?**
A: In GitHub (backup), Render (backend running), Netlify (frontend running).

**Q: Can I use a custom domain?**
A: Yes, but that costs money. Free tier is fine for now.

**Q: What if my app gets popular?**
A: Upgrade Render/Netlify plans when needed. Free tier handles 1000+ users easily.

---

## 📞 NEED HELP?

1. **Check error messages** - they usually tell you what's wrong
2. **Check browser console** (F12) - red errors show problems
3. **Check Render logs** - Runtime Logs tab shows backend errors
4. **Read TROUBLESHOOTING.md** - has common issues
5. **Google the error message** - usually others have solved it

---

## 🚀 FINAL CHECKLIST

Before you start:
- [ ] GitHub account created
- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] MySQL database created
- [ ] Schema imported
- [ ] Backend deployed
- [ ] config.js updated with backend URL
- [ ] Frontend deployed to Netlify
- [ ] Website is live
- [ ] Everything tested

Once you check all boxes, you're done! 🎉

---

**Start with Step 1.1 above and follow each step in order. Don't skip any!**
