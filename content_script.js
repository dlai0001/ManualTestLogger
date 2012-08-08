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
	if( isLinkNavigation(linkObj)) {
		chrome.extension.sendRequest({
			type: "recordBrowserAction", 
			content: "Click on navigation item '" + linkObj.textContent + "'"
		});
	} else {
		chrome.extension.sendRequest({
			type: "recordBrowserAction", 
			content: "Click on link '" + linkObj.textContent + "'"
		});
	}
}

function isThereParentLink(targetObj) {	
	if(typeof(targetObj.parentNode) != 'undefined' && targetObj.parentNode instanceof HTMLElement) {
		
		if(targetObj.parentNode.nodeName == "A" || targetObj.parentNode.nodeName == "a") {
			return true;
		} else {
			//recursive call to check the next parent.
			return isThereParentLink(targetObj.parentNode);
		}
	}
	return false;
}

function isLinkNavigation(targetObj) {
	var idContainsNavigation = targetObj.id.match(/[nN]((av[^a-z])|(avigation))/) != null;
	var classContainsNavigation = targetObj.className.match(/[nN]((av[^a-z])|(avigation))/) != null;
	if( idContainsNavigation || classContainsNavigation) {
		return true;
	}

	if(typeof(targetObj.parentNode) != 'undefined' && targetObj.parentNode instanceof HTMLElement) {
		return isLinkNavigation(targetObj.parentNode);
	}
	return false;
}


function getMouseOverHandler(targetObj) {
	
	if( typeof(targetObj.onmouseover) != 'undefined' && targetObj.onmouseover != null ) {
		return targetObj.onmouseover;
	}

	if(typeof(targetObj.parentNode) != 'undefined' && targetObj.parentNode instanceof HTMLElement) {
		return getMouseOverHandler(targetObj.parentNode);
	}
	return null;
}



//Add a doucment level listener for click events.
document.onclick = function(clickEvent) {
	console.log("click event " + clickEvent.target);
	
	switch(clickEvent.target.nodeName) {
		case "A":			
		case "a":
			handleClickLink(clickEvent.target);
			break;
		default:		
			var parentLinkExist = isThereParentLink(clickEvent.target);
			if( parentLinkExist ) {
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

 var lastElementHovered;
 document.onmouseover = function(mouseEvent) {
 	lastElementHovered = mouseEvent.srcElement;
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

//Trigger when a div appears (to detect hover overs)
$('div').each(function() {
	console.log("========================================");
	if(!$(this).is(':visible')) {
		//add a listener to check when this element becomes visible.
		console.log("hidden div detected:" + $(this));
		$(this).watch('display', function(e) {
			if($(this).is(':visible')) {
				//log a hover over on the last element triggering the div to appear.
				console.log("Hover over " + $(lastElementHovered).text());
				logTestStep("Hover mouse over element " + $(lastElementHovered).text() );
			}
		});
		console.log("change listener added....");
	}
}); 

