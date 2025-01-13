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
    // Get inputs from environment variables
    const token = process.env.INPUT_TOKEN || core.getInput('token', { required: true });
    const planningLabel = process.env.INPUT_PLANNING_LABEL || core.getInput('planning_label') || 'planning';
    const categoriesInput = process.env.INPUT_CATEGORIES || core.getInput('categories') || JSON.stringify(DEFAULT_CATEGORIES);
    const categories = JSON.parse(categoriesInput) as string[];

    // Log key parameters
    core.info('Action Parameters:');
    core.info(`- Planning Label: ${planningLabel}`);
    core.info(`- Categories: ${JSON.stringify(categories)}`);
    core.info(`- Event: ${context.eventName}`);

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

    // Log milestone info
    core.info('Milestone Info:');
    core.info(`- Title: ${milestone.title}`);
    core.info(`- Number: ${milestone.number}`);
    core.info(`- State: ${milestone.state}`);
    core.info(`- Due Date: ${milestone.due_on || 'Not set'}`);

    // Skip if milestone is closed
    if (milestone.state === 'closed') {
      core.info(`Milestone #${milestoneNumber} is closed, skipping...`);
      return;
    }

    // Get all issues for this milestone
    const { data: allIssues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      milestone: String(milestoneNumber),
      state: 'all'
    });

    // Filter out pull requests and log details for debugging
    const issues = allIssues.filter(item => {
      // Log item details for debugging
      core.debug(`Processing item #${item.number}:`);
      core.debug(`- Has PR field: ${!!item.pull_request}`);
      core.debug(`- Type: ${item.pull_request ? 'PR' : 'Issue'}`);
      core.debug(`- Title: ${item.title}`);
      core.debug(`- Labels: ${item.labels.map((l: any) => l.name).join(', ')}`);
      
      // Check if it's a pull request using multiple indicators
      const isPR = item.pull_request !== undefined || // Has PR field
                  item.html_url?.includes('/pull/') || // URL contains /pull/
                  'pull_request' in item; // Has PR property
      
      return !isPR;
    });

    // Log issues info
    core.info('Issues Info:');
    core.info(`- Total Items: ${allIssues.length}`);
    core.info(`- Issues (excluding PRs): ${issues.length}`);
    core.info(`- Pull Requests: ${allIssues.length - issues.length}`);
    core.info(`- Open Issues: ${issues.filter(i => i.state === 'open').length}`);
    core.info(`- Closed Issues: ${issues.filter(i => i.state === 'closed').length}`);

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
