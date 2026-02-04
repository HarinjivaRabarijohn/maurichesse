const categoryTable = document.getElementById('categoryTable');
const new_category_name = document.getElementById('new_category_name');
const locationCategorySelect = document.getElementById('new_location_cat');

function loadCategories() {
    const base = (window.getApiBase ? window.getApiBase() : '../api');
    fetch(base + '/category.php?action=list')
    .then(r => r.json())
    .then(data => {
        categoryTable.querySelector('tbody').innerHTML = data.map(c => `
            <tr>
                <td>${c.category_id}</td>
                <td contenteditable="false">${c.category_name}</td>
                <td>
                    <button class="edit" onclick="editCategory(this)">Edit</button>
                    <button class="save" onclick="saveCategory(this, ${c.category_id})" hidden>Save</button>
                    <button class="cancel" onclick="cancelCategory(this)" hidden>Cancel</button>
                    <button class="delete" onclick="deleteCategory(${c.category_id})">Delete</button>
                </td>
            </tr>`).join('');

        loadCategoryDropdowns(data);
        document.getElementById('statCategories').innerText = data.length;
    });
}

function loadCategoryDropdowns(categories) {
    locationCategorySelect.innerHTML = `<option value="">--Select Category--</option>`;
    categories.forEach(c => {
        locationCategorySelect.innerHTML += `<option value="${c.category_id}">${c.category_name}</option>`;
    });
}

function editCategory(btn) {
    const row = btn.closest('tr');
    const id = row.cells[0].innerText.trim();
    const name = row.cells[1].innerText.trim();

    openGenericEditModal({
        entity: 'category',
        id,
        title: 'Edit Category',
        fields: [
            { name: 'category_id', label: 'ID', type: 'text', value: id, readonly: true },
            { name: 'category_name', label: 'Name', type: 'text', value: name }
        ],
        validate: v => (!v.category_name ? 'Name required' : null),
        saveUrl: '../api/category.php?action=update',
        onSaved: () => loadCategories()
    });
}

function cancelCategory(btn) { loadCategories(); }

function saveCategory(btn, id) {
    const name = btn.closest('tr').cells[1].innerText.trim();
    fetch('http://localhost/mauheritage/api/category.php?action=update',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({category_id: id, category_name: name})
    }).then(()=>loadCategories());
}

function deleteCategory(id){
    if(!confirm("Delete this category?")) return;
    fetch('http://localhost/mauheritage/api/category.php?action=delete',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({category_id:id})
    }).then(()=>loadCategories());
}

function addCategory(){
    const name = new_category_name.value.trim();
    if(!name){ alert('Enter category name'); return; }
    fetch('http://localhost/mauheritage/api/category.php?action=add',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({category_name:name})
    }).then(()=>{
        new_category_name.value='';
        loadCategories();
    });
}

// Load on page ready
loadCategories();
