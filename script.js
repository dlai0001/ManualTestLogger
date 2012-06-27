//Global Vars
var currentTabId;


//HTML escape function for encoding test steps.
function htmlEncode(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}


function setHeaderUrl(tab) {
	var urlString = tab.url;
	if(urlString.length > 30) {
		$('#urlDisplaySpan').text(urlString.substring(0, 27) + "...");
	} else 	{
		$('#urlDisplaySpan').text(urlString);
	}
}

function setTestSteps(tab) {
	console.log("getting currently selected tab");
    var tabId = tab.id;
    var testStepKey = 'testlog_' + tab.id;
    
	var testSteps = htmlEncode(localStorage[testStepKey]).replace(/\n/g, "<br/>");

	//Set content to display test steps.
	$('#content').html(testSteps);
}


function copyToClipboard() {
	var testStepKey = 'testlog_' + currentTabId;
	var testSteps = localStorage[testStepKey];

	var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = htmlEncode(testSteps).replace(/\n/g, "<br/>");
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);
	

	showNotification("Copied to Clipboard.");
}

function showNotification(text) {
	$('#notificationArea').html(text).fadeIn(1000).fadeOut(2000);
}




//On document load (the plugin pop-up)
$(document).ready(function(){

	
	chrome.tabs.getSelected(null,function(tab) {
		currentTabId = tab.id;
	
		//set the current url display
		setHeaderUrl(tab);

		//get steps associated with current tab.
		setTestSteps(tab);
	});
	

});