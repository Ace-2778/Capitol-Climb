# 快速启动指南

## 🚀 5分钟启动游戏

### 步骤 1: 安装依赖

在项目根目录（gp文件夹）下打开终端，运行：

```bash
npm install
```

或者使用其他包管理器：
```bash
yarn install
# 或
pnpm install
```

### 步骤 2: 启动开发服务器

```bash
npm run dev
```

### 步骤 3: 打开浏览器

访问 http://localhost:3000

你应该会看到角色创建界面！

---

## 📂 项目结构一览

```
gp/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主游戏页面
│   └── globals.css        # 全局样式
│
├── components/            # React UI组件
│   ├── CharacterCreation.tsx  # 角色创建
│   ├── GameOverScreen.tsx     # 游戏结束
│   ├── NationalPanel.tsx      # 国家环境面板
│   ├── CongressPanel.tsx      # 国会立法机构
│   ├── PlayerPanel.tsx        # 玩家信息面板
│   ├── PartyPanel.tsx         # 党派系统
│   ├── EventCard.tsx          # 事件卡片
│   └── OpponentList.tsx       # 对手列表
│
├── store/                 # 状态管理
│   └── gameStore.ts       # Zustand游戏状态store
│
├── lib/                   # 核心逻辑
│   └── gameEngine.ts      # 游戏引擎（事件/选举/AI/晋升/失败）
│
├── types/                 # TypeScript类型
│   └── game.ts           # 所有游戏类型定义
│
├── data/                  # 游戏数据
│   └── events.ts         # 30+ 政治事件配置
│
├── package.json          # 依赖配置
├── tsconfig.json         # TypeScript配置
├── tailwind.config.js    # TailwindCSS配置
├── next.config.js        # Next.js配置
├── README.md             # 完整文档
├── DESIGN.md             # 系统设计文档
└── .gitignore            # Git忽略文件
```

---

## 🎮 游戏玩法快速上手

### 1. 创建角色
- 输入姓名
- 选择党派（民主党/共和党）
- 选择派系（进步派/温和派/保守派/建制派/民粹派）
- 选择起始州

### 2. 理解核心资源
| 资源 | 作用 |
|------|------|
| 声望 | 晋升和选举的关键 |
| 民意 | 选举胜负的核心 |
| 资金 | 应对事件成本和竞选开支 |
| 人脉 | 党内关系和事件触发 |
| 媒体 | 影响选举和事件权重 |
| 黑料 | 对抗对手的筹码 |
| 风险 | 过高会触发失败 |

### 3. 处理事件
- 每回合出现3个随机事件
- 每个事件有2-4个选项
- 选项会消耗资源并产生效果
- 部分选项有概率分支（不确定结果）
- 必须处理完所有事件才能进入下一回合

### 4. 参加选举
- 每8回合进行一次选举
- 选举按钮会在倒计时归零时出现
- 得票率基于：民意、资金、背书、媒体
- 落选即游戏结束

### 5. 晋升到更高职位
- 满足条件后点击"尝试晋升"
- 晋升路径：地方议会 → 州议员 → 联邦议员 → 参议员 → 总统
- 每个职位都有最低要求（见玩家面板）

### 6. 避免失败
- 保持声望 > 10
- 保持民意 > 15
- 保持资金 > 5（非首任期）
- 保持党内影响力 > 5（非地方议会）
- 避免高风险+丑闻标记组合

---

## 🛠 开发命令

```bash
# 启动开发服务器（热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

---

## 💾 游戏存档

游戏会**自动保存**到浏览器的 localStorage，包括：
- 玩家状态
- 国家环境
- 当前事件
- 历史记录
- 消息日志

**清除存档**：打开浏览器开发者工具（F12） → Application/存储 → Local Storage → 删除 `politicalGameSave`

---

## 🐛 常见问题

### Q: 为什么安装依赖失败？
A: 确保 Node.js 版本 >= 18.0.0，运行 `node -v` 检查版本。

### Q: 页面空白或报错？
A: 
1. 检查浏览器控制台（F12）的错误信息
2. 确保所有依赖都已安装
3. 尝试删除 `.next` 文件夹并重新运行 `npm run dev`

### Q: 游戏卡在角色创建界面？
A: 检查是否有JavaScript错误，确保浏览器支持现代JS特性。

### Q: 事件不显示？
A: 可能是职位或条件不满足，查看 `data/events.ts` 中的事件触发条件。

### Q: 选举按钮不出现？
A: 确保 `turnsUntilElection` 已归零，查看玩家面板的"距离下次选举"。

---

## 📊 游戏统计

- **事件总数**: 30+
- **对手类型**: 3种（民粹/建制/阴谋）
- **晋升路径**: 6级（地方 → 总统）
- **失败条件**: 7种
- **资源类型**: 8种
- **党派系统**: 2党派 × 5派系

---

## 🔧 自定义开发

### 添加新事件
编辑 `data/events.ts`，参考现有事件格式添加：
```typescript
{
  id: 'my_new_event',
  title: '事件标题',
  description: '事件描述',
  category: EventCategory.MEDIA,
  weight: 1,
  baseWeight: 1,
  options: [
    // 选项配置
  ]
}
```

### 调整游戏难度
编辑 `store/gameStore.ts` 中的 `createInitialPlayer` 函数，修改初始资源值。

### 修改选举周期
编辑 `store/gameStore.ts`，搜索 `turnsUntilElection: 8` 修改回合数。

---

## 📱 响应式支持

游戏支持以下设备：
- ✅ 桌面（推荐 1920×1080）
- ✅ 笔记本（1366×768）
- ✅ 平板横屏（768×1024）
- ⚠️ 手机（体验较差，信息量大）

---

## 🎨 主题定制

编辑 `tailwind.config.js` 修改配色：
```javascript
theme: {
  extend: {
    colors: {
      democrat: '#1e40af',    // 民主党蓝
      republican: '#dc2626',  // 共和党红
      neutral: '#6b7280',     // 中性灰
    },
  },
}
```

---

## 📈 性能优化建议

1. **生产构建**: 使用 `npm run build` 构建优化版本
2. **浏览器**: 推荐 Chrome/Edge 最新版
3. **存档清理**: 定期清理旧存档释放空间

---

## 🤝 贡献代码

欢迎提交 Pull Request！

贡献流程：
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📞 联系方式

- 问题反馈：GitHub Issues
- 功能建议：GitHub Discussions

---

## 📜 许可证

MIT License - 详见 LICENSE 文件

---

**祝你在政治权力游戏中步步高升！** 🏆
