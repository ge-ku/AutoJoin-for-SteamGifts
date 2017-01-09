/*How about make a human readable script, then pass it to jsmin or closure for release?
https://developers.google.com/closure/compiler/
This script page is the background script. autoentry.js is the autojoin button and other page
modifications*/

function Giveaway(code, level, appid, odds) {
    this.code = code, this.level = level, this.steamlink = appid, this.odds = odds
}

function compareLevel(a, b) {
    return b.level - a.level
}

function compareOdds(a, b) {
	return b.odds - a.odds
}

function calculateWinChance(giveaway, timeLoaded) {
	var timeLeft = parseInt( $(giveaway).find('.fa.fa-clock-o').next('span').attr('data-timestamp') ) - timeLoaded; // time left in seconds
	var timePassed = timeLoaded - parseInt( $(giveaway).find('.giveaway__username').prev('span').attr('data-timestamp') ); //time passed in seconds
	var numberOfEntries = parseInt( $(giveaway).find('.fa-tag').next('span').text().replace(',', '') );
	var numberOfCopies = 1;
	if ($(giveaway).find('.giveaway__heading__thin:first').text().replace(',', '').match(/\(\d+ Copies\)/)) { // if more than one copy there's a text field "(N Copies)"
		numberOfCopies = parseInt( $(giveaway).find('.giveaway__heading__thin:first').text().replace(',', '').match(/\d+/)[0] );
	}
	var predictionOfEntries = (numberOfEntries / timePassed) * timeLeft; // calculate rate of entries and multiply on time left, probably not very accurate as we assume linear rate
	var chance = (1 / (numberOfEntries + 1 + predictionOfEntries)) * 100 * numberOfCopies;
	return chance;
}

function notify() {
    chrome.notifications.clear("won_notification", function() {
        var e = {
            type: "basic",
            title: "AutoJoin",
            message: "You won! Click here to open steamgifts.com",
            iconUrl: "autologosteam.png"
        };
        chrome.notifications.create("won_notification", e, function() {
			chrome.storage.sync.get({PlayAudio: 'true'}, function (data) {
				if (data.PlayAudio == 'true'){
					var e = new Audio("audio.mp3");
					e.play()
				}
			});
        })
    })
}

/*This function scans the pages and calls the function pagesloaded() once it finished
All giveaways that must be entered are pushed in an array called "arr"
Remember once scanpage is over, pagesloaded is called*/
function scanpage(e) {
	var timeLoaded = Math.round(Date.now() / 1000);
    var postsDiv = $(e).find(':not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap').parent();
    (settingsIgnorePinnedBG == true ? postsDiv : $(e)).find(".giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name").each(function() {
        var e = $(this).parent().parent().parent(),
            t = this.href.match(/giveaway\/(.+)\//);
        if (t.length > 0) {
            var GAcode = t[1];
            if (!(settingsIgnoreGroupsBGTrue && 0 != $(this).find(".giveaway__column--group").length || $(e).find(".giveaway__column--contributor-level--negative").length > 0)) {
                if ($(e).find(".giveaway__column--contributor-level--positive").length > 0) var GAlevel = $(e).find(".giveaway__column--contributor-level--positive").html().match(/(\d+)/)[1];
                else var GAlevel = 0;
                var s = $(e).find(".global__image-outer-wrap--game-medium").find(".global__image-inner-wrap").css("background-image");
                if (null == s) var GAsteamAppID = "0";
                else {
                    var i = s.match(/.+apps\/(\d+)\/cap.+/);
                    if (null == i) var GAsteamAppID = "0";
                    else var GAsteamAppID = i[1]
                }
				var oddsOfWinning = calculateWinChance(e, timeLoaded);
                arr.push(new Giveaway(GAcode, parseInt(GAlevel), GAsteamAppID, oddsOfWinning));
            }
        }
    }), pagestemp--, 0 == pagestemp && pagesloaded()
}

/*This function is called once all pages have been parsed
this sends the requests to steamgifts*/
function pagesloaded() {
	if (settingsLevelPriorityBG) {
		arr.sort(compareLevel);
	} else if (settingsOddsPriorityBG) {
		arr.sort(compareOdds);
	}
	var timeouts = [];
	$.each(arr, function(e) {
		if (arr[e].level < settingsMinLevelBG) { // this may be unnecessary since level_min search parameter https://www.steamgifts.com/discussion/5WsxS/new-search-parameters
			return true;
		}
		timeouts.push(setTimeout(function(){
			console.log(arr[e]), $.post("https://www.steamgifts.com/ajax.php", {
				xsrf_token: token,
				"do": "entry_insert",
				code: arr[e].code
			}, function(response){
				var json_response = jQuery.parseJSON(response);
				if (json_response.points < 5) {
					for (var i = 0; i < timeouts.length; i++) {
						clearTimeout(timeouts[i]);
					}
					timeouts = [];
				}
			})
		}, e * settingsDelayBG * 1000 + Math.floor(Math.random()*2001)));
    }), console.log(arr.length)
}

/*This function checks for a won gift, then calls the scanpage function*/
/*e is the whole html page*/
function settingsloaded() {
		if (settingsIgnoreGroupsBG && settingsPageForBG == "all") {
			settingsIgnoreGroupsBGTrue = true;
		}
		pages = settingsPagestoloadBG;
		timetopass = 10 * settingsRepeatHoursBG;
		if (justLaunched || settingsRepeatHoursBG == 0) { // settingsRepeatHoursBG == 0 means it should autojoin every time
			justLaunched = false;
			timepassed = timetopass;
		} else {
			timepassed += 5;
		}

		/*If background autojoin is disabled or not enough time passed only check if won*/
		if (settingsBackgroundAJ == false || timepassed < timetopass) {
			$.get(link + 1, function(data){
				if ( $(data).filter(".popup--gift-received").length ) {
					notify();
				}
				//check level and save if changed
				mylevel = $(data).find('a[href="/account"]').find("span").next().html().match(/(\d+)/)[1];
				if (settingsLastKnownLevel != parseInt(mylevel)) {
					chrome.storage.sync.set({LastKnownLevel:mylevel});
				}
			});
		}
		/*Else check if won first (since pop-up disappears after first view), then start scanning pages*/
		else {
			timepassed = 0; //reset timepassed
			link = "https://www.steamgifts.com/giveaways/search?type=" + settingsPageForBG + "&level_min=" + settingsMinLevelBG + "&level_max=" + settingsLastKnownLevel + "&page=";
			arr.length = 0;
			$.get(link + 1, function(data) {
				if ( $(data).filter(".popup--gift-received").length ) {
					notify();
				}
				if (pages > 5 || pages < 1) { pagestemp = 3 } else { pagestemp = pages } // in case someone has old setting with more than 5 pages to load or somehow set this value to <1 use 3 (default)
				token = $(data).find("input[name=xsrf_token]").val();
				mylevel = $(data).find('a[href="/account"]').find("span").next().html().match(/(\d+)/)[1];
				//save new level if it changed
				if (settingsLastKnownLevel != parseInt(mylevel)) {
					chrome.storage.sync.set({LastKnownLevel:mylevel});
				}
				scanpage(data); // scan this page that was already loaded to get info above
				for (var n = 2; n <= pages; n++) { // scan next pages
					if (n > 3) break; // no more than 3 pages at a time since the ban wave
					$.get(link + n, function(newPage) {
						scanpage(newPage)
					})
				}
			});
		}
}

/*Load settings, then call settingsloaded()*/
function loadsettings() {
	chrome.storage.sync.get({
		PageForBG: 'wishlist',
		RepeatHoursBG: '2',
		DelayBG: '2',
		MinLevelBG: '0',
		PagestoloadBG: '3',
		BackgroundAJ: 'true',
		LevelPriorityBG: 'true',
		OddsPriorityBG: 'fasle',
		IgnoreGroupsBG: 'false',
		IgnorePinnedBG: 'false',
		LastKnownLevel: '10' // set to 10 by default so it loads pages with max_level set to 10 (maximum) before extensions learns actual level
		}, function(data) {
			settingsPageForBG = data['PageForBG'];
			settingsRepeatHoursBG = parseInt(data['RepeatHoursBG'], 10);
			settingsDelayBG = parseInt(data['DelayBG'], 10);
			settingsMinLevelBG = parseInt(data['MinLevelBG'], 10);
			settingsPagestoloadBG = parseInt(data['PagestoloadBG'], 10);
			settingsBackgroundAJ = (data['BackgroundAJ'] == 'true');
			settingsLevelPriorityBG = (data['LevelPriorityBG'] == 'true');
			settingsOddsPriorityBG = (data['OddsPriorityBG'] == 'true');
			settingsIgnoreGroupsBG = (data['IgnoreGroupsBG'] == 'true');
			settingsIgnorePinnedBG = (data['IgnorePinnedBG'] == 'true');
			settingsLastKnownLevel = parseInt(data['LastKnownLevel'], 10);
			settingsloaded();
		}
	);
}

/*Function declarations over*/

/*It all begins with the loadsettings call*/
chrome.alarms.onAlarm.addListener(function(e) {
    console.log("Alarm fired."), "routine" == e.name && (loadsettings(), chrome.alarms.create("routine", {
        delayInMinutes: 30
    }))
});

/*Variables declaration*/
/*At the end of the line, there are sometimes colons, sometimes semicolons.
Is this for optimization purposes, or just a mistake?*/
var arr = [],
    link = "https://www.steamgifts.com/giveaways/search?page=",
    pages = 1,
    pagestemp = pages,
    token = "",
    mylevel = 0,
    varcount = 0,
    timepassed = 0,
    timetopass = 20,
    justLaunched = true,
    settingsIgnoreGroupsBGTrue = false,
    settingsIgnoreGroupsBG = false,
    settingsLevelPriorityBG = false,
	settingsOddsPriorityBG = false,
    settingsBackgroundAJ = true,
    settingsPagestoloadBG = 3,
    settingsPageForBG = "all",
    settingsRepeatHoursBG = 2,
	settingsDelayBG = 2,
    settingsMinLevelBG = 0,
	settingsIgnorePinnedBG = false;
	settingsLastKnownLevel = 10;

/*Creating a new tab if notification is clicked*/
chrome.alarms.create("routine", {
    delayInMinutes: .1
}), chrome.notifications.onClicked.addListener(function() {
	chrome.windows.getCurrent(function(currentWindow) {
		if (currentWindow != null) {
			return chrome.tabs.create({
				url: "https://www.steamgifts.com/giveaways/won"
			});
		} else {
			return chrome.windows.create({
				url: "https://www.steamgifts.com/giveaways/won",
				type: "normal",
				focused: true
			});
		}
	})
});