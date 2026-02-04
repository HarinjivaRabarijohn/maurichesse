const qrTable = document.getElementById('qrTable');
const new_qr_code = document.getElementById('new_qr_code');
const new_qr_location = document.getElementById('new_qr_location');

function populateQRLocationOptions(locations){
    if(!Array.isArray(locations)) return;
    if(!new_qr_location){ console.warn('QR location select (#new_qr_location) not found in DOM'); return; }
    new_qr_location.disabled = false;
    new_qr_location.style.display = '';
    new_qr_location.innerHTML = '<option value="">--Select Location--</option>';
    locations.forEach(l => { new_qr_location.innerHTML += `<option value="${l.location_id}">${l.name}</option>`; });
} 

function loadQR() {
    fetch('../api/qr.php?action=list')
    .then(r => r.json())
    .then(data => {
        qrTable.querySelector('tbody').innerHTML = data.map(q => `
            <tr>
                <td>${q.qr_id}</td>
                <td contenteditable="false">
                    ${q.qr_code}
                    ${q.image_path ? `<br><a href="../${q.image_path}" target="_blank" style="font-size:0.85em;color:var(--accent)">📥 View QR</a>` : ''}
                </td>
                <td contenteditable="false" data-loc-id="${q.location_id || ''}">${q.location_name || ''}</td>
                <td>
                    <button class="edit" onclick="editQR(this)">Edit</button>
                    <button class="save" onclick="saveQR(this, ${q.qr_id})" hidden>Save</button>
                    <button class="cancel" onclick="cancelQR(this)" hidden>Cancel</button>
                    <button class="delete" onclick="deleteQR(${q.qr_id})">Delete</button>
                </td>
            </tr>`).join('');

        document.getElementById('statQR').innerText = data.length;
        try{ document.dispatchEvent(new CustomEvent('qr:changed', { detail: data })); } catch(e){ /* ignore */ }
    });

    // Populate QR location dropdown (initial) — defensive: fetch and populate even if dashboard didn't prefill
    (async ()=>{
        try{
            const res = await fetch('../api/location.php?action=list');
            const locations = await res.json();
            populateQRLocationOptions(locations);
        } catch(err){ console.warn('Failed to populate QR locations', err); }
    })();
}

// update QR dropdowns when locations change elsewhere in the app
document.addEventListener('locations:changed', function(e){ try{ populateQRLocationOptions(e.detail); loadQR(); } catch(err){ /* ignore */ } });

// expose an event so other modules depending on QR (eg. FunFacts) can refresh
// (listeners should call loadFunFacts or repopulate their selects)


async function editQR(btn){
    const row = btn.closest('tr');
    const id = row.cells[0].innerText.trim();
    const qr_code = row.cells[1].innerText.trim();
    const location_name = row.cells[2].innerText.trim();

    // ensure location options are available — if not, fetch them
    if(!new_qr_location || !new_qr_location.options || new_qr_location.options.length <= 1){
        try{
            const resp = await fetch('../api/location.php?action=list');
            const locs = await resp.json();
            populateQRLocationOptions(locs);
        } catch(err){ console.warn('failed to load locations for QR modal', err); }
    }

    // build options from the select (now should be populated)
    const opts = Array.from((new_qr_location && new_qr_location.options) ? new_qr_location.options : []).map(o=>({ value: o.value, label: o.text }));

    openGenericEditModal({
        entity: 'qr',
        id,
        title: 'Modifier le QR',
        fields: [
            { name: 'qr_code', label: 'QR code', value: qr_code },
            { name: 'location_id', label: 'Location', type: 'select', value: opts.find(o=>o.label===location_name)?.value || '', options: opts }
        ],
        validate: v => (!v.qr_code ? 'QR code required' : null),
        saveUrl: '../api/qr.php?action=update',
        onSaved: () => loadQR()
    });
}

function cancelQR(btn){ loadQR(); }

async function saveQR(btn, id){
    const row = btn.closest('tr');

    // try to resolve location by matching the visible text to the select options
    let locOption = (new_qr_location && new_qr_location.options) ? Array.from(new_qr_location.options).find(o => o.text === row.cells[2].innerText.trim()) : null;
    // fallback: if the row has a data-loc-id attribute (render-time hint), use it
    let location_id = locOption ? locOption.value : (row.cells[2].dataset && row.cells[2].dataset.locId ? row.cells[2].dataset.locId : null);

    // last resort: fetch locations and try to match again
    if(!location_id){
        try{
            const resp = await fetch('../api/location.php?action=list');
            const locs = await resp.json();
            populateQRLocationOptions(locs);
            const opt = Array.from(new_qr_location.options).find(o => o.text === row.cells[2].innerText.trim());
            if(opt) location_id = opt.value;
        } catch(err){ /* ignore */ }
    }

    const data = {
        qr_id: id,
        qr_code: row.cells[1].innerText.trim(),
        location_id
    };
    await fetch('../api/qr.php?action=update',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
    });
    loadQR();
}

function deleteQR(id){
    if(!confirm("Delete this QR?")) return;
    fetch('../api/qr.php?action=delete',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({qr_id:id}) }).then(()=>loadQR());
}

function addQR(){
    const data = {
        qr_code: new_qr_code.value.trim(),
        location_id: new_qr_location.value
    };
    if(!data.qr_code || !data.location_id){ alert("Enter QR code and select location"); return; }

    fetch('../api/qr.php?action=add',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }).then(r=>r.json()).then(d=>{
        if(d.success){ new_qr_code.value=''; new_qr_location.value=''; loadQR(); }
        alert(d.message || 'Done');
    }).catch(()=>alert('Request failed'));
}

function generateQR(){
    const location_id = new_qr_location && new_qr_location.value;
    if(!location_id){ alert("Select a location first"); return; }
    const custom = new_qr_code && new_qr_code.value.trim();
    const resultEl = document.getElementById('qrGenerateResult');
    if(resultEl){ resultEl.style.display = 'block'; resultEl.innerHTML = 'Generating…'; }
    fetch('../api/qr.php?action=generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_id: location_id, qr_code: custom || '' })
    })
    .then(r=>r.json())
    .then(d=>{
        if(!resultEl) return;
        if(d.success){
            resultEl.innerHTML = 'QR created: <strong>' + (d.qr_code || '') + '</strong>' +
                (d.image_path ? ' &nbsp; <a href="../' + d.image_path + '" target="_blank" rel="noopener">View / download PNG</a>' : ' (image not saved)');
            loadQR();
        } else {
            resultEl.innerHTML = '<span style="color:#c0392b">' + (d.message || 'Failed') + '</span>';
        }
    })
    .catch(()=>{ if(resultEl) resultEl.innerHTML = '<span style="color:#c0392b">Request failed</span>'; });
}

// Load on page ready
loadQR();
