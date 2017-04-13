import $ from 'jquery';
import log from './log';
import { BADGE_ID } from './constants';

export default function setBadgeVisibility({ messageHashes }) {
  // If we have unread messages, then show the badge; otherwise, hide it
  const unreadMessages = enumerateUnreadMessages();

  if (unreadMessages > 0) {
    log('Unread messages!');
    showBadge();
  } else {
    hideBadge();
  }

  function enumerateUnreadMessages() {
    // Return the number of unread messages
    return Object.keys(messageHashes).filter(x => messageHashes[x]).length;
  }

  function showBadge() {
    // Show the notification badge with the number of unread messages
    $(`#${BADGE_ID}`).text(unreadMessages.toString());
  }

  function hideBadge() {
    // Clear the notification badge (which will hide it)
    $(`#${BADGE_ID}`).text('');
  }
}

