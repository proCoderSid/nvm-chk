# Automatic Node.js Version Checker Script

This JavaScript script automates the process of checking and managing Node.js versions based on specific conditions:

1. **Check NVM is available or not**
   - The script begins by checking the currently NVM on your system.
   
2. **Comparison Current version with Required Version from `.nvmrc` File:**
   - If the currently installed Node.js version matches the required version, the script logs a success message and terminates.

3. **Using Node Version from `.nvmrc` File:**
   - If the installed Node.js version doesn't match the required version, the script looks for a Node.js version specified in a `.nvmrc` file in your project directory.
   - If an `.nvmrc` file is found and contains a valid Node.js version, the script switches to and uses that version.

4. **Installing Missing Node.js Version:**
   - If there's no `.nvmrc` file or the specified version is not installed, the script prompts the user with a confirmation message.
   - If the user chooses to install the required version, the script proceeds to install it using a `nvm install version`command
   - After installation, the script switche and uses the newly installed version.

5. **Terminating the Script:**
   - If the user chooses not to install the required version, the script gracefully terminates.

This script provides an automated and user-friendly way to ensure that your Node.js environment is set to the required version for your project.

## Usage
the script is available  at [https://github.com/proCoderSid/nvm-chk.git](https://github.com/proCoderSid/nvm-chk.git)

You can use this file in `package.json` file as follow or as you feel comfortable to use

```
{
    "scripts": {
        "nvm-chk": "node nvm-chk.js"
        "prepare: "npm run nvm-chk",
        "prestart": "npm run nvm-chk",
        "start": "Your start command",
        "anyOther": "npm run nvm-chk && Your Command"
    }
}
```


# I have tested this script in node v16.10.0 to latest

[![](https://visitcount.itsvg.in/api?id=proCoderSid&icon=0&color=6)](https://visitcount.itsvg.in)

  ## 💰 You can help me by Donating
  [![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/https://www.buymeacoffee.com/procodersid) [![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://patreon.com/https://www.patreon.com/proCoderSid) 