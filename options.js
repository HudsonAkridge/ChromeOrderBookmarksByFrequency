/* eslint-disable no-undef */
// Saves options to chrome.storage
function save_options() {
    let storageType = document.getElementById('storageType').value;
    let orderType = document.getElementById('orderType').value;
    chrome.storage.sync.set({
      storageType: storageType,
      orderType: orderType
    }, function() {
      // Update status to let user know options were saved.
      let status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
      storageType: 'sync',
      orderType: 'frequency'
    }, function(items) {
      document.getElementById('storageType').value = items.storageType;
      document.getElementById('orderType').value = items.orderType;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
      save_options);