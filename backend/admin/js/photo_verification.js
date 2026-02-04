// Admin photo verification functionality
function loadPendingPhotos() {
    const base = (window.getApiBase ? window.getApiBase() : '../api');
    fetch(base + '/visit.php?action=list_pending')
        .then(r => r.json())
        .then(photos => {
            const container = document.getElementById('pendingPhotosContainer');
            if (!photos || !photos.length) {
                container.innerHTML = '<p style="color:var(--muted)">No pending photo verifications.</p>';
                return;
            }
            
            const baseRoot = base.replace(/\/api\/?$/i, '');
            container.innerHTML = photos.map(p => `
                <div class="photo-verification-card" data-photo-id="${p.photo_id}" style="background:var(--panel);border-radius:12px;padding:16px;margin-bottom:12px;display:flex;gap:16px;">
                    <img src="${baseRoot}/${p.image_path}" style="width:200px;height:150px;object-fit:cover;border-radius:8px;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22><rect width=%22200%22 height=%22150%22 fill=%22%23333%22/><text x=%2250%%22 y=%2250%%22 fill=%22%23999%22 text-anchor=%22middle%22>No image</text></svg>'">
                    <div style="flex:1;min-width:0;">
                        <h4 style="margin:0 0 8px 0;color:var(--accent);">${p.location_name || 'Unknown Location'}</h4>
                        <div style="color:var(--muted);font-size:0.9rem;margin-bottom:8px;">
                            <div><strong>User:</strong> ${p.username || 'User #' + p.user_id}</div>
                            <div><strong>Uploaded:</strong> ${new Date(p.created_at).toLocaleString()}</div>
                            <div><strong>Photo ID:</strong> ${p.photo_id}</div>
                        </div>
                        <div style="display:flex;gap:8px;margin-top:12px;">
                            <button onclick="approvePhoto(${p.photo_id}, ${p.user_id})" style="background:#2ecc71;color:#fff;padding:8px 16px;border:none;border-radius:8px;cursor:pointer;">✓ Approve (Award 10 pts)</button>
                            <button onclick="rejectPhoto(${p.photo_id})" style="background:#e74c3c;color:#fff;padding:8px 16px;border:none;border-radius:8px;cursor:pointer;">✗ Reject</button>
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(err => {
            console.error('Failed to load pending photos:', err);
            document.getElementById('pendingPhotosContainer').innerHTML = '<p style="color:#e74c3c">Failed to load photos.</p>';
        });
}

function approvePhoto(photo_id, user_id) {
    if (!confirm('Approve this photo and award 10 points to the user?')) return;
    
    const base = (window.getApiBase ? window.getApiBase() : '../api');
    fetch(base + '/visit.php?action=approve_photo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ photo_id, user_id, points: 10 })
    })
    .then(r => r.json())
    .then(resp => {
        if (resp.success) {
            alert('Photo approved! User awarded 10 points.');
            loadPendingPhotos();
        } else {
            alert('Error: ' + (resp.message || 'Approval failed'));
        }
    })
    .catch(err => {
        alert('Error: ' + err.message);
    });
}

function rejectPhoto(photo_id) {
    if (!confirm('Reject and delete this photo?')) return;
    
    const base = (window.getApiBase ? window.getApiBase() : '../api');
    fetch(base + '/visit.php?action=reject_photo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ photo_id })
    })
    .then(r => r.json())
    .then(resp => {
        if (resp.success) {
            alert('Photo rejected.');
            loadPendingPhotos();
        } else {
            alert('Error: ' + (resp.message || 'Rejection failed'));
        }
    })
    .catch(err => {
        alert('Error: ' + err.message);
    });
}

// Auto-load on page load
if (document.getElementById('pendingPhotosContainer')) {
    loadPendingPhotos();
}
