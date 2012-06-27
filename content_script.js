////////////////////////////////////////////////////////////////////////////////////////
// content_script.js
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

function isThereParentLink(targetObj) {	
	if(typeof(targetObj.parentNode) != 'undefined') {
		
		if(targetObj.parentNode.nodeName == "A" && targetObj.parentNode.nodeName == "a") {
			return true;
		} else {
			//recursive call to check the next parent.
			return isThereParentLink(targetObj.parentNode);
		}
	}
	return false;
}

//Add a doucment level listener for click events.
document.onclick = function(clickEvent) {
	
	switch(clickEvent.target.nodeName) {
		case "A":			
		case "a":
			handleClickLink(clickEvent.target);
			break;
		default:			
			if( isThereParentLink(clickEvent.target) ) {
				handleClickLink(clickEvent.target);
			}
	}
	
};


//Add listener for form inputs.
document.onchange = function(changeEvent) {

	inputType = changeEvent.target.type;
	console.log("onChange " + inputType + " " + getXPath(changeEvent.target) 
		+ " :name" + changeEvent.target.name
		+ " :value:" + changeEvent.target.value);

	switch(inputType) {
		case "text":
		case "textarea":
			logTestStep("Enter '" + changeEvent.target.value + "' into the '"
				+ changeEvent.target.name + "'' " + inputType + " field.");
			break;
		case "password":
			logTestStep("Enter '" + changeEvent.target.value + "' into the '"
				+ changeEvent.target.name + "'' password field.");
			break;
		case "radio":		
			logTestStep("Select '" + changeEvent.target.value + "' option from the '"
				+ changeEvent.target.name + "'' " + inputType + " field.");
			break;
		case "checkbox":
			console.log(changeEvent.target.checked + "typeof:" + typeof(changeEvent.target.checked));
			var checkAction="Uncheck";
			if( changeEvent.target.checked ) {
				checkAction = "Check";
			}
			logTestStep(checkAction + " the '" + changeEvent.target.value + "' option from the '"
				+ changeEvent.target.name + "'' " + inputType + " field.");
			break;
		case "select-one":
			logTestStep("Select the '" + changeEvent.target.value + "' option from the '"
				+ changeEvent.target.name + "'' select field.");
			break;
		case "select-multiple":
			logTestStep("Select the '" + changeEvent.target.value + "' option from the '"
				+ changeEvent.target.name + "'' " + " multi-select field.");
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

function logTestStep(text) {
	chrome.extension.sendRequest({
		type: "recordBrowserAction", 
		content: text
	});
}