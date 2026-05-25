chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.clearAll();
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

  if (url.includes('steamcommunity.com')) {
    const havePermissions = await chrome.permissions.contains({
      origins: ['*://steamcommunity.com/profiles/*'],
    });

    if (!havePermissions) {
      console.log(
        'Disabling settings that require optional permission which is not granted.'
      );

      chrome.storage.sync.set({
        PriorityWishlist: false,
        HideNonTradingCards: false,
        HideDlc: false,
      });

      result.status = 403;
      return result;
    }
  }

  const res = await fetch(url);
  result.status = res.status;
  if (res.ok) {
    const text = await res.text();
    result.text = text;
  }
  return result;
};
