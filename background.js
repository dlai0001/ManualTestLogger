// Reset test log when reloading this plugin.
//var testlogs = new Array();
//localStorage['testlogs'] = testlogs;
localStorage['testlog'] = "abc";

function getTabTestLogKey(tabId) {
	return 'testlog_' + tabId;
}

// When Url changes
chrome.tabs.onUpdated.addListener(function(tabId, props) {

});


// When an tab is activated check to make sure we have a testlog_ entry for it.
chrome.tabs.onActivated.addListener(function(activeInfo) {
	
	chrome.tabs.get(activeInfo.tabId, function (tab) {
		
		//store current url.		
		localStorage["currentTabId"] = tab.id;

		var testStepKey = getTabTestLogKey(tab.id);
		//If local storage does not exist for this tab, created it.
		console.log("localstorage for tab: " + localStorage[testStepKey]);
		if(typeof(localStorage[testStepKey])=='undefined' 
			|| localStorage[testStepKey] == null) {
			
		 	localStorage[testStepKey] = "* Navigate to: " + tab.url + "\n";
		 	console.log("localstorage for tab: " + localStorage[testStepKey]);
		}

	});
});

//When we close a tab, we want to remove the test log entry for it.
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {	
	localStorage[getTabTestLogKey(tabId)] = undefined;
});


//When user navigates to a new URL that's not a form action or a link, 
// we'll reset the test steps.
chrome.history.onVisited.addListener(function(historyItem) {
	//find out how this visit was performed.
	var historyId = historyItem.id;
	
	//figure out what the most recent visit item is.
	chrome.history.getVisits({url: historyItem.url}, function(visitItems) {
		var mostResentVisitItem = visitItems[0];
	    for (var i = 0, ie = visitItems.length; i < ie; ++i) {
	      	// Keep track of the most recent visit time.  It should match historyItem.lastVisitTime.
	      	if (mostResentVisitItem.visitTime < visitItems[i].visitTime) {
				mostResentVisitItem = visitItems[i];
	      	}
	    }

	    //check how this visit was performed.
	    var transition = mostResentVisitItem.transition;
	    switch(transition) {
	    	case "typed":
	    	case "auto_bookmark":
	    	case "generated":
	    	case "start_page":
	    	case "keyword":
	    	case "keyword_generated":
	    		//Reset our log if URL is typed or bookmarked
	    		console.log("Page visit from a source that's not a link click or form submit. " 
	    			+ transition);
	    		
				console.log("resetting step history, typed url");
				localStorage[getTabTestLogKey(localStorage["currentTabId"])] = 
					"* Navigate to: " + historyItem.url + "\n";
				
				
	    		break;
	    	case "reload":
	    		chrome.tabs.getCurrent(function(tab) {
	    			if( typeof(tab) != 'undefined' && typeof(tab.id) != 'undefined' ) {
	    				console.log("resetting step history, reload");
						localStorage[getTabTestLogKey(tab.id)] += "* Reload the page.\n";
					}
				});
				break;
	    	default:
	    		//do nothing
	    }
	});
});

//Listen for things to log that's passed in from the content script.
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    var tabId = sender.tab.id;
    if (request.type == "recordBrowserAction") {
    	// do somethign to log the action.
    	console.log(request.action);
    }
});