# Auto Milestone Summary Action

A GitHub Action that automatically generates and updates planning issues based on milestones. When a milestone or its issues are updated, this action will create or update a planning issue that summarizes all related issues categorized by labels.

## Features

- 🔄 Automatically monitors milestone changes
- 📋 Categorizes related issues by labels
- 📝 Automatically generates or updates planning summary issues
- 🙏 Automatically thanks contributors of completed issues
- 🎯 Supports excluding pull requests from summary

## Usage

1. Create a workflow file (e.g., `.github/workflows/milestone-planning.yml`):

```yaml
name: Milestone Planning

on:
  milestone:
    types: [created, edited, deleted]
  issues:
    types: [opened, edited, deleted, transferred, milestoned, demilestoned]

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - name: Generate Milestone Planning
        uses: elliotxx/auto-milestone-summary-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          planning_label: planning
          categories: '["bug", "enhancement", "documentation"]'
```

2. The action will create a planning issue that looks like this:
   > 🔍 [View a real example](https://github.com/KusionStack/karpor/issues/721)

```markdown
# Release v1.0.0 Planning

## Overview
Progress: ███████░░░░░░░░░ 40%
- Total Issues: 5
- ✅ Completed: 2
- 🚧 In Progress: 3
- Due Date: 2025-12-31

## Description
This is our first major release with core features implemented.

## Tasks by Category

### bug (2)
- [x] #1 Fix login page crash (@user1) `bug`
- [ ] #4 Memory leak in dashboard (@user2) `bug`

### enhancement (2)
- [x] #2 Add user authentication (@user1) `enhancement`
- [ ] #3 Implement dashboard (@user3) `enhancement`

### documentation (1)
- [ ] #5 Write API documentation (@user2) `documentation`

## Contributors
Thanks to all our contributors for their efforts on completed issues:

- @user1

> Auto-generated by Auto Milestone Summary Action
> Last Updated: 2025-01-13 21:20:34
```

## Configuration

### Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `token` | GitHub token for API access | Yes | N/A |
| `planning_label` | Label to identify planning issues | No | `planning` |
| `categories` | Categories for issues (JSON array of strings) | No | `["bug", "documentation", "enhancement"]` |
| `exclude_pr` | Whether to exclude pull requests from the summary | No | `true` |

### Workflow Examples

1. **Basic Usage** - Monitor milestone and issue changes:
```yaml
name: Milestone Planning
on:
  milestone:
    types: [created, edited, deleted]
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

2. **Custom Categories** - Use your own issue categories:
```yaml
name: Milestone Planning
on:
  milestone:
    types: [created, edited, deleted]
  issues:
    types: [opened, edited, deleted, transferred, milestoned, demilestoned]
jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: elliotxx/auto-milestone-summary-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          categories: '["feature", "bug", "chore", "docs"]'
          exclude_pr: 'false'
```

## How It Works

1. When a milestone is created or updated:
   - The action checks if the milestone is open (closed milestones are skipped)
   - Creates a new planning issue or updates an existing one
   - Issues are categorized based on their labels
   - A summary is generated with progress information

2. When an issue is updated:
   - If the issue belongs to an open milestone, the corresponding planning issue is updated
   - The summary reflects the latest state of all issues
   - No action is taken for issues in closed milestones

3. Categories:
   - Issues are categorized based on their labels matching the category names
   - Issues without matching category labels go into "Uncategorized"
   - Each issue appears in the first matching category only
   - By default, uses GitHub's standard labels (`bug`, `enhancement`, `documentation`)

## Limitations

- ⚠️ Only processes open milestones

## Best Practices

1. **Label Management**:
   - Use consistent labels that match your categories
   - Consider using GitHub's default labels for better integration
   - Add custom labels only when needed for specific workflows

2. **Milestone Planning**:
   - Add clear descriptions to milestones
   - Set realistic due dates
   - Assign issues to milestones when creating them
   - Close milestones when they are completed to keep your project organized

3. **Workflow Configuration**:
   - Start with the basic workflow and add more event types as needed
   - Use custom categories that match your team's workflow
   - Consider using a dedicated label for planning issues

## License

MIT
