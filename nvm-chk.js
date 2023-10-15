const childProcess = require('child_process');
const fs = require('fs');
const readline = require('readline');
const execSync = childProcess.execSync;

// Read .nvmrc file
const nvmrcPath = '.nvmrc'; // Replace with your .nvmrc file path

const main = () => {
  try {
    // Read the content of the .nvmrc file
    const nvmrcVersion = fs.readFileSync(nvmrcPath, 'utf-8').trim();

    // Get the current version of Node.js installed on the system
    const currentVersion = execSync('nvm current', { encoding: 'utf-8' }).trim();

    if (currentVersion !== nvmrcVersion) {
      console.log('Current Node.js version:', currentVersion);
      console.log('Trying to use .nvmrc file version:', nvmrcVersion);

      try {
        nvmUseVersion(nvmrcVersion);
      } catch (err) {
        console.error('Error using Node.js version from .nvmrc:', err);
        console.log(`Please manually run 'nvm use ${nvmrcVersion}' to switch to the desired version.`);
        process.exit(1);
      }
    } else {
      console.log('Node.js versions match:', currentVersion);
    }
  } catch (err) {
    console.error('Error reading .nvmrc file:', err);
    process.exit(1);
  }
};

const requestToInstallNewVersion = (nvmrcVersion) => {
  // Prompt the user for installation confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Do you want to install this version? (y/n): ', (answer) => {
    rl.close();
    if (answer.toLowerCase() === 'y') {
      try {
        // Install the desired version using `nvm install`
        const installOutput = execSync(`nvm install ${nvmrcVersion}`, { encoding: 'utf-8' }).trim();
        console.log(installOutput);
        nvmUseVersion(nvmrcVersion);
      } catch (err) {
        console.error(`Error installing Node.js: nvm install ${nvmrcVersion}`, err);
        process.exit(1);
      }
    }
  });
};

const checkVersionAfterUpdate = (nvmrcVersion) => {
  const updatedVersion = execSync('nvm current', { encoding: 'utf-8' }).trim();
  if (updatedVersion !== nvmrcVersion) {
    console.log('Node.js version did not switch successfully. Please run the nvm use command manually.');
    process.exit(1);
  } else {
    console.log('Updated Node.js version:', updatedVersion);
    process.exit(1);
  }
};

const nvmUseVersion = (nvmrcVersion) => {
  // Attempt to switch to the desired Node.js version using `nvm use`
  const useOutput = execSync(`nvm use ${nvmrcVersion}`, { encoding: 'utf-8' }).trim();

  if (useOutput.includes('is not installed.')) {
    // If the desired version is not installed, check available versions
    const versions = execSync('nvm ls', { encoding: 'utf-8' });

    if (!versions.includes(nvmrcVersion)) {
      console.log(`Node.js version ${nvmrcVersion} is not installed.`);

      requestToInstallNewVersion(nvmrcVersion);
    }
  } else {
    checkVersionAfterUpdate(nvmrcVersion);
  }
};

main();
