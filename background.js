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

const onNavigationCompleted = async details => {
    if (details.frameId === 0) {
        //console.log(details.url);
        // chrome.bookmarks.getTree(function(tree){
        //     console.log(tree);
        // });
        let results = await chrome.bookmarks.search({ url: details.url });
        if (results === undefined || results.length == 0) {
            console.log("No URL hits.");
            return;
          }
    
          results.forEach(async function(bookmarkEntry) {
            const bmrEntryKey = `bmr-${bookmarkEntry.url.hashCode()}`;
            let items = await chrome.storage.sync.get([`${bmrEntryKey}`]);
            
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
            await chrome.storage.sync.set(tracker);
            console.log(
              `Bookmark Hit and stored for - ${bookmarkEntry.title}:${
                bookmarkEntry.url
              }. Hash: ${bookmarkEntry.url.hashCode()}. Total hits: ${numberOfHits}`
            );
  
            //Get Parent
            //Get siblings
            let siblingResults = await chrome.bookmarks.getChildren(bookmarkEntry.parentId);
            console.log(siblingResults);
            //Re-Order self and siblings in folder
          });
      }
}

chrome.webNavigation.onCompleted.addListener(onNavigationCompleted);
