chrome.webNavigation.onCompleted.addListener(function(details){
    if(details.frameId === 0) {
        //console.log(details.url);
        // chrome.bookmarks.getTree(function(tree){
        //     console.log(tree);
        // });
        chrome.bookmarks.search({url:details.url}, function(results){
            if(results === undefined || results.length == 0){
                console.log("No URL hits.");
                return;
            }
            console.log("We got a hit.");

            results.forEach(function(element){
                console.log(`Bookmark Hit for - ${element.title}:${element.url}`);
            });
        });
    }
  });