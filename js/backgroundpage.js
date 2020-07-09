/* How about make a human readable script, then pass it to jsmin or closure for release?
  https://developers.google.com/closure/compiler/
  This script page is the background script. autoentry.js is the autojoin button and other page
  modifications */

function findAndRedeemKeys(wonPage) {
  $(wonPage)
    .find('.view_key_btn')
    .each(function() {
      // Get necessary data
      var dataForm = $(this)
        .parent()
        .next()
        .find('form');
      var winnerId = dataForm.find("input[name='winner_id']").val();
      var xsrfToken = dataForm.find("input[name='xsrf_token']").val();
      var latestSteamKeyRedeemResponse = ''; // for debugging
      var latestSteamGiftsKeyRequestResponse = ''; // for debugging

      // Request the won key
      $.post(
        'https://www.steamgifts.com/ajax.php',
        {
          do: 'view_key',
          winner_id: winnerId,
          xsrf_token: xsrfToken,
        },
        function(data) {
          data = JSON.stringify(data);
          var key = data.substr(
            data.indexOf('?key=') + 5,
            data.substr(data.indexOf('?key=')).indexOf('\\') - 5
          ); // RIP
          latestSteamGiftsKeyRequestResponse = data; // for debugging

          // Check key format
          if (
            /^[a-zA-Z0-9]{4,6}\-[a-zA-Z0-9]{4,6}\-[a-zA-Z0-9]{4,6}$/.test(key)
          ) {
            $.get('http://store.steampowered.com', function(data) {
              // Check if user is logged in on Steam
              if (data.indexOf('playerAvatar') != -1) {
                var steamSessionId = data.substr(
                  data.indexOf('g_sessionID') + 15,
                  24
                );

                $.post(
                  'https://store.steampowered.com/account/ajaxregisterkey/',
                  {
                    product_key: key,
                    sessionid: steamSessionId,
                  },
                  function(data) {
                    latestSteamKeyRedeemResponse = JSON.stringify(data); // for debugging

                    var redeemedGames = '';
                    var itemsList = data.purchase_receipt_info.line_items;
                    for (var i = 0; i < itemsList.length; i++) {
                      if (!i) {
                        redeemedGames += itemsList[i].line_item_description;
                      } else {
                        redeemedGames +=
                          ', ' + itemsList[i].line_item_description;
                      }
                    }

                    console.log(
                      steamKeyRedeemResponses[data.purchase_result_details]
                    );

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
                      $.post('https://www.steamgifts.com/ajax.php', {
                        xsrf_token: xsrfToken,
                        do: 'received_feedback',
                        action: '1',
                        winner_id: winnerId,
                      });
                    } else if (
                      steamKeyRedeemResponses[data.purchase_result_details] !=
                      undefined
                    ) {
                      // In case there is an error but the names of the games failed to be redeemed are also returned
                      if (redeemedGames != '') {
                        console.log(
                          '[!] Steam Code: ' +
                            key +
                            ' for ' +
                            redeemedGames +
                            ' was not redeemed! Error: ' +
                            steamKeyRedeemResponses[
                              data.purchase_result_details
                            ]
                        );
                        notifySteamCodeResponse(
                          'Steam Code: ' +
                            key +
                            ' for ' +
                            redeemedGames +
                            ' was not redeemed!\nError: ' +
                            steamKeyRedeemResponses[
                              data.purchase_result_details
                            ]
                        );
                      } else {
                        console.log(
                          '[!] Steam Code: ' +
                            key +
                            ' was not redeemed! Error: ' +
                            steamKeyRedeemResponses[
                              data.purchase_result_details
                            ]
                        );
                        notifySteamCodeResponse(
                          'Steam Code: ' +
                            key +
                            ' was not redeemed!\nError: ' +
                            steamKeyRedeemResponses[
                              data.purchase_result_details
                            ]
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
                        'Steam Code: ' +
                          key +
                          ' was not redeemed!\nUnknown Error.'
                      );
                    }
                  }
                );
              } else {
                console.log(
                  '[!] Not logged in on Steam! Code: ' +
                    key +
                    ' was not redeemed!'
                );
                notifySteamCodeResponse(
                  'Not logged in on Steam!\nCode: ' + key + ' was not redeemed!'
                );
              }
            });
          } else {
            console.log('[!] Invalid Format!');
            notifySteamCodeResponse(
              'Invalid Format!\nCode: ' + key + ' was not redeemed!'
            );
          }
        }
      );
    });

  // Notifies about the steams response of a key sent to be redeemed
  function notifySteamCodeResponse(info) {
    notify('key', info);
  }
}

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

function Giveaway(code, level, appid, odds, cost, timeleft) {
  this.code = code;
  this.level = level;
  this.steamlink = appid;
  this.odds = odds;
  this.cost = cost;
  this.timeleft = timeleft;
  this.showInfo = function() {
    console.log(`
    Giveaway https://www.steamgifts.com/giveaway/${this.code}/ (${this.cost} P) | Level: ${this.level} | Time left: ${this.timeleft} s
    Steam: http://store.steampowered.com/app/"${this.steamlink} Odds of winning: ${this.odds}`);
  };
}

function compareLevel(a, b) {
  return b.level - a.level;
}

function compareOdds(a, b) {
  return b.odds - a.odds;
}

function calculateWinChance(giveaway, timeLoaded) {
  const timeLeft =
    parseInt(
      $(giveaway)
        .find('.fa.fa-clock-o')
        .next('span')
        .attr('data-timestamp'),
      10
    ) - timeLoaded; // time left in seconds
  const timePassed =
    timeLoaded -
    parseInt(
      $(giveaway)
        .find('.giveaway__username')
        .prev('span')
        .attr('data-timestamp'),
      10
    ); // time passed in seconds
  const numberOfEntries = parseInt(
    $(giveaway)
      .find('.fa-tag')
      .next('span')
      .text()
      .replace(',', ''),
    10
  );
  let numberOfCopies = 1;
  if (
    $(giveaway)
      .find('.giveaway__heading__thin:first')
      .text()
      .replace(',', '')
      .match(/\(\d+ Copies\)/)
  ) {
    // if more than one copy there's a text field "(N Copies)"
    numberOfCopies = parseInt(
      $(giveaway)
        .find('.giveaway__heading__thin:first')
        .text()
        .replace(',', '')
        .match(/\d+/)[0],
      10
    );
  }
  // calculate rate of entries and multiply on time left,
  // probably not very accurate as we assume linear rate
  const predictionOfEntries = (numberOfEntries / timePassed) * timeLeft;
  const chance =
    (1 / (numberOfEntries + 1 + predictionOfEntries)) * 100 * numberOfCopies;
  return chance;
}

function notify(type, msg) {
  switch (type) {
    case 'win':
      $.get('https://www.steamgifts.com/giveaways/won', wonPage => {
        const name = $(wonPage).find('.table__column__heading')[0].innerText;
        chrome.notifications.clear('won_notification', () => {
          const e = {
            type: 'basic',
            title: 'AutoJoin',
            message: `You won ${name}! Click here to open Steamgifts.com`,
            iconUrl: 'media/autologosteam.png',
          };
          chrome.notifications.create('won_notification', e, () => {
            chrome.storage.sync.get(
              { PlayAudio: 'true', AudioVolume: 1 },
              data => {
                if (data.PlayAudio === true) {
                  const audio = new Audio('media/audio.mp3');
                  audio.volume = data.AudioVolume;
                  audio.play();
                }
              }
            );
          });
        });
        if (settings.AutoRedeemKey) {
          findAndRedeemKeys(wonPage);
        }
      });
      break;
    case 'points':
      chrome.notifications.clear('points_notification', () => {
        const e = {
          type: 'basic',
          title: 'AutoJoin',
          message: `You have ${msg} points on Steamgifts.com. Time to spend!`,
          iconUrl: 'media/autologosteam.png',
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
          iconUrl: 'media/autologosteam.png',
        };
        chrome.notifications.create('key_notification', e);
      });
    default:
      console.log('Unknown notification type');
  }
}

/* This function scans the pages and calls the function pagesloaded() once it finished
   All giveaways that must be entered are pushed in an array called "arr"
   Remember once scanpage is over, pagesloaded is called */
function scanpage(e) {
  const timePageLoaded = Math.round(Date.now() / 1000);
  const postsDiv = $(e)
    .find(':not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap')
    .parent();
  (settings.IgnorePinnedBG === true ||
  (useWishlistPriorityForMainBG && pagestemp === pages)
    ? postsDiv
    : $(e)
  )
    .find('.giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name')
    .each(function() {
      const ga = $(this)
        .parent()
        .parent()
        .parent();
      const t = this.href.match(/giveaway\/(.+)\//);
      if (t.length > 0) {
        const GAcode = t[1];
        if (
          !(
            (settings.IgnoreGroupsBG &&
              $(this).find('.giveaway__column--group').length) ||
            $(ga).find('.giveaway__column--contributor-level--negative').length
          )
        ) {
          let GAlevel = 0;
          if (
            $(ga).find('.giveaway__column--contributor-level--positive').length
          ) {
            GAlevel = $(ga)
              .find('.giveaway__column--contributor-level--positive')
              .html()
              .match(/(\d+)/)[1];
          }
          let GAsteamAppID = '0';
          const s = $(ga)
            .find('.giveaway_image_thumbnail')
            .css('background-image');
          if (s !== undefined) {
            // undefined when no thumbnail is available (mostly non-steam bundles)
            const c = s.match(/.+(?:apps|subs)\/(\d+)\/cap.+/);
            if (s && c) {
              GAsteamAppID = c[1]; // TODO: differentiate between sub ID and app ID
            }
          }
          const cost = $(ga)
            .find('.giveaway__heading__thin')
            .last()
            .html()
            .match(/\d+/)[0];
          const oddsOfWinning = calculateWinChance(ga, timePageLoaded);
          const timeleft =
            parseInt(
              $(ga)
                .find('.fa.fa-clock-o')
                .next('span')
                .attr('data-timestamp'),
              10
            ) - timePageLoaded;
          arr.push(
            new Giveaway(
              GAcode,
              parseInt(GAlevel, 10),
              GAsteamAppID,
              oddsOfWinning,
              parseInt(cost, 10),
              timeleft
            )
          );
        }
      }
    });
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
}

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
  $.each(arr, e => {
    if (arr[e].level < settings.MinLevelBG) {
      // this may be unnecessary since level_min search parameter https://www.steamgifts.com/discussion/5WsxS/new-search-parameters
      return true;
    }
    if (arr[e].cost < settings.MinCostBG) {
      arr[e].showInfo();
      console.log(
        `^Skipped, cost: ${arr[e].cost}, your settings.MinCostBG is ${settings.MinCostBG}`
      );
      return true;
    }
    if ((settings.MaxCostBG != -1) && (arr[e].cost > settings.MaxCostBG)) {
      arr[e].showInfo();
      console.log(
        `^Skipped, cost: ${arr[e].cost}, your settings.MaxCostBG is ${settings.MaxCostBG}`
      );
      return true;
    }
    if (
      arr[e].timeleft > settings.MaxTimeLeftBG &&
      settings.MaxTimeLeftBG !== 0
    ) {
      arr[e].showInfo();
      console.log(
        `^Skipped, timeleft: ${arr[e].timeleft}, your settings.MaxTimeLeftBG is ${settings.MaxTimeLeftBG}`
      );
      return true;
    }
    timeouts.push(
      setTimeout(() => {
        $.post(
          'https://www.steamgifts.com/ajax.php',
          {
            xsrf_token: token,
            do: 'entry_insert',
            code: arr[e].code,
          },
          response => {
            arr[e].showInfo();
            const jsonResponse = JSON.parse(response);

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

            /* For easier understanding of the above if check.
        var clearTimeouts = function(){
          for (var i = 0; i < timeouts.length; i++) {
            clearTimeout(timeouts[i]);
          }
          timeouts = [];
        }

        if(jsonResponse.points < settings.PointsToPreserve
          && useWishlistPriorityForMainBG && settings.IgnorePreserveWishlistOnMainBG){
          if(totalWishlistGAcnt == 1){
            clearTimeouts();
          }else if (e > totalWishlistGAcnt - 2){
            clearTimeouts();
          }
        } else if (jsonResponse.msg == "Not Enough Points"){
          clearTimeouts();
        } */
          }
        );
      }, (timeouts.length + 1) * settings.DelayBG * 1000 + Math.floor(Math.random() * 2001))
    );
  });
}

/* This function checks for a won gift, then calls the scanpage function */
/* e is the whole html page */
function settingsloaded() {
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

  /* If background autojoin is disabled or not enough time passed only check if won */
  if (settings.BackgroundAJ === false || timepassed < timetopass) {
    $.get(link + 1, data => {
      if ($(data).filter('.popup--gift-received').length) {
        notify('win');
      } else {
        currPoints = parseInt(
          $(data)
            .find('a[href="/account"]')
            .find('span.nav__points')
            .text(),
          10
        );
        if (currPoints >= settings.NotifyLimitAmount && settings.NotifyLimit) {
          console.log(
            `Sending notification about accumulated points: ${currPoints} > ${settings.NotifyLimitAmount}`
          );
          notify('points', currPoints);
        }
        console.log(`Current Points: ${currPoints}`);
      }
      // check level and save if changed
      mylevel = $(data)
        .find('a[href="/account"]')
        .find('span')
        .next()
        .html()
        .match(/(\d+)/)[1];
      if (settings.LastKnownLevel !== parseInt(mylevel, 10)) {
        chrome.storage.sync.set({ LastKnownLevel: parseInt(mylevel, 10) });
      }
    });
  } else {
    /* Else check if won first (since pop-up disappears after first view), then start scanning pages */
    timepassed = 0; // reset timepassed
    const link = `https://www.steamgifts.com/giveaways/search?type=${settings.PageForBG}&level_min=${settings.MinLevelBG}&level_max=${settings.LastKnownLevel}&page=`;
    const wishLink = `https://www.steamgifts.com/giveaways/search?type=wishlist&level_min=${settings.MinLevelBG}&level_max=${settings.LastKnownLevel}&page=`;
    let linkToUse = '';
    if (useWishlistPriorityForMainBG) linkToUse = wishLink;
    else linkToUse = link;
    arr.length = 0;
    $.get(linkToUse + 1, data => {
      currPoints = parseInt(
        $(data)
          .find('a[href="/account"]')
          .find('span.nav__points')
          .text(),
        10
      );
      if ($(data).filter('.popup--gift-received').length) {
        notify('win');
      } else {
        if (currPoints >= settings.NotifyLimitAmount && settings.NotifyLimit) {
          console.log(
            `Sending notification about accumulated points: ${currPoints} > ${settings.NotifyLimitAmount}`
          );
          notify('points', currPoints);
        }
      }
      if (pages > 5 || pages < 1) {
        pagestemp = 3;
      } else {
        pagestemp = pages;
      } // in case someone has old setting with more than 5 pages to load or somehow set this value to <1 use 3 (default)
      token = $(data)
        .find('input[name=xsrf_token]')
        .val();
      mylevel = $(data)
        .find('a[href="/account"]')
        .find('span')
        .next()
        .html()
        .match(/(\d+)/)[1];
      // save new level if it changed
      if (settings.LastKnownLevel !== parseInt(mylevel, 10)) {
        chrome.storage.sync.set({ LastKnownLevel: parseInt(mylevel, 10) });
      }

      // var numOfGAsOnPage = parseInt($(data).find('.pagination__results').children().next().text(), 10);
      if (
        currPoints >= settings.PointsToPreserve ||
        (useWishlistPriorityForMainBG &&
          settings.IgnorePreserveWishlistOnMainBG)
      ) {
        scanpage(data); // scan this page that was already loaded to get info above
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
            $.get(linkToUse + n, newPage => {
              scanpage(newPage);
            });
          }
        }
      }
    });
  }
}

/* Load settings, then call settingsloaded() */
function loadsettings() {
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
    data => {
      settings = data;
      settingsloaded();
    }
  );
}

/* Function declarations over */

/* It all begins with the loadsettings call */
chrome.alarms.onAlarm.addListener(alarm => {
  console.log('Alarm fired.');
  if (alarm.name === 'routine') {
    loadsettings();
    chrome.alarms.create('routine', {
      delayInMinutes: 30,
    });
  }
});

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

/* Create first alarm as soon as possible */
chrome.alarms.create('routine', {
  delayInMinutes: 0.1,
});

/* Creating a new tab if notification is clicked */
chrome.notifications.onClicked.addListener(notificationId => {
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
  chrome.windows.getCurrent(currentWindow => {
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

chrome.runtime.onInstalled.addListener(updateInfo => {
  if (updateInfo.previousVersion < '1.5.0') {
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
          iconUrl: 'autologosteam.png',
        };
        chrome.notifications.create('1.5.0 announcement', e);
      }
    );
  }
  if (updateInfo.previousVersion <= '1.6.2') {
    console.log('Changing settings of minCost to minCostBG');
    chrome.storage.sync.get(
      {
        MinCost: 0,
      },
      minCost => {
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

// Check if we have "*://steamcommunity.com/profiles/*" permission, ask for them if not
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.runtime.sendMessage({ task: 'checkPermission' });
  if (request.task === 'checkPermission') {
    console.log(
      'Got a request for "*://steamcommunity.com/profiles/*" permission'
    );
    chrome.permissions.contains(
      {
        origins: ['*://steamcommunity.com/profiles/*'],
      },
      result => {
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
            granted => {
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
});
