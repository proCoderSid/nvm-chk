const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');
const https = require('https');

// Minimum supported Node.js version
const MIN_SUPPORTED_VERSION = '16.10.0';
const NVMRC_PATH = '.nvmrc';

// ANSI Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  darkRed: '\x1b[31m' // using red for aborted/error messages
};

// ------------------------
// Helper Functions
// ------------------------

// Prompt the user with a question and return the input as a Promise.
function promptUser(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Remove any leading 'v' from a version string.
function parseVersion(version) {
  return version.replace(/^v/, '').trim();
}

// Compare two semantic version strings.
// Returns -1 if v1 < v2, 0 if equal, and 1 if v1 > v2.
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

// ------------------------
// .nvmrc Handling
// ------------------------

// Ensure .nvmrc exists and is not empty. If missing, ask user if they want to create one.
async function ensureNvmrc() {
  if (!fs.existsSync(NVMRC_PATH)) {
    console.log(`${COLORS.red}.nvmrc file not found.${COLORS.reset}`);

    const answer = await promptUser(`${COLORS.yellow}Do you want to create one? (y/n): ${COLORS.reset}`);
    if (answer.toLowerCase() === 'y') {
      const version = await promptUser(`${COLORS.yellow}Enter Node.js version to use (e.g., ${MIN_SUPPORTED_VERSION}): ${COLORS.reset}`);
      if (!version) {
        console.log(`${COLORS.darkRed}Aborted: You must provide a Node.js version. Exiting.${COLORS.reset}`);
        process.exit(1);
      }
      fs.writeFileSync(NVMRC_PATH, version.trim());
      console.log(`${COLORS.green}.nvmrc file created with version ${version}.${COLORS.reset}`);
    } else {
      console.log(`${COLORS.darkRed}Aborted: You must have a .nvmrc file. Exiting.${COLORS.reset}`);
      process.exit(1);
    }
  } else {
    // If the file exists but is empty, prompt the user to add a version.
    const content = fs.readFileSync(NVMRC_PATH, 'utf-8').trim();
    if (!content) {
      const version = await promptUser(`${COLORS.yellow}.nvmrc is empty. Please enter a Node.js version (e.g., ${MIN_SUPPORTED_VERSION}): ${COLORS.reset}`);
      if (!version) {
        console.log(`${COLORS.darkRed}Aborted: No version provided. Exiting.${COLORS.reset}`);
        process.exit(1);
      }
      fs.writeFileSync(NVMRC_PATH, version.trim());
      console.log(`${COLORS.green}.nvmrc file updated with version ${version}.${COLORS.reset}`);
    }
  }
}

// ------------------------
// nvm Availability
// ------------------------

// Check if nvm is available by trying to run 'nvm --version'.
async function ensureNvmAvailable() {
  try {
    const nvmVersion = execSync('nvm --version', { encoding: 'utf-8' });
    console.log(`${COLORS.reset}Nvm Version: ${nvmVersion.trim()}${COLORS.reset}`);
  } catch (error) {
    console.log(`${COLORS.red}nvm is not available on this system.${COLORS.reset}`);
    // Determine the user's OS and provide relevant installation links.
    let platform = process.platform;
    if (platform === 'win32') {
      console.log(`${COLORS.reset}For Windows, please install nvm from: https://github.com/coreybutler/nvm-windows/releases${COLORS.reset}`);
    } else if (platform === 'linux') {
      console.log(`${COLORS.reset}For Linux, please install nvm from: https://github.com/nvm-sh/nvm${COLORS.reset}`);
    } else if (platform === 'darwin') {
      console.log(`${COLORS.reset}For macOS, you can install nvm via Homebrew: brew install nvm${COLORS.reset}`);
    } else {
      console.log(`${COLORS.reset}Please search for nvm installation instructions for your OS.${COLORS.reset}`);
    }
    // Ask the user if they want to attempt an automatic install
    const answer = await promptUser(`${COLORS.yellow}Do you want to attempt to install nvm automatically? (y/n): ${COLORS.reset}`);
    if (answer.toLowerCase() === 'y') {
      console.log(``);
      try {
        if (platform === 'win32') {
          console.log(`${COLORS.cyan}Installing nvm-windows...${COLORS.reset}`);
          // Download the nvm-windows setup executable (v1.1.11 used as an example)
          execSync('curl -L -o nvm-setup.exe "https://github.com/coreybutler/nvm-windows/releases/download/1.1.11/nvm-setup.exe"', { stdio: 'inherit' });
          // Run the installer silently using the /S switch
          execSync('nvm-setup.exe /S', { stdio: 'inherit' });
          console.log(`${COLORS.green}nvm-windows installed successfully. Please restart your terminal and rerun the script.${COLORS.reset}`);
          process.exit(0);
        } else if (platform === 'linux' || platform === 'darwin') {
          console.log('Installing nvm...');
          // Install nvm using the official installation script
          execSync('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash', { stdio: 'inherit' });
          // Source the nvm script to add it to the current session
          execSync('export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"', { stdio: 'inherit', shell: '/bin/bash' });
          console.log('nvm installed successfully.');
        } else {
          console.log(`${COLORS.cyan}Installing nvm (nvm-sh)...${COLORS.reset}`);
          // For non-Windows systems, use the standard nvm installation script
          execSync('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash', { stdio: 'inherit' });
          console.log(`${COLORS.green}nvm installed. Please restart your terminal and rerun the script.${COLORS.reset}`);
          process.exit(0);
        }
      } catch (installError) {
        console.log(`${COLORS.darkRed}Aborted: Error installing nvm: ${installError.message}${COLORS.reset}`);
        process.exit(1);
      }
    } else {
      console.log(`${COLORS.red}nvm is required. Exiting.${COLORS.reset}`);
      process.exit(1);
    }
  }
}

// ------------------------
// Node.js Version Handling
// ------------------------

// Get the current Node.js version using 'nvm current'.
function getCurrentNodeVersion() {
  try {
    const version = execSync('nvm current', { encoding: 'utf-8' }).trim();
    return parseVersion(version);
  } catch (error) {
    console.log(`${COLORS.red}Error fetching current Node.js version using nvm.${COLORS.reset}`);
    return null;
  }
}

// Attempt to switch to the specified Node.js version using 'nvm use'.
function useNodeVersion(version) {
  try {
    console.log(``);
    console.log(`${COLORS.cyan}Attempting to switch to Node.js version ${version}...${COLORS.reset}`);
    execSync(`nvm use ${version}`, { stdio: 'inherit' });
    console.log(`${COLORS.green}Switched to Node.js version ${version}.${COLORS.reset}`);
  } catch (error) {
    console.log(`${COLORS.red}Error switching to Node.js version ${version}.${COLORS.reset}`);
    execSync(`nvm ls`, { stdio: 'inherit' });
    promptInstallNodeVersion(version);
  }
}

// Install the specified Node.js version using 'nvm install' then switch to it.
function installNodeVersion(version) {
  try {
    console.log(``);
    console.log(`${COLORS.cyan}Installing Node.js version ${version}...${COLORS.reset}`);
    execSync(`nvm install ${version}`, { stdio: 'inherit' });
    useNodeVersion(version);
  } catch (error) {
    console.log(`${COLORS.red}Error installing Node.js version ${version}.${COLORS.reset}`);
    // If installation fails, suggest available versions.
    suggestAvailableNodeVersions(version);
  }
}

// Prompt the user to install the desired Node.js version if not already installed.
async function promptInstallNodeVersion(version) {
  const answer = await promptUser(`${COLORS.yellow}Node.js version ${version} is not installed. Do you want to install it? (y/n): ${COLORS.reset}`);
  if (answer.toLowerCase() === 'y') {
    installNodeVersion(version);
  } else {
    console.log(`${COLORS.darkRed}Installation aborted. Exiting.${COLORS.reset}`);
    process.exit(1);
  }
}

// ------------------------
// Suggest Available Versions
// ------------------------

// Fetch available Node.js versions from the official release JSON and display those greater than or equal to MIN_SUPPORTED_VERSION.
function suggestAvailableNodeVersions(nvmrcVersion) {
  const url = 'https://nodejs.org/download/release/index.json';
  const targetVersion = parseVersion(nvmrcVersion);
  const targetMajorVersion = targetVersion.split('.')[0];

  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', async () => {
      try {
        const releases = JSON.parse(data);

        // Parse and sort releases
        const parsedReleases = releases.map(release => ({
          version: parseVersion(release.version),
          versionString: release.version,
          date: release.date,
          lts: release.lts
        })).sort((a, b) => compareVersions(b.version, a.version));

        // Determine the latest available version and its LTS status
        const latestVersion = parsedReleases[0];

        // Determine the latest LTS version if the latest version is not LTS
        const latestLTSVersion = latestVersion.lts ? latestVersion : parsedReleases.find(release => release.lts);

        // Filter out versions >= targetVersion
        const olderReleases = parsedReleases.filter(release => compareVersions(release.version, targetVersion) < 0);
        const newerReleases = parsedReleases.filter(release => compareVersions(release.version, targetVersion) > 0);

        // Get the three nearest LTS versions below the target version
        let nearestLTSVersions = olderReleases.filter(release => release.lts).slice(0, 3);
        let nearestLTSNewVersions = newerReleases.reverse().filter(release => release.lts).slice(0, 3);

        // If fewer than 3 LTS versions below, include higher versions
        if (nearestLTSVersions.length < 3) {
          const higherLTSVersions = parsedReleases.filter(release => release.lts && compareVersions(release.version, targetVersion) >= 0);
          nearestLTSVersions = nearestLTSVersions.concat(higherLTSVersions.slice(0, 3 - nearestLTSVersions.length));
        }

        // Check if the target major version is an LTS
        const isTargetMajorLTS = parsedReleases.some(release => release.lts && release.version.startsWith(`${targetMajorVersion}.`));

        // Get the three nearest non-LTS versions if the target major version is not LTS
        const nearestNonLTSVersions = isTargetMajorLTS ? [] : olderReleases.filter(release => !release.lts).slice(0, 3);
        const nearestNonLTSNewVersions = isTargetMajorLTS ? [] : newerReleases.reverse().filter(release => !release.lts).slice(0, 3);

        // Display the results
        console.log(`Latest Version:`);
        console.log(`- ${latestVersion.versionString} (LTS: ${latestVersion.lts || 'No'})`);

        if (!latestVersion.lts) {
          console.log(`\nLatest LTS Version:`);
          console.log(`- ${latestLTSVersion.versionString} (LTS: ${latestLTSVersion.lts})`);
        }

        console.log(`\nThree nearest LTS versions around ${nvmrcVersion}:`);
        nearestLTSNewVersions.forEach(release => {
          console.log(`- ${release.versionString} (LTS: ${release.lts})`);
        });
        nearestLTSVersions.forEach(release => {
          console.log(`- ${release.versionString} (LTS: ${release.lts})`);
        });

        if (!isTargetMajorLTS) {
          console.log(`\nThree nearest non-LTS versions below ${nvmrcVersion}:`);
          nearestNonLTSNewVersions.forEach(release => {
            console.log(`- ${release.versionString}`);
          });
          nearestNonLTSVersions.forEach(release => {
            console.log(`- ${release.versionString}`);
          });
        }

        // Prompt the user to install one of the suggested versions
        const answer = await promptUser(`${COLORS.yellow}Do you want to install one of these versions? (y/n): ${COLORS.reset}`);
        if (answer.toLowerCase() === 'y') {
          const version = await promptUser(`${COLORS.yellow}Enter Node.js version to use (e.g., ${MIN_SUPPORTED_VERSION}): ${COLORS.reset}`);
          if (!version) {
            console.log(`${COLORS.darkRed}Aborted: You must provide a Node.js version. Exiting.${COLORS.reset}`);
            process.exit(1);
          }
          fs.writeFileSync(NVMRC_PATH, version.trim());
          console.log(`${COLORS.green}.nvmrc file updated with version ${version}.${COLORS.reset}`);
          installNodeVersion(version);
        } else {
          console.log(`${COLORS.darkRed}Aborted: Installation aborted. Exiting.${COLORS.reset}`);
          process.exit(1);
        }
      } catch (parseError) {
        console.error(`Error parsing releases data: ${parseError.message}`);
      }
    });
  }).on('error', (err) => {
    console.error(`Error fetching Node.js releases: ${err.message}`);
  });
}

// ------------------------
// Main Orchestration
// ------------------------

async function main() {
  // Ensure .nvmrc exists and has content.
  await ensureNvmrc();

  // Read desired Node.js version from .nvmrc and parse it.
  const nvmrcContent = fs.readFileSync(NVMRC_PATH, 'utf-8').trim();
  const nvmrcVersion = parseVersion(nvmrcContent);
  if (!nvmrcVersion) {
    console.log(`${COLORS.red}.nvmrc file is empty. Please add a Node.js version. Exiting.${COLORS.reset}`);
    process.exit(1);
  }

  // Ensure nvm is installed and available.
  await ensureNvmAvailable();

  // Get current Node.js version.
  const currentVersion = getCurrentNodeVersion();

  // Compare current version with the version from .nvmrc.
  if (currentVersion === nvmrcVersion) {
    console.log(`${COLORS.green}Current Node.js version (${currentVersion}) matches the .nvmrc version.${COLORS.reset}`);
  } else {
    console.log(`${COLORS.red}Current Node.js version (${currentVersion || 'none'}) does not match the .nvmrc version (${nvmrcVersion}).${COLORS.reset}`);
    // Attempt to switch to the desired version.
    try {
      useNodeVersion(nvmrcVersion);
    } catch (error) {
      // If switching fails, prompt the user to install the desired version.
      await promptInstallNodeVersion(nvmrcVersion);
    }
  }
}

// Run the main function
main();
