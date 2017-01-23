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
		chrome.storage.sync.get(null, function (settings) {
			fillSettingsDiv(settings);
		});
	});		
}

//Call this function when #settingsDiv is present on the page.
function loadSettings() {
	var newVersionLaunched = false;
	var thisVersion = 20170101;

	//remove "Cancel" button if opened from Chrome settings
	if (location.protocol == "chrome-extension:"){
		$("#btnSetCancel").remove();
	}

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
		}, function(settings) {

			if (settings.lastLaunchedVersion < thisVersion){
				newVersionLaunched = true;
				changeSettingsFormat(settings);
				chrome.storage.sync.set({'lastLaunchedVersion': thisVersion});
				return;
			}

			fillSettingsDiv(settings);
		}
	);
}

function fillSettingsDiv(settings){
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

	settingsAttachEventListeners();
}

function settingsAttachEventListeners(){
	
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
			if (location.protocol == "chrome-extension:"){
				$('#btnSetSave').attr('disabled', true).text("Settings Saved!");
				setTimeout(function(){ 
					$('#btnSetSave').removeAttr('disabled').text("Save");
				}, 500);
			} else {
				location.reload();
			}
		});
	});

		//to show 0.5 when value goes below 1 in hoursFieldBG field 
	$("#hoursFieldBG").on('input', function() {
		if (this.value == 0) this.value = 0.5;
		else if (this.value % 1 != 0 & this.value > 1) {
			this.value = parseInt(this.value);
		}
	});

	$('.settingsCancel').click(function(){
		$("#settingsShade").animate({opacity:0.0}, 200);
		$("#settingsDiv").animate({opacity: 0.0}, {
			easing: 'swing',
			duration: 200,
			complete: function() {
				$("#settingsShade").css("visibility","hidden");
				$("#settingsDiv").css("visibility","hidden");
			}
		});
	});

}