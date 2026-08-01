const { execSync } = require('child_process');
const { name, version } = require('./package.json');

function log(...args) {
  console.log('[embedded-sdk-release]', ...args);
}

function logError(...args) {
  console.error('[embedded-sdk-release]', ...args);
}

(async () => {
  log(`checking if ${name}@${version} needs releasing`);

  const packageUrl = `https://registry.npmjs.org/${name}/${version}`;
  // npm commands output a bunch of garbage in the edge cases,
  // and require sending semi-validated strings to the command line,
  // so let's just use good old http.
  const { status } = await fetch(packageUrl);

  if (status === 200) {
    log('version already exists on npm, exiting');
  } else if (status === 404) {
    log('release required, building');
    try {
      execSync('npm run build', { stdio: 'pipe' });
      log('build successful, publishing')
      execSync('npm publish --access public', { stdio: 'pipe' });
      log(`published ${version} to npm`);
    } catch (err) {
      console.error(String(err.stdout));
      logError('Encountered an error, details should be above');
      process.exitCode = 1;
    }
  } else {
    logError(`ERROR: Received unexpected http status code ${status} from GET ${packageUrl}
The embedded sdk release script might need to be fixed, or maybe you just need to try again later.`);
    process.exitCode = 1;
  }
})();
