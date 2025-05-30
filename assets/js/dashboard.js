async function handleAddItem(e) {
    e.preventDefault();

    if (!currentUser) {
        showError('add-item-error', 'You must be logged in to post items');
        window.location.href = 'login.html';
        return;
    }

    const itemData = {
        user_id: currentUser.id,
        item_name: document.getElementById('item-name').value,
        description: document.getElementById('item-description').value,
        date: document.getElementById('item-date').value,
        location: document.getElementById('item-location').value,
        status: document.getElementById('item-status').value,
        contact_info: document.getElementById('contact-info').value
    };

    try {
        const { error } = await supabaseClient
            .from('items')
            .insert([itemData]);

        if (error) throw error;

        document.getElementById('add-item-form').reset();
        document.getElementById('item-date').valueAsDate = new Date();
        switchTab('my-items');
        loadUserItems();
        showWelcomeMessage('Item posted successfully!');
    } catch (error) {
        showError('add-item-error', error.message);
    }
}

async function handleEditItem(e) {
    e.preventDefault();

    if (!currentUser) {
        showError('edit-error', 'You must be logged in to edit items');
        window.location.href = 'login.html';
        return;
    }

    const itemId = document.getElementById('edit-item-id').value;
    const itemData = {
        item_name: document.getElementById('edit-item-name').value,
        description: document.getElementById('edit-item-description').value,
        date: document.getElementById('edit-item-date').value,
        location: document.getElementById('edit-item-location').value,
        status: document.getElementById('edit-item-status').value,
        contact_info: document.getElementById('edit-contact-info').value
    };

    try {
        const { error } = await supabaseClient
            .from('items')
            .update(itemData)
            .eq('id', itemId)
            .eq('user_id', currentUser.id);

        if (error) throw error;

        showSection('dashboard');
        loadUserItems();
        showWelcomeMessage('Item updated successfully!');
    } catch (error) {
        showError('edit-error', error.message);
    }
}

async function deleteItem(itemId) {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const { error } = await supabaseClient
            .from('items')
            .delete()
            .eq('id', itemId)
            .eq('user_id', currentUser.id);

        if (error) throw error;

        loadUserItems();
        showWelcomeMessage('Item deleted successfully!');
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

function editItem(item) {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('edit-item-name').value = item.item_name;
    document.getElementById('edit-item-description').value = item.description;
    document.getElementById('edit-item-date').value = item.date;
    document.getElementById('edit-item-location').value = item.location || '';
    document.getElementById('edit-item-status').value = item.status;
    document.getElementById('edit-contact-info').value = item.contact_info;
    showSection('edit');
}

async function loadUserItems() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('items')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: false });

        if (error) throw error;

        displayItems(data, 'user-items', true);
    } catch (error) {
        document.getElementById('user-items').innerHTML = `<div class="error-msg">Error loading your items: ${error.message}</div>`;
    }
}

function setupDashboardListeners() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });

    document.getElementById('add-item-form')?.addEventListener('submit', handleAddItem);
    document.getElementById('edit-item-form')?.addEventListener('submit', handleEditItem);
}