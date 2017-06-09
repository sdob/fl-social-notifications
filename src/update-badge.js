import $ from 'jquery';
import log from './log';
import { BADGE_ID } from './constants';

export default function updateBadge(nUnreadMessages) {
  log (`Unread messages: ${nUnreadMessages}`);
  if (nUnreadMessages > 0) {
    return $(`#${BADGE_ID}`).text(`${nUnreadMessages}`);
  }
  return $(`#${BADGE_ID}`).text('');
}
