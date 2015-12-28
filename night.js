$(document).ready(function() {
	chrome.storage.sync.get("nightTheme", function(data) {
		if (typeof data['nightTheme'] == 'undefined'){
			chrome.storage.sync.set({'nightTheme': 'false'});
		}else{
			if (data['nightTheme'] == 'true'){
				var path = chrome.extension.getURL('/night.css');
				$('head').append($('<link>')
					.attr("rel","stylesheet")
					.attr("type","text/css")
					.attr("href", path));
				}
		}
	});
});