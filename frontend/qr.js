// QR scanner (defensive)
let scanner = null;

async function startScanner(){
  const statusEl = document.getElementById('readerStatus'); if(statusEl) statusEl.innerText = 'Starting…';
  if(typeof Html5Qrcode === 'undefined'){
    if(statusEl) statusEl.innerText = 'Scanner unavailable (library not loaded)';
    console.error('html5-qrcode library missing');
    return;
  }
  if(!document.getElementById('reader')){
    if(statusEl) statusEl.innerText = 'No scanner container on this page';
    return;
  }

  // ask for camera permission with a friendly message
  if(!confirm((localStorage.getItem('mau_lang')==='fr') ? 'Autoriser la caméra pour scanner le QR ?' : 'Allow camera access to scan QR codes?')){
    if(statusEl) statusEl.innerText = 'Permission declined';
    return;
  }

  try{
    // trigger permissions prompt (graceful)
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    stream.getTracks().forEach(t=>t.stop());

    scanner = scanner || new Html5Qrcode('reader');
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      async (code) => {
        try{
          const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/backend/api').replace(/\/+$/, '');
          const resp = await fetch(`${base}/qr.php?action=scan&code=${encodeURIComponent(code)}`);
          const data = await (resp.ok ? resp.json() : Promise.resolve({}));
          const scans = JSON.parse(localStorage.getItem('mau_scans') || '[]');
          const loc = data.location || {};
          const scanRecord = {
            code,
            fact: data.riddle || data.fact_text || '',
            hint: data.hint || '',
            location_name: loc.name || '',
            location_id: loc.location_id || null,
            lat: loc.latitude != null ? parseFloat(loc.latitude) : null,
            lng: loc.longitude != null ? parseFloat(loc.longitude) : null,
            at: new Date().toISOString()
          };
          scans.unshift(scanRecord);
          localStorage.setItem('mau_scans', JSON.stringify(scans.slice(0,50)));
          document.dispatchEvent(new CustomEvent('scans:changed', { detail: scans }));
          const statusEl = document.getElementById('readerStatus'); if(statusEl) statusEl.innerText = 'Last: ' + code;
          showRiddleModal(data, scanRecord);
          // Record visit for leaderboard when user is logged in
          try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user && user.user_id && data.location && data.location.location_id) {
              const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/backend/api').replace(/\/+$/, '');
              fetch(base + '/visit.php?action=record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.user_id, location_id: data.location.location_id, qr_id: data.location.qr_id || data.code })
              }).catch(function() {});
            }
          } catch (e) {}
        }catch(err){ console.error('Scan handler error', err); }
      }
    );

    // UI toggle
    const startBtn = document.getElementById('startScannerBtn'); const stopBtn = document.getElementById('stopScannerBtn');
    if(startBtn) startBtn.style.display = 'none'; if(stopBtn) stopBtn.style.display = 'inline-block';
    const status = document.getElementById('readerStatus'); if(status) status.innerText = (localStorage.getItem('mau_lang')==='fr') ? 'Scanner actif' : 'Scanner active';
  } catch(err){
    console.error('Camera start failed', err);
    const statusEl2 = document.getElementById('readerStatus'); if(statusEl2) statusEl2.innerText = 'Camera unavailable';
    alert((localStorage.getItem('mau_lang')==='fr') ? 'Accès caméra refusé ou indisponible.' : 'Camera access denied or not available.');
  }
}

async function stopScanner(){
  try{
    if(scanner){ await scanner.stop(); scanner.clear(); scanner = null; }
  }catch(e){ console.warn('stopScanner', e); }
  const startBtn = document.getElementById('startScannerBtn'); const stopBtn = document.getElementById('stopScannerBtn');
  if(startBtn) startBtn.style.display = 'inline-block'; if(stopBtn) stopBtn.style.display = 'none';
  const status = document.getElementById('readerStatus'); if(status) status.innerText = 'Scanner stopped';
  document.dispatchEvent(new CustomEvent('scans:changed', { detail: JSON.parse(localStorage.getItem('mau_scans')||'[]') }));
}

function showRiddleModal(data, scanRecord) {
  var modal = document.getElementById('scanResultModal');
  var title = document.getElementById('scanResultTitle');
  var locEl = document.getElementById('scanResultLocation');
  var riddleEl = document.getElementById('scanResultRiddle');
  var hintBtn = document.getElementById('revealHintBtn');
  var hintEl = document.getElementById('scanResultHint');
  var claimBtn = document.getElementById('claimTreasureBtn');
  var claimStatus = document.getElementById('claimTreasureStatus');
  var showMapBtn = document.getElementById('scanResultShowMap');
  var closeBtn = document.getElementById('scanResultClose');
  var photoUploadContainer = document.getElementById('photoUploadContainer');
  var photoFileInput = document.getElementById('photoFileInput');
  var photoUploadBtn = document.getElementById('photoUploadBtn');
  var photoStatus = document.getElementById('photoStatus');
  
  if (!modal || !riddleEl) return;

  var loc = data.location || {};
  var riddle = data.riddle || data.fact_text || '';
  
  // Enhanced hint system - support hint_2 and hint_3
  var hintsArr = Array.isArray(data.hints) ? data.hints : [];
  var hintData = {
    hint_text: data.hint_text || data.hint || (hintsArr[0] || ''),
    hint_2: data.hint_2 || (hintsArr[1] || ''),
    hint_3: data.hint_3 || (hintsArr[2] || '')
  };

  title.textContent = (data.success === false) ? 'Unknown code' : 'Treasure found';
  locEl.textContent = loc.name || data.code || '—';
  riddleEl.textContent = riddle || (data.message || 'No riddle for this code.');
  
  // Clear existing hint content
  hintEl.innerHTML = '';
  hintEl.style.display = 'none';
  
  // Use enhanced hint system if available
  if (window.hintSystem) {
    const hintContainer = window.hintSystem.createHintContainer(hintData);
    hintEl.appendChild(hintContainer);
    hintEl.style.display = 'block';
    hintBtn.style.display = 'none'; // Hide old button
  } else {
    // Fallback to old system
    var hints = [];
    if (hintData.hint_text) hints.push(hintData.hint_text);
    if (hintData.hint_2) hints.push(hintData.hint_2);
    if (hintData.hint_3) hints.push(hintData.hint_3);
    
    var revealed = 0;
    if (hints.length) {
      hintBtn.style.display = 'inline-block';
      hintBtn.textContent = (localStorage.getItem('mau_lang') === 'fr') ? 'Révéler l\'indice 1' : 'Reveal hint 1';
      hintBtn.onclick = function () {
        revealed++;
        var div = document.createElement('div');
        div.style.marginTop = revealed > 1 ? '8px' : '0';
        div.textContent = hints[revealed - 1];
        hintEl.appendChild(div);
        hintEl.style.display = 'block';
        if (revealed >= hints.length) {
          hintBtn.style.display = 'none';
        } else {
          hintBtn.textContent = (localStorage.getItem('mau_lang') === 'fr') ? 'Révéler l\'indice ' + (revealed + 1) : 'Reveal hint ' + (revealed + 1);
        }
      };
    } else {
      hintBtn.style.display = 'none';
    }
  }

  // Photo upload UI
  if (photoUploadContainer && photoFileInput && photoUploadBtn && photoStatus) {
    photoUploadContainer.style.display = 'block';
    photoStatus.innerHTML = '';
    photoStatus.style.display = 'none';
    photoFileInput.value = '';
    
    photoUploadBtn.onclick = function() {
      if (!photoFileInput.files.length) {
        photoStatus.innerHTML = '<span style="color:#e67e22">Please select a photo</span>';
        photoStatus.style.display = 'block';
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.user_id) {
        photoStatus.innerHTML = '<span style="color:#c0392b">Not logged in</span>';
        photoStatus.style.display = 'block';
        return;
      }
      
      const formData = new FormData();
      formData.append('photo', photoFileInput.files[0]);
      formData.append('user_id', user.user_id);
      formData.append('location_id', loc.location_id);
      formData.append('action', 'upload_photo');
      
      photoUploadBtn.disabled = true;
      photoStatus.innerHTML = 'Uploading...';
      photoStatus.style.display = 'block';
      
      const base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/backend/api').replace(/\/+$/, '');
      fetch(base + '/visit.php', {
        method: 'POST',
        body: formData
      })
      .then(r => r.json())
      .then(resp => {
        if (resp.success) {
          photoStatus.innerHTML = '<span style="color:#2ecc71">✓ Photo uploaded! Awaiting admin verification for points.</span>';
          photoFileInput.value = '';
        } else {
          photoStatus.innerHTML = '<span style="color:#c0392b">' + (resp.message || 'Upload failed') + '</span>';
          photoUploadBtn.disabled = false;
        }
      })
      .catch(err => {
        photoStatus.innerHTML = '<span style="color:#c0392b">Error: ' + err.message + '</span>';
        photoUploadBtn.disabled = false;
      });
    };
  }

  // Treasure claim for hidden items
  if (claimBtn && claimStatus) {
    claimBtn.style.display = 'none';
    claimStatus.style.display = 'none';
    if (data.hidden_item) {
      var item = data.hidden_item;
      if (item.claimed) {
        claimStatus.innerHTML = '<span style="color:#bfa86a">✓ Already claimed</span>';
        claimStatus.style.display = 'block';
      } else {
        claimBtn.style.display = 'inline-block';
        claimBtn.onclick = function () {
          claimTreasure(item, data.location, claimBtn, claimStatus);
        };
      }
    }
  }

  showMapBtn.onclick = function () {
    modal.setAttribute('aria-hidden', 'true');
    var lat = scanRecord && scanRecord.lat != null ? scanRecord.lat : (loc.latitude != null ? parseFloat(loc.latitude) : null);
    var lng = scanRecord && scanRecord.lng != null ? scanRecord.lng : (loc.longitude != null ? parseFloat(loc.longitude) : null);
    if (lat != null && lng != null) {
      window.location.href = 'home.html?focus=' + encodeURIComponent(loc.name || '') + '&lat=' + lat + '&lng=' + lng;
    } else {
      window.location.href = 'home.html';
    }
  };
  closeBtn.onclick = function () { modal.setAttribute('aria-hidden', 'true'); };
  modal.querySelector('.modal-backdrop').onclick = function () { modal.setAttribute('aria-hidden', 'true'); };
  modal.setAttribute('aria-hidden', 'false');
}

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('reader')) { try { startScanner(); } catch (e) { console.warn('auto-start failed', e); } }
});

window.startScanner = startScanner;
window.stopScanner = stopScanner;
window.showRiddleModal = showRiddleModal;

function claimTreasure(item, location, claimBtn, claimStatus) {
  if (!navigator.geolocation) {
    claimStatus.innerHTML = '<span style="color:#c0392b">Geolocation required</span>';
    claimStatus.style.display = 'block';
    return;
  }

  claimBtn.disabled = true;
  claimStatus.innerHTML = 'Getting location...';
  claimStatus.style.display = 'block';

  navigator.geolocation.getCurrentPosition(function (pos) {
    var user = null;
    try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch (e) {}

    var payload = {
      item_id: item.item_id,
      user_id: user ? user.user_id || null : null,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    };

    var base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/api').replace(/\/+$/, '');
    fetch(base + '/hidden_item.php?action=claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          claimStatus.innerHTML = '<span style="color:#2ecc71">✓ ' + (d.message || 'Treasure claimed!') + (d.badge_awarded ? ' 🏆' : '') + '</span>';
          claimBtn.style.display = 'none';
        } else {
          claimStatus.innerHTML = '<span style="color:#c0392b">' + (d.message || 'Claim failed') + '</span>';
          claimBtn.disabled = false;
        }
      })
      .catch(err => {
        claimStatus.innerHTML = '<span style="color:#c0392b">Error: ' + err.message + '</span>';
        claimBtn.disabled = false;
      });
  }, function (err) {
    claimStatus.innerHTML = '<span style="color:#c0392b">Location access denied</span>';
    claimBtn.disabled = false;
  });
}
