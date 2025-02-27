// account.js - Handles user account functionality
document.addEventListener('firebase-ready', initAccountPage);

// State
let currentUser = null;
let userProfile = null;

// Initialize the account page
function initAccountPage() {
  // Check if user is logged in
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      currentUser = user;
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('profile-container').style.display = 'block';

      // Load user profile data
      loadUserProfile();

      // Update profile picture in navigation
      updateNavProfilePicture();
    } else {
      // No user is signed in
      document.getElementById('auth-container').style.display = 'flex';
      document.getElementById('profile-container').style.display = 'none';
    }
  });

  // Set up event listeners
  setupEventListeners();
  setupTabs();
}

// Load user profile data from Firestore
function loadUserProfile() {
  const userId = currentUser.uid;

  db.collection('users').doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        userProfile = doc.data();
        updateProfileUI(userProfile);
      } else {
        // Create a new profile if it doesn't exist
        userProfile = {
          displayName: currentUser.displayName || 'New User',
          email: currentUser.email,
          bio: '',
          profileImageURL: currentUser.photoURL || '/images/WHITELOGOTEST2025.png',
          bannerImageURL: '/images/YTBANNEER-min.jpg',
          portfolioItems: [],
          services: [],
          faqs: [],
          contactInfo: {
            email: currentUser.email,
            phone: '',
            social: ''
          }
        };

        // Save the new profile to Firestore
        db.collection('users').doc(userId).set(userProfile)
          .then(() => {
            console.log("New profile created");
            updateProfileUI(userProfile);
          })
          .catch((error) => {
            console.error("Error creating new profile: ", error);
          });
      }
    })
    .catch((error) => {
      console.error("Error getting user profile: ", error);
    });

  // Load portfolio items
  loadPortfolioItems();

  // Load services
  loadServices();

  // Load FAQs
  loadFAQs();

  // Load contact info
  loadContactInfo();

  // Load clients
  loadClients();
}

// Update UI with profile data
function updateProfileUI(profile) {
  // Update username display
  document.getElementById('username-display').textContent = profile.displayName;

  // Update profile image if available
  if (profile.profileImageURL) {
    document.getElementById('profile-image').src = profile.profileImageURL;
  }

  // Update banner image if available
  if (profile.bannerImageURL) {
    document.getElementById('banner-image').src = profile.bannerImageURL;
  }

  // Update form fields for the edit profile modal
  document.getElementById('display-name').value = profile.displayName;
  document.getElementById('bio').value = profile.bio || '';
  document.getElementById('email').value = profile.email;
}

// Load portfolio items from Firestore
function loadPortfolioItems() {
  const userId = currentUser.uid;

  db.collection('users').doc(userId).collection('portfolioItems').get()
    .then((querySnapshot) => {
      const portfolioContainer = document.getElementById('portfolio-images');
      // Clear existing items except the add button
      const addButton = portfolioContainer.querySelector('.portfolio-add');
      portfolioContainer.innerHTML = '';
      portfolioContainer.appendChild(addButton);

      querySnapshot.forEach((doc) => {
        const item = doc.data();
        const itemId = doc.id;

        // Create portfolio item element
        const itemElement = createPortfolioItem(item, itemId);

        // Insert before the add button
        portfolioContainer.insertBefore(itemElement, addButton);
      });
    })
    .catch((error) => {
      console.error("Error loading portfolio items: ", error);
    });
}

// Create a portfolio item element
function createPortfolioItem(item, itemId) {
  const itemElement = document.createElement('div');
  itemElement.className = 'portfolio-item';
  itemElement.dataset.id = itemId;

  const image = document.createElement('img');
  image.src = item.imageURL;
  image.alt = item.title || 'Portfolio Item';

  const overlay = document.createElement('div');
  overlay.className = 'portfolio-overlay';

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', (e) => {
    e.stopPropagation();
    deletePortfolioItem(itemId);
  });

  overlay.appendChild(deleteButton);
  itemElement.appendChild(image);
  itemElement.appendChild(overlay);

  return itemElement;
}

// Delete a portfolio item
function deletePortfolioItem(itemId) {
  if (confirm('Are you sure you want to delete this portfolio item?')) {
    const userId = currentUser.uid;

    db.collection('users').doc(userId).collection('portfolioItems').doc(itemId).delete()
      .then(() => {
        console.log("Portfolio item deleted");
        // Remove from UI
        const itemElement = document.querySelector(`.portfolio-item[data-id="${itemId}"]`);
        if (itemElement) {
          itemElement.remove();
        }
      })
      .catch((error) => {
        console.error("Error deleting portfolio item: ", error);
      });
  }
}

// Load services from Firestore
function loadServices() {
  const userId = currentUser.uid;

  db.collection('users').doc(userId).collection('services').get()
    .then((querySnapshot) => {
      const servicesContainer = document.getElementById('services-grid');
      // Clear existing services except the add button
      const addButton = servicesContainer.querySelector('.service-add');
      servicesContainer.innerHTML = '';
      servicesContainer.appendChild(addButton);

      querySnapshot.forEach((doc) => {
        const service = doc.data();
        const serviceId = doc.id;

        // Create service element
        const serviceElement = createServiceItem(service, serviceId);

        // Insert before the add button
        servicesContainer.insertBefore(serviceElement, addButton);
      });

      // Update stats
      updateServiceStats();
    })
    .catch((error) => {
      console.error("Error loading services: ", error);
    });
}

// Create a service item element
function createServiceItem(service, serviceId) {
  const serviceElement = document.createElement('div');
  serviceElement.className = 'service-item';
  serviceElement.dataset.id = serviceId;

  const image = document.createElement('img');
  image.src = service.imageURL;
  image.alt = service.title || 'Service';

  const overlay = document.createElement('div');
  overlay.className = 'service-overlay';

  const title = document.createElement('h3');
  title.textContent = service.title;

  const price = document.createElement('p');
  price.className = 'service-price';
  price.textContent = `$${service.price.toFixed(2)}`;

  const button = document.createElement('button');
  button.className = 'service-button';
  button.textContent = 'View Details';
  button.addEventListener('click', () => {
    console.log(`Viewing details for service: ${service.title}`);
  });

  overlay.appendChild(title);
  overlay.appendChild(price);
  overlay.appendChild(button);
  serviceElement.appendChild(image);
  serviceElement.appendChild(overlay);

  return serviceElement;
}

// Update service stats
function updateServiceStats() {
  const userId = currentUser.uid;

  db.collection('users').doc(userId).collection('services').get()
    .then((querySnapshot) => {
      const ordersStat = document.getElementById('orders-stat');
      ordersStat.textContent = querySnapshot.size;
    })
    .catch((error) => {
      console.error("Error updating service stats: ", error);
    });
}

// Set up event listeners
function setupEventListeners() {
  // Add event listeners for buttons, modals, etc.
  document.getElementById('edit-profile-btn').addEventListener('click', () => {
    document.getElementById('edit-profile-modal').style.display = 'block';
  });

  document.getElementById('add-service-btn').addEventListener('click', () => {
    document.getElementById('add-service-modal').style.display = 'block';
  });

  document.getElementById('add-faq-btn').addEventListener('click', () => {
    document.getElementById('add-faq-modal').style.display = 'block';
  });

  // Close modals when clicking the close button
  document.querySelectorAll('.close-modal').forEach((button) => {
    button.addEventListener('click', () => {
      button.closest('.modal').style.display = 'none';
    });
  });
}

// Set up tabs
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Remove active class from all tabs and panes
      tabs.forEach((t) => t.classList.remove('active'));
      tabPanes.forEach((pane) => pane.classList.remove('active'));

      // Add active class to the selected tab and pane
      tab.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
}