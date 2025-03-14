// Default settings for Tab Closer extension
const DEFAULT_SETTINGS = {
  urlPatterns: [
    { pattern: 'peerspace.twingate.com/client-auth-status', enabled: true },
    { pattern: 'peerspace.zoom.us/j/', enabled: true }
  ],
  timeoutSeconds: 5
};

// Export the settings for use in other files
if (typeof module !== 'undefined') {
  module.exports = { DEFAULT_SETTINGS };
} 