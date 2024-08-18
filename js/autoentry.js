let giveaways = [];
let settingsInjected = false;
let settings;
let token;
const thisVersion = 20230517;
const currentState = {
  amountOfPoints: 0,
  set points(n) {
    this.amountOfPoints = parseInt(n, 10);
    document.querySelectorAll('.nav__points').forEach((el) => {
      el.textContent = this.amountOfPoints;
    });
  },
  get points() {
    return this.amountOfPoints;
  },
};

let steamAppData = {};
let steamPackageData = {};
let ownedSteamApps = [];
let wishList = [];

let pageNumber;
let lastPage;
let loadingNextPage;
let pageLink;
let thirdPart;

class Giveaway {
  constructor(
    code,
    appid,
    name,
    cost,
    timeleft,
    level,
    numberOfCopies,
    numberOfEntries,
    status
  ) {
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
    return fetch('https://www.steamgifts.com/ajax.php', {
      method: 'post',
      credentials: 'include',
      body: formData,
    })
      .then((resp) => resp.json())
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
    return fetch('https://www.steamgifts.com/ajax.php', {
      method: 'post',
      credentials: 'include',
      body: formData,
    })
      .then((resp) => resp.json())
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
  const giveawaysDOM = pageGiveawaysDiv.querySelectorAll(
    '.giveaway__row-outer-wrap'
  );
  const pageGiveaways = [];

  giveawaysDOM.forEach((giveawayDOM) => {
    const giveawayHeadingName = giveawayDOM.querySelector(
      '.giveaway__heading__name'
    );
    const code = giveawayHeadingName.href.match(/giveaway\/(.+)\//)[1];
    const name = giveawayHeadingName.textContent;
    const appid = giveawayDOM
      .querySelector('.fa.fa-steam')
      .parentNode.href.match(/\/(\d+)\//)[1];
    const copiesAndCostElements = giveawayDOM.querySelectorAll(
      '.giveaway__heading__thin'
    );
    let cost;
    let numberOfCopies;
    if (copiesAndCostElements.length > 1) {
      numberOfCopies = Number.parseInt(
        copiesAndCostElements[0].textContent.replace(',', '').match(/\d+/)[0],
        10
      );
      cost = Number.parseInt(
        copiesAndCostElements[1].textContent.match(/\d+/)[0],
        10
      );
    } else {
      numberOfCopies = 1;
      cost = Number.parseInt(
        copiesAndCostElements[0].textContent.match(/\d+/)[0],
        10
      );
    }
    const levelMatch = giveawayDOM.querySelector(
      '.giveaway__column--contributor-level'
    );
    const level = levelMatch
      ? Number.parseInt(levelMatch.textContent.match(/Level (\d)/)[1], 10)
      : 0;
    const numberOfEntries = Number.parseInt(
      giveawayDOM.querySelector('.fa-tag + span').textContent,
      10
    );
    const timeleft =
      giveawayDOM.querySelector('.fa-clock-o + span').dataset.timestamp * 1000 -
      timePageLoaded;
    const status = { NoPoints: false, NoLevel: false, Entered: false };
    if (currentState.points < cost) {
      status.NoPoints = true;
    }
    if (
      levelMatch &&
      levelMatch.classList.contains(
        'giveaway__column--contributor-level--negative'
      )
    ) {
      status.NoLevel = true;
    }
    if (
      giveawayDOM
        .querySelector('.giveaway__row-inner-wrap')
        .classList.contains('is-faded')
    ) {
      status.Entered = true; // doesn't work for some reason
    }
    const giveaway = new Giveaway(
      code,
      appid,
      name,
      cost,
      timeleft,
      level,
      numberOfCopies,
      numberOfEntries,
      status
    );
    pageGiveaways.push(giveaway);
  });
  return pageGiveaways;
}

function modifyPageDOM(pageDOM, timeLoaded) {
  pageDOM.querySelectorAll('.giveaway__row-outer-wrap').forEach((giveaway) => {
    const giveawayInnerWrap = giveaway.querySelector(
      '.giveaway__row-inner-wrap'
    );

    const levelEl = giveaway.querySelector(
      '.giveaway__column--contributor-level'
    );
    let level;
    if (levelEl === null) {
      level = 0;
    } else {
      level = parseInt(levelEl.textContent.match(/\d+/)[0], 10);
    }
    if (level < settings.HideLevelsBelow) giveaway.remove();
    if (level > settings.HideLevelsAbove) giveaway.remove();

    if (settings.HideCostsBelow > 0) {
      const copiesAndCostElements = giveaway.querySelectorAll(
        '.giveaway__heading__thin'
      );
      let costElement;
      if (copiesAndCostElements.length > 1) {
        costElement = copiesAndCostElements[1];
      } else {
        costElement = copiesAndCostElements[0];
      }
      const cost = Number.parseInt(costElement.textContent.match(/\d+/)[0], 10);
      if (cost < settings.HideCostsBelow) giveaway.remove();
    }
    if (settings.HideCostsAbove < 50) {
      const copiesAndCostElements = giveaway.querySelectorAll(
        '.giveaway__heading__thin'
      );
      let costElement;
      if (copiesAndCostElements.length > 1) {
        costElement = copiesAndCostElements[1];
      } else {
        costElement = copiesAndCostElements[0];
      }
      const cost = Number.parseInt(costElement.textContent.match(/\d+/)[0], 10);
      if (cost > settings.HideCostsAbove) giveaway.remove();
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
      if (
        giveawayInnerWrap.querySelector(
          '.giveaway__column--contributor-level--negative'
        )
      ) {
        joinBtn.value = 'Need a higher level';
        joinBtn.setAttribute('walkState', 'no-level');
        joinBtn.disabled = true;
      } else {
        const pointsAndNumberOfCopies = giveaway.querySelectorAll(
          '.giveaway__heading__thin'
        );
        const pointsNeededRaw =
          pointsAndNumberOfCopies[
            pointsAndNumberOfCopies.length - 1
          ].textContent.match(/(\d+)P/);
        const pointsNeeded = pointsNeededRaw[pointsNeededRaw.length - 1];
        if (parseInt(pointsNeeded, 10) > currentState.points) {
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

    const giveawayHideEl = giveaway.querySelector('.giveaway__hide');
    if (giveawayHideEl) giveawayHideEl.dataset.popup = '';
    if (
      settings.HideDlc ||
      settings.HideNonTradingCards ||
      settings.HideGroups
    ) {
      checkAppData(giveaway, timeLoaded);
    }
    if (settings.ShowChance) {
      const oddsDiv = document.createElement('div');
      oddsDiv.style.cursor = 'help';
      oddsDiv.title = 'approx. odds of winning';
      const oddsIcon = document.createElement('i');
      oddsIcon.className = 'fa fa-trophy';
      const oddsText = document.createTextNode(
        ` ${calculateWinChance(giveaway, timeLoaded)}%`
      );
      oddsDiv.appendChild(oddsIcon);
      oddsDiv.appendChild(oddsText);
      giveaway
        .querySelector('.giveaway__columns')
        .insertBefore(
          oddsDiv,
          giveaway.querySelector('.giveaway__columns').firstChild
        );
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
    if (
      document.querySelector('.pinned-giveaways__inner-wrap') &&
      document.querySelector('.pinned-giveaways__inner-wrap').children
        .length === 0
    ) {
      document.querySelector('.pinned-giveaways__inner-wrap').remove();
    }
    let timeRemaining =
      giveaway.querySelector('.fa-clock-o + span').dataset.timestamp -
      timeLoaded;
    if (settings.PreciseTime) {
      giveaway.querySelector('.fa-clock-o + span').textContent =
        secToTime(timeRemaining);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', getSettings);
} else {
  getSettings();
}

function getSettings() {
  chrome.storage.sync.get(
    {
      lastLaunchedVersion: thisVersion,
    },
    () => {
      chrome.storage.sync.get(
        {
          AutoJoinButton: false,
          AutoDescription: true,
          AutoComment: false,
          Comment: '',
          IgnoreGroups: false,
          IgnorePinned: true,
          IgnoreWhitelist: false,
          IgnoreGroupsBG: false,
          IgnorePinnedBG: true,
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
          HideEntered: false,
          HideGroups: false,
          HideNonTradingCards: false,
          HideWhitelist: false,
          HideLevelsBelow: 0,
          HideCostsBelow: 0,
          HideLevelsAbove: 10,
          HideCostsAbove: 50,
          PriorityGroup: false,
          PriorityRegion: false,
          PriorityWhitelist: false,
          PriorityWishlist: true,
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
          MaxCost: -1,
          MaxCostBG: -1,
          ShowChance: true,
          PreciseTime: false,
        },
        (data) => {
          settings = data;
          loadCache();
        }
      );
    }
  );
}

function loadCache() {
  if (
    !settings.HideDlc &&
    !settings.HideNonTradingCards &&
    !settings.HideGroups
  ) {
    // skip loading and updating cache in no setting that uses it is turned on
    onPageLoad();
    return;
  }

  chrome.storage.local.get(async (data) => {
    if (typeof data.Packages != 'undefined') {
      steamPackageData = data.Packages;
      console.log('Steam packages that are already cached: ', steamPackageData);
    }
    if (typeof data.Apps != 'undefined') {
      steamAppData = data.Apps;
      console.log('Steam apps that are already cached: ', steamAppData);
    }

    let userProfile = document.querySelector(
      '.nav__button-container--notification a.nav__avatar-outer-wrap'
    ).href;
    let steamProfileID;

    if (userProfile == undefined) {
      return;
    }

    let url = userProfile;
    let response = await chrome.runtime.sendMessage({
      task: 'fetch',
      url,
    });
    if (response.status === 200) {
      let regex = /steamcommunity\.com\/profiles\/(\d+)/g;
      let matches;
      while ((matches = regex.exec(response.text)) != null) {
        steamProfileID = matches[1];
      }
      if (typeof data[steamProfileID] != 'undefined') {
        ownedSteamApps = data[steamProfileID].ownedGames;
        console.log('Owned games: ', ownedSteamApps);
        wishList = data[steamProfileID].wishlist;
        console.log('Wishlist: ', wishList);
      }

      onPageLoad(); // should be after updating cache, but it takes a lot of time

      url = `https://steamcommunity.com/profiles/${steamProfileID}/games?tab=all`;
      response = await chrome.runtime.sendMessage({
        task: 'fetch',
        url,
      });
      if (response.status === 200) {
        let regex = /rgGames\s=\s(.*);/g;
        let regexResponse = regex.exec(response.text);
        if (regexResponse != null) {
          let jsonResponse = JSON.parse(regexResponse[1]);
          ownedSteamApps = [];
          for (let i = 0, numApps = jsonResponse.length; i < numApps; i++) {
            ownedSteamApps.push(jsonResponse[i].appid);
          }
          let ownedSteamAppsObj = {};
          ownedSteamAppsObj[steamProfileID] = {
            ownedGames: ownedSteamApps,
            wishlist: wishList,
          };
          chrome.storage.local.set(ownedSteamAppsObj);
        }
      }

      url = `https://steamcommunity.com/profiles/${steamProfileID}/wishlist`;
      response = await chrome.runtime.sendMessage({
        task: 'fetch',
        url,
      });
      if (response.status === 200) {
        let regex = /steamcommunity\.com\/app\/(\d+)/g;
        let matches;
        wishList = [];
        while ((matches = regex.exec(response.text)) != null) {
          wishList.push(parseInt(matches[1]), 10);
        }
        let ownedSteamAppsObj = {};
        ownedSteamAppsObj[steamProfileID] = {
          ownedGames: ownedSteamApps,
          wishlist: wishList,
        };
        chrome.storage.local.set(ownedSteamAppsObj);
      }
    } else {
      onPageLoad();
    }
  });
}

function onPageLoad() {
  token = document.querySelector('input[name="xsrf_token"]').value;
  let pagesLoaded = 1;
  currentState.points = document
    .querySelector('.nav__points')
    .textContent.replace(',', '');
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
    linkToAnnouncement.href =
      'http://steamcommunity.com/groups/autojoin#announcements/detail/1485483400577229657';
    linkToAnnouncement.target = '_blank';
    linkToAnnouncement.innerHTML =
      '<p>By using AutoJoin button and AutoJoin in background you risk getting a suspension.</p><p>Click to read more...</p>';
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
      document
        .getElementById('settingsShade')
        .classList.replace('fadeOut', 'fadeIn');
      document
        .getElementById('settingsDiv')
        .classList.replace('fadeOut', 'fadeIn');
    } else {
      settingsInjected = true;
      fetch(chrome.runtime.getURL('/html/settings.html'))
        .then((resp) => resp.text())
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

  document.querySelector(
    ':not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap'
  ).parentNode.id = 'posts'; // give div with giveaways id "posts"

  let accountInfo = null;
  if (settings.ShowPoints) {
    accountInfo = document.querySelector('a[href="/account"]').cloneNode(true);
    accountInfo.classList.add('pointsFloating');
    accountInfo.style.position = 'fixed';
    accountInfo.style.opacity = '0';
    accountInfo.style.top = '4em';
    document.querySelector('body').prepend(accountInfo);
  }

  if (settings.InfiniteScrolling) {
    document
      .querySelector('.widget-container .widget-container--margin-top')
      ?.remove();
  }
  const splitPageLinks = document.querySelectorAll('.pagination__navigation a');
  const splitPageHasNext = document
    .querySelector('.pagination__navigation')
    ?.textContent.includes('Next');
  let onlyOnePage = false;
  if (splitPageHasNext) {
    pagesLoaded = 9999;
    onlyOnePage = true;
  }

  async function loadPage() {
    if (lastPage) {
      return;
    }
    const timeLoaded = Math.round(Date.now() / 1000); // when the page was loaded (in seconds)
    if (loadingNextPage === false) {
      loadingNextPage = true;

      const res = await fetch(pageLink + pageNumber + thirdPart);
      if (!res.ok) {
        console.error(`Error loading next page: HTTP ${res.status}`);
        return;
      }
      const html = await res.text();
      const domParser = new DOMParser();
      const dom = domParser.parseFromString(html, 'text/html');

      const gaElements = dom.querySelectorAll(
        ':not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap'
      );
      const containerEl = document.createElement('div');
      containerEl.append(`Page ${pageNumber}`);
      containerEl.append(...gaElements);
      if (gaElements.length < 50) {
        lastPage = true;
        pagesLoaded = 9999;
        document.querySelector('.pagination').display = 'none';
      }
      modifyPageDOM(containerEl, timeLoaded);
      [...document.querySelectorAll('#posts')].at(-1).append(containerEl);
      pageNumber++;
      pagesLoaded++;
      loadingNextPage = false;
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

    let selectItems =
      '.giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name';

    // Here I'm filtering the giveaways to enter only those created by regular users in the #posts div
    // which means featured giveaways won't be autojoined if user decides so in the options

    if (settings.IgnorePinned) {
      selectItems = `#posts ${selectItems}`;
    }

    const myLevel = parseInt(
      document
        .querySelector('a[href="/account"] span:nth-child(2)')
        .textContent.match(/(\d+)/)[1],
      10
    );
    for (let level = myLevel; level >= 0; level--) {
      document.querySelectorAll(selectItems).forEach((el) => {
        const current = el.closest('.giveaway__row-inner-wrap');
        let whiteListGiveaway = Boolean(
          current.querySelector('.giveaway__column--whitelist')
        );
        let regionLockedGiveaway = Boolean(
          current.querySelector('.giveaway__column--region-restricted')
        );
        let steamGroupGiveaway = Boolean(
          current.querySelector('.giveaway__column--group')
        );
        let giveawayLevel = Boolean(
          current.querySelector('.giveaway__column--contributor-level')
        )
          ? parseInt(
              current
                .querySelector('.giveaway__column--contributor-level')
                .textContent.match(/Level (\d)/)[1]
            )
          : 0;
        if (
          giveawayLevel == level ||
          (priorityGiveaway(
            current,
            steamGroupGiveaway,
            regionLockedGiveaway,
            whiteListGiveaway
          ) &&
            !ignoreGiveaway(steamGroupGiveaway, whiteListGiveaway))
        ) {
          const cost = parseInt(
            [...current.querySelectorAll('.giveaway__heading__thin')]
              .at(-1)
              .textContent.match(/\d+/)[0],
            10
          );
          if (
            cost >= settings.MinCost &&
            (settings.MaxCost == -1 || cost <= settings.MaxCost)
          ) {
            timeouts.push(
              setTimeout(function () {
                const code = current
                  .querySelector('a.giveaway__heading__name')
                  .href.match(/.+giveaway\/(.+)\//)[1];
                const formData = new FormData();
                formData.append('xsrf_token', token);
                formData.append('do', 'entry_insert');
                formData.append('code', code);
                fetch(`${window.location.origin}/ajax.php`, {
                  method: 'post',
                  credentials: 'include',
                  body: formData,
                })
                  .then((resp) => resp.json())
                  .then((jsonResponse) => {
                    if (jsonResponse.type === 'success') {
                      current.classList.toggle('is-faded');
                      currentState.points = jsonResponse.points.replace(
                        ',',
                        ''
                      );
                      entered++;
                      const btnEl = current.querySelector('.btnSingle');
                      btnEl.setAttribute('walkState', 'leave');
                      btnEl.disabled = false;
                      btnEl.textContent = 'Leave';
                      updateButtons();
                    }
                    if (jsonResponse.points < 5) {
                      for (let i = 0; i < timeouts.length; i++) {
                        clearTimeout(timeouts[i]);
                      }
                      timeouts = [];
                    }
                    if (entered < 1) {
                      document.querySelector('#info').textContent =
                        'No giveaways entered.';
                    } else {
                      document.querySelector(
                        '#info'
                      ).textContent = `Entered ${entered} giveaway${
                        entered !== 1 ? 's' : ''
                      }.`;
                    }
                  });
              }, timeouts.length * settings.Delay * 1000 +
                Math.floor(Math.random() * 1000))
            );
          } else {
            if (cost < settings.MinCost) {
              console.log(
                `^Skipped, cost: ${cost}, your settings.MinCost is ${settings.MinCost}`
              );
            } else {
              console.log(
                `^Skipped, cost: ${cost}, your settings.MaxCost is ${settings.MaxCost}`
              );
            }
          }
        }
      });
    }
    document.querySelector('#btnAutoJoin').textContent = 'Good luck!';
  }

  if (splitPageHasNext) {
    const splitPageLink =
      splitPageLinks[splitPageLinks.length - 1].href.split('page=');
    pageLink = `${splitPageLink[0]}page=`;
    pageNumber = splitPageLink[1];
    thirdPart = '';
    if (!isFinite(pageNumber) || pageNumber < 1) {
      thirdPart = pageNumber.substr(pageNumber.indexOf('&'));
      pageNumber = pageNumber.substr(0, pageNumber.indexOf('&'));
    }
    // This is a work-around since steamgifts.com stopped showing last page number.
    // Proper fix is to check every new page's pagination, last page doesn't have "Next" link.
    // lastPage = 100;
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
      const spinnerEl = document.createElement('div');
      spinnerEl.style.marginLeft = 'auto';
      spinnerEl.style.marginRight = 'auto';
      const spinnerInnerEl = document.createElement('i');
      spinnerInnerEl.classList.add('fa', 'fa-refresh', 'fa-spin');
      spinnerEl.append(spinnerInnerEl);
      document.querySelector('.pagination').replaceChildren(spinnerEl);
    }
    window.addEventListener('scroll', () => {
      const currentPos = document.querySelector('html').scrollTop;
      const viewHeight = window.innerHeight;
      const pageHeight = document.body.scrollHeight;

      if (currentPos > viewHeight * 2 && settings.ShowPoints) {
        if (accountInfo) {
          // todo: return animations
          accountInfo.style.display = 'block';
          accountInfo.style.opacity = '1';
        }
      } else if (
        currentPos < viewHeight + viewHeight / 2 &&
        settings.ShowPoints
      ) {
        if (accountInfo) {
          // todo: return animations
          accountInfo.style.display = 'none';
          accountInfo.style.opacity = '0';
        }
      }
      if (
        currentPos + viewHeight > pageHeight - 600 &&
        settings.InfiniteScrolling
      ) {
        loadPage();
      }
    });
  }

  function updateButtons() {
    if (settings.ShowButtons) {
      document
        .querySelectorAll('.btnSingle:not([walkState="no-level"])')
        .forEach((el) => {
          if (!el.parentElement.classList.contains('is-faded')) {
            const pointsNeededRaw = el.parentElement
              .querySelector('.giveaway__heading__thin:last-of-type')
              .textContent.match(/(\d+)P/);
            const pointsNeeded = parseInt(
              pointsNeededRaw[pointsNeededRaw.length - 1],
              10
            );
            if (pointsNeeded > currentState.points) {
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

  document
    .querySelector('#posts')
    .parentElement.addEventListener('click', (event) => {
      if (!event.target) return;

      let clickedEl = event.target.closest('.giveaway__hide');
      if (clickedEl) {
        const thisPost = clickedEl.closest('.giveaway__row-outer-wrap');
        const gameid = thisPost.dataset.gameId;
        console.log(`hiding ${gameid}`);
        clickedEl.classList.remove('fa-eye-slash');
        clickedEl.classList.add('fa-refresh', 'fa-spin');

        const formData = new FormData();
        formData.append('xsrf_token', token);
        formData.append('game_id', gameid);
        formData.append('do', 'hide_giveaways_by_game_id');
        fetch(`${window.location.origin}/ajax.php`, {
          method: 'post',
          credentials: 'include',
          body: formData,
        }).then(() => {
          document
            .querySelectorAll(`[data-game-id='${gameid}']`)
            .forEach((el) => {
              el.style.opacity = '0';
              el.style.display = 'none';
              // todo: return animations
            });
        });
      }

      clickedEl = event.target.closest('.description');
      if (clickedEl) {
        const thisPost = clickedEl.closest('.giveaway__row-outer-wrap');
        if (clickedEl.classList.contains('descriptionLoad')) {
          loadDescription(thisPost);
        } else {
          const descriptionContent = thisPost.querySelector(
            '.descriptionContent'
          );
          if (descriptionContent.classList.toggle('visible')) {
            clickedEl.querySelector('span').textContent = 'Hide description';
          } else {
            clickedEl.querySelector('span').textContent = 'Show description';
          }
        }
      }
    });

  document.addEventListener('click', async (event) => {
    const clickedEl = event.target.closest('.btnSingle');
    if (clickedEl) {
      const thisButton = clickedEl;
      const thisWrap = thisButton.parentElement;
      thisButton.disabled = true;
      const giveawayUrlPath = thisWrap.querySelector(
        '.giveaway__heading__name'
      ).href;
      const uniqueCode = giveawayUrlPath.match(/.+giveaway\/(.+)\//)[1];
      if (!uniqueCode) return;

      const formData = new FormData();
      formData.append('xsrf_token', token);
      formData.append('code', uniqueCode);
      if (thisButton.getAttribute('walkState') === 'join') {
        if (settings.AutoDescription) {
          if (
            thisWrap
              .querySelector('.description')
              .classList.contains('descriptionLoad')
          ) {
            thisWrap.querySelector('.description').click();
          }
        }
        formData.append('do', 'entry_insert');
        const res = await fetch(`${window.location.origin}/ajax.php`, {
          method: 'post',
          credentials: 'include',
          body: formData,
        });
        if (!res.ok) {
          console.error(`Error entering giveaway: HTTP ${res.status}`);
          return;
        }
        const json = await res.json();
        if (json.type === 'success') {
          thisWrap.classList.toggle('is-faded');
          if (settings.HideEntered) {
            thisWrap.style.opacity = '0';
            thisWrap.style.display = 'none';
            thisWrap.parentElement.remove();
            // todo: return animations
          } else {
            thisButton.setAttribute('walkState', 'leave');
            thisButton.disabled = false;
            thisButton.textContent = 'Leave';
          }
          currentState.points = json.points.replace(',', '');
          updateButtons();
          /* Post Comment */
          if (settings.AutoComment && settings.Comment) {
            /* parse comment settings */
            let comments = settings.Comment.split('#').map((comment) =>
              comment.trim()
            );
            let chosenComment =
              comments[Math.floor(Math.random() * comments.length)];
            if (chosenComment) {
              // checks if an empty comment has been selected
              const formData = new FormData();
              formData.append('xsrf_token', token);
              formData.append('do', 'comment_new');
              formData.append('description', chosenComment);
              formData.append('parent_id', '');
              const res = await fetch(giveawayUrlPath, {
                method: 'post',
                credentials: 'include',
                body: formData,
              });
              if (!res.ok) {
                console.error(`Error leaving comment: HTTP ${res.status}`);
              } else {
                const json = await res.json();
                console.debug('Comment response', jsonResponse);
              }
            }
          }
        } else {
          thisWrap.classList.toggle('is-faded');
          thisButton.textContent = `Error: ${json.msg}`;
        }
      } else {
        formData.append('do', 'entry_delete');
        const res = await fetch(`${window.location.origin}/ajax.php`, {
          method: 'post',
          credentials: 'include',
          body: formData,
        });
        if (!res.ok) {
          console.error(`Error leaving giveaway: HTTP ${res.status}`);
          return;
        }
        const json = await res.json();
        if (json.type === 'success') {
          thisWrap.classList.toggle('is-faded');
          currentState.points = json.points.replace(',', '');
          thisButton.setAttribute('walkState', 'join');
          thisButton.disabled = false;
          thisButton.textContent = 'Join';
          updateButtons();
        } else {
          thisButton.textContent = `Error: ${json.msg}`;
        }
      }
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
        lastPage = true;
        pagesLoaded = 0;
        document.querySelector('#posts').replaceChildren();
        loadPage();
      } else {
        pagesLoaded = 0;
        pageNumber = 1;
        if (settings.InfiniteScrolling) {
          settings.InfiniteScrolling = false;
          document.querySelector('#posts').replaceChildren();
          loadPage();
          setTimeout(() => {
            settings.InfiniteScrolling = true;
          }, 5000);
        } else {
          document.querySelector('#posts').replaceChildren();
          loadPage();
        }
      }
      fireAutoJoin();
    }, 3600000 * settings.RepeatHours);
  }
}

function calculateWinChance(giveaway, timeLoaded) {
  const timeLeft =
    parseInt(
      giveaway.querySelector('.fa.fa-clock-o + span').dataset.timestamp,
      10
    ) - timeLoaded; // time left in seconds
  const timePassed =
    timeLoaded -
    parseInt(
      giveaway
        .querySelector('.giveaway__username')
        .parentElement.querySelector('span').dataset.timestamp,
      10
    ); // time passed in seconds
  const numberOfEntries = parseInt(
    giveaway.querySelector('.fa-tag + span').textContent.replace(',', ''),
    10
  );
  let numberOfCopies = 1;
  if (
    giveaway
      .querySelector('.giveaway__heading__thin')
      .textContent.replace(',', '')
      .match(/\(\d+ Copies\)/)
  ) {
    // if more than one copy there's a text field "(N Copies)"
    numberOfCopies = parseInt(
      giveaway
        .querySelector('.giveaway__heading__thin')
        .textContent.replace(',', '')
        .match(/\d+/)[0],
      10
    );
  }
  const predictionOfEntries = (numberOfEntries / timePassed) * timeLeft; // calculate rate of entries and multiply on time left, probably not very accurate as we assume linear rate
  let chance =
    (1 / (numberOfEntries + 1 + predictionOfEntries)) * 100 * numberOfCopies;
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
    .then((resp) => resp.text())
    .then((giveawayContent) => {
      const parser = new DOMParser();
      const giveawayDOM = parser.parseFromString(giveawayContent, 'text/html');
      let giveawayDescription = giveawayDOM.querySelector(
        '.page__description .markdown'
      );
      if (giveawayDescription == null) {
        giveawayDescription = document.createTextNode('No description.');
      }
      giveawayDescriptionWrapper.appendChild(giveawayDescription);
      descriptionIcon.className = 'fa fa-file-text descriptionIcon';
    });
}

async function checkAppData(giveaway, timeLoaded) {
  // USING STEAMAPI
  let appId = getSteamAppId(giveaway);

  if (appId != false) {
    let cacheData =
      steamAppData[appId] != undefined ? steamAppData[appId] : undefined;
    let lastUpdated = cacheData != undefined ? cacheData.lastUpdated : 0;

    if (
      cacheData != undefined &&
      filterGiveaway(giveaway, appId, cacheData.type, cacheData.hasTradingCards)
    ) {
      removeGiveaway('app', appId, giveaway);
    }
    if (
      cacheData == undefined ||
      timeLoaded - lastUpdated >= 604800 ||
      cacheData.version != thisVersion
    ) {
      const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=basic,categories`;
      let response = await chrome.runtime.sendMessage({
        task: 'fetch',
        url,
      });
      if (response.status === 200) {
        let jsonResponse = JSON.parse(response.text);
        if (jsonResponse[appId].success == true) {
          let tradingCards =
            jsonResponse[appId].data.categories != undefined
              ? jsonResponse[appId].data.categories.some(function (data) {
                  return data.id == 29;
                })
              : false;
          cacheSteamAppData(
            appId,
            jsonResponse[appId].data.type,
            tradingCards,
            lastUpdated,
            timeLoaded
          );
          if (
            filterGiveaway(
              giveaway,
              appId,
              jsonResponse[appId].data.type,
              tradingCards
            )
          ) {
            removeGiveaway('app', appId, giveaway);
          }
        }
      }
    }
  } else {
    checkSteamPackageData(giveaway, timeLoaded);
  }
}

async function checkSteamPackageData(giveaway, timeLoaded) {
  let packageId = getSteamPackageId(giveaway);
  if (packageId == false) {
    return;
  }
  let appIds = [];
  let cacheData =
    steamPackageData[packageId] != undefined
      ? steamPackageData[packageId]
      : undefined;
  let lastUpdated = cacheData != undefined ? cacheData.lastUpdated : 0;

  if (cacheData != undefined) {
    appIds = steamPackageData[packageId].appIds;
    // console.log('Steam package already cached: ', steamPackageData[packageId]);
    checkSteamPackageApps(appIds, packageId, giveaway, timeLoaded);
  }
  if (
    cacheData == undefined ||
    timeLoaded - lastUpdated >= 604800 ||
    cacheData.version != thisVersion
  ) {
    let url = `https://store.steampowered.com/api/packagedetails?packageids=${packageId}`;
    let response = await chrome.runtime.sendMessage({
      task: 'fetch',
      url,
    });
    if (response.status === 200) {
      let jsonResponse = JSON.parse(response.text);
      if (jsonResponse[packageId].success == true) {
        let jsonIds = jsonResponse[packageId].data.apps;
        for (
          let i = 0, numIds = jsonIds != null ? jsonIds.length : 0;
          i < numIds;
          i++
        ) {
          appIds[i] = jsonIds[i].id;
        }
        cacheSteamPackageData(packageId, appIds, lastUpdated, timeLoaded);
      }
      checkSteamPackageApps(appIds, packageId, giveaway, timeLoaded);
    }
  }
}

async function checkSteamPackageApps(appIds, packageId, giveaway, timeLoaded) {
  let removePackage = true;
  for (let i = 0; i < appIds.length; i++) {
    let appId = appIds[i];
    let cacheData =
      steamAppData[appId] != undefined ? steamAppData[appId] : undefined;
    let lastUpdated = cacheData != undefined ? cacheData.lastUpdated : 0;

    if (cacheData != undefined) {
      if (
        cacheData != undefined &&
        !filterGiveaway(
          giveaway,
          appId,
          cacheData.appType,
          cacheData.hasTradingCards
        )
      ) {
        removePackage = false;
      }
    }
    if (
      cacheData == undefined ||
      timeLoaded - lastUpdated >= 604800 ||
      cacheData.version != thisVersion
    ) {
      let url = `https://store.steampowered.com/api/packagedetails?packageids=${packageId}`;
      let response = await chrome.runtime.sendMessage({
        task: 'fetch',
        url,
      });
      if (response.status === 200) {
        let jsonResponse = JSON.parse(response.text);
        if (jsonResponse[appId]?.success == true) {
          tradingCards =
            jsonResponse[appId].data.categories != undefined
              ? jsonResponse[appId].data.categories.some(function (data) {
                  return data.id == 29;
                })
              : false;
          cacheSteamAppData(
            appId,
            jsonResponse[appId].data.type,
            tradingCards,
            lastUpdated,
            timeLoaded
          );
          if (
            !filterGiveaway(
              giveaway,
              appId,
              jsonResponse[appId].data.type,
              tradingCards
            )
          ) {
            removePackage = false;
          }
        }
      }
    }
    if (!removePackage) {
      break;
    }
  }
  if (removePackage) {
    removeGiveaway('package', packageId, giveaway);
  }
}

function cacheSteamAppData(
  appId,
  appType,
  tradingCards,
  lastUpdated,
  timeLoaded
) {
  if (
    steamAppData[appId] === undefined ||
    timeLoaded - lastUpdated >= 604800 ||
    steamAppData[appId].version != thisVersion
  ) {
    steamAppData[appId] = {
      appId,
      type: appType,
      hasTradingCards: tradingCards,
      lastUpdated: timeLoaded,
      version: thisVersion,
    };

    let cacheAppData = {};
    cacheAppData.Apps = steamAppData;
    chrome.storage.local.set(cacheAppData, () => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      } else {
        console.log('Cached', steamAppData[appId]);
      }
    });
  }
}

function cacheSteamPackageData(packageId, appIds, lastUpdated, timeLoaded) {
  if (
    steamPackageData[packageId] === undefined ||
    timeLoaded - lastUpdated >= 604800 ||
    steamPackageData[packageId].version != thisVersion
  ) {
    steamPackageData[packageId] = {
      packageId,
      appIds,
      lastUpdated: timeLoaded,
      version: thisVersion,
    };

    let cachePackageData = {};
    cachePackageData.Packages = steamPackageData;
    chrome.storage.local.set(cachePackageData, () => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      } else {
        console.log('Cached', steamPackageData[packageId]);
      }
    });
  }
}

function getSteamAppId(giveaway) {
  let steamLink = giveaway.querySelector('.fa-steam')?.parentElement?.href;
  if (!steamLink) {
    console.log('error retrieving app id');
    return false;
  }
  const appmatch = steamLink.match(/.+app\/(\d+)\//);
  if (appmatch == null) {
    return false;
  }
  return parseInt(appmatch[1], 10);
}

function getSteamPackageId(giveaway) {
  let t = giveaway.querySelector(
    '.giveaway__summary .giveaway__heading .giveaway__icon'
  );
  let steamLink = t.href;
  if (steamLink == null) {
    console.log('error retrieving package id');
    return false;
  }
  let packagematch = steamLink.match(/.+sub\/(\d+)\//);
  if (packagematch == null) {
    return false;
  }
  return parseInt(packagematch[1], 10);
}

function removeGiveaway(type, id, giveaway) {
  if (
    !giveaway.parentElement?.classList.contains('pinned-giveaways__inner-wrap')
  ) {
    console.log(`hidden ${type}: ${id}`);
    giveaway.remove();
  }
}

function priorityGiveaway(giveaway, steamGroup, regionLocked, whitelist) {
  if (settings.PriorityWishlist && inWishlist(getSteamAppId(giveaway))) {
    return true;
  } else if (settings.PriorityGroup && steamGroup) {
    return true;
  } else if (settings.PriorityRegion && regionLocked) {
    return true;
  } else if (settings.PriorityWhitelist && whitelist) {
    return true;
  }
  return false;
}

function ignoreGiveaway(steamGroup, whitelist) {
  if (settings.IgnoreGroups && steamGroup) {
    return true;
  } else if (settings.IgnoreWhitelist && whitelist) {
    return true;
  }
  return false;
}

function filterGiveaway(giveaway, appID, appType, hasTradingCards) {
  let steamGroupGiveaway = Boolean(
    giveaway.querySelector('.giveaway__column--group')
  );
  let whiteListGiveaway = Boolean(
    giveaway.querySelector('.giveaway__column--whitelist')
  );

  if (hasGame(appID)) {
    return true;
  } else if (inWishlist(appID)) {
    return false;
  } else if (settings.HideNonTradingCards && !hasTradingCards) {
    return true;
  } else if (settings.HideDlc && appType == 'dlc' && appType != 'game') {
    return true;
  } else if (settings.HideGroups && steamGroupGiveaway) {
    return true;
  } else if (settings.HideWhitelist && whiteListGiveaway) {
    return true;
  }
  return false;
}

function hasGame(id) {
  return ownedSteamApps.indexOf(id) > -1;
}

function inWishlist(id) {
  return wishList.indexOf(id) > -1;
}

function secToTime(x) {
  let sec = x;
  const days = Math.floor(sec / (24 * 60 * 60));
  sec %= 86400;
  const hours = Math.floor(sec / (60 * 60));
  sec %= 3600;
  const minutes = Math.floor(sec / 60);
  sec %= 60;
  if (days !== 0) {
    return `${days}d ${hours}:${minutes.toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`;
  } else if (hours !== 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`;
  } else if (minutes !== 0) {
    return `${minutes.toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`;
  }
  return `${sec} s`;
}
