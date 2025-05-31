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

async function loadAllItems() {
    try {
       
        const { data: items, error: itemsError } = await supabaseClient
            .from('items')
            .select('*')
            .order('created_at', { ascending: false });

        if (itemsError) throw itemsError;

        
        const userIds = [...new Set(items.map(item => item.user_id))];
        const { data: profiles, error: profilesError } = await supabaseClient
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);

        if (profilesError) throw profilesError;

        
        const profileMap = profiles.reduce((acc, profile) => {
            acc[profile.user_id] = profile.full_name;
            return acc;
        }, {});

        
        const transformedItems = items.map(item => ({
            ...item,
            user_name: profileMap[item.user_id] || 'Anonymous'
        }));

        displayItems(transformedItems, 'all-items');
    } catch (error) {
        console.error('Error loading items:', error);
        document.getElementById('all-items').innerHTML = 
            `<div class="error-msg">Error loading items: ${error.message}</div>`;
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
            updateAuthUI();
        }

        if (document.getElementById('all-items')) {
            loadAllItems();
        }
        if (document.getElementById('user-items')) {
            loadUserItems();
        }
        if (document.getElementById('item-date')) {
            document.getElementById('item-date').valueAsDate = new Date();
        }

        setupAuthListeners();
        setupDashboardListeners();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});