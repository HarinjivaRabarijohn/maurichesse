/* ================================
    TAB LOGIC
================================ */
function openTab(evt, tabName){
    // hide all panels and reset tab state
    document.querySelectorAll('.tab-content').forEach(t => { t.style.display = 'none'; t.setAttribute('aria-hidden','true'); });
    document.querySelectorAll('.tablink').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });

    const panel = document.getElementById(tabName);
    if (panel){
        // ensure panel is focusable for accessibility
        if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex','-1');
        panel.style.display = 'block';
        panel.setAttribute('aria-hidden','false');
    }

    // mark the clicked tab as active
    // robustly find the corresponding tab button even if there is no data-tab attribute
    const byData = document.querySelector(`.tablink[data-tab="${tabName}"]`);
    const byOnclick = Array.from(document.querySelectorAll('.tablink')).find(b => {
        const oc = b.getAttribute('onclick') || '';
        return oc.includes(`'${tabName}'`) || oc.includes(`"${tabName}"`);
    });
    const byText = Array.from(document.querySelectorAll('.tablink')).find(b => b.textContent.trim().toLowerCase() === String(tabName).toLowerCase());

    const btn = (evt && evt.currentTarget) ? evt.currentTarget : (byData || byOnclick || byText || null);
    if (btn){ btn.classList.add('active'); btn.setAttribute('aria-selected','true'); }

    // persist and reflect in URL (do not create history entry)
    try{ history.replaceState(null, '', `#${tabName}`); localStorage.setItem('mau_active_tab', tabName); } catch(e){ /* ignore */ }

    // move focus into panel for keyboard users
    if (panel) setTimeout(()=> panel.focus(), 50);

    // Admin overview map: load when Profile tab is opened
    if (tabName === 'profile' && typeof loadAdminOverviewMap === 'function') setTimeout(loadAdminOverviewMap, 100);

    // refresh data for the opened tab so dependent selects are always current
    try{
        if(tabName === 'qr'){
            // ensure locations & qr lists are fresh when user opens QR tab
            if(typeof loadLocations === 'function') loadLocations();
            if(typeof loadQR === 'function') loadQR();
        } else if(tabName === 'gallery'){
            if(typeof loadLocations === 'function') loadLocations();
            if(typeof loadGallery === 'function') loadGallery();
        } else if(tabName === 'locations'){
            if(typeof loadLocations === 'function') loadLocations();
        } else if(tabName === 'trails'){
            if(typeof loadTrails === 'function') loadTrails();
        }
    }catch(e){ /* non-fatal */ }
}

/* ================================
   Language / i18n helpers
   ================================ */
const adminTranslations = {
    en: {
        editCategoryTitle: 'Edit Category',
        editCategoryNameLabel: 'Name',
        editCategorySave: 'Save',
        editCategoryCancel: 'Cancel',
        genericSave: 'Save',
        genericCancel: 'Cancel',
        genericTitle: 'Edit'
    },
    fr: {
        editCategoryTitle: 'Modifier la catégorie',
        editCategoryNameLabel: 'Nom',
        editCategorySave: 'Enregistrer',
        editCategoryCancel: 'Annuler',
        genericSave: 'Enregistrer',
        genericCancel: 'Annuler',
        genericTitle: 'Modifier'
    }
};

function applyAdminLanguage(lang){
    const t = adminTranslations[lang] || adminTranslations.en;
    const elCatTitle = document.getElementById('editCategoryTitle'); if(elCatTitle) elCatTitle.innerText = t.editCategoryTitle;
    const elCatLabel = document.querySelector('#editCategoryFields label[for="edit_category_name"]'); if(elCatLabel) elCatLabel.innerText = t.editCategoryNameLabel;
    const elCatSave = document.getElementById('editCategorySave'); if(elCatSave) elCatSave.innerText = t.editCategorySave;
    const elCatCancel = document.getElementById('editCategoryCancel'); if(elCatCancel) elCatCancel.innerText = t.editCategoryCancel;
    const genTitle = document.getElementById('genericEditTitle'); if(genTitle) genTitle.innerText = t.genericTitle;
    const genSave = document.getElementById('genericEditSave'); if(genSave) genSave.innerText = t.genericSave;
    const genCancel = document.getElementById('genericEditCancel'); if(genCancel) genCancel.innerText = t.genericCancel;
}

function logout(){
    localStorage.removeItem('admin');
    window.location.href = 'auth.html';
} 

/* ================================
    INITIAL LOAD
================================ */
document.addEventListener('DOMContentLoaded', () => {
    // restore last active tab (hash preferred, then localStorage), default to 'profile'
    const hashTab = location.hash ? location.hash.replace('#','') : '';
    const savedTab = (() => { try{ return localStorage.getItem('mau_active_tab'); } catch(e){ return null; } })();
    const initialTab = hashTab || savedTab || 'profile';

    // attach accessible attributes, click & keyboard navigation to tab buttons
    const tabButtons = Array.from(document.querySelectorAll('.tablink'));
    tabButtons.forEach((btn, idx) =>{
        // infer and persist a data-tab value if missing (helps programmatic lookup)
        if(!btn.dataset.tab){
            const oc = btn.getAttribute('onclick') || '';
            const m = oc.match(/openTab\([^,]+,\s*['\"]([^'\"]+)['\"]/);
            if(m && m[1]) btn.dataset.tab = m[1];
            else btn.dataset.tab = btn.textContent.trim().toLowerCase();
        }

        btn.setAttribute('role','tab');
        btn.setAttribute('aria-controls', btn.dataset.tab || '');
        btn.setAttribute('tabindex', '0');

        // ensure click uses the centralized openTab (so currentTarget is correct)
        btn.addEventListener('click', (e) => {
            openTab(e, btn.dataset.tab);
        });

        btn.addEventListener('keydown', (e) => {
            if(e.key === 'ArrowRight') { e.preventDefault(); tabButtons[(idx+1) % tabButtons.length].focus(); }
            if(e.key === 'ArrowLeft')  { e.preventDefault(); tabButtons[(idx-1+tabButtons.length) % tabButtons.length].focus(); }
            if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTab(e, btn.dataset.tab); }
        });
    });

    // open the initial tab (use the data-tab aware lookup)
    const initialBtn = document.querySelector(`.tablink[data-tab="${initialTab}"]`) ||
                       tabButtons.find(b => b.textContent.trim().toLowerCase() === initialTab.toLowerCase());
    if(initialBtn) openTab({ currentTarget: initialBtn }, initialTab);
    else openTab(null, initialTab);

    // Language selector: apply persisted language and wire selector
    try{
        const langSelect = document.getElementById('adminLangSelect');
        const saved = localStorage.getItem('mau_lang') || 'en';
        if(langSelect){ langSelect.value = saved; applyAdminLanguage(saved); langSelect.addEventListener('change', (e)=>{ localStorage.setItem('mau_lang', e.target.value); applyAdminLanguage(e.target.value); }); }
    }catch(e){ /* ignore */ }

    // initial data loads
    loadAdmins();
    loadCategories();
    loadLocations();
    loadGallery();
    loadQR();
    loadFunFacts();
    loadUsers();
    loadTrails();
});

/* ================================
    ADMIN CRUD
================================ */
function loadAdmins(){
    fetch('../api/admin.php?action=list')
    .then(res => res.json())
    .then(data => {
        const table = document.getElementById('adminTable');
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
        data.forEach(a => {
            const tr = document.createElement('tr');

            const tdId = document.createElement('td'); tdId.innerText = a.admin_id;
            const tdUser = document.createElement('td'); tdUser.innerText = a.username;
            const tdEmail = document.createElement('td'); tdEmail.innerText = a.email || '—'; tdEmail.title = a.email || 'No email';
            const tdCreated = document.createElement('td'); tdCreated.innerText = a.created_at;
            const tdActions = document.createElement('td');

            const editBtn = document.createElement('button'); editBtn.className = 'edit'; editBtn.innerText = 'Edit';
            editBtn.addEventListener('click', () => editAdmin(a.admin_id, a.username, a.email || ''));

            const delBtn = document.createElement('button'); delBtn.className = 'delete'; delBtn.innerText = 'Delete';
            delBtn.addEventListener('click', () => deleteAdmin(a.admin_id));

            tdActions.appendChild(editBtn); tdActions.appendChild(delBtn);
            tr.appendChild(tdId); tr.appendChild(tdUser); tr.appendChild(tdEmail); tr.appendChild(tdCreated); tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });
    });
}

function addAdmin(){
    const username = document.getElementById('new_admin_username').value.trim();
    const email = document.getElementById('new_admin_email') ? document.getElementById('new_admin_email').value.trim() : '';
    const password = document.getElementById('new_admin_password').value.trim();
    fetch('../api/admin.php?action=add', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username, email, password})
    })
    .then(res=>res.json()).then(data=>{
        alert(data.message);
        if(data.success){
            const u = document.getElementById('new_admin_username'); if(u) u.value='';
            const e = document.getElementById('new_admin_email'); if(e) e.value='';
            const p = document.getElementById('new_admin_password'); if(p) p.value='';
            loadAdmins();
        }
    });
}

function editAdmin(id, username, email){
    openGenericEditModal({
        entity: 'admin',
        id,
        title: 'Edit Admin',
        fields: [
            { name: 'username', label: 'Username', value: username },
            { name: 'email', label: 'Email', value: email || '' },
        ],
        validate: v => (!v.username ? 'Username required' : null),
        saveUrl: '../api/admin.php?action=update',
        onSaved: () => loadAdmins()
    });
}

function deleteAdmin(id){
    if(!confirm('Delete this admin?')) return;
    fetch('../api/admin.php?action=delete', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({admin_id:id})
    })
    .then(res=>res.json()).then(data=>{
        alert(data.message);
        loadAdmins();
    });
}

/* ================================
    CATEGORY CRUD
================================ */
function loadCategories(){
    fetch('../api/category.php?action=list')
    .then(res=>res.json())
    .then(data=>{
        const table = document.getElementById('categoryTable');
        const tbody = table ? table.querySelector('tbody') : null;
        const select = document.getElementById('new_location_cat');
        if(tbody) tbody.innerHTML='';
        if(select) select.innerHTML='<option value="">--Select Category--</option>';
        (data || []).forEach(c=>{
            if(tbody) tbody.innerHTML+=`
                <tr>
                    <td>${c.category_id}</td>
                    <td>${c.category_name}</td>
                    <td>
                        <button class="edit" onclick="editCategory(${c.category_id}, '${c.category_name}')">Edit</button>
                        <button class="delete" onclick="deleteCategory(${c.category_id})">Delete</button>
                    </td>
                </tr>`;
            select.innerHTML+=`<option value="${c.category_id}">${c.category_name}</option>`;
        });
        try{ document.dispatchEvent(new CustomEvent('categories:changed', { detail: data })); } catch(e){ /* ignore */ }
    });
}

function addCategory(){
    const name = document.getElementById('new_category_name').value.trim();
    fetch('../api/category.php?action=add', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({category_name:name})
    })
    .then(res=>res.json()).then(data=>{
        alert(data.message);
        if(data.success){
            const inp = document.getElementById('new_category_name'); if(inp) inp.value = '';
            loadCategories();
        }
    });
}

function editCategory(id, name){
    // backward-compatible entrypoint used by onclick handlers
    openEditCategoryModal(id, name);
}

/* Modal: edit category */
function openEditCategoryModal(id, name){
    const modal = document.getElementById('editCategoryModal');
    document.getElementById('edit_category_id').value = id;
    const input = document.getElementById('edit_category_name');
    input.value = name || '';
    document.getElementById('editCategoryError').innerText = '';
    modal.setAttribute('aria-hidden','false');
    // focus
    setTimeout(()=> input.focus(), 50);
    // attach handlers
    document.getElementById('editCategorySave').onclick = saveCategoryFromModal;
    document.getElementById('editCategoryCancel').onclick = hideEditCategoryModal;
    modal.querySelector('.modal-backdrop').onclick = hideEditCategoryModal;
    document.addEventListener('keydown', modalKeyHandler);
}

function hideEditCategoryModal(){
    const modal = document.getElementById('editCategoryModal');
    modal.setAttribute('aria-hidden','true');
    document.removeEventListener('keydown', modalKeyHandler);
}

function modalKeyHandler(e){ if(e.key === 'Escape') hideEditCategoryModal(); }

function saveCategoryFromModal(){
    const id = document.getElementById('edit_category_id').value;
    const name = document.getElementById('edit_category_name').value.trim();
    const errBox = document.getElementById('editCategoryError');
    if(!name){ errBox.innerText = 'Category name required'; return; }

    fetch('../api/category.php?action=update', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({category_id: id, category_name: name})
    })
    .then(async res => {
        const text = await res.text();
        if(!res.ok){ try{ const j = JSON.parse(text); throw new Error(j.message||text); } catch(e){ throw new Error(text||res.statusText); } }
        return JSON.parse(text);
    })
    .then(data => {
        if(data.success){
            hideEditCategoryModal();
            loadCategories();
        } else {
            errBox.innerText = data.message || 'Update failed';
        }
    })
    .catch(err => {
        console.error('saveCategoryFromModal error', err);
        errBox.innerText = err.message || 'Server error';
    });
}

/* =====================
   Generic edit modal API
   ===================== */
function normalizeImagePath(p){ if(!p) return ''; if(/^https?:\/\//i.test(p) || p.startsWith('/')) return p; if(p.startsWith('uploads/')) return '../' + p; if(p.startsWith('..')) return p; return '../' + p; }

function _createFieldEl(field){
    // field: {name, label, type, value, options, readonly}
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-field';
    const id = `generic_field_${field.name}`;
    const label = document.createElement('label'); label.setAttribute('for', id); label.innerText = field.label || field.name;
    wrapper.appendChild(label);

    if(field.type === 'select'){
        const sel = document.createElement('select'); sel.id = id; sel.name = field.name;
        const opts = field.options || [];
        opts.forEach(o => {
            const option = document.createElement('option'); option.value = o.value; option.text = o.label || o.value; if(String(o.value) === String(field.value)) option.selected = true; sel.appendChild(option);
        });
        if(field.readonly) sel.disabled = true;
        if(field.readonly) sel.classList.add('readonly-field');
        wrapper.appendChild(sel);
    } else if(field.type === 'file'){
        const inp = document.createElement('input'); inp.type = 'file'; inp.id = id; inp.name = field.name; inp.accept = 'image/*';
        // do not set value for file inputs
        if(field.readonly){ inp.disabled = true; inp.classList.add('readonly-field'); }
        wrapper.appendChild(inp);
    } else {
        const inp = document.createElement('input'); inp.type = field.type || 'text'; inp.id = id; inp.name = field.name; inp.value = field.value ?? '';
        if(field.readonly){ inp.readOnly = true; inp.classList.add('readonly-field'); }
        // mark for tests/debug
        if(field.readonly) inp.setAttribute('data-readonly','true');
        wrapper.appendChild(inp);
    }
    return wrapper;
}

function openGenericEditModal(config){
    // config: {entity, id, title, fields:[{name,label,type,value,options}], saveUrl, onSaved(optional)}
    const modal = document.getElementById('genericEditModal');
    const title = document.getElementById('genericEditTitle');
    const fieldsContainer = document.getElementById('genericEditFields');
    const errBox = document.getElementById('genericEditError');
    const ent = document.getElementById('generic_entity');
    const entId = document.getElementById('generic_entity_id');

    title.innerText = config.title || `Edit ${config.entity || ''}`;
    ent.value = config.entity || '';
    entId.value = config.id ?? '';
    fieldsContainer.innerHTML = '';
    (config.fields || []).forEach(f => fieldsContainer.appendChild(_createFieldEl(f)));
    errBox.innerText = '';
    modal.setAttribute('aria-hidden','false');

    // handlers
    const saveBtn = document.getElementById('genericEditSave');
    const cancelBtn = document.getElementById('genericEditCancel');
    saveBtn.onclick = async function(){
        const values = {};
        (config.fields || []).forEach(f => {
            const el = document.getElementById(`generic_field_${f.name}`);
            if(!el) return;
            values[f.name] = el.tagName === 'SELECT' ? el.value : el.value.trim();
        });
        // basic validation
        if(config.validate){
            const vErr = config.validate(values);
            if(vErr){ errBox.innerText = vErr; return; }
        }

        try{
            if(typeof config.onSave === 'function'){
                await config.onSave(values, config.id);
            } else if(config.saveUrl){
                const body = Object.assign({}, values);
                if(config.id) body[`${config.entity}_id`] = config.id;
                const res = await fetch(config.saveUrl, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)});
                const text = await res.text();
                const j = text ? JSON.parse(text) : {};
                if(!res.ok || (j && j.success === false)) throw new Error(j.message || 'Save failed');
            }
            // on success
            modal.setAttribute('aria-hidden','true');
            if(typeof config.onSaved === 'function') config.onSaved();
            else {
                // try to call conventional loader
                const loader = window['load' + (config.entity || '').charAt(0).toUpperCase() + (config.entity || '').slice(1) + 's'];
                if(typeof loader === 'function') loader();
            }
        } catch(err){
            console.error('genericEdit save error', err);
            errBox.innerText = err.message || 'Erreur lors de la sauvegarde';
        }
    };
    cancelBtn.onclick = function(){ modal.setAttribute('aria-hidden','true'); };
    modal.querySelector('.modal-backdrop').onclick = function(){ modal.setAttribute('aria-hidden','true'); };
    document.addEventListener('keydown', function escHandler(e){ if(e.key === 'Escape'){ modal.setAttribute('aria-hidden','true'); document.removeEventListener('keydown', escHandler); } });
}


function deleteCategory(id){
    console.log(id)
    if(!confirm('Delete this category?')) return;
    fetch('../api/category.php?action=delete', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({category_id:id})
    }).then(res=>res.json()).then(data=>{
        alert(data.message);
        loadCategories();
    });
}

/* ================================
    LOCATIONS CRUD (with file upload)
================================ */
function loadLocations(){
    fetch('../api/location.php?action=list')
    .then(res=>res.json())
    .then(data=>{
        const table = document.getElementById('locationTable');
        const tbody = table ? table.querySelector('tbody') : null;
        const catSelect = document.getElementById('new_location_cat');
        if(tbody) tbody.innerHTML='';
        (data || []).forEach(l=>{
            if(tbody) tbody.innerHTML+=`
                <tr>
                    <td>${l.location_id}</td>
                    <td>${l.name}</td>
                    <td>${l.description||''}</td>
                    <td>${l.latitude}</td>
                    <td>${l.longitude}</td>
                    <td>${l.category_name||''}</td>
                    <td>${(l.image || l.image_path || l.image_url) ? `<img src="${normalizeImagePath(l.image||l.image_path||l.image_url)}" width="80" alt="">` : 'N/A'}</td>
                    <td>
                        <button class="edit" onclick="editLocation(${l.location_id})">Edit</button>
                        <button class="delete" onclick="deleteLocation(${l.location_id})">Delete</button>
                    </td>
                </tr>`;
        });

        // populate location-dependent selects so other modules update immediately
        try{
            const qrSelect = document.getElementById('new_qr_location');
            const galSelect = document.getElementById('new_gallery_location');
            if(qrSelect){ qrSelect.innerHTML = '<option value="">--Select Location--</option>'; data.forEach(x=> qrSelect.innerHTML += `<option value="${x.location_id}">${x.name}</option>`); }
            if(galSelect){ galSelect.innerHTML = '<option value="">--Select Location--</option>'; data.forEach(x=> galSelect.innerHTML += `<option value="${x.location_id}">${x.name}</option>`); }
        } catch(err){ /* ignore */ }

        // notify other modules that locations changed (they may refresh their own UI)
        try{ document.dispatchEvent(new CustomEvent('locations:changed', { detail: data })); } catch(e){ /* ignore */ }
    });
}

function addLocation(){
    const name = document.getElementById('new_location_name').value;
    const desc = document.getElementById('new_location_desc').value;
    const lat = document.getElementById('new_location_lat').value;
    const lng = document.getElementById('new_location_lng').value;
    const category_id = document.getElementById('new_location_cat').value;
    const imageFile = document.getElementById('new_location_image').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', desc);
    formData.append('latitude', lat);
    formData.append('longitude', lng);
    formData.append('category_id', category_id);
    if(imageFile) formData.append('image', imageFile);

    fetch('../api/location.php?action=add', {
        method:'POST',
        body: formData
    }).then(res=>res.json()).then(data=>{
        alert(data.message);
        loadLocations();
    });
}

function editLocation(id){
    // prefer reading row values from the DOM so modal is prefilled with existing data
    const tbody = document.getElementById('locationTable')?.querySelector('tbody');
    const row = tbody ? Array.from(tbody.rows).find(r => r.cells[0].innerText.trim() === String(id)) : null;

    const openWith = (item) => {
        // build category options from the existing select (keeps ids in sync)
        const catSelect = document.getElementById('new_location_cat');
        const opts = catSelect ? Array.from(catSelect.options).map(o=>({ value: o.value, label: o.text })) : [];

        openGenericEditModal({
            entity: 'location',
            id: String(id),
            title: 'Edit Location',
            fields: [
                { name: 'location_id', label: 'ID', type: 'text', value: item.location_id || item.location_id === 0 ? String(item.location_id) : String(id), readonly: true },
                { name: 'name', label: 'Name', type: 'text', value: item.name || '' },
                { name: 'description', label: 'Description', type: 'text', value: item.description || '' },
                { name: 'latitude', label: 'Latitude', type: 'text', value: item.latitude ?? '' },
                { name: 'longitude', label: 'Longitude', type: 'text', value: item.longitude ?? '' },
                { name: 'category_id', label: 'Category', type: 'select', value: item.category_id ?? (item.category_id===0?0:''), options: opts },
                { name: 'image_path', label: 'Current image', type: 'text', value: toRelativePath(item.image || item.image_path || item.image_url) || '', readonly: true },
                { name: 'image_file', label: 'Replace image', type: 'file' }
            ],
            validate: v => (!v.name ? 'Name required' : null),
            onSave: async (values, entId) => {
                const fd = new FormData();
                Object.keys(values).forEach(k=>{ if(k !== 'image_file') fd.append(k, values[k] || ''); });
                const fileEl = document.getElementById('generic_field_image_file');
                if(fileEl && fileEl.files && fileEl.files[0]) fd.append('image', fileEl.files[0]);
                fd.append('location_id', entId);
                const res = await fetch('../api/location.php?action=update', { method: 'POST', body: fd });
                const txt = await res.text(); const j = txt ? JSON.parse(txt) : {}; if(!res.ok || (j && j.success === false)) throw new Error(j.message || 'Save failed');
            },
            onSaved: () => loadLocations()
        });
    };

    if(row){
        const item = {
            location_id: row.cells[0].innerText.trim(),
            name: row.cells[1].innerText.trim(),
            description: row.cells[2].innerText.trim(),
            latitude: row.cells[3].innerText.trim(),
            longitude: row.cells[4].innerText.trim(),
            category_name: row.cells[5].innerText.trim(),
            image: row.cells[6].querySelector('img') ? toRelativePath(row.cells[6].querySelector('img').src) : ''
        };
        // try to map category_name to category_id using select
        const catSelect = document.getElementById('new_location_cat');
        if(catSelect){
            const opt = Array.from(catSelect.options).find(o => o.text === item.category_name);
            item.category_id = opt ? opt.value : '';
        }
        openWith(item);

        // show preview + wire file-input (match gallery behavior)
        setTimeout(()=>{
            const cur = document.getElementById('generic_field_image_path');
            const f = document.getElementById('generic_field_image_file');
            if(cur && cur.value){ const img = document.createElement('img'); img.src = normalizeImagePath(cur.value); img.width = 160; img.style.display='block'; img.style.marginTop='8px'; cur.parentNode.appendChild(img); }
            if(f){ f.accept = 'image/*'; f.onchange = function(){ const file = this.files[0]; let prev = cur && cur.parentNode.querySelector('img'); if(!prev){ prev = document.createElement('img'); prev.width = 160; prev.style.display='block'; prev.style.marginTop='8px'; cur.parentNode.appendChild(prev); } if(file){ prev.src = URL.createObjectURL(file); } } }
        },60);

    } else {
        // fallback: fetch data from API and find the item
        fetch('../api/location.php?action=list')
        .then(r=>r.json())
        .then(list=>{
            const found = list.find(x => String(x.location_id) === String(id));
            if(!found) return alert('Location data not found for edit');
            openWith(found);
        }).catch(err=>{ console.error(err); alert('Failed to load location data'); });
    }
}

function deleteLocation(id){
    if(!confirm('Delete this location?')) return;
    fetch('../api/location.php?action=delete', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({location_id:id})
    }).then(res=>res.json()).then(data=>{
        alert(data.message);
        loadLocations();
    });
}

/* ================================
    QR CRUD
================================ */
function loadQR(){
    fetch('../api/qr.php?action=list')
    .then(res=>res.json())
    .then(data=>{
        const table = document.getElementById('qrTable');
        const tbody = table ? table.querySelector('tbody') : null;
        const qrSelect = document.getElementById('new_funfact_qr');
        const locSelect = document.getElementById('new_qr_location');
        if(tbody) tbody.innerHTML='';
        if(qrSelect) qrSelect.innerHTML='<option value="">--Select QR--</option>';
        if(locSelect) locSelect.innerHTML='<option value="">--Select Location--</option>';
        (data || []).forEach(q=>{
            if(tbody) tbody.innerHTML+=`
                <tr>
                    <td>${q.qr_id}</td>
                    <td>${q.qr_code}</td>
                    <td>${q.location_name}</td>
                    <td>
                        <button class="edit" onclick="editQR(${q.qr_id})">Edit</button>
                        <button class="delete" onclick="deleteQR(${q.qr_id})">Delete</button>
                    </td>
                </tr>`;
            qrSelect.innerHTML+=`<option value="${q.qr_id}">${q.qr_code}</option>`;
            locSelect.innerHTML+=`<option value="${q.location_id}">${q.location_name}</option>`;
        });
    });
}

function addQR(){
    const qr_code = document.getElementById('new_qr_code').value;
    const location_id = document.getElementById('new_qr_location').value;
    fetch('../api/qr.php?action=add',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({qr_code, location_id})
    }).then(res=>res.json()).then(data=>{
        alert(data.message);
        if(data.success){ const qc = document.getElementById('new_qr_code'); if(qc) qc.value=''; const ql = document.getElementById('new_qr_location'); if(ql) ql.value=''; loadQR(); }
    });
} 

function editQR(id){
    openGenericEditModal({
        entity: 'qr',
        id,
        title: 'Edit QR',
        fields: [ { name: 'qr_code', label: 'QR code', value: '' } ],
        validate: v => (!v.qr_code ? 'QR code required' : null),
        saveUrl: 'api/qr.php?action=update',
        onSaved: () => loadQR()
    });
}
function deleteQR(id){if(!confirm('Delete this QR?'))return;fetch('../api/qr.php?action=delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({qr_id:id})}).then(res=>res.json()).then(d=>{alert(d.message);loadQR();});}

/* ================================
    Fun Fact CRUD
================================ */
function loadFunFacts(){
    fetch('../api/funfact.php?action=list').then(res=>res.json()).then(data=>{
        const tbody = document.getElementById('funfactTable');
        tbody.innerHTML='';
        data.forEach(f=>{
            tbody.innerHTML+=`
            <tr>
                <td>${f.fun_fact_id}</td>
                <td>${f.qr_code}</td>
                <td>${f.fact_text}</td>
                <td>
                    <button class="edit" onclick="editFunFact(${f.fun_fact_id})">Edit</button>
                    <button class="delete" onclick="deleteFunFact(${f.fun_fact_id})">Delete</button>
                </td>
            </tr>`;
        });
    });
}

function addFunFact(){
    const qr_id = document.getElementById('new_funfact_qr').value;
    const text = document.getElementById('new_funfact_text').value;
    fetch('../api/funfact.php?action=add',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({qr_id, fact_text:text})
    }).then(res=>res.json()).then(data=>{ alert(data.message); if(data.success){ const q = document.getElementById('new_funfact_qr'); if(q) q.value=''; const t = document.getElementById('new_funfact_text'); if(t) t.value=''; loadFunFacts(); } });
} 

/* ================================
    Users CRUD
================================ */
function loadUsers(){
    fetch('../api/user.php?action=list').then(res=>res.json()).then(data=>{
        const table = document.getElementById('userTable');
        const tbody = table ? table.querySelector('tbody') : null;
        if(tbody) tbody.innerHTML='';
        (data || []).forEach(u=>{
            if(tbody) tbody.innerHTML+=`
            <tr>
                <td>${u.user_id}</td>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td style="text-align:center;font-weight:600;color:#2ecc71;">🏆 ${u.total_points || 0}</td>
                <td>${u.created_at}</td>
                <td>
                    <button class="edit" onclick="editUser(${u.user_id})">Edit</button>
                    <button class="delete" onclick="deleteUser(${u.user_id})">Delete</button>
                </td>
            </tr>`;
        });
    });
}

function addUser(){
    const username = document.getElementById('new_user_username').value.trim();
    const email = document.getElementById('new_user_email').value.trim();
    const password = document.getElementById('new_user_password').value;
    if(!username || !email || !password){ alert('Username, email and password are required'); return; }
    fetch('../api/user.php?action=add',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username, email, password})})
    .then(res=>res.json()).then(data=>{ alert(data.message); if(data.success){ document.getElementById('new_user_username').value=''; document.getElementById('new_user_email').value=''; document.getElementById('new_user_password').value=''; loadUsers(); } })
    .catch(err=>{ console.error(err); alert('Failed to add user'); });
}

function editUser(id){
    const tbody = document.getElementById('userTable')?.querySelector('tbody');
    const row = tbody ? Array.from(tbody.rows).find(r=>r.cells[0].innerText.trim()===String(id)) : null;
    if(row){
        const item = { user_id: row.cells[0].innerText.trim(), username: row.cells[1].innerText.trim(), email: row.cells[2].innerText.trim(), created_at: row.cells[4].innerText.trim() };
        openGenericEditModal({
            entity: 'user', id: item.user_id, title: 'Edit user',
            fields: [
                { name: 'user_id', label: 'ID', type: 'text', value: item.user_id, readonly: true },
                { name: 'username', label: 'Username', type: 'text', value: item.username },
                { name: 'email', label: 'Email', type: 'text', value: item.email },
                { name: 'password', label: 'Password (leave blank to keep)', type: 'text', value: '' },
                { name: 'created_at', label: 'Created at', type: 'text', value: item.created_at, readonly: true }
            ],
            validate: v => (!v.username || !v.email) ? 'Username and email required' : null,
            saveUrl: '../api/user.php?action=update',
            onSaved: () => loadUsers()
        });
    } else {
        fetch('../api/user.php?action=list').then(r=>r.json()).then(list=>{
            const found = list.find(x=>String(x.user_id)===String(id));
            if(!found) return alert('User not found');
            openGenericEditModal({ entity: 'user', id: found.user_id, title: 'Edit user', fields: [ { name: 'user_id', label: 'ID', type: 'text', value: found.user_id, readonly: true }, { name: 'username', label: 'Username', type: 'text', value: found.username }, { name: 'email', label: 'Email', type: 'text', value: found.email }, { name: 'password', label: 'Password (leave blank to keep)', type: 'text', value: '' }, { name: 'created_at', label: 'Created at', type: 'text', value: found.created_at, readonly: true } ], validate: v => (!v.username || !v.email) ? 'Username and email required' : null, saveUrl: '../api/user.php?action=update', onSaved: () => loadUsers() });
        });
    }
}

function deleteUser(id){
    if(!confirm('Delete this user?')) return;
    fetch('../api/user.php?action=delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:id})}).then(res=>res.json()).then(d=>{alert(d.message);loadUsers();});
}
