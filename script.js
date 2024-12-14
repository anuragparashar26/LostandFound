const lostItems = [];
const foundItems = [];
let currentItemIndex = null;
let currentItemType = '';  // Track whether it's a lost or found item

// Open the popup modal
document.getElementById('addItemBtn').addEventListener('click', function() {
    document.getElementById('popupModal').style.display = 'block';
});

// Close the popup modal
function closePopup() {
    document.getElementById('popupModal').style.display = 'none';
}

// Add Lost Item
function addLostItem() {
    const title = document.getElementById('itemTitle').value;
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const imageInput = document.getElementById('image');
    const imageFile = imageInput.files[0];
    const verificationQuestion = document.getElementById('verificationQuestion').value;
    const verificationAnswer = document.getElementById('verificationAnswer').value;

    const reader = new FileReader();

    reader.onloadend = function() {
        const imageUrl = reader.result;

        const newItem = {
            title,
            category,
            location,
            date,
            description,
            imageUrl,
            claimed: false,
            question: verificationQuestion,
            answer: verificationAnswer
        };

        lostItems.push(newItem);
        renderItems(lostItems, 'lostCards');

        closePopup();
        clearForm();
    };

    if (imageFile) {
        reader.readAsDataURL(imageFile);
    } else {
        alert('Please upload an image.');
    }
}

// Add Found Item
function addFoundItem() {
    const title = document.getElementById('itemTitle').value;
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const imageInput = document.getElementById('image');
    const imageFile = imageInput.files[0];
    const verificationQuestion = document.getElementById('verificationQuestion').value;
    const verificationAnswer = document.getElementById('verificationAnswer').value;

    const reader = new FileReader();

    reader.onloadend = function() {
        const imageUrl = reader.result;

        const newItem = {
            title,
            category,
            location,
            date,
            description,
            imageUrl,
            claimed: false,
            question: verificationQuestion,
            answer: verificationAnswer
        };

        foundItems.push(newItem);
        renderItems(foundItems, 'foundCards');

        closePopup();
        clearForm();
    };

    if (imageFile) {
        reader.readAsDataURL(imageFile);
    } else {
        alert('Please upload an image.');
    }
}

// Render Lost Items in Cards
function renderItems(items, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.imageUrl}" alt="Item">
            <p><strong>${item.title}</strong></p>
            <p>Category: ${item.category}</p>
            <p>Location: ${item.location}</p>
            <p>Date: ${item.date}</p>
            <p>${item.description}</p>
        `;

        if (containerId === 'lostCards' && !item.claimed) {
            const claimBtn = document.createElement('button');
            claimBtn.className = 'claim-button';
            claimBtn.innerText = 'Claim';
            claimBtn.onclick = () => verifyClaimPopup(index, 'lost');
            card.appendChild(claimBtn);
        } else if (containerId === 'lostCards' && item.claimed) {
            const claimedLabel = document.createElement('p');
            claimedLabel.className = 'claimed';
            claimedLabel.innerText = 'Claimed';
            card.appendChild(claimedLabel);
        }

        if (containerId === 'foundCards' && !item.claimed) {
            const claimBtn = document.createElement('button');
            claimBtn.className = 'claim-button';
            claimBtn.innerText = 'Claim';
            claimBtn.onclick = () => verifyClaimPopup(index, 'found');
            card.appendChild(claimBtn);
        } else if (containerId === 'foundCards' && item.claimed) {
            const claimedLabel = document.createElement('p');
            claimedLabel.className = 'claimed';
            claimedLabel.innerText = 'Claimed';
            card.appendChild(claimedLabel);
        }

        container.appendChild(card);
    });
}

// Open Claim Verification Modal
function verifyClaimPopup(index, itemType) {
    currentItemIndex = index;
    currentItemType = itemType;
    document.getElementById('claimModal').style.display = 'block';
    const questionText = (itemType === 'lost') ? lostItems[index].question : foundItems[index].question;
    document.getElementById('claimQuestion').innerText = questionText;
}

// Verify Claim
function verifyClaim() {
    const answer = document.getElementById('claimAnswer').value;

    if (answer.trim() !== '') {
        const items = currentItemType === 'lost' ? lostItems : foundItems;

        if (answer === items[currentItemIndex].answer) {
            items[currentItemIndex].claimed = true;

            if (currentItemType === 'lost') {
                renderItems(lostItems, 'lostCards');
            } else {
                renderItems(foundItems, 'foundCards');
            }

            closeClaimPopup();
        } else {
            alert('Incorrect answer. Claim verification failed.');
        }
    } else {
        alert('Please provide an answer.');
    }
}

// Close the Claim Modal
function closeClaimPopup() {
    document.getElementById('claimModal').style.display = 'none';
}

// Clear input form
function clearForm() {
    document.getElementById('itemTitle').value = '';
    document.getElementById('category').value = '';
    document.getElementById('location').value = '';
    document.getElementById('date').value = '';
    document.getElementById('description').value = '';
    document.getElementById('image').value = '';
    document.getElementById('verificationQuestion').value = '';
    document.getElementById('verificationAnswer').value = '';
    document.getElementById('claimAnswer').value = '';
}
