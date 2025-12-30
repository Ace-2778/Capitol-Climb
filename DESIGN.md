# 系统设计文档

## 1. 概述

《政治权力游戏》是一个深度模拟美国政治权谋的网页游戏。玩家从基层政治人物起步，通过策略决策、资源管理和政治博弈逐步攀升到权力顶峰。游戏强调拟真性、策略性和随机性，结局不保证成功。

### 1.1 核心目标

- **拟真**：模拟真实政治运作逻辑
- **策略**：多维度资源管理和决策权衡
- **随机**：支持 seed 的可重现随机系统
- **可玩**：MVP 即可完整体验核心玩法
- **可扩展**：模块化设计便于后续迭代

## 2. 游戏系统设计

### 2.1 玩法循环（Game Loop）

```
[回合开始]
    ↓
[更新国家环境] - 经济、国际、民意波动
    ↓
[对手AI行动] - 募款、攻击、建立支持
    ↓
[生成随机事件] - 3个事件（根据权重和条件）
    ↓
[玩家选择] - 选择事件应对方案
    ↓
[效果结算] - 即时效果 + 概率分支 + 状态标记
    ↓
[属性更新] - 资源变化、自然衰减
    ↓
[选举判定] - 如果到选举回合，触发选举
    ↓
[失败检查] - 检查7种失败条件
    ↓
[晋升检查] - 检查是否满足晋升条件
    ↓
[保存游戏] - localStorage自动保存
    ↓
[回合结束]
```

### 2.2 成长路径

```
地方议会议员 (Local Council)
    ↓ 任期1+ | 声望30+ | 民意35+ | 资金25+ | 党内影响20+
州众议员 (State Representative)
    ↓ 任期1+ | 声望40+ | 民意45+ | 资金35+ | 党内影响30+
州参议员 (State Senator)
    ↓ 任期2+ | 声望50+ | 民意50+ | 资金45+ | 党内影响40+
联邦众议员 (House Representative)
    ↓ 任期2+ | 声望60+ | 民意60+ | 资金55+ | 党内影响50+
联邦参议员 (Senator)
    ↓ 任期3+ | 声望75+ | 民意70+ | 资金70+ | 党内影响70+
总统 (President) [胜利]
```

### 2.3 资源系统

#### 核心资源
| 资源 | 初始值 | 影响因素 | 关键用途 |
|------|--------|----------|----------|
| 声望 (Reputation) | 40 | 政绩、媒体、公众形象 | 晋升、选举、事件触发 |
| 民意 (Support) | 45 | 政策立场、危机应对 | 选举、晋升 |
| 资金 (Fundraising) | 30 | 募款、金主、党派 | 选举、事件成本 |
| 人脉 (Network) | 35 | 结盟、社交、党内关系 | 晋升、事件触发 |
| 媒体 (Media) | 0 | 采访、公关、曝光 | 选举、事件权重 |
| 黑料 (Leverage) | 20 | 调查、内幕、交易 | 对抗对手、谈判 |
| 风险 (Risk) | 10 | 阴招、违规、丑闻 | 失败条件、事件触发 |
| 党内影响力 | 30 | 党内活动、政绩、派系 | 晋升、提名 |

#### 属性限制
- 大部分资源范围：0-100
- 媒体关系范围：-100 to 100
- 所有资源有自然衰减机制（部分）

### 2.4 选举系统

#### 选举类型
1. **党内初选 (Primary)** - 同党派竞争
2. **普选 (General)** - 跨党派竞争

#### 得票率计算
```
最终得票率 = 
  基础支持度 
  + 资金 × 0.2 
  + 背书 × 0.15 
  + 媒体 × 0.15 
  + 玩家优势加成
  + 随机波动 (±5%)
```

#### 现任优势
- 如果玩家有任期 (termCount > 0)
- 在低投票率选举中获得额外加成
- 优势值：+5%

#### 选举周期
- 地方/州级：8回合
- 联邦级：8-12回合

### 2.5 失败条件（7种）

1. **声望崩盘** - reputation < 10
2. **民意流失** - support < 15
3. **资金枯竭** - fundraising < 5 (非首任期)
4. **党内边缘化** - partyInfluence < 5 (非地方议会)
5. **丑闻摧毁** - flag:'caught_lying' + reputation < 30
6. **调查起诉** - flag:'hostile_to_investigation' + risk > 80
7. **背叛孤立** - network < 10 + partyInfluence < 20

## 3. 事件系统设计

### 3.1 事件结构

```typescript
interface GameEvent {
  id: string;                    // 唯一标识
  title: string;                 // 事件标题
  description: string;           // 事件描述
  category: EventCategory;       // 类别
  
  // 触发条件
  minPosition?: Position;        // 最低职位
  maxPosition?: Position;        // 最高职位
  requiredFlags?: string[];      // 需要的状态标记
  requiredParty?: Party;         // 需要的党派
  condition?: (player, state) => boolean; // 自定义条件
  
  // 权重系统
  weight: number;                // 当前权重
  baseWeight: number;            // 基础权重
  
  // 选项
  options: EventOption[];        // 2-4个选项
}

interface EventOption {
  id: string;
  text: string;                  // 选项描述
  cost?: ResourceChange;         // 成本
  immediateEffects: ResourceChange; // 立即效果
  outcomes?: Outcome[];          // 概率分支
  addFlags?: string[];           // 添加状态标记
  removeFlags?: string[];        // 移除状态标记
}

interface Outcome {
  probability: number;           // 0-1
  effects: ResourceChange;       // 效果
  description: string;           // 结果描述
  addFlags?: string[];
  removeFlags?: string[];
}
```

### 3.2 事件类别（9种）

| 类别 | 说明 | 事件数 | 权重调整因子 |
|------|------|--------|--------------|
| media | 媒体事件 | 3+ | - |
| party_internal | 党内政治 | 5+ | - |
| opponent | 对手行动 | 3+ | - |
| public_opinion | 民意舆论 | 3+ | - |
| economy | 经济事件 | 3+ | GDP波动 |
| scandal | 丑闻 | 2+ | 玩家风险值 |
| investigation | 调查 | 2+ | 玩家风险值 |
| international | 国际 | 1+ | 战争风险 |
| opportunity | 机遇 | 5+ | - |

### 3.3 事件生成算法

```
每回合生成流程：
1. 过滤可用事件
   - 检查职位要求
   - 检查党派要求
   - 检查flag要求
   - 检查自定义条件
   - 排除最近5回合已出现的事件

2. 计算动态权重
   - 基础权重 × 环境因子
   - 丑闻事件权重 × (1 + risk/100)
   - 经济事件权重 × (1 + |gdpGrowth|/10)
   - 国际事件权重 × (1 + warRisk/100)

3. 加权随机抽取
   - 使用seeded random确保可重现
   - 每回合抽取3个事件
   - 避免同一回合重复

4. 返回事件列表
```

### 3.4 效果结算流程

```
玩家选择选项后：
1. 扣除成本（如果有）
2. 应用即时效果
3. 处理概率分支
   - 根据probability进行随机判定
   - 应用对应分支的效果
4. 添加/移除状态标记
5. 限制资源在合理范围（0-100或-100~100）
6. 记录历史
7. 添加消息日志
8. 保存游戏
```

### 3.5 状态标记系统（Flags）

状态标记用于：
- 触发特定后续事件
- 改变失败条件
- 记录玩家选择历史

示例标记：
```
'media_settlement_exposed'    - 媒体封口费曝光
'party_ally_senior'          - 与党内大佬结盟
'has_opponent_leverage'      - 掌握对手黑料
'progressive_wing'           - 加入进步派
'under_investigation'        - 正在接受调查
'caught_lying'               - 被抓到撒谎
'presidential_candidate'     - 宣布参选总统
```

## 4. 对手AI系统

### 4.1 对手类型（3种原型）

#### 民粹型 (Populist)
```
特征：
- 高媒体影响力
- 中等资金
- 低防御
- 高行动倾向

行动概率：
- 40% 攻击玩家
- 30% 建立民意
- 30% 募款
```

#### 建制型 (Establishment)
```
特征：
- 高资金
- 高党内影响力
- 高防御
- 中等行动倾向

行动概率：
- 50% 募款
- 30% 建立支持
- 20% 收集黑料
```

#### 阴谋型 (Conspirator)
```
特征：
- 高黑料掌握
- 中等资金
- 中等防御
- 高行动倾向

行动概率：
- 40% 收集黑料
- 30% 攻击玩家
- 30% 募款
```

### 4.2 对手行动执行

```
每回合对手行动：
1. 根据原型选择行动类型
2. 执行行动
   - fundraise: funding +5~15
   - attack: 如果玩家risk>30，触发攻击事件
   - build_support: polling +3~10
   - gather_leverage: leverage +5~15
3. 自然属性波动 (polling ±2)
4. 生成行动消息（如果有）
```

## 5. UI/UX设计

### 5.1 页面布局（三栏式）

```
+----------------------------------+
|      Header (固定顶部)           |
|  游戏标题 | 回合控制 | 选举按钮  |
+----------+--------------+--------+
|          |              |        |
|  左侧栏  |   中央区域   | 右侧栏 |
|  25%     |     50%      |  25%   |
|          |              |        |
| - 玩家   | - 消息日志   | - 国家 |
|   信息   | - 事件卡片   |   环境 |
| - 晋升   |   (主要交互) | - 国会 |
|   按钮   |              | - 党派 |
| - 对手   |              |        |
|   列表   |              |        |
+----------+--------------+--------+
|           Footer                 |
+----------------------------------+
```

### 5.2 组件层次

```
App (page.tsx)
├── CharacterCreation (角色创建)
├── GameOverScreen (游戏结束)
└── MainGame (主游戏界面)
    ├── Header
    │   └── 回合按钮 / 选举按钮
    ├── LeftSidebar
    │   ├── PlayerPanel (玩家面板)
    │   └── OpponentList (对手列表)
    ├── CenterArea
    │   ├── MessageLog (消息日志)
    │   └── EventList (事件列表)
    │       └── EventCard × N
    └── RightSidebar
        ├── NationalPanel (国家环境)
        ├── CongressPanel (国会)
        └── PartyPanel (党派)
```

### 5.3 视觉设计原则

- **配色方案**
  - 民主党：蓝色 (#1e40af)
  - 共和党：红色 (#dc2626)
  - 中性：灰色系
  - 警告：黄色/橙色
  - 成功：绿色
  - 危险：红色

- **信息密度**
  - 高信息量但不拥挤
  - 使用进度条可视化数值
  - 条形图展示席位分布
  - 趋势箭头显示变化方向

- **交互反馈**
  - 按钮hover状态
  - 禁用状态明确提示
  - 操作后立即视觉反馈
  - 动画过渡（fade in）

## 6. 技术实现

### 6.1 技术选型理由

| 技术 | 理由 |
|------|------|
| Next.js 14 | App Router、Server Components、优化构建 |
| TypeScript | 类型安全、更好的IDE支持、减少bug |
| TailwindCSS | 快速开发、一致性、响应式设计 |
| Zustand | 轻量级、简单API、TypeScript友好 |
| localStorage | MVP快速实现、无需后端 |

### 6.2 状态管理架构

```
Zustand Store (Single Source of Truth)
    ↓
+-------------------+
| GameState         |
| - player          |
| - nationalState   |
| - parties         |
| - opponents       |
| - currentEvents   |
| - eventHistory    |
| - messageLog      |
+-------------------+
    ↓
React Components (订阅状态)
    ↓
用户交互 (dispatch actions)
    ↓
Game Engines (业务逻辑)
    ↓
Store Update (不可变更新)
    ↓
localStorage Save (自动保存)
```

### 6.3 游戏引擎模块

```
lib/gameEngine.ts
├── EventEngine (事件生成)
│   ├── generateEvents()
│   ├── weightedRandomChoice()
│   └── meetsPositionRequirement()
├── EventExecutor (事件执行)
│   ├── executeChoice()
│   ├── applyResourceChange()
│   └── clampPlayerResources()
├── ElectionEngine (选举)
│   ├── runElection()
│   ├── shouldHoldElection()
│   └── generateOpponents()
├── OpponentAI (对手AI)
│   ├── executeOpponentActions()
│   ├── selectAction()
│   └── generateOpponents()
├── PromotionEngine (晋升)
│   ├── canPromote()
│   └── getPromotionRequirements()
└── FailureEngine (失败判定)
    └── checkFailureConditions()
```

### 6.4 随机数系统

```typescript
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  // 线性同余生成器 (LCG)
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280; // 0-1
  }
  
  // 工具方法
  nextInt(min, max): number
  nextFloat(min, max): number
  choice<T>(array: T[]): T
  shuffle<T>(array: T[]): T[]
}
```

优势：
- 可重现：相同seed产生相同序列
- 便于调试和复盘
- 支持单元测试

### 6.5 数据持久化

#### 当前实现（MVP）
```typescript
// 保存
localStorage.setItem('politicalGameSave', JSON.stringify({
  status, seed, player, nationalState, 
  parties, opponents, currentEvents, 
  eventHistory, messageLog
}));

// 加载
const data = JSON.parse(localStorage.getItem('politicalGameSave'));
```

#### 未来扩展（v2.0）
```typescript
// 后端API设计
POST /api/game/save
GET  /api/game/load/:userId
GET  /api/game/history/:userId
POST /api/game/fork/:saveId  // 从某个保存点分支
```

## 7. 性能优化

### 7.1 已实施优化

1. **React性能**
   - 使用 Zustand 避免不必要的重渲染
   - 组件使用 React.memo (需要时)
   - 避免匿名函数作为props

2. **事件生成优化**
   - 缓存最近生成的事件ID（避免重复）
   - 限制可用事件池大小
   - 权重计算只在生成时执行

3. **数据结构**
   - 使用Set存储flags（O(1)查找）
   - 消息日志限制最大条数（50条）

### 7.2 未来优化空间

1. **虚拟滚动**：消息日志如果很长
2. **懒加载**：事件数据按类别分割
3. **Web Worker**：复杂计算移到worker
4. **IndexedDB**：替代localStorage，支持更大数据

## 8. 扩展性设计

### 8.1 事件扩展

添加新事件非常简单：
```typescript
// 在 data/events.ts 中添加
{
  id: 'new_event_id',
  title: '新事件标题',
  description: '事件描述',
  category: EventCategory.MEDIA,
  weight: 1,
  baseWeight: 1,
  condition: (player, state) => {
    // 自定义触发条件
    return player.position === Position.SENATOR;
  },
  options: [
    // 选项配置
  ]
}
```

### 8.2 新资源类型

```typescript
// 1. 在 types/game.ts 中扩展 Player 接口
interface Player {
  // ... 现有资源
  newResource: number;  // 新资源
}

// 2. 在 ResourceChange 中添加
interface ResourceChange {
  // ... 现有资源
  newResource?: number;
}

// 3. 在 EventExecutor.applyResourceChange() 中处理
if (change.newResource !== undefined) {
  player.newResource += change.newResource;
}
```

### 8.3 新对手类型

```typescript
// 在 OpponentAI.selectAction() 中添加case
case OpponentArchetype.NEW_TYPE:
  if (random < 0.5) return 'action1';
  return 'action2';
```

### 8.4 新晋升路径

```typescript
// 在 PromotionEngine 中添加
const positionPath = [
  // ... 现有路径
  Position.NEW_POSITION,
];

// 添加要求
case Position.NEW_POSITION:
  return { 
    minReputation: 80, 
    minSupport: 80, 
    // ...
  };
```

## 9. 测试策略

### 9.1 单元测试（计划）

```typescript
// 测试随机数生成器
describe('SeededRandom', () => {
  it('should generate same sequence with same seed', () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);
    expect(rng1.next()).toBe(rng2.next());
  });
});

// 测试事件生成
describe('EventEngine', () => {
  it('should filter events by position', () => {
    // ...
  });
});

// 测试选举计算
describe('ElectionEngine', () => {
  it('should calculate vote share correctly', () => {
    // ...
  });
});
```

### 9.2 集成测试（计划）

- 完整游戏流程测试
- 晋升路径测试
- 失败条件测试

### 9.3 手动测试清单

- [ ] 角色创建流程
- [ ] 所有事件类型至少触发一次
- [ ] 所有失败条件至少触发一次
- [ ] 选举系统（胜/负）
- [ ] 晋升系统
- [ ] 存档加载
- [ ] 响应式布局（手机/平板/桌面）

## 10. 已知限制与未来改进

### 10.1 MVP限制

1. **事件数量**：30个（目标100+）
2. **选举简化**：未区分初选和普选
3. **对手AI简单**：只有基础行为
4. **无历史回放**：无法查看详细历史
5. **单机游戏**：无联网功能

### 10.2 未来改进方向

#### v1.1
- 增加事件到100个
- 完整初选系统
- 更智能的对手AI
- 成就系统
- 更多随机事件连锁

#### v2.0
- 数据库后端
- 用户账号系统
- 排行榜
- 历史回放
- 分享游戏结果

#### v3.0
- 多人模式
- 实时对战
- 更多国家/地区
- MOD支持
- 自定义事件编辑器

## 11. 性能指标

### 11.1 目标性能

- **首屏加载**：< 2秒
- **事件生成**：< 50ms
- **选举计算**：< 100ms
- **状态更新**：< 16ms (60fps)
- **存档保存**：< 100ms

### 11.2 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 不支持 IE

## 12. 开发时间线

- **Day 1**: 类型系统、数据结构
- **Day 2**: 事件系统、游戏引擎
- **Day 3**: 状态管理、UI组件
- **Day 4**: 主页面、集成测试
- **Day 5**: 优化、文档

---

**文档版本**: 1.0.0  
**最后更新**: 2025-12-30  
**作者**: AI游戏设计师 + 全栈工程师
