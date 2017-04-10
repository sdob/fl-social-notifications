export default function log(msg) {
  // DEBUG is set during the build process
  DEBUG && console.info(`FLMS: ${msg}`);
}
