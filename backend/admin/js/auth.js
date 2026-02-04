function showTab(tab){
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab).classList.add('active');

    // Clear errors
    document.querySelectorAll('.error').forEach(e => e.innerText = '');
}

/* ================= LOGIN ================= */
function login(){
    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;

    if(!identifier || !password){
        document.getElementById('loginError').innerText = "Please fill all fields";
        return;
    }

    fetch('../api/admin_login.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({identifier, password})
    })
    .then(res => res.json())
    .then(admin => {
        if(admin.success){
            window.location.href = 'dashboard.html';
        } else {
            fetch('../api/user_login.php', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({identifier, password})
            })
            .then(res => res.json())
            .then(user => {
                if(user.success){
                    window.location.href = '../client/home.html';
                } else {
                    document.getElementById('loginError').innerText = "Invalid username/email or password";
                }
            });
        }
    })
    .catch(() => {
        document.getElementById('loginError').innerText = "Server error";
    });
}

/* ================= REGISTER ================= */
function register(){
    const username = document.getElementById('regUsername').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    const errorBox = document.getElementById('registerError');

    // Validation
    if(!username || !email || !password){
        errorBox.innerText = "All fields are required";
        return;
    }

    if(!email.match(/^\S+@\S+\.\S+$/)){
        errorBox.innerText = "Invalid email format";
        return;
    }

    if(password.length < 6){
        errorBox.innerText = "Password must be at least 6 characters";
        return;
    }

    fetch('../api/user_register.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({username, email, password})
    })
    .then(res => res.json())
    .then(data => {
        if(data.success){
            alert("Registration successful. You can now login.");
            showTab('login');

            // Clear register form
            document.getElementById('regUsername').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
        } else {
            errorBox.innerText = data.error;
        }
    })
    .catch(() => {
        errorBox.innerText = "Server error";
    });
}
