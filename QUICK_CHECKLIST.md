# 📋 QUICK DEPLOYMENT CHECKLIST

Print this or keep it open while deploying!

---

## PHASE 1: GITHUB (20 min)

### Create GitHub Account
```
[ ] Go to https://github.com
[ ] Click "Sign up"
[ ] Verify email
[ ] Logged in successfully
```

### Create Repository
```
[ ] Click "+" icon (top right)
[ ] Click "New repository"
[ ] Name: maurichesse
[ ] Set to "Public"
[ ] Create repository
[ ] You see empty repo page
```

### Push Your Code
```
[ ] Open Command Prompt (Win + R, type cmd)
[ ] cd C:\maurichesse
[ ] git config --global user.name "Your Name"
[ ] git config --global user.email "your@email.com"
[ ] git init
[ ] git add .
[ ] git commit -m "Initial commit"
[ ] git branch -M main
[ ] git remote add origin https://github.com/YOUR_USERNAME/maurichesse.git
[ ] git push -u origin main
[ ] Files appear on GitHub ✅
```

**SAVE THIS:** https://github.com/YOUR_USERNAME/maurichesse

---

## PHASE 2: RENDER BACKEND (20 min)

### Create Render Account
```
[ ] Go to https://render.com
[ ] Sign up with GitHub
[ ] Verify email
[ ] Logged in
```

### Create MySQL Database
```
[ ] Click "New +"
[ ] Click "MySQL"
[ ] Name: maurichesse-db
[ ] Database: mauheritage
[ ] User: maurichesse_user
[ ] Create
[ ] Wait 2-3 minutes
```

**SAVE THESE:**
```
Host: ___________________
User: maurichesse_user
Password: ___________________
Port: 3306
Database: mauheritage
```

### Import Database Schema
```
[ ] Connect to MySQL using credentials above
[ ] Open: C:\maurichesse\backend\db\mauheritage.sql
[ ] Copy all SQL code
[ ] Paste into MySQL client
[ ] Execute
[ ] Database schema imported ✅
```

### Deploy Backend
```
[ ] Render dashboard → "New +"
[ ] Click "Web Service"
[ ] Connect GitHub → select maurichesse
[ ] Name: maurichesse-api
[ ] Environment: PHP
[ ] Build Command: composer install --no-dev
[ ] Start Command: php -S 0.0.0.0:$PORT -t backend
[ ] Click "Advanced" or "Environment"
[ ] Add environment variables:
    MYSQL_HOST = (from MySQL step)
    MYSQL_PORT = 3306
    MYSQL_USER = maurichesse_user
    MYSQL_PASSWORD = (from MySQL step)
    MYSQL_DB = mauheritage
[ ] Create Web Service
[ ] Wait 3-5 minutes for deployment
```

**SAVE THIS:** https://maurichesse-api.render.com (or your Render URL)

---

## PHASE 3: UPDATE FRONTEND CONFIG (5 min)

### Update Backend URL
```
[ ] Open: C:\maurichesse\frontend\config.js
[ ] Find the line with "fallback ="
[ ] Replace with your Render URL:
    fallback = 'https://maurichesse-api.render.com';
[ ] Save the file
[ ] Go to Command Prompt
[ ] cd C:\maurichesse
[ ] git add frontend/config.js
[ ] git commit -m "Update backend URL"
[ ] git push
[ ] Changes pushed to GitHub ✅
```

---

## PHASE 4: NETLIFY FRONTEND (15 min)

### Create Netlify Account
```
[ ] Go to https://netlify.com
[ ] Sign up with GitHub
[ ] Verify
[ ] Logged in
```

### Deploy Frontend
```
[ ] Netlify dashboard → "Add new site"
[ ] Click "Import an existing project"
[ ] Select GitHub → maurichesse
[ ] Base directory: frontend
[ ] Build command: (leave empty)
[ ] Publish directory: frontend
[ ] Deploy site
[ ] Wait 1-2 minutes
```

**SAVE THIS:** https://maurichesse.netlify.app (or your Netlify URL)

---

## PHASE 5: TEST EVERYTHING (10 min)

### Open Website
```
[ ] Go to https://maurichesse.netlify.app
[ ] See splash screen with logo
[ ] See home page with map
[ ] No red errors in console (F12)
```

### Test User Registration
```
[ ] Go to login page
[ ] Click "Register"
[ ] Create account:
    Username: testuser
    Email: test@example.com
    Password: test123
[ ] Registration successful ✅
```

### Test Login
```
[ ] Go to login page
[ ] Login with testuser / test123
[ ] Logged in successfully ✅
```

### Test Map & Navigation
```
[ ] See map on home page
[ ] Click navigation tabs (Scan, Visited, Profile)
[ ] All pages load correctly
```

### Test QR Scanner
```
[ ] Go to Scan tab
[ ] Allow camera permission
[ ] See scanner ready
```

### Test Admin Dashboard
```
[ ] Go to https://maurichesse-api.render.com/admin/dashboard.html
[ ] Login with admin credentials
[ ] See user list with your testuser account
[ ] All features working ✅
```

---

## 🎉 FINAL STATUS

```
[ ] GitHub: Code uploaded
[ ] Render: Backend running
[ ] Render: Database imported
[ ] Netlify: Frontend deployed
[ ] Frontend Config: Updated
[ ] Website: Live and working
[ ] Tests: All passing

✅ DEPLOYMENT COMPLETE!
```

---

## 🔗 YOUR LIVE URLS

**Website:** https://maurichesse.netlify.app
**Backend:** https://maurichesse-api.render.com
**Admin:** https://maurichesse-api.render.com/admin/dashboard.html

---

## 📱 NEXT: Install on Phone

1. Open website on phone
2. Look for "Install" button
3. Click it
4. App is on your home screen!

---

## ⚠️ COMMON MISTAKES TO AVOID

❌ Forget to save your MySQL credentials
❌ Forget to update config.js with Render URL
❌ Push code before updating config.js
❌ Skip importing database schema
❌ Not setting environment variables in Render
❌ Forgetting to commit git changes

---

**GOOD LUCK! You've got this! 🚀**
