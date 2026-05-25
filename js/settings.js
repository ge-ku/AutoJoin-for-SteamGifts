// Call this function when #settingsDiv is present on the page.
function loadSettings() {
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
      Delay: 10,
      DelayBG: 10,
      MinLevelBG: 0,
      MinCost: 0,
      MinCostBG: 0,
      MaxCost: -1,
      MaxCostBG: -1,
      PointsToPreserve: 0,
      WishlistPriorityForMainBG: false,
      IgnorePreserveWishlistOnMainBG: false,
      ShowChance: true,
      NotifyLimit: false,
      NotifyLimitAmount: 300,
      PreciseTime: false,
      AutoRedeemKey: false,
    },
    (settings) => {
      fillSettingsDiv(settings);
    }
  );
}

function fillSettingsDiv(settings) {
  document.getElementById('chkAutoDescription').checked =
    settings.AutoDescription;
  document.getElementById('chkAutoComment').checked = settings.AutoComment;
  document.getElementById('txtAutoComment').value = settings.Comment;
  document.getElementById('chkInfiniteScroll').checked =
    settings.InfiniteScrolling;
  document.getElementById('chkShowPoints').checked = settings.ShowPoints;
  document.getElementById('chkShowButtons').checked = settings.ShowButtons;
  document.getElementById('chkHideDlc').checked = settings.HideDlc;
  document.getElementById('chkHideEntered').checked = settings.HideEntered;
  document.getElementById('chkHideGroups').checked = settings.HideGroups;
  document.getElementById('chkHideNonTradingCards').checked =
    settings.HideNonTradingCards;
  document.getElementById('chkHideWhitelist').checked = settings.HideWhitelist;
  document.getElementById('hideLevelsBelow').value = settings.HideLevelsBelow;
  document.getElementById('hideCostsBelow').value = settings.HideCostsBelow;
  document.getElementById('hideLevelsAbove').value = settings.HideLevelsAbove;
  document.getElementById('hideCostsAbove').value = settings.HideCostsAbove;
  document.getElementById('chkNightTheme').checked = settings.NightTheme;
  document.getElementById('chkShowChance').checked = settings.ShowChance;
  document.getElementById('chkPreciseTime').checked = settings.PreciseTime;

  settingsAttachEventListeners();
}

function settingsAttachEventListeners() {
  const saveButtonEl = document.getElementById('btnSetSave');
  saveButtonEl.addEventListener('click', () => {
    chrome.storage.sync.set(
      {
        AutoDescription: document.getElementById('chkAutoDescription').checked,
        AutoComment: document.getElementById('chkAutoComment').checked,
        Comment: document.getElementById('txtAutoComment').value.trim(),
        InfiniteScrolling: document.getElementById('chkInfiniteScroll').checked,
        ShowPoints: document.getElementById('chkShowPoints').checked,
        ShowButtons: document.getElementById('chkShowButtons').checked,
        HideDlc: document.getElementById('chkHideDlc').checked,
        HideEntered: document.getElementById('chkHideEntered').checked,
        HideGroups: document.getElementById('chkHideGroups').checked,
        HideNonTradingCards: document.getElementById('chkHideNonTradingCards')
          .checked,
        HideWhitelist: document.getElementById('chkHideWhitelist').checked,
        HideLevelsBelow: parseInt(
          document.getElementById('hideLevelsBelow').value,
          10
        ),
        HideCostsBelow: parseInt(
          document.getElementById('hideCostsBelow').value,
          10
        ),
        HideLevelsAbove: parseInt(
          document.getElementById('hideLevelsAbove').value,
          10
        ),
        HideCostsAbove: parseInt(
          document.getElementById('hideCostsAbove').value,
          10
        ),
        NightTheme: document.getElementById('chkNightTheme').checked,
        ShowChance: document.getElementById('chkShowChance').checked,
        PreciseTime: document.getElementById('chkPreciseTime').checked,
      },
      () => {
        if (
          document.location.protocol !== 'http:' &&
          document.location.protocol !== 'https:'
        ) {
          saveButtonEl.innerText = 'Settings Saved!';
          saveButtonEl.disabled = true;
          setTimeout(() => {
            saveButtonEl.innerText = 'Save';
            saveButtonEl.disabled = false;
          }, 500);
        } else {
          window.location.reload();
        }
      }
    );
  });

  // grant "*://steamcommunity.com/profiles/*" permission
  document
    .getElementById('chkHideNonTradingCards')
    .addEventListener('change', requirePermissions);
  document
    .getElementById('chkHideDlc')
    .addEventListener('change', requirePermissions);
  function requirePermissions(e) {
    if (e.target.checked) {
      // chrome.permissions.* API is not available in content script
      // we'll have to message background script to check if we have it

      // set new event listener for anticipated response
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.granted === 'true') {
          // we have permission, do nothing
        } else {
          // we don't have permission, uncheck this option
          e.target.checked = false;
        }
      });
      chrome.runtime.sendMessage({ task: 'checkPermission', ask: 'true' });
    }
  }

  const settingsCancelElements =
    document.getElementsByClassName('settingsCancel');
  Array.from(settingsCancelElements).forEach((element) => {
    element.addEventListener('click', () => {
      const settingsShadeEl = document.getElementById('settingsShade');
      const settingsDivEl = document.getElementById('settingsDiv');
      settingsShadeEl.classList.remove('fadeIn');
      settingsShadeEl.classList.add('fadeOut');
      settingsDivEl.classList.remove('fadeIn');
      settingsDivEl.classList.add('fadeOut');
    });
  });
}

function setAudioVolume() {
  // play audio when changing volume
  const audio = new Audio(chrome.runtime.getURL('/media/audio.mp3'));
  audio.volume = document.getElementById('audioVolume').value;
  audio.play();
}

/* This is for case when window.innerHeight is less than settings div height. */
function fitSettings() {
  if (
    window.innerHeight < document.getElementById('settingsDiv').clientHeight
  ) {
    document.getElementById('settingsDiv').className += ' fit';
  }
}
