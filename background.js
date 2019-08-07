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

const incrementStoredBookmarkEntry = async bookmarkEntry => {
  const bmrEntryKey = `${convertUrlToKey(bookmarkEntry.url)}`;
  bookmarkEntry.bmrKey = bmrEntryKey;
  let items = await chrome.storage.local.get([`${bmrEntryKey}`]);

  let numberOfHits = 1; //Had to hit it at least once to bookmark it
  //Get existing value if exists
  if (items[bmrEntryKey]) {
    const existingValue = items[`${bmrEntryKey}`];
    console.log(`Existing Value: ${existingValue}`);
    numberOfHits = existingValue;
  }

  //Set into storage
  numberOfHits++;
  let tracker = { [bmrEntryKey]: numberOfHits };
  await chrome.storage.local.set(tracker);
  bookmarkEntry.weight = numberOfHits;
};

const compareBookmarkByWeightThenIndex = (a, b) => {
  //   console.log(`${a.title}: weight ${a.weight}, ${b.title}: weight ${b.weight}`);
  if (Number(a.weight) > Number(b.weight)) {
    // console.log(`${a.title}: sorted before ${b.title}`);
    return -1;
  }
  if (Number(a.weight) < Number(b.weight)) {
    // console.log(`${a.title}: sorted after ${b.title}`);
    return 1;
  }

  if (Number(a.weight) == Number(b.weight)) {
    if (Number(a.index) < Number(b.index)) return -1;
    if (Number(a.index) > Number(b.index)) return 1;
  }

  return 0;
};

const onNavigationCompleted = async details => {
  if (details.frameId !== 0) {
    return;
  }

  let results = await chrome.bookmarks.search({ url: details.url });
  if (results === undefined || results.length == 0) {
    console.log("No URL hits.");
    return;
  }

  results.forEach(async function(bookmarkEntry) {
    await incrementStoredBookmarkEntry(bookmarkEntry);

    console.log(
      `Bookmark Hit and stored for - ${bookmarkEntry.title}:${bookmarkEntry.url}. Hash: ${bookmarkEntry.url.hashCode()}. Weight: ${
        bookmarkEntry.weight
      }. Key: ${bookmarkEntry.bmrKey}.`
    );

    //Get siblings
    let siblingResults = await chrome.bookmarks.getChildren(bookmarkEntry.parentId);
    //Add Bookmark Ranks to each sibling found
    for (i = 0; i < siblingResults.length; i++) {
      let sibling = siblingResults[i];

      let siblingBmrKey = convertUrlToKey(sibling.url);
      let siblingKeyQuery = `${siblingBmrKey}`;
      sibling.bmrKey = siblingKeyQuery;

      let siblingBmrEntry = await chrome.storage.local.get(siblingKeyQuery);
      let entryWeight = siblingBmrEntry[siblingBmrKey] || 1;
      sibling.weight = entryWeight;
    }

    await recursiveSortBookmarks(siblingResults);
  });
};

const recursiveSortBookmarks = async bookmarksInCurrentFolder => {
  var sortedBookmarks = bookmarksInCurrentFolder.sort(compareBookmarkByWeightThenIndex);
  console.log(sortedBookmarks);

  for (var i = 0; i < sortedBookmarks.length; i++) {
    let bookmark = sortedBookmarks[i];
    let oldIndex = bookmark.index;
    if (bookmark.index == i) return;
    await chrome.bookmarks.move(bookmark.id, { index: i });
    console.log(`Moved bookmark: ${bookmark.title}. From index ${oldIndex} to ${i}.`);
  }
};

chrome.webNavigation.onCompleted.addListener(onNavigationCompleted);
