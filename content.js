console.log("Content script running on BookMyShow");

// Max retries before refreshing the page
const MAX_RETRIES = 30;  
let retries = 0;
let buttonClicked = false;  
let previousUrl = window.location.href;  
let intervalId = null;  

// Function to start monitoring
function startMonitoring() {
    if (buttonClicked) return;  // Prevent starting if button has already been clicked

    console.log("Monitoring started.");

    // Clear any existing interval
    if (intervalId) {
        clearInterval(intervalId);
    }

    retries = 0;  // Reset retries for a new monitoring session
    previousUrl = window.location.href;  // Set the previous URL to current

    intervalId = setInterval(() => {
        // Check for URL change
        if (window.location.href !== previousUrl) {
            console.log("URL changed. Updating previous URL.");
            previousUrl = window.location.href;  // Update previous URL
            retries = 0;  // Reset retries on URL change
        }

        // If already on the booking page, stop the script
        if (window.location.href.includes('/venue/')) {
            console.log("Already on the booking page. Stopping script.");
            clearInterval(intervalId);
            return;
        }

        // Select the Book button by ID
        let bookButton = document.getElementById('synopsis-book-button');

        // Only proceed if the button hasn't been clicked yet
        if (bookButton && !buttonClicked) {
            console.log("Book button detected. Attempting to click...");
            bookButton.click();  // Automatically click the 'Book' button
            buttonClicked = true;  // Set the flag to prevent further clicks
            console.log("Book button clicked. Stopping script.");
            clearInterval(intervalId);  // Stop checking after clicking the button
            return;  // Ensure no further code execution in this iteration
        } 

        // If the button was not found
        if (!buttonClicked) {
            console.log(`Book button not found yet. Retrying... (${retries + 1})`);
            retries++;

            // Refresh the page if the button isn't found after MAX_RETRIES
            if (retries >= MAX_RETRIES) {
                console.log("Max retries reached. Refreshing the page...");
                window.location.reload();  // Refresh the page
            }
        }
    }, 1000);  // Check every 1 second
}

// Function to resume monitoring if the script is reloaded
function resumeMonitoring() {
    if (!buttonClicked && !window.location.href.includes('/buytickets/')) {
        console.log("Resuming monitoring...");
        startMonitoring();
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "start") {
        startMonitoring();  // Start monitoring
        sendResponse({status: "Monitoring started."});
    } else if (request.action === "stop") {
        buttonClicked = true;  // Prevent any further actions
        console.log("Monitoring stopped by user.");
        if (intervalId) {
            clearInterval(intervalId);  // Clear interval on stop
        }
        sendResponse({status: "Monitoring stopped."});
    }
});

// Start monitoring as soon as possible
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Starting monitoring...");
    resumeMonitoring();  // Check if monitoring should start right away
});

// Also listen for window load event to catch any late loads
window.addEventListener('load', () => {
    resumeMonitoring();
});
