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

const keyPrefix = "bmr_";
const convertUrlToKey = url => {
  if (!url) {
    return null;
  }

  return `${keyPrefix}${url.hashCode()}`;
};

const incrementStoredBookmarkEntry = async url => {
  const bmrEntryKey = `${convertUrlToKey(url)}`;
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
};

const onNavigationCompleted = async details => {
  if (details.frameId !== 0) {
    return;
  }

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
    await incrementStoredBookmarkEntry(bookmarkEntry.url);

    console.log(
      `Bookmark Hit and stored for - ${bookmarkEntry.title}:${
        bookmarkEntry.url
      }. Hash: ${bookmarkEntry.url.hashCode()}.`
    );

    //Get siblings
    let siblingResults = await chrome.bookmarks.getChildren(bookmarkEntry.parentId);
    //Add Bookmark Ranks to each sibling found
    siblingResults.forEach(async sibling => {
      let siblingKeyQuery = `${convertUrlToKey(sibling.url)}`;
      sibling.bmrKey = siblingKeyQuery;

      let siblingBmrEntry = await chrome.storage.sync.get(siblingKeyQuery);
      let entryWeight = siblingBmrEntry[convertUrlToKey(sibling.url)] || 1;
      sibling.weight = entryWeight;
    });
    console.log(siblingResults);

    // let siblingKeyQuery = siblingResults.map(x => `${convertUrlToKey(x.url)}`);
    // let siblingBmrEntries = await chrome.storage.sync.get(siblingKeyQuery);
    // console.log(siblingBmrEntries);
    // //go through each one and see if it's a url or a folder
    // siblingResults.forEach(sibling => {
    //   //if folder, skip
    //   if (!sibling.url) {
    //     return;
    //   }
    //   //if URL, check its weight value in the storage, defaulting to 1 if not found (had to hit it once to set the bookmark...right?)
    //   let entryWeight = siblingBmrEntries[convertUrlToKey(sibling.url)] || 1;
    //   console.log(entryWeight);
    //   //map to URL/index mapping
    //   //If self, skip, this is special condition
    //   //Compare and swap places with a higher index bookmark that's got fewer hits after the change.
    // });

    //Re-Order self and siblings in folder
  });
};

chrome.webNavigation.onCompleted.addListener(onNavigationCompleted);
