////////////////////////////////////////////////////////////////////////////////////////
// background.js
// Copyright (C) 2012 David Lai
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy (lgpl_license.txt) of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
////////////////////////////////////////////////////////////////////////////////////////

// Reset test log when reloading this plugin.
//var testlogs = new Array();
//localStorage['testlogs'] = testlogs;
localStorage['testlog'] = "abc";

function getTabTestLogKey(tabId) {
	return 'testlog_' + tabId;
}



function logTestStep(tabId, text) {
	localStorage[getTabTestLogKey(tabId)] += "* " + text + "\n";
}


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


chrome.webNavigation.onCommitted.addListener(function(details) {
	var transitionType = details.transitionType;
	var transitionQualifiers = details.transitionQualifiers;
	console.log("webNav::transitonType:" + transitionType + " qualifiers: " + transitionQualifiers);

	if( transitionQualifiers.indexOf("forward_back") >= 0 ) {
		console.log("back or forward was hit");
		logTestStep(details.tabId, "Hit the back/forward button.");
	} else {

	 	switch(transitionType) {
	    	case "typed":
	    	case "auto_bookmark":
	    	case "generated":
	    	case "start_page":
	    	case "keyword":
	    	case "keyword_generated":

	    		//Reset our log if URL is typed or bookmarked
	    		console.log("Page visit from a source that's not a link click or form submit. " 
	    			+ transitionType);
	    		
				console.log("resetting step history, typed url");
				localStorage[getTabTestLogKey(details.tabId)] = "";
				logTestStep(details.tabId, "Navigate to: " + details.url);
				
				
	    		break;
	    	case "reload":
				console.log("resetting step history, reload");
				logTestStep(details.tabId, "Reload the page.");
				break;
	    	default:
	    		//other wise do nothing.
	    }
	}

});



//Listen for things to log that's passed in from the content script.
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
  	console.log("Received request:" + request.type + ":" + request.content);
    var tabId = sender.tab.id;
    if (request.type == "recordBrowserAction") {   	
    	console.log(request.content);
    	logTestStep(tabId, request.content);
    }
});
