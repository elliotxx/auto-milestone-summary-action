import * as core from '@actions/core';
import * as github from '@actions/github';
import { generatePlanningContent } from '../templates/defaultTemplate';
import { ActionContext, Issue, Milestone } from '../types';

// GitHub default labels
const DEFAULT_CATEGORIES = [
  'bug',
  'documentation',
  'enhancement'
];

export async function handleMilestone(context: ActionContext): Promise<void> {
  try {
    const token = core.getInput('token', { required: true });
    const planningLabel = core.getInput('planning_label') || 'planning';
    const categoriesInput = core.getInput('categories') || JSON.stringify(DEFAULT_CATEGORIES);
    const categories = JSON.parse(categoriesInput) as string[];

    const octokit = github.getOctokit(token);
    const { owner, repo } = context.repo;
    const milestoneNumber = context.payload.milestone?.number;

    if (!milestoneNumber) {
      core.info('No milestone number found in context');
      return;
    }

    // Get milestone details
    const { data: milestone } = await octokit.rest.issues.getMilestone({
      owner,
      repo,
      milestone_number: milestoneNumber
    });

    // Get all issues for this milestone
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      milestone: String(milestoneNumber),
      state: 'all'
    });

    // Convert GitHub API response to our Issue type
    const formattedIssues: Issue[] = issues.map(issue => ({
      title: issue.title,
      number: issue.number,
      state: issue.state,
      labels: issue.labels.map(label => ({
        name: typeof label === 'string' ? label : (label.name || '')
      })).filter(label => label.name !== ''),
      assignee: issue.assignee ? { login: issue.assignee.login } : undefined
    }));

    // Generate planning content
    const content = generatePlanningContent(
      {
        title: milestone.title,
        due_on: milestone.due_on,
        description: milestone.description || '',
        number: milestone.number
      },
      formattedIssues,
      categories
    );

    // Find existing planning issue
    const { data: existingIssues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      labels: planningLabel,
      state: 'open'
    });

    const planningIssue = existingIssues.find(issue => 
      issue.title.includes(milestone.title)
    );

    if (planningIssue) {
      // Update existing issue
      await octokit.rest.issues.update({
        owner,
        repo,
        issue_number: planningIssue.number,
        body: content
      });
      core.info(`Updated planning issue #${planningIssue.number}`);
    } else {
      // Create new planning issue
      const { data: newIssue } = await octokit.rest.issues.create({
        owner,
        repo,
        title: `Planning: ${milestone.title}`,
        body: content,
        labels: [planningLabel]
      });
      core.info(`Created new planning issue #${newIssue.number}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}
