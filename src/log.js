export default function log(msg) {
  // DEBUG is set during the build process
  // eslint-disable-next-line no-undef
  if (DEBUG) console.info(`FLSN: ${msg}`);
}
