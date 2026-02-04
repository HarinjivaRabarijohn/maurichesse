const funFactTable = document.getElementById('funFactTable');
const new_funfact_qr = document.getElementById('new_funfact_qr');
const new_funfact_text = document.getElementById('new_funfact_text');
const new_funfact_hint = document.getElementById('new_funfact_hint');

function loadFunFacts() {
    fetch('../api/fun_fact.php?action=list')
    .then(r => r.json())
    .then(data => {
        if (!funFactTable || !funFactTable.querySelector('tbody')) return;
        funFactTable.querySelector('tbody').innerHTML = (data || []).map(f => `
            <tr>
                <td>${f.fun_fact_id}</td>
                <td>${(f.qr_code || '').replace(/</g,'&lt;')}</td>
                <td>${(f.fact_text || '').replace(/</g,'&lt;').slice(0,60)}${(f.fact_text||'').length>60?'…':''}</td>
                <td>${(f.hint_text || '').replace(/</g,'&lt;').slice(0,30)}${(f.hint_text||'').length>30?'…':''}</td>
                <td>${(f.hint_2 || '').replace(/</g,'&lt;').slice(0,30)}${(f.hint_2||'').length>30?'…':''}</td>
                <td>${(f.hint_3 || '').replace(/</g,'&lt;').slice(0,30)}${(f.hint_3||'').length>30?'…':''}</td>
                <td>
                    <button class="edit" onclick="editFunFact(this)">Edit</button>
                    <button class="delete" onclick="deleteFunFact(${f.fun_fact_id})">Delete</button>
                </td>
            </tr>`).join('');

        const stat = document.getElementById('statFunFacts'); if (stat) stat.innerText = (data || []).length;
        try{ document.dispatchEvent(new CustomEvent('funfact:changed', { detail: data })); } catch(e){}
    })
    .catch(err => console.error('loadFunFacts', err));

    fetch('../api/qr.php?action=list')
    .then(r => r.json())
    .then(qrs => {
        if (!new_funfact_qr) return;
        new_funfact_qr.innerHTML = '<option value="">--Select QR--</option>';
        (qrs || []).forEach(q => { new_funfact_qr.innerHTML += `<option value="${q.qr_id}">${q.qr_code}</option>`; });
    })
    .catch(() => {});
}

function editFunFact(btn){
    const row = btn.closest('tr');
    const id = row.cells[0].innerText.trim();
    const qr_text = row.cells[1].innerText.trim();
    const fact_text = row.cells[2].innerText.trim();
    const hint_text = row.cells[3] ? row.cells[3].innerText.trim() : '';
    const hint_2 = row.cells[4] ? row.cells[4].innerText.trim() : '';
    const hint_3 = row.cells[5] ? row.cells[5].innerText.trim() : '';

    const opts = Array.from(new_funfact_qr.options).map(o=>({ value: o.value, label: o.text }));

    openGenericEditModal({
        entity: 'fun_fact',
        id,
        title: 'Edit Riddle & Hints',
        fields: [
            { name: 'qr_id', label: 'QR', type: 'select', value: opts.find(o=>o.label===qr_text)?.value || '', options: opts },
            { name: 'fact_text', label: 'Riddle text', value: fact_text },
            { name: 'hint_text', label: 'Hint 1 (optional)', value: hint_text },
            { name: 'hint_2', label: 'Hint 2 (optional)', value: hint_2 },
            { name: 'hint_3', label: 'Hint 3 (optional)', value: hint_3 }
        ],
        validate: v => (!v.qr_id || !v.fact_text) ? 'QR and riddle text required' : null,
        saveUrl: '../api/fun_fact.php?action=update',
        onSaved: () => loadFunFacts()
    });
}

function deleteFunFact(id){
    if(!confirm("Delete this riddle?")) return;
    fetch('../api/fun_fact.php?action=delete',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({fun_fact_id:id}) }).then(()=>loadFunFacts());
}

function addFunFact(){
    const data = {
        qr_id: new_funfact_qr.value,
        fact_text: new_funfact_text.value.trim(),
        hint_text: new_funfact_hint.value.trim(),
        hint_2: new_funfact_hint_2.value.trim(),
        hint_3: new_funfact_hint_3.value.trim()
    };
    if(!data.qr_id || !data.fact_text){ alert("Select QR and enter fun fact"); return; }

    fetch('../api/fun_fact.php?action=add',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) }).then(()=>{
        new_funfact_qr.value=''; 
        new_funfact_text.value=''; 
        new_funfact_hint.value=''; 
        new_funfact_hint_2.value=''; 
        new_funfact_hint_3.value=''; 
        loadFunFacts();
    }).catch(()=>loadFunFacts());
}

// Load on page ready
loadFunFacts();

// refresh QR dropdown when QR list changes elsewhere
document.addEventListener('qr:changed', function(e){ try{ const qrs = e.detail || []; if(new_funfact_qr){ new_funfact_qr.innerHTML = '<option value="">--Select QR--</option>'; (qrs||[]).forEach(q => new_funfact_qr.innerHTML += `<option value="${q.qr_id}">${q.qr_code}</option>`); } } catch(err){} });
