import $ from 'jquery';
import log from './log';
import { BADGE_ID } from './constants';

export default function updateBadge({ messageIDs }) {
  // If we have unread messages, then show the badge; otherwise, hide it
  const unreadMessages = enumerateUnreadMessages(messageIDs);
  setBadgeContents(unreadMessages);

  function setBadgeContents(unreadMessages) {
    // If we have unread messages, then show the notification badge with
    // the number of unread messages
    if (unreadMessages > 0) {
      // Show the notification badge with the number of unread messages
      return $(`#${BADGE_ID}`).text(unreadMessages.toString());
    }
    // Clear the notification badge (which will hide it)
    $(`#${BADGE_ID}`).text('');
  }
}

function enumerateUnreadMessages(messageIDs) {
  // Return the number of unread messages
  return Object.keys(messageIDs).filter(x => messageIDs[x]).length;
}
