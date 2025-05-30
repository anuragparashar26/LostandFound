let currentUser = null;

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        document.getElementById('login-form').reset();
    } catch (error) {
        showError('login-error', error.message);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;
        showMessage('signup-success', 'Check your email for verification link!');
        document.getElementById('signup-form').reset();
    } catch (error) {
        showError('signup-error', error.message);
    }
}

async function signOut() {
    try {
        await supabaseClient.auth.signOut();
        currentUser = null;
        updateAuthUI();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

function setupAuthListeners() {
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('signup-form')?.addEventListener('submit', handleSignup);

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            updateAuthUI();
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'dashboard.html';
            }
            showWelcomeMessage(`Welcome back, ${session.user.email}!`);
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            updateAuthUI();
            window.location.href = 'index.html';
        }
    });
}

function updateAuthUI() {
    const guestButtons = document.getElementById('guest-buttons');
    const userButtons = document.getElementById('user-buttons');
    const userEmail = document.getElementById('user-email');

    if (currentUser) {
        guestButtons.style.display = 'none';
        userButtons.style.display = 'flex';
        userEmail.textContent = currentUser.email;
    } else {
        guestButtons.style.display = 'flex';
        userButtons.style.display = 'none';
    }
}