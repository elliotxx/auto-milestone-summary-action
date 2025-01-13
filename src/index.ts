import * as core from '@actions/core';
import * as github from '@actions/github';
import { handleMilestoneEvent } from './handlers/milestoneHandler';
import { handleIssueEvent } from './handlers/issueHandler';

async function run(): Promise<void> {
  try {
    const token = core.getInput('token');
    const planningLabel = core.getInput('planning_label');
    const categories = JSON.parse(core.getInput('categories'));
    
    const octokit = github.getOctokit(token);
    const context = github.context;
    
    core.debug(`Event name: ${context.eventName}`);
    
    switch (context.eventName) {
      case 'milestone':
        await handleMilestoneEvent(octokit, context, { planningLabel, categories });
        break;
      case 'issues':
        await handleIssueEvent(octokit, context, { planningLabel, categories });
        break;
      default:
        core.warning(`Unsupported event: ${context.eventName}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
