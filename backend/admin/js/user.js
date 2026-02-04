const userTable = document.getElementById('userTable');

function loadUsers() {
    fetch('../api/user.php?action=list')
    .then(r => r.json())
    .then(data => {
        userTable.querySelector('tbody').innerHTML = data.map(u => `
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
            </tr>`).join('');

        document.getElementById('statUsers').innerText = data.length;
    });
}

function editUser(id){
    // reuse modal from dashboard
    const row = Array.from(document.querySelectorAll('#userTable tbody tr')).find(r => r.cells[0].innerText.trim() === String(id));
    if(row){
        const item = { user_id: row.cells[0].innerText.trim(), username: row.cells[1].innerText.trim(), email: row.cells[2].innerText.trim(), created_at: row.cells[4].innerText.trim() };
        openGenericEditModal({ entity: 'user', id: item.user_id, title: 'Edit user', fields: [ { name: 'user_id', label: 'ID', type: 'text', value: item.user_id, readonly: true }, { name: 'username', label: 'Username', type: 'text', value: item.username }, { name: 'email', label: 'Email', type: 'text', value: item.email }, { name: 'password', label: 'Password (leave blank to keep)', type: 'text', value: '' }, { name: 'created_at', label: 'Created at', type: 'text', value: item.created_at, readonly: true } ], validate: v => (!v.username || !v.email) ? 'Username and email required' : null, saveUrl: '../api/user.php?action=update', onSaved: () => loadUsers() });
    } else {
        alert('User row not found');
    }
}

function addUser(){
    const username = document.getElementById('new_user_username') ? document.getElementById('new_user_username').value.trim() : '';
    const email = document.getElementById('new_user_email') ? document.getElementById('new_user_email').value.trim() : '';
    const password = document.getElementById('new_user_password') ? document.getElementById('new_user_password').value : '';
    if(!username || !email || !password){ alert('Username, email and password are required'); return; }
    fetch('../api/user.php?action=add',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username, email, password}) }).then(r=>r.json()).then(d=>{ alert(d.message); if(d.success){ const u = document.getElementById('new_user_username'); if(u) u.value=''; const e = document.getElementById('new_user_email'); if(e) e.value=''; const p = document.getElementById('new_user_password'); if(p) p.value=''; loadUsers(); } }).catch(()=>alert('Failed to add user'));
}

function deleteUser(id){ if(!confirm('Delete this user?')) return; fetch('../api/user.php?action=delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:id})}).then(()=>loadUsers()); }

// Load on page ready
loadUsers();
