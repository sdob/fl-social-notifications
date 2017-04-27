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

  // Handle successes; extract the messages with invitations and
  // return them
  function handleResponse(response) {
    const { data } = response;
    // We're only looking for messages that have invitations
    // (i.e., messages from another user to us)
    return $(data).find(`#${INBOX_ID} .feedmessage`);
  }

  // Handle errors. These are almost certainly down to intermittent
  // flakiness on the FL servers (404/503), in which case we can schedule
  // exactly one more attempt; if there's no response, then it's likely that
  // the user's lost connectivity (in which case there's nothing we can do,
  // and logging errors isn't terribly helpful).
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
      }
    }
  }
}
