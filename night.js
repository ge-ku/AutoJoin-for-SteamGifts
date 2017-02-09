$(document).ready(function() {
	chrome.storage.sync.get("NightTheme", function(data) {
		if (typeof data.NightTheme == 'undefined'){
			chrome.storage.sync.set({'nightTheme': 'false'});
		}else{
			if (data.NightTheme == true){
				var path = chrome.extension.getURL('/night.css');
				$('head').append($('<link>')
					.attr("rel","stylesheet")
					.attr("type","text/css")
					.attr("href", path));
				}
		}
	});
});