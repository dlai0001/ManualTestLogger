

function getXPath( element ) {
    var xpath = '';
    for ( ; element && element.nodeType == 1; element = element.parentNode )
    {
        var id = $(element.parentNode).children(element.tagName).index(element) + 1;
        id > 1 ? (id = '[' + id + ']') : (id = '');
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
    }
    return xpath;
}


function handleClickLink(linkObj) {
	console.log("clicked link");
	chrome.extension.sendRequest({
		type: "recordBrowserAction", 
		content: "Click on link '" + linkObj.textContent + "'"
	});
}


//Add a doucment level listener for click events.
document.onclick = function(clickEvent) {
	
	switch(clickEvent.target.nodeName) {
		case "A":			
			handleClickLink(clickEvent.target);
			break;
	}
	
};


//Add listener for form inputs.
document.onchange = function(changeEvent) {

	inputType = changeEvent.target.type;

	switch(inputType) {
		case "text":
		case "textarea":
			chrome.extension.sendRequest({
				type: "recordBrowserAction", 
				content: "Enter '" + changeEvent.target.value + "' into the '"
					+ changeEvent.target.name + "'' " + inputType + " field."
			});
			break;
		default:
	}
}

//Add listener for form inputs.
document.onsubmit = function(changeEvent) {
	chrome.extension.sendRequest({
		type: "recordBrowserAction", 
		content: "submit form."
	});
}