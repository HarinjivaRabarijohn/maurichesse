# MauRichesse - Mauritius Heritage Discovery App

A PWA (Progressive Web App) for discovering Mauritius heritage sites via QR code scanning, location visiting, and earning badges.

## Features

✨ **QR Code Scanning** - Scan location QR codes  
🗺️ **Interactive Maps** - Leaflet-based location mapping  
📍 **Location Tracking** - Visit locations and earn points  
🏅 **Badge System** - Unlock badges at point milestones  
📸 **Photo Uploads** - Upload verified location photos  
📱 **PWA Support** - Works offline, installable on mobile  
🌍 **Bilingual** - English & French UI  

## Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Leaflet 1.9.4 (maps)
- html5-qrcode (QR scanning)
- Service Worker (offline support)
- PWA Manifest

**Backend:**
- PHP 8.3+
- MySQL 8.0+
- PDO (database access)
- RESTful API

**Deployment:**
- Render (Backend + MySQL)
- Netlify (Frontend)

## Quick Start (Local)

1. **Backend**: Copy `backend/` to your PHP server
2. **Database**: Import `backend/db/mauheritage.sql` to MySQL
3. **Frontend**: Serve `frontend/` on `http://localhost`
4. **Configure**: Update `frontend/config.js` with your backend URL

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guide.

**TL;DR:**
```bash
git push → Render deploys backend → Netlify deploys frontend ✅
```

## Project Structure

```
maurichesse/
├── backend/
│   ├── api/              # API endpoints
│   ├── admin/            # Admin dashboard
│   ├── db/               # Database schema
│   ├── uploads/          # User uploads
│   ├── config.php        # DB configuration
│   └── vendor/           # Composer dependencies
├── frontend/
│   ├── home.html         # Home page with map
│   ├── scan.html         # QR scanner
│   ├── visited.html      # Visited locations
│   ├── profile.html      # User profile & badges
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker
│   └── icons/            # App icons
└── DEPLOYMENT.md         # Deployment guide
```

## API Endpoints

### User
- `GET /api/user.php?action=list` - List all users with points
- `GET /api/user.php?action=get_points&user_id=X` - Get user points

### Locations
- `GET /api/location.php?action=list` - List all locations
- `GET /api/location.php?action=nearby&lat=X&lon=Y&distance=150` - Find nearby locations

### Visits & Points
- `POST /api/visit.php?action=record` - Record location visit (+10 points)
- `POST /api/visit.php?action=upload_photo` - Upload location photo (+10 points if verified)
- `GET /api/visit.php?action=user_visited&user_id=X` - Get user's visited locations

### Badges
- `GET /api/badge.php?action=list` - List all badges
- `GET /api/badge.php?action=user_badges&user_id=X` - Get user's earned badges

### QR Codes
- `GET /api/qr.php` - List all QR codes
- `POST /api/generate_qr.php` - Generate new QR codes

## Admin Features

Access admin dashboard at `/backend/admin/dashboard.html`

- User management
- Location management
- Photo verification
- Badge management
- Leaderboard

## PWA Features

- ✅ Install on home screen
- ✅ Works offline
- ✅ Web push notifications
- ✅ Fast loading with service worker caching

## License

MIT License - Feel free to use and modify.

---

**Ready to deploy? Follow [DEPLOYMENT.md](DEPLOYMENT.md)**
