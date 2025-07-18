let allItems = [];
let originalItems = [];

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
    if (!loadingContainer) {
        console.error('Error: all-items container not found');
        return;
    }

    try {
        console.log(`Attempt ${attempt}: Starting loadAllItems`);
        loadingContainer.innerHTML = '<div class="loading">Loading items...</div>';

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out')), 10000);
        });

        console.log('Fetching items...');
        const fetchPromise = supabaseClient
            .from('items')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: items, error: itemsError } = await Promise.race([fetchPromise, timeoutPromise]);
        console.log('Items fetch result:', { items, itemsError });

        if (itemsError) throw itemsError;
        if (!items || items.length === 0) {
            console.log('No items found');
            loadingContainer.innerHTML = '<div class="no-items">No items found</div>';
            return;
        }

        const userIds = [...new Set(items.map(item => item.user_id))];
        console.log('Fetching profiles for user IDs:', userIds);
        const { data: profiles, error: profilesError } = await supabaseClient
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', userIds);
        console.log('Profiles fetch result:', { profiles, profilesError });

        if (profilesError) {
            console.warn('Profiles fetch failed, using fallback:', profilesError);
        }

        const profileMap = profiles?.reduce((acc, profile) => {
            acc[profile.user_id] = profile.full_name || 'Anonymous';
            return acc;
        }, {}) || {};

        console.log('Profile map:', profileMap);
        const transformedItems = items.map(item => ({
            ...item,
            user_name: profileMap[item.user_id] || 'Anonymous',
            date: item.created_at || item.date
        }));

        console.log('Transformed items:', transformedItems);
        originalItems = transformedItems; 
        displayItems(transformedItems, 'all-items');
        setupSearchFunctionality(); 
        console.log('Items displayed');
    } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt < maxAttempts) {
            console.log(`Retrying... Attempt ${attempt + 1}`);
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

function setupSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const sortBy = document.getElementById('sort-by');
    const searchBtn = document.getElementById('search-btn');
    const clearSearch = document.getElementById('clear-search');
    const resetSearch = document.getElementById('reset-search');
    const searchInfo = document.getElementById('search-info');

    if (!searchInput) return; 

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            clearSearch.style.display = 'block';
        } else {
            clearSearch.style.display = 'none';
        }
        
        clearTimeout(searchInput.debounceTimer);
        searchInput.debounceTimer = setTimeout(() => {
            performSearch();
        }, 300);
    });

    statusFilter?.addEventListener('change', performSearch);
    sortBy?.addEventListener('change', performSearch);
    searchBtn?.addEventListener('click', performSearch);

    clearSearch?.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        performSearch();
    });

    resetSearch?.addEventListener('click', () => {
        searchInput.value = '';
        statusFilter.value = '';
        sortBy.value = 'newest';
        clearSearch.style.display = 'none';
        searchInfo.style.display = 'none';
        displayItems(originalItems, 'all-items');
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const sortBy = document.getElementById('sort-by');
    const searchInfo = document.getElementById('search-info');
    const resultsCount = document.getElementById('results-count');

    if (!searchInput || !originalItems.length) return;

    const query = searchInput.value.trim().toLowerCase();
    const statusValue = statusFilter?.value || '';
    const sortValue = sortBy?.value || 'newest';

    let filteredItems = [...originalItems];

    if (query) {
        filteredItems = filteredItems.filter(item => 
            item.item_name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.location && item.location.toLowerCase().includes(query)) ||
            (item.user_name && item.user_name.toLowerCase().includes(query))
        );
    }

    if (statusValue) {
        filteredItems = filteredItems.filter(item => item.status === statusValue);
    }

    filteredItems.sort((a, b) => {
        switch (sortValue) {
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'name':
                return a.item_name.localeCompare(b.item_name);
            case 'newest':
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });

    const isFiltering = query || statusValue || sortValue !== 'newest';
    if (isFiltering && searchInfo && resultsCount) {
        searchInfo.style.display = 'flex';
        const totalItems = originalItems.length;
        const foundItems = filteredItems.length;
        resultsCount.textContent = `Showing ${foundItems} of ${totalItems} items`;
    } else if (searchInfo) {
        searchInfo.style.display = 'none';
    }

    if (filteredItems.length === 0 && isFiltering) {
        document.getElementById('all-items').innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No items found</h3>
                <p>Try adjusting your search terms or filters to find what you're looking for.</p>
            </div>
        `;
    } else {
        displayItems(filteredItems, 'all-items');
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