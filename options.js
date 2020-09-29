/* eslint-disable no-undef */
// Saves options to chrome.storage
async function save_options() {
  let storageType = document.getElementById("storageType").value;
  let orderType = document.getElementById("orderType").value;
  await browser.storage.sync.set({
    storageType: storageType,
    orderType: orderType,
  });

  displayMessage("Options saved.");
}

function displayMessage(message) {
  // Update status to let user know options were saved.
  let status = document.getElementById("status");
  status.textContent = message;
  setTimeout(function () {
    status.textContent = "";
  }, 2000);
}

async function restore_options() {
  let items = await browser.storage.sync.get({
    storageType: "sync",
    orderType: "frequency",
  });

  document.getElementById("storageType").value = items.storageType;
  document.getElementById("orderType").value = items.orderType;
}

async function clear_storage() {
  await browser.storage.sync.clear();
  await browser.storage.local.clear();
}

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
// document.getElementById("clearStorage").addEventListener("click", clear_storage);
