var newVersionLaunched = false;
var settingsInfiniteScrolling = true;
var settingsShowPoints = true;
var settingsShowButtons = true;
var settingsLoadFive = false;
var settingsHideDlc = false;
var settingsRepeatIfOnPage = false;
var settingsRepeatHours = 2;
var settingsNightTheme = false;
var settingsLevelPriority = false;
var settingsBackgroundAJ = true;
var settingsLevelPriorityBG = false;
var settingsHideEntered = false;
var settingsPagestoload = 3;
var settingsPagestoloadBG = 3;
var settingsPageForBG = "wishlist";
var settingsRepeatHoursBG = 2;
var settingsHideGroups = false;
var settingsIgnoreGroups = false;
var settingsIgnoreGroupsBG = false;


var loadSettingsStatus = false;

var totalVarCount = 20;
$(function(){
	var varCount = 0;

	chrome.storage.sync.get("HideGroups", function(data) {
		if (typeof data['HideGroups'] == 'undefined'){
			settingsHideGroups = false;
			chrome.storage.sync.set({'HideGroups': 'false'});
		}else{
			if (data['HideGroups'] == 'true'){
				settingsHideGroups = true;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("IgnoreGroups", function(data) {
		if (typeof data['IgnoreGroups'] == 'undefined'){
			settingsIgnoreGroups = false;
			chrome.storage.sync.set({'IgnoreGroups': 'false'});
		}else{
			if (data['IgnoreGroups'] == 'true'){
				settingsIgnoreGroups = true;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("IgnoreGroupsBG", function(data) {
		if (typeof data['IgnoreGroupsBG'] == 'undefined'){
			settingsIgnoreGroupsBG = false;
			chrome.storage.sync.set({'IgnoreGroupsBG': 'false'});
		}else{
			if (data['IgnoreGroupsBG'] == 'true'){
				settingsIgnoreGroupsBG = true;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("HideEntered", function(data) {
		if (typeof data['HideEntered'] == 'undefined'){
			settingsHideEntered = false;
			chrome.storage.sync.set({'HideEntered': 'false'});
		}else{
			if (data['HideEntered'] == 'true'){
				settingsHideEntered = true;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("PageForBG", function(data) {
		if (typeof data['PageForBG'] == 'undefined'){
			settingsPageForBG = "all";
			chrome.storage.sync.set({'PageForBG': 'wishlist'});
		}else{
			settingsPageForBG = data['PageForBG'];
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("RepeatHoursBG", function(data) {
		if (typeof data['RepeatHoursBG'] == 'undefined'){
			settingsRepeatHoursBG = 2;
			chrome.storage.sync.set({'RepeatHoursBG': '2'});
		}else{
			settingsRepeatHoursBG = parseInt(data['RepeatHoursBG'], 10);
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("Pagestoload", function(data) {
		if (typeof data['Pagestoload'] == 'undefined'){
			settingsPagestoload = 3;
			chrome.storage.sync.set({'Pagestoload': '3'});
		}else{
			settingsPagestoload = parseInt(data['Pagestoload'], 10);
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("PagestoloadBG", function(data) {
		if (typeof data['PagestoloadBG'] == 'undefined'){
			settingsPagestoloadBG = 3;
			chrome.storage.sync.set({'PagestoloadBG': '3'});
		}else{
			settingsPagestoloadBG = parseInt(data['PagestoloadBG'], 10);
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("BackgroundAJ", function(data) {
		if (typeof data['BackgroundAJ'] == 'undefined'){
			settingsBackgroundAJ = true;
			chrome.storage.sync.set({'BackgroundAJ': 'true'});
		}else{
			if (data['BackgroundAJ'] == 'false'){
				settingsBackgroundAJ = false;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("LevelPriorityBG", function(data) {
		if (typeof data['LevelPriorityBG'] == 'undefined'){
			settingsLevelPriorityBG = false;
			chrome.storage.sync.set({'LevelPriorityBG': 'true'});
		}else{
			if (data['LevelPriorityBG'] == 'true'){
				settingsLevelPriorityBG = true;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("lastLaunchedVersion", function(data) {
		if (typeof data['lastLaunchedVersion'] == 'undefined'){
			newVersionLaunched = true;
			chrome.storage.sync.set({'lastLaunchedVersion': '1013'});
		}else{
			if (!(parseInt(data['lastLaunchedVersion'], 10) < 1013)){
				newVersionLaunched = true;
				chrome.storage.sync.set({'lastLaunchedVersion': '1013'});
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("infiniteScrolling", function(data) {
		if (typeof data['infiniteScrolling'] == 'undefined'){
			settingsInfiniteScrolling = true;
			chrome.storage.sync.set({'infiniteScrolling': 'true'});
		}else{
			if (data['infiniteScrolling'] == 'false'){
				settingsInfiniteScrolling = false;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("showPoints", function(data) {
		if (typeof data['showPoints'] == 'undefined'){
			settingsShowPoints = true;
			chrome.storage.sync.set({'showPoints': 'true'});
		}else{
			if (data['showPoints'] == 'false'){
				settingsShowPoints = false;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("showButtons", function(data) {
		if (typeof data['showButtons'] == 'undefined'){
			settingsShowButtons = true;
			chrome.storage.sync.set({'showButtons': 'true'});
		}else{
			if (data['showButtons'] == 'false'){
				settingsShowButtons = false;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("loadFive", function(data) {
		if (typeof data['loadFive'] == 'undefined'){
			settingsLoadFive = false;
			chrome.storage.sync.set({'loadFive': 'false'});
		}else{
			if (data['loadFive'] == 'true'){
				settingsLoadFive = true;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("hideDlc", function(data) {
		if (typeof data['hideDlc'] == 'undefined'){
			settingsHideDlc = false;
			chrome.storage.sync.set({'hideDlc': 'false'});
		}else{
			if (data['hideDlc'] == 'true'){
				settingsHideDlc = true;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("repeatIfOnPage", function(data) {
		if (typeof data['repeatIfOnPage'] == 'undefined'){
			settingsRepeatIfOnPage = false;
			chrome.storage.sync.set({'repeatIfOnPage': 'false'});
		}else{
			if (data['repeatIfOnPage'] == 'true'){
				settingsRepeatIfOnPage = true;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("repeatHours", function(data) {
		if (typeof data['repeatHours'] == 'undefined'){
			settingsRepeatHours = 2;
			chrome.storage.sync.set({'repeatHours': '2'});
		}else{
			settingsRepeatHours = data['repeatHours'];
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("nightTheme", function(data) {
		if (typeof data['nightTheme'] == 'undefined'){
			settingsNightTheme = false;
			chrome.storage.sync.set({'nightTheme': 'false'});
		}else{
			if (data['nightTheme'] == 'true'){
				settingsNightTheme = true;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
	chrome.storage.sync.get("levelPriority", function(data) {
		if (typeof data['levelPriority'] == 'undefined'){
			settingsLevelPriority = false;
			chrome.storage.sync.set({'nightTheme': 'false'});
		}else{
			if (data['levelPriority'] == 'true'){
				settingsLevelPriority = true;
			}
		}
		varCount++;
		if (varCount == totalVarCount) {loadSettingsStatus = true}
	});
	
});

$(document).ready(function() {
		
	function checkSettingsLoad() {
    if(!loadSettingsStatus) {
        setTimeout(checkSettingsLoad, 50);
        return;
    }
		onPageLoad();
	}

checkSettingsLoad();
	
});

function onPageLoad(){
	
		if (settingsNightTheme){
			var path = chrome.extension.getURL('/night.css');
			$('head').append($('<link>')
				.attr("rel","stylesheet")
				.attr("type","text/css")
				.attr("href", path));
		}
	
		$('body').append('<div id="settingsDiv" style="all: initial; visibility: hidden; width: 600px; height: 515px; background-color: #FFFFFF; position: fixed; top:0; bottom: 0; left: 0; right: 0; margin: auto; opacity: 0.0"> <ul style="list-style: none; margin: 20px"> <li style="font-weight: bold;">General settings</li><ul> <li> <label style="display: inline-block"> <input id="chkInfiniteScroll" style="width: 20px" type="checkbox"/>Enable Infinite Scrolling (also hides everything below giveaways)</label> </li><li> <label style="display: inline-block"> <input id="chkShowPoints" style="width: 20px" type="checkbox"/>Show points and level in top-left corner if scrolled down</label> </li><li> <label style="display: inline-block"> <input id="chkShowButtons" style="width: 20px" type="checkbox"/>Show buttons to join/leave and warnings besides each giveaway</label> </li><li> <label style="display: inline-block"> <input id="chkLoadFive" style="width: 20px" type="checkbox"/>Load <input style="width: 55px;" type="number" size="2" id="pagestoload" min="1" max="5" value="3">pages before trying to Auto-join (1-5)</label> </li><li> <label style="display: inline-block"> <input id="chkHideDlc" style="width: 20px" type="checkbox"/>Hide all DLC giveaways</label> </li><li> <label style="display: inline-block"> <input id="chkRepeatIfOnPage" style="width: 20px" type="checkbox"/>AutoJoin every <input style="width: 55px;" type="number" size="2" id="hoursField" min="1" max="24" value="2">hours if page is opened (1-24)</label> </li><li> <label style="display: inline-block"> <input id="chkNightTheme" style="width: 20px" type="checkbox"/>Enable Night theme</label> </li><li> <label style="display: inline-block"> <input id="chkLevelPriority" style="width: 20px" type="checkbox"/>Prioritize higher level giveaways for AutoJoin</label> </li><li> <label style="display: inline-block"> <input id="chkHideEntered" style="width: 20px" type="checkbox"/>Hide joined giveaways</label> </li><li> <label style="display: inline-block"> <input id="chkIgnoreGroups" style="width: 20px" type="checkbox"/>Ignore group giveaways for AutoJoin</label> <label style="display: inline-block"> <input id="chkHideGroups" style="width: 20px" type="checkbox"/>Completely hide them</label> </li></ul> <br><li style="font-weight: bold;">AutoJoin in background (even when steamgifts.com in not opened)</li><ul> <li> <label style="display: inline-block"> <input id="chkEnableBG" style="width: 20px" type="checkbox"/>Enable AutoJoin in background on <select style="width: 150px;" id="pageforBG"> <option value="all">Main page (All)</option> <option value="wishlist">Wishlist</option> <option value="group">Group</option> <option value="new">New</option> </select> </label> </li><li> <label style="display: inline-block"> <input id="chkLevelPriorityBG" style="width: 20px" type="checkbox"/>Prioritize higher level giveaways for AutoJoin</label> </li><li> <label style="display: inline-block"> <input id="chkIgnoreGroupsBG" style="width: 20px" type="checkbox"/>Ignore groups giveaways for Main page (All)</label> </li><li> <label style="display: inline-block">Try to AutoJoin in background every <input style="width: 55px;" type="number" size="2" id="hoursFieldBG" min="1" max="24" value="2">hours (1-24)</label> </li><li> <label style="display: inline-block">Load <input style="width: 55px;" type="number" size="2" id="pagestoloadBG" min="1" max="5" value="3">pages before trying to join giveaways (1-5)</label> </li></ul> </ul> <div style="margin-left:45px"> <ul> <li><a target="_blank" style="text-decoration:underline" href="https://chrome.google.com/webstore/detail/autojoin-for-steamgifts/bchhlccjhoedhhegglilngpbnldfcidc">Rate this extension in Chrome Web Store</a> </li></li><a target="_blank" style="text-decoration:underline" href="http://steamcommunity.com/groups/autojoin">Join Steam group</a> </li></ul> </div><div style="margin-left:250px"> <button id="btnSetSave">Save</button>&nbsp&nbsp <button id="btnSetCancel">Cancel</button> </div></div>');
		
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
		if (settingsIgnoreGroupsBG){$('#chkIgnoreGroupsBG').prop('checked', true)};
		$('#hoursField').val(settingsRepeatHours);
		//new
		$('#pagestoload').val(settingsPagestoload);
		$('#pagestoloadBG').val(settingsPagestoloadBG);
		if (settingsBackgroundAJ){$('#chkEnableBG').prop('checked', true)};
		if (settingsLevelPriorityBG){$('#chkLevelPriorityBG').prop('checked', true)};
		$('#hoursFieldBG').val(settingsRepeatHoursBG);
		$('#pageforBG').val(settingsPageForBG);
		
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
		
		function reloadIfSaved(){
			if (totalVarCount > 1){
				setTimeout(function() {
					reloadIfSaved();
				}, 50);
				return;
			}
			location.reload();
		}
		
		function loadPage(){
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
							});				
							$("#posts").last().append($(this).html());
							pageNumber++;
							pagesLoaded++;
							loadingNextPage = false;
							if(($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settingsInfiniteScrolling) {
								loadPage();
							}
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
                        $('.giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name').each(function(){
								var current = $(this).parent().parent().parent();
								if (settingsIgnoreGroups){
									if ($(current).find('.giveaway__column--group').length != 0){
										return;
									}
								}
                                $.post("/ajax.php",{
                                        xsrf_token : token,
                                        do : "entry_insert",
                                        code : this.href.substr(35,5)
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
									if(entered < 1){
										$('#info').text('No giveaways entered.');
									}else if(entered == 1){
										$('#info').text('Entered 1 giveaway.');
									}else{
										$('#info').text('Entered '+entered+' giveaways.');
									}
								});
                        });
                        $('#btnJoin').val('Good luck!');
		}
		
		function fireAutoJoinPriority(){
						if (settingsLoadFive && pagesLoaded < settingsPagestoload){
							loadPage();
							setTimeout(function() {
								fireAutoJoinPriority();
							}, 50);
							return;
						}	
						var entered = 0;
					for (var i = myLevel; !(i < 0); i--){
                        $('.giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name').each(function(){
							var current = $(this).parent().parent().parent();
							if (settingsIgnoreGroups){
								if ($(current).find('.giveaway__column--group').length != 0){
									console.log(1);
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
                                        code : this.href.substr(35,5)
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
									if(entered < 1){
										$('#info').text('No giveaways entered.');
									}else if(entered == 1){
										$('#info').text('Entered 1 giveaway.');
									}else{
										$('#info').text('Entered '+entered+' giveaways.');
									}
								});
                        });
					}
                    $('#btnJoin').val('Good luck!');
		}
		
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
				var lastpage = 100;
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
			
			if ($('#chkInfiniteScroll').is(':checked')) {chrome.storage.sync.set({'infiniteScrolling': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'infiniteScrolling': 'false'}); totalVarCount--}
			if ($('#chkShowPoints').is(':checked')) {chrome.storage.sync.set({'showPoints': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'showPoints': 'false'}); totalVarCount--}
			if ($('#chkShowButtons').is(':checked')) {chrome.storage.sync.set({'showButtons': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'showButtons': 'false'}); totalVarCount--}
			if ($('#chkLoadFive').is(':checked')) {chrome.storage.sync.set({'loadFive': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'loadFive': 'false'}); totalVarCount--}		
			if ($('#chkHideDlc').is(':checked')) {chrome.storage.sync.set({'hideDlc': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'hideDlc': 'false'}); totalVarCount--}
			if ($('#chkRepeatIfOnPage').is(':checked')) {chrome.storage.sync.set({'repeatIfOnPage': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'repeatIfOnPage': 'false'}); totalVarCount--}
			if ($('#chkNightTheme').is(':checked')) {chrome.storage.sync.set({'nightTheme': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'nightTheme': 'false'}); totalVarCount--}
			if ($('#chkLevelPriority').is(':checked')) {chrome.storage.sync.set({'levelPriority': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'levelPriority': 'false'}); totalVarCount--}
			if ($('#chkLevelPriorityBG').is(':checked')) {chrome.storage.sync.set({'LevelPriorityBG': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'LevelPriorityBG': 'false'}); totalVarCount--}
			if ($('#chkEnableBG').is(':checked')) {chrome.storage.sync.set({'BackgroundAJ': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'BackgroundAJ': 'false'}); totalVarCount--}
			if ($('#chkHideEntered').is(':checked')) {chrome.storage.sync.set({'HideEntered': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'HideEntered': 'false'}); totalVarCount--}
			if ($('#chkIgnoreGroups').is(':checked')) {chrome.storage.sync.set({'IgnoreGroups': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'IgnoreGroups': 'false'}); totalVarCount--}
			if ($('#chkIgnoreGroupsBG').is(':checked')) {chrome.storage.sync.set({'IgnoreGroupsBG': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'IgnoreGroupsBG': 'false'}); totalVarCount--}
			if ($('#chkHideGroups').is(':checked')) {chrome.storage.sync.set({'HideGroups': 'true'}); totalVarCount--}
			else {chrome.storage.sync.set({'HideGroups': 'false'}); totalVarCount--}
			{chrome.storage.sync.set({'repeatHours': $('#hoursField').val()}); totalVarCount--}
			{chrome.storage.sync.set({'RepeatHoursBG': $('#hoursFieldBG').val()}); totalVarCount--}
			{chrome.storage.sync.set({'Pagestoload': $('#pagestoload').val()}); totalVarCount--}
			{chrome.storage.sync.set({'PagestoloadBG': $('#pagestoloadBG').val()}); totalVarCount--}
			{chrome.storage.sync.set({'PageForBG': $('#pageforBG').val()}); totalVarCount--}

			reloadIfSaved();
			
			$("body").children(':not(#settingsDiv)').animate({opacity:1.0}, "slow");
			$("#settingsDiv").animate({
						opacity: 0.0}, {
						easing: 'swing',
						duration: 600,
						complete: function() {/*location.reload()*/}
						});				
		});
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
						if (settingsLevelPriority){
							fireAutoJoinPriority();
						}else{
							fireAutoJoin();
						}
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
		
		if ($('.nav__avatar-outer-wrap').length != 0){
			if($('.nav__avatar-outer-wrap').attr('href') == "/user/Ridden"){
				if ($('.global__image-outer-wrap--game-xlarge').length != 0){
					$('.global__image-outer-wrap--game-xlarge').find('img').attr('src', 'http://www.steamgifts.com/assets/img/cat_sagan.gif');
				}
			}
		}
		
		
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
		});
		if ($('.pinned-giveaways__inner-wrap').children().length == 0){
			$('.pinned-giveaways__inner-wrap').parent().remove();
		}
		
		if(($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settingsInfiniteScrolling) {
			loadPage();
		}
		
		$("#posts").on("click",".giveaway__hide", function(){
			var gameid = $(this).attr('data-game-id');
			$(this).attr('class', 'giveaway__icon giveaway__hide trigger-popup fa fa-refresh fa-spin');
			$.post("/",{
					xsrf_token : token,
					game_id : gameid,
					do : "hide_giveaways_by_game_id"
				},
				function(response){
					$('i[data-game-id="'+gameid+'"]').parent().parent().parent().parent().fadeOut("slow", function() {
						this.hide();
					});
				}
			);
		});
		
		$("#hoursField").on('change keyup', function() {
			var sanitized = $(this).val().replace(/[^0-9]/g, '');
			$(this).val(sanitized);
			if (this.value.length == 0 || this.value < 1 || this.value > 24){
				this.value = 2;
			} 
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
								thisButton.val('Error\n'+json_response.msg);
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
								thisButton.val('Error\n'+json_response.msg);
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
				if (settingsLevelPriority){
					fireAutoJoinPriority();
				}else{
					fireAutoJoin();
				}
			}, 3600000 * settingsRepeatHours);
			//}, 5000 * settingsRepeatHours);
		}						
}

function checkDLCbyImage(giveaway, encc, frontpage){
	//USING STEAMAPI
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
		xhr.open("GET", "http://store.steampowered.com/api/appdetails?appids=" + appid + "&cc=en", true);
	}else{
		xhr.open("GET", "http://store.steampowered.com/api/appdetails?appids=" + appid, true);
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