(function() {
  var base = (window.getApiBase ? window.getApiBase() : 'http://localhost/mauheritage/backend/api').replace(/\/+$/, '') + '/';

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function setStatus(msg) {
    var el = document.getElementById('pushStatus');
    if (el) el.textContent = msg;
  }

  window.subscribePush = function() {
    var btn = document.getElementById('pushSubscribeBtn');
    if (btn) btn.disabled = true;
    setStatus('Requesting permission…');

    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('Notifications or Push not supported in this browser.');
      if (btn) btn.disabled = false;
      return;
    }

    Notification.requestPermission().then(function(permission) {
      if (permission !== 'granted') {
        setStatus('Permission denied.');
        if (btn) btn.disabled = false;
        return;
      }
      setStatus('Subscribing…');
      fetch(base + 'get_vapid_public.php')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (!data.success || !data.publicKey) {
            setStatus('Server: VAPID key not configured.');
            if (btn) btn.disabled = false;
            return;
          }
          return navigator.serviceWorker.ready.then(function(reg) {
            return reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(data.publicKey)
            });
          });
        })
        .then(function(subscription) {
          if (!subscription) return;
          var p256dh = subscription.getKey('p256dh');
          var auth = subscription.getKey('auth');
          var p256dhB64 = btoa(String.fromCharCode.apply(null, new Uint8Array(p256dh))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          var authB64 = btoa(String.fromCharCode.apply(null, new Uint8Array(auth))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          var sub = {
            endpoint: subscription.endpoint,
            keys: { p256dh: p256dhB64, auth: authB64 }
          };
          try {
            var user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user && user.user_id) sub.user_id = user.user_id;
          } catch (e) {}
          return fetch(base + 'push_subscribe.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub)
          }).then(function(r) { return r.json(); }).then(function(result) {
            if (result.success) {
              setStatus('Notifications enabled.');
              if (btn) { btn.textContent = 'Notifications enabled'; btn.disabled = true; }
            } else {
              setStatus(result.message || 'Subscribe failed.');
              if (btn) btn.disabled = false;
            }
          });
        })
        .catch(function(err) {
          console.error('Push subscribe error', err);
          setStatus('Failed: ' + (err.message || 'unknown'));
          if (btn) btn.disabled = false;
        });
    }).catch(function() {
      setStatus('Permission denied.');
      if (btn) btn.disabled = false;
    });
  };

  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('pushSubscribeBtn');
    if (btn) btn.addEventListener('click', window.subscribePush);
  });
})();
