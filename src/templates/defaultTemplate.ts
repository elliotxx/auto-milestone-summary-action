interface Issue {
  title: string;
  number: number;
  state: string;
  labels: Array<{ name: string }>;
  assignee?: { login: string };
}

interface Milestone {
  title: string;
  due_on: string | null;
  description: string;
}

export function generatePlanningContent(
  milestone: Milestone,
  issues: Issue[],
  categories: string[]
): string {
  const categorizedIssues = categorizeIssues(issues, categories);
  
  return `
# ${milestone.title} 规划

## 概述
- 总任务数：${issues.length}
- 已完成：${issues.filter(i => i.state === 'closed').length}
- 进行中：${issues.filter(i => i.state === 'open').length}
- 截止日期：${milestone.due_on ? new Date(milestone.due_on).toLocaleDateString() : '未设置'}

${milestone.description ? `## 描述\n${milestone.description}\n` : ''}

## 任务分类
${generateCategorySection(categorizedIssues)}

> 本文档由 Auto Milestone Summary 自动生成
> 最后更新时间：${new Date().toLocaleString()}
`;
}

function categorizeIssues(issues: Issue[], categories: string[]): Record<string, Issue[]> {
  const categorized: Record<string, Issue[]> = {
    '未分类': []
  };
  
  categories.forEach(category => {
    categorized[category] = [];
  });

  issues.forEach(issue => {
    let categorized = false;
    for (const category of categories) {
      if (issue.labels.some(label => label.name.toLowerCase().includes(category.toLowerCase()))) {
        categorized[category].push(issue);
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      categorized['未分类'].push(issue);
    }
  });

  return categorized;
}

function generateCategorySection(categorizedIssues: Record<string, Issue[]>): string {
  return Object.entries(categorizedIssues)
    .filter(([_, issues]) => issues.length > 0)
    .map(([category, issues]) => `
### ${category} (${issues.length})
${issues.map(issue => `- [${issue.state === 'closed' ? 'x' : ' '}] #${issue.number} ${issue.title}${
  issue.assignee ? ` (@${issue.assignee.login})` : ''
}`).join('\n')}
`).join('\n');
}
