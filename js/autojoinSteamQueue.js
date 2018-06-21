// Most of it was made by xPaw: https://gist.github.com/xPaw/73f8ae2031b4e528abf7

// Add following lines into manifest.json under content_scripts section (and tweak or remove date below):
// {
//    "js": [ "js/autojoinSteamQueue.js" ],
//    "matches": [ "*://store.steampowered.com/*" ]
// }

const summer2018 = new Date(2018, 6, 6);
if (Date.now() < summer2018) {
  // I will update extension after the sale and remove this injection but.. in case I die you're not stuck with useless button :)

  // We have to inject it like this to access global functions and variables
  const scriptToInject = `var DiscoveryQueueModal, GenerateQueue = function(queueNumber) {
  DiscoveryQueueModal = ShowBlockingWaitDialog('Exploring queue...', 'Generating new discovery queue #' + ++queueNumber);

  jQuery.post('//store.steampowered.com/explore/generatenewdiscoveryqueue', {
    sessionid: g_sessionID,
    queuetype: 0
  }).done(function(data) {
    var requests = [],
      done = 0,
      errorShown;

    for (var i = 0; i < data.queue.length; i++) {
      var request = jQuery.post('//store.steampowered.com/app/10', {
        appid_to_clear_from_queue: data.queue[i],
        sessionid: g_sessionID
      });

      request.done(function() {
        if (errorShown) {
          return;
        }

        DiscoveryQueueModal.Dismiss();
        DiscoveryQueueModal = ShowBlockingWaitDialog('Exploring the queue...', 'Request ' + ++done + ' of ' + data.queue.length);
      });

      request.fail(function() {
        errorShown = true;

        DiscoveryQueueModal.Dismiss();
        DiscoveryQueueModal = ShowConfirmDialog('Error', 'Failed to clear queue item #' + ++done, 'Try again').done(function() {
          GenerateQueue(queueNumber - 1);
        });
      });

      requests.push(request);
    }

    jQuery.when.apply(jQuery, requests).done(function() {
      DiscoveryQueueModal.Dismiss();

      if (queueNumber < 3) {
        GenerateQueue(queueNumber);
      } else {
        DiscoveryQueueModal = ShowConfirmDialog('Done', 'Queue has been explored ' + queueNumber + ' times', 'Reload the page').done(function() {
          ShowBlockingWaitDialog('Reloading the page');
          window.location.reload();
        });
      }
    });
  }).fail(function() {
    DiscoveryQueueModal.Dismiss();
    DiscoveryQueueModal = ShowConfirmDialog('Error', 'Failed to generate new queue #' + queueNumber, 'Try again').done(function() {
      GenerateQueue(queueNumber - 1);
    });
  });
};`;

  const script = document.createElement('script');
  script.innerHTML = scriptToInject;
  document.body.appendChild(script);
  document.querySelector('.supernav_container')
    .insertAdjacentHTML('beforeend', '<a class="menuitem supernav" style="cursor: pointer; color: #FFD700" title="This button will be removed after the sale. Visit AutoJoin Steam group for more details." onclick="GenerateQueue(0)">AutoJoin Queue</a>');
}
