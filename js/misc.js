chrome.storage.sync.get({ NightTheme: false }, (data) => {
  if (data.NightTheme === true) {
    const path = chrome.extension.getURL('/css/night.css');
    const nighttheme = document.createElement('link');
    nighttheme.rel = 'stylesheet';
    nighttheme.type = 'text/css';
    nighttheme.href = path;
    document.getElementsByTagName('head')[0].appendChild(nighttheme);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  /* Pin navigation bar */
  const navbar = document.querySelector('.nav__left-container');
  let navbarPinned = false;
  const navbarPinIcon = document.createElement('i');
  navbarPinIcon.className = 'fa fa-thumb-tack';
  const navbarPin = document.createElement('div');
  navbarPin.className =
    'nav__button-container nav__button-container--notification nav__button-container--inactive';
  navbarPin.id = 'navbarPin';
  navbarPin.title = 'Pin navigation bar';
  navbarPin.appendChild(navbarPinIcon);
  navbar.prepend(navbarPin);
  navbarPin.addEventListener('click', () => {
    chrome.storage.local.set({ pinnedNavbar: !navbarPinned }, evalPinnedNavbar);
  });
  const bufferEl = document.createElement('div');
  bufferEl.id = 'bufferEl';
  document.querySelector('body').prepend(bufferEl);

  const evalPinnedNavbar = () => {
    chrome.storage.local.get({ pinnedNavbar: true }, (data) => {
      if (data.pinnedNavbar) {
        navbarPinned = true;
        navbarPin.classList.remove('nav__button-container--inactive');
        navbarPin.classList.add('nav__button-container--active');
        bufferEl.className = 'pinned';
        document.querySelector('header').classList.add('pinned');
      } else {
        navbarPinned = false;
        navbarPin.classList.remove('nav__button-container--active');
        navbarPin.classList.add('nav__button-container--inactive');
        bufferEl.className = '';
        document.querySelector('header').classList.remove('pinned');
      }
    });
  };
  evalPinnedNavbar();

  /* Pin footer */
  const ajFooter = document.createElement('div');
  ajFooter.id = 'ajFooter';
  const ajFooterArrowWrap = document.createElement('div');
  ajFooterArrowWrap.id = 'ajFooterArrowWrap';
  const ajFooterArrow = document.createElement('div');
  ajFooterArrow.id = 'ajFooterArrow';
  ajFooterArrow.textContent = '▲';
  ajFooterArrowWrap.appendChild(ajFooterArrow);
  ajFooter.appendChild(ajFooterArrowWrap);

  const sgFooter = document.querySelector('.footer__outer-wrap');
  sgFooter.parentElement.insertBefore(ajFooter, sgFooter);
  ajFooter.appendChild(sgFooter);

  let footerPinned = false;
  ajFooterArrowWrap.addEventListener('click', () => {
    chrome.storage.local.set({ pinnedFooter: !footerPinned }, evalPinnedFooter);
  });

  const evalPinnedFooter = () => {
    chrome.storage.local.get({ pinnedFooter: true }, (data) => {
      footerPinned = data.pinnedFooter;
      if (footerPinned) {
        ajFooter.className = 'pinned';
      } else {
        ajFooter.className = '';
      }
    });
  };
  evalPinnedFooter();
});
