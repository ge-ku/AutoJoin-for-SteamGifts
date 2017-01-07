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
var settingsDelayBG = 2;
var settingsMinLevelBG = 0;
var settingsIgnorePinned = false;
var settingsShowChance = true;

$(document).ready(function() {
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
		DelayBG: '2',
		MinLevelBG: '0',
		ShowChance: 'true'
		}, function(data) {
			if (data['HideGroups'] == 'true'){ settingsHideGroups = true }
			if (data['IgnoreGroups'] == 'true'){ settingsIgnoreGroups = true }
			if (data['IgnorePinned'] == 'true'){ settingsIgnorePinned = true }
			if (data['IgnoreGroupsBG'] == 'true'){ settingsIgnoreGroupsBG = true }
			if (data['IgnorePinnedBG'] == 'true'){ settingsIgnorePinnedBG = true }
			if (data['HideEntered'] == 'true'){ settingsHideEntered = true }
			settingsPageForBG = data['PageForBG'];
			settingsRepeatHoursBG = parseInt(data['RepeatHoursBG'], 10);
			settingsPagestoload = parseInt(data['Pagestoload'], 10);
			settingsPagestoloadBG = parseInt(data['PagestoloadBG'], 10);
			settingsDelayBG = parseInt(data['DelayBG'], 10);
			settingsMinLevelBG = parseInt(data['MinLevelBG'], 10);
			if (data['BackgroundAJ'] == 'true'){ settingsBackgroundAJ = true }
			if (data['LevelPriorityBG'] == 'true'){	settingsLevelPriorityBG = true }
			if (!(parseInt(data['lastLaunchedVersion'], 10) < 20160226)){
				newVersionLaunched = true;
				chrome.storage.sync.set({'lastLaunchedVersion': '20160226'});
			}
			if (data['infiniteScrolling'] == 'true'){ settingsInfiniteScrolling = true }
			if (data['showPoints'] == 'true'){ settingsShowPoints = true }
			if (data['showButtons'] == 'true'){ settingsShowButtons = true }
			if (data['loadFive'] == 'true'){ settingsLoadFive = true }
			if (data['hideDlc'] == 'true'){	settingsHideDlc = true }
			if (data['repeatIfOnPage'] == 'true'){ settingsRepeatIfOnPage = true }
			settingsRepeatHours = parseInt(data['repeatHours'], 10);
			if (data['nightTheme'] == 'true'){ settingsNightTheme = true }
			if (data['levelPriority'] == 'true'){ settingsLevelPriority = true }
			if (data['PlayAudio'] == 'false') { settingsPlayAudio = false }
			if (data['ShowChance'] == 'false') { settingsShowChance = false }

			onPageLoad();
		}
	);
});

function onPageLoad(){
	
	if (settingsNightTheme){
		var path = chrome.extension.getURL('/night.css');
		$('head').append($('<link>')
			.attr("rel","stylesheet")
			.attr("type","text/css")
			.attr("href", path));
	}

	// Maybe replace these ugly settings with proper options page https://developer.chrome.com/extensions/optionsV2 , cog icon will lead to it.
	$.get(chrome.extension.getURL('/settings.html'), function(settingsDiv){
		 $('body').append(settingsDiv);
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
		if (settingsPlayAudio){$('#chkPlayAudio').prop('checked', true)};
		if (settingsShowChance){$('#chkShowChance').prop('checked', true)};
		$('#hoursField').val(settingsRepeatHours);
		$('#pagestoload').val(settingsPagestoload);
		$('#pagestoloadBG').val(settingsPagestoloadBG);
		if (settingsRepeatHoursBG == 0) { $('#hoursFieldBG').val("0.5") } else { $('#hoursFieldBG').val(settingsRepeatHoursBG) }
		$('#pageforBG').val(settingsPageForBG);
		$('#delayBG').val(settingsDelayBG);
		$('#minLevelBG').val(settingsMinLevelBG);

		$('#btnSettings')
			.hover(function(){
					$(this).html('<i class="fa fa-cog fa-4x">');
			},function(){
					$(this).html('<i class="fa fa-cog fa-4x fa-inverse">');
			})
			.click(function(){
				$("body").children(':not(#settingsDiv)').animate({opacity:0.3}, "slow");
				$("#settingsDiv").css("visibility","visible").animate({opacity:1.0}, "slow");
			});
		$('#btnSetCancel').click(function(){
			$("body").children(':not(#settingsDiv)').animate({opacity:1.0}, "slow");
			$("#settingsDiv").animate({
						opacity: 0.0}, {
						easing: 'swing',
						duration: 600,
						complete: function() { $("#settingsDiv").css("visibility","hidden") }
						});
		});
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
				location.reload(); // reload page after saving
			});		
		});
		//to show 0.5 when value goes below 1 in hoursFieldBG field 
		$("#hoursFieldBG").on('input', function() {
			if (this.value == 0) this.value = 0.5;
			else if (this.value % 1 != 0 & this.value > 1) {
				this.value = parseInt(this.value);
			}
		});
	});
	/*All of the above is for the "settings" window you can click on the page*/
	
	var myLevel = $('a[href="/account"]').find('span').next().html().match(/(\d+)/)[1];
	
	var pagesLoaded = 1;
	if (settingsShowPoints){var accountInfo = $('a[href="/account"]').clone().prependTo('body').addClass('pointsFloating').css('position', 'fixed').css('opacity', '0').hide();}
	$(':not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap').parent().attr('id', 'posts');
	var token = $("input[name=xsrf_token]").val();		
	if (settingsInfiniteScrolling){$('.widget-container .widget-container--margin-top').remove();}
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
					if (settingsHideGroups){
						if ($(this).find('.giveaway__column--group').length != 0){
							$(this).parent().remove();
							return;
						}
					}
					if ($(this).attr('class') == 'giveaway__row-inner-wrap is-faded'){
						if (settingsHideEntered){
							$(this).parent().remove();
							return;
						}else if (settingsShowButtons){
							$('<input type="button" value="Leave" class="btnSingle" walkState="leave" style="width:130px; height:80px; background-color:#CD9B9B;">').appendTo(this);
						}
					}else{
						if ($(this).find('.giveaway__column--contributor-level--negative').length && settingsShowButtons){
							$('<input type="button" value="Need a higher level" class="btnSingleLvl" walkState="no-level" style="width:130px; height:80px; background-color:#FFFFFF;" disabled>').appendTo(this);
						}else{
							var pointsNeededRaw = $(this).parent().find('.giveaway__heading__thin').text().match(/(\d+)P/);
							var pointsNeeded = pointsNeededRaw[pointsNeededRaw.length-1];
							if (parseInt(pointsNeeded, 10) > parseInt($('.nav__points').first().text(),10) && settingsShowButtons){
								$('<input type="button" value="Not enough points" class="btnSingle" walkState="no-points" style="width:130px; height:80px; background-color:#FFFFFF;" disabled>').appendTo(this);
							}else if (settingsShowButtons){
								$('<input type="button" value="Join" class="btnSingle" walkState="join" style="width:130px; height:80px; background-color:#BCED91;">').appendTo(this);
							}
						}
					}
					$(this).find('.giveaway__hide').each(function(){
						$(this).removeAttr('data-popup');
					});
					if (settingsHideDlc){								
						checkDLCbyImage($(this), false, false);
					}
					if (settingsShowChance){
						$(this).find('.giveaway__columns').prepend("<div title=\"approx. win chance\"><i class=\"fa fa-trophy\"></i> " + calculateWinChance(this, timeLoaded) + "%</div>");
					}
				});
				$("#posts").last().append($(this).html());
				pageNumber++;
				pagesLoaded++;
				loadingNextPage = false;
				/*if(($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settingsInfiniteScrolling) {
					loadPage();
				}*/
			});
		}
	}
	
	function fireAutoJoin(){
		if (settingsLoadFive && pagesLoaded < settingsPagestoload){
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

		if(settingsIgnorePinned)
		{
			selectItems = "#posts " + selectItems;
		}

		$(selectItems).each(function(iteration){
			timeouts.push(setTimeout($.proxy(function(){
				var current = $(this).parent().parent().parent();
				
				if (settingsIgnoreGroups){
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
						current.find('.btnSingle').attr('walkState', 'leave').prop("disabled", false).val('Leave').css({backgroundColor: '#CD9B9B'});
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
		$('#btnJoin').val('Good luck!');
	}
	
	/*
	function fireAutoJoinPriority(){
		if (settingsLoadFive && pagesLoaded < settingsPagestoload){
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
					if (settingsIgnoreGroups){
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
							current.find('.btnSingle').attr('walkState', 'leave').prop("disabled", false).val('Leave').css({backgroundColor: '#CD9B9B'});
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
		$('#btnJoin').val('Good luck!');
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
		if (settingsInfiniteScrolling){
			$('.pagination').html('<div style = "margin-left: auto; margin-right: auto;"><i style="font-size: 55px" class="fa fa-refresh fa-spin"></i></div>');
		}
		$(window).scroll(function() {
			if ($(window).scrollTop() > $(window).height() * 2 && settingsShowPoints){
				accountInfo.show().stop().animate({opacity: 1}, "slow");
			}else if ($(window).scrollTop() < $(window).height()+$(window).height() / 2 && settingsShowPoints){
				accountInfo.stop().animate({
					opacity: 0}, {
					easing: 'swing',
					duration: 200,
					complete: function() { accountInfo.hide() }
				});
			}
			if(($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settingsInfiniteScrolling) {
				loadPage();
			}
		});
	}
	
	$('<div id="info" style="position:relative;width:500px;color:#FFFFFF">&nbsp</div>').prependTo('.featured__summary');
	$('<div id="buttonsAJ"><button id="btnSettings" style="width: 30px; height: 30px; background-color: transparent;"><i class="fa fa-cog fa-4x fa-inverse"></i></button></div>').prependTo('.featured__summary');
	$('<input type="button" value="AutoJoin" id="btnJoin" style="position:relative;width:200px;background-color:#FFFFFF;">')
		.prependTo('#buttonsAJ')
		.hover(function(){
				this.style.backgroundColor = '#EAEAEA';
		},function(){
				this.style.backgroundColor = '#FFFFFF';
		})
		.click(function(){
				$('#btnJoin').prop("disabled", true);
				if (settingsLoadFive && pagesLoaded < 5){
					$('#btnJoin').val("Loading Pages..");
				}	
				//if (settingsLevelPriority){
				//	fireAutoJoinPriority();
				//}else{
					fireAutoJoin();
				//}
		});
			
	function updateButtons(){
		if (settingsShowButtons){
			$('.btnSingle').each(function(){
				if ($(this).parent().attr('class') != 'giveaway__row-inner-wrap is-faded'){
					var pointsNeededRaw = $(this).parent().find('.giveaway__heading__thin').text().match(/(\d+)P/);
					var pointsNeeded = pointsNeededRaw[pointsNeededRaw.length-1];
					if (parseInt(pointsNeeded, 10) > parseInt($('.nav__points').first().text(),10)){
						$(this).prop("disabled", true);
						$(this).attr('walkState', 'no-points');
						$(this).attr('value', 'Not enough points');
						this.style.backgroundColor = '#FFFFFF';
					}else{
						$(this).prop("disabled", false);
						$(this).attr('walkState', 'join');
						$(this).attr('value', 'Join');
						this.style.backgroundColor = '#BCED91';
					}
				}
			});
		}
	}

	var timeOfFirstPage = Math.round(Date.now() / 1000);
	$('.giveaway__row-inner-wrap').each(function(){
		if (settingsHideGroups){
			if ($(this).find('.giveaway__column--group').length != 0){
				$(this).parent().remove();
				return;
			}
		}
		if ($(this).attr('class') == 'giveaway__row-inner-wrap is-faded'){
			if (settingsHideEntered){
				$(this).parent().remove();
				return;
			}else if (settingsShowButtons){
				$('<input type="button" value="Leave" class="btnSingle" walkState="leave" style="width:130px; height:80px; background-color:#CD9B9B;">').appendTo(this);
			}				
		}else if (settingsShowButtons){
			if ($(this).find('.giveaway__column--contributor-level--negative').length){
				$('<input type="button" value="Need a higher level" class="btnSingleLvl" walkState="no-level" style="width:130px; height:80px; background-color:#FFFFFF;" disabled>').appendTo(this);
			}else{
				var pointsNeededRaw = $(this).parent().find('.giveaway__heading__thin').text().match(/(\d+)P/);
				var pointsNeeded = pointsNeededRaw[pointsNeededRaw.length-1];
				if (parseInt(pointsNeeded, 10) > parseInt($('.nav__points').first().text(),10)){
					$('<input type="button" value="Not enough points" class="btnSingle" walkState="no-points" style="width:130px; height:80px; background-color:#FFFFFF;" disabled>').appendTo(this);
				}else{
					$('<input type="button" value="Join" class="btnSingle" walkState="join" style="width:130px; height:80px; background-color:#BCED91;">').appendTo(this);
				}
			}
		}
		$(this).find('.giveaway__hide').each(function(){
			$(this).removeAttr('data-popup');
		});
		if (settingsHideDlc){
			checkDLCbyImage($(this), false, true);
		}
		if (settingsShowChance){
			$(this).find('.giveaway__columns').prepend("<div title=\"approx. win chance\"><i class=\"fa fa-trophy\"></i> " + calculateWinChance(this, timeOfFirstPage) + "%</div>");
		}
	});
	if ($('.pinned-giveaways__inner-wrap').children().length == 0){
		$('.pinned-giveaways__inner-wrap').parent().remove();
	}
	
	/*if(($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settingsInfiniteScrolling) {
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
		mouseenter: function () {
			if ($(this).attr('walkState') == "join"){
				this.style.backgroundColor = '#A6D785';
			}else if ($(this).attr('walkState') == "leave"){
				this.style.backgroundColor = '#BC8F8F';
			}
		},
		mouseleave: function () {
			if ($(this).attr('walkState') == "join"){
				this.style.backgroundColor = '#BCED91';
			}else if ($(this).attr('walkState') == "leave"){
				this.style.backgroundColor = '#CD9B9B';
			}
		},
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
						if (settingsHideEntered){
							thisWrap.fadeOut(300, function() { $(this).parent().remove(); });
							$('.nav__points').text(json_response.points);
							updateButtons();
						}else{
							$('.nav__points').text(json_response.points);
							thisButton.attr('walkState', 'leave');
							thisButton.prop("disabled", false);
							thisButton.val('Leave');
							updateButtons();
							$(thisButton).css({backgroundColor: '#CD9B9B'});
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
						$(thisButton).css({backgroundColor: '#BCED91'});
					}else{
						thisButton.val('Error: '+json_response.msg);
					}
				});
			}
		}
	}, ".btnSingle");
	
	if (settingsRepeatIfOnPage){
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
				if (settingsInfiniteScrolling){
					settingsInfiniteScrolling = false;
					$('#posts').empty();
					loadPage();
					setTimeout(function() { settingsInfiniteScrolling = true; }, 5000);
				}else{
					$('#posts').empty();
					loadPage();
				}
			}
			//if (settingsLevelPriority){
			//	fireAutoJoinPriority();
			//}else{
				fireAutoJoin();
			//}
		}, 3600000 * settingsRepeatHours);
		//}, 5000 * settingsRepeatHours); // For testing
	}						
}

function calculateWinChance(giveaway, timeLoaded) {
	var timeLeft = parseInt( $(giveaway).find('.fa.fa-clock-o').next('span').attr('data-timestamp') ) - timeLoaded; // time left in seconds
	var timePassed = timeLoaded - parseInt( $(giveaway).find('.giveaway__username').prev('span').attr('data-timestamp') ); //time passed in seconds
	var numberOfEntries = parseInt( $(giveaway).find('.fa-tag').next('span').text().replace(',', '') );
	var numberOfCopies = 1;
	if ($(giveaway).find('.giveaway__heading__thin:first').text().match(/\(\d+ Copies\)/)) { // if more than one copy there's a text field "(N Copies)"
		numberOfCopies = parseInt( $(giveaway).find('.giveaway__heading__thin:first').text().match(/\d+/)[0] );
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
