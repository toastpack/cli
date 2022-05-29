# toastpack bundled packages
This are the libraries and packages used in toastpack.
- @toastpack/cli - The CLI you interact with
- @toastpack/gitPlugin - A source that uses git repos
- @toastpack/npmPlugin - A source that uses npm packages via [npmProxy](https://github.com/toastpack/npmProxy)
- @toastpack/utils - A set of utilities that are used in toastpack
- [commander](https://npmjs.com/commander) - A command line interface library (Modified to make ESM only)
- [enquirer](https://npmjs.com/enquirer) - A prompt library (Modified to make slightly more ESM)
  - [ansi-colors](https://npmjs.com/ansi-colors) - A library to add ANSI colors to text and symbols in the terminal (CJS, sigh)
- [signale](https://npmjs.com/signale) - A logging library (Modified to make ESM only)
  - [figures](https://npmjs.com/figures) - A library with unicode symbols (Modified to make ESM only)
  - [ansi-colors](https://npmjs.com/ansi-colors) - A library to add ANSI colors to text and symbols in the terminal (CJS, sigh)