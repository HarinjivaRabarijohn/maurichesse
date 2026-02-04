const adminTable = document.getElementById('adminTable');
const new_admin_username = document.getElementById('new_admin_username');
const new_admin_email = document.getElementById('new_admin_email');
const new_admin_password = document.getElementById('new_admin_password');

function loadAdmins() {
    const base = (window.getApiBase ? window.getApiBase() : '../api');
    fetch(base + '/admin.php?action=list')
    .then(r => r.json())
    .then(data => {
        adminTable.querySelector('tbody').innerHTML = data.map(a => `
            <tr>
                <td>${a.admin_id}</td>
                <td contenteditable="false">${a.username}</td>
                <td contenteditable="false" title="${a.email || 'No email'}">${a.email || '—'}</td>
                <td>${a.created_at}</td>
                <td>
                    <button class="edit" onclick="editAdmin(this)">Edit</button>
                    <button class="save" onclick="saveAdmin(this, ${a.admin_id})" hidden>Save</button>
                    <button class="cancel" onclick="cancelAdmin(this)" hidden>Cancel</button>
                    <button class="delete" onclick="deleteAdmin(${a.admin_id})">Delete</button>
                </td>
            </tr>`).join('');

        document.getElementById('statAdmins').innerText = data.length;
    });
}

function editAdmin(btn){
    const row = btn.closest('tr');
    const id = row.cells[0].innerText.trim();
    const username = row.cells[1].innerText.trim();
    const email = row.cells[2].innerText.trim();

    openGenericEditModal({
        entity: 'admin',
        id,
        title: 'Edit Admin',
        fields: [
            { name: 'username', label: 'Username', value: username },
            { name: 'email', label: 'Email', value: email }
        ],
        validate: vals => (!vals.username ? 'Username required' : null),
        saveUrl: '../api/admin.php?action=update',
        onSaved: () => loadAdmins()
    });
}

function cancelAdmin(btn){ loadAdmins(); }

function saveAdmin(btn, id){
    const row = btn.closest('tr');
    const username = row.cells[1].innerText.trim();
    const email = row.cells[2].innerText.trim();
    fetch(`http://localhost/mauheritage/api/admin.php?action=update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({admin_id: id, username, email})
    }).then(()=>loadAdmins());
}

function deleteAdmin(id){
    if(!confirm("Delete this admin?")) return;
    fetch(`http://localhost/mauheritage/api/admin.php?action=delete`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({admin_id:id})
    }).then(()=>loadAdmins());
}

function addAdmin(){
    const username = new_admin_username.value.trim();
    const email = new_admin_email.value.trim();
    const password = new_admin_password.value.trim();
    if(!username || !email || !password){ alert('Enter username, email, and password'); return; }

    fetch(`http://localhost/mauheritage/api/admin.php?action=add`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username,email,password})
    }).then(()=>{
        new_admin_username.value='';
        new_admin_email.value='';
        new_admin_password.value='';
        loadAdmins();
    });
}

// Load on page ready
loadAdmins();
