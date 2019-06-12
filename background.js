chrome.webNavigation.onCompleted.addListener(function(details){
    if(details.frameId === 0) {
        console.log(details.url);
    }
    // chrome.tabs.get(details.tabId, function(tab) {
    //     if(tab.url === details.url) {
    //     }}
  });