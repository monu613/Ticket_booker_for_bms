chrome.storage.local.get('monitoring', (data) => {
    if (data.monitoring) {
        // Add listener to check if the tab is updated
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            // Only proceed if the page load is complete and the URL contains 'bookmyshow.com'
            if (changeInfo.status === 'complete' && tab.url && tab.url.includes('bookmyshow.com')) {
                // Execute the content script on the matching tab
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error executing content script:", chrome.runtime.lastError);
                    } else {
                        console.log("Content script executed successfully on tab:", tabId);
                    }
                });
            }
        });
    }
  });
  
  // Listen for messages from the content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "disableExtension") {
        console.log("Disabling the extension...");
        chrome.management.setEnabled(chrome.runtime.id, false, () => {
            if (chrome.runtime.lastError) {
                console.error("Error disabling extension: ", chrome.runtime.lastError);
            } else {
                console.log("Extension disabled successfully.");
            }
        });
        sendResponse({status: "Extension disable requested."});
    }
});

  