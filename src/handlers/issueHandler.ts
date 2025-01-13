import * as core from '@actions/core';
import { handleMilestone } from './milestoneHandler';
import { ActionContext } from '../types';

export async function handleIssue(context: ActionContext): Promise<void> {
  try {
    if (!context.issue?.milestone) {
      core.info('Issue has no milestone, skipping...');
      return;
    }

    const milestoneNumber = context.issue.milestone.number;
    core.info(`Processing milestone #${milestoneNumber}`);

    // Create context for milestone handling
    const milestoneContext: ActionContext = {
      ...context,
      payload: {
        ...context.payload,
        milestone: {
          number: milestoneNumber,
          title: '', // Will be fetched by milestoneHandler
          description: null,
          due_on: null
        }
      }
    };

    await handleMilestone(milestoneContext);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}
