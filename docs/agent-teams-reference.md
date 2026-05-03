# Agent Teams — Master Reference Guide

> Source: https://code.claude.com/docs/en/agent-teams
> Requires: Claude Code v2.1.32+, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

---

## Table of Contents

1. [What Are Agent Teams](#1-what-are-agent-teams)
2. [When to Use Agent Teams vs Alternatives](#2-when-to-use-agent-teams-vs-alternatives)
3. [Enabling Agent Teams](#3-enabling-agent-teams)
4. [Architecture & Storage](#4-architecture--storage)
5. [Starting a Team](#5-starting-a-team)
6. [Display Modes](#6-display-modes)
7. [Controlling a Team](#7-controlling-a-team)
8. [Task System](#8-task-system)
9. [Messaging & Communication](#9-messaging--communication)
10. [Permissions](#10-permissions)
11. [Subagent Definitions as Teammates](#11-subagent-definitions-as-teammates)
12. [Quality Gates via Hooks](#12-quality-gates-via-hooks)
13. [Token Costs](#13-token-costs)
14. [Best Practices](#14-best-practices)
15. [Use Case Playbook](#15-use-case-playbook)
16. [Troubleshooting](#16-troubleshooting)
17. [Known Limitations](#17-known-limitations)

---

## 1. What Are Agent Teams

Agent teams let you coordinate **multiple independent Claude Code sessions** working together on a shared task list. One session is the **lead** — it creates the team, spawns teammates, and synthesizes results. Each **teammate** is a full, separate Claude Code instance with its own context window.

Unlike subagents (which exist inside one session and only report back to the main agent), teammates:
- Communicate **directly with each other**, not just through the lead
- Share a **common task list** and self-assign work
- Can be messaged **by the user** without going through the lead

---

## 2. When to Use Agent Teams vs Alternatives

### Agent Teams Are Best For

| Scenario | Why Teams Win |
|---|---|
| Parallel code review (security / perf / tests) | Each reviewer applies a different lens simultaneously |
| New modules or features with clear ownership boundaries | Teammates own separate files with no overlap |
| Debugging with competing hypotheses | Teammates actively try to disprove each other → more reliable root cause |
| Cross-layer changes (frontend + backend + tests) | Each layer owned independently |
| Research from multiple angles | Parallel exploration > sequential |

### When NOT to Use Agent Teams

- **Sequential tasks** — coordination overhead exceeds any benefit
- **Same-file edits** — two teammates editing one file causes overwrites
- **Many dependencies between tasks** — use a single session
- **Simple, focused tasks** — subagents are cheaper and simpler

### Decision Matrix: Teams vs Subagents vs Single Session

| | Single Session | Subagents | Agent Teams |
|---|---|---|---|
| Workers need to talk to each other | ✗ | ✗ | ✓ |
| Workers share a task list | ✗ | ✗ | ✓ |
| Results summarized back to one context | ✓ | ✓ | ✗ |
| Token cost | Lowest | Low | Highest |
| Best for | Routine tasks | Focused delegation | Complex parallel work |

**Rule of thumb:** Use subagents when only the *result* matters. Use agent teams when teammates need to *discuss, challenge, and coordinate* on their own.

---

## 3. Enabling Agent Teams

Agent teams are **disabled by default**. Enable via local project settings (recommended) or shell environment.

### In `.claude/settings.local.json` (project-local, not committed)

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### In `~/.claude/settings.json` (global)

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Shell environment

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

---

## 4. Architecture & Storage

### Components

| Component | Role |
|---|---|
| **Team lead** | The session that created the team; spawns, coordinates, synthesizes |
| **Teammates** | Independent Claude Code instances; each has its own context window |
| **Task list** | Shared work items; teammates claim and complete them |
| **Mailbox** | Messaging system for inter-agent communication |

### Storage Locations (auto-generated, do not hand-edit)

| Resource | Path |
|---|---|
| Team config | `~/.claude/teams/{team-name}/config.json` |
| Task list | `~/.claude/tasks/{team-name}/` |

The team config contains a `members` array with each teammate's name, agent ID, and agent type — teammates can read this to discover each other.

> **Do not pre-author or hand-edit team config.** It is overwritten on every state update.
> **No project-level equivalent.** `.claude/teams/teams.json` in your project directory is ignored — Claude treats it as an ordinary file.

---

## 5. Starting a Team

After enabling, describe the task and desired team structure in natural language. Claude will:
1. Create the team
2. Spawn teammates
3. Set up a shared task list
4. Coordinate work
5. Attempt cleanup when finished

### Example Prompts

```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles:
one teammate on UX, one on technical architecture, one playing devil's advocate.
```

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

```
Create a team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```

### How Teams Get Started

- **You request it** — explicitly ask for an agent team
- **Claude proposes it** — Claude may suggest a team if it determines the task benefits from parallel work; you confirm before it proceeds

**Claude will not create a team without your approval.**

---

## 6. Display Modes

### In-Process (default fallback)

- All teammates run inside your main terminal
- **Shift+Down** — cycle through teammates
- **Type** — send a message to the focused teammate
- **Enter** — view a teammate's session
- **Escape** — interrupt their current turn
- **Ctrl+T** — toggle the task list
- Works in any terminal, no extra setup

### Split Panes

- Each teammate gets its own pane — see all output simultaneously
- Click a pane to interact with that teammate directly
- Requires **tmux** or **iTerm2** (with `it2` CLI + Python API enabled)
- Not supported in: VS Code integrated terminal, Windows Terminal, Ghostty

### Mode Selection

Default is `"auto"`: uses split panes if already inside tmux, in-process otherwise.

**Override globally** in `~/.claude.json`:
```json
{
  "teammateMode": "in-process"
}
```

**Override per session:**
```bash
claude --teammate-mode in-process
```

**Install tmux (split panes):**
```bash
# macOS
brew install tmux

# Ubuntu/Debian
apt install tmux
```

**For iTerm2:** install the `it2` CLI, then enable **iTerm2 → Settings → General → Magic → Enable Python API**.

---

## 7. Controlling a Team

All control is done via natural language to the lead. The lead handles coordination, task assignment, and delegation.

### Requiring Plan Approval Before Implementation

```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

Flow:
1. Teammate works in **read-only plan mode**
2. Submits plan approval request to lead
3. Lead approves → teammate implements
4. Lead rejects with feedback → teammate revises and resubmits

To influence lead's judgment:
```
Only approve plans that include test coverage.
Reject plans that modify the database schema.
```

### Shutting Down a Teammate

```
Ask the researcher teammate to shut down.
```

The lead sends a shutdown request. The teammate can approve (exits gracefully) or reject with an explanation.

### Cleaning Up the Team

```
Clean up the team.
```

This removes shared team resources. **Only the lead should run cleanup.** Teammates should not run cleanup — their team context may not resolve correctly, leaving resources in an inconsistent state.

> Always shut down active teammates before running cleanup. Cleanup will fail if any teammates are still running.

---

## 8. Task System

### Task States

- **Pending** — not yet started
- **In progress** — claimed by a teammate
- **Completed** — done

### Task Dependencies

Tasks can depend on other tasks. A pending task with unresolved dependencies cannot be claimed until those dependencies complete. The system handles unblocking automatically when dependencies finish.

### Task Assignment

| Method | How |
|---|---|
| **Lead assigns explicitly** | Tell the lead which task goes to which teammate |
| **Self-claim** | After finishing, a teammate picks the next unassigned, unblocked task |

Task claiming uses **file locking** to prevent race conditions when multiple teammates try to claim the same task simultaneously.

### Sizing Tasks

| Size | Problem |
|---|---|
| Too small | Coordination overhead exceeds benefit |
| Too large | Teammates work too long without check-ins; wasted effort risk |
| Just right | Self-contained unit producing a clear deliverable (a function, test file, or review) |

**Target: 5–6 tasks per teammate.** If the lead isn't creating enough tasks, ask it to split work into smaller pieces.

---

## 9. Messaging & Communication

### How Teammates Share Information

| Mechanism | Behavior |
|---|---|
| **Automatic message delivery** | Messages delivered automatically; lead doesn't poll |
| **Idle notifications** | When a teammate finishes and stops, it automatically notifies the lead |
| **Shared task list** | All agents see task status and can claim available work |

### Messaging Types

| Type | Behavior | Cost |
|---|---|---|
| `message` | Send to one specific teammate | Normal |
| `broadcast` | Send to all teammates simultaneously | Scales with team size — use sparingly |

### Names

The lead assigns every teammate a name at spawn time. Any teammate can message any other by name. To get predictable names you can reference in later prompts, tell the lead what to call each teammate in your spawn instruction.

### User ↔ Teammate Direct Communication

- **In-process**: Shift+Down to cycle, type to send
- **Split-pane**: click the pane, type directly

---

## 10. Permissions

- Teammates **start with the lead's permission settings**
- If the lead runs with `--dangerously-skip-permissions`, all teammates do too
- You **can change individual teammate modes after spawning**
- You **cannot set per-teammate modes at spawn time**

To reduce permission prompt interruptions, pre-approve common operations in your permission settings before spawning teammates.

---

## 11. Subagent Definitions as Teammates

You can reference a [subagent](https://code.claude.com/docs/en/sub-agents) type when spawning a teammate. This lets you define a role once (e.g., `security-reviewer`, `test-runner`) and reuse it across sessions and teams.

```
Spawn a teammate using the security-reviewer agent type to audit the auth module.
```

**How it works:**
- The definition's `tools` allowlist and `model` are honored
- The definition's body is **appended** to the teammate's system prompt (not replacing it)
- Team coordination tools (`SendMessage`, task tools) are always available even when `tools` restricts others

**Note:** `skills` and `mcpServers` frontmatter fields in a subagent definition are **not applied** when running as a teammate. Teammates load skills and MCP servers from project and user settings, same as a regular session.

---

## 12. Quality Gates via Hooks

Use hooks to enforce rules at key moments in the team lifecycle.

### TeammateIdle

**Fires when:** a teammate is about to go idle
**Can block:** Yes — exit code `2` keeps the teammate working with stderr as feedback
**Does not support matchers** — fires on every occurrence

| Exit Code | Behavior |
|---|---|
| `0` | Teammate goes idle |
| `2` | Teammate continues working; stderr message fed back as feedback |

JSON output: `{"continue": false, "stopReason": "..."}` stops the teammate entirely.

---

### TaskCreated

**Fires when:** a task is being created via the `TaskCreate` tool
**Can block:** Yes — exit code `2` prevents creation

**Input payload:**
```json
{
  "session_id": "...",
  "transcript_path": "...",
  "cwd": "...",
  "permission_mode": "default",
  "hook_event_name": "TaskCreated",
  "task_id": "task-001",
  "task_subject": "Implement user authentication",
  "task_description": "Add login and signup endpoints",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```

**Example — enforce ticket number in task subject:**
```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

if [[ ! "$TASK_SUBJECT" =~ ^\[TICKET-[0-9]+\] ]]; then
  echo "Task subject must start with a ticket number, e.g. '[TICKET-123] Add feature'" >&2
  exit 2
fi
exit 0
```

---

### TaskCompleted

**Fires when:** a task is being marked as completed (explicitly via `TaskUpdate`, or when a teammate finishes its turn with in-progress tasks)
**Can block:** Yes — exit code `2` prevents completion

**Input payload:** same structure as TaskCreated (same fields).

**Example — require passing tests before completion:**
```bash
#!/bin/bash
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

if ! npm test 2>&1; then
  echo "Tests not passing. Fix failing tests before completing: $TASK_SUBJECT" >&2
  exit 2
fi
exit 0
```

---

### Hook Summary

| Hook | Fires When | Can Block | Use Case |
|---|---|---|---|
| `TeammateIdle` | Teammate about to go idle | Yes (exit 2) | Force continued work, quality checks |
| `TaskCreated` | Task being created | Yes (exit 2) | Enforce naming, require descriptions |
| `TaskCompleted` | Task being marked done | Yes (exit 2) | Require passing tests, lint, coverage |

---

## 13. Token Costs

Agent teams use **significantly more tokens** than a single session. Each teammate has its own context window.

### Cost Estimates

| Mode | Approximate multiplier vs single session |
|---|---|
| Standard teammates | ~proportional to team size |
| Teammates in plan mode | ~7x more than a standard session |

Average single-session cost: ~$6/dev/day. Teams scale this up proportionally.

### Cost Reduction Strategies

| Strategy | Impact |
|---|---|
| Use **Sonnet** for teammates (not Opus) | High — Opus costs significantly more |
| Keep team **size small** (3–5 teammates) | High — linear scaling |
| Keep **spawn prompts focused** | Medium — everything in spawn prompt adds to initial context |
| **Clean up teams** when work is done | Medium — active teammates consume tokens even when idle |
| Keep tasks **small and self-contained** | Medium — limits per-teammate context growth |
| Use **subagents** for tasks that don't need inter-agent coordination | High — subagents are cheaper |

### When the Extra Cost Is Worth It

✓ Research, review, investigation with multiple independent angles
✓ New features/modules with clear file ownership boundaries
✓ Debugging with competing hypotheses where debate accelerates convergence

✗ Routine sequential tasks
✗ Single-file changes
✗ Work with heavy inter-task dependencies

---

## 14. Best Practices

### Give Teammates Enough Context

Teammates load `CLAUDE.md`, MCP servers, and skills automatically — but do **not** inherit the lead's conversation history. Include task-specific details in the spawn prompt:

```
Spawn a security reviewer teammate with the prompt: "Review the authentication module
at src/auth/ for security vulnerabilities. Focus on token handling, session
management, and input validation. The app uses JWT tokens stored in
httpOnly cookies. Report any issues with severity ratings."
```

### Use CLAUDE.md for Project-Wide Guidance

Teammates read `CLAUDE.md` from their working directory the same as a regular session. Use this to give all teammates shared project context without bloating individual spawn prompts.

### Start Small

Start with **3–5 teammates** for most workflows. Scale up only when the work genuinely benefits from simultaneous execution. Three focused teammates often outperform five scattered ones.

### Avoid File Conflicts

Two teammates editing the same file causes overwrites. Design work so **each teammate owns a different set of files**.

### Wait for Teammates to Finish

If the lead starts implementing tasks itself instead of waiting:
```
Wait for your teammates to complete their tasks before proceeding.
```

### Monitor and Steer

Check in on progress, redirect approaches that aren't working, and synthesize findings as they come in. Don't let a team run unattended for too long.

### Start with Research/Review Tasks

If new to agent teams, begin with tasks that have clear boundaries and don't write code (PR reviews, library research, bug investigation). These show the value of parallel exploration without the coordination challenges of parallel implementation.

### Use Adversarial Structure for Debugging

```
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific debate.
Update the findings doc with whatever consensus emerges.
```

The debate structure fights anchoring bias — each agent's job is to disprove the others, so the theory that survives is more likely to be correct.

---

## 15. Use Case Playbook

### Parallel Code Review

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

Each reviewer applies a different filter to the same PR. Lead synthesizes findings across all three.

### Competing Hypotheses Debugging

```
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific
debate. Update the findings doc with whatever consensus emerges.
```

### Multi-Angle Exploration / Design

```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles:
one teammate on UX, one on technical architecture, one playing devil's advocate.
```

### Parallel Module Implementation

```
Create a team with 4 teammates to implement these 4 independent modules in parallel.
Each teammate should own one module completely — don't touch each other's files.
Use Sonnet for each teammate.
```

### Gated Implementation with Plan Approval

```
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
Only approve plans that include test coverage. Reject any plan that
modifies the database schema.
```

---

## 16. Troubleshooting

### Teammates Not Appearing

- In in-process mode: press **Shift+Down** — they may be running but not visible
- Check if the task was complex enough to warrant a team
- For split panes: verify tmux is installed — `which tmux`
- For iTerm2: verify `it2` CLI is installed and Python API is enabled

### Too Many Permission Prompts

Pre-approve common operations in permission settings before spawning teammates.

### Teammate Stops on Error

1. Check output via Shift+Down (in-process) or click pane (split)
2. Give additional instructions directly to that teammate
3. Or spawn a replacement teammate to continue the work

### Lead Shuts Down Before Work Is Done

Tell the lead to keep going, or preemptively instruct it:
```
Wait for all teammates to finish before concluding.
```

### Task Status Lagging (Stuck Tasks)

Teammates sometimes fail to mark tasks as completed, blocking dependent tasks. Check whether work is actually done, then update task status manually or ask the lead to nudge the teammate.

### Orphaned tmux Sessions

```bash
tmux ls
tmux kill-session -t <session-name>
```

---

## 17. Known Limitations

| Limitation | Detail |
|---|---|
| **No session resumption with in-process teammates** | `/resume` and `/rewind` don't restore in-process teammates. After resuming, lead may message teammates that no longer exist — spawn new ones. |
| **Task status can lag** | Teammates may fail to mark tasks complete, blocking dependents. Nudge manually if stuck. |
| **Slow shutdown** | Teammates finish their current request/tool call before shutting down. |
| **One team per session** | A lead can only manage one team at a time. Clean up before starting a new one. |
| **No nested teams** | Teammates cannot spawn their own teams or teammates. Only the lead can manage the team. |
| **Lead is fixed** | The session that creates the team is the lead for its lifetime. Cannot promote a teammate or transfer leadership. |
| **Permissions set at spawn** | All teammates start with the lead's permission mode. Can change individual modes after spawning, but not at spawn time. |
| **Split panes require tmux or iTerm2** | Not supported in VS Code integrated terminal, Windows Terminal, or Ghostty. |

---

## Quick Reference Card

```
ENABLE:     CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 in settings.local.json
VERSION:    Requires Claude Code v2.1.32+
STORAGE:    ~/.claude/teams/{name}/config.json  |  ~/.claude/tasks/{name}/
NAVIGATE:   Shift+Down (cycle teammates)  |  Ctrl+T (task list toggle)
CLEANUP:    Always ask the LEAD to clean up, never a teammate
TEAM SIZE:  Start with 3–5 teammates  |  5–6 tasks per teammate
COST:       Linear token scaling  |  Use Sonnet (not Opus) for teammates
HOOKS:      TeammateIdle, TaskCreated, TaskCompleted (exit 2 = block)
DISPLAY:    auto | in-process | tmux  (flag: --teammate-mode in-process)
```
