var newVersionLaunched = false;
var thisVersion = 20170123;
var settingsInjected = false;

var settings;

$(document).ready(function() {
	chrome.storage.sync.get({
		lastLaunchedVersion: thisVersion
	}, function(version) {
		if (version.lastLaunchedVersion < thisVersion){
			//this version is old, we need to convert settings to new format:
			var oldFormatSettings;
			chrome.storage.sync.get(null, function(oldSettings){
				oldFormatSettings = oldSettings;
				chrome.storage.sync.clear(function(){
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
						RepeatHours: parseInt(oldFormatSettings.repeatHours),
						RepeatHoursBG: parseInt(oldFormatSettings.RepeatHoursBG),
						PagesToLoad: parseInt(oldFormatSettings.Pagestoload),
						PagesToLoadBG: parseInt(oldFormatSettings.PagestoloadBG),
						PageForBG: oldFormatSettings.PageForBG,
						DelayBG: parseInt(oldFormatSettings.DelayBG),
						MinLevelBG: parseInt(oldFormatSettings.MinLevelBG),
						MinCost: parseInt(oldFormatSettings.MinCost),
						ShowChance: (oldFormatSettings.ShowChance == 'true'),
						lastLaunchedVersion: thisVersion,
						LastKnownLevel: parseInt(oldFormatSettings.LastKnownLevel)
					}, function(){
						tempStart();
					});
				});
			});
		} else {
			tempStart();
		}
	});
});
function tempStart() { // this is temporary
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
		lastLaunchedVersion: thisVersion,
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
		ShowChance: true
		}, function(data) {
			settings = data;
			onPageLoad();
		}
	);
};

function onPageLoad(){

	/* Inject night.css if night theme enabled in settings*/
	if (settings.NightTheme){
		var path = chrome.extension.getURL('/night.css');
		$('head').append($('<link>')
			.attr("rel","stylesheet")
			.attr("type","text/css")
			.attr("href", path));
	}

	/* Add AutoJoin and cog button*/
	$('<div id="info"></div>').prependTo('.featured__summary');
	$('<div id="buttonsAJ"><button id="btnSettings"><i class="fa fa-cog fa-4x fa-inverse"></i></button></div>').prependTo('.featured__summary');
	$('<input type="button" value="AutoJoin" id="btnAutoJoin">')
		.prependTo('#buttonsAJ')
		.click(function(){
				$('#btnAutoJoin').prop("disabled", true);
				if (settings.LoadFive && pagesLoaded < 5){
					$('#btnAutoJoin').val("Loading Pages..");
				}	
				fireAutoJoin();
		});
	/*First time cog button is pressed inject part of settings.html and show it
	  If settings already injected just show them*/
	$('#btnSettings').click(function(){
		if (settingsInjected) {
			$("#settingsShade").removeClass("fadeOut").addClass("fadeIn");
			$("#settingsDiv").removeClass("fadeOut").addClass("fadeIn");
		} else {
			settingsInjected = true;
			$.get(chrome.extension.getURL('/settings.html'), function(settingsDiv){
				$('body').append($(settingsDiv).filter('#bodyWrapper'));
				loadSettings();
				$("#settingsShade").removeClass("fadeOut").addClass("fadeIn");
				$("#settingsDiv").removeClass("fadeOut").addClass("fadeIn");
			});
		}
	});
	
	var myLevel = $('a[href="/account"]').find('span').next().html().match(/(\d+)/)[1];
	var token = $("input[name=xsrf_token]").val();
	var pagesLoaded = 1;

	$(':not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap').parent().attr('id', 'posts'); //give div with giveaways id "posts"

	if (settings.ShowPoints){
		var accountInfo = $('a[href="/account"]')
							.clone().prependTo('body')
							.addClass('pointsFloating')
							.css({position: 'fixed', opacity: '0'})
							.hide();
	}
	
	if (settings.InfiniteScrolling){$('.widget-container .widget-container--margin-top').remove();}
	var splitPageLinkCheck = $(".pagination__navigation").find('a:contains("Next")');
	var onlyOnePage = false;
	if (splitPageLinkCheck.length == 0) {
		pagesLoaded = 9999;
		onlyOnePage = true;
	}
	
	function loadPage(){
		var timeLoaded = Math.round(Date.now() / 1000); //when the page was loaded (in seconds)
		if (pageNumber > lastPage){
			loadingNextPage = true;
			pagesLoaded = 9999;
			$('.pagination').hide();
		}
		if (loadingNextPage == false){
			loadingNextPage = true;
			$("<div>").load(pageLink+pageNumber+thirdPart + " :not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap", function() {
				$(this).find('.giveaway__row-inner-wrap').each(function(){
					if (settings.HideGroups){
						if ($(this).find('.giveaway__column--group').length != 0){
							$(this).parent().remove();
							return;
						}
					}
					if ($(this).attr('class') == 'giveaway__row-inner-wrap is-faded'){
						if (settings.HideEntered){
							$(this).parent().remove();
							return;
						}else if (settings.ShowButtons){
							$('<input type="button" value="Leave" class="btnSingle" walkState="leave">').appendTo(this);
						}
					}else{
						if ($(this).find('.giveaway__column--contributor-level--negative').length && settings.ShowButtons){
							$('<input type="button" value="Need a higher level" class="btnSingle" walkState="no-level" disabled>').appendTo(this);
						}else{
							var pointsNeededRaw = $(this).parent().find('.giveaway__heading__thin').text().match(/(\d+)P/);
							var pointsNeeded = pointsNeededRaw[pointsNeededRaw.length-1];
							if (parseInt(pointsNeeded, 10) > parseInt($('.nav__points').first().text(),10) && settings.ShowButtons){
								$('<input type="button" value="Not enough points" class="btnSingle" walkState="no-points" disabled>').appendTo(this);
							}else if (settings.ShowButtons){
								$('<input type="button" value="Join" class="btnSingle" walkState="join">').appendTo(this);
							}
						}
					}
					$(this).find('.giveaway__hide').each(function(){
						$(this).removeAttr('data-popup');
					});
					if (settings.HideDlc){								
						checkDLCbyImage($(this), false, false);
					}
					if (settings.ShowChance){
						$(this).find('.giveaway__columns').prepend("<div style=\"cursor:help\" title=\"approx. odds of winning\"><i class=\"fa fa-trophy\"></i> " + calculateWinChance(this, timeLoaded) + "%</div>");
					}
				});
				$("#posts").last().append($(this).html());
				pageNumber++;
				pagesLoaded++;
				loadingNextPage = false;
				/*if(($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settings.infiniteScrolling) {
					loadPage();
				}*/
			});
		}
	}
	
	function fireAutoJoin(){
		if (settings.LoadFive && pagesLoaded < settings.PagesToLoad){
			loadPage();
			setTimeout(function() {
				fireAutoJoin();
			}, 50);
			return;
		}	
		var entered = 0;
		var timeouts = [];

		var selectItems = ".giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name";
	
		//Here I'm filtering the giveaways to enter to only the one created by regular users in the #posts div
		//which means featured giveaways won't be autojoined if users decides so in the options

		if(settings.IgnorePinned)
		{
			selectItems = "#posts " + selectItems;
		}

		$(selectItems).each(function(iteration){
			timeouts.push(setTimeout($.proxy(function(){
				var current = $(this).parent().parent().parent();
				
				if (settings.IgnoreGroups){
					if ($(current).find('.giveaway__column--group').length != 0){
						return;
					}
				}

				$.post("/ajax.php",{
						xsrf_token : token,
						do : "entry_insert",
						code : this.href.split('/')[4]
				},
				function(response){
					var json_response = jQuery.parseJSON(response);
					if (json_response.type == "success"){
						current.toggleClass('is-faded');
						$('.nav__points').text(json_response.points);
						entered++;
						current.find('.btnSingle').attr('walkState', 'leave').prop("disabled", false).val('Leave');
						updateButtons();
					}
					if (json_response.points < 5) {
						for (var i = 0; i < timeouts.length; i++) {
							clearTimeout(timeouts[i]);
						}
						timeouts = [];
					}
					if(entered < 1){
						$('#info').text('No giveaways entered.');
					}else if(entered == 1){
						$('#info').text('Entered 1 giveaway.');
					}else{
						$('#info').text('Entered ' + entered + ' giveaways.');
					}
				});
			}, this), iteration * 3000));
		});
		$('#btnAutoJoin').val('Good luck!');
	}
	
	/*
	function fireAutoJoinPriority(){
		if (settings.LoadFive && pagesLoaded < settings.PagesToLoad){
			loadPage();
			setTimeout(function() {
				fireAutoJoinPriority();
			}, 50);
			return;
		}	
		var entered = 0;
		var timeouts = [];
		for (var i = myLevel; !(i < 0); i--){
			$('.giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name').each(function(iteration){
				timeouts.push(setTimeout($.proxy(function(){
					var current = $(this).parent().parent().parent();
					if (settings.IgnoreGroups){
						if ($(current).find('.giveaway__column--group').length != 0){
							return;
						}
					}
					if (i != 0){
						if ($(current).find('.giveaway__column--contributor-level--positive').length > 0) {
							var thisLevel = $(current).find('.giveaway__column--contributor-level--positive').html().match(/(\d+)/)[1];
							if (thisLevel != i){
								return true;
							}
						} else {
							return true;
						}
					}
					$.post("/ajax.php",{
						xsrf_token : token,
						do : "entry_insert",
						code : this.href.split('/')[4]
					},
					function(response){
						var json_response = jQuery.parseJSON(response);
						if (json_response.type == "success"){
							current.toggleClass('is-faded');
							$('.nav__points').text(json_response.points);
							entered++;
							current.find('.btnSingle').attr('walkState', 'leave').prop("disabled", false).val('Leave');
							updateButtons();
							console.log(json_response.points);
							if (json_response.points < 5) {
								for (var i = 0; i < timeouts.length; i++) {
									clearTimeout(timeouts[i]);
								}
								timeouts = [];
							}
						}
						if(entered < 1){
							$('#info').text('No giveaways entered.');
						}else if(entered == 1){
							$('#info').text('Entered 1 giveaway.');
						}else{
							$('#info').text('Entered '+entered+' giveaways.');
						}
					});
				}, this), iteration * 1500));
			});
		}
		$('#btnAutoJoin').val('Good luck!');
	}*/
	
	if (splitPageLinkCheck.length > 0){
		var splitPageLink = splitPageLinkCheck.attr('href').split('page=');
		var pageLink = splitPageLink[0] + "page=";
		var pageNumber = splitPageLink[1];
		var thirdPart = "";
		if (!$.isNumeric(pageNumber)){
			var temp = pageNumber;
			thirdPart = pageNumber.substr(pageNumber.indexOf('&'));
			pageNumber = pageNumber.substr(0,pageNumber.indexOf('&'));
		}
		try{
			var lastPage = ($(".pagination__navigation").find('a:contains("Last")').attr('href').split('page='))[1];
			if (!$.isNumeric(lastPage)){
				lastPage = lastPage.substr(0,lastPage.indexOf('&'));
			}
		}
		catch(e){
			var lastPage = 100; // This is a work-around since steamgifts.com stopped showing last page number.
								// Proper fix is to check every new page's pagination, last page doesn't have "Next" link.
		}
		var loadingNextPage = false;
		if (settings.InfiniteScrolling){
			$('.pagination').html('<div style = "margin-left: auto; margin-right: auto;"><i style="font-size: 55px" class="fa fa-refresh fa-spin"></i></div>');
		}
		$(window).scroll(function() {
			if ($(window).scrollTop() > $(window).height() * 2 && settings.ShowPoints){
				accountInfo.show().stop().animate({opacity: 1}, "slow");
			}else if ($(window).scrollTop() < $(window).height()+$(window).height() / 2 && settings.ShowPoints){
				accountInfo.stop().animate({
					opacity: 0}, {
					easing: 'swing',
					duration: 200,
					complete: function() { accountInfo.hide() }
				});
			}
			if(($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settings.InfiniteScrolling) {
				loadPage();
			}
		});
	}
			
	function updateButtons(){
		if (settings.ShowButtons){
			$('.btnSingle:not([walkState="no-level"])').each(function(){
				if ($(this).parent().attr('class') != 'giveaway__row-inner-wrap is-faded'){
					var pointsNeededRaw = $(this).parent().find('.giveaway__heading__thin').text().match(/(\d+)P/);
					var pointsNeeded = pointsNeededRaw[pointsNeededRaw.length-1];
					if (parseInt(pointsNeeded, 10) > parseInt($('.nav__points').first().text(),10)){
						$(this).prop("disabled", true);
						$(this).attr('walkState', 'no-points');
						$(this).attr('value', 'Not enough points');
					}else{
						$(this).prop("disabled", false);
						$(this).attr('walkState', 'join');
						$(this).attr('value', 'Join');
					}
				}
			});
		}
	}

	var timeOfFirstPage = Math.round(Date.now() / 1000);
	$('.giveaway__row-inner-wrap').each(function(){
		if (settings.HideGroups){
			if ($(this).find('.giveaway__column--group').length != 0){
				$(this).parent().remove();
				return;
			}
		}
		if ($(this).attr('class') == 'giveaway__row-inner-wrap is-faded'){
			if (settings.HideEntered){
				$(this).parent().remove();
				return;
			}else if (settings.ShowButtons){
				$('<input type="button" value="Leave" class="btnSingle" walkState="leave">').appendTo(this);
			}				
		}else if (settings.ShowButtons){
			if ($(this).find('.giveaway__column--contributor-level--negative').length){
				$('<input type="button" value="Need a higher level" class="btnSingle" walkState="no-level" disabled>').appendTo(this);
			}else{
				var pointsNeededRaw = $(this).parent().find('.giveaway__heading__thin').text().match(/(\d+)P/);
				var pointsNeeded = pointsNeededRaw[pointsNeededRaw.length-1];
				if (parseInt(pointsNeeded, 10) > parseInt($('.nav__points').first().text(),10)){
					$('<input type="button" value="Not enough points" class="btnSingle" walkState="no-points" disabled>').appendTo(this);
				}else{
					$('<input type="button" value="Join" class="btnSingle" walkState="join">').appendTo(this);
				}
			}
		}
		$(this).find('.giveaway__hide').each(function(){
			$(this).removeAttr('data-popup');
		});
		if (settings.HideDlc){
			checkDLCbyImage($(this), false, true);
		}
		if (settings.ShowChance){
			$(this).find('.giveaway__columns').prepend("<div style=\"cursor:help\" title=\"approx. odds of winning\"><i class=\"fa fa-trophy\"></i> " + calculateWinChance(this, timeOfFirstPage) + "%</div>");
		}
	});
	if ($('.pinned-giveaways__inner-wrap').children().length == 0){
		$('.pinned-giveaways__inner-wrap').parent().remove();
	}
	
	/*if(($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settings.InfiniteScrolling) {
		loadPage();
	}*/
	
	$("#posts").on("click",".giveaway__hide", function(){
		var thisPost = $(this).parent().parent().parent().parent();
		var gameid = thisPost.attr('data-game-id');
		console.log("hiding " + gameid);
		$(this).attr('class', 'giveaway__icon giveaway__hide trigger-popup fa fa-refresh fa-spin');
		$.post("/ajax.php",{
				xsrf_token : token,
				game_id : gameid,
				do : "hide_giveaways_by_game_id"
			},
			function(response){
				$("[data-game-id='"+gameid+"']").each(function(val){
					$(this).fadeOut("slow", function() {
						$(this).hide();
					});	
				});
			}
		);
	});

	$(document).on({
		click: function () {
			var thisButton = $(this);
			var thisWrap = $(this).parent();
			thisButton.prop("disabled", true);
			var uniqueCode = $(this).parent().find('.giveaway__heading__name').attr('href').substr(10,5);
			if($(this).attr('walkState') == "join"){
				$.post("/ajax.php",{
					xsrf_token : token,
					do : "entry_insert",
					code : uniqueCode
				},
				function(response){
					var json_response = jQuery.parseJSON(response);
					if (json_response.type == "success"){
						thisWrap.toggleClass('is-faded');
						if (settings.HideEntered){
							thisWrap.fadeOut(300, function() { $(this).parent().remove(); });
							$('.nav__points').text(json_response.points);
							updateButtons();
						}else{
							$('.nav__points').text(json_response.points);
							thisButton.attr('walkState', 'leave');
							thisButton.prop("disabled", false);
							thisButton.val('Leave');
							updateButtons();
						}
					}else{
						thisWrap.toggleClass('is-faded');
						thisButton.val('Error: '+json_response.msg);
					}
				});
			}else{
				$.post("/ajax.php",{
					xsrf_token : token,
					do : "entry_delete",
					code : uniqueCode
				},
				function(response){
					var json_response = jQuery.parseJSON(response);
					if (json_response.type == "success"){
						thisWrap.toggleClass('is-faded');
						$('.nav__points').text(json_response.points);
						thisButton.attr('walkState', 'join');
						thisButton.prop("disabled", false);
						thisButton.val('Join');
						updateButtons();
					}else{
						thisButton.val('Error: '+json_response.msg);
					}
				});
			}
		}
	}, ".btnSingle");
	
	/*I wonder if anyone actually uses this..*/
	if (settings.RepeatIfOnPage){
		setInterval(function(){
			if (onlyOnePage){
				pageLink = window.location.href;
				loadingNextPage = false;
				pageNumber = "";
				thirdPart = "";
				lastPage = 0;
				pagesLoaded = 0;
				$('#posts').empty();
				loadPage();
			}else{
				pagesLoaded = 0;
				pageNumber = 1;
				if (settings.InfiniteScrolling){
					settings.InfiniteScrolling = false;
					$('#posts').empty();
					loadPage();
					setTimeout(function() { settings.InfiniteScrolling = true; }, 5000);
				}else{
					$('#posts').empty();
					loadPage();
				}
			}
			fireAutoJoin();
		}, 3600000 * settings.RepeatHours);
	}						
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
	if (chance > 100) { chance = 100 }
	return chance.toFixed(3);
}

function checkDLCbyImage(giveaway, encc, frontpage){
	// USING STEAMAPI
	// Maybe should be replaced with local database that contains every DLC appid?
	// Steam API can stop responding if you send many requests in a short period of time
	// DLC list can be retrieved from https://steamdb.info/apps/ 
	// Flaw: Such list must be updated regulary. Maybe have a local db with every app id (not only DLCs), use Steam API if app id is unknown.
	var t = $(giveaway).find(".global__image-outer-wrap--game-medium").find(".global__image-inner-wrap")
	var appid = $(t).css("background-image");
	if (appid == null){
		console.log('error in image');
		return false;
	}
	var appmatch = appid.match(/.+apps\/(\d+)\/cap.+/);
	if (appmatch == null){
		return false;
	}
	appid = appmatch[1];
	var xhr = new XMLHttpRequest();
    var result = false;
	if (encc){
		xhr.open("GET", "https://store.steampowered.com/api/appdetails?appids=" + appid + "&cc=en", true);
	}else{
		xhr.open("GET", "https://store.steampowered.com/api/appdetails?appids=" + appid, true);
	}
    xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == 200){
			var jsonResponse = JSON.parse(this.responseText);
			if (jsonResponse[appid].success == false && !encc){
				checkDLCbyImage(this, true, frontpage); //try with cc = en
			}else{
				if (jsonResponse[appid].data.type == "dlc"){
					console.log ("hidden " + appid);
					if (frontpage){
						$(giveaway).parent().remove();
						return true;
					}
					else{
						var linkToGiveaway = $(giveaway).find(".giveaway__heading__name").attr("href");
						$(giveaway).parent().remove();
						$('#posts').find("[href='" + linkToGiveaway + "']").parent().parent().remove();
						return true;
					}
				}
			}
		}
	}
	xhr.send();
}
