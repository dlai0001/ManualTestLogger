

function handleClickLink(linkObj) {

}


//Add a doucment level listener for click events.
document.onclick = function(clickEvent) {
	switch(clickEvent.target.nodeName) {
		case "A":
			handleClickLink(elickEvent.target);
			break;
	}
	
};