import { generatePlanningContent } from '../src/templates/defaultTemplate';

describe('Planning Content Generation', () => {
  it('should generate correct planning content', () => {
    const milestone = {
      title: 'Test Milestone',
      due_on: '2025-12-31',
      description: 'Test Description'
    };
    
    const issues = [
      { 
        title: 'Bug 1',
        number: 1,
        state: 'open',
        labels: [{ name: 'bug' }],
        assignee: { login: 'user1' }
      },
      {
        title: 'Feature 1',
        number: 2,
        state: 'closed',
        labels: [{ name: 'feature' }]
      }
    ];
    
    const content = generatePlanningContent(milestone, issues, ['bug', 'feature']);
    
    expect(content).toContain('Test Milestone');
    expect(content).toContain('总任务数：2');
    expect(content).toContain('@user1');
    expect(content).toContain('[x] #2 Feature 1');
    expect(content).toContain('[ ] #1 Bug 1');
  });
});
