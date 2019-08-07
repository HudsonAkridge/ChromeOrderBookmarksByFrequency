String.prototype.hashCode = function() {
  var hash = 0,
    i,
    chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

chrome.webNavigation.onCompleted.addListener(function(details) {
  if (details.frameId === 0) {
    //console.log(details.url);
    // chrome.bookmarks.getTree(function(tree){
    //     console.log(tree);
    // });
    chrome.bookmarks.search({ url: details.url }, function(results) {
      if (results === undefined || results.length == 0) {
        console.log("No URL hits.");
        return;
      }

      results.forEach(function(element) {
        const bmrEntryKey = `bmr-${element.url.hashCode()}`;
        chrome.storage.sync.get([`${bmrEntryKey}`], items => {
          console.log(items);
          let numberOfHits = 0;
          //Get existing value if exists
          if (items[bmrEntryKey]) {
            const existingValue = items[`${bmrEntryKey}`];
            console.log(`Existing Value: ${existingValue}`);
            numberOfHits = existingValue;
          }

          //Set into storage
          numberOfHits++;
          let tracker = { [bmrEntryKey]: numberOfHits };
          console.log(tracker);
          chrome.storage.sync.set(tracker);
          console.log(
            `Bookmark Hit and stored for - ${element.title}:${
              element.url
            }. Hash: ${element.url.hashCode()}. Total hits: ${numberOfHits}`
          );
        });
      });
    });
  }
});
