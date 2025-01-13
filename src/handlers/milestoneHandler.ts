import * as core from '@actions/core';
import { Context } from '@actions/github/lib/context';
import { GitHub } from '@actions/github/lib/utils';
import { generatePlanningContent } from '../templates/defaultTemplate';

interface Config {
  planningLabel: string;
  categories: string[];
}

export async function handleMilestoneEvent(
  octokit: InstanceType<typeof GitHub>,
  context: Context,
  config: Config
): Promise<void> {
  const { repo, owner } = context.repo;
  const milestone = context.payload.milestone;
  
  // Get issues for milestone
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    milestone: milestone.number,
    state: 'all'
  });
  
  // Generate planning content
  const content = generatePlanningContent(milestone, issues, config.categories);
  
  // Find existing planning issue
  const { data: existingIssues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    labels: [config.planningLabel],
    milestone: milestone.number
  });

  const planningIssue = existingIssues.find(issue => 
    issue.title.startsWith('[Planning]')
  );

  if (planningIssue) {
    // Update existing issue
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: planningIssue.number,
      body: content
    });
  } else {
    // Create new planning issue
    await octokit.rest.issues.create({
      owner,
      repo,
      title: `[Planning] ${milestone.title}`,
      body: content,
      milestone: milestone.number,
      labels: [config.planningLabel]
    });
  }
}
