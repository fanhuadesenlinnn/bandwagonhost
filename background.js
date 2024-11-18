chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchTrafficData') {
      fetch(request.url)
        .then(response => response.json())
        .then(data => {
          sendResponse({success: true, data: data});
        })
        .catch(error => {
          sendResponse({success: false, error: error.toString()});
        });
      return true;
    }
  });