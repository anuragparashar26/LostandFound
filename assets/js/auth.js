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
    const name = document.getElementById('signup-name').value;

    if (!name) {
        showError('signup-error', 'Please enter your name');
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.signUp({ 
            email, 
            password,
            options: {
                data: { 
                    name: name,
                    full_name: name 
                },
                emailRedirectTo: 'https://anuragparashar26.github.io/LostandFound/login.html'
            }
        });
        if (error) throw error;

        if (data?.user?.id && !data?.user?.identities?.length) {
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .insert([
                    { 
                        user_id: data.user.id,
                        full_name: name,
                        display_name: name
                    }
                ]);
            if (profileError) throw profileError;
        }

        showMessage('signup-success', 'Check your email for verification link!');
        document.getElementById('signup-form').reset();
    } catch (error) {
        if (error.message.includes('User already registered')) {
            showError('signup-error', 'An account with this email already exists. Please login instead.');
        } else {
            showError('signup-error', error.message);
        }
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-password-email').value;
    
    if (!email) {
        showError('forgot-password-error', 'Please enter your email');
        return;
    }

    try {
        const isGitHubPages = window.location.hostname.includes('github.io');
        const basePath = isGitHubPages ? '/LostandFound' : '';
        
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}${basePath}/reset-password.html`
        });
        
        if (error) throw error;
        
        showMessage('forgot-password-success', 'Password reset email sent! Check your inbox.');
        document.getElementById('forgot-password-form').reset();
        
        setTimeout(() => {
            showSection('login');
        }, 2000);
    } catch (error) {
        showError('forgot-password-error', error.message);
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
    document.getElementById('forgot-password-form')?.addEventListener('submit', handleForgotPassword);
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            currentUser = session?.user || null;
            updateAuthUI();

            const isGitHubPages = window.location.hostname.includes('github.io');
            const basePath = isGitHubPages ? '/LostandFound' : '';
            if (window.location.hash.includes('access_token')) {
                window.location.href = `${basePath}/dashboard.html`;
                return;
            }
            const isResetPasswordPage = window.location.pathname.includes('reset-password.html');
            if (isResetPasswordPage) {
                return;
            }

            if (window.location.pathname.includes('login.html')) {
                window.location.href = `${basePath}/dashboard.html`;
            }
            if (currentUser && !isResetPasswordPage && document.getElementById('welcome-message')) {
                showWelcomeMessage(`Welcome back, ${currentUser.user_metadata.name || currentUser.email}!`);
            }
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            updateAuthUI();
            const isGitHubPages = window.location.hostname.includes('github.io');
            const basePath = isGitHubPages ? '/LostandFound' : '';
            window.location.href = `${basePath}/index.html`;
        }
    });
}

async function updateAuthUI() {
    const guestButtons = document.getElementById('guest-buttons');
    const userButtons = document.getElementById('user-buttons');
    const userEmail = document.getElementById('user-email');

    if (currentUser) {
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('full_name')
            .eq('user_id', currentUser.id)
            .single();

        const displayName = profile?.full_name || 'User';

        guestButtons.style.display = 'none';
        userButtons.style.display = 'flex';
        if (userEmail) {
            userEmail.innerHTML = `<i class="fas fa-user"></i> ${displayName}`;
        }
    } else {
        guestButtons.style.display = 'flex';
        userButtons.style.display = 'none';
        if (userEmail) {
            userEmail.textContent = '';
        }
    }
}