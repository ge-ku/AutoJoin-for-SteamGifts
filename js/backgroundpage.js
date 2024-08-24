/* 
  This script page is the background script. autoentry.js is the autojoin button and other page
  modifications
*/

/* Offscreen weirdness, to use DOMParser and Audio with manifest v3...*/
let creating;
const setupOffscreenDocument = async (path) => {
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['DOM_PARSER', 'AUDIO_PLAYBACK'],
      justification:
        'Parsing HTML returned by fetch request to get useful data',
    });
    await creating;
    creating = null;
  }
};

const parseHTML = (html) => {
  return new Promise(async (resolve, reject) => {
    await setupOffscreenDocument('html/offscreen.html');

    const onDone = (result) => {
      resolve(result);
    };
    chrome.runtime.onMessage.addListener(onDone);
    // Send message to offscreen document
    chrome.runtime.sendMessage({
      type: 'parse',
      target: 'offscreen',
      data: html,
    });
  });
};

const playAudio = async (volume) => {
  await setupOffscreenDocument('html/offscreen.html');
  chrome.runtime.sendMessage({
    type: 'audio',
    target: 'offscreen',
    data: volume,
  });
};

/* Variables declaration */
let arr = [];
let settings;
let link = 'https://www.steamgifts.com/giveaways/search?page=';
let pages = 1;
let pagestemp = pages;
let token = '';
let mylevel = 0;
let timepassed = 0;
let timetopass = 100;
let justLaunched = true;
let thisVersion = 20170929;
let totalWishlistGAcnt = 0;
let useWishlistPriorityForMainBG = false;
let currPoints = 0;

const steamKeyRedeemResponses = {
  0: 'NoDetail',
  1: 'AVSFailure',
  2: 'InsufficientFunds',
  3: 'ContactSupport',
  4: 'Timeout',
  5: 'InvalidPackage',
  6: 'InvalidPaymentMethod',
  7: 'InvalidData',
  8: 'OthersInProgress',
  9: 'AlreadyPurchased',
  10: 'WrongPrice',
  11: 'FraudCheckFailed',
  12: 'CancelledByUser',
  13: 'RestrictedCountry',
  14: 'BadActivationCode',
  15: 'DuplicateActivationCode',
  16: 'UseOtherPaymentMethod',
  17: 'UseOtherFunctionSource',
  18: 'InvalidShippingAddress',
  19: 'RegionNotSupported',
  20: 'AcctIsBlocked',
  21: 'AcctNotVerified',
  22: 'InvalidAccount',
  23: 'StoreBillingCountryMismatch',
  24: 'DoesNotOwnRequiredApp',
  25: 'CanceledByNewTransaction',
  26: 'ForceCanceledPending',
  27: 'FailCurrencyTransProvider',
  28: 'FailedCyberCafe',
  29: 'NeedsPreApproval',
  30: 'PreApprovalDenied',
  31: 'WalletCurrencyMismatch',
  32: 'EmailNotValidated',
  33: 'ExpiredCard',
  34: 'TransactionExpired',
  35: 'WouldExceedMaxWallet',
  36: 'MustLoginPS3AppForPurchase',
  37: 'CannotShipToPOBox',
  38: 'InsufficientInventory',
  39: 'CannotGiftShippedGoods',
  40: 'CannotShipInternationally',
  41: 'BillingAgreementCancelled',
  42: 'InvalidCoupon',
  43: 'ExpiredCoupon',
  44: 'AccountLocked',
  45: 'OtherAbortableInProgress',
  46: 'ExceededSteamLimit',
  47: 'OverlappingPackagesInCart',
  48: 'NoWallet',
  49: 'NoCachedPaymentMethod',
  50: 'CannotRedeemCodeFromClient',
  51: 'PurchaseAmountNoSupportedByProvider',
  52: 'OverlappingPackagesInPendingTransaction',
  53: 'RateLimited',
  54: 'OwnsExcludedApp',
  55: 'CreditCardBinMismatchesType',
  56: 'CartValueTooHigh',
  57: 'BillingAgreementAlreadyExists',
  58: 'POSACodeNotActivated',
  59: 'CannotShipToCountry',
  60: 'HungTransactionCancelled',
  61: 'PaypalInternalError',
  62: 'UnknownGlobalCollectError',
  63: 'InvalidTaxAddress',
  64: 'PhysicalProductLimitExceeded',
  65: 'PurchaseCannotBeReplayed',
  66: 'DelayedCompletion',
  67: 'BundleTypeCannotBeGifted',
};

const findAndRedeemKeys = async (wonPage) => {
  // Notifies about the steams response of a key sent to be redeemed
  const notifySteamCodeResponse = (info) => {
    notify('key', info);
  };

  for (const keyBtn of wonPage.querySelectorAll('.view_key_btn')) {
    // Get necessary data
    const dataForm =
      keyBtn.parentElement.nextElementSibling.querySelector('form');
    const winnerId = dataForm.querySelector("input[name='winner_id']").value;
    const xsrfToken = dataForm.querySelector("input[name='xsrf_token']").value;
    let latestSteamKeyRedeemResponse = ''; // for debugging
    let latestSteamGiftsKeyRequestResponse = ''; // for debugging

    // Request the won key
    const formData = new FormData();
    formData.append('do', 'view_key');
    formData.append('winner_id', winnerId);
    formData.append('xsrf_token', xsrfToken);

    const res = await fetch('https://www.steamgifts.com/ajax.php', {
      method: 'post',
      body: formData,
    });
    if (res.ok) {
      const json = await res.json();

      // This should be remade
      const data = JSON.stringify(json);
      const key = data.substr(
        data.indexOf('?key=') + 5,
        data.substr(data.indexOf('?key=')).indexOf('\\') - 5
      ); // RIP
      latestSteamGiftsKeyRequestResponse = data; // for debugging

      // Check key format
      if (/^[a-zA-Z0-9]{4,6}\-[a-zA-Z0-9]{4,6}\-[a-zA-Z0-9]{4,6}$/.test(key)) {
        const res = await fetch('//store.steampowered.com');
        const data = await res.text();

        // Check if user is logged in on Steam
        if (data.indexOf('playerAvatar') != -1) {
          const steamSessionId = data.substr(
            data.indexOf('g_sessionID') + 15,
            24
          );

          const formData = new FormData();
          formData.append('product_key', key);
          formData.append('sessionid', steamSessionId);
          const res = await fetch(
            'https://store.steampowered.com/account/ajaxregisterkey/',
            {
              method: 'post',
              body: formData,
            }
          );
          if (res.ok) {
            const data = res.json();
            latestSteamKeyRedeemResponse = JSON.stringify(data); // for debugging

            const itemsList = data.purchase_receipt_info.line_items.map(
              (item) => item.line_item_description
            );
            const redeemedGames = itemsList.join(',');

            console.log(steamKeyRedeemResponses[data.purchase_result_details]);

            // Check response (success needs to be exactly 1, no more, no less)
            if (data.success === 1) {
              console.log(
                'Steam Code for ' +
                  redeemedGames +
                  ' was redeemed successfully!'
              );
              notifySteamCodeResponse(
                'Steam Code for ' +
                  redeemedGames +
                  ' was redeemed successfully!'
              );

              // Mark as received
              const formData = new FormData();
              formData.append('xsrf_token', xsrfToken);
              formData.append('do', 'received_feedback');
              formData.append('action', '1');
              formData.append('winner_id', 'winnerId');
              const res = await fetch('https://www.steamgifts.com/ajax.php', {
                method: 'post',
                body: formData,
              });
              if (!res.ok)
                console.error(
                  `Error while trying to mark giveaway as received: HTTP ${res.status}`
                );
            } else if (
              steamKeyRedeemResponses[data.purchase_result_details] != undefined
            ) {
              // In case there is an error but the names of the games failed to be redeemed are also returned
              if (redeemedGames != '') {
                console.log(
                  '[!] Steam Code: ' +
                    key +
                    ' for ' +
                    redeemedGames +
                    ' was not redeemed! Error: ' +
                    steamKeyRedeemResponses[data.purchase_result_details]
                );
                notifySteamCodeResponse(
                  'Steam Code: ' +
                    key +
                    ' for ' +
                    redeemedGames +
                    ' was not redeemed!\nError: ' +
                    steamKeyRedeemResponses[data.purchase_result_details]
                );
              } else {
                console.log(
                  '[!] Steam Code: ' +
                    key +
                    ' was not redeemed! Error: ' +
                    steamKeyRedeemResponses[data.purchase_result_details]
                );
                notifySteamCodeResponse(
                  'Steam Code: ' +
                    key +
                    ' was not redeemed!\nError: ' +
                    steamKeyRedeemResponses[data.purchase_result_details]
                );
              }
            } else {
              console.log(
                '[!] Steam Code: ' +
                  key +
                  ' was not redeemed! Unknown Error. Debug: ' +
                  latestSteamKeyRedeemResponse
              );
              notifySteamCodeResponse(
                'Steam Code: ' + key + ' was not redeemed!\nUnknown Error.'
              );
            }
          } else {
            `Error registering key on Steam: HTTP ${res.status}`;
          }
        } else {
          console.log(
            '[!] Not logged in on Steam! Code: ' + key + ' was not redeemed!'
          );
          notifySteamCodeResponse(
            'Not logged in on Steam!\nCode: ' + key + ' was not redeemed!'
          );
        }
      } else {
        console.log('[!] Invalid Format!');
        notifySteamCodeResponse(
          'Invalid Format!\nCode: ' + key + ' was not redeemed!'
        );
      }
    } else {
      console.error(`Error while trying to fetch a key: HTTP ${res.status}`);
    }
  }
};

class Giveaway {
  constructor(code, level, appid, odds, cost, timeleft) {
    this.code = code;
    this.level = level;
    this.steamlink = appid;
    this.odds = odds;
    this.cost = cost;
    this.timeleft = timeleft;
    this.showInfo = function () {
      console.log(`
    Giveaway https://www.steamgifts.com/giveaway/${this.code}/ (${this.cost} P) | Level: ${this.level} | Time left: ${this.timeleft} s
    Steam: http://store.steampowered.com/app/"${this.steamlink} Odds of winning: ${this.odds}`);
    };
  }
}

const compareLevel = (a, b) => b.level - a.level;
const compareOdds = (a, b) => b.odds - a.odds;

const calculateWinChance = (
  timeLeft,
  timeStart,
  numberOfEntries,
  numberOfCopies,
  timeLoaded
) => {
  const timePassed = timeLoaded - timeStart; // time passed in seconds
  // calculate rate of entries and multiply by time left,
  // probably not very accurate as we assume linear rate
  const predictionOfEntries = (numberOfEntries / timePassed) * timeLeft;
  const chance =
    (1 / (numberOfEntries + 1 + predictionOfEntries)) * 100 * numberOfCopies;
  return chance;
};

const notify = async (type, msg) => {
  switch (type) {
    case 'win':
      const response = await fetch('https://www.steamgifts.com/giveaways/won');
      if (response.ok) {
        wonPageHtml = await res.text();
        const parser = new DOMParser();
        const wonPage = parser.parseFromString(text, 'text/html');
        const name = wonPage.querySelector(
          '.table__column__heading'
        ).textContent;

        chrome.notifications.clear('won_notification', () => {
          const e = {
            type: 'basic',
            title: 'AutoJoin',
            message: `You won ${name}! Click here to open Steamgifts.com`,
            iconUrl: chrome.runtime.getURL('./media/autologosteam.png'),
          };
          chrome.notifications.create('won_notification', e, () => {
            chrome.storage.sync.get(
              { PlayAudio: 'true', AudioVolume: 1 },
              (data) => {
                if (data.PlayAudio === true) {
                  playAudio(data.AudioVolume);
                }
              }
            );
          });
        });
        if (settings.AutoRedeemKey) {
          findAndRedeemKeys(wonPage);
        }
      } else {
        console.error(
          `Could not fetch /giveaways/won page: HTTP ${response.status}`
        );
      }
      break;
    case 'points':
      chrome.notifications.clear('points_notification', () => {
        const e = {
          type: 'basic',
          title: 'AutoJoin',
          message: `You have ${msg} points on Steamgifts.com. Time to spend!`,
          iconUrl: chrome.runtime.getURL('./media/autologosteam.png'),
        };
        chrome.notifications.create('points_notification', e);
      });
      break;
    case 'key':
      chrome.notifications.clear('key_notification', () => {
        const e = {
          type: 'basic',
          title: 'AutoJoin',
          message: msg,
          iconUrl: chrome.runtime.getURL('./media/autologosteam.png'),
        };
        chrome.notifications.create('key_notification', e);
      });
    default:
      console.log('Unknown notification type');
  }
};

/* This function scans the pages and calls the function pagesloaded() once it finished
   All giveaways that must be entered are pushed in an array called "arr"
   Remember once scanpage is over, pagesloaded is called */
const scanpage = async (html) => {
  const timePageLoaded = Math.round(Date.now() / 1000);

  let result = { giveaways: [], giveawaysWithoutPinned: [] };
  result = await parseHTML({ items: Object.keys(result), html });

  const giveaways =
    settings.IgnorePinnedBG === true ||
    (useWishlistPriorityForMainBG && pagestemp === pages)
      ? result.giveawaysWithoutPinned
      : result.giveaways;
  for (const giveaway of giveaways) {
    if (giveaway.levelTooHigh) continue;
    if (giveaway.isGroupGA && settings.IgnoreGroupsBG) continue;

    giveaway.timeLeft = giveaway.timeEnd - timePageLoaded;
    const oddsOfWinning = calculateWinChance(
      giveaway.timeLeft,
      giveaway.timeStart,
      giveaway.numberOfEntries,
      giveaway.numberOfCopies,
      timePageLoaded
    );
    arr.push(
      new Giveaway(
        giveaway.GAcode,
        parseInt(giveaway.GAlevel, 10),
        giveaway.GAsteamAppID,
        oddsOfWinning,
        parseInt(giveaway.cost, 10),
        giveaway.timeLeft
      )
    );
  }

  if (pagestemp === pages) {
    totalWishlistGAcnt = arr.length;
  }
  pagestemp--;
  if (
    pagestemp === 0 ||
    (currPoints < settings.PointsToPreserve &&
      useWishlistPriorityForMainBG &&
      settings.IgnorePreserveWishlistOnMainBG &&
      totalWishlistGAcnt !== 0)
  ) {
    pagestemp = 0;
    pagesloaded();
  }
};

/* This function is called once all pages have been parsed
   this sends the requests to steamgifts */
function pagesloaded() {
  let wishlistArr;
  if (useWishlistPriorityForMainBG) {
    wishlistArr = arr.slice(0, totalWishlistGAcnt);
    if (settings.LevelPriorityBG) {
      wishlistArr.sort(compareLevel);
    } else if (settings.OddsPriorityBG) {
      wishlistArr.sort(compareOdds);
    }
    arr = arr.slice(totalWishlistGAcnt);
  }

  if (settings.LevelPriorityBG) {
    arr.sort(compareLevel);
  } else if (settings.OddsPriorityBG) {
    arr.sort(compareOdds);
  }
  if (useWishlistPriorityForMainBG) {
    arr = wishlistArr.concat(arr);
  }

  let timeouts = [];

  for (const ga of arr) {
    if (ga.level < settings.MinLevelBG) {
      // this may be unnecessary since level_min search parameter https://www.steamgifts.com/discussion/5WsxS/new-search-parameters
      continue;
    }
    if (ga.cost < settings.MinCostBG) {
      ga.showInfo();
      console.log(
        `^Skipped, cost: ${ga.cost}, your settings.MinCostBG is ${settings.MinCostBG}`
      );
      continue;
    }
    if (settings.MaxCostBG != -1 && ga.cost > settings.MaxCostBG) {
      ga.showInfo();
      console.log(
        `^Skipped, cost: ${ga.cost}, your settings.MaxCostBG is ${settings.MaxCostBG}`
      );
      continue;
    }
    if (ga.timeleft > settings.MaxTimeLeftBG && settings.MaxTimeLeftBG !== 0) {
      ga.showInfo();
      console.log(
        `^Skipped, timeleft: ${ga.timeleft}, your settings.MaxTimeLeftBG is ${settings.MaxTimeLeftBG}`
      );
      continue;
    }

    timeouts.push(
      setTimeout(async () => {
        const formData = new FormData();
        formData.append('xsrf_token', token);
        formData.append('do', 'entry_insert');
        formData.append('code', ga.code);

        const res = await fetch('https://www.steamgifts.com/ajax.php', {
          method: 'post',
          body: formData,
        });
        const jsonResponse = await res.json();
        ga.showInfo();

        let clearTimeouts = false;
        if (jsonResponse.msg === 'Not Enough Points') {
          clearTimeouts = true;
        } else if (
          jsonResponse.points < settings.PointsToPreserve &&
          useWishlistPriorityForMainBG &&
          settings.IgnorePreserveWishlistOnMainBG
        ) {
          if (totalWishlistGAcnt === 1 || e > totalWishlistGAcnt - 2) {
            clearTimeouts = true;
          }
        }

        if (clearTimeouts) {
          console.log(
            "^Not Enough Points or your PointsToPreserve limit reached, we're done for now"
          );
          for (let i = 0; i < timeouts.length; i++) {
            clearTimeout(timeouts[i]);
          }
          timeouts = [];
        } else {
          console.log('^Entered');
        }
      }, (timeouts.length + 1) * settings.DelayBG * 1000 + Math.floor(Math.random() * 2001))
    );
  }
}

/* This function checks for a won gift, then calls the scanpage function */
/* e is the whole html page */
const settingsloaded = async () => {
  if (settings.IgnoreGroupsBG && settings.PageForBG === 'all') {
    settings.IgnoreGroupsBG = true;
  }
  if (settings.PageForBG === 'all' && settings.WishlistPriorityForMainBG) {
    useWishlistPriorityForMainBG = true;
  } else {
    useWishlistPriorityForMainBG = false;
  }
  pages = settings.PagesToLoadBG;
  if (pages < 2 && useWishlistPriorityForMainBG) {
    pages = 2;
  }
  timetopass = 10 * settings.RepeatHoursBG;
  if (justLaunched || settings.RepeatHoursBG === 0) {
    // settings.RepeatHoursBG == 0 means it should autojoin every time
    justLaunched = false;
    timepassed = timetopass;
  } else {
    timepassed += 5;
  }

  let result = { won: false, myPoints: 0, myLevel: 0, token: '' };

  /* If background autojoin is disabled or not enough time passed only check if won */
  if (settings.BackgroundAJ === false || timepassed < timetopass) {
    const res = await fetch(link + 1);
    const html = await res.text();
    result = await parseHTML({
      items: Object.keys(result),
      html,
    });

    if (result.won) {
      notify('win');
    } else {
      currPoints = result.myPoints;
      if (currPoints >= settings.NotifyLimitAmount && settings.NotifyLimit) {
        console.log(
          `Sending notification about accumulated points: ${currPoints} > ${settings.NotifyLimitAmount}`
        );
        notify('points', currPoints);
      }
      console.log(`Current Points: ${currPoints}`);
    }
    // check level and save if changed
    mylevel = result.myLevel;
    if (settings.LastKnownLevel !== mylevel) {
      chrome.storage.sync.set({ LastKnownLevel: mylevel });
    }
  } else {
    /* Else check if won first (since pop-up disappears after first view), then start scanning pages */
    timepassed = 0; // reset timepassed
    const link = `https://www.steamgifts.com/giveaways/search?type=${settings.PageForBG}&level_min=${settings.MinLevelBG}&level_max=${settings.LastKnownLevel}&page=`;
    const wishLink = `https://www.steamgifts.com/giveaways/search?type=wishlist&level_min=${settings.MinLevelBG}&level_max=${settings.LastKnownLevel}&page=`;
    let linkToUse = '';
    if (useWishlistPriorityForMainBG) linkToUse = wishLink;
    else linkToUse = link;
    arr.length = 0;

    const res = await fetch(linkToUse + 1);
    const html = await res.text();
    result = await parseHTML({
      items: Object.keys(result),
      html,
    });

    currPoints = result.myPoints;
    if (result.won) {
      notify('win');
    } else if (
      currPoints >= settings.NotifyLimitAmount &&
      settings.NotifyLimit
    ) {
      console.log(
        `Sending notification about accumulated points: ${currPoints} > ${settings.NotifyLimitAmount}`
      );
      notify('points', currPoints);
    }

    if (pages > 5 || pages < 1) {
      pagestemp = 3;
    } else {
      pagestemp = pages;
    } // in case someone has old setting with more than 5 pages to load or somehow set this value to <1 use 3 (default)

    token = result.token;
    mylevel = result.myLevel;
    // save new level if it changed
    if (settings.LastKnownLevel !== mylevel) {
      chrome.storage.sync.set({ LastKnownLevel: mylevel });
    }

    // var numOfGAsOnPage = parseInt($(data).find('.pagination__results').children().next().text(), 10);
    if (
      currPoints >= settings.PointsToPreserve ||
      (useWishlistPriorityForMainBG && settings.IgnorePreserveWishlistOnMainBG)
    ) {
      scanpage(html); // scan this page that was already loaded to get info above
      let i = 0;
      if (useWishlistPriorityForMainBG) {
        linkToUse = link;
        i = 1;
      }
      if (currPoints >= settings.PointsToPreserve) {
        for (let n = 2 - i; n <= pages - i; n++) {
          // scan next pages
          if (n > 3 - i) {
            break;
          } // no more than 3 pages at a time since the ban wave
          const res = await fetch(linkToUse + n);
          const newPage = await res.text();
          scanpage(newPage);
        }
      }
    }
  }
};

/* Load settings, then call settingsloaded() */
const loadsettings = () => {
  chrome.storage.sync.get(
    {
      PageForBG: 'wishlist',
      RepeatHoursBG: 5,
      DelayBG: 10,
      MaxTimeLeftBG: 0, // in seconds
      MinLevelBG: 0,
      MinCostBG: 0,
      MaxCostBG: -1,
      PointsToPreserve: 0,
      WishlistPriorityForMainBG: false,
      IgnorePreserveWishlistOnMainBG: false,
      PagesToLoadBG: 2,
      BackgroundAJ: false,
      LevelPriorityBG: true,
      OddsPriorityBG: false,
      IgnoreGroupsBG: false,
      IgnorePinnedBG: true,
      LastKnownLevel: 10, // set to 10 by default so it loads pages with max_level set to 10 (maximum) before extensions learns actual level
      NotifyLimit: false,
      NotifyLimitAmount: 300,
      AutoRedeemKey: false,
      lastLaunchedVersion: thisVersion,
    },
    (data) => {
      settings = data;
      settingsloaded();
    }
  );
};

/* It all begins with the loadsettings call */
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm fired.');
  if (alarm.name === 'routine') {
    loadsettings();
    chrome.alarms.create('routine', {
      delayInMinutes: 30,
    });
  }
});

/* Create first alarm as soon as possible */
chrome.alarms.create('routine', {
  delayInMinutes: 0.1,
});

/* Creating a new tab if notification is clicked */
chrome.notifications.onClicked.addListener((notificationId) => {
  switch (notificationId) {
    case '1.5.0 announcement':
      url =
        'http://steamcommunity.com/groups/autojoin#announcements/detail/1485483400577229657';
      break;
    case 'points_notification':
      url = 'https://www.steamgifts.com/';
      break;
    default:
      url = 'https://www.steamgifts.com/giveaways/won';
  }
  chrome.windows.getCurrent((currentWindow) => {
    if (currentWindow) {
      chrome.tabs.create({
        url,
      });
    } else {
      chrome.windows.create({
        url,
        type: 'normal',
        focused: true,
      });
    }
  });
});

chrome.runtime.onInstalled.addListener((updateInfo) => {
  if (!updateInfo.previousVersion) return;

  const parseVersion = (version) =>
    Number(
      version
        .split('.')
        .map((v) => v.padStart(3, 0))
        .join('')
        .padEnd(9, 0)
    );
  const prevVersion = parseVersion(updateInfo.previousVersion);

  if (prevVersion < parseVersion('1.5.0')) {
    console.log('Changing settings to prevent mass ban of extension users...');
    chrome.storage.sync.set(
      {
        BackgroundAJ: false,
        IgnorePinnedBG: true,
        RepeatIfOnPage: false,
        RepeatHoursBG: 5,
        RepeatHours: 5,
      },
      () => {
        const e = {
          type: 'basic',
          title: 'Steamgifts Guidelines Update',
          message: 'Your settings were changed. Click here to read more...',
          iconUrl: chrome.runtime.getURL('./media/autologosteam.png'),
        };
        chrome.notifications.create('1.5.0 announcement', e);
      }
    );
  }
  if (prevVersion < parseVersion('1.6.2')) {
    console.log('Changing settings of minCost to minCostBG');
    chrome.storage.sync.get(
      {
        MinCost: 0,
      },
      (minCost) => {
        chrome.storage.sync.set(
          {
            MinCost: 0,
            MinCostBG: minCost,
          },
          () => {
            console.log(
              'Migrated successfully minCost option from previous version'
            );
          }
        );
      }
    );
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.task === 'checkPermission') {
    // Check if we have "*://steamcommunity.com/profiles/*" permission, ask for them if not
    console.log(
      'Got a request for "*://steamcommunity.com/profiles/*" permission'
    );
    chrome.permissions.contains(
      {
        origins: ['*://steamcommunity.com/profiles/*'],
      },
      (result) => {
        if (result) {
          console.log('We already have permission');
          chrome.tabs.sendMessage(sender.tab.id, { granted: 'true' });
          sendResponse({ granted: 'true' });
        } else if (request.ask === 'true') {
          // We don't have permission, try to request them if ask is 'true'
          chrome.permissions.request(
            {
              origins: ['*://steamcommunity.com/profiles/*'],
            },
            (granted) => {
              if (granted) {
                console.log('Permission granted');
                chrome.tabs.sendMessage(sender.tab.id, { granted: 'true' });
              } else {
                console.log('Permission declined');
                chrome.tabs.sendMessage(sender.tab.id, { granted: 'false' });
              }
            }
          );
        } else {
          sendResponse({ granted: 'false' });
        }
      }
    );
  }

  if (request.task === 'fetch') {
    // Fetch in background script to bypass CORS (content scripts can't do it anymore)
    const url = request.url;
    fetchHelper(url).then(sendResponse);
    return true;
  }
});

const fetchHelper = async (url) => {
  // using this helper function until https://crbug.com/40753031 is implemented
  const result = {
    status: null,
    text: '',
  };
  const res = await fetch(url);
  result.status = res.status;
  if (res.ok) {
    const text = await res.text();
    result.text = text;
  }
  return result;
};
