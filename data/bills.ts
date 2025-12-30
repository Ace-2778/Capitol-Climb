/**
 * 法案模板配置数据
 * 10+ 精心设计的法案，覆盖不同政策领域和权衡维度
 */

import { BillTemplate, BillCategory, DecisionScope, BillDimensions } from '@/types/decision';
import { Position, Faction } from '@/types/game';

export const BILL_TEMPLATES: BillTemplate[] = [
  // ========== 医疗改革 ==========
  {
    id: 'universal_healthcare',
    title: '全民医保扩展法案',
    category: BillCategory.HEALTHCARE,
    description: '扩大联邦医保覆盖范围，降低药价，但需大幅增加政府支出。',
    scope: DecisionScope.FEDERAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    
    defaultDimensions: {
      ideology: -60,        // 进步倾向
      spending: 80,         // 高预算
      enforcement: 50,
      transparency: 70,
      compromise: 30,
      pork: 0,
    },
    
    adjustableDimensions: ['ideology', 'spending', 'compromise', 'pork'],
    
    stakeholders: {
      supportiveFactions: [Faction.PROGRESSIVE],
      opposingFactions: [Faction.CONSERVATIVE],
      swingFactions: [Faction.MODERATE],
    },
    
    baseEffects: {
      support: 25,
      reputation: 15,
      fundraising: -30,  // 保险公司撤资
      partyInfluence: 20,
      media: 20,
      risk: 15,
    },
    
    longTermFlags: ['healthcare_reformer', 'progressive_champion', 'big_government'],
  },

  {
    id: 'health_market_reform',
    title: '医疗市场竞争法案',
    category: BillCategory.HEALTHCARE,
    description: '通过市场机制降低医疗成本，减少政府干预，但可能牺牲覆盖率。',
    scope: DecisionScope.FEDERAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    
    defaultDimensions: {
      ideology: 50,         // 保守倾向
      spending: 20,
      enforcement: 30,
      transparency: 60,
      compromise: 50,
      pork: 10,
    },
    
    adjustableDimensions: ['ideology', 'spending', 'enforcement', 'compromise'],
    
    stakeholders: {
      supportiveFactions: [Faction.CONSERVATIVE, Faction.MODERATE],
      opposingFactions: [Faction.PROGRESSIVE],
      swingFactions: [Faction.ESTABLISHMENT],
    },
    
    baseEffects: {
      support: -10,
      reputation: 10,
      fundraising: 40,  // 保险公司支持
      partyInfluence: 10,
      risk: 5,
    },
    
    longTermFlags: ['free_market_advocate', 'business_friendly'],
  },

  // ========== 经济政策 ==========
  {
    id: 'wealth_tax',
    title: '财富税法案',
    category: BillCategory.ECONOMY,
    description: '对超高净值人群征收财富税，用于基础设施和社会项目。',
    scope: DecisionScope.NATIONAL,
    minPosition: Position.SENATOR,
    
    defaultDimensions: {
      ideology: -70,
      spending: 60,
      enforcement: 80,
      transparency: 90,
      compromise: 20,
      pork: 5,
    },
    
    adjustableDimensions: ['ideology', 'enforcement', 'transparency', 'compromise', 'pork'],
    
    stakeholders: {
      supportiveFactions: [Faction.PROGRESSIVE],
      opposingFactions: [Faction.CONSERVATIVE, Faction.ESTABLISHMENT],
      swingFactions: [Faction.MODERATE],
    },
    
    baseEffects: {
      support: 30,
      reputation: 20,
      fundraising: -60,  // 大金主强烈反对
      partyInfluence: -15,
      media: 25,
      risk: 25,
    },
    
    longTermFlags: ['class_warrior', 'donor_enemy', 'populist_hero'],
  },

  {
    id: 'corporate_tax_cut',
    title: '企业税减免法案',
    category: BillCategory.ECONOMY,
    description: '大幅降低企业税率，刺激投资和就业，但可能扩大赤字。',
    scope: DecisionScope.FEDERAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    
    defaultDimensions: {
      ideology: 60,
      spending: -40,  // 负数表示减税
      enforcement: 20,
      transparency: 40,
      compromise: 60,
      pork: 30,  // 容易夹带私货
    },
    
    adjustableDimensions: ['ideology', 'spending', 'transparency', 'pork'],
    
    stakeholders: {
      supportiveFactions: [Faction.CONSERVATIVE, Faction.MODERATE],
      opposingFactions: [Faction.PROGRESSIVE],
      swingFactions: [Faction.ESTABLISHMENT],
    },
    
    baseEffects: {
      support: -5,
      reputation: 5,
      fundraising: 70,
      partyInfluence: 15,
      risk: 10,
    },
    
    longTermFlags: ['supply_side_economics', 'corporate_ally'],
  },

  {
    id: 'infrastructure_investment',
    title: '基础设施现代化法案',
    category: BillCategory.INFRASTRUCTURE,
    description: '投资数千亿美元更新道路、桥梁、电网和宽带网络。',
    scope: DecisionScope.NATIONAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    
    defaultDimensions: {
      ideology: 0,  // 跨党派
      spending: 85,
      enforcement: 60,
      transparency: 50,
      compromise: 70,
      pork: 40,  // 容易塞入地方项目
    },
    
    adjustableDimensions: ['spending', 'transparency', 'compromise', 'pork'],
    
    stakeholders: {
      supportiveFactions: [Faction.MODERATE, Faction.ESTABLISHMENT],
      opposingFactions: [],
      swingFactions: [Faction.PROGRESSIVE, Faction.CONSERVATIVE],
    },
    
    baseEffects: {
      support: 20,
      reputation: 25,
      fundraising: 10,
      partyInfluence: 20,
      media: 15,
      risk: 20,  // pork 风险
    },
    
    longTermFlags: ['dealmaker', 'pork_barrel_master'],
  },

  // ========== 环境政策 ==========
  {
    id: 'green_new_deal',
    title: '绿色新政法案',
    category: BillCategory.ENVIRONMENT,
    description: '激进的气候行动计划，承诺10年内实现碳中和，但成本巨大。',
    scope: DecisionScope.NATIONAL,
    minPosition: Position.SENATOR,
    
    defaultDimensions: {
      ideology: -80,
      spending: 95,
      enforcement: 90,
      transparency: 85,
      compromise: 10,
      pork: 0,
    },
    
    adjustableDimensions: ['ideology', 'spending', 'enforcement', 'compromise'],
    
    stakeholders: {
      supportiveFactions: [Faction.PROGRESSIVE],
      opposingFactions: [Faction.CONSERVATIVE, Faction.ESTABLISHMENT],
      swingFactions: [Faction.MODERATE],
    },
    
    baseEffects: {
      support: 20,
      reputation: 30,
      fundraising: -50,  // 能源公司撤资
      partyInfluence: -10,
      media: 35,
      risk: 30,
    },
    
    longTermFlags: ['climate_hero', 'energy_industry_enemy', 'visionary'],
  },

  {
    id: 'energy_independence',
    title: '能源独立法案',
    category: BillCategory.ENVIRONMENT,
    description: '扩大国内石油天然气开采，同时投资可再生能源，平衡能源安全与环保。',
    scope: DecisionScope.FEDERAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    
    defaultDimensions: {
      ideology: 20,
      spending: 50,
      enforcement: 40,
      transparency: 60,
      compromise: 80,
      pork: 20,
    },
    
    adjustableDimensions: ['ideology', 'spending', 'compromise', 'pork'],
    
    stakeholders: {
      supportiveFactions: [Faction.MODERATE, Faction.CONSERVATIVE],
      opposingFactions: [Faction.PROGRESSIVE],
      swingFactions: [Faction.ESTABLISHMENT],
    },
    
    baseEffects: {
      support: 10,
      reputation: 15,
      fundraising: 30,
      partyInfluence: 15,
      risk: 10,
    },
    
    longTermFlags: ['energy_pragmatist', 'both_sides_player'],
  },

  // ========== 移民政策 ==========
  {
    id: 'immigration_reform',
    title: '全面移民改革法案',
    category: BillCategory.IMMIGRATION,
    description: '为无证移民提供入籍途径，同时加强边境安全。',
    scope: DecisionScope.FEDERAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    
    defaultDimensions: {
      ideology: -30,
      spending: 60,
      enforcement: 60,
      transparency: 70,
      compromise: 75,
      pork: 15,
    },
    
    adjustableDimensions: ['ideology', 'enforcement', 'compromise', 'pork'],
    
    stakeholders: {
      supportiveFactions: [Faction.PROGRESSIVE, Faction.MODERATE],
      opposingFactions: [Faction.CONSERVATIVE],
      swingFactions: [Faction.ESTABLISHMENT],
    },
    
    baseEffects: {
      support: 15,
      reputation: 20,
      fundraising: -10,
      partyInfluence: 10,
      media: 20,
      risk: 25,
    },
    
    longTermFlags: ['immigration_reformer', 'latino_community_hero'],
  },

  {
    id: 'border_security_act',
    title: '边境安全强化法案',
    category: BillCategory.IMMIGRATION,
    description: '大幅增加边境执法资源,收紧庇护政策，强硬应对非法移民。',
    scope: DecisionScope.FEDERAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    
    defaultDimensions: {
      ideology: 70,
      spending: 50,
      enforcement: 95,
      transparency: 40,
      compromise: 20,
      pork: 25,
    },
    
    adjustableDimensions: ['enforcement', 'transparency', 'compromise', 'pork'],
    
    stakeholders: {
      supportiveFactions: [Faction.CONSERVATIVE],
      opposingFactions: [Faction.PROGRESSIVE, Faction.MODERATE],
      swingFactions: [Faction.ESTABLISHMENT],
    },
    
    baseEffects: {
      support: -15,
      reputation: -10,
      fundraising: 20,
      partyInfluence: -5,
      media: -15,
      risk: 20,
    },
    
    longTermFlags: ['hardliner', 'immigration_hawk', 'base_favorite'],
  },

  // ========== 教育政策 ==========
  {
    id: 'free_college',
    title: '免费公立大学法案',
    category: BillCategory.EDUCATION,
    description: '取消公立大学学费，免除学生贷款，通过增税筹资。',
    scope: DecisionScope.NATIONAL,
    minPosition: Position.SENATOR,
    
    defaultDimensions: {
      ideology: -75,
      spending: 90,
      enforcement: 70,
      transparency: 80,
      compromise: 25,
      pork: 0,
    },
    
    adjustableDimensions: ['ideology', 'spending', 'compromise'],
    
    stakeholders: {
      supportiveFactions: [Faction.PROGRESSIVE],
      opposingFactions: [Faction.CONSERVATIVE, Faction.MODERATE],
      swingFactions: [Faction.ESTABLISHMENT],
    },
    
    baseEffects: {
      support: 35,
      reputation: 25,
      fundraising: -40,
      partyInfluence: -5,
      media: 30,
      risk: 20,
    },
    
    longTermFlags: ['education_champion', 'youth_hero', 'socialist_label'],
  },

  {
    id: 'school_choice',
    title: '教育选择权法案',
    category: BillCategory.EDUCATION,
    description: '扩大教育券制度，允许公共资金用于私立和宗教学校。',
    scope: DecisionScope.FEDERAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    
    defaultDimensions: {
      ideology: 60,
      spending: 30,
      enforcement: 40,
      transparency: 50,
      compromise: 55,
      pork: 20,
    },
    
    adjustableDimensions: ['ideology', 'spending', 'compromise', 'pork'],
    
    stakeholders: {
      supportiveFactions: [Faction.CONSERVATIVE],
      opposingFactions: [Faction.PROGRESSIVE, Faction.MODERATE],
      swingFactions: [Faction.ESTABLISHMENT],
    },
    
    baseEffects: {
      support: -5,
      reputation: 5,
      fundraising: 30,
      partyInfluence: 10,
      risk: 15,
    },
    
    longTermFlags: ['school_choice_advocate', 'teacher_union_enemy'],
  },

  // ========== 司法改革 ==========
  {
    id: 'criminal_justice_reform',
    title: '刑事司法改革法案',
    category: BillCategory.JUSTICE,
    description: '减少监禁刑期，消除强制性最低刑期，投资复归项目。',
    scope: DecisionScope.FEDERAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    
    defaultDimensions: {
      ideology: -50,
      spending: 40,
      enforcement: 20,
      transparency: 75,
      compromise: 65,
      pork: 10,
    },
    
    adjustableDimensions: ['ideology', 'enforcement', 'compromise', 'pork'],
    
    stakeholders: {
      supportiveFactions: [Faction.PROGRESSIVE, Faction.MODERATE],
      opposingFactions: [Faction.CONSERVATIVE],
      swingFactions: [Faction.ESTABLISHMENT],
    },
    
    baseEffects: {
      support: 15,
      reputation: 18,
      fundraising: -5,
      partyInfluence: 12,
      media: 15,
      risk: 18,
    },
    
    longTermFlags: ['justice_reformer', 'soft_on_crime_label'],
  },

  // ========== 国防政策 ==========
  {
    id: 'defense_spending_increase',
    title: '国防预算扩增法案',
    category: BillCategory.DEFENSE,
    description: '大幅提升国防预算，现代化军事装备，应对新兴威胁。',
    scope: DecisionScope.NATIONAL,
    minPosition: Position.SENATOR,
    
    defaultDimensions: {
      ideology: 40,
      spending: 85,
      enforcement: 80,
      transparency: 30,  // 国防支出不透明
      compromise: 50,
      pork: 45,  // 军工项目容易分配
    },
    
    adjustableDimensions: ['spending', 'transparency', 'pork'],
    
    stakeholders: {
      supportiveFactions: [Faction.CONSERVATIVE, Faction.ESTABLISHMENT],
      opposingFactions: [Faction.PROGRESSIVE],
      swingFactions: [Faction.MODERATE],
    },
    
    baseEffects: {
      support: 0,
      reputation: 10,
      fundraising: 50,  // 军工企业支持
      partyInfluence: 15,
      risk: 25,
    },
    
    longTermFlags: ['defense_hawk', 'military_industrial_ally'],
  },
];
