/*How about make a human readable script, then pass it to jsmin or closure for release?
https://developers.google.com/closure/compiler/
This script page is the background script. autoentry.js is the autojoin button and other page
modifications*/

function Giveaway(code, level, appid, odds, cost) {
    this.code = code, this.level = level, this.steamlink = appid, this.odds = odds, this.cost = cost
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
    (settings.IgnorePinnedBG == true ? postsDiv : $(e)).find(".giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name").each(function() {
        var e = $(this).parent().parent().parent(),
            t = this.href.match(/giveaway\/(.+)\//);
        if (t.length > 0) {
            var GAcode = t[1];
            if (!(settings.IgnoreGroupsBG && 0 != $(this).find(".giveaway__column--group").length || $(e).find(".giveaway__column--contributor-level--negative").length > 0)) {
                if ($(e).find(".giveaway__column--contributor-level--positive").length > 0) var GAlevel = $(e).find(".giveaway__column--contributor-level--positive").html().match(/(\d+)/)[1];
                else var GAlevel = 0;
                var s = $(e).find(".global__image-outer-wrap--game-medium").find(".global__image-inner-wrap").css("background-image");
                if (null == s) var GAsteamAppID = "0";
                else {
                    var i = s.match(/.+apps\/(\d+)\/cap.+/);
                    if (null == i) var GAsteamAppID = "0";
                    else var GAsteamAppID = i[1]
                }
            	var cost = $(e).find(".giveaway__heading__thin").last().html().match(/\d+/)[0];
				var oddsOfWinning = calculateWinChance(e, timeLoaded);
                arr.push(new Giveaway(GAcode, parseInt(GAlevel), GAsteamAppID, oddsOfWinning, parseInt(cost)));
            }
        }
    }), pagestemp--, 0 == pagestemp && pagesloaded()
}

/*This function is called once all pages have been parsed
this sends the requests to steamgifts*/
function pagesloaded() {
	if (settings.LevelPriorityBG) {
		arr.sort(compareLevel);
	} else if (settings.OddsPriorityBG) {
		arr.sort(compareOdds);
	}
	var currPoints=0;
	$.get("https://www.steamgifts.com/", function(data) {
		currPoints = parseInt($(data).find('a[href="/account"]').find("span.nav__points").text(), 10);
		}).done(function(){
			console.log('Current Points: ' + currPoints);
			if(currPoints >= settings.PointsToPreserve){
				var timeouts = [];
				$.each(arr, function(e) {
					if (arr[e].level < settings.MinLevelBG) { // this may be unnecessary since level_min search parameter https://www.steamgifts.com/discussion/5WsxS/new-search-parameters
						return true;
					}
					if (arr[e].cost < settings.MinCost){
						return true;
					}
					timeouts.push(setTimeout(function(){
						console.log(arr[e]), $.post("https://www.steamgifts.com/ajax.php", {
							xsrf_token: token,
							"do": "entry_insert",
							code: arr[e].code
						}, function(response){
							var json_response = jQuery.parseJSON(response);
							if (json_response.points < settings.PointsToPreserve || json_response.msg == "Not Enough Points") {
								for (var i = 0; i < timeouts.length; i++) {
									clearTimeout(timeouts[i]);
								}
								timeouts = [];
							}
						})
					}, e * settings.DelayBG * 1000 + Math.floor(Math.random()*2001)));
				}), console.log(arr.length)
			}
		})
}

/*This function checks for a won gift, then calls the scanpage function*/
/*e is the whole html page*/
function settingsloaded() {
		if (settings.IgnoreGroupsBG && settings.PageForBG == "all") {
			settings.IgnoreGroupsBG = true;
		}
		pages = settings.PagesToLoadBG;
		timetopass = 10 * settings.RepeatHoursBG;
		if (justLaunched || settings.RepeatHoursBG == 0) { // settings.RepeatHoursBG == 0 means it should autojoin every time
			justLaunched = false;
			timepassed = timetopass;
		} else {
			timepassed += 5;
		}

		/*If background autojoin is disabled or not enough time passed only check if won*/
		if (settings.BackgroundAJ == false || timepassed < timetopass) {
			$.get(link + 1, function(data){
				if ( $(data).filter(".popup--gift-received").length ) {
					notify();
				}
				//check level and save if changed
				mylevel = $(data).find('a[href="/account"]').find("span").next().html().match(/(\d+)/)[1];
				if (settings.LastKnownLevel != parseInt(mylevel)) {
					chrome.storage.sync.set({LastKnownLevel: parseInt(mylevel, 10)});
				}
			});
		}
		/*Else check if won first (since pop-up disappears after first view), then start scanning pages*/
		else {
			timepassed = 0; //reset timepassed
			link = "https://www.steamgifts.com/giveaways/search?type=" + settings.PageForBG + "&level_min=" + settings.MinLevelBG + "&level_max=" + settings.LastKnownLevel + "&page=";
			arr.length = 0;
			$.get(link + 1, function(data) {
				if ( $(data).filter(".popup--gift-received").length ) {
					notify();
				}
				if (pages > 5 || pages < 1) { pagestemp = 3 } else { pagestemp = pages } // in case someone has old setting with more than 5 pages to load or somehow set this value to <1 use 3 (default)
				token = $(data).find("input[name=xsrf_token]").val();
				mylevel = $(data).find('a[href="/account"]').find("span").next().html().match(/(\d+)/)[1];
				//save new level if it changed
				if (settings.LastKnownLevel != parseInt(mylevel)) {
					chrome.storage.sync.set({LastKnownLevel: parseInt(mylevel)});
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
		RepeatHoursBG: 2,
		DelayBG: 10,
		MinLevelBG: 0,
		MinCost: 0,
		PointsToPreserve: 0,
		PagesToLoadBG: 3,
		BackgroundAJ: true,
		LevelPriorityBG: true,
		OddsPriorityBG: false,
		IgnoreGroupsBG: false,
		IgnorePinnedBG: false,
		LastKnownLevel: 10, // set to 10 by default so it loads pages with max_level set to 10 (maximum) before extensions learns actual level
		lastLaunchedVersion: thisVersion
		}, function(data) {	
			settings = data;
			settingsloaded();
		}
	);
}


/*Function declarations over*/

/*It all begins with the loadsettings call*/
chrome.alarms.onAlarm.addListener(function(alarm) {
    console.log("Alarm fired.")
	if (alarm.name == "routine") {
		loadsettings();
		chrome.alarms.create("routine", {
			delayInMinutes: 30
		});
	}
});

/*Variables declaration*/
var arr = [],
	settings,
    link = "https://www.steamgifts.com/giveaways/search?page=",
    pages = 1,
    pagestemp = pages,
    token = "",
    mylevel = 0,
    varcount = 0,
    timepassed = 0,
    timetopass = 20,
    justLaunched = true,
    thisVersion = 20170225;

/*Create first alarm as soon as possible*/
chrome.alarms.create("routine", {
    delayInMinutes: .1
});

/*Creating a new tab if notification is clicked*/
chrome.notifications.onClicked.addListener(function() {
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
