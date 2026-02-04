// Hamburger menu functionality
class HamburgerMenu {
  constructor() {
    this.hamburgerBtn = null;
    this.sideNav = null;
    this.overlay = null;
    this.mainNav = null;
    this.isOpen = false;
    
    this.init();
  }

  init() {
    // Create hamburger menu
    this.createHamburgerMenu();
    
    // Create side navigation
    this.createSideNav();
    
    // Create overlay
    this.createOverlay();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Get main navigation
    this.mainNav = document.querySelector('nav');
  }

  createHamburgerMenu() {
    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger-menu';
    hamburger.innerHTML = `
      <button class="hamburger-btn" aria-label="Toggle menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    `;
    document.body.appendChild(hamburger);
    this.hamburgerBtn = hamburger.querySelector('.hamburger-btn');
  }

  createSideNav() {
    const sideNav = document.createElement('nav');
    sideNav.className = 'side-nav';
    sideNav.setAttribute('role', 'navigation');
    sideNav.setAttribute('aria-label', 'Main navigation');
    
    // Get current page to determine active link
    const currentPath = window.location.pathname.split('/').pop() || 'home.html';
    
    sideNav.innerHTML = `
      <div class="side-nav-header">
        <h2>MauRichesse</h2>
      </div>
      <div class="side-nav-content">
        <div class="side-nav-links">
          <a href="home.html" class="${currentPath === 'home.html' ? 'active' : ''}">
            <span></span> Explore
          </a>
          <a href="scan.html" class="${currentPath === 'scan.html' ? 'active' : ''}">
            <span></span> Scan
          </a>
          <a href="visited.html" class="${currentPath === 'visited.html' ? 'active' : ''}">
            <span></span> Visited
          </a>
          <a href="profile.html" class="${currentPath === 'profile.html' ? 'active' : ''}">
            <span></span> Profile
          </a>
        </div>
        
        <div class="lang-group" style="margin-bottom: 20px;">
          <label for="sideNavLangSelect" style="color: var(--ivory); font-size: 0.9rem;">Language</label>
          <select id="sideNavLangSelect" style="width: 100%; margin-top: 4px; padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: var(--ivory);">
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
        
        <a href="../index.php" class="logout" style="color: #ff6b6b; display: flex; align-items: center; gap: 8px; padding: 12px 16px; text-decoration: none; border-radius: 8px; transition: background 0.2s ease;">
          <span>🚪</span> Logout
        </a>
      </div>
    `;
    
    document.body.appendChild(sideNav);
    this.sideNav = sideNav;
  }

  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'side-nav-overlay';
    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  setupEventListeners() {
    // Hamburger button click
    this.hamburgerBtn.addEventListener('click', () => this.toggle());
    
    // Overlay click
    this.overlay.addEventListener('click', () => this.close());
    
    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    
    // Language selector
    const langSelect = document.getElementById('sideNavLangSelect');
    if (langSelect) {
      langSelect.value = localStorage.getItem('mau_lang') || 'en';
      langSelect.addEventListener('change', (e) => {
        localStorage.setItem('mau_lang', e.target.value);
        if (window.applyClientLang) {
          window.applyClientLang(e.target.value);
        }
        // Also update main nav lang selector if exists
        const mainLangSelect = document.getElementById('clientLangSelect');
        if (mainLangSelect) {
          mainLangSelect.value = e.target.value;
        }
      });
    }
    
    // Handle link clicks
    const links = this.sideNav.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (!link.classList.contains('logout')) {
          setTimeout(() => this.close(), 100);
        }
      });
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.sideNav.classList.add('active');
    this.overlay.classList.add('active');
    this.hamburgerBtn.classList.add('active');
    this.hamburgerBtn.setAttribute('aria-expanded', 'true');
    
    if (this.mainNav) {
      this.mainNav.classList.add('side-nav-active');
    }
    
    // Focus management
    const firstLink = this.sideNav.querySelector('a');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  }

  close() {
    this.isOpen = false;
    this.sideNav.classList.remove('active');
    this.overlay.classList.remove('active');
    this.hamburgerBtn.classList.remove('active');
    this.hamburgerBtn.setAttribute('aria-expanded', 'false');
    
    if (this.mainNav) {
      this.mainNav.classList.remove('side-nav-active');
    }
  }
}

// Trail management for maps
class TrailManager {
  constructor(map) {
    this.map = map;
    this.trails = [];
    this.trailLines = [];
    this.trailMarkers = [];
  }

  async loadTrails() {
    try {
      const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/api').replace(/\/+$/, '');
      const response = await fetch(base + '/trail.php?action=list');
      const trails = await response.json();
      this.trails = trails;
      this.displayTrails();
    } catch (error) {
      console.error('Error loading trails:', error);
    }
  }

  displayTrails() {
    // Clear existing trails
    this.clearTrails();
    
    this.trails.forEach(trail => {
      if (trail.start_lat && trail.start_lng && trail.end_lat && trail.end_lng) {
        const startLatLng = [parseFloat(trail.start_lat), parseFloat(trail.start_lng)];
        const endLatLng = [parseFloat(trail.end_lat), parseFloat(trail.end_lng)];
        
        // Create trail line
        const trailLine = L.polyline([startLatLng, endLatLng], {
          className: 'leaflet-trail-line',
          weight: 4,
          opacity: 0.8,
          color: '#bfa86a',
          dashArray: '8, 4'
        }).addTo(this.map);
        
        // Add popup to trail
        const popupContent = `
          <div style="text-align: center;">
            <strong>${trail.trail_name}</strong>
            ${trail.description ? `<p style="margin: 8px 0; font-size: 0.9rem;">${trail.description}</p>` : ''}
            <small style="color: #666;">Trail from start to end point</small>
          </div>
        `;
        trailLine.bindPopup(popupContent);
        
        // Create start marker
        const startMarker = L.circleMarker(startLatLng, {
          radius: 8,
          fillColor: '#2ecc71',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(this.map);
        
        startMarker.bindPopup(`
          <div style="text-align: center;">
            <strong>Start: ${trail.trail_name}</strong>
            ${trail.description ? `<p style="margin: 8px 0; font-size: 0.9rem;">${trail.description}</p>` : ''}
          </div>
        `);
        
        // Create end marker
        const endMarker = L.circleMarker(endLatLng, {
          radius: 8,
          fillColor: '#e74c3c',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(this.map);
        
        endMarker.bindPopup(`
          <div style="text-align: center;">
            <strong>End: ${trail.trail_name}</strong>
            ${trail.description ? `<p style="margin: 8px 0; font-size: 0.9rem;">${trail.description}</p>` : ''}
          </div>
        `);
        
        this.trailLines.push(trailLine);
        this.trailMarkers.push(startMarker, endMarker);
      }
    });
  }

  clearTrails() {
    this.trailLines.forEach(line => this.map.removeLayer(line));
    this.trailMarkers.forEach(marker => this.map.removeLayer(marker));
    this.trailLines = [];
    this.trailMarkers = [];
  }
}

// Enhanced hint system
class HintSystem {
  constructor() {
    this.currentHintLevel = 0;
    this.maxHints = 3;
  }

  createHintContainer(hintData) {
    const container = document.createElement('div');
    container.className = 'hint-container';
    
    // Create hint buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'margin-bottom: 12px;';
    
    for (let i = 1; i <= this.maxHints; i++) {
      const btn = document.createElement('button');
      btn.className = 'hint-btn';
      btn.textContent = `Hint ${i}`;
      btn.onclick = () => this.revealHint(i, hintData, container);
      buttonsContainer.appendChild(btn);
    }
    
    container.appendChild(buttonsContainer);
    
    // Create hint content containers
    for (let i = 1; i <= this.maxHints; i++) {
      const hintContent = document.createElement('div');
      hintContent.className = 'hint-content';
      hintContent.id = `hint-${i}`;
      
      const hintKey = (i === 1) ? 'hint_text' : `hint_${i}`;
      const hintText = hintData[hintKey] || '';
      if (hintText) {
        hintContent.innerHTML = `<strong>Hint ${i}:</strong> ${hintText}`;
      } else {
        hintContent.innerHTML = `<em>Hint ${i} not available</em>`;
      }
      
      container.appendChild(hintContent);
    }
    
    return container;
  }

  revealHint(level, hintData, container) {
    const hintContent = container.querySelector(`#hint-${level}`);
    const button = container.querySelector(`.hint-btn:nth-child(${level})`);
    
    if (hintContent && button) {
      hintContent.classList.add('revealed');
      button.classList.add('revealed');
      button.disabled = true;
      
      // Reveal sequential hints
      for (let i = 1; i <= level; i++) {
        const prevHint = container.querySelector(`#hint-${i}`);
        const prevBtn = container.querySelector(`.hint-btn:nth-child(${i})`);
        if (prevHint && prevBtn) {
          prevHint.classList.add('revealed');
          prevBtn.classList.add('revealed');
          prevBtn.disabled = true;
        }
      }
    }
  }
}

// Enhanced badge system with point-based visibility
class BadgeSystem {
  constructor() {
    this.userPoints = 0;
  }

  async loadUserPoints() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return 0;
      
      const user = JSON.parse(userStr);
      const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/backend/api').replace(/\/+$/, '');
      const response = await fetch(`${base}/user.php?action=get_points&user_id=${user.user_id}`);
      const data = await response.json();
      
      this.userPoints = data.points || 0;
      return this.userPoints;
    } catch (error) {
      console.error('Error loading user points:', error);
      return 0;
    }
  }

  async loadBadges() {
    try {
      const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/backend/api').replace(/\/+$/, '');
      const [badgesResponse, userBadgesResponse] = await Promise.all([
        fetch(base + '/badge.php?action=list'),
        this.loadUserBadges()
      ]);
      
      const allBadges = await badgesResponse.json();
      const userBadges = await userBadgesResponse;
      const earnedBadgeIds = userBadges.map(b => b.badge_id);
      
      // Filter badges based on points
      const visibleBadges = allBadges.filter(badge => {
        const requiredPoints = this.getRequiredPoints(badge.criteria_type);
        return this.userPoints >= requiredPoints || earnedBadgeIds.includes(badge.badge_id);
      });
      
      return { badges: visibleBadges, earned: userBadges };
    } catch (error) {
      console.error('Error loading badges:', error);
      return { badges: [], earned: [] };
    }
  }

  async loadUserBadges() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return [];
      
      const user = JSON.parse(userStr);
      const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/backend/api').replace(/\/+$/, '');
      const response = await fetch(`${base}/badge.php?action=user_badges&user_id=${user.user_id}`);
      return await response.json();
    } catch (error) {
      console.error('Error loading user badges:', error);
      return [];
    }
  }

  getRequiredPoints(criteriaType) {
    const pointRequirements = {
      'bronze': 0,
      'silver': 50,
      'gold': 150,
      'platinum': 300,
      'diamond': 500
    };
    return pointRequirements[criteriaType] || 0;
  }

  renderBadges(container) {
    if (!container) return;
    
    this.loadUserPoints().then(() => {
      this.loadBadges().then(({ badges, earned }) => {
        const earnedIds = earned.map(b => b.badge_id);
        
        if (this.userPoints === 0) {
          container.innerHTML = `
            <div class="no-badges-message">
              <div class="icon">🔒</div>
              <h3>No Badges Yet</h3>
              <p>Start exploring and scanning QR codes to earn points and unlock badges!</p>
              <p style="font-size: 0.9rem; margin-top: 12px;">You need at least 1 point to unlock your first badge.</p>
            </div>
          `;
          return;
        }
        
        if (!badges.length) {
          container.innerHTML = '<p style="color:var(--muted);grid-column:1/-1;">No badges available.</p>';
          return;
        }
        
        container.innerHTML = badges.map(badge => {
          const has = earnedIds.includes(badge.badge_id);
          const requiredPoints = this.getRequiredPoints(badge.criteria_type);
          const isLocked = this.userPoints < requiredPoints && !has;
          
          return `
            <div class="badge-card ${isLocked ? 'locked' : ''}" style="text-align:center;padding:12px;background:var(--panel);border-radius:12px;border:2px solid ${has ? 'var(--accent)' : (isLocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)')}">
              <div style="width:56px;height:56px;margin:0 auto 8px;border-radius:50%;background:${has ? 'var(--accent)' : (isLocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)')};display:flex;align-items:center;justify-content:center;font-size:28px;">
                ${has ? '🏅' : (isLocked ? '🔒' : '🎯')}
              </div>
              <strong style="font-size:0.95rem">${badge.name || 'Badge'}</strong>
              ${badge.description ? `<p style="margin:6px 0 0;font-size:0.85rem;color:var(--muted)">${badge.description}</p>` : ''}
              ${isLocked ? `<small style="color:var(--muted)">Requires ${requiredPoints} points</small>` : ''}
              ${has ? '<small style="color:var(--accent)">Earned</small>' : ''}
            </div>
          `;
        }).join('');
      });
    });
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize hamburger menu
  window.hamburgerMenu = new HamburgerMenu();
  
  // Initialize badge system
  window.badgeSystem = new BadgeSystem();
  
  // Initialize hint system
  window.hintSystem = new HintSystem();
  
  // Trail manager is now initialized in app.js with the correct map reference
  // No need to initialize it here again
  
  // Update badges on profile page
  const badgesList = document.getElementById('badgesList');
  if (badgesList) {
    window.badgeSystem.renderBadges(badgesList);
  }
});
