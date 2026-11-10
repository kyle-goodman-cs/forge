"""Required first-lab Git/GitHub workspace guide, authored independently of solutions."""

WORKSPACE = dict(
    title="Set up your GitHub learning workspace",
    intro="Required before your first independent lab. This is a separate setup session: create one private repository for your own practice, then keep one chapter folder inside it. Reading and browser practice can begin before this setup.",
    sections=[
        dict(key="tools", title="Install Git and VS Code; open your GitHub account",
             text="Git records versions of files on your computer. GitHub keeps a remote copy online. A commit is a local save point; a push sends commits to GitHub. You will use both from your first lab.\n\nInstall VS Code and Git if needed. On Windows use the Git for Windows installer and keep Git Credential Manager selected. On macOS/Linux follow Git's instructions for your platform. Close and reopen VS Code after installing Git.\n\nSign in to your GitHub account in a browser, or create an account. You will use that same account when Git asks you to sign in. In VS Code, choose Terminal → New Terminal, type the command below, and press Enter.",
             command="git --version", after="Success: the terminal prints a Git version number. If git is not recognized, finish installing it and reopen VS Code. Nothing on this page asks you to paste a password or token into Forge.",
             links=[dict(label="Install Git", url="https://git-scm.com/downloads"), dict(label="Install VS Code", url="https://code.visualstudio.com/download"), dict(label="Open GitHub", url="https://github.com/")],
             confirm="Git prints its version, VS Code opens, and I can sign in to GitHub."),
        dict(key="folder", title="Create and open a separate Forge Work folder",
             text="In your file manager, open Documents (or another place you can find). Create a folder named Forge Work. In VS Code, choose File → Open Folder and open that folder. Open a new terminal after opening the folder.\n\nThis folder holds your own learning work. Use a separate folder from the Forge application you launch or download. The files you write belong in Forge Work, with a week-01 folder for chapter 1, week-02 for chapter 2, and so on. Each chapter gets its own .venv later.\n\nIf you already started a lab, move its folder inside Forge Work using the file manager before creating its environment. Keep your existing files. Never create a second Git repository inside a chapter folder.",
             windows="Get-Location\nGet-ChildItem", mac="pwd\nls", linux="pwd\nls",
             after="Success: the terminal location ends in Forge Work. Git setup commands in this guide run from that parent folder. Lab Python commands later run from inside a chapter folder. The guide will tell you when to switch.",
             confirm="VS Code and its terminal are open in my separate Forge Work folder."),
        dict(key="initialized", title="Start Git and set your commit identity",
             text="From the Forge Work terminal, run git init -b main. It creates Git's history folder and names the initial branch main. A branch is a named line of work; main is enough to begin.\n\nThen set the name and email recorded on your commits. Replace Your Name with your preferred author name. In GitHub, open your profile menu → Settings → Emails. Copy your GitHub-provided noreply email if you want to keep your email private; otherwise use an email verified on your GitHub account. Replace YOUR_EMAIL before running the command. Keep the quotes.\n\nThese settings apply to this repository. Your Git author name is a label, not a login, and need not match your GitHub username.",
             command='git init -b main\ngit config user.name "Your Name"\ngit config user.email "YOUR_EMAIL"\ngit rev-parse --show-toplevel\ngit config user.name\ngit config user.email',
             after="Success: the repository root ends in Forge Work, and the last two commands show the identity you intended. If the root points elsewhere, return to step 2 before adding files. If the folder already has Git history, inspect git status and keep that history; you do not need to initialize it again.",
             confirm="Git's root is Forge Work, and my commit name and email are set."),
        dict(key="firstCommit", title="Ignore generated files and make your first commit",
             text="In VS Code's Explorer, select New File and create .gitignore directly inside Forge Work. The leading dot matters. Paste the ignore rules below into that file and save. These rules keep chapter environments, caches, local databases, and credentials out of Git. A .gitignore affects untracked files; it does not remove files already committed.\n\nCreate a second file named README.md at the same level. Write a title such as # Forge Work and one sentence explaining that this is your programming practice. Save it. Your chapter folders will sit beside these two files.\n\nRun the terminal commands below in Forge Work. git add chooses the two files to include. git diff --staged lets you inspect exactly what the commit will save. After checking the diff, run the commit command.",
             fileLabel="In Forge Work/.gitignore:", fileCode=".venv/\n__pycache__/\n.pytest_cache/\n.env\n.env.*\n*.db\n*.sqlite\n*.sqlite3\n.DS_Store",
             command='git status\ngit add .gitignore README.md\ngit diff --staged\ngit commit -m "Start my Forge learning workspace"\ngit log --oneline -1',
             after="Success: the log shows a short commit ID followed by your message. If a long diff opens in a pager, press q to return to the terminal. Author identity unknown means step 3 still needs your real values. An initial README commit does not require your unfinished lab tests to pass.",
             confirm="My first commit contains the root README and .gitignore."),
        dict(key="created", title="Create an empty private repository on GitHub",
             text="Open GitHub's new-repository page using the link below. Choose your own account as Owner, enter forge-work as the name, and choose Private. Leave Add a README, .gitignore, and license initialization off: you already created your first files locally. Select Create repository.\n\nIf you already have a repository for your learning folder, use it and preserve its history. The Forge app's source repositories are separate from this learning repository.\n\nOn the new repository page, select HTTPS in Quick setup and copy the URL. Paste that repository address into Forge below. A normal browser address ending in your repository name also works; Forge will show the HTTPS Git URL in the next step.",
             repoField=True, links=[dict(label="Create your repository on GitHub", url="https://github.com/new")],
             after="Success: the repository page says Private and is empty, ready for your existing local commit. If it contains files you initialized on GitHub, keep them and use the troubleshooting guide before pushing.",
             confirm="I created or identified my private learning repository and pasted its URL."),
        dict(key="linked", title="Connect your folder to that repository",
             text="Return to the terminal in Forge Work. The command below uses the repository address you recorded. origin is the local nickname for the GitHub destination; adding it connects the folder but does not upload files.\n\nRun git remote -v afterward and compare the destination with your learning repository in your browser. You should see the same owner and repository name on the fetch and push lines.",
             remoteCommand=True,
             after="Success: origin points to your private learning repository. If remote origin already exists, inspect it rather than adding another. If it is already correct, keep it. If it is wrong, use the troubleshooting instructions to update the address.",
             confirm="git remote -v shows my learning repository as origin."),
        dict(key="pushed", title="Sign in and push your first commit",
             text="Run git push -u origin main from Forge Work. -u connects your local main branch to origin/main, so later you can use git push.\n\nOn Windows, Git Credential Manager can open a browser sign-in. Use your GitHub account and authorize the login. If no browser opens and authentication fails, run the Windows sign-in command below, then retry the push.\n\nOn macOS/Linux, the commands below use GitHub CLI for browser sign-in. Install it from the official link if gh is unavailable. Complete its browser authorization, then let gh configure Git authentication. Do not use your GitHub account password as a Git HTTPS password.",
             windows="git push -u origin main\n\n# If authentication fails, sign in and retry:\ngit credential-manager github login --browser\ngit push -u origin main",
             mac="gh auth login --hostname github.com --git-protocol https --web\ngh auth setup-git\ngit push -u origin main",
             linux="gh auth login --hostname github.com --git-protocol https --web\ngh auth setup-git\ngit push -u origin main",
             links=[dict(label="Install GitHub CLI (macOS/Linux sign-in)", url="https://cli.github.com/")],
             after="Success: the push completes and main tracks origin/main. If a sign-in was already saved on this computer, no new login window may be needed. A rejected push is not a completed backup; use the help below and keep your local files.",
             confirm="My first push to origin/main completed successfully."),
        dict(key="verified", title="Verify the copy on GitHub, then start your lab",
             text="Refresh your repository page on GitHub. Open README.md and .gitignore to check they match your local files. Open the commit history and compare the latest commit with the result of git log --oneline -1.\n\nRun git status -sb in Forge Work. After your push it should show main...origin/main without ahead or behind counts; after the first two files are committed, there should be no uncommitted changes unless you already have a chapter folder waiting to add.\n\nYour required workspace setup is now recorded when the URL and all eight confirmations are complete. Forge saves your confirmations; it cannot inspect your private repository. Continue to the chapter's Python/lab setup, then push each finished lab using the routine on its brief.",
             command="git status -sb\ngit log --oneline -1",
             confirm="I opened the repository on GitHub and verified the first commit and both files."),
    ],
    problems=[
        dict(title="git or gh is not recognized", text="Install the named tool using its official link and close and reopen VS Code. Git for Windows normally includes Git Credential Manager; macOS/Linux instructions use GitHub CLI for browser authentication. Check git --version or gh --version after reopening."),
        dict(title="Author identity unknown", text="Return to step 3. Run the name and email commands in Forge Work with your own values replacing the examples. Then retry the commit. These settings identify commits; they do not sign you in."),
        dict(title="remote origin already exists", text="Run git remote -v. If it already shows the right learning repository, keep it and continue. To correct a wrong destination, use the exact command shown after entering your valid repository URL below. Changing origin changes the destination, not your files or local history.", updateRemote=True),
        dict(title="Repository not found or permission denied", text="Open the repository address in your browser while signed in. Check the owner and name, and confirm your account can access it. Then repeat the sign-in in step 7 and retry the push. A private repository may look missing to an account without access."),
        dict(title="Push rejected: remote contains work you do not have", text="Keep your local files. Do not force-push or delete either history. If you accidentally initialized files on GitHub, use a new, empty private learning repository and update origin to its URL, or ask for help combining the histories. If it is an established shared repository, fetch and review its changes with help before merging."),
        dict(title="Not a git repository, or the root points to the Forge app", text="Open your separate Forge Work folder in VS Code and open a new terminal there. Run git rev-parse --show-toplevel. Its output should end in Forge Work. Do not run Git setup inside a chapter folder or the Forge application folder."),
    ],
    sources=[dict(label="GitHub: add local code to a repository", url="https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github"), dict(label="GitHub: manage remotes", url="https://docs.github.com/en/get-started/git-basics/managing-remote-repositories"), dict(label="GitHub CLI: browser sign-in", url="https://cli.github.com/manual/gh_auth_login")],
)


def lab_git_readme(week):
    folder = f"week-{week:02}"
    return f'''

## Required GitHub workflow

Before completing your first lab, follow Forge's required GitHub workspace guide from the lab brief. Create one private learning repository, record your setup checklist and repository URL, and keep each chapter folder inside Forge Work. This is separate from the Forge app's source repository.

After the program and tests meet the lab criteria, save all files. From inside {folder}, run these commands one at a time. The first moves to Forge Work; the final returns to the chapter folder:

```text
cd ..
git status
git diff -- {folder}
git add {folder}
git diff --staged
git commit -m "Finish chapter {week} lab"
git push
git status -sb
git rev-parse HEAD
cd {folder}
```

Inspect the staged files before committing. A .gitignore does not remove files already tracked. Keep environments, caches, credentials, and unrelated files out of the commit. Use a message describing your actual change. If nothing changed since your previous commit, there may be nothing new to commit; still push any pending commits and verify GitHub's copy.

Refresh your private repository on GitHub and check the latest chapter files and commit. In Forge's lab brief, paste the full commit ID from git rev-parse HEAD and confirm the push. A local commit alone is not a GitHub backup. GitHub setup and pushed-lab evidence are required for new lab completion; Forge records your confirmations rather than independently checking the private repository.
'''
