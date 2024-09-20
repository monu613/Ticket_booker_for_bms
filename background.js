chrome.storage.local.get('monitoring', (data) => {
  if (data.monitoring) {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
          // Check if the tab has completed loading
          if (changeInfo.status === 'complete') {
              // Execute content script on any tab
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
