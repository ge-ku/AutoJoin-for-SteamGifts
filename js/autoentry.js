let giveaways = [];
let settingsInjected = false;
let settings;
let token;
const thisVersion = 20170929;
let currentPoints = 200; // this will contain current amount of poitns

let pageNumber;
let lastPage;
let loadingNextPage;
let pageLink;
let thirdPart;

class Giveaway {
  constructor(code, appid, name, cost, timeleft, level, numberOfCopies, numberOfEntries, status) {
    this.code = code;
    this.appid = appid;
    this.name = name;
    this.cost = cost;
    this.timeleft = timeleft;
    this.level = level;
    this.numberOfCopies = numberOfCopies;
    this.numberOfEntries = numberOfEntries;
    this.status = status; // { Entered, NoPoints, NoLevel }
  }

  async join() {
    const formData = new FormData();
    formData.append('xsrf_token', token);
    formData.append('do', 'entry_insert');
    formData.append('code', this.code);
    return fetch('https://www.steamgifts.com/ajax.php', { method: 'post', credentials: 'include', body: formData })
      .then(resp => resp.json())
      .then((jsonResponse) => {
        if (jsonResponse.type === 'success') {
          this.status = 'Entered';
        } else {
          this.status = 'Error';
          this.errorMsg = jsonResponse.msg;
        }
        // updateButtons();
      });
  }

  async leave() {
    const formData = new FormData();
    formData.append('xsrf_token', token);
    formData.append('do', 'entry_delete');
    formData.append('code', this.code);
    return fetch('https://www.steamgifts.com/ajax.php', { method: 'post', credentials: 'include', body: formData })
      .then(resp => resp.json())
      .then((jsonResponse) => {
        if (jsonResponse.type === 'success') {
          this.status = 'Ready';
        } else {
          this.status = 'Error';
          this.errorMsg = jsonResponse.msg;
        }
        // updateButtons();
      });
  }
}

function parsePage(pageHTML) {
  const timePageLoaded = Date.now();
  const parser = new DOMParser();
  const pageDOM = parser.parseFromString(pageHTML, 'text/html'); // contains DOM of a whole page
  const pageGiveawaysDiv = pageDOM.querySelector('.page__heading + div');
  const giveawaysDOM = pageGiveawaysDiv.querySelectorAll('.giveaway__row-outer-wrap');
  const pageGiveaways = [];

  giveawaysDOM.forEach((giveawayDOM) => {
    const giveawayHeadingName = giveawayDOM.querySelector('.giveaway__heading__name');
    const code = giveawayHeadingName.href.match(/giveaway\/(.+)\//)[1];
    const name = giveawayHeadingName.textContent;
    const appid = giveawayDOM.querySelector('.fa.fa-steam').parentNode.href.match(/\/(\d+)\//)[1];
    const copiesAndCostElements = giveawayDOM.querySelectorAll('.giveaway__heading__thin');
    let cost;
    let numberOfCopies;
    if (copiesAndCostElements.length > 1) {
      numberOfCopies = Number.parseInt(copiesAndCostElements[0].textContent.replace(',', '').match(/\d+/)[0], 10);
      cost = Number.parseInt(copiesAndCostElements[1].textContent.match(/\d+/)[0], 10);
    } else {
      numberOfCopies = 1;
      cost = Number.parseInt(copiesAndCostElements[0].textContent.match(/\d+/)[0], 10);
    }
    const levelMatch = giveawayDOM.querySelector('.giveaway__column--contributor-level');
    const level = (levelMatch) ? Number.parseInt(levelMatch.textContent.match(/Level (\d)/)[1], 10) : 0;
    const numberOfEntries = Number.parseInt(giveawayDOM.querySelector('.fa-tag + span').textContent, 10);
    const timeleft = (giveawayDOM.querySelector('.fa-clock-o + span').dataset.timestamp * 1000) - timePageLoaded;
    const status = { NoPoints: false, NoLevel: false, Entered: false };
    if (currentPoints < cost) {
      status.NoPoints = true;
    }
    if (levelMatch && levelMatch.classList.contains('giveaway__column--contributor-level--negative')) {
      status.NoLevel = true;
    }
    if (giveawayDOM.querySelector('.giveaway__row-inner-wrap').classList.contains('is-faded')) {
      status.Entered = true; // doesn't work for some reason
    }
    const giveaway = new Giveaway(
      code, appid, name, cost, timeleft, level,
      numberOfCopies, numberOfEntries, status,
    );
    pageGiveaways.push(giveaway);
  });
  return pageGiveaways;
}

function modifyPageDOM(pageDOM, timeLoaded) {
  pageDOM.querySelectorAll('.giveaway__row-outer-wrap').forEach((giveaway) => {
    const giveawayInnerWrap = giveaway.querySelector('.giveaway__row-inner-wrap');
    if (settings.HideGroups) {
      if (giveaway.querySelector('.giveaway__column--group')) {
        giveaway.remove();
        return;
      }
    }
    if (giveawayInnerWrap.classList.contains('is-faded')) {
      if (settings.HideEntered) {
        giveaway.remove();
        return;
      } else if (settings.ShowButtons) {
        const leaveBtn = document.createElement('input');
        leaveBtn.type = 'button';
        leaveBtn.value = 'Leave';
        leaveBtn.className = 'btnSingle';
        leaveBtn.setAttribute('walkState', 'leave');
        giveawayInnerWrap.appendChild(leaveBtn);
      }
    } else if (settings.ShowButtons) {
      const joinBtn = document.createElement('input');
      joinBtn.type = 'button';
      joinBtn.className = 'btnSingle';
      if (giveawayInnerWrap.querySelector('.giveaway__column--contributor-level--negative')) {
        joinBtn.value = 'Need a higher level';
        joinBtn.walkState = 'no-level';
        joinBtn.disabled = true;
      } else {
        const pointsAndNumberOfCopies = giveaway.querySelectorAll('.giveaway__heading__thin');
        const pointsNeededRaw = pointsAndNumberOfCopies[pointsAndNumberOfCopies.length - 1].textContent.match(/(\d+)P/);
        const pointsNeeded = pointsNeededRaw[pointsNeededRaw.length - 1];
        if (parseInt(pointsNeeded, 10) > parseInt(document.querySelector('.nav__points').textContent, 10)) {
          joinBtn.value = 'Not enough points';
          joinBtn.setAttribute('walkState', 'no-points');
          joinBtn.disabled = true;
        } else {
          joinBtn.value = 'Join';
          joinBtn.setAttribute('walkState', 'join');
        }
      }
      giveawayInnerWrap.appendChild(joinBtn);
    }
    giveaway.querySelector('.giveaway__hide').dataset.popup = '';
    if (settings.HideDlc) {
      checkDLCbyImage(giveaway, false, true);
    }
    if (settings.ShowChance) {
      const oddsDiv = document.createElement('div');
      oddsDiv.style.cursor = 'help';
      oddsDiv.title = 'approx. odds of winning';
      const oddsIcon = document.createElement('i');
      oddsIcon.className = 'fa fa-trophy';
      const oddsText = document.createTextNode(` ${calculateWinChance(giveaway, timeLoaded)}%`);
      oddsDiv.appendChild(oddsIcon);
      oddsDiv.appendChild(oddsText);
      giveaway.querySelector('.giveaway__columns').insertBefore(oddsDiv, giveaway.querySelector('.giveaway__columns').firstChild);
    }
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'description descriptionLoad';
    const descriptionA = document.createElement('a');
    const descriptionIcon = document.createElement('i');
    descriptionIcon.className = 'fa fa-file-text descriptionIcon';
    const descriptionText = document.createElement('span');
    descriptionText.textContent = 'Show description';
    descriptionA.appendChild(descriptionIcon);
    descriptionA.appendChild(document.createTextNode(' '));
    descriptionA.appendChild(descriptionText);
    descriptionDiv.appendChild(descriptionA);
    giveaway.querySelector('.giveaway__links').appendChild(descriptionDiv);
    if (document.querySelector('.pinned-giveaways__inner-wrap').children.length === 0) {
      document.querySelector('.pinned-giveaways__inner-wrap').remove();
    }
  });
}

chrome.storage.sync.get({
  lastLaunchedVersion: thisVersion,
}, () => {
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
    ShowChance: true,
  }, (data) => {
    settings = data;
    onPageLoad();
  });
});

function onPageLoad() {
  token = document.querySelector('input[name="xsrf_token"]').value;
  let pagesLoaded = 1;
  // parsePage(document.querySelector('html')); // parse this page first
  /* Add AutoJoin and cog button */
  const info = document.createElement('div');
  info.id = 'info';
  document.querySelector('.featured__summary').prepend(info);
  if (settings.AutoJoinButton) {
    const buttonsAJ = document.createElement('div');
    buttonsAJ.id = 'buttonsAJ';
    const btnSettings = document.createElement('button');
    btnSettings.id = 'btnSettings';
    btnSettings.className = 'AutoJoinButtonEnabled';
    const cog = document.createElement('i');
    cog.className = 'fa fa-cog fa-4x fa-inverse';
    btnSettings.appendChild(cog);

    const btnAutoJoin = document.createElement('input');
    btnAutoJoin.id = 'btnAutoJoin';
    btnAutoJoin.type = 'button';
    btnAutoJoin.value = 'AutoJoin';
    btnAutoJoin.addEventListener('click', () => {
      btnAutoJoin.disabled = true;
      if (settings.LoadFive && pagesLoaded < 5) {
        btnAutoJoin.value = 'Loading Pages..';
      }
      fireAutoJoin();
    });

    const suspensionNotice = document.createElement('div');
    suspensionNotice.id = 'suspensionNotice';
    const linkToAnnouncement = document.createElement('a');
    linkToAnnouncement.href = 'http://steamcommunity.com/groups/autojoin#announcements/detail/1485483400577229657';
    linkToAnnouncement.target = '_blank';
    linkToAnnouncement.innerHTML = '<p>By using AutoJoin button and AutoJoin in background you risk getting a suspension.</p><p>Click to read more...</p>';
    suspensionNotice.appendChild(linkToAnnouncement);

    buttonsAJ.appendChild(btnAutoJoin);
    buttonsAJ.appendChild(btnSettings);
    buttonsAJ.appendChild(suspensionNotice);
    document.querySelector('.featured__summary').prepend(buttonsAJ);
  } else {
    const navbar = document.querySelector('.nav__left-container');
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'nav__button-container';
    const button = document.createElement('a');
    button.className = 'nav__button';
    button.id = 'btnSettings';
    button.textContent = 'AutoJoin Settings';
    buttonContainer.appendChild(button);
    navbar.appendChild(buttonContainer);
  }


  /* First time cog/settings button is pressed inject part of settings.html and show it
     If settings already injected just show them */
  document.getElementById('btnSettings').addEventListener('click', () => {
    if (settingsInjected) {
      document.getElementById('settingsShade').classList.replace('fadeOut', 'fadeIn');
      document.getElementById('settingsDiv').classList.replace('fadeOut', 'fadeIn');
    } else {
      settingsInjected = true;
      fetch(chrome.extension.getURL('/html/settings.html'))
        .then(resp => resp.text())
        .then((settingsHTML) => {
          const parser = new DOMParser();
          const settingsDOM = parser.parseFromString(settingsHTML, 'text/html');
          const settingsDiv = settingsDOM.getElementById('bodyWrapper');
          document.querySelector('body').appendChild(settingsDiv);
          loadSettings();
          document.getElementById('settingsShade').classList.add('fadeIn');
          document.getElementById('settingsDiv').classList.add('fadeIn');
        });
    }
  });

  document.querySelector(':not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap').parentNode.id = 'posts'; // give div with giveaways id "posts"

  let accountInfo;
  if (settings.ShowPoints) {
    accountInfo = $('a[href="/account"]')
      .clone().prependTo('body')
      .addClass('pointsFloating')
      .css({ position: 'fixed', opacity: '0' })
      .hide();
  }

  if (settings.InfiniteScrolling) {
    document.querySelector('.widget-container .widget-container--margin-top').remove();
  }
  const splitPageLinkCheck = $('.pagination__navigation').find('a:contains("Next")');
  let onlyOnePage = false;
  if (splitPageLinkCheck.length === 0) {
    pagesLoaded = 9999;
    onlyOnePage = true;
  }

  function loadPage() {
    const timeLoaded = Math.round(Date.now() / 1000); // when the page was loaded (in seconds)
    if (pageNumber > lastPage) {
      loadingNextPage = true;
      pagesLoaded = 9999;
      $('.pagination').hide();
    }
    if (loadingNextPage === false) {
      loadingNextPage = true;

      $('<div>').load(`${window.location.origin + pageLink + pageNumber + thirdPart} :not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap`, function () {
        modifyPageDOM(this, timeLoaded);
        $('#posts').last().append($(this).html());
        pageNumber++;
        pagesLoaded++;
        loadingNextPage = false;
        /* if(($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settings.infiniteScrolling) {
          loadPage();
        } */
      });
    }
  }

  function fireAutoJoin() {
    if (settings.LoadFive && pagesLoaded < settings.PagesToLoad) {
      loadPage();
      setTimeout(() => {
        fireAutoJoin();
      }, 50);
      return;
    }
    let entered = 0;
    let timeouts = [];

    let selectItems = '.giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name';

    // Here I'm filtering the giveaways to enter to only the one created by regular users in the #posts div
    // which means featured giveaways won't be autojoined if users decides so in the options

    if (settings.IgnorePinned) {
      selectItems = `#posts ${selectItems}`;
    }

    $(selectItems).each(function () {
      const current = $(this).parent().parent().parent();

      if (settings.IgnoreGroups) {
        if ($(current).find('.giveaway__column--group').length !== 0) {
          return;
        }
      }
      const cost = parseInt($(current)
        .find('.giveaway__heading__thin')
        .last().html()
        .match(/\d+/)[0], 10);
      if (cost < settings.MinCost) {
        console.log(`^Skipped, cost: ${cost}, your settings.MinCost is ${settings.MinCost}`);
        return;
      }
      timeouts.push(setTimeout($.proxy(function () {
        const formData = new FormData();
        formData.append('xsrf_token', token);
        formData.append('do', 'entry_insert');
        formData.append('code', this.href.split('/')[4]);
        fetch(`${window.location.origin}/ajax.php`, { method: 'post', credentials: 'include', body: formData })
          .then(resp => resp.json())
          .then((jsonResponse) => {
            if (jsonResponse.type === 'success') {
              current.toggleClass('is-faded');
              $('.nav__points').text(jsonResponse.points);
              entered++;
              current.find('.btnSingle').attr('walkState', 'leave').prop('disabled', false).val('Leave');
              updateButtons();
            }
            if (jsonResponse.points < 5) {
              for (let i = 0; i < timeouts.length; i++) {
                clearTimeout(timeouts[i]);
              }
              timeouts = [];
            }
            if (entered < 1) {
              $('#info').text('No giveaways entered.');
            } else {
              $('#info').text(`Entered ${entered} giveaway${(entered !== 1) ? 's' : ''}.`);
            }
          });
      }, this), (timeouts.length * settings.Delay * 1000) + Math.floor(Math.random() * 1000)));
    });
    $('#btnAutoJoin').val('Good luck!');
  }

  if (splitPageLinkCheck.length > 0) {
    const splitPageLink = splitPageLinkCheck.attr('href').split('page=');
    pageLink = `${splitPageLink[0]}page=`;
    pageNumber = splitPageLink[1];
    thirdPart = '';
    if (!$.isNumeric(pageNumber)) {
      thirdPart = pageNumber.substr(pageNumber.indexOf('&'));
      pageNumber = pageNumber.substr(0, pageNumber.indexOf('&'));
    }
    // This is a work-around since steamgifts.com stopped showing last page number.
    // Proper fix is to check every new page's pagination, last page doesn't have "Next" link.
    lastPage = 100;
    // try {
    //   lastPage = ($('.pagination__navigation')
    //     .find('a:contains("Last")')
    //     .attr('href')
    //     .split('page='))[1];
    //   if (!$.isNumeric(lastPage)) {
    //     lastPage = lastPage.substr(0, lastPage.indexOf('&'));
    //   }
    // } catch (e) {
    //   lastPage = 100;
    // }
    loadingNextPage = false;
    if (settings.InfiniteScrolling) {
      $('.pagination').html('<div style = "margin-left: auto; margin-right: auto;"><i style="font-size: 55px" class="fa fa-refresh fa-spin"></i></div>');
    }
    $(window).scroll(() => {
      if ($(window).scrollTop() > $(window).height() * 2 && settings.ShowPoints) {
        accountInfo.show().stop().animate({ opacity: 1 }, 'slow');
      } else if ($(window).scrollTop() < $(window).height() + ($(window).height() / 2) && settings.ShowPoints) {
        accountInfo.stop().animate({
          opacity: 0,
        }, {
          easing: 'swing',
          duration: 200,
          complete: () => { accountInfo.hide(); },
        });
      }
      if (($(window).scrollTop() + $(window).height() > $(document).height() - 600) && settings.InfiniteScrolling) {
        loadPage();
      }
    });
  }

  function updateButtons() {
    if (settings.ShowButtons) {
      document.querySelectorAll('.btnSingle:not([walkState="no-level"])').forEach((el) => {
        if (el.parentElement.classList.contains('is-faded')) {
          const pointsNeededRaw = el.parentElement
            .querySelector('.giveaway__heading__thin')
            .textContent.match(/(\d+)P/);
          const pointsNeeded = parseInt(pointsNeededRaw[pointsNeededRaw.length - 1], 10);
          if (pointsNeeded > parseInt(document.querySelector('.nav__points').textContent, 10)) {
            el.disabled = true;
            el.value = 'Not enough points';
            el.setAttribute('walkState', 'no-points');
          } else {
            el.disabled = false;
            el.value = 'Join';
            el.setAttribute('walkState', 'join');
          }
        }
      });
    }
  }

  const timeOfFirstPage = Math.round(Date.now() / 1000);
  modifyPageDOM(document.querySelector('body'), timeOfFirstPage);

  $('#posts').parent().on('click', '.giveaway__hide', function () {
    const thisPost = $(this).parent()
      .parent()
      .parent()
      .parent();
    const gameid = thisPost.attr('data-game-id');
    console.log(`hiding ${gameid}`);
    $(this).attr('class', 'giveaway__icon giveaway__hide trigger-popup fa fa-refresh fa-spin');
    const formData = new FormData();
    formData.append('xsrf_token', token);
    formData.append('game_id', gameid);
    formData.append('do', 'hide_giveaways_by_game_id');
    fetch(`${window.location.origin}/ajax.php`, { method: 'post', credentials: 'include', body: formData })
      .then(() => {
        $(`[data-game-id='${gameid}']`).each(function () {
          $(this).fadeOut('slow', function () {
            $(this).hide();
          });
        });
      });
  });

  $('#posts').parent().on('click', '.description', function () {
    const thisPost = $(this).parent()
      .parent()
      .parent()
      .parent();
    if ($(this).hasClass('descriptionLoad')) {
      loadDescription(thisPost[0]);
    } else {
      const $descriptionContent = $(thisPost).find('.descriptionContent');
      if ($descriptionContent.hasClass('visible')) {
        $descriptionContent.removeClass('visible');
        $(this).find('span').text('Show description');
      } else {
        $descriptionContent.addClass('visible');
        $(this).find('span').text('Hide description');
      }
    }
  });

  $(document).on('click', '.btnSingle', function () {
    const thisButton = $(this);
    const thisWrap = $(this).parent();
    thisButton.prop('disabled', true);
    const uniqueCode = $(this).parent()
      .find('.giveaway__heading__name')
      .attr('href')
      .substr(10, 5);
    const formData = new FormData();
    formData.append('xsrf_token', token);
    formData.append('code', uniqueCode);
    if ($(this).attr('walkState') === 'join') {
      if (settings.AutoDescription) {
        if (thisWrap.find('.description').hasClass('descriptionLoad')) {
          thisWrap.find('.description').click();
        }
      }
      formData.append('do', 'entry_insert');
      fetch(`${window.location.origin}/ajax.php`, { method: 'post', credentials: 'include', body: formData })
        .then(resp => resp.json())
        .then((jsonResponse) => {
          if (jsonResponse.type === 'success') {
            thisWrap.toggleClass('is-faded');
            if (settings.HideEntered) {
              thisWrap.fadeOut(300, function () { $(this).parent().remove(); });
              $('.nav__points').text(jsonResponse.points);
              updateButtons();
            } else {
              $('.nav__points').text(jsonResponse.points);
              thisButton.attr('walkState', 'leave');
              thisButton.prop('disabled', false);
              thisButton.val('Leave');
              updateButtons();
            }
          } else {
            thisWrap.toggleClass('is-faded');
            thisButton.val(`Error: ${jsonResponse.msg}`);
          }
        });
    } else {
      formData.append('do', 'entry_delete');
      fetch(`${window.location.origin}/ajax.php`, { method: 'post', credentials: 'include', body: formData })
        .then(resp => resp.json())
        .then((jsonResponse) => {
          if (jsonResponse.type === 'success') {
            thisWrap.toggleClass('is-faded');
            $('.nav__points').text(jsonResponse.points);
            thisButton.attr('walkState', 'join');
            thisButton.prop('disabled', false);
            thisButton.val('Join');
            updateButtons();
          } else {
            thisButton.val(`Error: ${jsonResponse.msg}`);
          }
        });
    }
  });

  /* I wonder if anyone actually uses this.. */
  if (settings.RepeatIfOnPage) {
    setInterval(() => {
      if (onlyOnePage) {
        pageLink = window.location.href;
        loadingNextPage = false;
        pageNumber = '';
        thirdPart = '';
        lastPage = 0;
        pagesLoaded = 0;
        $('#posts').empty();
        loadPage();
      } else {
        pagesLoaded = 0;
        pageNumber = 1;
        if (settings.InfiniteScrolling) {
          settings.InfiniteScrolling = false;
          $('#posts').empty();
          loadPage();
          setTimeout(() => { settings.InfiniteScrolling = true; }, 5000);
        } else {
          $('#posts').empty();
          loadPage();
        }
      }
      fireAutoJoin();
    }, 3600000 * settings.RepeatHours);
  }
}

function calculateWinChance(giveaway, timeLoaded) {
  const timeLeft = parseInt(giveaway.querySelector('.fa.fa-clock-o + span').dataset.timestamp, 10); // time left in seconds
  const timePassed = timeLoaded - parseInt(giveaway.querySelector('.giveaway__username').parentElement.querySelector('span').dataset.timestamp, 10); // time passed in seconds
  const numberOfEntries = parseInt(giveaway.querySelector('.fa-tag + span')
    .textContent.replace(',', ''), 10);
  let numberOfCopies = 1;
  if (giveaway.querySelector('.giveaway__heading__thin')
    .textContent.replace(',', '')
    .match(/\(\d+ Copies\)/)) { // if more than one copy there's a text field "(N Copies)"
    numberOfCopies = parseInt(giveaway.querySelector('.giveaway__heading__thin')
      .textContent.replace(',', '')
      .match(/\d+/)[0], 10);
  }
  const predictionOfEntries = (numberOfEntries / timePassed) * timeLeft; // calculate rate of entries and multiply on time left, probably not very accurate as we assume linear rate
  let chance = (1 / (numberOfEntries + 1 + predictionOfEntries)) * 100 * numberOfCopies;
  if (chance > 100) chance = 100;
  return chance.toFixed(3);
}

function loadDescription(giveaway) {
  const giveawayToggleText = giveaway.querySelector('.description span');
  const giveawayURL = giveaway.querySelector('.giveaway__heading__name').href;
  const giveawayDescriptionEl = giveaway.querySelector('.descriptionLoad');
  giveawayToggleText.textContent = 'Hide description';
  giveawayDescriptionEl.className = 'description';
  const giveawayDescriptionWrapper = document.createElement('div');
  giveawayDescriptionWrapper.className = 'descriptionContent visible';
  giveaway.appendChild(giveawayDescriptionWrapper);
  const descriptionIcon = giveaway.querySelector('.descriptionIcon');
  descriptionIcon.className = 'fa fa-refresh fa-spin descriptionIcon';

  fetch(giveawayURL, { credentials: 'include' })
    .then(resp => resp.text())
    .then((giveawayContent) => {
      const parser = new DOMParser();
      const giveawayDOM = parser.parseFromString(giveawayContent, 'text/html');
      let giveawayDescription = giveawayDOM.querySelector('.page__description .markdown');
      if (giveawayDescription == null) {
        giveawayDescription = document.createTextNode('No description.');
      }
      giveawayDescriptionWrapper.appendChild(giveawayDescription);
      descriptionIcon.className = 'fa fa-file-text descriptionIcon';
    });
}

function checkDLCbyImage(giveaway, encc, frontpage) {
  // USING STEAMAPI
  // Maybe should be replaced with local database that contains every DLC appid?
  // Steam API can stop responding if you send many requests in a short period of time
  // DLC list can be retrieved from https://steamdb.info/apps/
  // Flaw: Such list must be updated regulary. Maybe have a local db with every app id (not only DLCs), use Steam API if app id is unknown.
  const t = $(giveaway).find('.giveaway_image_thumbnail');
  let appid = $(t).css('background-image');
  if (appid == null) {
    console.log('error in image');
    return false;
  }
  const appmatch = appid.match(/.+apps\/(\d+)\/cap.+/);
  if (appmatch == null) {
    return false;
  }
  appid = appmatch[1];
  const xhr = new XMLHttpRequest();
  if (encc) {
    xhr.open('GET', `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=en`, true);
  } else {
    xhr.open('GET', `https://store.steampowered.com/api/appdetails?appids=${appid}`, true);
  }
  function checkIfDlc() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const jsonResponse = JSON.parse(this.responseText);
      if (jsonResponse[appid].success === false && !encc) {
        checkDLCbyImage(this, true, frontpage); // try with cc = en
      } else if (jsonResponse[appid].data.type === 'dlc') {
        console.log(`hidden ${appid}`);
        if (frontpage) {
          $(giveaway).parent().remove();
        } else {
          const linkToGiveaway = $(giveaway).find('.giveaway__heading__name').attr('href');
          $(giveaway).parent().remove();
          $('#posts').find(`[href='${linkToGiveaway}']`)
            .parent()
            .parent()
            .remove();
        }
      }
      return true;
    }
    return false;
  }
  xhr.onreadystatechange = checkIfDlc();
  xhr.send();
}
