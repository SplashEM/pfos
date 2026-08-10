import subprocess
import sys


MAX_REVIEW_ROUNDS = 3


CLAUDE_ALLOWED_TOOLS = (
    "Read,Write,Edit,"
    "Bash(git status:*),"
    "Bash(git diff:*),"
    "Bash(git diff --stat:*),"
    "Bash(npm test:*),"
    "Bash(npm run test:*),"
    "Bash(npm run lint:*),"
    "Bash(npx vitest:*)"
)


def run_command(command):
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        shell=True,
        encoding="utf-8",
        errors="replace",
    )

    return result


def git_status_short():
    result = run_command("git status --short")

    if result.returncode != 0:
        print("Could not read git status:")
        print(result.stderr)
        sys.exit(1)

    return result.stdout.strip()


def run_claude(prompt):
    print("\n========================================")
    print("CLAUDE")
    print("========================================")

    command = (
        f'claude -p --allowedTools '
        f'"{CLAUDE_ALLOWED_TOOLS}"'
    )

    result = subprocess.run(
        command,
        input=prompt,
        capture_output=True,
        text=True,
        shell=True,
        encoding="utf-8",
        errors="replace",
    )

    if result.returncode != 0:
        print("Claude error:")
        print(result.stderr)
        return None

    print(result.stdout)

    return result.stdout


def run_codex_review(task):
    print("\n========================================")
    print("CODEX REVIEW")
    print("========================================")

    review_instructions = f"""
The implementation task was:

--- TASK ---
{task}
--- END TASK ---

Review the current uncommitted changes strictly against this task
and the repository's existing specifications.

Do not expand the scope.

Only report a finding if it is:
- a correctness defect
- a violation of an explicit task requirement
- a meaningful regression
- a violation of an existing project specification
- a missing test required to establish correctness

Ignore purely optional improvements.

Conclude clearly with either:

STATUS: APPROVED

or

STATUS: CHANGES_REQUESTED
"""

    result = subprocess.run(
        ["codex", "review", "--uncommitted", review_instructions],
        capture_output=True,
        text=True,
        shell=True,
        encoding="utf-8",
        errors="replace",
    )

    if result.returncode != 0:
        print("Codex error:")
        print(result.stderr)
        return None

    print(result.stdout)

    return result.stdout


def build_initial_claude_prompt(task):
    return f"""
You are the implementation agent working in the current repository.

Complete ONLY the following task:

--- TASK ---
{task}
--- END TASK ---

Rules:

- Read the relevant project specifications before editing.
- Inspect the existing implementation before making changes.
- Modify the repository directly.
- Stay strictly within the requested scope.
- Do not commit.
- Do not push.
- Do not change branches.
- Do not reset or discard existing work.
- Do not modify unrelated files.
- Run the relevant tests using the tools available to you.
- If a command is not allowed, report that accurately rather than claiming it ran.
- Prefer the smallest correct implementation.

When finished, report:
1. files changed
2. what was implemented
3. tests run
4. test results
5. any unresolved issues

Do not merely propose code. Make the changes in the repository.
"""


def build_revision_prompt(task, review):
    return f"""
You are fixing your implementation after an independent review.

Original task:

--- TASK ---
{task}
--- END TASK ---

Reviewer findings:

--- REVIEW ---
{review}
--- END REVIEW ---

Inspect the CURRENT repository state.

Fix every valid reviewer finding that relates to the original task.

Rules:

- Do not expand scope.
- Do not undo correct existing work.
- Do not commit.
- Do not push.
- Do not change branches.
- Do not reset the working tree.
- Modify the repository directly.
- Run the relevant tests after fixing the issues.
- If reviewer feedback is merely optional or outside the task, do not implement it.

When finished, report:
1. files changed
2. fixes made
3. tests run
4. test results
5. unresolved issues
"""


def main():
    print("\nPFOS AI ORCHESTRATOR")
    print("========================================")

    status = git_status_short()

    if status:
        print("\nSTOPPED: working tree is not clean.")
        print("\nCurrent changes:")
        print(status)
        print(
            "\nCommit, stash, or remove these changes before "
            "starting an automated task."
        )
        return

    print("✓ Working tree clean")

    task = input("\nEnter task for Claude:\n> ").strip()

    if not task:
        print("No task provided.")
        return

    print("\nStarting Claude implementation...")

    claude_prompt = build_initial_claude_prompt(task)

    claude_result = run_claude(claude_prompt)

    if claude_result is None:
        return

    status = git_status_short()

    if not status:
        print("\nSTOPPED: Claude made no repository changes.")
        return

    print("\nRepository changes detected:")
    print(status)

    for round_number in range(1, MAX_REVIEW_ROUNDS + 1):

        print(
            f"\n******** REVIEW ROUND "
            f"{round_number} ********"
        )

        review = run_codex_review(task)

        if review is None:
            return

        if "STATUS: APPROVED" in review:
            print("\n========================================")
            print("READY FOR HUMAN REVIEW")
            print("========================================")
            print(
                f"Codex approved the implementation after "
                f"{round_number} review round(s)."
            )

            print("\nFinal git status:")
            print(git_status_short())

            print(
                "\nNothing was committed or pushed."
            )

            return

        if "STATUS: CHANGES_REQUESTED" not in review:
            print(
                "\nSTOPPED: Codex returned an unknown review status."
            )
            return

        if round_number == MAX_REVIEW_ROUNDS:
            print("\n========================================")
            print("STOPPED")
            print("========================================")
            print(
                "Maximum review rounds reached without approval."
            )
            return

        print(
            "\nCodex requested changes. "
            "Sending review back to Claude..."
        )

        revision_prompt = build_revision_prompt(
            task,
            review,
        )

        claude_result = run_claude(revision_prompt)

        if claude_result is None:
            return


if __name__ == "__main__":
    main()