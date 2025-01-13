# Auto Milestone Summary

自动为 GitHub 里程碑生成和更新规划 issue 的 GitHub Action。

## 功能

- 自动创建和更新里程碑规划
- 根据标签分类 issues
- 实时更新规划内容
- 支持自定义模板和分类

## 使用方法

1. 在你的仓库中创建 `.github/workflows/milestone-planning.yml`：

```yaml
name: Milestone Planning

on:
  milestone:
    types: [created, edited, closed, deleted]
  issues:
    types: [opened, edited, deleted, transferred, milestoned, demilestoned]

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: your-username/auto-milestone-summary-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## 配置选项

| 参数 | 描述 | 必填 | 默认值 |
|------|------|------|--------|
| token | GitHub token | 是 | - |
| planning_label | 规划 issue 的标签 | 否 | planning |
| categories | Issue 分类（JSON 数组） | 否 | ["bug", "feature", "documentation", "maintenance"] |
| template | 自定义模板文件路径 | 否 | - |

## 开发

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 构建
npm run build
```

## 自定义分类

你可以通过 `categories` 参数自定义 issue 分类：

```yaml
- uses: your-username/auto-milestone-summary-action@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    categories: '["优化", "新功能", "修复", "文档"]'
```

## 输出示例

规划 issue 会包含以下内容：

- 里程碑概述（总任务数、完成情况等）
- 按分类组织的任务列表
- 任务状态和负责人
- 自动更新时间

## License

MIT
