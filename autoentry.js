var settingsInjected = false;
var settings;
var thisVersion = 20170929;

$(document).ready(function() {
	chrome.storage.sync.get({
		lastLaunchedVersion: thisVersion
	}, function() {
		chrome.storage.sync.get({
			AutoJoinButton: false,
			AutoDescription: true,
			HideGroups: false,
			IgnoreGroups: false,
			IgnorePinned: true,
			IgnoreGroupsBG: false,
			IgnorePinnedBG: true,
			HideEntered: false,
			PageForBG: 'wishlist',
			RepeatHoursBG: 5,
			PagesToLoad: 3,
			PagesToLoadBG: 2,
			BackgroundAJ: false,
			LevelPriorityBG: true,
			OddsPriorityBG: false,
			lastLaunchedVersion: thisVersion,
			InfiniteScrolling: true,
			ShowPoints: true,
			ShowButtons: true,
			LoadFive: false,
			HideDlc: false,
			RepeatIfOnPage: false,
			RepeatHours: 5,
			NightTheme: false,
			LevelPriority: false,
			PlayAudio: true,
			AudioVolume: 1,
			DelayBG: 10,
			Delay: 10,
			MinLevelBG: 0,
			MinCost: 0,
			MinCostBG: 0,
			ShowChance: true
		}, function(data) {
			settings = data;
			onPageLoad();
		});
	});
});

function onPageLoad(){

	/* Add AutoJoin and cog button*/
	var info = document.createElement('div');
	info.id = 'info';
	document.querySelector('.featured__summary').prepend(info);
	if (settings.AutoJoinButton) {
		let buttonsAJ = document.createElement('div');
		buttonsAJ.id = 'buttonsAJ';
		let btnSettings = document.createElement('button');
		btnSettings.id = 'btnSettings';
		btnSettings.className = 'AutoJoinButtonEnabled';
		let cog = document.createElement('i');
		cog.className = 'fa fa-cog fa-4x fa-inverse';
		btnSettings.appendChild(cog);

		let btnAutoJoin = document.createElement('input');
		btnAutoJoin.id = 'btnAutoJoin';
		btnAutoJoin.type = 'button';
		btnAutoJoin.value = 'AutoJoin';
		btnAutoJoin.addEventListener('click', function(){
			btnAutoJoin.disabled = true;
			if (settings.LoadFive && pagesLoaded < 5){
				btnAutoJoin.value = 'Loading Pages..';
			}
			fireAutoJoin();
		});

		let suspensionNotice = document.createElement('div');
		suspensionNotice.id = 'suspensionNotice';
		let linkToAnnouncement = document.createElement('a');
		linkToAnnouncement.href = 'http://steamcommunity.com/groups/autojoin#announcements/detail/1485483400577229657';
		linkToAnnouncement.target = '_blank';
		linkToAnnouncement.innerHTML = '<p>By using AutoJoin button and AutoJoin in background you risk getting a suspension.</p><p>Click to read more...</p>';
		suspensionNotice.appendChild(linkToAnnouncement);

		buttonsAJ.appendChild(btnAutoJoin);
		buttonsAJ.appendChild(btnSettings);
		buttonsAJ.appendChild(suspensionNotice);
		document.querySelector('.featured__summary').prepend(buttonsAJ);
	} else {
		let navbar = document.querySelector('.nav__left-container');
		let buttonContainer = document.createElement('div');
		buttonContainer.className = 'nav__button-container';
		let button = document.createElement('a');
		button.className = 'nav__button';
		button.id = 'btnSettings';
		button.textContent = 'AutoJoin Settings';
		buttonContainer.appendChild(button);
		navbar.appendChild(buttonContainer);
	}

	
	/*First time cog/settings button is pressed inject part of settings.html and show it
	  If settings already injected just show them*/
	document.getElementById('btnSettings').addEventListener('click', function(){
		if (settingsInjected) {
			document.getElementById('settingsShade').classList.replace('fadeOut', 'fadeIn');
			document.getElementById('settingsDiv').classList.replace('fadeOut', 'fadeIn');
		} else {
			settingsInjected = true;
			fetch(chrome.extension.getURL('/settings.html'))
				.then((resp) => resp.text())
				.then((settingsHTML) => {
					let parser = new DOMParser();
					let settingsDOM = parser.parseFromString(settingsHTML, 'text/html');
					let settingsDiv = settingsDOM.getElementById('bodyWrapper');
					document.querySelector('body').appendChild(settingsDiv);
					loadSettings();
					document.getElementById('settingsShade').classList.add('fadeIn');
					document.getElementById('settingsDiv').classList.add('fadeIn');
				});
		}
	});
	
	var myLevel = Number.parseInt(document.querySelector('a[href="/account"] span:last-child').title);
	var token = document.querySelector('input[name="xsrf_token"]').value;
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
			$("<div>").load(location.origin + pageLink+pageNumber+thirdPart + " :not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap", function() {
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
					// (if settings.ShowDescription){
						$(this).find('.giveaway__links').append('<div class="description descriptionLoad"><a><i class="fa fa-file-text descriptionIcon"/> <span>Show description</span></a></div>')
					//}
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

		$(selectItems).each(function() {
			var current = $(this).parent().parent().parent();

			if (settings.IgnoreGroups) {
				if ($(current).find('.giveaway__column--group').length != 0) {
					return;
				}
			}
			var cost = parseInt($(current).find(".giveaway__heading__thin").last().html().match(/\d+/)[0], 10);
			if (cost < settings.MinCost) {
				console.log("^Skipped, cost: " + cost + ", your settings.MinCost is " + settings.MinCost);
				return;
			}
			timeouts.push(setTimeout($.proxy(function () {
				var formData = new FormData();
				formData.append('xsrf_token', token);
				formData.append('do', 'entry_insert');
				formData.append('code', this.href.split('/')[4]);					
				fetch(location.origin + '/ajax.php', { method: 'post', credentials: 'include', body: formData })
					.then((resp) => resp.json())
					.then((json_response) => {
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

			}, this), timeouts.length * settings.Delay * 1000 + Math.floor(Math.random()*1000)));
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
		// (if settings.ShowDescription){
			$(this).find('.giveaway__links').append('<div class="description descriptionLoad"><a><i class="fa fa-file-text descriptionIcon"/> <span>Show description</span></a></div>')
		//}
	});
	if ($('.pinned-giveaways__inner-wrap').children().length == 0){
		$('.pinned-giveaways__inner-wrap').parent().remove();
	}
	
	/*if(($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settings.InfiniteScrolling) {
		loadPage();
	}*/
	
	$("#posts").parent().on("click",".giveaway__hide", function(){
		var thisPost = $(this).parent().parent().parent().parent();
		var gameid = thisPost.attr('data-game-id');
		console.log("hiding " + gameid);
		$(this).attr('class', 'giveaway__icon giveaway__hide trigger-popup fa fa-refresh fa-spin');
		var formData = new FormData();
		formData.append('xsrf_token', token);
		formData.append('game_id', gameid);
		formData.append('do', 'hide_giveaways_by_game_id');
		fetch(location.origin + '/ajax.php', { method: 'post', credentials: 'include', body: formData })
			.then(() => {
				$("[data-game-id='"+gameid+"']").each(function(){
					$(this).fadeOut("slow", function() {
						$(this).hide();
					});	
				});
			})
	});

	$("#posts").parent().on("click", ".description", function(){
		var thisPost = $(this).parent().parent().parent().parent();
		if ($(this).hasClass('descriptionLoad')) {
			loadDescription(thisPost[0]);
		} else {
			var $descriptionContent = $(thisPost).find('.descriptionContent');
			if ($descriptionContent.hasClass('visible')) {
				$descriptionContent.removeClass('visible');
				$(this).find('span').text('Show description');
			} else {
				$descriptionContent.addClass('visible');
				$(this).find('span').text('Hide description');
			}
		}
	})

	$(document).on({
		click: function () {
			var thisButton = $(this);
			var thisWrap = $(this).parent();
			thisButton.prop("disabled", true);
			var uniqueCode = $(this).parent().find('.giveaway__heading__name').attr('href').substr(10,5);
			var formData = new FormData();
			formData.append('xsrf_token', token);
			formData.append('code', uniqueCode);
			if($(this).attr('walkState') == "join"){
				if (settings.AutoDescription) {
					if (thisWrap.find('.description').hasClass('descriptionLoad')) {
						thisWrap.find('.description').click();
					}
				}
				formData.append('do', 'entry_insert');
				fetch(location.origin + '/ajax.php', { method: 'post', credentials: 'include', body: formData })
					.then((resp) => resp.json())
					.then((json_response) => {
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
					})
			}else{
				formData.append('do', 'entry_delete');
				fetch(location.origin + '/ajax.php', { method: 'post', credentials: 'include', body: formData })
					.then((resp) => resp.json())
					.then((json_response) => {
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

function loadDescription(giveaway) {
	giveaway.querySelector('.description span').textContent = 'Hide description';
	let giveawayURL = giveaway.querySelector('.giveaway__heading__name').href;
	giveaway.querySelector('.descriptionLoad').className = 'description';
	var giveawayDescriptionWrapper = document.createElement('div');
	giveawayDescriptionWrapper.className = 'descriptionContent visible';
	giveaway.appendChild(giveawayDescriptionWrapper);

	var descriptionIcon = giveaway.querySelector('.descriptionIcon');
	descriptionIcon.className = 'fa fa-refresh fa-spin descriptionIcon';
	
	fetch(giveawayURL, { credentials: 'include' })
		.then(resp => resp.text())
		.then(giveawayContent => {
			var parser = new DOMParser();
			var giveawayDOM = parser.parseFromString(giveawayContent, 'text/html');
			var giveawayDescription = giveawayDOM.querySelector('.page__description .markdown');
			if (giveawayDescription == null) {
				giveawayDescription = document.createTextNode('No description.');
			}
			giveawayDescriptionWrapper.appendChild(giveawayDescription);
			descriptionIcon.className = 'fa fa-file-text descriptionIcon';
		})
}

function checkDLCbyImage(giveaway, encc, frontpage){
	// USING STEAMAPI
	// Maybe should be replaced with local database that contains every DLC appid?
	// Steam API can stop responding if you send many requests in a short period of time
	// DLC list can be retrieved from https://steamdb.info/apps/ 
	// Flaw: Such list must be updated regulary. Maybe have a local db with every app id (not only DLCs), use Steam API if app id is unknown.
	var t = $(giveaway).find(".giveaway_image_thumbnail");
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
