import * as core from '@actions/core';
import { Issue, Milestone } from '../types';

// Generate progress bar
function generateProgressBar(completed: number, total: number, width: number = 20): string {
  const progress = Math.round((completed / total) * width);
  const filled = '█'.repeat(progress);
  const empty = '░'.repeat(width - progress);
  const percentage = Math.round((completed / total) * 100);
  return `${filled}${empty} ${percentage}%`;
}

// Format date to locale string
function formatDate(date: string | null): string {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Generate category section
function generateCategorySection(
  issues: Issue[],
  category: string
): string {
  // Filter issues by category (case-insensitive)
  const categoryIssues = issues.filter(issue =>
    issue.labels.some(label => 
      label.name.toLowerCase() === category.toLowerCase()
    )
  );

  // Log category info
  core.info(`Category "${category}": ${categoryIssues.length} issues`);
  if (categoryIssues.length > 0) {
    core.info('Issues in this category:');
    categoryIssues.forEach(issue => {
      core.info(`- #${issue.number} (${issue.state})`);
      core.info(`  Labels: ${issue.labels.map(l => l.name).join(', ')}`);
    });
  }

  if (categoryIssues.length === 0) return '';

  const issuesList = categoryIssues
    .map(issue => {
      const checkbox = issue.state === 'closed' ? '[x]' : '[ ]';
      const assigneeText = issue.assignee ? ` (@${issue.assignee.login})` : '';
      const labels = issue.labels
        .map(label => `\`${label.name}\``)
        .join(' ');
      const labelsText = labels ? ` ${labels}` : '';
      return `- ${checkbox} #${issue.number} ${assigneeText}${labelsText}`;
    })
    .join('\n');

  return `### ${category} (${categoryIssues.length})
${issuesList}
`;
}

// Generate uncategorized section
function generateUncategorizedSection(
  issues: Issue[],
  categories: string[]
): string {
  // Filter issues that don't belong to any category (case-insensitive)
  const uncategorizedIssues = issues.filter(issue =>
    !issue.labels.some(label =>
      categories.some(category =>
        label.name.toLowerCase() === category.toLowerCase()
      )
    )
  );

  // Log uncategorized info
  core.info(`Uncategorized issues: ${uncategorizedIssues.length}`);
  if (uncategorizedIssues.length > 0) {
    core.info('Issues without category:');
    uncategorizedIssues.forEach(issue => {
      core.info(`- #${issue.number} (${issue.state})`);
      core.info(`  Labels: ${issue.labels.map(l => l.name).join(', ')}`);
    });
  }

  if (uncategorizedIssues.length === 0) return '';

  const issuesList = uncategorizedIssues
    .map(issue => {
      const checkbox = issue.state === 'closed' ? '[x]' : '[ ]';
      const assigneeText = issue.assignee ? ` (@${issue.assignee.login})` : '';
      const labels = issue.labels
        .map(label => `\`${label.name}\``)
        .join(' ');
      const labelsText = labels ? ` ${labels}` : '';
      return `- ${checkbox} #${issue.number} ${assigneeText}${labelsText}`;
    })
    .join('\n');

  return `### Uncategorized (${uncategorizedIssues.length})
${issuesList}
`;
}

export function generatePlanningContent(
  milestone: Milestone,
  issues: Issue[],
  categories: string[]
): string {
  core.info('\nGenerating planning content...');
  core.info(`Categories: ${categories.join(', ')}`);
  
  // Calculate statistics
  const totalIssues = issues.length;
  const completedIssuesCount = issues.filter(issue => issue.state === 'closed').length;
  const inProgressIssues = totalIssues - completedIssuesCount;

  // Log statistics
  core.info('\nIssue Statistics:');
  core.info(`- Total Issues: ${totalIssues}`);
  core.info(`- Completed: ${completedIssuesCount}`);
  core.info(`- In Progress: ${inProgressIssues}`);
  core.info(`- Progress: ${Math.round((completedIssuesCount / totalIssues) * 100)}%`);

  const progressBar = generateProgressBar(completedIssuesCount, totalIssues);
  const dueDate = formatDate(milestone.due_on);

  // Generate main content
  let content = `# ${milestone.title} Planning

## Overview
- Progress: ${progressBar}
- Total Issues: ${totalIssues}
  - ✅ Completed: ${completedIssuesCount}
  - 🚧 In Progress: ${inProgressIssues}
- Due Date: ${dueDate}

## Description
${milestone.description || 'No description provided.'}

## Tasks by Category
`;

  core.info('\nProcessing categories...');
  // Generate sections for each category
  for (const category of categories) {
    const section = generateCategorySection(issues, category);
    if (section) {
      content += '\n' + section;
    }
  }

  // Generate uncategorized section
  const uncategorizedSection = generateUncategorizedSection(issues, categories);
  if (uncategorizedSection) {
    content += '\n' + uncategorizedSection;
  }

  // Add contributors section (only for completed issues)
  const completedIssues = issues.filter((issue: Issue) => issue.state === 'closed');
  const contributors = new Set(completedIssues
    .filter((issue: Issue) => issue.assignee)
    .map((issue: Issue) => issue.assignee!.login)
  );

  if (contributors.size > 0) {
    content += '\n## Contributors\n';
    content += 'Thanks to all our contributors for their efforts on completed issues:\n\n';
    contributors.forEach(contributor => {
      content += `- @${contributor}\n`;
    });
  }

  // Add footer
  content += `\n---
> 🤖 Auto-generated by [Auto Milestone Summary Action](https://github.com/marketplace/actions/auto-milestone-summary-action)
> Last Updated: ${new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })}
> ⚠️ Please do not modify this issue manually, it will be automatically updated.`;

  core.info('\nPlanning content generated successfully.');
  return content;
}
