import $ from 'jquery';
import log from './log';
import { BADGE_ID, MESSAGES_TAB_ID } from './constants';

export default function insertNotificationBadge() {
  // We need to make the 'MESSAGES' tab relatively positioned
  // so that our notification badge can be absolutely positioned
  // with respect to it. We're repurposing the .qq class from
  // the main Fallen London stylesheet with some minor modifications.
  log('Inserting notification badge element');
  $(`#${MESSAGES_TAB_ID}`)
    .addClass('flsn-position-relative')
    .append($(`<div id="${BADGE_ID}" class="qq flsn-badge" />`));
}
