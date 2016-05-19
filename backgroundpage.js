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

function scanpage(e) {
    $(e).find(".giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name").each(function() {
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

function loadnextpages(e, t) {
    for (var n = 2; !(n > t); n++) $.get(link + n, function(e) {
        scanpage(e)
    })
}

function pagesloaded() {
    settingsLevelPriorityBG && arr.sort(compare);
	var timeouts = [];
	$.each(arr, function(e) {
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
		}, e * 5000));
    }), console.log(arr.length)
}

function settingsloaded() {
    settingsIgnoreGroupsBG && "all" == settingsPageForBG && (settingsIgnoreGroupsBGTrue = !0), pages = settingsPagestoloadBG, timetopass = 10 * settingsRepeatHoursBG, justLaunched ? (justLaunched = !1, timepassed = timetopass) : timepassed += 5, 0 == settingsBackgroundAJ || timetopass > timepassed ? $.get(link + 1, function(e) {
        var t = $(e).filter(".popup--gift-received").get(0);
        "undefined" != typeof $(t).html() && notify()
    }) : (timepassed = 0, link = "https://www.steamgifts.com/giveaways/search?type=" + settingsPageForBG + "&page=", arr.length = 0, $.get(link + 1, function(e) {
        if (pages > 5 || pages < 1) { pagestemp = 3 } else { pagestemp = pages }
		token = $(e).find("input[name=xsrf_token]").val(), mylevel = $(e).find('a[href="/account"]').find("span").next().html().match(/(\d+)/)[1];
        var t = $(e).filter(".popup--gift-received").get(0);
        "undefined" != typeof $(t).html() && notify(), scanpage(e), pages > 1 && loadnextpages(link, pages)
    }))
}

function testNotification(){
	setTimeout(function(){ notify(); }, 10000);
}

function loadsettings() {
    var e = 0,
        t = 6;
    chrome.storage.sync.get("PageForBG", function(n) {
        "undefined" == typeof n.PageForBG ? (settingsPageForBG = "wishlist", chrome.storage.sync.set({
            PageForBG: "wishlist"
        })) : settingsPageForBG = n.PageForBG, e++, e == t && settingsloaded()
    }), chrome.storage.sync.get("RepeatHoursBG", function(n) {
        "undefined" == typeof n.RepeatHoursBG ? (settingsRepeatHoursBG = 2, chrome.storage.sync.set({
            RepeatHoursBG: "2"
        })) : settingsRepeatHoursBG = parseInt(n.RepeatHoursBG, 10), e++, e == t && settingsloaded()
    }), chrome.storage.sync.get("PagestoloadBG", function(n) {
        "undefined" == typeof n.PagestoloadBG ? (settingsPagestoloadBG = 3, chrome.storage.sync.set({
            PagestoloadBG: "3"
        })) : settingsPagestoloadBG = parseInt(n.PagestoloadBG, 10), e++, e == t && settingsloaded()
    }), chrome.storage.sync.get("BackgroundAJ", function(n) {
        "undefined" == typeof n.BackgroundAJ ? (settingsBackgroundAJ = !0, chrome.storage.sync.set({
            BackgroundAJ: "true"
        })) : "false" == n.BackgroundAJ && (settingsBackgroundAJ = !1), e++, e == t && settingsloaded()
    }), chrome.storage.sync.get("LevelPriorityBG", function(n) {
        "undefined" == typeof n.LevelPriorityBG ? (settingsLevelPriorityBG = !1, chrome.storage.sync.set({
            LevelPriorityBG: "true"
        })) : "true" == n.LevelPriorityBG && (settingsLevelPriorityBG = !0), e++, e == t && settingsloaded()
    }), chrome.storage.sync.get("IgnoreGroupsBG", function(n) {
        "undefined" == typeof n.IgnoreGroupsBG ? (settingsIgnoreGroupsBG = !1, chrome.storage.sync.set({
            IgnoreGroupsBG: "false"
        })) : "true" == n.IgnoreGroupsBG && (settingsIgnoreGroupsBG = !0), e++, e == t && settingsloaded()
    })
}
chrome.alarms.onAlarm.addListener(function(e) {
    console.log("Alarm fired."), "routine" == e.name && (loadsettings(), chrome.alarms.create("routine", {
        delayInMinutes: 30
    }))
});
var arr = [],
    link = "https://www.steamgifts.com/giveaways/search?page=",
    pages = 1,
    pagestemp = pages,
    token = "",
    mylevel = 0,
    totalVarCount = 6,
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
    settingsRepeatHoursBG = 2;
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
