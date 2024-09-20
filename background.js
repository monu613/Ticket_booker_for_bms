chrome.storage.local.get('monitoring', (data) => {
  if (data.monitoring) {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
          // Check if the tab has completed loading and if the URL contains a specific part
          if (tab.url && tab.url.includes('in.bookmyshow.com')) {
              // Execute content script only if the URL matches
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
  if (request.action === "disable") {
      // Logic to disable the extension
      console.log("Disabling extension...");
      // If you want to disable the extension programmatically, you can use the following line
      //chrome.management.setEnabled(chrome.runtime.id, false); // Uncomment if needed
      sendResponse({ status: "Extension disabled." });
  }
});
