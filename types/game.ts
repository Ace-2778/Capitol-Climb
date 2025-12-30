// 游戏核心数据结构定义

// ==================== 基础枚举 ====================

export enum Party {
  DEMOCRAT = 'democrat',
  REPUBLICAN = 'republican',
  INDEPENDENT = 'independent',
}

export enum Faction {
  PROGRESSIVE = 'progressive',      // 进步派
  MODERATE = 'moderate',            // 温和派
  CONSERVATIVE = 'conservative',    // 保守派
  ESTABLISHMENT = 'establishment',  // 建制派
  POPULIST = 'populist',           // 民粹派
}

export enum Position {
  LOCAL_COUNCIL = 'local_council',              // 地方议会
  STATE_REPRESENTATIVE = 'state_representative',// 州众议员
  STATE_SENATOR = 'state_senator',              // 州参议员
  GOVERNOR = 'governor',                        // 州长
  HOUSE_REPRESENTATIVE = 'house_representative',// 联邦众议员
  SENATOR = 'senator',                          // 联邦参议员
  CABINET = 'cabinet',                          // 内阁
  VICE_PRESIDENT = 'vice_president',            // 副总统
  PRESIDENT = 'president',                      // 总统
}

export enum EventCategory {
  MEDIA = 'media',
  PARTY_INTERNAL = 'party_internal',
  OPPONENT = 'opponent',
  PUBLIC_OPINION = 'public_opinion',
  INTERNATIONAL = 'international',
  ECONOMY = 'economy',
  SCANDAL = 'scandal',
  INVESTIGATION = 'investigation',
  OPPORTUNITY = 'opportunity',
}

export enum GameStatus {
  CHARACTER_CREATION = 'character_creation',
  IN_PROGRESS = 'in_progress',
  WON = 'won',
  LOST = 'lost',
}

// ==================== 玩家 ====================

export interface Player {
  id: string;
  name: string;
  party: Party;
  faction: Faction;
  position: Position;
  
  // 核心资源
  reputation: number;      // 声望 0-100
  support: number;         // 民意支持 0-100
  fundraising: number;     // 资金 0-100
  network: number;         // 人脉 0-100
  media: number;          // 媒体关系 -100 to 100
  leverage: number;       // 黑料/把柄 0-100
  risk: number;           // 曝光风险 0-100
  
  // 政治数据
  termCount: number;       // 任期数
  turnsUntilElection: number; // 距离下次选举的回合数
  partyInfluence: number;  // 党内影响力 0-100
  
  // 状态标记
  flags: string[];         // 状态标记（用于触发特定事件）
  achievements: string[];  // 成就
  
  // 背景
  state: string;           // 所在州
  background: string;      // 背景故事
}

// ==================== 对手 ====================

export enum OpponentArchetype {
  POPULIST = 'populist',        // 民粹型
  ESTABLISHMENT = 'establishment', // 建制型
  CONSPIRATOR = 'conspirator',    // 阴谋型
}

export interface Opponent {
  id: string;
  name: string;
  party: Party;
  archetype: OpponentArchetype;
  position: Position;
  
  // 属性
  funding: number;         // 资金
  polling: number;         // 民调
  media: number;          // 媒体影响力
  partyInfluence: number; // 党内影响力
  leverage: number;       // 掌握的黑料
  defense: number;        // 防御（抗攻击能力）
  ambition: number;       // 野心（行动倾向）
  
  // 关系
  relationshipWithPlayer: number; // 与玩家关系 -100 to 100
}

// ==================== 国家环境 ====================

export interface NationalState {
  turn: number;           // 当前回合
  
  // 经济指标
  gdpGrowth: number;      // GDP增长率 -10 to 10
  unemployment: number;    // 失业率 0-20
  inflation: number;       // 通胀率 0-20
  stockMarket: number;     // 股市指数 -100 to 100
  
  // 国际局势
  warRisk: number;        // 战争风险 0-100
  diplomaticRelations: number; // 外交关系 -100 to 100
  
  // 社会议题热度
  issues: {
    immigration: number;   // 移民 0-100
    gunControl: number;    // 枪支管控 0-100
    healthcare: number;    // 医疗 0-100
    education: number;     // 教育 0-100
    environment: number;   // 环境 0-100
  };
  
  // 总统
  president: {
    name: string;
    party: Party;
    approval: number;      // 支持率 0-100
  };
  
  // 立法机构
  congress: {
    house: {
      democratSeats: number;
      republicanSeats: number;
      total: number;
    };
    senate: {
      democratSeats: number;
      republicanSeats: number;
      total: number;
    };
    majorBills: Bill[];
  };
}

export interface Bill {
  id: string;
  title: string;
  category: string;
  democratSupport: number; // 0-100
  republicanSupport: number; // 0-100
  status: 'proposed' | 'voting' | 'passed' | 'failed';
}

// ==================== 党派系统 ====================

export interface PartyData {
  party: Party;
  
  // 资源
  nationalPolling: number; // 全国民调 0-100
  fundingPool: number;     // 党派资金池
  
  // 派系分布
  factions: {
    [key in Faction]?: number; // 百分比
  };
  
  // 核心议题
  keyIssues: string[];
  
  // 党内人物
  keyFigures: {
    name: string;
    role: string;
    influence: number;
    relationshipWithPlayer: number;
  }[];
}

// ==================== 事件系统 ====================

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  
  // 触发条件
  minPosition?: Position;  // 最低职位要求
  maxPosition?: Position;  // 最高职位要求
  requiredFlags?: string[]; // 需要的状态标记
  requiredParty?: Party;
  
  // 条件检查（更复杂的条件）
  condition?: (player: Player, state: NationalState) => boolean;
  
  // 权重（影响被选中概率）
  weight: number;
  baseWeight: number;
  
  // 选项
  options: EventOption[];
}

export interface EventOption {
  id: string;
  text: string;
  
  // 成本
  cost?: {
    fundraising?: number;
    reputation?: number;
    support?: number;
    network?: number;
  };
  
  // 即时效果
  immediateEffects: ResourceChange;
  
  // 概率分支
  outcomes?: {
    probability: number;  // 0-1
    effects: ResourceChange;
    description: string;
    addFlags?: string[];
    removeFlags?: string[];
  }[];
  
  // 长期效果
  addFlags?: string[];
  removeFlags?: string[];
  
  // 触发后续事件
  triggerEvent?: string;
}

export interface ResourceChange {
  reputation?: number;
  support?: number;
  fundraising?: number;
  network?: number;
  media?: number;
  leverage?: number;
  risk?: number;
  partyInfluence?: number;
}

// ==================== 选举 ====================

export interface Election {
  type: 'primary' | 'general';
  position: Position;
  turn: number;
  
  candidates: ElectionCandidate[];
  
  // 选举参数
  playerAdvantage: number; // 玩家优势修正
  turnoutRate: number;     // 投票率
}

export interface ElectionCandidate {
  id: string;
  name: string;
  party: Party;
  isPlayer: boolean;
  
  // 选举指标
  baseSupport: number;
  funding: number;
  endorsements: number;
  mediaSupport: number;
  
  finalVoteShare?: number;
}

// ==================== 游戏状态 ====================

export interface GameState {
  // 基础状态
  status: GameStatus;
  seed: number;
  
  // 玩家
  player: Player;
  
  // 世界状态
  nationalState: NationalState;
  
  // 党派
  parties: {
    democrat: PartyData;
    republican: PartyData;
  };
  
  // 对手
  opponents: Opponent[];
  
  // 当前事件
  currentEvents: GameEvent[];
  
  // 选举
  upcomingElection?: Election;
  
  // 历史记录
  eventHistory: {
    turn: number;
    eventId: string;
    choice: string;
    outcome: string;
  }[];
  
  // 消息日志
  messageLog: {
    turn: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'danger';
  }[];
}

// ==================== 随机数生成器（支持seed） ====================

export class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
  
  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
  
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
