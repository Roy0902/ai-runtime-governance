# Manual WSL setup for the integration-feasibility milestone

Version: 0.1. Prepared: 2026-10-29.
Status: **Instructions only. The user chose manual setup; the assistant has not
installed or started a distribution.**

## What is already present

The [readiness report](./06-integration-feasibility.md) observed WSL 2.5.10.0,
default WSL version 2 and Windows VS Code 1.142.0. No Linux distribution was
registered for the current Windows user. No OpenCode command was found on the
Windows tool process's PATH. These checks do not prove client compatibility.

The instructions below use **Ubuntu 24.04 LTS** as the recommended first baseline.
This is not a request to install multiple distributions or migrate the project.
If you prefer another distribution, record its exact name/version before testing.

## 1. Install the distribution yourself

Open Windows Terminal with a **PowerShell** tab. Check whether a distro has been
installed since the readiness check:

```powershell
wsl --list --verbose
```

If Ubuntu-24.04 is already listed, skip installation. Never unregister, reset or
overwrite an existing distribution to make these steps match.

Otherwise run:

```powershell
wsl --install -d Ubuntu-24.04 --no-launch
```

This downloads and registers Ubuntu and uses local disk space. `--no-launch`
defers initial Linux account setup. The current WSL help output listed the
distribution and no-launch options; the installation itself has not been tested.

If Windows requests administrator permission or a restart, review and perform
that action yourself only when appropriate. If the command fails, keep the exact
error and stop rather than enabling Windows features or trying unrelated
installation commands blindly. Do not share passwords or credential values.

## 2. Initialize your Linux account privately

After installation, run in PowerShell:

```powershell
wsl -d Ubuntu-24.04
```

Complete the distribution's first-run prompts in your own terminal. Depending on
the image, it may ask for a Linux username and password. Password characters may
not appear while typing; that is normal. Do not enter the password in chat.

This Linux login is for operating the development environment. It is **not**
the governance application's public account or its authenticator enrollment.

When setup finishes and you reach a Linux shell, type:

```bash
exit
```

## 3. Verify WSL 2 and successful Linux execution

Back in PowerShell:

```powershell
wsl --list --verbose
wsl -d Ubuntu-24.04 -- uname -r
```

Expected:

- Ubuntu-24.04 appears with **VERSION 2**.
- `uname -r` returns a Linux kernel release without an initialization/boot error.

Do not treat a successful download alone as successful initialization. If the
distro shows version 1 or boot fails, retain the output and resolve that specific
problem before client setup. Do not automatically convert or replace it.

## 4. Connect Windows VS Code to the distro

Keep the existing Windows VS Code installation. Do not install another Linux
desktop copy of VS Code.

1. In Windows VS Code, open Extensions and install Microsoft's **WSL** extension
   (`ms-vscode-remote.remote-wsl`) if it is not already available in your profile.
   This is a separate user-performed installation, not something the assistant
   has done.
2. Open the Command Palette and choose **WSL: Connect to WSL using Distro**.
3. Select **Ubuntu-24.04**.
4. Allow the documented VS Code Server setup in that distro. This downloads
   remote components; it does not demonstrate Copilot/client compatibility.
5. Confirm the lower-left remote indicator identifies the selected WSL distro.

Keep the existing repository where it is for now. Do not move/copy it or reopen
an active agent conversation as part of this setup. We will use a disposable
synthetic project for probes and separately verify each extension/runtime's
actual execution location.

## 5. Stop at this checkpoint

For the next step, provide only:

- Whether distro installation and first-run initialization completed.
- The output of `wsl --list --verbose` and the kernel check.
- Whether a VS Code window connects to Ubuntu-24.04.
- Any relevant failure text, with secrets removed.

Do **not** configure custom model endpoints, change normal Copilot routing,
install OpenCode/plugins, paste provider keys or start a publicly reachable probe
server yet. Those steps need the version-pinned client and consented synthetic
test setup in the [feasibility report](./06-integration-feasibility.md).

## References and limits

- [Microsoft: Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install)
  documents distribution selection and installation prerequisites.
- [VS Code: Developing in WSL](https://code.visualstudio.com/docs/remote/wsl)
  documents Windows-side VS Code, the WSL extension, remote server setup and
  the connect-to-distro command.

The current local `wsl --help` printed the relevant flags but exited with -1;
this is retained as a diagnostic, not presented as a successful installation test.
No Windows feature change, elevation, reboot, distro setup or live client test
was performed by the assistant.
