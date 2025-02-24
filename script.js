// script.js

// Navigation Logic
document.addEventListener("DOMContentLoaded", function () {
    const navButtons = document.querySelectorAll("nav button");
  
    navButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const pageName = button.textContent.toLowerCase().replace(" ", "-");
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