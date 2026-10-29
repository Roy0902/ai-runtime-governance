# Integration feasibility: readiness and evidence

Version: 0.2. Recorded: 2026-10-29.
Status: **WSL-specific live testing deferred while client-independent preparation
continues (DR-011). The user declined assistant installation. Neither client is
verified as guarded or monitoring-only.**

## 1. Scope and authority

The user authorized proceeding with the bounded integration-feasibility milestone.
This does not waive the [requirements](../../REQUIREMENTS.md#development-readiness-and-feasibility-milestone),
approve an inbound provider contract, install a Linux distribution, change client
settings or demonstrate production support.

The confirmed target remains Windows with WSL, not a substitution with Windows-
local testing. Evaluate OpenCode and VS Code Copilot; at least one demonstrated
guarded client/version/environment is required for release. See the
[confirmation record](./05-decision-record.md).

This report separates:

- **Observed:** a command actually ran and returned the recorded result.
- **Documented only:** a current official source describes a capability; not a
  passing test of the installed client/version/environment.
- **Not tested / blocked:** no executable evidence yet. Neither means unsupported.
- **Unsupported:** requires an applicable documented limitation or reproduced
  failure; do not infer it from missing setup.

## 2. Observed environment

All commands below were read-only with respect to Windows/client configuration.
No distribution, extension or application dependency was installed. No provider
key, client credential file, prompt body or private repository content was read
or sent to an external model.

| Probe | Observed result | Interpretation / limitation |
|---|---|---|
| `wsl --version` | Exit 0; WSL 2.5.10.0, kernel 6.6.87.2-1, WSLg 1.0.66; Windows 10.0.26200.9457 | WSL software is installed. This is not a successful Linux boot or client-connectivity test. |
| `wsl --status` | Exit 0; default WSL version 2 | Default version observed; virtualization/boot readiness is not fully proven. |
| `wsl --list --verbose` | Exit -1; no installed distributions for the current Windows user | Linux-side integration tests cannot start. No distribution was started or initialized. |
| `wsl --list --online` | Exit 0; available catalog includes Ubuntu-24.04 and Ubuntu-26.04 | Installation choices exist; listing does not install or approve one. |
| `code --version` | Exit 0; VS Code 1.142.0, commit `6d62b1d5dace93a33b3a6d3eca1317bd5e15bcb1`, x64 | Version pinned for discovery, not compatibility certification. CLI also emitted a Crashpad registration/file-not-found diagnostic; this was not hidden or repaired. |
| `code --list-extensions --show-versions`, filtered to relevant Copilot/Remote WSL IDs | Exit 0; no matching extension IDs returned; same Crashpad diagnostic | No relevant extension version established in this CLI context. Do not infer the active editor profile/harness or absence from every profile; built-in versus extension packaging needs checking. |
| Windows PATH lookup for `opencode` | No command found | Windows command availability only; no installed WSL client/version exists to inspect here. Do not claim global absence. |
| `wsl --help`, filtered to setup options | Printed distribution, install, list/verbose and `--no-launch` options; exit -1 | Relevant options are advertised by the installed command, but the nonzero help result is retained. No installation was attempted. |

Temporary command output was normalized to remove NUL characters emitted by WSL
when captured; the distribution-list failure code is retained above. The
multi-probe command completing is not reported as every probe succeeding.

## 3. Official-source review

Sources retrieved on 2026-10-29. These are discovery evidence, not behavioral
oracles or version-pinned installed-client tests.

| Source | Relevant documented observation | What it does not establish |
|---|---|---|
| [VS Code language models](https://code.visualstudio.com/docs/agent-customization/language-models#_add-a-custom-endpoint-model) | Custom Endpoint configuration supports Chat Completions, Responses and Anthropic Messages API types. Current documentation uses the language-model editor and `chatLanguageModels.json`; the older custom OpenAI model setting is deprecated. | Consent-safe automatic configuration, exact new-human-message mapping, approval delivery, compatibility or required protocol for this installed harness. Do not silently use deprecated settings. |
| [VS Code BYOK](https://code.visualstudio.com/docs/agent-customization/language-models#_bring-your-own-language-model-key) | BYOK in Copilot Agent Host sessions uses the experimental `chat.agentHost.byokModels.enabled` feature. Local and Copilot harness setup differs. | Merely selecting a model does not verify the selected Copilot harness, remote execution location or all custom-provider features. No feature flag was changed. |
| [VS Code agent hooks](https://code.visualstudio.com/docs/agent-customization/hooks) | Personal, repository and plugin hook scopes are documented. Remote hook dependencies belong to the runtime environment. `userPromptSubmitted` is observational and its command-hook output is ignored. SDK prompt rewriting is a different API. | A command hook cannot be assumed to block/redact a submission. Do not replace the required external-agent integration with an agent harness we create. New-session and subagent coverage still need execution evidence. |
| [OpenCode providers](https://opencode.ai/docs/providers/) | Providers can configure `options.baseURL`. `/connect` credentials are documented at `~/.local/share/opencode/auth.json`. | API compatibility, authenticated submission mapping, install-once behavior, credential encryption or an OS-secret-store guarantee. Do not inspect that credential file or use real secrets for probing. |
| [OpenCode plugins](https://opencode.ai/docs/plugins/) | Plugins and typed plugin interfaces are documented, with session/message/permission and tool before/after events. Local and packaged plugins are supported. Plugin dependencies can trigger package installation at startup. | None of these event names proves pre-forward cancellation, message transformation, secure correlation, supported approval UI, stable APIs or correct behavior under concurrency. Do not enable a plugin or start package installation without reviewed setup. |

Only the referenced sections and relevant event/configuration excerpts were
reviewed. Large documentation pages were read progressively; no exhaustive
provider/SDK audit is claimed.

## 4. Per-client capability matrix

| Required capability | OpenCode in WSL | VS Code Copilot with WSL | Evidence still required |
|---|---|---|---|
| Exact installed client/harness/version | Blocked: no WSL distro/client | Windows editor version observed; remote runtime/profile unknown | Pin actual client, plugin/runtime, extension, distro and execution locations |
| Custom-endpoint model routing | Documented only | Documented only; Copilot Agent Host BYOK experimental | Synthetic request actually reaches the selected local endpoint; native bypass accurately labeled |
| Consented install-once activation | Plugin/config mechanisms documented only | Hook/plugin/config mechanisms documented only | Explicit setup diff/consent, automatic eligible-new-session activation, disable/ownership-safe cleanup |
| Existing sessions | Not tested | Not tested | Demonstrate supported attach or reconnect/restart; no earlier-capture claim |
| Exact new-human-message mapping | Not tested | Not tested; prompt hook alone is insufficient | Authenticated session/turn/request/attempt mapping across history, tool continuation, retries, summarization and concurrent sessions |
| Submitter-only request-bound approval | Not tested | Not tested | Supported UI/channel, original/redacted payload binding, no-UI failure, cancellation/expiry/replay behavior |
| Response modes/tool calls/cancellation | Not tested | Not tested | Selected-protocol fixture equivalence, split arguments, partial failures and cancellation |
| Tool/lifecycle/subagent observations | Events documented only | Hooks documented only | Actual events with supported relationships; missing/unsupported telemetry explicit |
| Credential separation and protected client storage | File-based provider credential location documented only | No runtime/client credential contract verified | Fake purpose-bound test keys first; cross-purpose rejection and secure storage/provisioning |
| Concurrency and coverage loss | Not tested | Not tested | Two isolated sessions; disabled hooks, route change, collector/gateway outage and truthful coverage |

No cell is a guarded-path pass. The observational limitation of a VS Code prompt
hook is not a finding that a complete gateway-based integration is impossible.

## 5. Next setup gate

**User choice:** do not install automatically; provide manual setup steps.
The [manual WSL guide](./07-wsl-manual-setup.md) is the next action. No distro
installation or client configuration was performed. Wait for actual setup/
initialization evidence before marking this prerequisite complete.

**Recommendation for approval:** install and register the explicitly pinned
`Ubuntu-24.04` WSL distribution. It appears in the current WSL catalog and offers
a stable initial environment; no Java/client package compatibility is inferred.
`Ubuntu-26.04` is also available if the user prefers that baseline.

Installation authorization should cover the Linux image download, disk usage and
registration. It must not be interpreted as permission to enable Windows features,
elevate privileges, reboot, overwrite an existing distribution or change client
settings. If administrator action or a restart is required, stop and report it.
Do not install both distributions as a fallback.

Use the no-launch installation option if supported so initial Linux account/
password setup is not attempted through chat. The user must enter any credentials
privately in their own terminal. Never request a Linux password in this record.

Proposed topology, still subject to setup confirmation: Windows VS Code UI with a
Remote WSL workspace, OpenCode in the selected distro. Determine gateway/probe
placement from actual Windows/WSL localhost reachability; do not assume shared
paths, extension hosts, secret stores or loopback forwarding.

## 6. Bounded execution plan after setup

1. Verify the distro boots and record release, WSL mode, client/harness versions
   and actual execution locations. Resolve required Remote WSL/client setup with
   explicit consent; preserve existing profiles and settings.
2. Use a disposable synthetic project, not the user's repository prompts.
   Review exact client/plugin versions before dependency installation. No real
   provider API keys, public model calls or production credentials are needed
   for initial protocol probes.
3. Use a local fake upstream and protocol fixture endpoint in a disposable
   candidate-client session. Endpoint/model/hook changes require consent and an
   ownership-safe cleanup plan. Bind probes locally, not publicly; cross-WSL
   networking must not become an unapproved all-interface listener.
4. Capture exact synthetic messages and response/tool-call fixtures to establish
   protocol behavior. A working endpoint does not establish guarding; separately
   demonstrate authenticated new-message mapping and supported approval.
5. Test cancellation, concurrent sessions, no dispatch on denied/failed/pending
   authorization and honest bypass/telemetry failure. Record concrete failures,
   unsupported APIs and remaining unknowns, rather than relabeling missing evidence.
6. Stop attached local probe helpers and remove only specifically named disposable
   files/config entries created by the probe. Do not change normal agent routing.
7. Update this matrix with actual per-client evidence. Select production support
   only after demonstrated capabilities; keep monitoring-only operation explicit.

No protocol fixture, plugin, gateway implementation or live integration test was
created/run during this readiness pass. Production authentication and HTTPS
requirements are not weakened by a local synthetic-only feasibility probe.

## 7. Preparation validation and handoff

Documentation validation passed on 2026-10-29: nine artifact documents, 110
resolving local links/fragments and 16 structurally consistent Markdown tables.
All six source/workflow fingerprints still match the inventory; the 72 product
requirements are unchanged and ten confirmation records are present. No freeze
manifest was created. These are preparation checks, not client integration tests.

When WSL-specific testing resumes, the user completes manual setup and provides
non-secret verification output. That environment prerequisite does not block
client-independent development materials or unrelated Java/frontend work.
