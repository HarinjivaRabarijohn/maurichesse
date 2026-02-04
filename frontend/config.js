(function () {
  var stored = null;
  try { stored = localStorage.getItem('mau_api_base'); } catch (e) {}

  // Detect if local development or production
  var isLocal = /^(localhost|127\.0\.0\.1|.*\.local|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(location.hostname);
  var protocol = location.protocol === 'https:' ? 'https:' : 'http:';
  var port = location.port ? ':' + location.port : '';
  
  var fallback;
  if (isLocal) {
    // Local development: support both vhost root and /mauheritage/ subfolder
    var needsSubfolder = /^\/mauheritage\//i.test(location.pathname);
    fallback = protocol + '//' + location.hostname + port + (needsSubfolder ? '/mauheritage' : '') + '/backend/api';
  } else {
    // Production: backend is at same domain
    fallback = protocol + '//' + location.hostname + port + '/backend/api';
  }

  var base = (window.MAU_API_BASE || window.API_BASE_URL || stored || fallback).toString();
  base = base.replace(/\/+$/, '');

  window.getApiBase = function () {
    return base;
  };

  window.setApiBase = function (url) {
    if (!url) return;
    try { localStorage.setItem('mau_api_base', url); } catch (e) {}
  };
})();
