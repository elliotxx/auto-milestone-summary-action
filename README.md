# Auto Milestone Summary Action

A GitHub Action that automatically generates and updates planning issues for milestones. 
A GitHub Action that automatically monitors milestone changes, categorizes related issues by labels, and generates/updates a planning summary issue to help teams better track and manage project progress.

## Features

- Auto-create and update milestone planning
- Categorize issues by labels
- Real-time planning updates
- Support custom templates and categories

## Usage

1. Create `.github/workflows/milestone-planning.yml` in your repository:

```yaml
name: Milestone Planning

on:
  milestone:
    types: [created, edited, closed, deleted]
  issues:
    types: [opened, edited, deleted, transferred, milestoned, demilestoned]

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: elliotxx/auto-milestone-summary-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| token | GitHub token for API authentication | Yes | - |
| planning_label | Label for identifying planning issues | No | planning |
| categories | Issue categories as JSON array | No | ["bug", "feature", "documentation", "maintenance"] |
| template | Custom template file path | No | - |

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Custom Categories Example

```yaml
- uses: elliotxx/auto-milestone-summary-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    categories: '["bug", "feature", "enhancement", "documentation"]'
```

## Output Example

The planning issue will contain:

- Milestone overview (total issues, completion status)
- Categorized task list
- Task status and assignees
- Auto-update timestamp

## License

MIT
