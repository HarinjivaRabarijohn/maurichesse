/* Trails CRUD - uses api/trail.php */
let trailMap = null;
let trailMarkers = [];
let trailLines = [];

function loadTrails() {
    fetch('../api/trail.php?action=list')
        .then(r => r.json())
        .then(data => {
            const tbody = document.getElementById('trailTable')?.querySelector('tbody');
            if (!tbody) return;
            tbody.innerHTML = (data || []).map(t => `
                <tr>
                    <td>${t.trail_id}</td>
                    <td contenteditable="false">${t.trail_name}</td>
                    <td contenteditable="false">${t.description || ''}</td>
                    <td>
                        <button class="edit" onclick="editTrail(this, ${t.trail_id})">Edit</button>
                        <button class="save" onclick="saveTrail(this, ${t.trail_id})" hidden>Save</button>
                        <button class="cancel" onclick="cancelTrail(this)" hidden>Cancel</button>
                        <button class="delete" onclick="deleteTrail(${t.trail_id})">Delete</button>
                    </td>
                </tr>`).join('');
            
            // Update trails on map
            updateTrailMap(data);
            
            // Update stats
            const statEl = document.getElementById('statTrails');
            if (statEl) statEl.innerText = (data || []).length;
        })
        .catch(e => console.error('Failed to load trails', e));
}

function updateTrailMap(trails) {
    if (!trailMap) {
        initTrailMap();
    }
    
    // Clear existing trails
    trailMarkers.forEach(marker => trailMap.removeLayer(marker));
    trailLines.forEach(line => trailMap.removeLayer(line));
    trailMarkers = [];
    trailLines = [];
    
    // Add trails to map
    trails.forEach(trail => {
        if (trail.start_lat && trail.start_lng && trail.end_lat && trail.end_lng) {
            const startLatLng = [parseFloat(trail.start_lat), parseFloat(trail.start_lng)];
            const endLatLng = [parseFloat(trail.end_lat), parseFloat(trail.end_lng)];
            
            // Create trail line
            const trailLine = L.polyline([startLatLng, endLatLng], {
                color: '#bfa86a',
                weight: 4,
                opacity: 0.8,
                dashArray: '8, 4'
            }).addTo(trailMap);
            
            // Add popup
            const popupContent = `
                <div style="text-align: center;">
                    <strong>${trail.trail_name}</strong>
                    ${trail.description ? `<p style="margin: 4px 0; font-size: 0.9rem;">${trail.description}</p>` : ''}
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
            }).addTo(trailMap);
            
            startMarker.bindPopup(`
                <div style="text-align: center;">
                    <strong>Start: ${trail.trail_name}</strong>
                    ${trail.description ? `<p style="margin: 4px 0; font-size: 0.9rem;">${trail.description}</p>` : ''}
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
            }).addTo(trailMap);
            
            endMarker.bindPopup(`
                <div style="text-align: center;">
                    <strong>End: ${trail.trail_name}</strong>
                    ${trail.description ? `<p style="margin: 4px 0; font-size: 0.9rem;">${trail.description}</p>` : ''}
                </div>
            `);
            
            trailLines.push(trailLine);
            trailMarkers.push(startMarker, endMarker);
        }
    });
    
    // Fit map to show all trails
    if (trailLines.length > 0) {
        const group = new L.featureGroup(trailLines);
        trailMap.fitBounds(group.getBounds().pad(0.1));
    }
}

function initTrailMap() {
    const mapContainer = document.getElementById('trailMap');
    if (!mapContainer || typeof L === 'undefined') return;
    
    trailMap = L.map('trailMap', {
        center: [-20.3484, 57.5522],
        zoom: 10
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(trailMap);
}

function editTrail(btn, trailId) {
    const row = btn.closest('tr');
    const cells = row.cells;
    
    // Make cells editable
    cells[1].contentEditable = true;
    cells[2].contentEditable = true;
    
    // Show/hide buttons
    btn.style.display = 'none';
    row.querySelector('.save').style.display = 'inline-block';
    row.querySelector('.cancel').style.display = 'inline-block';
}

function cancelTrail(btn) {
    loadTrails(); // Reload to cancel changes
}

function saveTrail(btn, trailId) {
    const row = btn.closest('tr');
    const cells = row.cells;
    
    const trailData = {
        trail_id: trailId,
        trail_name: cells[1].innerText.trim(),
        description: cells[2].innerText.trim()
    };
    
    fetch('../api/trail.php?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trailData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadTrails();
        } else {
            alert('Error updating trail: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error updating trail:', error);
        alert('Error updating trail');
    });
}

function deleteTrail(trailId) {
    if (!confirm('Are you sure you want to delete this trail?')) return;
    
    fetch('../api/trail.php?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trail_id: trailId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadTrails();
        } else {
            alert('Error deleting trail: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting trail:', error);
        alert('Error deleting trail');
    });
}

function addTrail() {
    const trailData = {
        trail_name: document.getElementById('new_trail_name').value.trim(),
        description: document.getElementById('new_trail_description').value.trim(),
        start_lat: parseFloat(document.getElementById('new_trail_start_lat').value) || 0,
        start_lng: parseFloat(document.getElementById('new_trail_start_lng').value) || 0,
        end_lat: parseFloat(document.getElementById('new_trail_end_lat').value) || 0,
        end_lng: parseFloat(document.getElementById('new_trail_end_lng').value) || 0
    };
    
    if (!trailData.trail_name) {
        alert('Trail name is required');
        return;
    }
    
    fetch('../api/trail.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trailData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Clear form
            document.getElementById('new_trail_name').value = '';
            document.getElementById('new_trail_description').value = '';
            document.getElementById('new_trail_start_lat').value = '';
            document.getElementById('new_trail_start_lng').value = '';
            document.getElementById('new_trail_end_lat').value = '';
            document.getElementById('new_trail_end_lng').value = '';
            
            loadTrails();
        } else {
            alert('Error adding trail: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error adding trail:', error);
        alert('Error adding trail');
    });
}

// Initialize trail map when trails tab is opened
function openTrailTab() {
    setTimeout(() => {
        if (!trailMap) {
            initTrailMap();
        }
        loadTrails();
    }, 100);
}

// Load is handled by dashboard.js, but we need to initialize map when tab opens
document.addEventListener('DOMContentLoaded', () => {
    // Override tab opening for trails tab
    const originalOpenTab = window.openTab;
    if (originalOpenTab) {
        window.openTab = function(evt, tabName) {
            originalOpenTab(evt, tabName);
            
            if (tabName === 'trails') {
                openTrailTab();
            }
        };
    }
});
