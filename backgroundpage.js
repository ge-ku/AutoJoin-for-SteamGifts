/*How about make a human readable script, then pass it to jsmin or closure for release?
https://developers.google.com/closure/compiler/
This script page is the background script. autoentry.js is the autojoin button and other page
modifications*/

function Giveaway(e, t, n) {
    this.code = e, this.level = t, this.steamlink = n
}

function compare(e, t) {
    return e.level < t.level ? 1 : e.level > t.level ? -1 : 0
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
All giveaways that must be entered are pushed in an array called "arr"*/
function scanpage(e) {
    var postsDiv = $(e).find(':not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap').parent();
    (settingsIgnorePinnedBG == true ? postsDiv : $(e)).find(".giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name").each(function() {
        var e = $(this).parent().parent().parent(),
            t = this.href.match(/giveaway\/(.+)\//);
        if (t.length > 0) {
            var n = t[1];
            if (!(settingsIgnoreGroupsBGTrue && 0 != $(this).find(".giveaway__column--group").length || $(e).find(".giveaway__column--contributor-level--negative").length > 0)) {
                if ($(e).find(".giveaway__column--contributor-level--positive").length > 0) var o = $(e).find(".giveaway__column--contributor-level--positive").html().match(/(\d+)/)[1];
                else var o = 0;
                var s = $(e).find(".global__image-outer-wrap--game-medium").find(".global__image-inner-wrap").css("background-image");
                if (null == s) var a = "0";
                else {
                    var i = s.match(/.+apps\/(\d+)\/cap.+/);
                    if (null == i) var a = "0";
                    else var a = i[1]
                }
                arr.push(new Giveaway(n, parseInt(o, 10), a))
            }
        }
    }), pagestemp--, 0 == pagestemp && pagesloaded()
}

/*This function loads pages and scans them with the function above
Remember once scanpage is over, pagesloaded is called*/
function loadnextpages(e, t) {
    for (var n = 2; !(n > t); n++) { 
		if (n > 3) break;
		$.get(link + n, function(e) {
		    scanpage(e)
		})
	}
}

/*This function is called once all pages have been parsed
this sends the requests to steamgifts*/
function pagesloaded() {
    settingsLevelPriorityBG && arr.sort(compare);
	var timeouts = [];
	$.each(arr, function(e) {
		if (arr[e].level < settingsMinLevelBG) {
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
    settingsIgnoreGroupsBG && "all" == settingsPageForBG && (settingsIgnoreGroupsBGTrue = !0), pages = settingsPagestoloadBG, timetopass = 10 * settingsRepeatHoursBG, justLaunched ? (justLaunched = !1, timepassed = timetopass) : timepassed += 5, 0 == settingsBackgroundAJ || timetopass > timepassed ? $.get(link + 1, function(e){
        var t = $(e).filter(".popup--gift-received").get(0);
        "undefined" != typeof $(t).html() && notify()
    }) : (timepassed = 0, link = "https://www.steamgifts.com/giveaways/search?type=" + settingsPageForBG + "&page=", arr.length = 0, $.get(link + 1, function(e) {
        if (pages > 5 || pages < 1) { pagestemp = 3 } else { pagestemp = pages }
		token = $(e).find("input[name=xsrf_token]").val(), mylevel = $(e).find('a[href="/account"]').find("span").next().html().match(/(\d+)/)[1];
        var t = $(e).filter(".popup--gift-received").get(0);
        "undefined" != typeof $(t).html() && notify(), scanpage(e), pages > 1 && loadnextpages(link, pages)
    }))
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
		IgnoreGroupsBG: 'false',
		IgnorePinnedBG: 'false'
		}, function(data) {
			settingsPageForBG = data['PageForBG'];
			settingsRepeatHoursBG = parseInt(data['RepeatHoursBG'], 10);
			settingsDelayBG = parseInt(data['DelayBG'], 10);
			settingsMinLevelBG = parseInt(data['MinLevelBG'], 10);
			settingsPagestoloadBG = parseInt(data['PagestoloadBG'], 10);
			if (data['BackgroundAJ'] == 'true'){ settingsBackgroundAJ = true }
			if (data['LevelPriorityBG'] == 'true'){	settingsLevelPriorityBG = true }
			if (data['IgnoreGroupsBG'] == 'true'){ settingsIgnoreGroupsBG = true }
			if (data['IgnorePinnedBG'] == 'true'){ settingsIgnorePinnedBG = true }
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
    justLaunched = !0,
    settingsIgnoreGroupsBGTrue = !1,
    settingsIgnoreGroupsBG = !1,
    settingsLevelPriorityBG = !1,
    settingsBackgroundAJ = !0,
    settingsPagestoloadBG = 3,
    settingsPageForBG = "all",
    settingsRepeatHoursBG = 2,
	settingsDelayBG = 2,
    settingsMinLevelBG = 0,
	settingsIgnorePinnedBG = !1;

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