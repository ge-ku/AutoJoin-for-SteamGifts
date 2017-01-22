var newVersionLaunched = false;
var settingsInfiniteScrolling = false;
var settingsShowPoints = false;
var settingsShowButtons = false;
var settingsLoadFive = false;
var settingsHideDlc = false;
var settingsRepeatIfOnPage = false;
var settingsRepeatHours = 2;
var settingsNightTheme = false;
var settingsLevelPriority = false;
var settingsBackgroundAJ = false;
var settingsLevelPriorityBG = false;
var settingsOddsPriorityBG = false;
var settingsHideEntered = false;
var settingsPagestoload = 3;
var settingsPagestoloadBG = 2;
var settingsPageForBG = "wishlist";
var settingsRepeatHoursBG = 2;
var settingsHideGroups = false;
var settingsIgnoreGroups = false;
var settingsIgnoreGroupsBG = false;
var settingsIgnorePinnedBG = false;
var settingsPlayAudio = true;
var settingsDelayBG = 10;
var settingsMinLevelBG = 0;
var settingsIgnorePinned = false;
var settingsShowChance = true;

$(document).ready(function() {

	$("#btnSetCancel").remove();

	chrome.storage.sync.get({
		HideGroups: 'false',
		IgnoreGroups: 'false',
		IgnorePinned: 'true',
		IgnoreGroupsBG: 'false',
		IgnorePinnedBG: 'false',
		HideEntered: 'false',
		PageForBG: 'wishlist',
		RepeatHoursBG: '2',
		Pagestoload: '3',
		PagestoloadBG: '2',
		BackgroundAJ: 'true',
		LevelPriorityBG: 'true',
		OddsPriorityBG: 'false',
		lastLaunchedVersion: '20160226',
		infiniteScrolling: 'true',
		showPoints: 'true',
		showButtons: 'true',
		loadFive: 'false',
		hideDlc: 'false',
		repeatIfOnPage: 'false',
		repeatHours: '2',
		nightTheme: 'false',
		levelPriority: 'false',
		PlayAudio: 'true',
		DelayBG: '10',
		MinLevelBG: '0',
		ShowChance: 'true'
		}, function(data) {
			settingsHideGroups = (data['HideGroups'] == 'true');
			settingsIgnoreGroups = (data['IgnoreGroups'] == 'true');
			settingsIgnorePinned = (data['IgnorePinned'] == 'true');
			settingsIgnoreGroupsBG = (data['IgnoreGroupsBG'] == 'true');
			settingsIgnorePinnedBG = (data['IgnorePinnedBG'] == 'true');
			settingsHideEntered = (data['HideEntered'] == 'true');
			settingsPageForBG = data['PageForBG'];
			settingsRepeatHoursBG = parseInt(data['RepeatHoursBG'], 10);
			settingsPagestoload = parseInt(data['Pagestoload'], 10);
			settingsPagestoloadBG = parseInt(data['PagestoloadBG'], 10);
			settingsDelayBG = parseInt(data['DelayBG'], 10);
			settingsMinLevelBG = parseInt(data['MinLevelBG'], 10);
			settingsBackgroundAJ = (data['BackgroundAJ'] == 'true');
			settingsLevelPriorityBG = (data['LevelPriorityBG'] == 'true');
			settingsOddsPriorityBG = (data['OddsPriorityBG'] == 'true');
			if (!(parseInt(data['lastLaunchedVersion'], 10) < 20160226)){
				newVersionLaunched = true;
				chrome.storage.sync.set({'lastLaunchedVersion': '20160226'});
			}
			settingsInfiniteScrolling = (data['infiniteScrolling'] == 'true');
			settingsShowPoints = (data['showPoints'] == 'true');
			settingsShowButtons = (data['showButtons'] == 'true');
			settingsLoadFive = (data['loadFive'] == 'true');
			settingsHideDlc = (data['hideDlc'] == 'true');
			settingsRepeatIfOnPage = (data['repeatIfOnPage'] == 'true');
			settingsRepeatHours = parseInt(data['repeatHours'], 10);
			settingsNightTheme = (data['nightTheme'] == 'true');
			settingsLevelPriority = (data['levelPriority'] == 'true');
			settingsPlayAudio = (data['PlayAudio'] == 'true');
			settingsShowChance = (data['ShowChance'] == 'true');

			fillSettingsDiv();
		}
	);
});

function fillSettingsDiv(){

	if (settingsInfiniteScrolling){$('#chkInfiniteScroll').prop('checked', true)};
	if (settingsShowPoints){$('#chkShowPoints').prop('checked', true)};
	if (settingsShowButtons){$('#chkShowButtons').prop('checked', true)};
	if (settingsLoadFive){$('#chkLoadFive').prop('checked', true)};
	if (settingsHideDlc){$('#chkHideDlc').prop('checked', true)};
	if (settingsNightTheme){$('#chkNightTheme').prop('checked', true)};
	if (settingsLevelPriority){$('#chkLevelPriority').prop('checked', true)};
	if (settingsRepeatIfOnPage){$('#chkRepeatIfOnPage').prop('checked', true)};
	if (settingsHideEntered){$('#chkHideEntered').prop('checked', true)};
	if (settingsHideGroups){$('#chkHideGroups').prop('checked', true)};
	if (settingsIgnoreGroups){$('#chkIgnoreGroups').prop('checked', true)};
	if (settingsIgnorePinned){$('#chkIgnorePinned').prop('checked', true)};
	if (settingsIgnoreGroupsBG){$('#chkIgnoreGroupsBG').prop('checked', true)};
	if (settingsIgnorePinnedBG){$('#chkIgnorePinnedBG').prop('checked', true)};
	if (settingsBackgroundAJ){$('#chkEnableBG').prop('checked', true)};
	if (settingsLevelPriorityBG){$('#chkLevelPriorityBG').prop('checked', true)};
	if (settingsOddsPriorityBG){$('#chkOddsPriorityBG').prop('checked', true)};
	if (settingsPlayAudio){$('#chkPlayAudio').prop('checked', true)};
	if (settingsShowChance){$('#chkShowChance').prop('checked', true)};
	$('#hoursField').val(settingsRepeatHours);
	$('#pagestoload').val(settingsPagestoload);
	$('#pagestoloadBG').val(settingsPagestoloadBG);
	if (settingsRepeatHoursBG == 0) { $('#hoursFieldBG').val("0.5") } else { $('#hoursFieldBG').val(settingsRepeatHoursBG) }
	$('#pageforBG').val(settingsPageForBG);
	$('#delayBG').val(settingsDelayBG);
	$('#minLevelBG').val(settingsMinLevelBG);

	
	$('#btnSetSave').click(function(){
		chrome.storage.sync.set({
			infiniteScrolling: $('#chkInfiniteScroll').is(':checked').toString(),
			showPoints: $('#chkShowPoints').is(':checked').toString(),
			showButtons: $('#chkShowButtons').is(':checked').toString(),
			loadFive: $('#chkLoadFive').is(':checked').toString(),
			hideDlc: $('#chkHideDlc').is(':checked').toString(),
			repeatIfOnPage: $('#chkRepeatIfOnPage').is(':checked').toString(),
			nightTheme: $('#chkNightTheme').is(':checked').toString(),
			levelPriority: $('#chkLevelPriority').is(':checked').toString(),
			LevelPriorityBG: $('#chkLevelPriorityBG').is(':checked').toString(),
			OddsPriorityBG: $('#chkOddsPriorityBG').is(':checked').toString(),
			BackgroundAJ: $('#chkEnableBG').is(':checked').toString(),
			HideEntered: $('#chkHideEntered').is(':checked').toString(),
			IgnoreGroups: $('#chkIgnoreGroups').is(':checked').toString(),
			IgnorePinned: $('#chkIgnorePinned').is(':checked').toString(),
			IgnoreGroupsBG: $('#chkIgnoreGroupsBG').is(':checked').toString(),
			IgnorePinnedBG: $('#chkIgnorePinnedBG').is(':checked').toString(),
			HideGroups: $('#chkHideGroups').is(':checked').toString(),
			PlayAudio: $('#chkPlayAudio').is(':checked').toString(),
			repeatHours: $('#hoursField').val(),
			RepeatHoursBG: parseInt($('#hoursFieldBG').val()), //parseInt to save 0.5 as 0
			Pagestoload: $('#pagestoload').val(),
			PagestoloadBG: $('#pagestoloadBG').val(),
			PageForBG: $('#pageforBG').val(),
			DelayBG: $('#delayBG').val(),
			MinLevelBG: $('#minLevelBG').val(),
			ShowChance: $('#chkShowChance').is(':checked').toString()
		}, function(){
			alert("Settings Saved!")
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
