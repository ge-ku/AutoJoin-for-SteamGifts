document.addEventListener("DOMContentLoaded", function () {
var thisVersion = 20170225;
chrome.storage.sync.get({
		lastLaunchedVersion: thisVersion
	}, function(version) {
		if (version.lastLaunchedVersion < 20170123){
			chrome.storage.sync.clear(function(){ //this version is too old, reset settings
				chrome.storage.sync.set({
					lastLaunchedVersion: thisVersion
				}, function(){
                    console.log("old version launched, settings cleared");
					loadSettings();
                });
			});
		} else {
			loadSettings();
		}
	});
});