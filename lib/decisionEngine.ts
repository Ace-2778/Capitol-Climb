/**
 * 重大决策引擎
 * 负责生成、评估、执行法案和讲话决策
 */

import {
  ActiveBill,
  ActiveSpeech,
  BillTemplate,
  SpeechTemplate,
  BillStatus,
  Legislator,
  LegislatorTrait,
  Deal,
  DealType,
  BillDimensions,
} from '@/types/decision';
import { Player, NationalState, Party, Faction, Position } from '@/types/game';
import { SeededRandom } from '@/types/game';
import { BILL_TEMPLATES } from '@/data/bills';
import { SPEECH_TEMPLATES } from '@/data/speeches';

// ==================== 决策生成引擎 ====================

export class DecisionGenerator {
  private random: SeededRandom;

  constructor(seed: number) {
    this.random = new SeededRandom(seed);
  }

  // 生成可用的法案（降低频率，基于条件触发）
  generateAvailableBills(player: Player, turn: number): ActiveBill[] {
    const available = BILL_TEMPLATES.filter(
      (template) => player.position >= template.minPosition
    );

    if (available.length === 0) return [];

    // 30%概率生成法案（不再固定回合）
    if (this.random.next() > 0.3) return [];

    // 只生成1个法案
    const selected = this.random.shuffle(available).slice(0, 1);

    return selected.map((template) => this.createActiveBill(template, turn));
  }

  // 创建活跃法案实例
  private createActiveBill(template: BillTemplate, turn: number): ActiveBill {
    return {
      id: `bill_${turn}_${this.random.next()}`,
      templateId: template.id,
      title: template.title,
      category: template.category,
      status: BillStatus.DRAFTING,
      dimensions: { ...template.defaultDimensions },
      turnsRemaining: 10, // 10回合内必须完成
      maxTurns: 10,
      support: {
        democratSupport: 45 + this.random.nextInt(-10, 10),
        republicanSupport: 45 + this.random.nextInt(-10, 10),
        factionSupport: {
          [Faction.PROGRESSIVE]: 50,
          [Faction.MODERATE]: 50,
          [Faction.CONSERVATIVE]: 50,
          [Faction.ESTABLISHMENT]: 50,
        },
        committeeApproval: 50,
        mediaSupport: 50,
        publicSupport: 50,
      },
      passageProbability: { min: 40, max: 60 },
      deals: [],
      risks: {
        investigationRisk: 5,
        scandalRisk: 5,
        partySplitRisk: 5,
      },
      createdTurn: turn,
    };
  }

  // 生成可用的讲话（降低频率，基于条件触发）
  generateAvailableSpeeches(player: Player, turn: number): ActiveSpeech[] {
    const available = SPEECH_TEMPLATES.filter(
      (template) => player.position >= template.minPosition
    );

    if (available.length === 0) return [];

    // 20%概率生成讲话机会（不再固定回合）
    if (this.random.next() > 0.2) return [];

    const template = this.random.choice(available);
    if (!template) return [];

    return [this.createActiveSpeech(template, turn)];
  }

  // 创建活跃讲话实例
  private createActiveSpeech(template: SpeechTemplate, turn: number): ActiveSpeech {
    return {
      id: `speech_${turn}_${this.random.next()}`,
      templateId: template.id,
      type: template.type,
      title: template.title,
      selectedOptions: {
        opening: '',
        core: '',
        closing: '',
      },
      totalPerformance: {
        charisma: 0,
        credibility: 0,
        aggression: 0,
        empathy: 0,
      },
      predictedEffects: {
        support: { min: 0, max: 0 },
        reputation: { min: 0, max: 0 },
        media: { min: 0, max: 0 },
        partyInfluence: { min: 0, max: 0 },
      },
      turnsRemaining: template.turnsRemaining,
      createdTurn: turn,
    };
  }
}

// ==================== 法案评估引擎 ====================

export class BillEvaluator {
  // 根据法案维度计算各派系支持度
  calculateFactionSupport(
    dimensions: BillDimensions,
    faction: Faction
  ): number {
    let support = 50; // 基础值

    switch (faction) {
      case Faction.PROGRESSIVE:
        support += (dimensions.ideology * -1) / 2; // 进步派喜欢负值（进步倾向）
        support += dimensions.spending / 2;
        support += dimensions.transparency / 2;
        support -= dimensions.compromise / 2;
        break;

      case Faction.CONSERVATIVE:
        support += dimensions.ideology / 2; // 保守派喜欢正值
        support -= dimensions.spending / 2;
        support += dimensions.enforcement / 2;
        support -= dimensions.transparency / 4;
        break;

      case Faction.MODERATE:
        support += Math.abs(dimensions.ideology) * -0.5; // 温和派不喜欢极端
        support += dimensions.compromise / 1.5;
        support += dimensions.transparency / 3;
        break;

      case Faction.ESTABLISHMENT:
        support -= Math.abs(dimensions.ideology) * 0.3;
        support += dimensions.compromise / 2;
        support -= dimensions.pork * 0.5; // 建制派反对过多私货
        break;
    }

    return Math.max(0, Math.min(100, support));
  }

  // 计算通过概率
  calculatePassageProbability(bill: ActiveBill, player: Player): { min: number; max: number } {
    let baseProb = 50;

    // 党派支持度影响
    const partySupport = player.party === Party.DEMOCRAT 
      ? bill.support.democratSupport 
      : bill.support.republicanSupport;
    baseProb += (partySupport - 50) * 0.5;

    // 委员会支持度
    baseProb += (bill.support.committeeApproval - 50) * 0.3;

    // 公众支持度
    baseProb += (bill.support.publicSupport - 50) * 0.2;

    // 玩家影响力
    baseProb += player.partyInfluence * 0.2;
    baseProb += player.leverage * 0.1;

    // 交易带来的确定性支持
    const dealBonus = bill.deals.reduce((sum, deal) => sum + deal.benefit, 0);
    baseProb += dealBonus;

    // 计算区间（不确定性）
    const uncertainty = 15 - bill.deals.length * 2; // 交易越多，不确定性越低
    const min = Math.max(0, Math.min(95, baseProb - uncertainty));
    const max = Math.max(5, Math.min(100, baseProb + uncertainty));

    return { min, max };
  }

  // 计算风险值
  calculateRisks(bill: ActiveBill, dimensions: BillDimensions): void {
    bill.risks.investigationRisk = 5 + dimensions.pork / 2 - dimensions.transparency / 4;
    bill.risks.scandalRisk = 5 + dimensions.pork / 3 - dimensions.transparency / 3;
    bill.risks.partySplitRisk = Math.abs(dimensions.ideology) / 3 + (100 - dimensions.compromise) / 4;

    // 确保范围
    bill.risks.investigationRisk = Math.max(0, Math.min(100, bill.risks.investigationRisk));
    bill.risks.scandalRisk = Math.max(0, Math.min(100, bill.risks.scandalRisk));
    bill.risks.partySplitRisk = Math.max(0, Math.min(100, bill.risks.partySplitRisk));
  }

  // 更新法案支持度（当维度改变时）
  updateBillSupport(bill: ActiveBill, template: BillTemplate): void {
    // 更新派系支持度
    Object.values(Faction).forEach((faction) => {
      bill.support.factionSupport[faction] = this.calculateFactionSupport(bill.dimensions, faction);
    });

    // 更新政党支持度（基于派系加权平均）
    bill.support.democratSupport = (
      bill.support.factionSupport[Faction.PROGRESSIVE] * 0.4 +
      bill.support.factionSupport[Faction.MODERATE] * 0.35 +
      bill.support.factionSupport[Faction.ESTABLISHMENT] * 0.25
    );

    bill.support.republicanSupport = (
      bill.support.factionSupport[Faction.CONSERVATIVE] * 0.5 +
      bill.support.factionSupport[Faction.MODERATE] * 0.3 +
      bill.support.factionSupport[Faction.ESTABLISHMENT] * 0.2
    );

    // 更新媒体支持度
    bill.support.mediaSupport = 50 + bill.dimensions.transparency / 3 - bill.dimensions.pork / 2;

    // 更新公众支持度
    bill.support.publicSupport = 50 + (bill.dimensions.ideology * -0.3) + bill.dimensions.transparency / 4;

    // 更新风险
    this.calculateRisks(bill, bill.dimensions);
  }
}

// ==================== 法案执行引擎 ====================

export class BillExecutor {
  private random: SeededRandom;
  private evaluator: BillEvaluator;

  constructor(seed: number) {
    this.random = new SeededRandom(seed);
    this.evaluator = new BillEvaluator();
  }

  // 推进法案到下一阶段
  advanceBillStatus(bill: ActiveBill): { success: boolean; message: string } {
    switch (bill.status) {
      case BillStatus.DRAFTING:
        bill.status = BillStatus.COMMITTEE;
        return { success: true, message: '法案已提交委员会审议' };

      case BillStatus.COMMITTEE:
        if (bill.support.committeeApproval >= 50) {
          bill.status = BillStatus.CAUCUS;
          return { success: true, message: '法案通过委员会审议，进入党内协调' };
        } else {
          bill.status = BillStatus.SHELVED;
          return { success: false, message: '法案在委员会被否决' };
        }

      case BillStatus.CAUCUS:
        bill.status = BillStatus.FLOOR_VOTE;
        return { success: true, message: '法案进入议会表决阶段' };

      case BillStatus.FLOOR_VOTE:
        return this.executeFloorVote(bill);

      default:
        return { success: false, message: '法案已结束' };
    }
  }

  // 执行最终投票
  private executeFloorVote(bill: ActiveBill): { success: boolean; message: string } {
    const prob = bill.passageProbability;
    const roll = this.random.next() * 100;
    const threshold = (prob.min + prob.max) / 2;

    // 检查交易背叛
    let betrayalPenalty = 0;
    bill.deals.forEach((deal) => {
      if (this.random.next() < deal.betrayalChance) {
        betrayalPenalty += deal.benefit;
      }
    });

    const finalRoll = roll - betrayalPenalty;

    if (finalRoll < threshold) {
      bill.status = BillStatus.PASSED;
      return { success: true, message: `法案以 ${Math.floor(threshold)}% 的支持率通过！` };
    } else {
      bill.status = BillStatus.REJECTED;
      return { success: false, message: `法案以 ${Math.floor(100 - threshold)}% 的票数被否决` };
    }
  }

  // 创建交易
  createDeal(
    bill: ActiveBill,
    type: DealType,
    target: string,
    cost: Deal['cost'],
    benefit: number,
    turn: number
  ): Deal {
    const betrayalChance = this.calculateBetrayalChance(type, benefit);

    const deal: Deal = {
      id: `deal_${turn}_${this.random.next()}`,
      type,
      target,
      cost,
      benefit,
      betrayalChance,
      committed: true,
      turn,
    };

    bill.deals.push(deal);
    return deal;
  }

  // 计算背叛概率
  private calculateBetrayalChance(type: DealType, benefit: number): number {
    let baseChance = 0.1;

    switch (type) {
      case DealType.FUNDING:
        baseChance = 0.15; // 金钱交易较可靠
        break;
      case DealType.COMMITTEE_SEAT:
        baseChance = 0.1; // 职位承诺可靠
        break;
      case DealType.POLICY_SUPPORT:
        baseChance = 0.25; // 政策支持容易变卦
        break;
      case DealType.BLACKMAIL:
        baseChance = 0.4; // 威胁最不可靠
        break;
      case DealType.ENDORSEMENT:
        baseChance = 0.2;
        break;
    }

    // 利益越大，背叛风险越高
    baseChance += benefit * 0.005;

    return Math.min(0.5, baseChance);
  }
}

// ==================== 讲话执行引擎 ====================

export class SpeechExecutor {
  private random: SeededRandom;

  constructor(seed: number) {
    this.random = new SeededRandom(seed);
  }

  // 执行讲话并生成结果
  executeSpeech(
    speech: ActiveSpeech,
    template: SpeechTemplate,
    player: Player
  ): {
    support: number;
    reputation: number;
    media: number;
    partyInfluence: number;
    fundraising: number;
    risks: { investigation: number; scandal: number; partySplit: number };
    headlines: { friendly: string; neutral: string; hostile: string };
  } {
    // 获取选定的选项
    const segments = template.segments;
    const openingOption = segments[0].options.find((o) => o.id === speech.selectedOptions.opening);
    const coreOption = segments[1].options.find((o) => o.id === speech.selectedOptions.core);
    const closingOption = segments[2].options.find((o) => o.id === speech.selectedOptions.closing);

    if (!openingOption || !coreOption || !closingOption) {
      throw new Error('Invalid speech options');
    }

    // 计算基础效果（从预测范围中随机）
    const support = this.randomInRange(speech.predictedEffects.support);
    const reputation = this.randomInRange(speech.predictedEffects.reputation);
    const media = this.randomInRange(speech.predictedEffects.media);
    const partyInfluence = this.randomInRange(speech.predictedEffects.partyInfluence);

    // 根据表现值调整募资能力
    const charismaBonus = speech.totalPerformance.charisma / 5;
    const fundraising = charismaBonus + this.random.nextInt(-10, 10);

    // 累计风险
    const risks = {
      investigation: (openingOption.risks.investigationRisk + coreOption.risks.investigationRisk + closingOption.risks.investigationRisk) / 3,
      scandal: (openingOption.risks.scandalRisk + coreOption.risks.scandalRisk + closingOption.risks.scandalRisk) / 3,
      partySplit: (openingOption.risks.partySplitRisk + coreOption.risks.partySplitRisk + closingOption.risks.partySplitRisk) / 3,
    };

    // 生成媒体标题（使用core段的标题）
    const headlines = coreOption.mediaReaction;

    return {
      support,
      reputation,
      media,
      partyInfluence,
      fundraising,
      risks,
      headlines,
    };
  }

  // 计算预测效果（当选项改变时）
  calculatePredictedEffects(
    speech: ActiveSpeech,
    template: SpeechTemplate,
    openingId: string,
    coreId: string,
    closingId: string
  ): void {
    const segments = template.segments;
    const openingOption = segments[0].options.find((o) => o.id === openingId);
    const coreOption = segments[1].options.find((o) => o.id === coreId);
    const closingOption = segments[2].options.find((o) => o.id === closingId);

    if (!openingOption || !coreOption || !closingOption) return;

    // 累计表现值
    speech.totalPerformance.charisma =
      openingOption.performance.charisma +
      coreOption.performance.charisma +
      closingOption.performance.charisma;
    speech.totalPerformance.credibility =
      openingOption.performance.credibility +
      coreOption.performance.credibility +
      closingOption.performance.credibility;
    speech.totalPerformance.aggression =
      openingOption.performance.aggression +
      coreOption.performance.aggression +
      closingOption.performance.aggression;
    speech.totalPerformance.empathy =
      openingOption.performance.empathy +
      coreOption.performance.empathy +
      closingOption.performance.empathy;

    // 计算对各受众的影响（取平均）
    const avgBaseVoters = this.average([
      openingOption.audienceImpact.baseVoters,
      coreOption.audienceImpact.baseVoters,
      closingOption.audienceImpact.baseVoters,
    ]);

    const avgSwingVoters = this.average([
      openingOption.audienceImpact.swingVoters,
      coreOption.audienceImpact.swingVoters,
      closingOption.audienceImpact.swingVoters,
    ]);

    const avgElites = this.average([
      openingOption.audienceImpact.elites,
      coreOption.audienceImpact.elites,
      closingOption.audienceImpact.elites,
    ]);

    // 预测效果
    speech.predictedEffects.support = {
      min: avgBaseVoters.min * 0.5 + avgSwingVoters.min * 0.5,
      max: avgBaseVoters.max * 0.5 + avgSwingVoters.max * 0.5,
    };

    speech.predictedEffects.reputation = {
      min: (avgBaseVoters.min + avgElites.min) / 2,
      max: (avgBaseVoters.max + avgElites.max) / 2,
    };

    speech.predictedEffects.media = {
      min: avgElites.min * 0.7 + avgSwingVoters.min * 0.3,
      max: avgElites.max * 0.7 + avgSwingVoters.max * 0.3,
    };

    // 党内影响力（基于派系反应）
    const factionAvg = this.averageFactionImpact(openingOption, coreOption, closingOption);
    speech.predictedEffects.partyInfluence = factionAvg;
  }

  private average(ranges: Array<{ min: number; max: number }>): { min: number; max: number } {
    const min = ranges.reduce((sum, r) => sum + r.min, 0) / ranges.length;
    const max = ranges.reduce((sum, r) => sum + r.max, 0) / ranges.length;
    return { min, max };
  }

  private averageFactionImpact(...options: any[]): { min: number; max: number } {
    const allFactions = Object.values(Faction);
    let totalMin = 0;
    let totalMax = 0;

    options.forEach((option) => {
      allFactions.forEach((faction) => {
        const impact = option.audienceImpact.partyFactions[faction];
        if (impact) {
          totalMin += impact.min;
          totalMax += impact.max;
        }
      });
    });

    return {
      min: totalMin / (allFactions.length * options.length),
      max: totalMax / (allFactions.length * options.length),
    };
  }

  private randomInRange(range: { min: number; max: number }): number {
    return Math.floor(range.min + this.random.next() * (range.max - range.min));
  }
}

// ==================== 议员生成器 ====================

export class LegislatorGenerator {
  private random: SeededRandom;
  private namePool = [
    'Senator Johnson', 'Rep. Williams', 'Senator Martinez', 'Rep. Davis',
    'Senator Anderson', 'Rep. Taylor', 'Senator Thompson', 'Rep. Garcia',
    'Senator Wilson', 'Rep. Rodriguez', 'Senator Lee', 'Rep. Walker',
    'Senator Hall', 'Rep. Young', 'Senator King', 'Rep. Wright',
  ];

  constructor(seed: number) {
    this.random = new SeededRandom(seed);
  }

  generateLegislators(count: number, playerParty: Party): Legislator[] {
    const legislators: Legislator[] = [];

    for (let i = 0; i < count; i++) {
      const party = this.random.next() > 0.5 ? Party.DEMOCRAT : Party.REPUBLICAN;
      const faction = this.random.choice(Object.values(Faction))!;

      legislators.push({
        id: `legislator_${i}`,
        name: this.namePool[i % this.namePool.length],
        party,
        faction,
        position: this.random.choice([Position.HOUSE_REPRESENTATIVE, Position.SENATOR])!,
        state: 'Various',
        ideology: {
          economic: this.random.nextInt(-80, 80),
          social: this.random.nextInt(-80, 80),
          foreign: this.random.nextInt(-80, 80),
          environment: this.random.nextInt(-80, 80),
        },
        traits: this.generateTraits(),
        relationshipWithPlayer: party === playerParty ? this.random.nextInt(0, 40) : this.random.nextInt(-20, 20),
        persuasionDifficulty: this.random.nextInt(20, 80),
        committedVote: 'swing',
      });
    }

    return legislators;
  }

  private generateTraits(): LegislatorTrait[] {
    const traits: LegislatorTrait[] = [];
    const allTraits = Object.values(LegislatorTrait);
    
    const count = this.random.nextInt(1, 3);
    for (let i = 0; i < count; i++) {
      const trait = this.random.choice(allTraits);
      if (trait && !traits.includes(trait)) {
        traits.push(trait);
      }
    }

    return traits;
  }
}
