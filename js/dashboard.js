import { firebaseConfig } from "../firebase/firebase-config.js";
const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const signoutBtn = document.querySelector('#signoutbtn');
signoutBtn.addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      console.log('User signed out successfully');
      location.href = "../public/index.html";
    })
    .catch((error) => {
      alert('Error signing out: ', error);
    });
});

auth.onAuthStateChanged((user) => {
    if (user) {
      document.getElementById("user-email").innerText = user.email;
    } else {
      window.location.href = "../public/signin.html";
    }
  });

  
const lostItems = [];
const foundItems = [];
let currentItemIndex = null;
let currentItemType = '';


document.getElementById('addItemBtn').addEventListener('click', function() {
    document.getElementById('popupModal').style.display = 'block';
});

function closePopup() {
    const modal = document.getElementById('popupModal');
    if (modal) {
        modal.style.display = 'none';
    } else {
        console.error("Modal not found!");
    }
}

document.querySelector('.close').addEventListener('click', closePopup);

window.onclick = function(event) {
    const modal = document.getElementById('popupModal');
    if (event.target === modal) {
        closePopup();
    }
};



function addLostItem() {
    const title = document.getElementById('itemTitle').value;
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const contactInfo = document.getElementById('contactInfo').value;
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
            contact: contactInfo,
            claimed: false,
            question: verificationQuestion,
            answer: verificationAnswer,
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

function addFoundItem() {
    const title = document.getElementById('itemTitle').value;
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const contactInfo = document.getElementById('contactInfo').value; 
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
            contact: contactInfo,
            claimed: false,
            question: verificationQuestion,
            answer: verificationAnswer,
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

function verifyClaimPopup(index, itemType) {
    currentItemIndex = index;
    currentItemType = itemType;
    document.getElementById('claimModal').style.display = 'block';
    const questionText = (itemType === 'lost') ? lostItems[index].question : foundItems[index].question;
    document.getElementById('claimQuestion').innerText = questionText;
}

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

            alert(`Claim verified successfully! Contact Person: ${items[currentItemIndex].contact}`);
            closeClaimPopup();
        } else {
            alert('Incorrect answer. Claim verification failed.');
        }
    } else {
        alert('Please provide an answer.');
    }
}

function closeClaimPopup() {
    document.getElementById('claimModal').style.display = 'none';
}


function clearForm() {
    document.getElementById('itemTitle').value = '';
    document.getElementById('category').value = '';
    document.getElementById('location').value = '';
    document.getElementById('date').value = '';
    document.getElementById('description').value = '';
    document.getElementById('image').value = '';
    document.getElementById('verificationQuestion').value = '';
    document.getElementById('verificationAnswer').value = '';
    document.getElementById('contactInfo').value = '';
    document.getElementById('claimAnswer').value = '';
}


