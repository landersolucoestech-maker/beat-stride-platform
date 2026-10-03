# ADR-002: Single Branch Policy

Status: Accepted

## Decision
The repository uses exactly one branch: `main`. Development, fixes, refactors, migrations, releases, and agent work all occur on this branch. Additional branches and branch-backed worktrees are prohibited unless the product owner explicitly changes this policy.

## Reversibility
Use small validated commits, immutable deployment artifacts, mission checkpoints, and `git revert`. Do not use additional branches as a rollback mechanism.
