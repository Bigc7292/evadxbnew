# Branch Protection & PR Workflow Setup

## PR Workflow Template Created

A GitHub Actions workflow has been added at .github/workflows/pr.yml that will:
- Run on all PRs to master
- Run 
pm ci, 
pm run build, and 
pm run lint
- Upload build artifacts for review

## Manual Branch Protection Setup

Since the GitHub CLI is not installed, please set up branch protection manually:

### Steps:
1. Go to: https://github.com/Bigc7292/evadxbnew/settings/branches
2. Click "Add branch protection rule"
3. Configure the following settings:

#### Branch name pattern:
`
master
`

#### Protection rules to enable:
- [ ] Require a pull request before merging
  - [ ] Require approvals: 1
  - [ ] Dismiss stale pull request approvals when new commits are pushed
- [ ] Require status checks to pass before merging
  - [ ] Require branches to be up to date before merging
  - [ ] Status checks: uild-and-verify
- [ ] Require conversation resolution before merging
- [ ] Do not allow bypassing the above settings

#### Optional (recommended):
- [ ] Require linear history
- [ ] Include administrators in restrictions

### Click "Create" to save the rule.

## Workflow Benefits
- Every PR to master will trigger automated build and lint checks
- Merges are blocked until checks pass
- Requires at least 1 approval before merging
- Enforces clean, reviewed code on the main branch
