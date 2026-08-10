import json
import subprocess
import sys
import time
from pathlib import Path


MAX_REVIEW_ROUNDS = 3
CLAUDE_MAX_TURNS = 20
EXPECTED_BRANCH = "milestone-2-rule-engine"

FULL_TEST_COMMAND = "npm.cmd test"
TYPECHECK_COMMAND = "npm.cmd run typecheck"
LINT_COMMAND = "npm.cmd run lint"


CLAUDE_ALLOWED_TOOLS = (
    "Read,Write,Edit,"
    "Bash(git status:*),"
    "Bash(git diff:*),"
    "Bash(git diff --stat:*),"
    "Bash(git branch:*),"
    "Bash(git log:*),"
    "Bash(git grep:*),"
    "Bash(rg:*),"
    "Bash(npm test:*),"
    "Bash(npm.cmd test:*),"
    "Bash(npm run test:*),"
    "Bash(npm.cmd run test:*),"
    "Bash(npm run typecheck:*),"
    "Bash(npm.cmd run typecheck:*),"
    "Bash(npm run lint:*),"
    "Bash(npm.cmd run lint:*),"
    "Bash(npx vitest:*)"
)

CLAUDE_DISALLOWED_TOOLS = (
    "Bash(git commit:*),"
    "Bash(git push:*),"
    "Bash(git reset:*),"
    "Bash(git clean:*),"
    "Bash(git checkout:*),"
    "Bash(git switch:*),"
    "Bash(git merge:*),"
    "Bash(git rebase:*),"
    "Bash(rm:*),"
    "Bash(del:*),"
    "Bash(Remove-Item:*)"
)


def now():
    return time.perf_counter()


def elapsed(start):
    return time.perf_counter() - start


def run_process(
    command,
    repo_path,
    input_text=None,
):
    return subprocess.run(
        command,
        cwd=repo_path,
        input=input_text,
        capture_output=True,
        text=True,
        shell=True,
        encoding="utf-8",
        errors="replace",
    )


def run_command(command, repo_path):
    return run_process(
        command,
        repo_path,
    )


def git_status_short(repo_path):
    result = run_command(
        "git status --short",
        repo_path,
    )

    if result.returncode != 0:
        print("Could not read git status:")
        print(result.stderr)
        sys.exit(1)

    return result.stdout.strip()


def git_current_branch(repo_path):
    result = run_command(
        "git branch --show-current",
        repo_path,
    )

    if result.returncode != 0:
        print("Could not determine current branch:")
        print(result.stderr)
        sys.exit(1)

    return result.stdout.strip()


def git_head(repo_path):
    result = run_command(
        "git rev-parse --short HEAD",
        repo_path,
    )

    if result.returncode != 0:
        print("Could not determine HEAD:")
        print(result.stderr)
        sys.exit(1)

    return result.stdout.strip()


def run_claude(
    prompt,
    repo_path,
    session_id=None,
):
    print("\n========================================")
    print("CLAUDE")
    print("========================================")

    command = [
        "claude",
        "-p",
        "--output-format",
        "json",
        "--max-turns",
        str(CLAUDE_MAX_TURNS),
        "--allowedTools",
        CLAUDE_ALLOWED_TOOLS,
        "--disallowedTools",
        CLAUDE_DISALLOWED_TOOLS,
    ]

    if session_id:
        command.extend(
            [
                "--resume",
                session_id,
            ]
        )

    start = now()

    result = subprocess.run(
        command,
        cwd=repo_path,
        input=prompt,
        capture_output=True,
        text=True,
        shell=True,
        encoding="utf-8",
        errors="replace",
    )

    duration = elapsed(start)

    if result.returncode != 0:
        print("Claude error:")
        print(result.stderr)

        return {
            "ok": False,
            "duration": duration,
            "session_id": session_id,
            "text": "",
        }

    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError:
        print("Claude returned invalid JSON:")
        print(result.stdout)

        return {
            "ok": False,
            "duration": duration,
            "session_id": session_id,
            "text": "",
        }

    response_text = payload.get("result", "")
    new_session_id = payload.get(
        "session_id",
        session_id,
    )

    print(response_text)

    print(
        f"\n[Claude: {duration:.1f}s, "
        f"{payload.get('num_turns', '?')} turns]"
    )

    return {
        "ok": not payload.get("is_error", False),
        "duration": duration,
        "session_id": new_session_id,
        "text": response_text,
    }


def run_codex_review(task, repo_path):
    print("\n========================================")
    print("CODEX REVIEW")
    print("========================================")

    prompt = f"""
You are the independent reviewer in an automated software workflow.

ORIGINAL TASK
-------------
{task}
-------------

Review the CURRENT working tree.

You are reviewing the implementation, not redesigning it.

Inspect only what is necessary:
- git status
- relevant changed/untracked files
- relevant specifications
- relevant tests

Do NOT:
- expand scope
- request optional refactors
- request documentation unless explicitly required
- request commit/push/merge/PR actions
- reject merely because files are untracked
- repeat already-resolved findings

Return CHANGES_REQUESTED only for a blocking issue:
1. explicit requirement violation
2. correctness bug
3. meaningful regression
4. relevant accepted-specification violation
5. missing test necessary to establish correctness

If everything required is satisfied, APPROVE.

Your FIRST LINE must be exactly one of:

STATUS: APPROVED

STATUS: CHANGES_REQUESTED

Then:

REVIEW:
<concise blocking findings only>

If approved, prefer:

STATUS: APPROVED
REVIEW:
No blocking findings.
"""

    start = now()

    result = run_process(
        "codex exec -",
        repo_path,
        input_text=prompt,
    )

    duration = elapsed(start)

    if result.returncode != 0:
        print("Codex error:")
        print(result.stderr)

        return {
            "ok": False,
            "duration": duration,
            "text": "",
        }

    output = result.stdout.strip()

    print(output)
    print(f"\n[Codex: {duration:.1f}s]")

    return {
        "ok": True,
        "duration": duration,
        "text": output,
    }


def run_verification_command(
    label,
    command,
    repo_path,
):
    print(f"\n--- {label} ---")

    start = now()

    result = run_command(
        command,
        repo_path,
    )

    duration = elapsed(start)

    if result.stdout:
        print(result.stdout)

    if result.stderr:
        print(result.stderr)

    print(
        f"[{label}: {duration:.1f}s]"
    )

    return (
        result.returncode == 0,
        duration,
        result.stdout + result.stderr,
    )


def run_final_verification(repo_path):
    print("\n========================================")
    print("FINAL VERIFICATION")
    print("========================================")

    total_duration = 0.0

    commands = [
        (
            "Tests",
            FULL_TEST_COMMAND,
        ),
        (
            "Typecheck",
            TYPECHECK_COMMAND,
        ),
        (
            "Lint",
            LINT_COMMAND,
        ),
    ]

    failures = []

    for label, command in commands:
        passed, duration, output = (
            run_verification_command(
                label,
                command,
                repo_path,
            )
        )

        total_duration += duration

        if not passed:
            failures.append(
                {
                    "label": label,
                    "command": command,
                    "output": output,
                }
            )

    return (
        len(failures) == 0,
        total_duration,
        failures,
    )


def build_initial_claude_prompt(task):
    return f"""
You are the implementation agent for PFOS.

Implement ONLY the following task:

--- TASK ---
{task}
--- END TASK ---

Before editing:
1. Read CLAUDE.md.
2. Read only specifications necessary for this task.
3. Inspect only code necessary for this task.
4. Confirm prerequisites before implementing.

If the task or prerequisites are ambiguous:
- make NO changes
- report BLOCKED

Implementation rules:
- Modify the repository directly.
- Stay strictly within scope.
- Do not begin the next task.
- Do not modify unrelated files.
- Do not commit.
- Do not push.
- Do not change branches.
- Do not reset, clean, or discard work.
- Reuse existing domain primitives.
- Respect accepted decisions and architecture boundaries.

Testing rules:
- During implementation, run TARGETED tests only.
- Do not run the full repository suite.
- Do not run full lint/typecheck unless necessary to diagnose a targeted issue.
- The orchestrator performs full verification after reviewer approval.

Avoid scratch files.
Do not create temporary verification files inside the repository.

When finished, respond ONLY in this format:

STATUS: COMPLETE
or
STATUS: BLOCKED

FILES:
<changed files, or none>

TESTS:
<targeted tests and results>

BLOCKERS:
<none, or concise blocker>
"""


def build_revision_prompt(review):
    return f"""
Continue the SAME task in the SAME repository.

The independent reviewer reported:

--- REVIEW ---
{review}
--- END REVIEW ---

Fix ONLY valid blocking findings.

Important:
- You already know the task and repository context.
- Do NOT reread the whole repository.
- Inspect only files necessary for these findings.
- Do not expand scope.
- Do not create scratch verification files.
- Do not commit.
- Do not push.
- Run targeted tests only.

If you agree with a finding but the environment prevents you
from performing the required fix, respond:

STATUS: HUMAN_ACTION_REQUIRED

and explain:
- the exact blocking finding
- the exact operation the environment prevents
- the safest manual command/action required

Otherwise respond:

STATUS: COMPLETE

FILES:
<files changed>

TESTS:
<targeted tests and results>

BLOCKERS:
<none>
"""


def build_verification_fix_prompt(failures):
    failure_text = "\n\n".join(
        (
            f"{item['label']} failed.\n"
            f"Command: {item['command']}\n"
            f"Output:\n{item['output']}"
        )
        for item in failures
    )

    return f"""
Continue the SAME implementation.

Independent code review has already APPROVED the implementation,
but final repository verification failed:

{failure_text}

Determine whether these failures were caused by your current changes.

Fix ONLY regressions caused by this task.

Do not expand scope.
Do not commit.
Do not push.
Do not create scratch verification files.

Run targeted verification for anything you fix.

If the failure is environmental or unrelated to your changes,
respond:

STATUS: HUMAN_ACTION_REQUIRED

with a concise explanation.

Otherwise respond:

STATUS: COMPLETE

FILES:
<files changed>

TESTS:
<targeted verification>

BLOCKERS:
<none>
"""


def read_multiline_task():
    print("\nEnter task for Claude.")
    print("Paste the full task below.")
    print("Type END on a new line when finished.\n")

    lines = []

    while True:
        line = input()

        if line.strip() == "END":
            break

        lines.append(line)

    return "\n".join(lines).strip()


def print_timing(
    claude_seconds,
    codex_seconds,
    verify_seconds,
    overall_seconds,
):
    print("\n========================================")
    print("TIMING")
    print("========================================")

    print(
        f"Claude total:      {claude_seconds:.1f}s"
    )
    print(
        f"Codex total:       {codex_seconds:.1f}s"
    )
    print(
        f"Verification:      {verify_seconds:.1f}s"
    )
    print(
        f"Overall:           {overall_seconds:.1f}s"
    )


def main():
    overall_start = now()

    claude_seconds = 0.0
    codex_seconds = 0.0
    verify_seconds = 0.0

    print("\nPFOS AI ORCHESTRATOR V3")
    print("========================================")

    if len(sys.argv) != 2:
        print(
            "Usage:\n"
            "python tools\\ai_orchestrator.py <PFOS_REPO_PATH>"
        )
        return

    repo_path = Path(sys.argv[1]).resolve()

    if not repo_path.exists():
        print(
            "\nSTOPPED: repository does not exist:"
        )
        print(repo_path)
        return

    if not (repo_path / ".git").exists():
        print(
            "\nSTOPPED: target is not a Git worktree."
        )
        return

    branch = git_current_branch(
        repo_path
    )

    print(f"Target: {repo_path}")
    print(f"HEAD:   {git_head(repo_path)}")
    print(f"Branch: {branch}")

    if branch != EXPECTED_BRANCH:
        print("\nSTOPPED: wrong branch.")
        print(
            f"Expected: {EXPECTED_BRANCH}"
        )
        return

    status = git_status_short(
        repo_path
    )

    if status:
        print(
            "\nSTOPPED: working tree is not clean."
        )
        print(status)
        return

    print("✓ Correct branch")
    print("✓ Working tree clean")

    task = read_multiline_task()

    if not task:
        print("No task provided.")
        return

    claude = run_claude(
        build_initial_claude_prompt(task),
        repo_path,
    )

    claude_seconds += claude["duration"]

    if not claude["ok"]:
        return

    claude_session_id = claude[
        "session_id"
    ]

    if (
        "STATUS: BLOCKED"
        in claude["text"]
    ):
        print("\n========================================")
        print("BLOCKED BEFORE IMPLEMENTATION")
        print("========================================")
        print(claude["text"])
        return

    status = git_status_short(
        repo_path
    )

    if not status:
        print(
            "\nSTOPPED: Claude made no repository changes."
        )
        return

    print("\nChanges detected:")
    print(status)

    review_round = 1

    while review_round <= MAX_REVIEW_ROUNDS:
        print(
            f"\n******** REVIEW ROUND "
            f"{review_round} ********"
        )

        codex = run_codex_review(
            task,
            repo_path,
        )

        codex_seconds += codex[
            "duration"
        ]

        if not codex["ok"]:
            return

        review = codex["text"]

        if "STATUS: APPROVED" in review:
            (
                verified,
                duration,
                failures,
            ) = run_final_verification(
                repo_path
            )

            verify_seconds += duration

            if verified:
                print(
                    "\n========================================"
                )
                print(
                    "READY FOR HUMAN REVIEW"
                )
                print(
                    "========================================"
                )

                print("\nFinal git status:")
                print(
                    git_status_short(
                        repo_path
                    )
                )

                print_timing(
                    claude_seconds,
                    codex_seconds,
                    verify_seconds,
                    elapsed(overall_start),
                )

                print(
                    "\nNothing was committed or pushed."
                )

                return

            print(
                "\nFinal verification failed."
            )

            claude = run_claude(
                build_verification_fix_prompt(
                    failures
                ),
                repo_path,
                claude_session_id,
            )

            claude_seconds += claude[
                "duration"
            ]

            if not claude["ok"]:
                return

            if (
                "STATUS: HUMAN_ACTION_REQUIRED"
                in claude["text"]
            ):
                print(
                    "\n========================================"
                )
                print(
                    "HUMAN ACTION REQUIRED"
                )
                print(
                    "========================================"
                )
                print(claude["text"])
                return

            review_round += 1
            continue

        if (
            "STATUS: CHANGES_REQUESTED"
            not in review
        ):
            print(
                "\nSTOPPED: unknown Codex status."
            )
            return

        if review_round == MAX_REVIEW_ROUNDS:
            print(
                "\n========================================"
            )
            print(
                "STOPPED: MAX REVIEW ROUNDS"
            )
            print(
                "========================================"
            )
            return

        claude = run_claude(
            build_revision_prompt(review),
            repo_path,
            claude_session_id,
        )

        claude_seconds += claude[
            "duration"
        ]

        if not claude["ok"]:
            return

        if (
            "STATUS: HUMAN_ACTION_REQUIRED"
            in claude["text"]
        ):
            print(
                "\n========================================"
            )
            print(
                "HUMAN ACTION REQUIRED"
            )
            print(
                "========================================"
            )
            print(claude["text"])

            print_timing(
                claude_seconds,
                codex_seconds,
                verify_seconds,
                elapsed(overall_start),
            )

            return

        claude_session_id = claude[
            "session_id"
        ]

        review_round += 1


if __name__ == "__main__":
    main()