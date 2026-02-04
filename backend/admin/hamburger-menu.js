// Admin hamburger menu functionality
class AdminHamburgerMenu {
  constructor() {
    this.hamburgerBtn = null;
    this.sideNav = null;
    this.overlay = null;
    this.dashboardWrapper = null;
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
    
    // Get dashboard wrapper
    this.dashboardWrapper = document.querySelector('.dashboard-wrapper');
  }

  createHamburgerMenu() {
    const hamburger = document.createElement('div');
    hamburger.className = 'admin-hamburger-menu';
    hamburger.innerHTML = `
      <button class="admin-hamburger-btn" aria-label="Toggle admin menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    `;
    document.body.appendChild(hamburger);
    this.hamburgerBtn = hamburger.querySelector('.admin-hamburger-btn');
  }

  createSideNav() {
    const sideNav = document.createElement('nav');
    sideNav.className = 'admin-side-nav';
    sideNav.setAttribute('role', 'navigation');
    sideNav.setAttribute('aria-label', 'Admin navigation');
    
    // Get current page to determine active tab
    const hash = window.location.hash ? window.location.hash.replace('#', '') : 'profile';
    
    sideNav.innerHTML = `
      <div class="admin-side-nav-header">
        <h2>Admin Panel</h2>
      </div>
      <div class="admin-side-nav-content">
        <div class="admin-side-nav-links">
          <a href="#profile" class="${hash === 'profile' ? 'active' : ''}" onclick="adminMenuNavigate('profile')">
            <span>👤</span> Profile
          </a>
          <a href="#admins" class="${hash === 'admins' ? 'active' : ''}" onclick="adminMenuNavigate('admins')">
            <span>👥</span> Admins
          </a>
          <a href="#categories" class="${hash === 'categories' ? 'active' : ''}" onclick="adminMenuNavigate('categories')">
            <span>📁</span> Categories
          </a>
          <a href="#locations" class="${hash === 'locations' ? 'active' : ''}" onclick="adminMenuNavigate('locations')">
            <span>📍</span> Locations
          </a>
          <a href="#gallery" class="${hash === 'gallery' ? 'active' : ''}" onclick="adminMenuNavigate('gallery')">
            <span>🖼️</span> Gallery
          </a>
          <a href="#qr" class="${hash === 'qr' ? 'active' : ''}" onclick="adminMenuNavigate('qr')">
            <span>📱</span> QR Codes
          </a>
          <a href="#funfacts" class="${hash === 'funfacts' ? 'active' : ''}" onclick="adminMenuNavigate('funfacts')">
            <span>💡</span> Fun Facts
          </a>
          <a href="#users" class="${hash === 'users' ? 'active' : ''}" onclick="adminMenuNavigate('users')">
            <span>🧑</span> Users
          </a>
          <a href="#trails" class="${hash === 'trails' ? 'active' : ''}" onclick="adminMenuNavigate('trails')">
            <span>🥾</span> Trails
          </a>
          <a href="#api-docs" class="${hash === 'api-docs' ? 'active' : ''}" onclick="adminMenuNavigate('api-docs')">
            <span>📚</span> API Docs
          </a>
        </div>
        
        <div class="admin-stats-mini">
          <div class="admin-stat-mini">
            <div class="number" id="mini-stat-admins">0</div>
            <div class="label">Admins</div>
          </div>
          <div class="admin-stat-mini">
            <div class="number" id="mini-stat-users">0</div>
            <div class="label">Users</div>
          </div>
          <div class="admin-stat-mini">
            <div class="number" id="mini-stat-locations">0</div>
            <div class="label">Locations</div>
          </div>
          <div class="admin-stat-mini">
            <div class="number" id="mini-stat-qr">0</div>
            <div class="label">QR Codes</div>
          </div>
        </div>
        
        <div class="admin-quick-actions">
          <button onclick="refreshAllData()">
            <span>🔄</span> Refresh All Data
          </button>
          <button onclick="exportData()">
            <span>📊</span> Export Data
          </button>
          <button onclick="showSystemInfo()">
            <span>ℹ️</span> System Info
          </button>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
          <div class="lang-group">
            <label for="adminNavLangSelect" style="color: var(--ivory); font-size: 0.9rem;">Language</label>
            <select id="adminNavLangSelect" style="width: 100%; margin-top: 4px; padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: var(--ivory);">
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
        
        <button onclick="logout()" style="margin-top: 20px; width: 100%; background: #e74c3c; border: none; color: white; padding: 12px; border-radius: 6px; cursor: pointer;">
          <span>🚪</span> Logout
        </button>
      </div>
    `;
    
    document.body.appendChild(sideNav);
    this.sideNav = sideNav;
  }

  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'admin-side-nav-overlay';
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
    const langSelect = document.getElementById('adminNavLangSelect');
    if (langSelect) {
      langSelect.value = localStorage.getItem('mau_lang') || 'en';
      langSelect.addEventListener('change', (e) => {
        localStorage.setItem('mau_lang', e.target.value);
        if (window.applyAdminLanguage) {
          window.applyAdminLanguage(e.target.value);
        }
        // Also update main lang selector if exists
        const mainLangSelect = document.getElementById('adminLangSelect');
        if (mainLangSelect) {
          mainLangSelect.value = e.target.value;
        }
      });
    }
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
    
    if (this.dashboardWrapper) {
      this.dashboardWrapper.classList.add('side-nav-active');
    }
    
    // Update mini stats
    this.updateMiniStats();
    
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
    
    if (this.dashboardWrapper) {
      this.dashboardWrapper.classList.remove('side-nav-active');
    }
  }

  updateMiniStats() {
    // Update mini stats from main dashboard
    const statElements = {
      'mini-stat-admins': 'statAdmins',
      'mini-stat-users': 'statUsers', 
      'mini-stat-locations': 'statLocations',
      'mini-stat-qr': 'statQR'
    };
    
    Object.keys(statElements).forEach(miniId => {
      const mainStatId = statElements[miniId];
      const mainElement = document.getElementById(mainStatId);
      const miniElement = document.getElementById(miniId);
      
      if (mainElement && miniElement) {
        miniElement.textContent = mainElement.textContent || '0';
      }
    });
  }

  setActiveTab(tabName) {
    // Update active state in side nav
    const links = this.sideNav.querySelectorAll('.admin-side-nav-links a');
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${tabName}` || 
          link.getAttribute('onclick')?.includes(tabName)) {
        link.classList.add('active');
      }
    });
  }
}

// Admin navigation functions
function adminMenuNavigate(tabName) {
  // Close the side nav
  if (window.adminHamburgerMenu) {
    window.adminHamburgerMenu.close();
  }
  
  // Navigate to the tab
  if (window.openTab) {
    // Create a mock event object
    const mockEvent = {
      currentTarget: document.querySelector(`.tablink[data-tab="${tabName}"]`) ||
                     document.querySelector(`.tablink[onclick*="${tabName}"]`) ||
                     document.querySelector(`button[onclick*="${tabName}"]`)
    };
    
    window.openTab(mockEvent, tabName);
  }
}

function refreshAllData() {
  // Reload all data functions
  const dataLoaders = [
    'loadAdmins',
    'loadCategories', 
    'loadLocations',
    'loadGallery',
    'loadQR',
    'loadFunFacts',
    'loadUsers'
  ];
  
  dataLoaders.forEach(loader => {
    if (window[loader]) {
      try {
        window[loader]();
      } catch (e) {
        console.warn(`Failed to load ${loader}:`, e);
      }
    }
  });
  
  // Show success message
  alert('All data refreshed successfully!');
  
  // Update mini stats
  if (window.adminHamburgerMenu) {
    window.adminHamburgerMenu.updateMiniStats();
  }
}

function exportData() {
  // Create a simple export of current data
  const exportData = {
    timestamp: new Date().toISOString(),
    stats: {
      admins: document.getElementById('statAdmins')?.textContent || '0',
      categories: document.getElementById('statCategories')?.textContent || '0',
      locations: document.getElementById('statLocations')?.textContent || '0',
      qr_codes: document.getElementById('statQR')?.textContent || '0',
      fun_facts: document.getElementById('statFunFacts')?.textContent || '0',
      users: document.getElementById('statUsers')?.textContent || '0',
      gallery: document.getElementById('statGallery')?.textContent || '0'
    }
  };
  
  // Create and download JSON file
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `mauheritage-admin-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function showSystemInfo() {
  const info = `
MauHeritage Admin System Information

Version: 1.0.0
Browser: ${navigator.userAgent}
Screen: ${screen.width}x${screen.height}
Language: ${localStorage.getItem('mau_lang') || 'en'}
Last Updated: ${new Date().toLocaleString()}

Features:
- User Management
- Location Management  
- QR Code Generation
- Gallery Management
- Fun Facts & Trails
- Real-time Statistics
- Multi-language Support
  `;
  
  alert(info);
}

// Initialize admin hamburger menu when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize hamburger menu
  window.adminHamburgerMenu = new AdminHamburgerMenu();
  
  // Update active tab when hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash ? window.location.hash.replace('#', '') : 'profile';
    if (window.adminHamburgerMenu) {
      window.adminHamburgerMenu.setActiveTab(hash);
    }
  });
  
  // Override the openTab function to update side nav
  const originalOpenTab = window.openTab;
  if (originalOpenTab) {
    window.openTab = function(evt, tabName) {
      // Call original function
      originalOpenTab(evt, tabName);
      
      // Update side nav active state
      if (window.adminHamburgerMenu) {
        window.adminHamburgerMenu.setActiveTab(tabName);
      }
    };
  }
});
