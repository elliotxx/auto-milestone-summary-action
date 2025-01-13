# Auto Milestone Summary Action

A GitHub Action that automatically generates and updates planning issues for milestones.

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
      - uses: your-username/auto-milestone-summary-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration

| Parameter | Description | Required | Default |
|-----------|-------------|----------|---------|
| token | GitHub token | Yes | - |
| planning_label | Planning issue label | No | planning |
| categories | Issue categories (JSON array) | No | ["bug", "feature", "documentation", "maintenance"] |
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

## Custom Categories

You can customize issue categories using the `categories` parameter:

```yaml
- uses: your-username/auto-milestone-summary-action@v1
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
