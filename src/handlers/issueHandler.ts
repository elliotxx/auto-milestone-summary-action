import * as core from '@actions/core';
import * as github from '@actions/github';
import { handleMilestone } from './milestoneHandler';
import { ActionContext } from '../types';

export async function handleIssue(context: ActionContext): Promise<void> {
  try {
    // Log issue event info and context structure
    core.info('Issue Event Info and Context Structure:');
    core.info(JSON.stringify(context, null, 2));

    // If the issue has a milestone, handle it
    if (context.payload.issue?.milestone) {
      core.info('Issue has milestone, updating milestone planning...');
      await handleMilestone({
        ...context,
        payload: {
          ...context.payload,
          milestone: context.payload.issue.milestone
        }
      });
    } else {
      core.info('Issue has no milestone, skipping...');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}
