import $ from 'jquery';
import md5 from 'js-md5';
import MutationSummary from 'mutation-summary';

import { BADGE_ID, DELAY, INBOX_ID, MESSAGES_TAB_ID } from './constants';
import fetchMessages from './fetch-messages';
import updateBadge from './update-badge';
import log from './log';
import './styles.scss';

// We store messages in the inbox as a [hash => boolean] map.
// Messages are either read or unread. On page load, we'll just
// assume that the user wants to know whether they've got any
// mail or not, so everything will be set to 'unread' on page
// load/refresh (incidentally saving us from having to persist stuff).
// When the user manually clicks over the 'Messages' tab,
// we'll flag the messages as 'read'.
const messageHashes = {};

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
    // Update our map of hashes
    .then(hashMessages)
    // set the notification badge number and visibility
    .then(() => updateBadge({ messageHashes }));
}

function hashMessages($messages) {
  // If $messages is falsy (probably undefined), then there's likely
  // been a network error, and we can't do anything about that. Just
  // fail gracefully.
  if (!($messages && $messages.length)) {
    return;
  }

  // MD5ing each 's HTML content is a quick and dirty way of
  // giving it a unique key, since each div.feedmessage has a unique ID
  // (e.g., "feedmessage41120633").
  $messages.each(function hashMessage() {
    // Hash the HTML
    const hash = md5($(this).html());
    // If it's not already a key, then add it with an 'unread' flag.
    // If it is a key, it's already either read (false) or unread (true),
    // but either way we know about it and can ignore it.
    if (messageHashes[hash] === undefined) {
      messageHashes[hash] = true;
    }
  });
}

function insertNotificationBadge() {
  // We need to make the 'MESSAGES' tab relatively positioned
  // so that our notification badge can be absolutely positioned
  // with respect to it. We're repurposing the .qq class from
  // the main Fallen London stylesheet with some minor modifications.
  $(`#${MESSAGES_TAB_ID}`)
    .addClass('flmn-position-relative')
    .append($(`<div id="${BADGE_ID}" class="qq flmn-badge" />`));
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
      Object.keys(messageHashes).forEach((k) => {
        messageHashes[k] = false;
      });

      // Set badge visibility (to invisible)
      updateBadge({ messageHashes });
    }
  }
}
