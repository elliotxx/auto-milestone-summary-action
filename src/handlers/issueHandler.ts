import * as core from '@actions/core';
import * as github from '@actions/github';
import { handleMilestone } from './milestoneHandler';
import { ActionContext } from '../types';

export async function handleIssue(context: ActionContext): Promise<void> {
  try {
    // Log issue event info
    core.info('Issue Event Info:');
    core.info(`- Issue Number: ${context.payload.issue?.number}`);
    core.info(`- Milestone Number: ${context.payload.issue?.milestone?.number}`);

    // Check if the issue has a milestone
    const milestoneNumber = context.payload.issue?.milestone?.number;
    const oldMilestoneNumber = context.payload.changes?.milestone?.from?.number;

    if (!milestoneNumber && !oldMilestoneNumber) {
      core.info('Issue has no milestone, skipping...');
      return;
    }

    // Handle both current and old milestone if they exist
    if (milestoneNumber) {
      core.info('Issue has milestone, updating milestone planning...');
      await handleMilestone({ ...context, payload: { milestone: { number: milestoneNumber } } });
    }

    if (oldMilestoneNumber) {
      core.info('Issue had old milestone, updating old milestone planning...');
      await handleMilestone({ ...context, payload: { milestone: { number: oldMilestoneNumber } } });
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}
