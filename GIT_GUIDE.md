# Git 提交指南

## 首次推送到 GitHub

### 1. 初始化 Git 仓库（如果还未初始化）

```bash
git init
```

### 2. 添加所有文件到暂存区

```bash
git add .
```

### 3. 创建初始提交

```bash
git commit -m "feat: 初始版本 - 完整游戏系统"
```

### 4. 在 GitHub 上创建新仓库

访问 https://github.com/new 创建一个新仓库，名称建议为 `political-power-game`

**注意**：不要勾选 "Initialize this repository with a README"

### 5. 关联远程仓库

```bash
git remote add origin https://github.com/你的用户名/political-power-game.git
```

### 6. 推送到 GitHub

```bash
git branch -M main
git push -u origin main
```

---

## 后续更新流程

### 添加新功能

```bash
# 查看当前状态
git status

# 添加修改的文件
git add .

# 提交
git commit -m "feat: 添加XXX功能"

# 推送
git push
```

### 提交信息规范

- `feat: 新功能` - 添加新功能
- `fix: 修复bug` - 修复问题
- `docs: 文档` - 文档更新
- `style: 格式` - 代码格式调整（不影响功能）
- `refactor: 重构` - 代码重构
- `perf: 性能` - 性能优化
- `test: 测试` - 添加测试
- `chore: 构建` - 构建工具或辅助工具变动

### 示例

```bash
git add .
git commit -m "feat: 添加辩论系统"
git push
```

---

## 分支管理（可选）

### 创建功能分支

```bash
git checkout -b feature/新功能名称
# 开发...
git add .
git commit -m "feat: 实现新功能"
git push -u origin feature/新功能名称
```

### 合并到主分支

```bash
git checkout main
git merge feature/新功能名称
git push
```

---

## 常用命令

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 撤销工作区修改
git checkout -- 文件名

# 撤销暂存区
git reset HEAD 文件名

# 查看远程仓库
git remote -v

# 拉取最新代码
git pull
```

---

## 检查清单

推送前确认：

- [ ] 已删除敏感信息（API密钥、个人信息等）
- [ ] README.md 中的链接已更新为实际仓库地址
- [ ] LICENSE 文件中的作者名已修改
- [ ] .gitignore 正常工作（node_modules 未被提交）
- [ ] 代码可以正常运行（`npm run dev` 无错误）
- [ ] 提交信息清晰明确

推送成功后：

- [ ] 在 GitHub 仓库设置中添加描述
- [ ] 添加主题标签（topics）：`game`, `typescript`, `nextjs`, `react`, `political-simulation`
- [ ] 检查 README 显示是否正常
- [ ] 测试 Issues 和 PR 模板是否有效
