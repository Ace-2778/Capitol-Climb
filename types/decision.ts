/**
 * 重大决策系统核心类型定义
 * 包含法案、讲话、辩论等系统
 */

import { Party, Faction, Position } from './game';

// ==================== 决策类型枚举 ====================

export enum DecisionType {
  BILL = 'bill',               // 法案提案
  SPEECH = 'speech',           // 公开讲话
  DEBATE = 'debate',           // 电视辩论
  CRISIS_ADDRESS = 'crisis',   // 危机应对
}

export enum DecisionUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum DecisionScope {
  LOCAL = 'local',
  STATE = 'state',
  FEDERAL = 'federal',
  NATIONAL = 'national',
}

// ==================== 法案系统 ====================

export enum BillStatus {
  DRAFTING = 'drafting',           // 起草中
  COMMITTEE = 'committee',         // 委员会审议
  CAUCUS = 'caucus',              // 党内协调
  FLOOR_VOTE = 'floor_vote',      // 议会表决
  PASSED = 'passed',              // 通过
  REJECTED = 'rejected',          // 否决
  SHELVED = 'shelved',            // 搁置
}

export enum BillCategory {
  HEALTHCARE = 'healthcare',
  ECONOMY = 'economy',
  EDUCATION = 'education',
  ENVIRONMENT = 'environment',
  DEFENSE = 'defense',
  IMMIGRATION = 'immigration',
  JUSTICE = 'justice',
  INFRASTRUCTURE = 'infrastructure',
}

// 法案参数维度（可调节滑条）
export interface BillDimensions {
  ideology: number;        // -100(进步) ~ +100(保守)
  spending: number;        // 0(低预算) ~ 100(高预算)
  enforcement: number;     // 0(宽松) ~ 100(强硬)
  transparency: number;    // 0(暗箱) ~ 100(透明)
  compromise: number;      // 0(原则) ~ 100(妥协)
  pork: number;           // 0(无) ~ 100(多) 提升拉票但增加丑闻风险
}

// 法案配置模板
export interface BillTemplate {
  id: string;
  title: string;
  category: BillCategory;
  description: string;
  scope: DecisionScope;
  minPosition: Position;
  
  // 默认维度值
  defaultDimensions: BillDimensions;
  
  // 维度约束（哪些维度可调整）
  adjustableDimensions: (keyof BillDimensions)[];
  
  // 关键相关方
  stakeholders: {
    supportiveFactions: Faction[];
    opposingFactions: Faction[];
    swingFactions: Faction[];
  };
  
  // 基础效果（维度调整会修改）
  baseEffects: {
    support?: number;
    reputation?: number;
    fundraising?: number;
    partyInfluence?: number;
    media?: number;
    risk?: number;
  };
  
  // 长期标记
  longTermFlags: string[];
}

// 当前进行中的法案
export interface ActiveBill {
  id: string;
  templateId: string;
  title: string;
  category: BillCategory;
  status: BillStatus;
  
  // 当前维度设置
  dimensions: BillDimensions;
  
  // 时间压力
  turnsRemaining: number;
  maxTurns: number;
  
  // 支持度追踪
  support: {
    democratSupport: number;      // 民主党支持度
    republicanSupport: number;    // 共和党支持度
    factionSupport: Record<Faction, number>; // 各派系支持度
    committeeApproval: number;    // 委员会支持度
    mediaSupport: number;         // 媒体支持度
    publicSupport: number;        // 公众支持度
  };
  
  // 通过概率区间
  passageProbability: {
    min: number;
    max: number;
  };
  
  // 交易记录
  deals: Deal[];
  
  // 风险评估
  risks: {
    investigationRisk: number;
    scandalRisk: number;
    partySplitRisk: number;
  };
  
  createdTurn: number;
}

// ==================== 讲话系统 ====================

export enum SpeechType {
  PRESS_CONFERENCE = 'press_conference',    // 记者招待会
  TV_INTERVIEW = 'tv_interview',           // 电视访谈
  RALLY = 'rally',                         // 集会演讲
  FLOOR_SPEECH = 'floor_speech',          // 议会发言
  CRISIS_ADDRESS = 'crisis_address',       // 危机声明
  DEBATE = 'debate',                       // 辩论
}

export enum SpeechTone {
  AGGRESSIVE = 'aggressive',      // 强硬
  MODERATE = 'moderate',          // 温和
  EMOTIONAL = 'emotional',        // 煽情
  TECHNICAL = 'technical',        // 技术官僚
  HUMOROUS = 'humorous',         // 自嘲幽默
}

// 讲话结构（三段式）
export interface SpeechSegment {
  id: string;
  type: 'opening' | 'core' | 'closing';
  options: SpeechOption[];
}

export interface SpeechOption {
  id: string;
  text: string;
  tone: SpeechTone;
  
  // 表现值影响
  performance: {
    charisma: number;      // 口才魅力
    credibility: number;   // 可信度
    aggression: number;    // 攻击性
    empathy: number;       // 同理心
  };
  
  // 受众反应（预测区间）
  audienceImpact: {
    baseVoters: { min: number; max: number };      // 基础盘
    swingVoters: { min: number; max: number };     // 摇摆选民
    elites: { min: number; max: number };          // 精英阶层
    partyFactions: Record<Faction, { min: number; max: number }>; // 党内派系
    donors: { min: number; max: number };          // 金主
  };
  
  // 媒体反应预测
  mediaReaction: {
    friendly: string;  // 友好媒体标题
    neutral: string;   // 中立媒体标题
    hostile: string;   // 敌对媒体标题
  };
  
  // 风险提示
  risks: {
    factCheckRisk: number;      // 事实核查风险
    investigationRisk: number;  // 调查风险
    scandalRisk: number;        // 丑闻风险
    partySplitRisk: number;     // 党内分裂风险
  };
}

export interface SpeechTemplate {
  id: string;
  type: SpeechType;
  title: string;
  description: string;
  context: string;
  urgency: DecisionUrgency;
  turnsRemaining: number;
  
  segments: SpeechSegment[];
  
  minPosition: Position;
}

// 当前进行中的讲话
export interface ActiveSpeech {
  id: string;
  templateId: string;
  type: SpeechType;
  title: string;
  
  // 已选择的选项
  selectedOptions: {
    opening: string;
    core: string;
    closing: string;
  };
  
  // 累计表现值
  totalPerformance: {
    charisma: number;
    credibility: number;
    aggression: number;
    empathy: number;
  };
  
  // 预测效果
  predictedEffects: {
    support: { min: number; max: number };
    reputation: { min: number; max: number };
    media: { min: number; max: number };
    partyInfluence: { min: number; max: number };
  };
  
  turnsRemaining: number;
  createdTurn: number;
}

// ==================== 交易系统 ====================

export enum DealType {
  FUNDING = 'funding',           // 资金支持
  COMMITTEE_SEAT = 'committee',  // 委员会席位
  POLICY_SUPPORT = 'policy',     // 政策支持
  ENDORSEMENT = 'endorsement',   // 背书
  BLACKMAIL = 'blackmail',       // 黑料威胁
}

export interface Deal {
  id: string;
  type: DealType;
  target: string;              // 交易对象（议员/派系领袖）
  cost: {
    fundraising?: number;
    leverage?: number;
    partyInfluence?: number;
    reputation?: number;
  };
  benefit: number;             // 支持度提升
  betrayalChance: number;      // 背刺概率
  committed: boolean;
  turn: number;
}

// ==================== 议员/NPC 系统 ====================

export interface Legislator {
  id: string;
  name: string;
  party: Party;
  faction: Faction;
  position: Position;
  state: string;
  
  // 政策立场（多维向量）
  ideology: {
    economic: number;      // -100(左) ~ +100(右)
    social: number;
    foreign: number;
    environment: number;
  };
  
  // 特质
  traits: LegislatorTrait[];
  
  // 与玩家关系
  relationshipWithPlayer: number;  // -100 ~ +100
  
  // 说服难度
  persuasionDifficulty: number;
  
  // 当前状态
  committedVote?: 'yes' | 'no' | 'swing';
}

export enum LegislatorTrait {
  PRAGMATIST = 'pragmatist',       // 务实派
  IDEOLOGUE = 'ideologue',         // 意识形态强
  OPPORTUNIST = 'opportunist',      // 投机者
  MAVERICK = 'maverick',           // 独立派
  PARTY_LOYALIST = 'loyalist',     // 党内忠诚
  VULNERABLE = 'vulnerable',        // 选区不稳
  AMBITIOUS = 'ambitious',          // 有野心
}

// ==================== 媒体系统 ====================

export enum MediaAlignment {
  LEFT = 'left',
  CENTER_LEFT = 'center_left',
  CENTER = 'center',
  CENTER_RIGHT = 'center_right',
  RIGHT = 'right',
}

export interface MediaOutlet {
  id: string;
  name: string;
  alignment: MediaAlignment;
  reachPercentage: number;        // 覆盖人群比例
  attitudeToPlayer: number;       // -100(敌对) ~ +100(友好)
  credibility: number;            // 0~100
}

// ==================== 决策状态 ====================

export interface DecisionState {
  // 活跃决策
  activeBills: ActiveBill[];
  activeSpeeches: ActiveSpeech[];
  
  // 历史记录
  completedBills: ActiveBill[];
  completedSpeeches: ActiveSpeech[];
  
  // 政治账本
  dealLedger: Deal[];
  
  // 议员库
  legislators: Legislator[];
  
  // 媒体库
  mediaOutlets: MediaOutlet[];
  
  // 权力态势
  powerDynamics: {
    houseSeats: {
      democrat: number;
      republican: number;
      total: number;
    };
    senateSeats: {
      democrat: number;
      republican: number;
      total: number;
    };
    playerPartyStatus: {
      whipSupport: number;        // 党鞭支持度
      leadershipProbability: number; // 领袖提名概率
      factionInfluence: Record<Faction, number>;
    };
  };
  
  // 舆论态势
  publicOpinion: {
    pollTrend: number[];          // 近6回合民调
    baseVotersSupport: number;
    swingVotersSupport: number;
    elitesSupport: number;
    narrativeFrame: string;       // 当前公众形象
  };
  
  // 长期状态标记
  statusFlags: {
    underInvestigation: boolean;
    mediaHostile: boolean;
    partySplit: boolean;
    policyWinStreak: number;
    [key: string]: boolean | number;
  };
}

// ==================== 决策中心汇总 ====================

export interface DecisionSummary {
  pendingCount: number;
  highestUrgency: DecisionUrgency;
  criticalDeadlines: {
    type: DecisionType;
    id: string;
    title: string;
    turnsRemaining: number;
  }[];
}
