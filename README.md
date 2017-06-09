# Fallen London Social Notifications

## Building the source

To build the source, you'll need a working copy of Node and Yarn. After running `yarn install`, the Yarn commands to build are as follows:

1. `yarn watch` will compile the sources into an unpacked extension in the `build/` directory and watch for changes (useful for development);
2. `yarn build` compiles as above without watching; and
3. `yarn dist` builds a ZIP with the current version number in the `dist/` directory.
