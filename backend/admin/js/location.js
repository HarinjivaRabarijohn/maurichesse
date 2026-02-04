const locationTable = document.getElementById('locationTable');
const new_location_name = document.getElementById('new_location_name');
const new_location_desc = document.getElementById('new_location_desc');
const new_location_lat = document.getElementById('new_location_lat');
const new_location_lng = document.getElementById('new_location_lng');
const new_location_cat = document.getElementById('new_location_cat');

// Helpers — normalize/convert image paths so admin pages load thumbnails correctly
function normalizeImagePath(p){
    if(!p) return '';
    if(/^https?:\/\//i.test(p) || p.startsWith('/')) return p;
    if(p.startsWith('uploads/')) return '../' + p;
    if(p.startsWith('..')) return p;
    return '../' + p;
}
function toRelativePath(p){
    if(!p) return '';
    try{ const u = new URL(p, window.location.href); const path = u.pathname.replace(/^\//, ''); return path.startsWith('uploads/') ? path : path; }catch(e){ return p; }
} 

function loadLocations() {
    fetch('../api/location.php?action=list')
    .then(r => r.json())
    .then(data => {
        locationTable.querySelector('tbody').innerHTML = data.map(l => `
            <tr>
                <td>${l.location_id}</td>
                <td>${l.name}</td>
                <td>${l.description || ''}</td>
                <td>${l.latitude}</td>
                <td>${l.longitude}</td>
                <td>${l.category_name || ''}</td>
                <td>${(l.image_path || l.image || l.image_url) ? `<img src="${normalizeImagePath(l.image_path||l.image||l.image_url)}" width="80" alt="">` : 'N/A'}</td>
                <td>
                    <button class="edit" onclick="editLocation(${l.location_id})">Edit</button>
                    <button class="delete" onclick="deleteLocation(${l.location_id})">Delete</button>
                </td>
            </tr>`).join('');

        loadLocationDropdowns(data);
        document.getElementById('statLocations').innerText = data.length;

        // notify other modules that locations changed (so their dropdowns update instantly)
        try{ document.dispatchEvent(new CustomEvent('locations:changed', { detail: data })); } catch(e){ /* ignore */ }

        // wire live preview for the add form (if present)
        const addImg = document.getElementById('new_location_image');
        const addPreview = document.getElementById('new_location_image_preview');
        if(addImg){ addImg.onchange = function(e){ const f = this.files[0]; if(f){ addPreview.src = URL.createObjectURL(f); addPreview.style.display='inline-block'; } else { addPreview.style.display='none'; addPreview.src=''; } }; }
    });
}

function loadLocationDropdowns(locations) {
    const qrLocationSelect = document.getElementById('new_qr_location');
    const galleryLocationSelect = document.getElementById('new_gallery_location');
    if (!qrLocationSelect || !galleryLocationSelect) return;

    qrLocationSelect.innerHTML = galleryLocationSelect.innerHTML = `<option value="">--Select Location--</option>`;
    locations.forEach(l => {
        qrLocationSelect.innerHTML += `<option value="${l.location_id}">${l.name}</option>`;
        galleryLocationSelect.innerHTML += `<option value="${l.location_id}">${l.name}</option>`;
    });
}

function editLocation(id){
    // read current values from DOM where possible
    const tbody = document.getElementById('locationTable')?.querySelector('tbody');
    const row = tbody ? Array.from(tbody.rows).find(r => r.cells[0].innerText.trim() === String(id)) : null;
    const openWith = (item) => {
        const catSelect = document.getElementById('new_location_cat');
        const opts = catSelect ? Array.from(catSelect.options).map(o=>({ value: o.value, label: o.text })) : [];

        openGenericEditModal({
            entity: 'location',
            id: String(id),
            title: 'Edit location',
            fields: [
                { name: 'location_id', label: 'ID', type: 'text', value: item.location_id, readonly: true },
                { name: 'name', label: 'Name', type: 'text', value: item.name || '' },
                { name: 'description', label: 'Description', type: 'text', value: item.description || '' },
                { name: 'latitude', label: 'Latitude', type: 'text', value: item.latitude ?? '' },
                { name: 'longitude', label: 'Longitude', type: 'text', value: item.longitude ?? '' },
                { name: 'category_id', label: 'Category', type: 'select', value: item.category_id ?? '', options: opts },
                { name: 'image_path', label: 'Current image', type: 'text', value: toRelativePath(item.image_path || item.image || item.image_url) || '', readonly: true },
                { name: 'image_file', label: 'Replace image', type: 'file' }
            ],
            validate: v => (!v.name ? 'Name required' : null),
            onSave: async (values, entId) => {
                // prepare FormData (supports replacing image)
                const fd = new FormData();
                Object.keys(values).forEach(k=>{ if(k !== 'image_file') fd.append(k, values[k] || ''); });
                const fileEl = document.getElementById('generic_field_image_file');
                if(fileEl && fileEl.files && fileEl.files[0]) fd.append('image', fileEl.files[0]);
                fd.append('location_id', entId);
                const res = await fetch('../api/location.php?action=update', { method: 'POST', body: fd });
                const txt = await res.text();
                const j = txt ? JSON.parse(txt) : {};
                if(!res.ok || (j && j.success === false)) throw new Error(j.message || 'Save failed');
            },
            onSaved: () => loadLocations()
        });

        // after modal opens, show preview if image exists (match gallery behavior)
        setTimeout(()=>{
            const cur = document.getElementById('generic_field_image_path');
            const f = document.getElementById('generic_field_image_file');
            if(cur && cur.value){
                const img = document.createElement('img');
                img.src = normalizeImagePath(cur.value);
                img.width = 160;
                img.style.display = 'block';
                img.style.marginTop = '8px';
                cur.parentNode.appendChild(img);
            }
            if(f){
                // ensure file input accepts images (generic modal sets this by default)
                f.accept = 'image/*';
                f.onchange = function(){
                    const file = this.files[0];
                    let prev = cur && cur.parentNode.querySelector('img');
                    if(!prev){
                        prev = document.createElement('img');
                        prev.width = 160;
                        prev.style.display = 'block';
                        prev.style.marginTop = '8px';
                        cur.parentNode.appendChild(prev);
                    }
                    if(file){ prev.src = URL.createObjectURL(file); }
                };
            }
        }, 60);
    };

    if(row){
        const item = {
            location_id: row.cells[0].innerText.trim(),
            name: row.cells[1].innerText.trim(),
            description: row.cells[2].innerText.trim(),
            latitude: row.cells[3].innerText.trim(),
            longitude: row.cells[4].innerText.trim(),
            category_name: row.cells[5].innerText.trim(),
            image_path: row.cells[6].querySelector('img') ? toRelativePath(row.cells[6].querySelector('img').src) : ''
        };
        const catSelect = document.getElementById('new_location_cat');
        if(catSelect){ const opt = Array.from(catSelect.options).find(o => o.text === item.category_name); item.category_id = opt ? opt.value : ''; }
        openWith(item);
    } else {
        fetch('../api/location.php?action=list').then(r=>r.json()).then(list=>{ const found = list.find(x=>String(x.location_id)===String(id)); if(!found) return alert('Location not found'); openWith(found); }).catch(()=>alert('Failed to load location'));
    }
}

function cancelLocation(btn){ loadLocations(); }

function saveLocation(btn, id){
    // keep inline save (no file support) — prefer modal for file uploads
    const row = btn.closest('tr');
    const categoryOption = Array.from(document.getElementById('new_location_cat').options).find(o => o.text === row.cells[5].innerText.trim());
    const category_id = categoryOption ? categoryOption.value : null;
    const data = { location_id: id, name: row.cells[1].innerText.trim(), description: row.cells[2].innerText.trim(), latitude: row.cells[3].innerText.trim(), longitude: row.cells[4].innerText.trim(), category_id };
    fetch('../api/location.php?action=update',{ method:'POST', body: JSON.stringify(data), headers: {'Content-Type':'application/json'} }).then(()=>loadLocations());
}

function deleteLocation(id){
    if(!confirm('Delete this location?')) return;
    fetch('../api/location.php?action=delete',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({location_id:id}) }).then(()=>loadLocations());
}

function addLocation(){
    const name = new_location_name.value.trim();
    const description = new_location_desc.value.trim();
    const latitude = new_location_lat.value.trim();
    const longitude = new_location_lng.value.trim();
    const category_id = new_location_cat.value;
    const file = document.getElementById('new_location_image')?.files[0];
    if(!name || !latitude || !longitude){ alert('Fill name, lat, lng'); return; }
    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);
    fd.append('latitude', latitude);
    fd.append('longitude', longitude);
    fd.append('category_id', category_id);
    if(file) fd.append('image', file);
    fetch('../api/location.php?action=add',{ method:'POST', body: fd }).then(r=>r.json()).then(d=>{ alert(d.message); new_location_name.value=''; new_location_desc.value=''; new_location_lat.value=''; new_location_lng.value=''; new_location_cat.value=''; const p = document.getElementById('new_location_image_preview'); if(p){ p.style.display='none'; p.src=''; } loadLocations(); }).catch(()=>alert('Upload failed'));
}

// Load on page ready
loadLocations();
