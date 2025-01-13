import * as core from '@actions/core';
import * as github from '@actions/github';
import { handleMilestone } from './handlers/milestoneHandler';
import { handleIssue } from './handlers/issueHandler';
import { ActionContext } from './types';

async function run(): Promise<void> {
  try {
    const context = github.context as ActionContext;

    // Handle different event types
    if (context.eventName === 'milestone') {
      await handleMilestone(context);
    } else if (context.eventName === 'issues') {
      await handleIssue(context);
    } else {
      core.info(`Event ${context.eventName} is not supported`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

run();
