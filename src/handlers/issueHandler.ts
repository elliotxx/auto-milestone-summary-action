import { Context } from '@actions/github/lib/context';
import { GitHub } from '@actions/github/lib/utils';
import { handleMilestoneEvent } from './milestoneHandler';

interface Config {
  planningLabel: string;
  categories: string[];
}

export async function handleIssueEvent(
  octokit: InstanceType<typeof GitHub>,
  context: Context,
  config: Config
): Promise<void> {
  const issue = context.payload.issue;
  
  // Only process if issue has a milestone
  if (issue.milestone) {
    // Reuse milestone handler logic
    await handleMilestoneEvent(octokit, {
      ...context,
      payload: { milestone: issue.milestone }
    }, config);
  }
}
