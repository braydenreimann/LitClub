## LitClub Repository Setup Guide

## 1. Configure a secure SSH key so your computer can authenticate with GitHub without a password
### 1. Open a terminal

You can use **PowerShell** or **Git Bash** (comes with Git for
Windows).\
For consistency, these instructions use PowerShell.

------------------------------------------------------------------------

### 2. Generate a new SSH key

Run this command (replace your GitHub email with yours):

``` powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

If your system doesn't support `ed25519`, use `rsa` instead:

``` powershell
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

When prompted: - **Save location:** Press **Enter** to accept default
(`C:\Users\<YourUser>\.ssh\id_ed25519`).
- **Passphrase:** Optional. Adds extra security, but you'll need to
enter it whenever you use the key (or cache it with an agent).

------------------------------------------------------------------------

### 3. Start the SSH agent

Run the following in PowerShell:

``` powershell
Start-Service ssh-agent
ssh-add ~\.ssh\id_ed25519
```

> If you see an error, you may need to run PowerShell as Administrator.

------------------------------------------------------------------------

### 4. Copy your public key

Your public key is stored at:

    C:\Users\<YourUser>\.ssh\id_ed25519.pub

Copy it to the clipboard with:

``` powershell
Get-Content ~\.ssh\id_ed25519.pub | Set-Clipboard
```

------------------------------------------------------------------------

### 5. Add the key to GitHub

1.  Go to [GitHub SSH settings](https://github.com/settings/keys).
2.  Click **New SSH key** → give it a title (e.g., *My Laptop*).
3.  Paste your key from the clipboard.
4.  Save.

------------------------------------------------------------------------

### 6. Test the connection

Run this command:

``` powershell
ssh -T git@github.com
```

If successful, you'll see:

    Hi <username>! You've successfully authenticated, but GitHub does not provide shell access.

------------------------------------------------------------------------

✅ Done! You can now use `git clone`, `git push`, etc., with SSH URLs
(they look like `git@github.com:user/repo.git`).

------------------------------------------------------------------------

## 2. Install required dependencies
### 1. Download Noad.js
Navigate to [nodejs.org/en/download](nodejs.org/en/download), and select the following attributes in the drop down menus:
- **v22.19.0 (LTS)**, for
- **Windows**, using
- **Chocolatey**, with
- **Yarn**

Do not execute the commands until you complete the following step.

### 2. Modify your execution policy
Run the following script in Powershell to allow local scripts for your user.
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```
Once completed, close Powershell and then run again with **Admin privileges**.

### 3. Run the commands to install Node.js
Refer to the commands generated in the first step.

### 4. Install Git for Windows (if not already installed)
Navigate to [https://git-scm.com/downloads/win](https://git-scm.com/downloads/win) and click the download link at the very top of the page (the most recent and maintained build).

### 5. Install the Expo Go app on your phone
We will use this app to test our React Native app during the development process!

## 3. Clone the LitClub repository

Navigate to the directory where you would like to place the LitClub repository, then clone it using SSH:
```powershell
git clone git@github.com:{username}/LitClub.git
```
Don't forget to replace `{username}` with your GitHub username.
