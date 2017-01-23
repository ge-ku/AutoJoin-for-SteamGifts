var newVersionLaunched = false;
var thisVersion = 20170101;

var settings;

function changeSettingsFormat(oldFormatSettings) {
	chrome.storage.sync.set({
		InfiniteScrolling: (oldFormatSettings.infiniteScrolling == "true"),
		ShowPoints: (oldFormatSettings.showPoints == "true"),
		ShowButtons: (oldFormatSettings.showButtons == "true"),
		LoadFive: (oldFormatSettings.loadFive == "true"),
		HideDlc: (oldFormatSettings.hideDlc == 'true'),
		RepeatIfOnPage: (oldFormatSettings.repeatIfOnPage == 'true'),
		NightTheme: (oldFormatSettings.nightTheme == 'true'),
		LevelPriority: (oldFormatSettings.levelPriority == 'true'),
		LevelPriorityBG: (oldFormatSettings.LevelPriorityBG == 'true'),
		OddsPriorityBG: (oldFormatSettings.OddsPriorityBG == 'true'),
		BackgroundAJ: (oldFormatSettings.BackgroundAJ == 'true'),
		HideEntered: (oldFormatSettings.HideEntered == 'true'),
		IgnoreGroups: (oldFormatSettings.IgnoreGroups == 'true'),
		IgnorePinned: (oldFormatSettings.IgnorePinned == 'true'),
		IgnoreGroupsBG: (oldFormatSettings.IgnoreGroupsBG == 'true'),
		IgnorePinnedBG: (oldFormatSettings.IgnorePinnedBG == 'true'),
		HideGroups: (oldFormatSettings.HideGroups == 'true'),
		PlayAudio: (oldFormatSettings.PlayAudio == 'true'),
		RepeatHours: parseInt(oldFormatSettings.repeatHours, 10),
		RepeatHoursBG: parseInt(oldFormatSettings.RepeatHoursBG, 10),
		PagesToLoad: parseInt(oldFormatSettings.Pagestoload, 10),
		PagesToLoadBG: parseInt(oldFormatSettings.PagestoloadBG, 10),
		PageForBG: oldFormatSettings.PageForBG,
		DelayBG: parseInt(oldFormatSettings.DelayBG, 10),
		MinLevelBG: parseInt(oldFormatSettings.MinLevelBG, 10),
		ShowChance: (oldFormatSettings.ShowChance == 'true')
	}, function(){
		chrome.storage.sync.get(null, function (data) {
			console.log(data); 
			settings = data;
			fillSettingsDiv();
		});
	});		
}

$(document).ready(function() {

	$("#btnSetCancel").remove();

	chrome.storage.sync.get({
		HideGroups: false,
		IgnoreGroups: false,
		IgnorePinned: true,
		IgnoreGroupsBG: false,
		IgnorePinnedBG: false,
		HideEntered: false,
		PageForBG: 'wishlist',
		RepeatHoursBG: 2,
		PagesToLoad: 3,
		PagesToLoadBG: 2,
		BackgroundAJ: true,
		LevelPriorityBG: true,
		OddsPriorityBG: false,
		LastLaunchedVersion: thisVersion,
		InfiniteScrolling: true,
		ShowPoints: true,
		ShowButtons: true,
		LoadFive: false,
		HideDlc: false,
		RepeatIfOnPage: false,
		RepeatHours: 2,
		NightTheme: false,
		LevelPriority: false,
		PlayAudio: true,
		DelayBG: 10,
		MinLevelBG: 0,
		ShowChance: true
		}, function(data) {
			settings = data;

			if (data['lastLaunchedVersion'] < thisVersion){
				newVersionLaunched = true;
				changeSettingsFormat(data);
				chrome.storage.sync.set({'lastLaunchedVersion': thisVersion});
				return;
			}

			fillSettingsDiv();
		}
	);
});

function fillSettingsDiv(){

	$('#chkInfiniteScroll').prop('checked', settings.InfiniteScrolling);
	$('#chkShowPoints').prop('checked', settings.ShowPoints);
	$('#chkShowButtons').prop('checked', settings.ShowButtons);
	$('#chkLoadFive').prop('checked', settings.LoadFive);
	$('#chkHideDlc').prop('checked', settings.HideDlc);
	$('#chkNightTheme').prop('checked', settings.NightTheme);
	$('#chkLevelPriority').prop('checked', settings.LevelPriority);
	$('#chkRepeatIfOnPage').prop('checked', settings.RepeatIfOnPage);
	$('#chkHideEntered').prop('checked', settings.HideEntered);
	$('#chkHideGroups').prop('checked', settings.HideGroups);
	$('#chkIgnoreGroups').prop('checked', settings.IgnoreGroups);
	$('#chkIgnorePinned').prop('checked', settings.IgnorePinned);
	$('#chkIgnoreGroupsBG').prop('checked', settings.IgnoreGroupsBG);
	$('#chkIgnorePinnedBG').prop('checked', settings.IgnorePinnedBG);
	$('#chkEnableBG').prop('checked', settings.BackgroundAJ);
	$('#chkLevelPriorityBG').prop('checked', settings.LevelPriorityBG);
	$('#chkOddsPriorityBG').prop('checked', settings.OddsPriorityBG);
	$('#chkPlayAudio').prop('checked', settings.PlayAudio);
	$('#chkShowChance').prop('checked', settings.ShowChance);
	$('#hoursField').val(settings.RepeatHours);
	$('#pagestoload').val(settings.PagesToLoad);
	$('#pagestoloadBG').val(settings.PagesToLoadBG);
	if (settings.RepeatHoursBG == 0) { $('#hoursFieldBG').val("0.5") } else { $('#hoursFieldBG').val(settings.RepeatHoursBG) }
	$('#pageforBG').val(settings.PageForBG);
	$('#delayBG').val(settings.DelayBG);
	$('#minLevelBG').val(settings.MinLevelBG);

	
	$('#btnSetSave').click(function(){
		chrome.storage.sync.set({
			InfiniteScrolling: $('#chkInfiniteScroll').is(':checked'),
			ShowPoints: $('#chkShowPoints').is(':checked'),
			ShowButtons: $('#chkShowButtons').is(':checked'),
			LoadFive: $('#chkLoadFive').is(':checked'),
			HideDlc: $('#chkHideDlc').is(':checked'),
			RepeatIfOnPage: $('#chkRepeatIfOnPage').is(':checked'),
			NightTheme: $('#chkNightTheme').is(':checked'),
			LevelPriority: $('#chkLevelPriority').is(':checked'),
			LevelPriorityBG: $('#chkLevelPriorityBG').is(':checked'),
			OddsPriorityBG: $('#chkOddsPriorityBG').is(':checked'),
			BackgroundAJ: $('#chkEnableBG').is(':checked'),
			HideEntered: $('#chkHideEntered').is(':checked'),
			IgnoreGroups: $('#chkIgnoreGroups').is(':checked'),
			IgnorePinned: $('#chkIgnorePinned').is(':checked'),
			IgnoreGroupsBG: $('#chkIgnoreGroupsBG').is(':checked'),
			IgnorePinnedBG: $('#chkIgnorePinnedBG').is(':checked'),
			HideGroups: $('#chkHideGroups').is(':checked'),
			PlayAudio: $('#chkPlayAudio').is(':checked'),
			RepeatHours: parseInt($('#hoursField').val(), 10),
			RepeatHoursBG: parseInt($('#hoursFieldBG').val(), 10), //parseInt to save 0.5 as 0
			PagesToLoad: parseInt($('#pagestoload').val(), 10),
			PagesToLoadBG: parseInt($('#pagestoloadBG').val(), 10),
			PageForBG: $('#pageforBG').val(),
			DelayBG: parseInt($('#delayBG').val(), 10),
			MinLevelBG: parseInt($('#minLevelBG').val(), 10),
			ShowChance: $('#chkShowChance').is(':checked')
		}, function(){
			//alert("Settings Saved!");
			console.log("Settings Saved!");
		});		
	});

	//to show 0.5 when value goes below 1 in hoursFieldBG field 
	$("#hoursFieldBG").on('input', function() {
		if (this.value == 0) this.value = 0.5;
		else if (this.value % 1 != 0 & this.value > 1) {
			this.value = parseInt(this.value);
		}
	});
};
