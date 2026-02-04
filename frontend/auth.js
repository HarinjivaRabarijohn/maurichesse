// User authentication functions (login/register)
function showTab(tab){
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).classList.add('active');

    // Clear errors
    document.querySelectorAll('.error').forEach(e => e.innerText = '');
}

/* ================= LOGIN ================= */
function login(){
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    if(!identifier || !password){
        errorEl.innerText = "Please fill all fields";
        return;
    }

    errorEl.innerText = "Logging in...";
    const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/backend/api').replace(/\/+$/, '');
    
    console.log('[AUTH] Login attempt:', {identifier, apiBase: base});

    fetch(base + '/user_login.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({identifier, password})
    })
    .then(res => {
        console.log('[AUTH] Response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    })
    .then(user => {
        console.log('[AUTH] Response data:', user);
        if(user.success){
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify({
                user_id: user.user_id,
                username: user.username,
                email: user.email
            }));
            console.log('[AUTH] User stored in localStorage');
            window.location.href = 'home.html';
        } else {
            errorEl.innerText = user.error || "Invalid username/email or password";
            console.log('[AUTH] Login failed:', user.error);
        }
    })
    .catch(err => {
        console.error('[AUTH] Error:', err);
        errorEl.innerText = "Server error: " + err.message;
    });
}

/* ================= REGISTER ================= */
function register(){
    const username = document.getElementById('regUsername').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    const errorBox = document.getElementById('registerError');

    // Validation
    if(!username || !email || !password){
        errorBox.innerText = "All fields are required";
        return;
    }

    if(!email.match(/^\S+@\S+\.\S+$/)){
        errorBox.innerText = "Invalid email format";
        return;
    }

    if(password.length < 6){
        errorBox.innerText = "Password must be at least 6 characters";
        return;
    }

    errorBox.innerText = "Creating account...";
    const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/api').replace(/\/+$/, '');

    console.log('[AUTH] Register attempt:', {username, email, apiBase: base});

    fetch(base + '/user_register.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({username, email, password})
    })
    .then(res => {
        console.log('[AUTH] Response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    })
    .then(data => {
        console.log('[AUTH] Response data:', data);
        if(data.success){
            // Auto-login after registration
            localStorage.setItem('user', JSON.stringify({
                user_id: data.user_id,
                username: username,
                email: email
            }));
            console.log('[AUTH] User registered and stored in localStorage');
            alert("Registration successful! You are now logged in.");
            window.location.href = 'home.html';
        } else {
            errorBox.innerText = data.error || "Registration failed";
            console.log('[AUTH] Register failed:', data.error);
        }
    })
    .catch(err => {
        console.error('[AUTH] Error:', err);
        errorBox.innerText = "Server error: " + err.message;
    });
}

// Small client-side auth / UI helpers (logout + language selector)
function logout(e){
  try{ localStorage.removeItem('user'); localStorage.removeItem('admin'); }catch(e){}
  if(e && e.preventDefault){ e.preventDefault(); }
  // return to frontend index (works for /frontend/* and subfolder setups)
  const basePath = location.pathname.replace(/[^/]*$/, '');
  window.location.href = location.origin + basePath + 'index.html';
  return false;
}

function applyClientLangSimple(lang){
  const navLinks = document.querySelectorAll('nav a');
  // support 4-item nav: Explore, Scan, Visited, Profile
  if(navLinks && navLinks.length >= 4){
    navLinks[0].innerText = (lang === 'fr') ? 'Explorer' : 'Explore';
    navLinks[1].innerText = (lang === 'fr') ? 'Scanner' : 'Scan';
    navLinks[2].innerText = (lang === 'fr') ? 'Visités' : 'Visited';
    navLinks[3].innerText = (lang === 'fr') ? 'Profil' : 'Profile';
  } else if(navLinks && navLinks.length >= 3) {
    // graceful fallback for older layouts
    navLinks[0].innerText = (lang === 'fr') ? 'Explorer' : 'Explore';
    navLinks[1].innerText = (lang === 'fr') ? 'Scanner' : 'Scan';
    navLinks[2].innerText = (lang === 'fr') ? 'Profil' : 'Profile';
  }
  const logoutEl = document.querySelector('nav a.logout'); if(logoutEl) logoutEl.innerText = (lang === 'fr') ? 'Se déconnecter' : 'Logout';
}

// Profile editing (client)
function _getStoredUser(){
  try{ const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; } catch(e){ return null; }
}
function _setStoredUser(u){ try{ localStorage.setItem('user', JSON.stringify(u)); }catch(e){} }

function openClientProfileModal(){
  const modal = document.getElementById('clientProfileModal');
  const err = document.getElementById('clientProfileError');
  err.innerText = '';
  const stored = _getStoredUser();
  document.getElementById('client_profile_username').value = stored?.username || document.getElementById('profileUsername')?.innerText || '';
  document.getElementById('client_profile_email').value = stored?.email || document.getElementById('profileEmail')?.innerText || '';
  document.getElementById('client_profile_about').value = stored?.about || document.getElementById('profileAbout')?.innerText || '';
  document.getElementById('client_profile_password').value = '';
  modal.setAttribute('aria-hidden','false');
}

async function saveClientProfile(){
  const err = document.getElementById('clientProfileError'); err.innerText = '';
  const modal = document.getElementById('clientProfileModal');
  const username = document.getElementById('client_profile_username').value.trim();
  const email = document.getElementById('client_profile_email').value.trim();
  const about = document.getElementById('client_profile_about').value.trim();
  const password = document.getElementById('client_profile_password').value;
  if(!username || !email){ err.innerText = 'Username and email required'; return; }

  const stored = _getStoredUser() || {};
  stored.username = username; stored.email = email; stored.about = about;
  // update local UI immediately
  document.getElementById('profileUsername').innerText = username;
  document.getElementById('profileEmail').innerText = email;
  document.getElementById('profileAbout').innerText = about || '—';

  // if we have a user_id, attempt server update
  if(stored.user_id){
    try{
      const body = { user_id: stored.user_id, username, email };
      if(password) body.password = password;
      const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/api').replace(/\/+$/, '');
      const res = await fetch(base + '/user.php?action=update', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const j = await res.json();
      if(!res.ok || j.success === false){ throw new Error(j.message || 'Update failed'); }
      // persist server-updated info
      _setStoredUser(stored);
      modal.setAttribute('aria-hidden','true');
      alert(j.message || 'Profile updated');
      return;
    } catch(err){ console.error(err); err.innerText = err.message || 'Failed to update profile on server'; return; }
  }

  // otherwise persist locally and close
  _setStoredUser(stored);
  modal.setAttribute('aria-hidden','true');
  alert((localStorage.getItem('mau_lang')==='fr') ? 'Profil mis à jour (localement)' : 'Profile updated (local)');
}

// Wire modal buttons & edit btn
document.addEventListener('DOMContentLoaded', ()=>{
  const editBtn = document.getElementById('editProfileBtn'); if(editBtn) editBtn.addEventListener('click', openClientProfileModal);
  const saveBtn = document.getElementById('clientProfileSave'); if(saveBtn) saveBtn.addEventListener('click', saveClientProfile);
  const cancelBtn = document.getElementById('clientProfileCancel'); if(cancelBtn) cancelBtn.addEventListener('click', ()=> document.getElementById('clientProfileModal').setAttribute('aria-hidden','true'));
  const backdrop = document.querySelector('#clientProfileModal .modal-backdrop'); if(backdrop) backdrop.addEventListener('click', ()=> document.getElementById('clientProfileModal').setAttribute('aria-hidden','true'));

  // Profile page: show guest block or profile content; fill from session
  const stored = _getStoredUser();
  const profileGuest = document.getElementById('profileGuest');
  const profileContent = document.getElementById('profileContent');
  if(profileGuest && profileContent){
    if(stored && (stored.username || stored.user_id)){
      profileGuest.style.display = 'none';
      profileContent.style.display = 'block';
      const un = document.getElementById('profileUsername'); if(un) un.innerText = stored.username || 'User';
      const em = document.getElementById('profileEmail'); if(em) em.innerText = stored.email || '—';
      const ab = document.getElementById('profileAbout'); if(ab) ab.innerText = stored.about || 'No bio yet. Tap "Edit profile" to add a short description.';
      const av = document.getElementById('profileAvatar'); if(av) av.innerText = (stored.username || 'U').slice(0,2).toUpperCase();
    } else {
      profileGuest.style.display = 'block';
      profileContent.style.display = 'none';
    }
  } else if(stored){
    const un = document.getElementById('profileUsername'); if(un) un.innerText = stored.username || 'User';
    const em = document.getElementById('profileEmail'); if(em) em.innerText = stored.email || '—';
    const ab = document.getElementById('profileAbout'); if(ab) ab.innerText = stored.about || '—';
  }

  // render visited sites from localStorage (exposed)
  function renderVisited(){
    const list = document.getElementById('visitedList') || document.getElementById('visitedItems') || document.getElementById('visitedItemsMain');
    const scans = JSON.parse(localStorage.getItem('mau_scans') || '[]');
    if(!list) return scans;
    if(!scans.length){ list.innerHTML = '<p style="opacity:0.8">No sites visited yet.</p>'; return scans; }
    list.innerHTML = scans.map(s => `<div style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.03)"><div style="display:flex;justify-content:space-between"><strong>${s.code}</strong><small style="opacity:0.75">${new Date(s.at).toLocaleString()}</small></div><div style="color:var(--muted);margin-top:6px">${s.fact || ''}</div></div>`).join('');
    return scans;
  }
  // expose globally
  window.renderVisitedList = renderVisited;
  renderVisited();
  document.addEventListener('scans:changed', e=>{ renderVisited(); });

});

// Wire language selector on pages that don't load the full app.js
document.addEventListener('DOMContentLoaded', ()=>{
  const sel = document.getElementById('clientLangSelect');
  const current = localStorage.getItem('mau_lang') || 'en';
  if(sel){ sel.value = current; sel.addEventListener('change', e => { localStorage.setItem('mau_lang', e.target.value); applyClientLangSimple(e.target.value); }); }
  applyClientLangSimple(current);

  // Hamburger: toggle nav drawer (left)
  const hamburger = document.getElementById('navHamburger');
  const clientNav = document.getElementById('clientNav');
  if(hamburger && clientNav){
    hamburger.addEventListener('click', ()=>{
      const open = clientNav.getAttribute('aria-hidden') !== 'false';
      clientNav.setAttribute('aria-hidden', open ? 'false' : 'true');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    clientNav.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        if(window.innerWidth <= 768){ clientNav.setAttribute('aria-hidden', 'true'); hamburger.setAttribute('aria-expanded', 'false'); }
      });
    });
  }

  // Guest vs logged-in: show Profile or Login/Register
  const user = _getStoredUser();
  const profileLink = document.querySelector('.nav-profile-link');
  const loginLink = document.querySelector('.nav-login-link');
  const registerLink = document.querySelector('.nav-register-link');
  if(profileLink){
    if(user && (user.username || user.user_id)){
      profileLink.style.display = '';
      if(loginLink) loginLink.style.display = 'none';
      if(registerLink) registerLink.style.display = 'none';
    } else {
      profileLink.style.display = 'none';
      if(loginLink) loginLink.style.display = '';
      if(registerLink) registerLink.style.display = '';
    }
  }
});