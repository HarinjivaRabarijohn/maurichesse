if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log('Service Worker registered', reg))
    .catch(err => console.error('Service Worker error', err));
}

// Language for client UI
const clientLang = localStorage.getItem('mau_lang') || 'en';
function applyClientLang(lang){
  const navLinks = document.querySelectorAll('nav a');
  // expected nav: Explore, Scan, Visited, Profile
  if(navLinks && navLinks.length >= 4){
    navLinks[0].innerText = (lang === 'fr') ? 'Explorer' : 'Explore';
    navLinks[1].innerText = (lang === 'fr') ? 'Scanner' : 'Scan';
    navLinks[2].innerText = (lang === 'fr') ? 'Visités' : 'Visited';
    navLinks[3].innerText = (lang === 'fr') ? 'Profil' : 'Profile';
  } else if(navLinks && navLinks.length >= 3){
    navLinks[0].innerText = (lang === 'fr') ? 'Explorer' : 'Explore';
    navLinks[1].innerText = (lang === 'fr') ? 'Scanner' : 'Scan';
    navLinks[2].innerText = (lang === 'fr') ? 'Profil' : 'Profile';
  }
  const logout = document.querySelector('nav a.logout'); if(logout) logout.innerText = (lang === 'fr') ? 'Se déconnecter' : 'Logout';
}

function initSplashScreen(){
  const splash = document.getElementById('splashScreen');
  if(!splash) return;
  document.body.classList.add('splash-active');

  const endSplash = () => {
    splash.classList.add('splash-hide');
    document.body.classList.remove('splash-active');
    setTimeout(() => { try { splash.remove(); } catch(e){} }, 450);
    window.removeEventListener('wheel', quickDismiss, { passive: true });
    window.removeEventListener('touchmove', quickDismiss, { passive: true });
    window.removeEventListener('click', quickDismiss);
  };

  // Auto dismiss after 3 seconds
  setTimeout(endSplash, 3000);

  // Or dismiss on click/scroll
  const quickDismiss = () => endSplash();

  window.addEventListener('wheel', quickDismiss, { passive: true });
  window.addEventListener('touchmove', quickDismiss, { passive: true });
  window.addEventListener('click', quickDismiss);
}

document.addEventListener('DOMContentLoaded', ()=>{
  initSplashScreen();
  const sel = document.getElementById('clientLangSelect');
  if(sel){ sel.value = clientLang; sel.addEventListener('change', e => { localStorage.setItem('mau_lang', e.target.value); applyClientLang(e.target.value); }); }
  applyClientLang(clientLang);

  // request location permission with a friendly prompt
  try{
    if('permissions' in navigator){
      navigator.permissions.query({name:'geolocation'}).then(p => {
        if(p.state === 'prompt'){
          // ask user with an explanatory dialog
          setTimeout(()=>{
            if(confirm((localStorage.getItem('mau_lang')==='fr') ? 'Autoriser MauRichesse à accéder à votre position pour centrer la carte ?' : 'Allow MauRichesse to access your location to center the map?')){
              navigator.geolocation.getCurrentPosition(gotPosition, geoError, {enableHighAccuracy:true, timeout:8000});
            }
          }, 600);
        } else if(p.state === 'granted'){
          navigator.geolocation.getCurrentPosition(gotPosition, geoError, {enableHighAccuracy:true});
        }
      }).catch(()=>{/* ignore */});
    } else {
      // fallback: still try to get position
      navigator.geolocation.getCurrentPosition(gotPosition, ()=>{}, {timeout:5000});
    }
  }catch(e){ /* ignore */ }
});

// Map initialization + layers (safely run after DOM ready and verify Leaflet loaded)
function _initMapSafely(){
  const mapEl = document.getElementById('map');
  if(typeof L === 'undefined'){
    if(mapEl) mapEl.innerHTML = '<div style="padding:20px;color:#fff;opacity:0.9">Map library failed to load — check network or disable strict SRI.</div>';
    console.error('Leaflet (L) is not available');
    return null;
  }

  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' });
  const imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' });

  const map = L.map('map', { center: [-20.3484, 57.5522], zoom: 9, layers: [osm] });
  const baseLayers = { 'OSM': osm, 'Imagery': imagery };
  L.control.layers(baseLayers).addTo(map);
  L.control.scale().addTo(map);

  // ensure map renders correctly when hidden / after CSS/layout changes
  setTimeout(()=>{ try{ map.invalidateSize(); }catch(e){} }, 250);
  window.addEventListener('resize', ()=> map.invalidateSize());
  return { map, baseLayers };
}

// create map after DOMContentLoaded if needed
let __mapHandle = null;
function ensureMap(){
  if(__mapHandle) return __mapHandle;
  __mapHandle = _initMapSafely();
  return __mapHandle;
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ()=>{
    const mh = ensureMap();
    if(!mh) return;
    window._mau_map = mh.map; window._mau_layers = mh.baseLayers;
    
    // Initialize trail manager if available
    if (window.TrailManager) {
      window.trailManager = new TrailManager(mh.map);
      window.trailManager.loadTrails();
    }
  });
} else {
  const mh = ensureMap(); 
  if(mh){ 
    window._mau_map = mh.map; window._mau_layers = mh.baseLayers;
    
    // Initialize trail manager if available
    if (window.TrailManager) {
      window.trailManager = new TrailManager(mh.map);
      window.trailManager.loadTrails();
    }
  }
}

// helper: create a colored pin icon (SVG) similar to default marker
function createPinIcon(color){
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 32 48"><path d="M16 0C9.373 0 4 5.373 4 12c0 9.333 12 24 12 24s12-14.667 12-24C28 5.373 22.627 0 16 0z" fill="' + color + '"/><circle cx="16" cy="12" r="5" fill="#fff" opacity="0.9"/></svg>';
  return L.icon({
    iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg),
    iconSize: [32,48],
    iconAnchor: [16,48],
    popupAnchor: [0,-40]
  });
}

// Helper to resolve image paths returned by the API into client-visible URLs.
function getImageSrc(loc){
  const placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360" fill="none"><rect width="600" height="360" fill="%230e2b20"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23aab9a3" font-family="Inter,Arial" font-size="24">No image</text></svg>');
  if(!loc) return placeholder;
  let img = loc.image || loc.img || loc.image_path || '';
  img = (typeof img === 'string') ? img.trim() : '';
  if(!img) return placeholder;
  const apiBase = (window.getApiBase ? window.getApiBase() : '').replace(/\/+$/, '');
  const baseRoot = apiBase ? apiBase.replace(/\/api\/?$/i, '') : '';
  const uploadsRoot = baseRoot ? baseRoot : '';
  // if already an absolute URL, use it
  if(/^https?:\/\//i.test(img)) return img;
  // if the API returned a path starting with uploads/... (common)
  if(/^uploads\//i.test(img)) return (uploadsRoot ? uploadsRoot + '/' : '/') + img.replace(/^\/+/, '');
  // if it's an absolute-root path (/uploads/...), prefix with backend root
  if(img.startsWith('/')) return uploadsRoot ? uploadsRoot + img : img;
  // otherwise try to resolve relative to uploads/locations
  return (uploadsRoot ? uploadsRoot : '') + '/uploads/locations/' + img.replace(/^\/+/, '');
}

let userMarker = null;
function gotPosition(pos){
  const map = window._mau_map;
  if(!map) return;
  const { latitude, longitude } = pos.coords;
  try{
    const redIcon = createPinIcon('#e74c3c');
    if(userMarker){ 
      userMarker.setLatLng([latitude, longitude]); 
      userMarker.setIcon(redIcon); 
    }
    else {
      userMarker = L.marker([latitude, longitude], { icon: redIcon, title: 'You', zIndexOffset: 1000 }).addTo(map).bindPopup((localStorage.getItem('mau_lang')==='fr') ? 'Vous êtes ici' : 'You are here');
    }
    userMarker.setZIndexOffset(1000);
    // bringToFront is not a standard Leaflet method for markers - removed
    map.setView([latitude, longitude], 14);
  }catch(e){
    if(userMarker) userMarker.setLatLng([latitude, longitude]);
    else userMarker = L.circleMarker([latitude, longitude], { radius:10, color:'#e74c3c', fillColor:'#e74c3c', fillOpacity:0.95, zIndexOffset: 1000 }).addTo(map).bindPopup((localStorage.getItem('mau_lang')==='fr') ? 'Vous êtes ici' : 'You are here');
    map.setView([latitude, longitude], 14);
  }
}
function geoError(err){ console.warn('geo error', err); }
function centerOnUserLocation(){
  if(!navigator.geolocation){ alert('Geolocation not supported'); return; }
  navigator.geolocation.getCurrentPosition(gotPosition, function(){ alert((localStorage.getItem('mau_lang')==='fr') ? 'Impossible d\'obtenir votre position.' : 'Could not get your location.'); }, { enableHighAccuracy: true, timeout: 10000 });
}

// Load locations and add markers + grid cards (ensure map exists)
function loadAndRenderLocations(){
  const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/api').replace(/\/+$/, '');

  fetch(base + '/location.php?action=list')
  .then(r=>{ if(!r.ok) throw new Error(r.status + ' ' + r.statusText); return r.json(); })
  .then(data => {
    console.debug('loadAndRenderLocations — rows:', Array.isArray(data)?data.length:typeof data, data && data.slice ? undefined : data);
    window._mau_locationData = data;

    const grid = document.getElementById('locations');
    const mh = ensureMap();

    // If the map library failed, still render cards so UI is useful and indicate missing coords
    if(!mh){
      if(grid){
        grid.innerHTML = '';
        data.forEach(loc => {
          grid.innerHTML += `<div class="card"><img src="${getImageSrc(loc)}" alt="${loc.name || ''}"><div class="card-content"><h3>${loc.name}</h3><p>${loc.description || ''}</p><small>${loc.address || ''}</small></div></div>`;
        });
      }
      return;
    }

    const map = mh.map;
    // expose marker group for debugging and later interactions - use FeatureGroup for getBounds support
    if(window._mau_locMarkers){ window._mau_locMarkers.clearLayers(); };
    const markerGroup = (window._mau_locMarkers = L.featureGroup().addTo(map));

    if(!Array.isArray(data) || !data.length){
      console.info('No locations returned from API');
      if(grid) grid.innerHTML = '<div class="card"><div class="card-content"><p style="opacity:0.8">No locations available.</p></div></div>';
      return;
    }

    data.forEach((loc, idx) => {
      const id = loc.location_id ?? idx;
      // render card with data-id so we can open details
      if(grid) grid.innerHTML += `
        <div class="card loc-card" data-id="${id}" role="button" tabindex="0" aria-pressed="false" style="cursor:pointer">
          <img src="${getImageSrc(loc)}" alt="${loc.name || ''}">
          <div class="card-content">
            <h3>${loc.name}</h3>
            <p>${loc.description ? (loc.description.length>120?loc.description.slice(0,117)+'…':loc.description) : ''}</p>
            <small>${loc.address || ''}</small>
          </div>
        </div>
      `;

      // then try to render marker
      const rawLat = loc.latitude ?? loc.lat ?? loc.latitude_deg ?? '';
      const rawLng = loc.longitude ?? loc.lng ?? loc.longitude_deg ?? '';
      const lat = parseFloat(rawLat);
      const lng = parseFloat(rawLng);
      if(!isFinite(lat) || !isFinite(lng)){
        console.warn(`Skipping location ${loc.location_id || idx} — invalid coords:`, rawLat, rawLng);
        return;
      }

      try{
        const locIcon = createPinIcon('#2bb3c0');
        const marker = L.marker([lat, lng], { title: loc.name || ('Site ' + id), icon: locIcon }).addTo(markerGroup);
        const registered = loc.registered || loc.is_registered || false;
        marker.bindPopup(`<div style="min-width:180px"><b>${loc.name}</b><div style="margin-top:6px;color:var(--muted)">${loc.address || ''}</div><div style="margin-top:8px"><a href=\"#\" data-id=\"${id}\" class=\"loc-details-link\">View details</a></div></div>`);
        // open details when popup link clicked
        marker.on('popupopen', e => {
          const el = e.popup.getElement();
          const link = el && el.querySelector('.loc-details-link');
          if(link) link.addEventListener('click', (ev)=>{ ev.preventDefault(); showLocationDetails(link.dataset.id); });
        });
      }catch(err){ console.error('Failed to add marker for', loc, err); }
    });

    // card keyboard / click delegation
    if(grid){
      grid.addEventListener('click', e=>{
        const card = e.target.closest('.loc-card'); if(!card) return; showLocationDetails(card.dataset.id);
      });
      grid.addEventListener('keydown', e=>{ if(e.key === 'Enter' || e.key === ' ') { const card = e.target.closest('.loc-card'); if(card) { e.preventDefault(); showLocationDetails(card.dataset.id); } } });
    }

    // fit map to markers if any (unless focus params set)
    var urlParams = new URLSearchParams(window.location.search);
    var focusLat = urlParams.get('lat'); var focusLng = urlParams.get('lng');
    if (focusLat != null && focusLng != null && isFinite(parseFloat(focusLat)) && isFinite(parseFloat(focusLng))) {
      map.setView([parseFloat(focusLat), parseFloat(focusLng)], 15);
    } else {
      try { if (markerGroup.getLayers().length) map.fitBounds(markerGroup.getBounds().pad(0.15)); } catch (e) { console.warn('fitBounds failed', e); }
    }

    // Load trails (polylines) and hidden items (markers)
    loadTrailsAndHiddenItems(map);

    // showLocationDetails: aggregate related data (qr, gallery, fun-facts) and render modal
    async function showLocationDetails(id){
      // ensure we have the location object
      const loc = (Array.isArray(window._mau_locationData) ? window._mau_locationData.find(x => String(x.location_id) === String(id)) : null) || null;
      if(!loc){
        console.warn('Location not found locally, fetching full list');
        try{ const list = await fetch(base + '/location.php?action=list').then(r=>r.json()); window._mau_locationData = list; }
        catch(e){ return alert('Failed to load location details'); }
      }
      const locationObj = (window._mau_locationData||[]).find(x => String(x.location_id) === String(id));
      if(!locationObj) return alert('Location not found');

      const modal = document.getElementById('locationDetailModal');
      const title = document.getElementById('locationDetailTitle');
      const meta = document.getElementById('locationDetailMeta');
      const desc = document.getElementById('locationDetailDescription');
      const img = document.getElementById('locationDetailImage');
      const extras = document.getElementById('locationDetailExtras');
      const related = document.getElementById('locationRelated');

      title.innerText = locationObj.name || '—';
      img.src = getImageSrc(locationObj);
      img.alt = locationObj.name || '';
      meta.innerText = `${locationObj.category_name || 'Uncategorized'} • ${locationObj.latitude || ''}, ${locationObj.longitude || ''} ${locationObj.address? '• ' + locationObj.address : ''}`;
      desc.innerText = locationObj.description || locationObj.history || 'No description available.';
      extras.innerHTML = `
        <div style="padding:8px;border-radius:10px;background:var(--panel);">Created <br><strong style="color:var(--accent)">${locationObj.created_at || '—'}</strong></div>
        <div style="padding:8px;border-radius:10px;background:var(--panel);">Category <br><strong style="color:var(--accent)">${locationObj.category_name || '—'}</strong></div>
        <div style="padding:8px;border-radius:10px;background:var(--panel);">Coordinates <br><strong style="color:var(--accent)">${locationObj.latitude || '—'}, ${locationObj.longitude || '—'}</strong></div>
      `;
      related.innerHTML = '<small style="color:var(--muted)">Loading related data…</small>';
      modal.setAttribute('aria-hidden','false');

      const baseRoot = base.replace(/\/api\/?$/i, '');

      // fetch related resources in parallel (graceful)
      const endpoints = [
        fetch(base + '/qr.php?action=list').then(r=>r.json()).catch(()=>[]),
        fetch(base + '/gallery.php?action=list').then(r=>r.json()).catch(()=>[]),
        fetch(base + '/fun_fact.php?action=list').then(r=>r.json()).catch(()=>[])
      ];

      const [qrs, gallery, facts] = await Promise.all(endpoints);
      const myQrs = (Array.isArray(qrs) ? qrs.filter(q => String(q.location_id) === String(id)) : []);
      const myGallery = (Array.isArray(gallery) ? gallery.filter(g => String(g.location_id) === String(id)) : []);
      var myFacts = (Array.isArray(facts) ? facts.filter(f => myQrs.some(q => String(q.qr_id) === String(f.qr_id))) : []);

      related.innerHTML = `
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <div style="min-width:220px;flex:1"><h4 style="margin:0 0 8px 0">Gallery</h4>${myGallery.length ? myGallery.slice(0,6).map(g=>`<img src="${(g.image_path && g.image_path.startsWith('uploads/'))?(baseRoot + '/' + g.image_path):(g.image_path||'')}" style="width:80px;height:64px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,0.03);margin-right:6px" onerror="this.style.display='none'">`).join('') : '<div style="color:var(--muted)">No gallery images</div>'}</div>
          <div style="min-width:220px;flex:1"><h4 style="margin:0 0 8px 0">QR codes</h4>${myQrs.length ? '<ul style="margin:0;padding-left:18px">' + myQrs.map(q=>`<li><strong>${(q.qr_code||'').replace(/</g,'&lt;')}</strong></li>`).join('') + '</ul>' : '<div style="color:var(--muted)">No QR codes linked</div>'}</div>
          <div style="min-width:220px;flex:1"><h4 style="margin:0 0 8px 0">Riddles & hints</h4>${myFacts.length ? '<ul style="margin:0;padding-left:18px">' + myFacts.map(f=>`<li>${(f.fact_text||'').replace(/</g,'&lt;')}${f.hint_text ? ' <small>(' + (f.hint_text||'').replace(/</g,'&lt;') + ')</small>' : ''}</li>`).join('') + '</ul>' : '<div style="color:var(--muted)">No riddles for this site</div>'}</div>
        </div>
      `;

      // wire modal controls
      document.getElementById('locationCloseBtn').onclick = ()=> modal.setAttribute('aria-hidden','true');
      document.getElementById('locationShowOnMap').onclick = ()=>{
        modal.setAttribute('aria-hidden','true');
        try{ window._mau_map.setView([parseFloat(locationObj.latitude), parseFloat(locationObj.longitude)], 15); }catch(e){}
      };
      // focus trap hint
      modal.querySelector('.modal-panel').focus();
    }
    // expose for other pages
    window.showLocationDetails = showLocationDetails;


  }).catch(err=>{
    console.error('Failed to load locations from any candidate URL', err);
    const grid = document.getElementById('locations'); if(grid) grid.innerHTML = '<div class="card"><div class="card-content"><p style="opacity:0.8">Failed to load locations.</p></div></div>';
  });
}

function loadTrailsAndHiddenItems(map) {
  if (!map || typeof L === 'undefined') return;
  var base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/backend/api').replace(/\/+$/, '');
  Promise.all([
    fetch(base + '/trail.php?action=list').then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
    fetch(base + '/hidden_item.php?action=list').then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; })
  ]).then(function(arr) {
    var trails = arr[0] || [];
    var items = arr[1] || [];
    trails.forEach(function(t) {
      var slat = parseFloat(t.start_lat); var slng = parseFloat(t.start_lng);
      var elat = parseFloat(t.end_lat); var elng = parseFloat(t.end_lng);
      if (isFinite(slat) && isFinite(slng) && isFinite(elat) && isFinite(elng)) {
        L.polyline([[slat, slng], [elat, elng]], { color: '#bfa86a', weight: 4, opacity: 0.8 }).addTo(map).bindPopup('<b>' + (t.trail_name || 'Trail') + '</b>' + (t.description ? '<br>' + t.description : ''));
      }
    });
    if (!window._mau_hiddenItemsLayer) window._mau_hiddenItemsLayer = L.layerGroup().addTo(map);
    window._mau_hiddenItemsLayer.clearLayers();
    items.forEach(function(item) {
      var lat = parseFloat(item.latitude); var lng = parseFloat(item.longitude);
      if (!isFinite(lat) || !isFinite(lng)) return;
      var icon = createPinIcon(item.found_by_user_id ? '#67a96b' : '#e67e22');
      var m = L.marker([lat, lng], { icon: icon }).addTo(window._mau_hiddenItemsLayer);
      m.bindPopup('<div style="min-width:160px"><b>' + (item.name || 'Hidden item') + '</b>' + (item.description ? '<br>' + item.description : '') + (item.found_by_user_id ? '<br><small>Already found</small>' : '<br><small>Find me! (within 1.5km to claim)</small>') + '</div>');
    });
  });
}

// Center on my location button
document.addEventListener('DOMContentLoaded', function(){
  var btn = document.getElementById('centerOnMeBtn');
  if(btn && typeof centerOnUserLocation === 'function') btn.addEventListener('click', centerOnUserLocation);
});

// call loader after DOM ready
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAndRenderLocations); else loadAndRenderLocations();

// small UI: map-style toggle (preserve user's preference)
(function wireMapToggle(){
  const el = document.getElementById('mapStyleToggle');
  if(!el || !window._mau_layers || !window._mau_map) return;
  const layerKeys = Object.keys(window._mau_layers); // e.g. ['OSM','Imagery']
  const pref = localStorage.getItem('mau_map_style') || layerKeys[0];
  try{ if(window._mau_layers[pref]) window._mau_layers[pref].addTo(window._mau_map); } catch(e){}
  el.addEventListener('click', ()=>{
    const keys = Object.keys(window._mau_layers);
    const current = keys.find(k => window._mau_map.hasLayer(window._mau_layers[k])) || keys[0];
    const idx = (keys.indexOf(current) + 1) % keys.length;
    const next = keys[idx];
    Object.values(window._mau_layers).forEach(l=> window._mau_map.removeLayer(l));
    window._mau_layers[next].addTo(window._mau_map);
    localStorage.setItem('mau_map_style', next);
  });
})();

