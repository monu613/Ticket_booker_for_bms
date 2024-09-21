console.log("Content script running on BookMyShow");

// Max retries before refreshing the page
const MAX_RETRIES = 6;  
let retries = 0;
let buttonClicked = false;  
let previousUrl = window.location.href;  

// Function to start monitoring
function startMonitoring() {
    if (buttonClicked) return;  // Prevent starting if button has already been clicked

    console.log("Monitoring started.");
    retries = 0;  // Reset retries for a new monitoring session
    previousUrl = window.location.href;  // Set the previous URL to current

    // Mutation observer to watch for changes in the DOM

    const checkButton = setInterval(() => {
        // Check for URL change
        if (window.location.href !== previousUrl) {
            console.log("URL changed. Updating previous URL.");
            previousUrl = window.location.href;  // Update previous URL
            retries = 0;  // Reset retries on URL change
        }

        // If already on the booking page, stop the script
        if (window.location.href.includes('venue')) {
            console.log("Already on the booking page. Looking for Date and Time");
            selectTimeAndContinue();
            clearInterval(checkButton);  // Stop checking when on the booking page
            return;
        }

        // Select the Book button by checking the text "Book" or "Book Now"
        let buttons = document.querySelectorAll('button');
        let bookButton = Array.from(buttons).find(button => 
            button.textContent.trim().toLowerCase() === 'book' || 
            button.textContent.trim().toLowerCase() === 'book now'
        );

        // Immediate click attempt if the button is found
        if (bookButton && !buttonClicked) {
            console.log("Book button detected. Attempting to click...");
            bookButton.click();  // Automatically click the 'Book' button
            buttonClicked = true;  // Set the flag to prevent further clicks
            console.log("Book button clicked. Proceeding to time selection.");
            selectTimeAndContinue();  // Call the function for time selection and continue
            clearInterval(checkButton);  // Stop checking after the button is clicked
            return;
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
    }, 500);  // Check every 500 milliseconds
}
// Function to select a specific time and click "Continue" or "Proceed"
function selectTimeAndContinue() {
    retries = 0;

    let timeInterval = setInterval(() => {
        // Find the date element based on its text content
        let dateElements = document.querySelectorAll('div'); // Get all divs
        let correctDateElement = Array.from(dateElements).find((el => el.textContent.includes('Sat, 21 December') )||(el => el.textContent.includes('Sat, 21 DECEMBER')));

        if (correctDateElement) {
            console.log("Date element detected. Proceeding to time selection.");

            // Find all time elements with the data-id 'time-pill'
            let timeElements = correctDateElement.closest('div').querySelectorAll('li[data-id="time-pill"]');
            let desiredTimeElement = Array.from(timeElements).find(el => el.textContent.includes('8:30 PM'));

            if (desiredTimeElement) {
                console.log("Time element detected. Attempting to click...");
                desiredTimeElement.click();  // Click the specific time

                // Wait for a short delay to ensure the "Continue" or "Proceed" button appears
                setTimeout(() => {
                    // Find buttons and filter by text 'Continue' or 'Proceed'
                    let buttons = document.querySelectorAll('button');
                    let continueOrProceedButton = Array.from(buttons).find(button => 
                        button.textContent.includes('Continue') || button.textContent.includes('Proceed')
                    );

                    if (continueOrProceedButton) {
                        console.log(`Button '${continueOrProceedButton.textContent}' detected. Clicking it.`);
                        continueOrProceedButton.click();

                        // Stop monitoring and disable the extension or monitoring
                        stopMonitoringAndDisable();
                        
                        clearInterval(timeInterval);  // Stop further checks once the action is complete
                    } else {
                        console.log("Continue or Proceed button not found. Retrying...");
                    }
                }, 50);  // Wait 1 second to let the button appear after clicking the time
            } else {
                console.log("Time element not found. Retrying...");
                retries++;

                if (retries >= MAX_RETRIES) {
                    console.log("Max retries reached for time selection. Stopping script. Use manual process...");
                    stopMonitoringAndDisable();  // Refresh the page if time isn't found
                }
            }
        } else {
            console.log("Date element not found. Retrying...");
            retries++;

            if (retries >= MAX_RETRIES) {
                console.log("Max retries reached for date selection. Unable to find date and time. Choose manually.");
                stopMonitoringAndDisable(); // Disable the extension
            }
        }
    }, 50);  // Retry every second to find and click the time and continue buttons
}

// Function to stop monitoring and disable extension/monitoring
function stopMonitoringAndDisable() {
    console.log("Stopping monitoring and disabling...");

    // Stop monitoring by setting buttonClicked to true
    buttonClicked = true;

    // Set monitoring to false in chrome.storage to stop monitoring on future page loads
    //chrome.storage.local.set({ monitoring: false }, () => {
        console.log("Monitoring disabled.");

        // Optionally disable the entire extension
        // Uncomment the next line if you want to fully disable the extension
        chrome.runtime.sendMessage({ action: "disableExtension" }, response => {
            console.log(response.status);
        });
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
