# Automatic Node.js Version Checker Script

This JavaScript script automates the process of checking and managing Node.js versions based on specific conditions:

1. **Check Current Node.js Version:**
   - The script begins by checking the currently installed Node.js version on your system.

2. **Comparison with Required Version from `.nvmrc` File:**
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
        "prestart": "node nvm-chk.js",
        "start": "Your start command"
    }
}
```

I have tested this script in node v4.9.11 to latest,
It works fine and if not working in any specific version then let me know I will update the script

Prerequisites as follow
- Must have nvm installed on your machine
- Current in use version of node need to be grater then v4.9.11
