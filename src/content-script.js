import $ from 'jquery';
import MutationSummary from 'mutation-summary';

import { BADGE_ID, DELAY, INBOX_ID, MESSAGES_TAB_ID } from './constants';
import fetchMessages from './fetch-messages';
import insertNotificationBadge from './insert-notification-badge';
import log from './log';
import updateBadge from './update-badge';
import './styles.scss';

// Kick everything off
initialize();

function initialize() {
  log('Initializing');

  // Add the DOM element for the notification badge
  insertNotificationBadge();

  // Make an initial call to the FL servers and update the badge
  fetchAndUpdateBadge();

  // Check every 5 minutes
  setInterval(fetchAndUpdateBadge, DELAY);

  // Watch for when we click over to the 'Messages' tab (we will clear
  // the notification badge and set all messages to 'read')
  observeMessagesTab();
}

// Return an array of the ID attribute of each $element passed in
function extractIDs($elements) {
  log('extracting IDs from');
  if (!$elements) {
    return [];
  }
  return $elements.map(function() { return $(this).attr('id'); }).get();
}

// Fetch messages from the server then update the notification badge
function fetchAndUpdateBadge() {
  log('Fetching and updating');
  fetchMessages()
  .then(extractIDs)
  .then((messageIDs) => {
    // Retrieve the list of read messages from storage; if a message ID isn't
    // in it, then it's new
    chrome.storage.local.get(null, ({ storedReadMessages }) => {
      // storedReadMessages is undefined on first run
      const readMessages = storedReadMessages || [];
      // Messages are new if they aren't in the read messages store
      const nNewMessages = messageIDs.filter(id => !readMessages.includes(id)).length;
      log(`nNewMessages: ${nNewMessages}`);
      // Update the notification badge
      updateBadge(nNewMessages);
    });
  });
}

// Watch the #mainContentViaAjax element to see if we're on the MESSAGES tab
// and if so update both the notification badge and the list of read messages
function observeMessagesTab() {
  // We want to clear the notifications badge when the user clicks
  // over to the MESSAGES tab.
  const rootNode = document.querySelector('#mainContentViaAjax');
  const queries = [{ element: '*' }];

  return new MutationSummary({
    rootNode,
    queries,
    callback,
  });

  // If we have an #INBOX_ID div, then we're on the MESSAGES tab
  function callback() {
    if ($(`#${INBOX_ID}`).length) {
      // Set the stored list of read messages
      // to whatever's here --- any stale message IDs in the store have been
      // dealt with
      const $messageDivs = $(`div#${INBOX_ID} div.feedmessage`);
      const messageIDs = extractIDs($messageDivs);
      chrome.storage.local.set({ storedReadMessages: messageIDs });
      updateBadge(0);
    }
  }
}
