// script.js
function toggleMode() {
  document.body.classList.toggle('light-mode');
}

// Navigation Logic
document.addEventListener("DOMContentLoaded", function () {
  const navButtons = document.querySelectorAll(".nav-button");

  navButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const pageName = button.querySelector("span").textContent.trim().toLowerCase().replace(/\s+/g, "-");
      window.location.href = `${pageName}.html`;
    });
  });

  // Tab Logic
  const tabs = document.querySelectorAll(".tab");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs and panes
      tabs.forEach((t) => t.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));

      // Add active class to the clicked tab and corresponding pane
      tab.classList.add("active");
      tabPanes[index].classList.add("active");
    });
  });

  // Edit Button Logic
  const editButton = document.querySelector(".edit-button");
  if (editButton) {
    editButton.addEventListener("click", function () {
      alert("Edit functionality will be added here.");
    });
  }
});

// FILES JS ------------------------------------------------//

// Drag and Drop Functionality
const dragDropArea = document.getElementById("dragDropArea");
const fileList = document.getElementById("fileList");
const fab = document.getElementById("fab");

if (dragDropArea && fileList && fab) {
  // Prevent default drag behaviors
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dragDropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false); // Prevent default behavior globally
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Highlight drop area when dragging over
  ["dragenter", "dragover"].forEach((eventName) => {
    dragDropArea.addEventListener(eventName, () => dragDropArea.classList.add("dragover"), false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dragDropArea.addEventListener(eventName, () => dragDropArea.classList.remove("dragover"), false);
  });

  // Handle dropped files
  dragDropArea.addEventListener("drop", handleDrop, false);

  function handleDrop(e) {
    const files = e.dataTransfer.files;
    handleFiles(files);
  }

  // Handle file selection via FAB
  fab.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.click();
    fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
  });

  // Process and display files
  function handleFiles(files) {
    for (const file of files) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";

        const fileIcon = document.createElement("img");
        fileIcon.src = "assets/file-icon.png"; // Placeholder file icon
        fileItem.appendChild(fileIcon);

        const fileName = document.createElement("p");
        fileName.textContent = file.name;
        fileItem.appendChild(fileName);

        fileList.appendChild(fileItem);
      };
    }
  }
}

// FILES END -----------------------//

// CUSTOM BRANDING JS --------------------------------------//

// Custom Branding Functionality
const logoUpload = document.getElementById("logoUpload");
const logoPreview = document.getElementById("logoPreview");
const colorPicker = document.getElementById("colorPicker");
const customDomain = document.getElementById("customDomain");
const saveDomain = document.getElementById("saveDomain");

// Handle Logo Upload
if (logoUpload && logoPreview) {
  logoUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        logoPreview.innerHTML = `<img src="${reader.result}" alt="Logo">`;
        // Save logo to localStorage (or send to server)
        localStorage.setItem("brandLogo", reader.result);
      };
    }
  });
}

// Handle Color Picker
if (colorPicker) {
  colorPicker.addEventListener("change", (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty("--primary-color", color);
    // Save color to localStorage (or send to server)
    localStorage.setItem("brandColor", color);
  });
}

// Handle Custom Domain
if (saveDomain && customDomain) {
  saveDomain.addEventListener("click", () => {
    const domain = customDomain.value.trim();
    if (domain) {
      // Save domain to localStorage (or send to server)
      localStorage.setItem("customDomain", domain);
      alert("Custom domain saved!");
    } else {
      alert("Please enter a valid domain.");
    }
  });
}

// Load saved branding settings on page load
window.addEventListener("load", () => {
  const savedLogo = localStorage.getItem("brandLogo");
  const savedColor = localStorage.getItem("brandColor");
  const savedDomain = localStorage.getItem("customDomain");

  if (savedLogo && logoPreview) {
    logoPreview.innerHTML = `<img src="${savedLogo}" alt="Logo">`;
  }
  if (savedColor && colorPicker) {
    document.documentElement.style.setProperty("--primary-color", savedColor);
    colorPicker.value = savedColor;
  }
  if (savedDomain && customDomain) {
    customDomain.value = savedDomain;
  }
});

// CUSTOM BRANDING END ------------------------------------//

// ACTIVE PAGE //

// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Load the header
  fetch("./header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header").innerHTML = data;

      // Set the active class on the current page's navigation link
      let currentPage = window.location.pathname.split('/').pop() || 'index.html';
      
      // Remove query parameters and trailing slashes
      currentPage = currentPage.split('?')[0]; // Remove query parameters
      currentPage = currentPage.split('#')[0]; // Remove hash fragments
      currentPage = currentPage.replace(/\/$/, ''); // Remove trailing slashes

      const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

      console.log("Current Page:", currentPage); // Debugging

      navLinks.forEach(link => {
        let linkHref = link.getAttribute('href');
        let linkPage = linkHref.split('/').pop(); // Extract the page name from the href

        // Remove query parameters and trailing slashes from linkPage
        linkPage = linkPage.split('?')[0]; // Remove query parameters
        linkPage = linkPage.split('#')[0]; // Remove hash fragments
        linkPage = linkPage.replace(/\/$/, ''); // Remove trailing slashes

        console.log("Link Page:", linkPage); // Debugging

        // Check if the link's page matches the current page
        if (linkPage === currentPage) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    });
});

// END ACTIVE PAGE ------------------------------------------------- //