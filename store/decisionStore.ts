/**
 * 重大决策系统 Zustand Store
 * 管理法案、讲话、议员、交易等所有决策相关状态
 */

import { create } from 'zustand';
import {
  DecisionState,
  ActiveBill,
  ActiveSpeech,
  BillDimensions,
  DealType,
  DecisionSummary,
  DecisionUrgency,
  Legislator,
  MediaOutlet,
  MediaAlignment,
  BillStatus,
} from '@/types/decision';
import { Party, Faction } from '@/types/game';
import {
  DecisionGenerator,
  BillEvaluator,
  BillExecutor,
  SpeechExecutor,
  LegislatorGenerator,
} from '@/lib/decisionEngine';
import { BILL_TEMPLATES } from '@/data/bills';
import { SPEECH_TEMPLATES } from '@/data/speeches';

interface DecisionStore extends DecisionState {
  // 引擎实例
  generator: DecisionGenerator | null;
  billEvaluator: BillEvaluator;
  billExecutor: BillExecutor | null;
  speechExecutor: SpeechExecutor | null;
  legislatorGenerator: LegislatorGenerator | null;

  // 初始化
  initializeDecisionSystem: (seed: number, playerParty: Party) => void;

  // 法案操作
  generateNewBills: (player: any, turn: number) => void;
  adjustBillDimension: (billId: string, dimension: keyof BillDimensions, value: number) => void;
  advanceBill: (billId: string) => { success: boolean; message: string };
  createBillDeal: (billId: string, dealType: DealType, target: string, cost: any, benefit: number, turn: number) => void;
  
  // 讲话操作
  generateNewSpeeches: (player: any, turn: number) => void;
  selectSpeechOption: (speechId: string, segment: 'opening' | 'core' | 'closing', optionId: string) => void;
  executeSpeechAndApply: (speechId: string, player: any) => any;

  // 辅助方法
  getDecisionSummary: () => DecisionSummary;
  getActiveBillById: (billId: string) => ActiveBill | undefined;
  getActiveSpeechById: (speechId: string) => ActiveSpeech | undefined;
}

export const useDecisionStore = create<DecisionStore>((set, get) => ({
  // 初始状态
  activeBills: [],
  activeSpeeches: [],
  completedBills: [],
  completedSpeeches: [],
  dealLedger: [],
  legislators: [],
  mediaOutlets: [],
  
  powerDynamics: {
    houseSeats: {
      democrat: 220,
      republican: 215,
      total: 435,
    },
    senateSeats: {
      democrat: 51,
      republican: 49,
      total: 100,
    },
    playerPartyStatus: {
      whipSupport: 50,
      leadershipProbability: 30,
      factionInfluence: {
        [Faction.PROGRESSIVE]: 40,
        [Faction.MODERATE]: 50,
        [Faction.CONSERVATIVE]: 40,
        [Faction.ESTABLISHMENT]: 45,
      },
    },
  },

  publicOpinion: {
    pollTrend: [48, 49, 47, 50, 49, 51],
    baseVotersSupport: 65,
    swingVotersSupport: 42,
    elitesSupport: 38,
    narrativeFrame: '新兴政治人物',
  },

  statusFlags: {
    underInvestigation: false,
    mediaHostile: false,
    partySplit: false,
    policyWinStreak: 0,
  },

  // 引擎实例
  generator: null,
  billEvaluator: new BillEvaluator(),
  billExecutor: null,
  speechExecutor: null,
  legislatorGenerator: null,

  // ==================== 初始化 ====================
  initializeDecisionSystem: (seed: number, playerParty: Party) => {
    const generator = new DecisionGenerator(seed);
    const billExecutor = new BillExecutor(seed);
    const speechExecutor = new SpeechExecutor(seed);
    const legislatorGenerator = new LegislatorGenerator(seed);

    // 生成议员库
    const legislators = legislatorGenerator.generateLegislators(20, playerParty);

    // 生成媒体库
    const mediaOutlets: MediaOutlet[] = [
      {
        id: 'cnn',
        name: 'CNN',
        alignment: MediaAlignment.CENTER_LEFT,
        reachPercentage: 18,
        attitudeToPlayer: 10,
        credibility: 70,
      },
      {
        id: 'fox',
        name: 'Fox News',
        alignment: MediaAlignment.RIGHT,
        reachPercentage: 22,
        attitudeToPlayer: playerParty === Party.REPUBLICAN ? 20 : -30,
        credibility: 65,
      },
      {
        id: 'msnbc',
        name: 'MSNBC',
        alignment: MediaAlignment.LEFT,
        reachPercentage: 12,
        attitudeToPlayer: playerParty === Party.DEMOCRAT ? 25 : -20,
        credibility: 68,
      },
      {
        id: 'nyt',
        name: 'New York Times',
        alignment: MediaAlignment.CENTER_LEFT,
        reachPercentage: 15,
        attitudeToPlayer: 5,
        credibility: 85,
      },
      {
        id: 'wsj',
        name: 'Wall Street Journal',
        alignment: MediaAlignment.CENTER_RIGHT,
        reachPercentage: 10,
        attitudeToPlayer: 0,
        credibility: 82,
      },
    ];

    set({
      generator,
      billExecutor,
      speechExecutor,
      legislatorGenerator,
      legislators,
      mediaOutlets,
    });
  },

  // ==================== 法案操作 ====================
  generateNewBills: (player, turn) => {
    const { generator } = get();
    if (!generator) return;

    const newBills = generator.generateAvailableBills(player, turn);
    if (newBills.length > 0) {
      set((state) => {
        // 去重：检查templateId是否已存在
        const existingTemplateIds = new Set(
          state.activeBills.map((b) => b.templateId)
        );
        const uniqueNewBills = newBills.filter(
          (b) => !existingTemplateIds.has(b.templateId)
        );
        return {
          activeBills: [...state.activeBills, ...uniqueNewBills],
        };
      });
    }
  },

  adjustBillDimension: (billId, dimension, value) => {
    const { billEvaluator } = get();
    set((state) => {
      const bills = state.activeBills.map((bill) => {
        if (bill.id === billId) {
          // 更新维度
          const updatedBill = {
            ...bill,
            dimensions: {
              ...bill.dimensions,
              [dimension]: value,
            },
          };

          // 重新计算支持度和风险
          const template = BILL_TEMPLATES.find((t) => t.id === bill.templateId);
          if (template) {
            billEvaluator.updateBillSupport(updatedBill, template);
            updatedBill.passageProbability = billEvaluator.calculatePassageProbability(updatedBill, { partyInfluence: 50, leverage: 50 } as any);
          }

          return updatedBill;
        }
        return bill;
      });

      return { activeBills: bills };
    });
  },

  advanceBill: (billId) => {
    const { billExecutor, billEvaluator } = get();
    if (!billExecutor) return { success: false, message: '系统未初始化' };

    const bill = get().activeBills.find((b) => b.id === billId);
    if (!bill) return { success: false, message: '法案不存在' };

    // 推进法案
    const result = billExecutor.advanceBillStatus(bill);

    // 更新状态
    set((state) => {
      const bills = state.activeBills.map((b) => (b.id === billId ? bill : b));
      
      // 如果法案结束，移至completed
      if (bill.status === BillStatus.PASSED || bill.status === BillStatus.REJECTED || bill.status === BillStatus.SHELVED) {
        return {
          activeBills: bills.filter((b) => b.id !== billId),
          completedBills: [...state.completedBills, bill],
        };
      }

      return { activeBills: bills };
    });

    return result;
  },

  createBillDeal: (billId, dealType, target, cost, benefit, turn) => {
    const { billExecutor } = get();
    if (!billExecutor) return;

    set((state) => {
      const bills = state.activeBills.map((bill) => {
        if (bill.id === billId) {
          const deal = billExecutor.createDeal(bill, dealType, target, cost, benefit, turn);
          
          // 更新通过概率
          bill.passageProbability = {
            min: Math.min(95, bill.passageProbability.min + benefit / 2),
            max: Math.min(100, bill.passageProbability.max + benefit / 2),
          };

          return bill;
        }
        return bill;
      });

      return {
        activeBills: bills,
        dealLedger: [...state.dealLedger, ...bills.flatMap((b) => b.deals)],
      };
    });
  },

  // ==================== 讲话操作 ====================
  generateNewSpeeches: (player, turn) => {
    const { generator } = get();
    if (!generator) return;

    const newSpeeches = generator.generateAvailableSpeeches(player, turn);
    if (newSpeeches.length > 0) {
      set((state) => {
        // 去重：检查templateId是否已存在
        const existingTemplateIds = new Set(
          state.activeSpeeches.map((s) => s.templateId)
        );
        const uniqueNewSpeeches = newSpeeches.filter(
          (s) => !existingTemplateIds.has(s.templateId)
        );
        return {
          activeSpeeches: [...state.activeSpeeches, ...uniqueNewSpeeches],
        };
      });
    }
  },

  selectSpeechOption: (speechId, segment, optionId) => {
    const { speechExecutor } = get();
    if (!speechExecutor) return;

    set((state) => {
      const speeches = state.activeSpeeches.map((speech) => {
        if (speech.id === speechId) {
          const updatedSpeech = {
            ...speech,
            selectedOptions: {
              ...speech.selectedOptions,
              [segment]: optionId,
            },
          };

          // 如果三段都选了，重新计算预测效果
          if (updatedSpeech.selectedOptions.opening && 
              updatedSpeech.selectedOptions.core && 
              updatedSpeech.selectedOptions.closing) {
            const template = SPEECH_TEMPLATES.find((t) => t.id === speech.templateId);
            if (template) {
              speechExecutor.calculatePredictedEffects(
                updatedSpeech,
                template,
                updatedSpeech.selectedOptions.opening,
                updatedSpeech.selectedOptions.core,
                updatedSpeech.selectedOptions.closing
              );
            }
          }

          return updatedSpeech;
        }
        return speech;
      });

      return { activeSpeeches: speeches };
    });
  },

  executeSpeechAndApply: (speechId, player) => {
    const { speechExecutor } = get();
    if (!speechExecutor) return null;

    const speech = get().activeSpeeches.find((s) => s.id === speechId);
    if (!speech) return null;

    const template = SPEECH_TEMPLATES.find((t) => t.id === speech.templateId);
    if (!template) return null;

    // 执行讲话
    const result = speechExecutor.executeSpeech(speech, template, player);

    // 移至已完成
    set((state) => ({
      activeSpeeches: state.activeSpeeches.filter((s) => s.id !== speechId),
      completedSpeeches: [...state.completedSpeeches, speech],
    }));

    return result;
  },

  // ==================== 辅助方法 ====================
  getDecisionSummary: () => {
    const { activeBills, activeSpeeches } = get();
    
    const pending = activeBills.length + activeSpeeches.length;
    
    // 计算最高紧急度
    let highestUrgency = DecisionUrgency.LOW;
    const criticalDeadlines: any[] = [];

    activeBills.forEach((bill) => {
      if (bill.turnsRemaining <= 2) {
        highestUrgency = DecisionUrgency.CRITICAL;
        criticalDeadlines.push({
          type: 'bill',
          id: bill.id,
          title: bill.title,
          turnsRemaining: bill.turnsRemaining,
        });
      } else if (bill.turnsRemaining <= 4 && highestUrgency === DecisionUrgency.LOW) {
        highestUrgency = DecisionUrgency.HIGH;
      }
    });

    return {
      pendingCount: pending,
      highestUrgency,
      criticalDeadlines,
    };
  },

  getActiveBillById: (billId) => {
    return get().activeBills.find((b) => b.id === billId);
  },

  getActiveSpeechById: (speechId) => {
    return get().activeSpeeches.find((s) => s.id === speechId);
  },
}));
