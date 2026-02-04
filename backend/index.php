<?php
// Redirect to frontend
header('Location: ../frontend/index.html');
exit;
?>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
    color: #f5f4ef;
}
.splash-video-wrap {
    position: fixed;
    inset: 0;
    z-index: 0;
}
.splash-video-wrap video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.splash-video-wrap::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(7,29,21,0.75) 0%, rgba(11,61,46,0.9) 100%);
    pointer-events: none;
}
.splash-content {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 24px;
    text-align: center;
}
.splash-title {
    font-size: clamp(2rem, 8vw, 3.5rem);
    font-weight: 700;
    color: #bfa86a;
    text-shadow: 0 2px 20px rgba(0,0,0,0.5);
    margin-bottom: 8px;
}
.splash-tagline {
    font-size: clamp(1rem, 3vw, 1.25rem);
    color: rgba(245,244,239,0.9);
    margin-bottom: 48px;
    max-width: 420px;
}
.splash-buttons {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    max-width: 320px;
}
.splash-buttons a {
    display: block;
    padding: 16px 24px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.05rem;
    transition: transform 0.2s, box-shadow 0.2s;
}
.splash-buttons a:first-child {
    background: linear-gradient(180deg, #bfa86a, #97804c);
    color: #081428;
    box-shadow: 0 8px 24px rgba(6,32,18,0.45);
}
.splash-buttons a:first-child:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(6,32,18,0.5); }
.splash-buttons a:last-child {
    background: rgba(255,255,255,0.1);
    color: #f5f4ef;
    border: 1px solid rgba(255,255,255,0.2);
}
.splash-buttons a:last-child:hover { background: rgba(255,255,255,0.15); }
.splash-scroll-hint {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.9rem;
    color: rgba(255,255,255,0.6);
}
.splash-scroll-hint span { display: block; margin-top: 8px; font-size: 1.5rem; animation: bounce 1.5s ease infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
/* Fallback when no video */
.splash-video-wrap.fallback { background: linear-gradient(180deg, #041027 0%, #071d15 100%); }
.splash-video-wrap.fallback video { display: none; }
</style>
</head>
<body>
<div class="splash-video-wrap" id="splashVideoWrap">
    <video id="splashVideo" playsinline muted loop preload="metadata"
           poster="admin/images/mauritius-bg.jpg">
        <source src="https://cdn.coverr.co/videos/coverr-aerial-view-of-tropical-beach-4173717/4173717_preview-1080p.mp4" type="video/mp4">
        <source src="admin/images/mauritius-bg.jpg" type="image/jpeg">
    </video>
</div>
<div class="splash-content">
    <h1 class="splash-title">MauRichesse</h1>
    <p class="splash-tagline">Your local guide and treasure hunt across the heritage of Mauritius.</p>
    <div class="splash-buttons">
        <a href="admin/auth.html">Login</a>
    </div>
    <p class="splash-scroll-hint">Scroll to play video · then <a href="admin/auth.html" style="color: var(--gold, #bfa86a);">go to Login</a><br><span>↓</span></p>
</div>
<script>
(function() {
    var v = document.getElementById('splashVideo');
    var wrap = document.getElementById('splashVideoWrap');
    if (!v || !wrap) return;

    function playVideo() {
        if (v.paused) {
            v.play().catch(function() {});
            wrap.classList.remove('fallback');
        }
    }
    function pauseVideo() {
        v.pause();
    }

    // Play on scroll (scroll trigger)
    var scrollTicking = false;
    window.addEventListener('scroll', function() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(function() {
            if (window.scrollY > 30) playVideo();
            scrollTicking = false;
        });
    }, { passive: true });

    // Also play when user interacts (tap/click) for mobile
    document.body.addEventListener('click', playVideo, { once: true });
    document.body.addEventListener('touchstart', playVideo, { once: true });

    // Fallback: if video fails, show poster background
    v.addEventListener('error', function() {
        wrap.classList.add('fallback');
    });
})();
</script>
</body>
</html>
