# 政治权力游戏 | Political Power Game

🎮 一个深度模拟美国政治权谋的网页游戏，玩家从基层政治人物一步步爬升到权力顶峰。

![Game Preview](https://img.shields.io/badge/status-MVP-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 目录

- [游戏特色](#游戏特色)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [游戏机制](#游戏机制)
- [系统架构](#系统架构)
- [项目结构](#项目结构)
- [开发路线图](#开发路线图)

## 🎯 游戏特色

### 核心玩法
- **真实的政治晋升路径**：从地方议会 → 州议员 → 联邦众议员 → 参议员 → 总统
- **30+ 随机事件**：媒体、党内斗争、对手攻击、丑闻、机遇等多种事件类型
- **多维度资源管理**：声望、民意、资金、人脉、媒体关系、黑料、风险
- **真实的选举系统**：定期选举，可能落选导致游戏结束
- **AI对手系统**：三种原型对手（民粹型、建制型、阴谋型）
- **多种失败路径**：声望崩盘、丑闻摧毁、资金枯竭、党内边缘化等

### 拟真机制
- **国家环境模拟**：经济指标（GDP、失业率、通胀、股市）
- **国会立法机构**：众议院和参议院席位分布，重要法案进度
- **党派系统**：民主党/共和党，内部派系斗争
- **概率事件系统**：选择有多种可能结果，不确定性增强策略性
- **长期效果与连锁反应**：决策影响未来事件触发

## 🛠 技术栈

- **前端框架**: Next.js 14 (App Router)
- **开发语言**: TypeScript 5.3
- **UI 样式**: TailwindCSS 3.4
- **状态管理**: Zustand 4.4
- **数据持久化**: localStorage (MVP), 预留数据库接口
- **随机系统**: 支持 seed 的自定义随机数生成器

## 🚀 快速开始

### 安装依赖

\`\`\`bash
npm install
# 或
yarn install
# 或
pnpm install
\`\`\`

### 启动开发服务器

\`\`\`bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
\`\`\`

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

\`\`\`bash
npm run build
npm run start
\`\`\`

## 🎮 游戏机制

### 回合制流程

每个回合按以下顺序执行：

1. **环境更新** - 经济指标、国际局势、民意波动
2. **对手行动** - AI对手执行策略（募款、攻击、建立支持）
3. **事件生成** - 根据玩家状态和环境生成3个随机事件
4. **玩家决策** - 选择事件应对方案
5. **效果结算** - 立即效果 + 概率分支 + 长期影响
6. **属性衰减** - 部分属性自然衰减
7. **选举判定** - 检查是否需要选举
8. **失败检查** - 判断是否触发失败条件

### 核心资源

| 资源 | 说明 | 范围 | 获取方式 |
|------|------|------|----------|
| **声望 (Reputation)** | 政治声誉和形象 | 0-100 | 正面事件、政绩、媒体曝光 |
| **民意 (Support)** | 选民支持度 | 0-100 | 政策立场、亲民活动、危机应对 |
| **资金 (Fundraising)** | 竞选资金 | 0-100 | 募款、金主、党派支持 |
| **人脉 (Network)** | 政治关系网 | 0-100 | 结盟、互惠、社交活动 |
| **媒体 (Media)** | 媒体关系 | -100~100 | 采访、公关、媒体操作 |
| **黑料 (Leverage)** | 掌握的把柄 | 0-100 | 调查、内幕消息、阴谋 |
| **风险 (Risk)** | 被曝光风险 | 0-100 | 阴招、丑闻、违规操作 |

### 晋升条件

| 职位 | 声望 | 民意 | 资金 | 党内影响力 | 最低任期 |
|------|------|------|------|------------|----------|
| 州众议员 | 30 | 35 | 25 | 20 | 1 |
| 州参议员 | 40 | 45 | 35 | 30 | 1 |
| 联邦众议员 | 50 | 50 | 45 | 40 | 2 |
| 联邦参议员 | 60 | 60 | 55 | 50 | 2 |
| 总统 | 75 | 70 | 70 | 70 | 3 |

### 失败条件

- 声望 < 10 → 声望崩盘
- 民意 < 15 → 民意流失
- 资金 < 5 (非首任期) → 资金枯竭
- 党内影响力 < 5 (非地方议会) → 党内边缘化
- 特定flag + 低属性 → 丑闻摧毁、调查起诉
- 选举失败 → 落选出局

## 🏗 系统架构

### 核心模块

#### 1. 类型系统 (`types/game.ts`)
- 定义所有游戏实体的 TypeScript 接口
- 枚举类型：党派、派系、职位、事件类别
- 支持 seed 的随机数生成器类

#### 2. 事件系统 (`data/events.ts` + `lib/gameEngine.ts`)
```typescript
// 事件配置结构
interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  condition?: (player, state) => boolean;
  options: EventOption[];
}

// 事件引擎
class EventEngine {
  generateEvents(player, state, count) // 生成当回合事件
  weightedRandomChoice() // 加权随机选择
}

class EventExecutor {
  executeChoice(option, player) // 执行玩家选择
}
```

#### 3. 游戏引擎 (`lib/gameEngine.ts`)
- **ElectionEngine** - 选举系统，计算得票率
- **OpponentAI** - 对手行为模拟
- **PromotionEngine** - 晋升判定
- **FailureEngine** - 失败条件检查

#### 4. 状态管理 (`store/gameStore.ts`)
使用 Zustand 管理全局游戏状态：
```typescript
interface GameStore {
  // 状态
  player: Player;
  nationalState: NationalState;
  currentEvents: GameEvent[];
  
  // 操作
  initializeGame();
  nextTurn();
  selectEventOption();
  runElection();
  attemptPromotion();
}
```

#### 5. UI 组件 (`components/`)
- **NationalPanel** - 国家环境面板
- **CongressPanel** - 国会立法机构
- **PlayerPanel** - 玩家信息面板
- **PartyPanel** - 党派系统
- **EventCard** - 事件卡片
- **OpponentList** - 对手列表

### 数据流

```
用户操作 → Zustand Store → 游戏引擎 → 状态更新 → React 组件重渲染
                ↓
          localStorage (自动保存)
```

## 📁 项目结构

```
gp/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 主游戏页面
│   └── globals.css         # 全局样式
├── components/
│   ├── CharacterCreation.tsx
│   ├── GameOverScreen.tsx
│   ├── NationalPanel.tsx
│   ├── CongressPanel.tsx
│   ├── PlayerPanel.tsx
│   ├── PartyPanel.tsx
│   ├── EventCard.tsx
│   └── OpponentList.tsx
├── store/
│   └── gameStore.ts        # Zustand 状态管理
├── lib/
│   └── gameEngine.ts       # 游戏核心引擎
├── types/
│   └── game.ts             # TypeScript 类型定义
├── data/
│   └── events.ts           # 事件配置（30+ 事件）
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🎲 事件系统详解

### 事件类别

1. **媒体事件** (media) - 媒体曝光、采访、辩论
2. **党内政治** (party_internal) - 派系斗争、背书、初选
3. **对手行动** (opponent) - 负面广告、攻击、结盟
4. **民意舆论** (public_opinion) - 抗议、民调、政策反馈
5. **经济事件** (economy) - 经济危机、金主请求
6. **丑闻调查** (scandal/investigation) - 丑闻、调查、起诉
7. **国际事件** (international) - 国际危机、战争
8. **机遇事件** (opportunity) - 名人背书、立法机会

### 事件权重系统

事件权重会根据游戏状态动态调整：

- 玩家风险高 → 丑闻事件权重增加
- 经济波动大 → 经济事件权重增加
- 国际局势紧张 → 国际事件权重增加

### 概率分支

事件选项可以有多个概率结果：

```typescript
outcomes: [
  {
    probability: 0.6,
    effects: { support: 15, media: 20 },
    description: '你的强硬立场赢得支持'
  },
  {
    probability: 0.4,
    effects: { support: -10, reputation: -5 },
    description: '你被批评过于激进'
  }
]
```

## 🗺 开发路线图

### MVP (已完成) ✅
- [x] 核心类型系统
- [x] 30+ 随机事件
- [x] 回合制游戏循环
- [x] 选举系统（地方 → 州级 → 联邦）
- [x] AI 对手系统
- [x] 失败条件判定
- [x] 完整 UI 组件
- [x] localStorage 存档

### v1.1 (计划中)
- [ ] 更多事件（目标 100+）
- [ ] 完整选举系统（初选 + 普选）
- [ ] 内阁和副总统路径
- [ ] 更复杂的对手AI
- [ ] 成就系统

### v2.0 (未来)
- [ ] 数据库后端（用户账号系统）
- [ ] 多人模式
- [ ] 历史回放
- [ ] 更多国家/地区
- [ ] MOD 支持

## 🎯 设计理念

### 拟真性
- 基于真实政治运作规律
- 有输有赢，不保证成功
- 决策有长期后果

### 策略性
- 资源管理与平衡
- 风险与回报权衡
- 多路径晋升

### 随机性
- 支持 seed 的随机系统
- 可重现的游戏过程
- 概率事件增加不确定性

### 可扩展性
- 配置化事件系统
- 模块化游戏引擎
- 预留数据库接口

## 📝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 添加新事件

1. 在 `data/events.ts` 中添加事件配置
2. 遵循现有事件结构
3. 确保事件有清晰的触发条件
4. 测试各种选项分支

### 代码规范

- 使用 TypeScript 严格模式
- 遵循现有代码风格
- 为复杂逻辑添加注释
- UI 组件使用 TailwindCSS

## 📄 许可证

MIT License

## 🙏 致谢

灵感来源：
- 《Democracy》系列
- 《Reigns》
- 《纸牌屋》(House of Cards)

---

**祝你在政治权力游戏中步步高升！但记住：政治如战场，稍有不慎便可能一败涂地。**
