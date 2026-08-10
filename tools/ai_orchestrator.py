import subprocess


MAX_REVIEW_ROUNDS = 3


def run_claude(prompt):
    print("\n==============================")
    print("CLAUDE")
    print("==============================")

    result = subprocess.run(
        "claude -p",
        input=prompt,
        capture_output=True,
        text=True,
        shell=True
    )

    if result.returncode != 0:
        print("Claude error:")
        print(result.stderr)
        return None

    print(result.stdout)
    return result.stdout


def run_codex(prompt):
    print("\n==============================")
    print("CODEX REVIEW")
    print("==============================")

    result = subprocess.run(
        "codex exec -",
        input=prompt,
        capture_output=True,
        text=True,
        shell=True
    )

    if result.returncode != 0:
        print("Codex error:")
        print(result.stderr)
        return None

    print(result.stdout)
    return result.stdout


def build_review_prompt(task, claude_response):
    return f"""
You are the independent code reviewer.

The original task was:

--- ORIGINAL TASK ---
{task}
--- END ORIGINAL TASK ---

Claude's current solution is:

--- CLAUDE RESPONSE ---
{claude_response}
--- END CLAUDE RESPONSE ---

Review the solution carefully.

Check:
1. Does it satisfy every requirement?
2. Are there correctness problems?
3. Are important edge cases missing?
4. Is the implementation reasonable?
5. Does anything conflict with the stated project constraints?

Your first line MUST be exactly one of these:

STATUS: APPROVED

or

STATUS: CHANGES_REQUESTED

Then write:

REVIEW:
<your review>

If changes are needed, clearly state what Claude must fix.
"""


def build_revision_prompt(task, previous_response, codex_review):
    return f"""
You are revising your previous solution after an independent code review.

Original task:

--- ORIGINAL TASK ---
{task}
--- END ORIGINAL TASK ---

Your previous solution:

--- PREVIOUS SOLUTION ---
{previous_response}
--- END PREVIOUS SOLUTION ---

Independent reviewer feedback:

--- REVIEW ---
{codex_review}
--- END REVIEW ---

Revise your solution to address every valid reviewer concern.

Do not ignore requested changes.

Return the complete improved solution, not just a description of the changes.
"""


def main():
    task = """
Create a Python function called divide_money.

Requirements:
- Accept total_cents and number_of_people.
- Both arguments must be integers.
- Return the amount each person receives.
- Money must never use floating-point arithmetic.
- If the amount cannot divide evenly, the function must return a list
  distributing every cent.
- The returned list must sum exactly to total_cents.
- number_of_people must be greater than zero.

IMPORTANT FIRST ATTEMPT INSTRUCTION:
For your first solution, intentionally make ONE obvious mistake:
use floating-point division.

Do not mention that the mistake is intentional.
Present the solution normally.
"""

    print("\nStarting automated Claude <-> Codex review loop.")

    claude_response = run_claude(task)

    if claude_response is None:
        return

    for round_number in range(1, MAX_REVIEW_ROUNDS + 1):

        print(f"\n******** REVIEW ROUND {round_number} ********")

        review_prompt = build_review_prompt(
            task,
            claude_response
        )

        codex_review = run_codex(review_prompt)

        if codex_review is None:
            return

        if "STATUS: APPROVED" in codex_review:
            print("\n==============================")
            print("APPROVED")
            print("==============================")
            print(
                f"Codex approved Claude's solution "
                f"after {round_number} review round(s)."
            )
            return

        if "STATUS: CHANGES_REQUESTED" not in codex_review:
            print("\nERROR:")
            print(
                "Codex did not return a recognized review status."
            )
            return

        if round_number == MAX_REVIEW_ROUNDS:
            print("\n==============================")
            print("STOPPED")
            print("==============================")
            print(
                "Maximum review rounds reached without approval."
            )
            return

        print("\nChanges requested.")
        print("Sending Codex feedback back to Claude automatically...")

        revision_prompt = build_revision_prompt(
            task,
            claude_response,
            codex_review
        )

        claude_response = run_claude(revision_prompt)

        if claude_response is None:
            return


if __name__ == "__main__":
    main()