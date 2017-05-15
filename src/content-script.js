import $ from 'jquery';
import md5 from 'js-md5';
import MutationSummary from 'mutation-summary';

import { BADGE_ID, DELAY, INBOX_ID, MESSAGES_TAB_ID } from './constants';
import fetchMessages from './fetch-messages';
import updateBadge from './update-badge';
import log from './log';
import './styles.scss';

// We store messages in the inbox as an [ID => boolean] map.
// Messages are either read or unread. On page load, we'll just
// assume that the user wants to know whether they've got any
// mail or not, so everything will be set to 'unread' on page
// load/refresh (incidentally saving us from having to persist stuff).
// When the user manually clicks over the 'Messages' tab,
// we'll flag the messages as 'read'.
const messageIDs = {};

// Kick everything off
initialize();

function initialize() {
  log('Initializing');

  // Add the DOM element for the notification
  insertNotificationBadge();

  // Make an initial call to the FL servers
  fetchAndThenSetBadge();

  // Check every 5 minutes
  setInterval(fetchAndThenSetBadge, DELAY);

  // Watch for when we click over to the 'Messages' tab
  observeMessagesTab();
}

function fetchAndThenSetBadge() {
  // Retrieve messages
  fetchMessages()
    // Update our store
    .then(updateStore)
    // set the notification badge number and visibility
    .then(() => updateBadge({ messageIDs }));
}

function updateStore($messages) {
  // If $messages is falsy (probably undefined), then there's likely
  // been a network error, and we can't do anything about that. Just
  // fail gracefully.
  if (!($messages && $messages.length)) {
    return;
  }

  $messages.each(function extractID() {
    // Extract the message ID
    const id = $(this).attr('id');
    // If the ID isn't already a key, then add it with an 'unread' flag.
    // If it is a key, then it's already either read (false) or unread (true),
    // but either way we know about it and don't have to update the map.
    if (messageIDs[id] === undefined) {
      messageIDs[id] = true;
    }
  });
}

function insertNotificationBadge() {
  // We need to make the 'MESSAGES' tab relatively positioned
  // so that our notification badge can be absolutely positioned
  // with respect to it. We're repurposing the .qq class from
  // the main Fallen London stylesheet with some minor modifications.
  $(`#${MESSAGES_TAB_ID}`)
    .addClass('flsn-position-relative')
    .append($(`<div id="${BADGE_ID}" class="qq flsn-badge" />`));
}

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

  // Check whether we're on the MESSAGES tab; if so, then set
  // all messages to 'read', and hide the badge
  function callback() {
    // Check for the existence of the message inbox
    if ($(`#${INBOX_ID}`).length) {
      // We are on the Messages tab; set all messages to read
      Object.keys(messageIDs).forEach((k) => {
        messageIDs[k] = false;
      });

      // Set badge visibility (to invisible)
      updateBadge({ messageIDs });
    }
  }
}
