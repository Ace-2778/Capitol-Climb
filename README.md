# 政治权力游戏 | Political Power Game

🎮 一个深度模拟美国政治体系的策略游戏，从地方议员一路爬升至白宫。

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 核心特性

### 🎯 真实的政治晋升系统
从地方议会逐级攀登至总统宝座，每一步都需要平衡多方利益：
- **9级职位晋升路径**：地方议会 → 州众议员 → 州参议员 → 州长 → 联邦众议员 → 联邦参议员 → 内阁 → 副总统 → 总统
- **多维度考核指标**：声望、民意、资金、人脉、媒体关系、党内影响力
- **定期选举压力**：每8-12回合必须面对连任选举，失败即游戏结束

### 📜 重大决策体验系统
深度策略玩法，模拟真实政治决策过程：

#### 法案系统
- **6个可调维度**：意识形态（进步↔保守）、预算规模、执行力度、透明度、妥协度、私货项目
- **4阶段推进**：起草 → 委员会 → 党内协调 → 议会表决
- **12+法案模板**：涵盖医疗、经济、环境、移民、教育等领域
- **实时反馈**：调整法案参数即时查看各派系态度变化
- **不确定性机制**：通过概率区间而非确定值，交易有背叛风险

#### 讲话系统
- **三段式结构**：开场 → 核心论点 → 结尾，27种组合方式
- **10+讲话场景**：记者会、电视访谈、造势大会、议会发言、危机应对等
- **差异化选项**：每段3-5个选项，影响口才、可信度、攻击性、同理心
- **媒体偏差模拟**：同一讲话在友好/中立/敌对媒体获得不同标题
- **受众细分预测**：基础盘、摇摆选民、精英阶层、金主的不同反应

### 🎲 30+ 随机事件系统
高度自由的选择与后果：
- **7大事件类别**：媒体、党内斗争、对手攻击、丑闻危机、资金机遇、人脉交际、政策议题
- **概率分支机制**：同一选择可能带来多种结果
- **长期影响标记**：决策会影响未来事件生成
- **连锁反应**：某些事件组合触发特殊剧情

### 🏛️ 动态国家环境
完整的政治生态模拟：
- **国会系统**：众议院435席、参议院100席实时分布
- **经济指标**：GDP增长率、失业率、通胀率、股市指数动态变化
- **党派系统**：民主党/共和党，内部派系斗争（进步派、温和派、保守派、建制派、民粹派）
- **AI对手**：3种性格原型（民粹型、建制型、阴谋型）的智能对手

### ❌ 多种失败路径
避免"必胜"套路，增强策略深度：
- 声望崩盘（<10）
- 民意流失（<15）
- 资金枯竭（<5）
- 党内边缘化
- 丑闻摧毁
- 选举落败

## 🚀 快速开始

### 前置要求
- Node.js 18+ 
- npm / yarn / pnpm

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/yourusername/political-power-game.git
cd political-power-game

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm run start
```

## 🎮 游戏玩法

### 基础流程
1. **创建角色**：选择党派（民主党/共和党）、派系（进步/温和/保守/建制/民粹）、起始州
2. **回合制推进**：每回合处理3个随机事件，管理7大资源属性
3. **重大决策**：随机触发法案推进或公开讲话机会（30%/20%概率）
4. **定期选举**：8回合后首次选举，之后根据职位决定选举周期
5. **晋升尝试**：满足条件后可申请晋升至更高职位
6. **最终目标**：成为美国总统

### 核心资源

| 资源 | 范围 | 说明 | 关键用途 |
|------|------|------|----------|
| 声望 (Reputation) | 0-100 | 政治声誉 | 晋升、事件解锁 |
| 民意 (Support) | 0-100 | 选民支持度 | 选举胜率 |
| 资金 (Fundraising) | 0-100 | 竞选资金 | 晋升、选举 |
| 人脉 (Network) | 0-100 | 政治关系网 | 事件成功率 |
| 媒体 (Media) | -100~100 | 媒体关系 | 事件曝光、形象 |
| 黑料 (Leverage) | 0-100 | 掌握的把柄 | 特殊选项解锁 |
| 风险 (Risk) | 0-100 | 被曝光风险 | 失败条件 |
| 党内影响力 (Party Influence) | 0-100 | 党内地位 | 晋升、法案推进 |

### 重大决策技巧
- **法案策略**：不追求"完美"参数，根据角色性格和政治理念决策
- **讲话策略**：只显示影响的受众方向，不透露增减幅度，需凭直觉判断
- **风险管理**：高透明度降低丑闻风险，但可能降低通过率
- **交易博弈**：与议员达成交易可提升支持，但有背叛概率

## 🛠️ 技术栈

### 核心技术
- **Next.js 14** - React框架（App Router）
- **TypeScript 5.3** - 类型安全
- **TailwindCSS 3.4** - 实用优先的CSS框架
- **Zustand 4.4** - 轻量级状态管理

### 关键特性
- **Seeded Random** - 可复现的随机数生成器
- **localStorage** - 自动保存/加载游戏进度
- **响应式设计** - 适配桌面与移动端
- **零依赖游戏引擎** - 纯TS实现的游戏逻辑

## 📁 项目结构

```
gp/
├── app/                          # Next.js页面
│   ├── page.tsx                 # 主游戏界面
│   ├── decisions/page.tsx       # 决策中心
│   ├── bill/[id]/page.tsx       # 法案详情
│   └── speech/[id]/page.tsx     # 讲话详情
├── components/                   # React组件
│   ├── CharacterCreation.tsx    # 角色创建
│   ├── GameOverScreen.tsx       # 游戏结束
│   ├── NationalPanel.tsx        # 国家环境面板
│   ├── CongressPanel.tsx        # 国会系统
│   ├── PlayerPanel.tsx          # 玩家信息
│   ├── PartyPanel.tsx           # 党派系统
│   ├── EventCard.tsx            # 事件卡片
│   └── OpponentList.tsx         # 对手列表
├── types/                        # TypeScript类型定义
│   ├── game.ts                  # 核心游戏类型
│   └── decision.ts              # 决策系统类型
├── data/                         # 游戏数据
│   ├── events.ts                # 30+事件模板
│   ├── bills.ts                 # 12+法案模板
│   └── speeches.ts              # 10+讲话模板
├── lib/                          # 游戏引擎
│   ├── gameEngine.ts            # 事件/选举/晋升/失败引擎
│   └── decisionEngine.ts        # 决策生成/评估/执行引擎
└── store/                        # 状态管理
    ├── gameStore.ts             # 核心游戏状态
    └── decisionStore.ts         # 决策系统状态
```

## 🎨 设计理念

### 1. 拒绝"最优解"
- 所有决策都有权衡，没有完美选项
- 不确定性机制：效果以区间呈现，实际结果随机
- 长期vs短期：激进选择可能短期收益高但长期风险大

### 2. 信息不对称
- 玩家只能看到"可能影响的方面"，不显示具体增减
- 媒体偏差：不同阵营媒体报道同一事件的标题完全不同
- 对手行为不透明：只能从结果推测对手策略

### 3. 多重失败路径
- 避免"只要某个属性不归零就能玩到通关"
- 组合条件触发失败：如"有丑闻标记 + 声望低"
- 不可逆的选择后果

### 4. 沉浸式叙事
- 事件文本接近真实政治新闻风格
- 媒体标题差异化展示（友好/中立/敌对）
- 长期状态标记影响玩家形象（改革者/投机者/强硬派）

## 🗓️ 开发路线图

### ✅ 已完成
- [x] 核心游戏循环（回合制、事件、选举）
- [x] 9级晋升系统
- [x] 30+随机事件库
- [x] AI对手系统
- [x] 国会与党派系统
- [x] 重大决策体验系统（法案+讲话）
- [x] 自动保存/加载
- [x] 游戏结束判定

### 🚧 进行中
- [ ] 更多事件模板（目标50+）
- [ ] 更多法案/讲话模板（目标各20+）
- [ ] 成就系统
- [ ] 历史记录回溯

### 📋 计划中
- [ ] 多人对战模式
- [ ] 辩论系统（实时对话）
- [ ] 社交媒体系统（Twitter风暴、病毒视频）
- [ ] 数据可视化增强（关系网图、民调曲线）
- [ ] 后端API（用户系统、排行榜）
- [ ] 移动端App

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 如何贡献
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 贡献方向
- **数据扩展**：添加新事件、法案、讲话模板（参考 `data/` 文件夹）
- **平衡性调优**：调整属性影响、晋升条件、失败条件
- **UI改进**：组件优化、响应式适配、视觉效果
- **新机制**：辩论系统、社交媒体、国际外交等

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 💡 灵感来源

- **游戏**：Democracy 3/4, Suzerain, The Political Machine
- **影视**：House of Cards, The West Wing, Veep
- **现实**：美国政治体系、选举周期、国会运作机制

## 📧 联系方式

- 项目地址：[GitHub Repository](https://github.com/yourusername/political-power-game)
- 问题反馈：[Issues](https://github.com/yourusername/political-power-game/issues)

---

**⚠️ 免责声明**：本游戏为虚构作品，所有人物、事件、政策均为虚构，与现实政治人物或事件无关。游戏内容不代表任何政治立场。

Made with ❤️ by [Your Name]


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
