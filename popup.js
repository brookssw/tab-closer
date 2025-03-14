// DOM elements
const statusText = document.getElementById('status-text');
const timeoutValue = document.getElementById('timeout-value');
const patternsList = document.getElementById('patterns-list');
const optionsButton = document.getElementById('options-button');
const addCurrentUrlButton = document.getElementById('add-current-url');
const addUrlModal = document.getElementById('add-url-modal');
const urlPatternInput = document.getElementById('url-pattern-input');
const cancelAddUrlButton = document.getElementById('cancel-add-url');
const saveUrlPatternButton = document.getElementById('save-url-pattern');

// Load and display settings
function loadSettings() {
  chrome.storage.sync.get('tabCloserSettings', (result) => {
    const settings = result.tabCloserSettings || DEFAULT_SETTINGS;
    
    // Update timeout display
    timeoutValue.textContent = settings.timeoutSeconds;
    
    // Update status text
    const enabledPatterns = settings.urlPatterns.filter(p => p.enabled);
    if (enabledPatterns.length > 0) {
      statusText.textContent = 'Tab Closer is active';
      statusText.className = 'status-enabled';
    } else {
      statusText.textContent = 'No active patterns';
      statusText.className = 'status-disabled';
    }
    
    // Clear and update patterns list
    patternsList.innerHTML = '';
    
    if (settings.urlPatterns.length === 0) {
      const noPatterns = document.createElement('div');
      noPatterns.textContent = 'No patterns configured';
      patternsList.appendChild(noPatterns);
    } else {
      settings.urlPatterns.forEach(patternObj => {
        const patternItem = document.createElement('div');
        patternItem.className = 'pattern-item' + (patternObj.enabled ? '' : ' pattern-disabled');
        
        const patternText = document.createElement('span');
        patternText.textContent = patternObj.pattern;
        
        const patternStatus = document.createElement('span');
        patternStatus.textContent = patternObj.enabled ? 'Active' : 'Disabled';
        
        patternItem.appendChild(patternText);
        patternItem.appendChild(patternStatus);
        
        patternsList.appendChild(patternItem);
      });
    }
  });
}

// Open options page
function openOptions() {
  chrome.runtime.openOptionsPage();
}

// Show the add URL modal with the current tab's URL
function showAddUrlModal() {
  // Get the current tab's URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const currentUrl = tabs[0].url;
      
      // Extract domain and path for a more useful pattern
      try {
        const url = new URL(currentUrl);
        const pattern = url.hostname + url.pathname;
        urlPatternInput.value = pattern;
      } catch (e) {
        // If URL parsing fails, just use the full URL
        urlPatternInput.value = currentUrl;
      }
      
      // Show the modal
      addUrlModal.style.display = 'flex';
    }
  });
}

// Hide the add URL modal
function hideAddUrlModal() {
  addUrlModal.style.display = 'none';
}

// Save the URL pattern to settings
function saveUrlPattern() {
  const pattern = urlPatternInput.value.trim();
  
  if (pattern) {
    chrome.storage.sync.get('tabCloserSettings', (result) => {
      const settings = result.tabCloserSettings || DEFAULT_SETTINGS;
      
      // Add the new pattern
      settings.urlPatterns.push({
        pattern: pattern,
        enabled: true
      });
      
      // Save the updated settings
      chrome.storage.sync.set({ tabCloserSettings: settings }, () => {
        // Reload the patterns list
        loadSettings();
        
        // Hide the modal
        hideAddUrlModal();
      });
    });
  }
}

// Event listeners
optionsButton.addEventListener('click', openOptions);
addCurrentUrlButton.addEventListener('click', showAddUrlModal);
cancelAddUrlButton.addEventListener('click', hideAddUrlModal);
saveUrlPatternButton.addEventListener('click', saveUrlPattern);

// Close modal if clicking outside of it
addUrlModal.addEventListener('click', (e) => {
  if (e.target === addUrlModal) {
    hideAddUrlModal();
  }
});

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', loadSettings); 