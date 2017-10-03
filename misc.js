chrome.storage.sync.get({NightTheme: false}, function(data) {
	if (data.NightTheme == true){
		var path = chrome.extension.getURL('/night.css');
		var nighttheme = document.createElement('link');
		nighttheme.rel = 'stylesheet';
		nighttheme.type = 'text/css';
		nighttheme.href = path;
		document.getElementsByTagName('head')[0].appendChild(nighttheme);
	}
});

/*Pin navigation bar*/
var navbar = document.querySelector('.nav__left-container');
var navbarPinned = false;
var navbarPinIcon = document.createElement('i');
navbarPinIcon.className = 'fa fa-thumb-tack';
var navbarPin = document.createElement('div');
navbarPin.className = 'nav__button-container nav__button-container--notification nav__button-container--inactive';
navbarPin.id = 'navbarPin';
navbarPin.title = 'Pin navigation bar';
navbarPin.appendChild(navbarPinIcon);
navbar.prepend(navbarPin);
navbarPin.addEventListener('click', function(){
	chrome.storage.local.set({pinnedNavbar: !navbarPinned}, evalPinnedNavbar);
});
var bufferEl = document.createElement('div');
bufferEl.id = 'bufferEl';
document.querySelector('body').prepend(bufferEl);

function evalPinnedNavbar(){
	chrome.storage.local.get({pinnedNavbar: true}, function(data){
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
}
evalPinnedNavbar();

/*Pin footer*/
var ajFooter = document.createElement('div');
ajFooter.id = 'ajFooter';
var ajFooterArrowWrap = document.createElement('div');
ajFooterArrowWrap.id = 'ajFooterArrowWrap';
var ajFooterArrow = document.createElement('div');
ajFooterArrow.id= 'ajFooterArrow';
ajFooterArrow.textContent = '▲';
ajFooterArrowWrap.appendChild(ajFooterArrow);
ajFooter.appendChild(ajFooterArrowWrap);

var sgFooter = document.querySelector('.footer__outer-wrap');
sgFooter.parentElement.insertBefore(ajFooter, sgFooter);
ajFooter.appendChild(sgFooter);

var footerPinned = false;
ajFooterArrowWrap.addEventListener('click', function(){
	chrome.storage.local.set({pinnedFooter: !footerPinned}, evalPinnedFooter);
});

function evalPinnedFooter(){
	chrome.storage.local.get({pinnedFooter: true}, function(data){
		footerPinned = data.pinnedFooter;
		if (footerPinned) {
			ajFooter.className = 'pinned';
		} else {
			ajFooter.className = '';
		}
	});
}
evalPinnedFooter();