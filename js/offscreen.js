chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.task) {
    case 'parse':
      const data = parse(msg.data);
      chrome.runtime.sendMessage(data);
      break;
    case 'audio':
      const audio = new Audio('/media/audio.mp3');
      audio.volume = msg.data;
      audio.play();
      break;
    case 'fetch':
    case 'checkPermission':
      break;
    default:
      console.log(
        `Unknown message type for offscreen document: ${msg.task}`,
        msg
      );
  }
});
