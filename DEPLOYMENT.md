# MauRichesse - Deployment Guide

## 🚀 Easiest Deployment: Render + Netlify

This is the fastest and most reliable free option.

---

## **Step 1: Push to GitHub**

```bash
cd maurichesse
git init
git add .
git commit -m "MauRichesse ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/maurichesse.git
git push -u origin main
```

---

## **Step 2: Deploy Backend to Render**

### 2.1 Create MySQL Database
1. Go to [render.com](https://render.com)
2. Sign up (free)
3. Click **"New +"** → **"MySQL"**
4. Name it: `maurichesse-db`
5. Save the connection details:
   - **Host**: `your-mysql-host.render.com`
   - **User**: `maurichesse_user`
   - **Password**: (save the auto-generated one)
   - **Database**: `mauheritage`

### 2.2 Import Database Schema
1. In Render MySQL dashboard, click **"Connect"**
2. Use a MySQL client or phpMyAdmin
3. Import [backend/db/mauheritage.sql](backend/db/mauheritage.sql)

### 2.3 Deploy Backend API
1. Go to [render.com](https://render.com) dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select `maurichesse` repository
5. **Configuration:**
   - **Name**: `maurichesse-api`
   - **Runtime**: `PHP`
   - **Build Command**: `composer install --no-dev`
   - **Start Command**: `php -S 0.0.0.0:$PORT -t backend`
   - **Environment Variables** (from MySQL connection):
     ```
     MYSQL_HOST=your-mysql-host.render.com
     MYSQL_PORT=3306
     MYSQL_USER=maurichesse_user
     MYSQL_PASSWORD=your_password_here
     MYSQL_DB=mauheritage
     ```
6. Click **"Create Web Service"**
7. Wait for deployment (~2-3 minutes)
8. Copy the deployed URL: `https://maurichesse-api.render.com`

---

## **Step 3: Update Frontend Config**

1. Open `frontend/config.js`
2. Find this line:
   ```javascript
   fallback = protocol + '//' + location.hostname.replace('netlify.app', '') + '.onrender.com' + '/api';
   ```
3. Replace with your actual Render backend URL:
   ```javascript
   fallback = 'https://maurichesse-api.render.com';
   ```
4. Commit and push:
   ```bash
   git add frontend/config.js
   git commit -m "Update backend URL for production"
   git push
   ```

---

## **Step 4: Deploy Frontend to Netlify**

1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect GitHub account
5. Select `maurichesse` repository
6. **Configuration:**
   - **Base directory**: `frontend`
   - **Build command**: (leave empty)
   - **Publish directory**: `frontend`
7. Click **"Deploy site"**
8. Wait for deployment (~1-2 minutes)
9. You'll get a URL like: `https://maurichesse.netlify.app`

---

## **Step 5: Test Everything**

1. Open your Netlify URL
2. Login/Register
3. Try scanning a QR code
4. Check admin dashboard
5. Verify everything works

---

## **Troubleshooting**

### Backend not connecting?
- Check that `MYSQL_*` environment variables are set in Render
- Verify MySQL database was imported successfully
- Check Render logs: **"Runtime Logs"** tab

### Frontend showing blank?
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors (F12)
- Verify `config.js` has correct backend URL

### Database not found?
- SSH into Render MySQL and verify schema:
  ```bash
  mysql -h host -u user -p database_name < backend/db/mauheritage.sql
  ```

---

## **Total Cost: $0**

- ✅ Render free tier: 750 hours/month (enough for 1 web service + 1 MySQL)
- ✅ Netlify free tier: unlimited deployments & sites
- ✅ Auto-deploys on every git push

---

## **Update Your App**

To deploy updates:
```bash
git add .
git commit -m "Description of changes"
git push
```

Both Render and Netlify will auto-deploy within 1-2 minutes.

---

## **Folder Structure**

```
maurichesse/
├── backend/          ← PHP API (deploy to Render)
│   ├── api/
│   ├── admin/
│   ├── db/
│   ├── config.php
│   ├── render.yaml   ← Deployment config
│   └── .gitignore
├── frontend/         ← PWA (deploy to Netlify)
│   ├── home.html
│   ├── scan.html
│   ├── config.js     ← UPDATE THIS
│   └── .gitignore
└── README.md
```

---

**Good to go! 🚀**
