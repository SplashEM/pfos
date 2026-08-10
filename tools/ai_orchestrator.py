import subprocess
import sys
from pathlib import Path


MAX_REVIEW_ROUNDS = 3
EXPECTED_BRANCH = "milestone-2-rule-engine"


CLAUDE_ALLOWED_TOOLS = (
    "Read,Write,Edit,"
    "Bash(git status:*),"
    "Bash(git diff:*),"
    "Bash(git diff --stat:*),"
    "Bash(git branch:*),"
    "Bash(git log:*),"
    "Bash(npm test:*),"
    "Bash(npm run test:*),"
    "Bash(npm run lint:*),"
    "Bash(npx vitest:*)"
)


def run_command(command, repo_path):
    return subprocess.run(
        command,
        cwd=repo_path,
        capture_output=True,
        text=True,
        shell=True,
        encoding="utf-8",
        errors="replace",
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


def run_claude(prompt, repo_path):
    print("\n========================================")
    print("CLAUDE")
    print("========================================")

    command = (
        f'claude -p --allowedTools '
        f'"{CLAUDE_ALLOWED_TOOLS}"'
    )

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

    if result.returncode != 0:
        print("Claude error:")
        print(result.stderr)
        return None

    print(result.stdout)

    return result.stdout


def run_codex_review(task, repo_path):
    print("\n========================================")
    print("CODEX REVIEW")
    print("========================================")

    review_prompt = f"""
You are the independent reviewer for an automated coding workflow.

The implementation agent was given this exact task:

--- ORIGINAL TASK ---
{task}
--- END ORIGINAL TASK ---

Review the CURRENT repository working tree against that exact task.

IMPORTANT:
- Inspect `git status --short`.
- Inspect all staged and unstaged tracked changes.
- Inspect any untracked files that are relevant to the task.
- An untracked file may be the intended deliverable. Do NOT treat a file
  as invalid merely because it is untracked.
- Do not assume changes must already be committed or staged.
- Do not request a commit, push, merge, or PR.
- Do not expand the task.
- Do not request unrelated cleanup or refactors.
- Optional improvements must not cause rejection.

Return CHANGES_REQUESTED only if there is:
1. a violation of an explicit requirement in the original task,
2. a correctness defect,
3. a meaningful regression,
4. a violation of an existing project specification relevant to the task,
5. or missing tests that are actually required to establish correctness.

If the task is fully satisfied, approve it even if the resulting files are
still untracked or uncommitted.

Your FIRST LINE must be exactly one of:

STATUS: APPROVED

or

STATUS: CHANGES_REQUESTED

Then write:

REVIEW:
<your review>

If requesting changes:
- identify the exact defect,
- identify the requirement it violates,
- request only the minimum correction necessary.
"""

    result = subprocess.run(
        "codex exec -",
        cwd=repo_path,
        input=review_prompt,
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

    output = result.stdout.strip()

    print(output)

    return output


def build_initial_claude_prompt(task):
    return f"""
You are the implementation agent working in the current PFOS repository.

Complete ONLY the following task:

--- TASK ---
{task}
--- END TASK ---

Rules:

- Read CLAUDE.md and the relevant project specifications before editing.
- Inspect the existing implementation before making changes.
- Modify the repository directly.
- Stay strictly within the requested scope.
- Do not commit.
- Do not push.
- Do not change branches.
- Do not reset or discard existing work.
- Do not modify unrelated files.
- Run the relevant tests using the tools available to you.
- If a command is unavailable, report that accurately.
- Prefer the smallest correct implementation.
- Do not begin the next milestone task.

When finished, report:
1. files changed
2. what was implemented
3. tests run
4. test results
5. any unresolved issues

Do not merely propose code.
Make the changes in the repository.
"""


def build_revision_prompt(task, review):
    return f"""
You are fixing the CURRENT repository implementation after
an independent review.

Original task:

--- TASK ---
{task}
--- END TASK ---

Reviewer findings:

--- REVIEW ---
{review}
--- END REVIEW ---

Inspect the current repository state and fix every valid reviewer
finding that relates to the original task.

Rules:

- Do not expand scope.
- Do not undo correct existing work.
- Do not commit.
- Do not push.
- Do not change branches.
- Do not reset the working tree.
- Modify the repository directly.
- Run the relevant tests after fixing issues.
- Ignore optional reviewer suggestions outside the task.

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

    if len(sys.argv) != 2:
        print(
            "Usage:\n"
            "  python tools\\ai_orchestrator.py <PFOS_REPO_PATH>"
        )
        return

    repo_path = Path(sys.argv[1]).resolve()

    if not repo_path.exists():
        print("\nSTOPPED: repository does not exist:")
        print(repo_path)
        return

    if not (repo_path / ".git").exists():
        print("\nSTOPPED: target does not appear to be a Git worktree.")
        print(repo_path)
        return

    print("Target repository:")
    print(repo_path)

    branch = git_current_branch(repo_path)

    if branch != EXPECTED_BRANCH:
        print("\nSTOPPED: wrong branch.")
        print(f"Expected: {EXPECTED_BRANCH}")
        print(f"Actual:   {branch}")
        return

    print(f"✓ Correct branch: {branch}")

    status = git_status_short(repo_path)

    if status:
        print("\nSTOPPED: target working tree is not clean.")
        print("\nCurrent changes:")
        print(status)
        print(
            "\nCommit, stash, or remove these changes "
            "before starting an automated task."
        )
        return

    print("✓ Working tree clean")

    print("\nEnter task for Claude.")
    print("Paste the full multi-line task below.")
    print("When finished, type END on a new line.\n")

    task_lines = []

    while True:
        line = input()

        if line.strip() == "END":
            break

        task_lines.append(line)

    task = "\n".join(task_lines).strip()

    if not task:
        print("No task provided.")
        return

    print("\nStarting Claude implementation...")

    claude_prompt = build_initial_claude_prompt(task)

    claude_result = run_claude(
        claude_prompt,
        repo_path,
    )

    if claude_result is None:
        return

    status = git_status_short(repo_path)

    if not status:
        print("\nSTOPPED: Claude made no repository changes.")
        return

    print("\nRepository changes detected:")
    print(status)

    for round_number in range(
        1,
        MAX_REVIEW_ROUNDS + 1,
    ):
        print(
            f"\n******** REVIEW ROUND "
            f"{round_number} ********"
        )

        review = run_codex_review(
            task,
            repo_path,
        )

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
            print(git_status_short(repo_path))

            print("\nNothing was committed or pushed.")

            return

        if "STATUS: CHANGES_REQUESTED" not in review:
            print(
                "\nSTOPPED: Codex returned an unknown "
                "review status."
            )
            return

        if round_number == MAX_REVIEW_ROUNDS:
            print("\n========================================")
            print("STOPPED")
            print("========================================")
            print(
                "Maximum review rounds reached "
                "without approval."
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

        claude_result = run_claude(
            revision_prompt,
            repo_path,
        )

        if claude_result is None:
            return


if __name__ == "__main__":
    main()