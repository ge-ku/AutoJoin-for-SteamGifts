//Call this function when #settingsDiv is present on the page.
function loadSettings() {
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
		MinCost: 0,
		PointsToPreserve: 0,
		WishlistPriorityForMainBG: false,
		IgnorePreserveWishlistOnMainBG: false,
		ShowChance: true
		}, function(settings) {
			fillSettingsDiv(settings);
		}
	);
}

function fillSettingsDiv(settings){
	document.getElementById("chkInfiniteScroll").checked = settings.InfiniteScrolling;
	document.getElementById("chkShowPoints").checked = settings.ShowPoints;
	document.getElementById("chkShowButtons").checked = settings.ShowButtons;
	document.getElementById("chkLoadFive").checked = settings.LoadFive;
	document.getElementById("chkHideDlc").checked = settings.HideDlc;
	document.getElementById("chkNightTheme").checked = settings.NightTheme;
	//document.getElementById("chkLevelPriority").checked = settings.LevelPriority;
	document.getElementById("chkRepeatIfOnPage").checked = settings.RepeatIfOnPage;
	document.getElementById("chkHideEntered").checked = settings.HideEntered;
	document.getElementById("chkHideGroups").checked = settings.HideGroups;
	document.getElementById("chkIgnoreGroups").checked = settings.IgnoreGroups;
	document.getElementById("chkIgnorePinned").checked = settings.IgnorePinned;
	document.getElementById("chkIgnoreGroupsBG").checked = settings.IgnoreGroupsBG;
	document.getElementById("chkIgnorePinnedBG").checked = settings.IgnorePinnedBG;
	document.getElementById("chkEnableBG").checked = settings.BackgroundAJ;
	document.getElementById("chkLevelPriorityBG").checked = settings.LevelPriorityBG;
	document.getElementById("chkOddsPriorityBG").checked = settings.OddsPriorityBG;
	document.getElementById("chkPlayAudio").checked = settings.PlayAudio;
	document.getElementById("chkShowChance").checked = settings.ShowChance;
	document.getElementById("hoursField").value = settings.RepeatHours;
	document.getElementById("pagestoload").value = settings.PagesToLoad;
	document.getElementById("pagestoloadBG").value = settings.PagesToLoadBG;
	document.getElementById("pageforBG").value = settings.PageForBG;
	document.getElementById("delayBG").value = settings.DelayBG;
	document.getElementById("minLevelBG").value = settings.MinLevelBG;
	document.getElementById("minCost").value = settings.MinCost;
	document.getElementById("pointsToPreserve").value = settings.PointsToPreserve;
	document.getElementById("chkWishlistPriorityForMainBG").checked = settings.WishlistPriorityForMainBG;
	document.getElementById("chkIgnorePreserveWishlistOnMainBG").checked = settings.IgnorePreserveWishlistOnMainBG;
	if (settings.RepeatHoursBG == 0) { 
		document.getElementById("hoursFieldBG").value = "0.5"; 
	} else { 
		document.getElementById("hoursFieldBG").value = settings.RepeatHoursBG; 
	}

	settingsAttachEventListeners();
}

function settingsAttachEventListeners(){
	var saveButtonEl = document.getElementById("btnSetSave");
	saveButtonEl.addEventListener("click", function(){
		chrome.storage.sync.set({
			InfiniteScrolling: document.getElementById("chkInfiniteScroll").checked,
			ShowPoints: document.getElementById("chkShowPoints").checked,
			ShowButtons: document.getElementById("chkShowButtons").checked,
			LoadFive: document.getElementById("chkLoadFive").checked,
			HideDlc: document.getElementById("chkHideDlc").checked,
			RepeatIfOnPage: document.getElementById("chkRepeatIfOnPage").checked,
			NightTheme: document.getElementById("chkNightTheme").checked,
			//LevelPriority: document.getElementById("chkLevelPriority").checked,
			LevelPriorityBG: document.getElementById("chkLevelPriorityBG").checked,
			OddsPriorityBG: document.getElementById("chkOddsPriorityBG").checked,
			BackgroundAJ: document.getElementById("chkEnableBG").checked,
			HideEntered: document.getElementById("chkHideEntered").checked,
			IgnoreGroups: document.getElementById("chkIgnoreGroups").checked,
			IgnorePinned: document.getElementById("chkIgnorePinned").checked,
			IgnoreGroupsBG: document.getElementById("chkIgnoreGroupsBG").checked,
			IgnorePinnedBG: document.getElementById("chkIgnorePinnedBG").checked,
			HideGroups: document.getElementById("chkHideGroups").checked,
			PlayAudio: document.getElementById("chkPlayAudio").checked,
			RepeatHours: document.getElementById("hoursField").value,
			RepeatHoursBG: parseInt(document.getElementById("hoursFieldBG").value, 10),
			PagesToLoad: parseInt(document.getElementById("pagestoload").value, 10),
			PagesToLoadBG: parseInt(document.getElementById("pagestoloadBG").value, 10),
			PageForBG: document.getElementById("pageforBG").value,
			DelayBG: parseInt(document.getElementById("delayBG").value, 10),
			MinLevelBG: parseInt(document.getElementById("minLevelBG").value, 10),
			MinCost: parseInt(document.getElementById("minCost").value, 10),
			PointsToPreserve: parseInt(document.getElementById("pointsToPreserve").value, 10),
			WishlistPriorityForMainBG: document.getElementById("chkWishlistPriorityForMainBG").checked,
			IgnorePreserveWishlistOnMainBG: document.getElementById("chkIgnorePreserveWishlistOnMainBG").checked,
			ShowChance: document.getElementById("chkShowChance").checked
		}, function(){
			if (location.protocol == "chrome-extension:"){
				saveButtonEl.innerText = "Settings Saved!";
				saveButtonEl.disabled = true;
				setTimeout(function(){ 
					saveButtonEl.innerText = "Save";
					saveButtonEl.disabled = false;
				}, 500);
			} else {
				location.reload();
			}
		});
	});

	//to show 0.5 when value goes below 1 in hoursFieldBG field 
	document.getElementById("hoursFieldBG").addEventListener("input", function() {
		console.log(this.value);
		if (this.value == 0) this.value = 0.5;
		else if (this.value % 1 != 0 && this.value > 1) {
			this.value = parseInt(this.value);
		}
	});

	var settingsCancelElements = document.getElementsByClassName("settingsCancel");
	Array.from(settingsCancelElements).forEach(function(element){
		element.addEventListener("click", function(){
			var settingsShadeEl = document.getElementById("settingsShade");
			var settingsDivEl = document.getElementById("settingsDiv");
			settingsShadeEl.classList.remove("fadeIn");
			settingsShadeEl.classList.add("fadeOut");
			settingsDivEl.classList.remove("fadeIn");
			settingsDivEl.classList.add("fadeOut");
		});
	});
	
	fitSettings();
}


/*This is for case when window.innerHeight is less than settings div height.*/
function fitSettings(){
	if (window.innerHeight < document.getElementById("settingsDiv").clientHeight) {
		document.getElementById("settingsDiv").className += " fit";
	}
}
