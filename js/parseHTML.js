const parse = (data) => {
  const result = {};
  const html = data.html;
  const parser = new DOMParser();
  let dom = parser.parseFromString(html, 'text/html');

  for (const item of data.items) {
    switch (item) {
      case 'won':
        if (dom.querySelector('.popup--gift-received')) {
          result.won = true;
        } else {
          result.won = false;
        }
        break;
      case 'myLevel':
        result.myLevel = parseInt(
          dom.querySelector('a[href="/account"] span:last-child').title,
          10
        );
        break;
      case 'myPoints':
        result.myPoints = parseInt(
          dom
            .querySelector('a[href="/account"] span.nav__points')
            ?.textContent.replace(',', ''),
          10
        );
        break;
      case 'token':
        result.token = dom.querySelector('input[name=xsrf_token]').value;
        break;
      case 'giveawaysWithoutPinned':
        const withoutPinned = dom.querySelector(
          ':not(.pinned-giveaways__inner-wrap) > .giveaway__row-outer-wrap'
        )?.parentElement;
        dom = withoutPinned || document.createElement('empty');
      case 'giveaways':
        const gaElements = [
          ...dom.querySelectorAll(
            '.giveaway__row-inner-wrap:not(.is-faded) .giveaway__heading__name'
          ),
        ];
        let giveaways = [];
        for (const item of gaElements) {
          const resultGA = {
            GAcode: '',
            GAlevel: 0,
            GAsteamAppID: '0',
            cost: '',
            timeEnd: 0,
            timeStart: 0,
            isGroupGA: false,
            levelTooHigh: false,
            numberOfEntries: 100,
            numberOfCopies: 1,
          };
          const ga = item.parentElement.parentElement.parentElement;

          // giveaway code
          const t = item.href.match(/giveaway\/(.+)\//);
          if (t.length > 0) {
            resultGA.GAcode = t[1];
          }

          // if level is too high
          if (
            ga.querySelector('.giveaway__column--contributor-level--negative')
          ) {
            resultGA.levelTooHigh = true;
          }

          // level required (only if not too high)
          if (
            ga.querySelector('.giveaway__column--contributor-level--positive')
          ) {
            resultGA.GAlevel = ga
              .querySelector('.giveaway__column--contributor-level--positive')
              .innerHTML.match(/(\d+)/)[1];
          }

          // steam app id
          const s = ga.querySelector('.giveaway_image_thumbnail')?.style
            ?.backgroundImage;
          if (s !== undefined) {
            // undefined when no thumbnail is available (mostly non-steam bundles)
            const c = s.match(/.+(?:apps|subs)\/(\d+)\/cap.+/);
            if (s && c) {
              resultGA.GAsteamAppID = c[1]; // TODO: differentiate between sub ID and app ID
            }
          }

          // how much points to enter giveaway
          resultGA.cost = [...ga.querySelectorAll('.giveaway__heading__thin')]
            .pop()
            .innerHTML.match(/\d+/)[0];

          // when giveaway ends
          resultGA.timeEnd = parseInt(
            ga.querySelector('.fa-clock-o').parentElement.querySelector('span')
              .dataset.timestamp,
            10
          );

          // number of entries
          resultGA.numberOfEntries = parseInt(
            ga
              .querySelector('.giveaway__links a[href$="/entries"]')
              ?.textContent.replace(',', ''),
            10
          );

          // if more than one copy there's a text field "(N Copies)"
          let regexResult = ga
            .querySelector('.giveaway__heading__thin')
            .textContent.replace(',', '')
            .match(/\((\d+) Copies\)/);
          if (regexResult) {
            resultGA.numberOfCopies = regexResult[1];
          }

          // when giveaway started
          resultGA.timeStart = parseInt(
            ga
              .querySelector('.giveaway__username')
              .parentElement.querySelector('span').dataset.timestamp,
            10
          );

          giveaways.push(resultGA);
        }
        result[item] = giveaways;
        break;
      case 'wonPageKeys':
        result.wonPageKeys = [...dom.querySelectorAll('.view_key_btn')].map((btn) => {
          const form = btn.parentElement.nextElementSibling.querySelector('form');
          return {
            winner_id: form.querySelector("input[name='winner_id']").value,
            xsrf_token: form.querySelector("input[name='xsrf_token']").value,
          };
        });
        break;
      case 'wonPageGameName':
        result.wonPageGameName = dom.querySelector('.table__column__heading')?.textContent ?? '';
        break;
      case 'username': {
        const profileLink = dom.querySelector(
          '.nav__button-container--notification a.nav__avatar-outer-wrap'
        );
        result.username = profileLink?.href?.match(/\/user\/([^/]+)/)?.[1] ?? '';
        break;
      }
      default:
        console.log(
          `Unknown item requested while parsing html in offscreen document: ${item}`
        );
    }
  }

  return result;
};
