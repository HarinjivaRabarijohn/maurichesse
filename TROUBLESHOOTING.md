# Common Issues & Solutions

## Frontend Can't Connect to Backend

**Problem:** "API error" or "Network error" in browser console

**Solutions:**
1. Check `frontend/config.js` has correct backend URL
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console (F12) for exact error
4. Verify Render backend is running (check Render dashboard)
5. Clear `localStorage`:
   ```javascript
   // In browser console:
   localStorage.removeItem('mau_api_base');
   location.reload();
   ```

---

## Backend Returns 500 Error

**Problem:** Render backend is crashing

**Solutions:**
1. Check Render Runtime Logs:
   - Go to Render dashboard
   - Select `maurichesse-api`
   - Click "Runtime Logs" tab
2. Verify MySQL env variables are set correctly
3. Check MySQL database was imported (schema exists)
4. Verify `config.php` has correct syntax

---

## Database Connection Failed

**Problem:** "SQLSTATE[HY000]: Can't connect to MySQL server"

**Solutions:**
1. Verify MySQL credentials in Render dashboard:
   - MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD
2. Check MySQL database is still running (Render dashboard)
3. Verify database schema was imported:
   ```bash
   # Render MySQL shell
   USE mauheritage;
   SHOW TABLES;
   ```

---

## Points Not Showing

**Problem:** User has 0 points despite scanning QR codes

**Solutions:**
1. Check `user_visit` table exists:
   ```sql
   SELECT COUNT(*) FROM user_visit;
   ```
2. Verify `user_points` table has entries:
   ```sql
   SELECT * FROM user_points WHERE user_id = 1;
   ```
3. Check browser console for API errors
4. Verify QR scan API response (Network tab in DevTools)

---

## Badges Not Displaying

**Problem:** Badges page is blank or shows no badges

**Solutions:**
1. Check badge data exists:
   ```sql
   SELECT * FROM badge;
   ```
2. Verify user has earned badges:
   ```sql
   SELECT * FROM user_badge WHERE user_id = 1;
   ```
3. Check browser console for badge API errors
4. Verify hamburger-menu.js is loaded (Sources tab)

---

## QR Code Scanner Not Working

**Problem:** "Scanner failed to initialize" error

**Solutions:**
1. Allow camera permission in browser
2. Check browser supports QR scanning (Chrome, Edge, Safari)
3. Verify `html5-qrcode` library loaded (Sources tab in DevTools)
4. Check browser console for specific error
5. Try incognito mode

---

## Site Not Updating After git Push

**Problem:** Changes not showing on Netlify/Render

**Solutions:**
1. Wait 1-2 minutes for auto-deploy to complete
2. Check deployment status:
   - Netlify: Dashboard → "Deploys" tab
   - Render: Dashboard → "Runtime Logs" tab
3. Hard refresh browser (Ctrl+Shift+R)
4. Clear browser cache manually
5. Check for deployment errors in logs

---

## CORS Errors in Console

**Problem:** "Access to XMLHttpRequest blocked by CORS policy"

**Solutions:**
1. This is normal if frontend and backend are on different domains
2. Backend already has CORS headers enabled in `config.php`
3. Check that backend URL in `config.js` is correct (same domain in CORS header)
4. If still issues, verify Render backend CORS headers are working:
   ```
   curl -H "Origin: https://yourfrontend.netlify.app" \
        https://maurichesse-api.render.com/api/user.php?action=list
   ```

---

## Login Not Working

**Problem:** Can't login or register

**Solutions:**
1. Check `user` table exists:
   ```sql
   SELECT * FROM user LIMIT 5;
   ```
2. Verify password hashing in backend:
   - Check `password_hash` is not empty
3. Check browser console for auth API errors
4. Verify `auth.js` is loaded (Sources tab)
5. Check if user already exists:
   ```sql
   SELECT * FROM user WHERE username = 'testuser';
   ```

---

## PWA Not Installing

**Problem:** "Install" button not showing in browser

**Solutions:**
1. Must be HTTPS (auto for Netlify)
2. Must have manifest.json (already included)
3. Must have service worker (already included)
4. Try on mobile (better support)
5. Check console for service worker errors

---

## Map Not Loading

**Problem:** Map shows blank or "Loading map..." stays

**Solutions:**
1. Check Leaflet library loaded (Sources tab):
   - Should see `leaflet.js` and `leaflet.css`
2. Check for JavaScript errors (Console tab)
3. Verify `window._mau_map` exists:
   ```javascript
   // In browser console:
   console.log(window._mau_map);
   ```
4. Check location API working:
   ```
   /api/location.php?action=list
   ```

---

## Photos Not Uploading

**Problem:** "File upload failed" error

**Solutions:**
1. Check `uploads/visits/` folder exists on backend
2. Verify file size is reasonable (<5MB)
3. Check allowed image formats (jpg, png, gif)
4. Verify backend write permissions
5. Check upload folder path in `visit.php`

---

## Need More Help?

1. Check backend logs:
   ```
   Render Dashboard → Runtime Logs → Last 100 lines
   ```

2. Check frontend errors:
   ```
   Browser Console (F12) → Check red errors
   ```

3. Check network requests:
   ```
   Browser Network Tab → Filter XHR → Click requests to see response
   ```

4. Contact support:
   - Render: support.render.com
   - Netlify: support.netlify.com

---

**Still stuck?** Review the exact error message and search it online with the service name (e.g., "Render PHP deployment error...").
