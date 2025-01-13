import { Context } from '@actions/github/lib/context';

export interface Issue {
  title: string;
  number: number;
  state: string;
  labels: Array<{ name: string }>;
  assignee?: { login: string };
}

export interface Milestone {
  title: string;
  due_on: string | null;
  description: string;
  number: number;
}

export interface CategorizedIssues {
  [key: string]: Issue[];
}

export interface ActionContext extends Omit<Context, 'issue' | 'repo'> {
  issue?: {
    number: number;
    milestone?: {
      number: number;
    };
  };
  repo: {
    owner: string;
    repo: string;
  };
  payload: {
    milestone?: {
      number: number;
      title: string;
      description: string | null;
      due_on: string | null;
    };
    issue?: {
      number: number;
      milestone?: {
        number: number;
      };
    };
  };
}
