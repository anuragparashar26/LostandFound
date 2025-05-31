let allItems = [];

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionName + '-section');
    targetSection.classList.add('active');

    document.querySelectorAll('.error-msg').forEach(error => {
        error.style.display = 'none';
    });

    if (sectionName === 'dashboard' && currentUser) {
        loadUserItems();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(tabName + '-tab').style.display = 'block';
}

function displayItems(items, containerId, showActions = false) {
    const container = document.getElementById(containerId);

    if (items.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px;">No items found.</div>';
        return;
    }

    
    if (containerId === 'user-items') {
        allItems = items; 
    }

    const itemsHTML = items.map((item, index) => {
        const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const actionsHTML = showActions ? `
            <div class="item-actions">
                <button onclick="editItem(${index})" class="btn-secondary">Edit</button>
                <button onclick="deleteItem('${item.id}')" class="btn-danger">Delete</button>
            </div>
        ` : '';

        return `
            <div class="item-card ${item.status}">
                <div class="item-header">
                    <div class="item-name">${item.item_name}</div>
                    <div class="item-status status-${item.status}">
                        <i class="${item.status === 'found' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}"></i>
                        ${item.status}
                    </div>
                </div>
                <div class="item-description">${item.description}</div>
                <div class="item-meta">
                    ${!showActions ? `<strong>Posted by:</strong> ${item.user_name || 'Anonymous'}<br>` : ''}
                    <strong>Date:</strong> ${formattedDate}<br>
                    <strong>Location:</strong> ${item.location || 'Not specified'}<br>
                    <strong>Contact:</strong> ${item.contact_info}
                </div>
                ${actionsHTML}
            </div>
        `;
    }).join('');

    container.innerHTML = `<div class="items-grid">${itemsHTML}</div>`;
}

async function loadAllItems(attempt = 1, maxAttempts = 3) {
    const loadingContainer = document.getElementById('all-items');
    if (!loadingContainer) return;

    try {
        loadingContainer.innerHTML = '<div class="loading">Loading items...</div>';

    
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out')), 10000); 
        });

        const fetchPromise = supabaseClient
            .from('items')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: items, error: itemsError } = await Promise.race([fetchPromise, timeoutPromise]);

        if (itemsError) throw itemsError;
        if (!items || items.length === 0) {
            loadingContainer.innerHTML = '<div class="no-items">No items found</div>';
            return;
        }

        const userIds = [...new Set(items.map(item => item.user_id))];
        const { data: profiles, error: profilesError } = await supabaseClient
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
        }

        const profileMap = profiles?.reduce((acc, profile) => {
            acc[profile.user_id] = profile.full_name || 'Anonymous';
            return acc;
        }, {}) || {};

        const transformedItems = items.map(item => ({
            ...item,
            user_name: profileMap[item.user_id] || 'Anonymous',
            date: item.created_at || item.date
        }));

        displayItems(transformedItems, 'all-items');
    } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt < maxAttempts) {
            setTimeout(() => loadAllItems(attempt + 1, maxAttempts), 1000); 
            return;
        }
        loadingContainer.innerHTML = `
            <div class="error-msg">
                <i class="fas fa-exclamation-circle"></i>
                Error loading items: ${error.message}
                <button onclick="loadAllItems()" class="btn-retry">Retry</button>
            </div>`;
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const messageSpan = errorElement.querySelector('span');
    messageSpan.textContent = message;
    errorElement.style.display = 'flex';
}

function showMessage(elementId, message) {
    const messageElement = document.getElementById(elementId);
    const messageSpan = messageElement.querySelector('span');
    messageSpan.textContent = message;
    messageElement.style.display = 'flex';
}

function showWelcomeMessage(message) {
    const welcomeElement = document.getElementById('welcome-message');
    const messageSpan = welcomeElement.querySelector('span');
    messageSpan.textContent = message;
    welcomeElement.style.display = 'flex';
    setTimeout(() => {
        welcomeElement.style.display = 'none';
    }, 4000);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            currentUser = user;
            await updateAuthUI();
            if (document.getElementById('user-items')) {
                await loadUserItems();
            }
        }

        if (window.location.pathname === '/' || 
            window.location.pathname.includes('index.html')) {
            await loadAllItems();
        }

        if (document.getElementById('item-date')) {
            document.getElementById('item-date').valueAsDate = new Date();
        }

        setupAuthListeners();
        
        if (window.location.pathname.includes('dashboard.html')) {
            setupDashboardListeners();
        }
    } catch (error) {
        console.error('Initialization error:', error);
        if (window.location.pathname === '/' || 
            window.location.pathname.includes('index.html')) {
            await loadAllItems();
        }
    }
});