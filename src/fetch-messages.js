import $ from 'jquery';
import axios from 'axios';
import HTTP from 'http-status';

import log from './log';
import MESSAGES_TAB_URL from './urls';
import { INBOX_ID } from './constants';

export default function fetchMessages(retry) {
  log('Fetching Messages tab');

  // Make the request
  return axios.get(MESSAGES_TAB_URL)
    .then(handleResponse)
    .catch(handleError);

  // Handle the HTML in a successful response; extract the messages with
  // invitations and return them
  function handleResponse({ data }) {
    // We're only looking for messages that have invitations
    // (i.e., messages from another user to us)
    return $(data).find(`#${INBOX_ID} .feedmessage`);
  }

  // Handle errors. These are almost certainly down to intermittent
  // flakiness on the FL servers (status 404/503), in which case we'll schedule
  // exactly one more attempt. If there's no response, then it's likely that
  // the user's lost connectivity, and we'll just ignore it.
  function handleError(error) {
    const { response } = error;
    // If we have a response from the server, then we know we have a network connection,
    // and it's probably not our fault. FL returns 404s and 503s every now and then;
    // we'll just reschedule a retry in a minute.
    if (response) {
      if (HTTP.NOT_FOUND === response.status || response.status >= 500) {
        // Only reschedule once (otherwise, stick to the normal interval).
        if (!retry) {
          setTimeout(() => fetchMessages(true), 60 * 1000);
        }
      }
    }
  }
}
