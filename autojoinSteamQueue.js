// Most of it was made by xPaw: https://gist.github.com/xPaw/73f8ae2031b4e528abf7

document.querySelector("a.tab")
  .insertAdjacentHTML('afterend', '<a class="tab" onclick="GenerateQueue(0)"><span>AutoJoin Queue</a></span>');
var DiscoveryQueueModal, GenerateQueue = function(queueNumber) {
  DiscoveryQueueModal = ShowBlockingWaitDialog('Exploring queue...', 'Generating new discovery queue #' + ++queueNumber);

  jQuery.post('http://store.steampowered.com/explore/generatenewdiscoveryqueue', {
    sessionid: g_sessionID,
    queuetype: 0
  }).done(function(data) {
    var requests = [],
      done = 0,
      errorShown;

    for (var i = 0; i < data.queue.length; i++) {
      var request = jQuery.post('http://store.steampowered.com/app/10', {
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
};
