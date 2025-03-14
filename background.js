// Store tab timeouts to be able to clear them if needed
const tabTimeouts = {};

// Import default settings
// Note: Since we can't use import in MV3 service workers, we'll define it here
// but this will be the only place we need to define it besides settings.js
const DEFAULT_SETTINGS = {
  urlPatterns: [
    { pattern: 'peerspace.twingate.com/client-auth-status', enabled: true },
    { pattern: 'peerspace.zoom.us/j/', enabled: true }
  ],
  timeoutSeconds: 5
};

// Load settings from storage
function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('tabCloserSettings', (result) => {
      if (result.tabCloserSettings) {
        resolve(result.tabCloserSettings);
      } else {
        // Initialize with default settings if none exist
        chrome.storage.sync.set({ tabCloserSettings: DEFAULT_SETTINGS });
        resolve(DEFAULT_SETTINGS);
      }
    });
  });
}

// Check if a URL matches any of the patterns
function urlMatchesPatterns(url, patterns) {
  const enabledPatterns = patterns.filter(p => p.enabled);
  return enabledPatterns.some(p => url.includes(p.pattern));
}

// Inject countdown banner into the tab
function injectCountdownBanner(tabId, secondsLeft) {
  const bannerCode = `
    // Remove existing banner if any
    const existingBanner = document.getElementById('tab-closer-countdown-banner');
    if (existingBanner) {
      existingBanner.remove();
    }
    
    // Create banner element
    const banner = document.createElement('div');
    banner.id = 'tab-closer-countdown-banner';
    banner.style.position = 'fixed';
    banner.style.top = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    banner.style.color = 'white';
    banner.style.textAlign = 'center';
    banner.style.padding = '10px';
    banner.style.fontFamily = 'Arial, sans-serif';
    banner.style.fontSize = '14px';
    banner.style.fontWeight = 'bold';
    banner.style.zIndex = '9999999';
    banner.textContent = 'This tab will close in ${secondsLeft} seconds';
    
    // Add to page
    document.body.prepend(banner);
  `;
  
  chrome.scripting.executeScript({
    target: { tabId },
    func: (secondsLeft) => {
      // Remove existing banner if any
      const existingBanner = document.getElementById('tab-closer-countdown-banner');
      if (existingBanner) {
        existingBanner.remove();
      }
      
      // Create banner element
      const banner = document.createElement('div');
      banner.id = 'tab-closer-countdown-banner';
      banner.style.position = 'fixed';
      banner.style.top = '0';
      banner.style.left = '0';
      banner.style.right = '0';
      banner.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
      banner.style.color = 'white';
      banner.style.textAlign = 'center';
      banner.style.padding = '10px';
      banner.style.fontFamily = 'Arial, sans-serif';
      banner.style.fontSize = '14px';
      banner.style.fontWeight = 'bold';
      banner.style.zIndex = '9999999';
      banner.textContent = `This tab will close in ${secondsLeft} seconds`;
      
      // Add to page
      document.body.prepend(banner);
    },
    args: [secondsLeft]
  }).catch(err => {
    console.error("Error injecting countdown banner:", err);
  });
}

// Update countdown banner
function updateCountdownBanner(tabId, secondsLeft) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (secondsLeft) => {
      const banner = document.getElementById('tab-closer-countdown-banner');
      if (banner) {
        banner.textContent = `This tab will close in ${secondsLeft} seconds`;
      }
    },
    args: [secondsLeft]
  }).catch(err => {
    // Ignore errors if tab is already closed or not accessible
  });
}

// Handle tab updates (including creation)
async function handleTabUpdate(tabId, changeInfo, tab) {
  // Only process if URL is available and tab is complete
  if (changeInfo.status === 'complete' && tab.url) {
    const settings = await loadSettings();
    
    // Check if URL matches any pattern
    if (urlMatchesPatterns(tab.url, settings.urlPatterns)) {
      console.log(`Tab ${tabId} with URL ${tab.url} matches pattern, scheduling close in ${settings.timeoutSeconds} seconds`);
      
      // Clear any existing timeout for this tab
      if (tabTimeouts[tabId]) {
        clearTimeout(tabTimeouts[tabId]);
        delete tabTimeouts[tabId];
      }
      
      // Create countdown object for this tab
      const countdown = {
        secondsLeft: settings.timeoutSeconds,
        intervalId: null,
        timeoutId: null
      };
      
      // Inject initial countdown banner
      injectCountdownBanner(tabId, countdown.secondsLeft);
      
      // Set interval to update countdown
      countdown.intervalId = setInterval(() => {
        countdown.secondsLeft--;
        
        if (countdown.secondsLeft > 0) {
          updateCountdownBanner(tabId, countdown.secondsLeft);
        } else {
          // Clear interval when countdown reaches zero
          clearInterval(countdown.intervalId);
        }
      }, 1000);
      
      // Set timeout to close tab
      countdown.timeoutId = setTimeout(() => {
        chrome.tabs.remove(tabId);
        
        // Clean up
        if (countdown.intervalId) {
          clearInterval(countdown.intervalId);
        }
        delete tabTimeouts[tabId];
      }, settings.timeoutSeconds * 1000);
      
      // Store countdown object
      tabTimeouts[tabId] = countdown;
    }
  }
}

// Handle tab removal to clean up timeouts
function handleTabRemoved(tabId) {
  if (tabTimeouts[tabId]) {
    if (tabTimeouts[tabId].intervalId) {
      clearInterval(tabTimeouts[tabId].intervalId);
    }
    if (tabTimeouts[tabId].timeoutId) {
      clearTimeout(tabTimeouts[tabId].timeoutId);
    }
    delete tabTimeouts[tabId];
  }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener(handleTabUpdate);

// Listen for tab removal
chrome.tabs.onRemoved.addListener(handleTabRemoved);

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.tabCloserSettings) {
    console.log('Settings updated:', changes.tabCloserSettings.newValue);
  }
}); 