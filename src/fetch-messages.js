import $ from 'jquery';
import axios from 'axios';
import HTTP from 'http-status';
import log from './log';
import url from './urls';
import { INBOX_ID } from './constants';

export default function fetchMessages(retry) {
  log('Fetching Messages tab');

  // Make the request
  return axios.get(url)
    .then(handleResponse)
    .catch(handleError);
}

// Handle successes
function handleResponse(response) {
  const { data } = response;
  // We're only looking for messages that have invitations
  // (i.e., messages from another user to us)
  const $received = $(data).find(`#${INBOX_ID}`);

  return $received.children('.feedmessage');
}

function handleError(error) {
  const { response } = error;
  // If we have a response from the server, then we know we have a network connection,
  // and it's probably not our fault. FL returns 404s and 503s every now and then;
  // we'll just reschedule a retry in a minute, if we're not retrying already.
  if (response) {
    if (HTTP.NOT_FOUND === response.status || response.status >= 500) {
      if (!retry) {
        setTimeout(() => fetchMessages(true), 60 * 1000);
      }
    } else {
      // If we've received another kind of error, then we want it logged
      console.error(error);
    }
  }
}
