const galleryGrid = document.getElementById('galleryGrid');
const new_gallery_location = document.getElementById('new_gallery_location');
const new_gallery_img = document.getElementById('new_gallery_img');
const new_gallery_caption = document.getElementById('new_gallery_caption');

function normalizeImagePath(p){ if(!p) return ''; if(/^https?:\/\//i.test(p) || p.startsWith('/')) return p; if(p.startsWith('uploads/')) return '../' + p; if(p.startsWith('..')) return p; return '../' + p; }
function toRelativePath(p){ if(!p) return ''; try{ const u = new URL(p, window.location.href); const path = u.pathname.replace(/^\//,''); return path.startsWith('uploads/') ? path : path; }catch(e){ return p; } }

function loadGallery() {
    fetch('../api/gallery.php?action=list')
    .then(r => r.json())
    .then(data => {
        galleryGrid.innerHTML = data.map(g => `
    <div class="gallery-card" role="listitem" data-id="${g.gallery_id}">
        <div class="gallery-card-media">
            ${(g.image_path || g.image_url) ? `<img src="${normalizeImagePath(g.image_path||g.image_url)}" alt="${(g.caption||g.location_name||'gallery')}" />` : `<div class="gallery-card-empty">No image</div>`}
        </div>
        <div class="gallery-card-body">
            <div class="gallery-card-location">${g.location_name || ''}</div>
            <div class="gallery-card-caption">${g.caption || ''}</div>
            <div class="gallery-card-actions">
                <button class="edit" onclick="editGallery(this)">Edit</button>
                <button class="delete" onclick="deleteGallery(${g.gallery_id})">Delete</button>
            </div>
        </div>
    </div>`).join('');

        document.getElementById('statGallery').innerText = data.length;

        // wire preview for new gallery image input
        const newImg = document.getElementById('new_gallery_img');
        if(newImg){ newImg.onchange = function(){ const f = this.files[0]; let prev = document.getElementById('new_gallery_img_preview'); if(!prev){ prev = document.createElement('img'); prev.id='new_gallery_img_preview'; prev.width=80; this.parentNode.insertBefore(prev, this.nextSibling); } if(f) { prev.src = URL.createObjectURL(f); prev.style.display = 'inline-block'; } else prev.style.display='none'; }; }
    });

    // Populate location dropdown (initial)
    fetch('../api/location.php?action=list')
    .then(r => r.json())
    .then(locations => {
        new_gallery_location.innerHTML = '<option value="">--Select Location--</option>';
        locations.forEach(l => { new_gallery_location.innerHTML += `<option value="${l.location_id}">${l.name}</option>`; });
    });

// update gallery location select when locations change elsewhere in the app
document.addEventListener('locations:changed', function(e){ try{ const locations = e.detail || []; new_gallery_location.innerHTML = '<option value="">--Select Location--</option>'; locations.forEach(l=> new_gallery_location.innerHTML += `<option value="${l.location_id}">${l.name}</option>`); } catch(err){ /* ignore */ } });
}

function editGallery(btn){
    const card = btn.closest('.gallery-card');
    if(!card) return; // defensive
    const id = card.dataset.id;
    const location_name = (card.querySelector('.gallery-card-location')?.innerText || '').trim();
    const caption = (card.querySelector('.gallery-card-caption')?.innerText || '').trim();
    const currentSrc = card.querySelector('img') ? card.querySelector('img').src : '';

    const opts = Array.from(new_gallery_location.options).map(o=>({ value: o.value, label: o.text }));

    openGenericEditModal({
        entity: 'gallery',
        id,
            title: 'Edit Gallery',
        fields: [
            { name: 'location_id', label: 'Location', type: 'select', value: opts.find(o=>o.label===location_name)?.value || '', options: opts },
            { name: 'caption', label: 'Caption', value: caption },
            { name: 'image_path', label: 'Current image', type: 'text', value: toRelativePath(currentSrc) || '', readonly: true },
            { name: 'image_file', label: 'Replace image', type: 'file' }
        ],
        onSave: async (values, entId) => {
            const fd = new FormData();
            fd.append('location_id', values.location_id || '');
            fd.append('caption', values.caption || '');
            const fileEl = document.getElementById('generic_field_image_file');
            if(fileEl && fileEl.files && fileEl.files[0]) fd.append('image', fileEl.files[0]);
            fd.append('gallery_id', entId);
            const res = await fetch('../api/gallery.php?action=update',{ method:'POST', body: fd });
            const txt = await res.text(); const j = txt ? JSON.parse(txt) : {}; if(!res.ok || (j && j.success===false)) throw new Error(j.message||'Save failed');
        },
        onSaved: () => loadGallery()
    });

    // show preview of current image and wire file-input preview
    setTimeout(()=>{
        const cur = document.getElementById('generic_field_image_path');
        const f = document.getElementById('generic_field_image_file');
        if(cur && cur.value){ const img = document.createElement('img'); img.src = normalizeImagePath(cur.value); img.width = 160; img.style.display='block'; img.style.marginTop='8px'; cur.parentNode.appendChild(img); }
        if(f){ f.onchange = function(){ const file = this.files[0]; let prev = cur && cur.parentNode.querySelector('img'); if(!prev){ prev = document.createElement('img'); prev.width = 160; prev.style.display='block'; prev.style.marginTop='8px'; cur.parentNode.appendChild(prev); } if(file){ prev.src = URL.createObjectURL(file); } } }
    },60);
}

function cancelGallery(btn){ loadGallery(); }

function saveGallery(btn,id){
    // support inline save from card (if used) — otherwise modal is preferred
    const card = btn.closest('.gallery-card');
    if(!card){ return loadGallery(); }
    const locationText = (card.querySelector('.gallery-card-location')?.innerText || '').trim();
    const captionText = (card.querySelector('.gallery-card-caption')?.innerText || '').trim();
    const locOption = Array.from(new_gallery_location.options).find(o => o.text === locationText);
    const location_id = locOption ? locOption.value : null;

    const data = { gallery_id: id, location_id, caption: captionText };
    fetch('../api/gallery.php?action=update',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) })
    .then(()=>loadGallery());
}

function deleteGallery(id){
    if(!confirm("Delete this gallery image?")) return;
    fetch('../api/gallery.php?action=delete',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({gallery_id:id}) }).then(()=>loadGallery());
}

function addGallery(){
    const location_id = new_gallery_location.value;
    const caption = new_gallery_caption.value.trim();
    const file = new_gallery_img.files[0];

    if(!location_id || !file){ alert("Select location and choose image"); return; }

    const formData = new FormData();
    formData.append('location_id', location_id);
    formData.append('caption', caption);
    formData.append('image', file);

    fetch('../api/gallery.php?action=add',{
        method:'POST',
        body: formData
    }).then(()=>{
        new_gallery_location.value='';
        new_gallery_caption.value='';
        new_gallery_img.value='';
        const prev = document.getElementById('new_gallery_img_preview'); if(prev){ prev.style.display='none'; prev.src=''; }
        loadGallery();
    });
}

// Load on page ready
loadGallery();
