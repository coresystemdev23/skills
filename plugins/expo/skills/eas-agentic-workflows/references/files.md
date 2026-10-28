# Files each guide adds

Copy the bodies from the fetched guide. This list is the checklist of paths, not a second copy of the files.

Shared, once per project:

- App config: `ios.bundleIdentifier` and/or `android.package` for the platforms under test.
- `eas.json` `build.preview`: `distribution: internal`, `environment: preview`, plus `ios.simulator: true` and/or `android.buildType: apk`.
- `.eas/agents/run-agent.sh` for the named agent.
- `.cursor/cli.json` when the agent is Cursor.

## Agentic CI

Fetch `agentic-ci`.

- `.eas/agents/start-session.sh` for the named controller.
- `.eas/agents/check-pr.md`
- `.eas/workflows/agentic-ci.yml`, or `agentic-ci-android.yml` and `agentic-ci-ios.yml` when testing both.

Validate each workflow file. The `check` job sources the session script, runs the agent in `device` mode, and uploads `agent-output/evidence/**/*`.

## Issue to PR

Fetch `issue-to-pr`. Install Agentic CI first.

- `.eas/agents/github.mjs` with commands `issue`, `comment`, `open-pull-request`, and `author-email`.
- `.eas/agents/make-change.sh`
- `.eas/agents/make-change.md`
- `.eas/workflows/issue-to-pr.yml` with a `workflow_dispatch` input named `issue_number`.
- `.github/workflows/agent-label.yml`. This file starts the EAS workflow when an issue gains the `agent` label. The Action uses `npm ci`. Change that command when the project uses another package manager.

The user still has to run `gh secret set EXPO_TOKEN` (a second Developer robot token) and `gh label create agent`. Do not invent the token.

Validate `.eas/workflows/issue-to-pr.yml`.

## Bug triage

Fetch `bug-triage`. Install Agentic CI and Issue to PR first.

- Replace `.eas/agents/github.mjs` with the page's version, which adds `create-issue`.
- `.eas/agents/reproduce.sh`
- `.eas/agents/reproduce.md`
- `.eas/agents/start-session.sh` if it is not already there.
- `.eas/workflows/bug-triage.yml` for the chosen platform. The iOS file also has the `app_store_connect.beta_feedback` trigger and an `intake` job. The Android file is manual `workflow_dispatch` only.
- `.eas/agents/feedback-issue.mjs` for iOS. Skip it for Android.

iOS TestFlight also needs the App Store Connect app connected to the EAS project, an App Store Connect API key on the `production` submit profile (`eas credentials --platform ios`), and `gh label create testflight`. The user does the credential step.

Validate `.eas/workflows/bug-triage.yml`.

## QA Swarm

Fetch `qa-swarm` only after the user confirms they want it.

- `.eas/qa-flows/<flow>.md` for each lane. The page's examples are a launch flow and a navigation flow. Also write two short flows for this app's main screens, in the same shape: steps, out of scope, pass condition.
- A file named `<flow>.android.md` or `<flow>.ios.md` replaces `<flow>.md` on that platform.
- `.eas/agents/qa-lane.md`
- `.eas/agents/qa-lane.sh`
- `.eas/agents/start-session.sh`
- `.eas/workflows/qa-swarm.yml`. Add one `lane_*` job per flow and platform. EAS Workflows has no matrix. Add a lane by copying a `lane_*` job, then add it to the `report` job's `after` list and markdown.

The lane script deploys an evidence site with `eas-simulator-evidence`. That site is public. Say so before leaving `--deploy-alias` in place. To keep evidence private, remove `--deploy-alias`, as the page describes.

Optional `pr_comment` job: only when the user wants a PR comment. It needs `GITHUB_TOKEN` and `GITHUB_REPOSITORY` in `preview`.

Validate `.eas/workflows/qa-swarm.yml`.
