import $ from 'jquery';
import axios from 'axios';
import md5 from 'js-md5';
import log from './log';
import * as urls from './urls';

export default function fetchMessages() {
  log('Fetching Messages tab');
  // Make the request
  return axios.get(urls.MESSAGES)
    .then(handleResponse)
    .catch(handleError);

  // Handle successes
  function handleResponse(response) {
    const { data } = response;
    // We're only looking for messages that have invitations
    // (i.e., messages from another user to us)
    const $received = $(data).find('#FeedMessagesWithInvitations');

    return $received.children('.feedmessage');
    /*
    */
  }

  // Handle errors
  function handleError(error) {
    const { data } = error;
    if (data) {
      // We have a response from the server, so there's a network connection there
      return console.error(data);
    }
    return console.error(error);
  }
}
