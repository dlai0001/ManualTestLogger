

//On document load (the plugin pop-up)
$(document).ready(function(){

	//Set URL Display.	
	var urlString = localStorage["currentUrl"];
	if(urlString.length > 30) {
		$('#urlDisplaySpan').text(urlString.substring(0, 27) + "...");
	} else 	{
		$('#urlDisplaySpan').text(urlString);
	}
	//console.log();
	
});