//Monitor when URL is entered into a Tab.

// Update URL when URL changes.
chrome.tabs.onUpdated.addListener(function(tabId, props) {
	console.log(typeof(props.url));
	if( typeof(props.url) == "string" ) {
		localStorage["currentUrl"] = props.url;		
		console.log("current url: " + localStorage["currentUrl"]);
	}
});


// Update URL and track tab when tab switch.
chrome.tabs.onActivated.addListener(function(activeInfo) {
	console.log("New tab activated:" )
	localStorage["currentTab"] = activeInfo.tabId;
	localStorage["currentWindow"] = activeInfo.windowId;
	chrome.tabs.get(activeInfo.tabId, function (tab) {
		localStorage["currentUrl"] = tab.url;
	});
});