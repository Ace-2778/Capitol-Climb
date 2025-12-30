import { create } from 'zustand';
import {
  GameState,
  GameStatus,
  Player,
  Party,
  Faction,
  Position,
  NationalState,
  PartyData,
  Opponent,
  GameEvent,
  EventOption,
  Election,
  ElectionCandidate,
} from '@/types/game';
import {
  EventEngine,
  EventExecutor,
  ElectionEngine,
  OpponentAI,
  PromotionEngine,
  FailureEngine,
} from '@/lib/gameEngine';

// ==================== 初始化函数 ====================

const createInitialPlayer = (
  name: string,
  party: Party,
  faction: Faction,
  state: string
): Player => ({
  id: 'player',
  name,
  party,
  faction,
  position: Position.LOCAL_COUNCIL,
  reputation: 40,
  support: 45,
  fundraising: 30,
  network: 35,
  media: 0,
  leverage: 20,
  risk: 10,
  termCount: 0,
  turnsUntilElection: 8, // 8回合后第一次选举
  partyInfluence: 30,
  flags: [],
  achievements: [],
  state,
  background: `来自${state}的基层政治人物`,
});

const createInitialNationalState = (): NationalState => ({
  turn: 1,
  gdpGrowth: 2.5,
  unemployment: 4.2,
  inflation: 2.8,
  stockMarket: 15,
  warRisk: 25,
  diplomaticRelations: 10,
  issues: {
    immigration: 65,
    gunControl: 58,
    healthcare: 72,
    education: 55,
    environment: 48,
  },
  president: {
    name: 'Current President',
    party: Party.DEMOCRAT,
    approval: 48,
  },
  congress: {
    house: {
      democratSeats: 220,
      republicanSeats: 215,
      total: 435,
    },
    senate: {
      democratSeats: 51,
      republicanSeats: 49,
      total: 100,
    },
    majorBills: [
      {
        id: 'bill_1',
        title: '基础设施投资法案',
        category: 'economy',
        democratSupport: 75,
        republicanSupport: 35,
        status: 'voting',
      },
      {
        id: 'bill_2',
        title: '医疗改革法案',
        category: 'healthcare',
        democratSupport: 85,
        republicanSupport: 15,
        status: 'proposed',
      },
    ],
  },
});

const createInitialPartyData = (party: Party): PartyData => ({
  party,
  nationalPolling: party === Party.DEMOCRAT ? 48 : 47,
  fundingPool: 50,
  factions: {
    [Faction.PROGRESSIVE]: party === Party.DEMOCRAT ? 35 : 10,
    [Faction.MODERATE]: 40,
    [Faction.CONSERVATIVE]: party === Party.REPUBLICAN ? 40 : 15,
    [Faction.ESTABLISHMENT]: 25,
  },
  keyIssues: party === Party.DEMOCRAT 
    ? ['Healthcare', 'Climate Change', 'Education']
    : ['Tax Cuts', 'Border Security', 'Gun Rights'],
  keyFigures: [
    {
      name: party === Party.DEMOCRAT ? 'Nancy Pelosi' : 'Mitch McConnell',
      role: 'Party Leader',
      influence: 90,
      relationshipWithPlayer: 20,
    },
    {
      name: party === Party.DEMOCRAT ? 'Chuck Schumer' : 'Kevin McCarthy',
      role: 'Senior Member',
      influence: 80,
      relationshipWithPlayer: 10,
    },
  ],
});

// ==================== Zustand Store ====================

interface GameStore extends GameState {
  // 游戏引擎
  eventEngine: EventEngine | null;
  eventExecutor: EventExecutor | null;
  electionEngine: ElectionEngine | null;
  opponentAI: OpponentAI | null;
  promotionEngine: PromotionEngine;
  failureEngine: FailureEngine;

  // 操作方法
  initializeGame: (name: string, party: Party, faction: Faction, state: string) => void;
  nextTurn: () => void;
  selectEventOption: (eventId: string, optionId: string) => void;
  dismissEvent: (eventId: string) => void;
  runElection: () => void;
  attemptPromotion: () => void;
  
  // 辅助方法
  addMessage: (message: string, type: 'info' | 'success' | 'warning' | 'danger') => void;
  saveGame: () => void;
  loadGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  status: GameStatus.CHARACTER_CREATION,
  seed: Date.now(),
  
  player: createInitialPlayer('Player', Party.DEMOCRAT, Faction.MODERATE, 'California'),
  nationalState: createInitialNationalState(),
  
  parties: {
    democrat: createInitialPartyData(Party.DEMOCRAT),
    republican: createInitialPartyData(Party.REPUBLICAN),
  },
  
  opponents: [],
  currentEvents: [],
  eventHistory: [],
  messageLog: [],

  // 游戏引擎实例
  eventEngine: null,
  eventExecutor: null,
  electionEngine: null,
  opponentAI: null,
  promotionEngine: new PromotionEngine(),
  failureEngine: new FailureEngine(),

  // ==================== 初始化游戏 ====================
  initializeGame: (name: string, party: Party, faction: Faction, state: string) => {
    const seed = Date.now();
    const player = createInitialPlayer(name, party, faction, state);
    
    const eventEngine = new EventEngine(seed);
    const eventExecutor = new EventExecutor(seed);
    const electionEngine = new ElectionEngine(seed);
    const opponentAI = new OpponentAI(seed);

    // 生成初始对手
    const opponents = opponentAI.generateOpponents(player, 3);

    // 生成初始事件
    const initialEvents = eventEngine.generateEvents(
      player,
      createInitialNationalState(),
      3
    );

    set({
      status: GameStatus.IN_PROGRESS,
      seed,
      player,
      nationalState: createInitialNationalState(),
      opponents,
      currentEvents: initialEvents,
      eventEngine,
      eventExecutor,
      electionEngine,
      opponentAI,
      messageLog: [
        {
          turn: 1,
          message: `欢迎来到政治权力游戏！你是${name}，来自${state}的${
            party === Party.DEMOCRAT ? '民主党' : '共和党'
          }${
            faction === Faction.PROGRESSIVE ? '进步派' :
            faction === Faction.MODERATE ? '温和派' :
            faction === Faction.CONSERVATIVE ? '保守派' :
            faction === Faction.ESTABLISHMENT ? '建制派' : '民粹派'
          }政治人物。`,
          type: 'info',
        },
        {
          turn: 1,
          message: '你的目标是从地方议会一步步爬升到权力顶峰。每一个决定都会影响你的政治生涯。',
          type: 'info',
        },
      ],
    });

    get().saveGame();
  },

  // ==================== 下一回合 ====================
  nextTurn: () => {
    const state = get();
    if (state.status !== GameStatus.IN_PROGRESS) return;

    let { player, nationalState, opponents, parties } = state;
    const newTurn = nationalState.turn + 1;

    // 1. 更新回合数
    nationalState = { ...nationalState, turn: newTurn };
    player = { ...player, turnsUntilElection: player.turnsUntilElection - 1 };

    // 2. 更新国家环境（随机波动）
    const rng = state.eventEngine!;
    nationalState.gdpGrowth += (Math.random() - 0.5) * 2;
    nationalState.unemployment += (Math.random() - 0.5) * 0.5;
    nationalState.inflation += (Math.random() - 0.5) * 0.5;
    nationalState.stockMarket += (Math.random() - 0.5) * 10;
    nationalState.president.approval += (Math.random() - 0.5) * 5;
    
    // 限制范围
    nationalState.gdpGrowth = Math.max(-5, Math.min(8, nationalState.gdpGrowth));
    nationalState.unemployment = Math.max(2, Math.min(15, nationalState.unemployment));
    nationalState.president.approval = Math.max(25, Math.min(75, nationalState.president.approval));

    // 3. 自然衰减部分玩家属性
    player.risk = Math.max(0, player.risk - 2);
    player.media = Math.max(-100, Math.min(100, player.media * 0.95));

    // 4. 对手行动
    if (state.opponentAI) {
      const opponentResult = state.opponentAI.executeOpponentActions(opponents, player);
      opponents = opponentResult.opponents;
      
      opponentResult.events.forEach(event => {
        state.addMessage(event, 'warning');
      });
    }

    // 5. 检查是否需要选举
    let messages: { message: string; type: 'info' | 'success' | 'warning' | 'danger' }[] = [];
    
    if (player.turnsUntilElection <= 0) {
      messages.push({
        message: '选举即将到来！请做好准备。',
        type: 'warning',
      });
    }

    // 6. 生成新事件
    const newEvents = state.eventEngine!.generateEvents(player, nationalState, 3);

    // 7. 检查失败条件
    const failureCheck = state.failureEngine.checkFailureConditions(player);
    if (failureCheck.hasFailed) {
      set({
        status: GameStatus.LOST,
        player,
        nationalState,
        opponents,
        currentEvents: [],
        messageLog: [
          ...state.messageLog,
          {
            turn: newTurn,
            message: `游戏结束！${failureCheck.reason}`,
            type: 'danger',
          },
        ],
      });
      return;
    }

    // 8. 更新状态
    set({
      player,
      nationalState,
      opponents,
      currentEvents: newEvents,
      messageLog: [
        ...state.messageLog,
        {
          turn: newTurn,
          message: `第${newTurn}回合开始`,
          type: 'info',
        },
        ...messages,
      ],
    });

    get().saveGame();
  },

  // ==================== 选择事件选项 ====================
  selectEventOption: (eventId: string, optionId: string) => {
    const state = get();
    const event = state.currentEvents.find(e => e.id === eventId);
    if (!event) return;

    const option = event.options.find(o => o.id === optionId);
    if (!option) return;

    // 执行选择
    const result = state.eventExecutor!.executeChoice(option, state.player);

    // 更新玩家状态
    const updatedPlayer = result.player;

    // 记录历史
    const eventHistory = [
      ...state.eventHistory,
      {
        turn: state.nationalState.turn,
        eventId: event.id,
        choice: option.text,
        outcome: result.message,
      },
    ];

    // 添加消息
    const newMessages = [
      {
        turn: state.nationalState.turn,
        message: `你选择了：${option.text}`,
        type: 'info' as const,
      },
    ];

    if (result.message) {
      newMessages.push({
        turn: state.nationalState.turn,
        message: result.message,
        type: 'success' as const,
      });
    }

    // 移除已处理的事件
    const currentEvents = state.currentEvents.filter(e => e.id !== eventId);

    set({
      player: updatedPlayer,
      currentEvents,
      eventHistory,
      messageLog: [...state.messageLog, ...newMessages],
    });

    get().saveGame();
  },

  // ==================== 忽略事件 ====================
  dismissEvent: (eventId: string) => {
    const state = get();
    const currentEvents = state.currentEvents.filter(e => e.id !== eventId);
    set({ currentEvents });
  },

  // ==================== 运行选举 ====================
  runElection: () => {
    const state = get();
    if (!state.electionEngine) return;

    const player = state.player;

    // 生成选举对手
    const opponents = state.electionEngine.generateOpponents(player, 2);
    
    // 创建玩家候选人
    const playerCandidate: ElectionCandidate = {
      id: 'player',
      name: player.name,
      party: player.party,
      isPlayer: true,
      baseSupport: player.support,
      funding: player.fundraising,
      endorsements: player.partyInfluence,
      mediaSupport: player.media,
    };

    // 创建选举
    const election: Election = {
      type: 'general',
      position: player.position,
      turn: state.nationalState.turn,
      candidates: [playerCandidate, ...opponents],
      playerAdvantage: player.termCount > 0 ? 5 : 0, // 现任优势
      turnoutRate: 65 + Math.random() * 20,
    };

    // 运行选举
    const result = state.electionEngine.runElection(election, player);

    // 判断是否胜利
    const won = result.winner.isPlayer;

    if (won) {
      // 胜选
      const updatedPlayer = {
        ...player,
        termCount: player.termCount + 1,
        turnsUntilElection: 8, // 重置选举倒计时
        reputation: Math.min(100, player.reputation + 10),
        support: Math.min(100, player.support + 5),
      };

      set({
        player: updatedPlayer,
        messageLog: [
          ...state.messageLog,
          {
            turn: state.nationalState.turn,
            message: `恭喜！你在选举中获胜，得票率${result.winner.finalVoteShare?.toFixed(1)}%`,
            type: 'success',
          },
        ],
      });
    } else {
      // 败选
      set({
        status: GameStatus.LOST,
        messageLog: [
          ...state.messageLog,
          {
            turn: state.nationalState.turn,
            message: `选举失败！${result.winner.name}以${result.winner.finalVoteShare?.toFixed(1)}%的得票率击败了你。`,
            type: 'danger',
          },
        ],
      });
    }

    get().saveGame();
  },

  // ==================== 尝试晋升 ====================
  attemptPromotion: () => {
    const state = get();
    const result = state.promotionEngine.canPromote(state.player);

    if (result.canPromote && result.nextPosition) {
      const updatedPlayer = {
        ...state.player,
        position: result.nextPosition,
        turnsUntilElection: 8,
        termCount: 0,
      };

      set({
        player: updatedPlayer,
        messageLog: [
          ...state.messageLog,
          {
            turn: state.nationalState.turn,
            message: `恭喜晋升到：${result.nextPosition}！`,
            type: 'success',
          },
        ],
      });

      // 检查是否成为总统
      if (result.nextPosition === Position.PRESIDENT) {
        set({
          status: GameStatus.WON,
          messageLog: [
            ...state.messageLog,
            {
              turn: state.nationalState.turn,
              message: '你成为了美国总统！达成最终胜利！',
              type: 'success',
            },
          ],
        });
      }

      get().saveGame();
    } else {
      state.addMessage(`无法晋升：${result.reason}`, 'warning');
    }
  },

  // ==================== 添加消息 ====================
  addMessage: (message: string, type: 'info' | 'success' | 'warning' | 'danger') => {
    const state = get();
    set({
      messageLog: [
        ...state.messageLog,
        {
          turn: state.nationalState.turn,
          message,
          type,
        },
      ],
    });
  },

  // ==================== 保存游戏 ====================
  saveGame: () => {
    const state = get();
    const saveData = {
      status: state.status,
      seed: state.seed,
      player: state.player,
      nationalState: state.nationalState,
      parties: state.parties,
      opponents: state.opponents,
      currentEvents: state.currentEvents,
      eventHistory: state.eventHistory,
      messageLog: state.messageLog.slice(-50), // 只保留最近50条消息
    };

    try {
      localStorage.setItem('politicalGameSave', JSON.stringify(saveData));
    } catch (e) {
      console.error('Failed to save game:', e);
    }
  },

  // ==================== 加载游戏 ====================
  loadGame: () => {
    try {
      const savedData = localStorage.getItem('politicalGameSave');
      if (!savedData) return;

      const data = JSON.parse(savedData);
      
      // 重新创建引擎实例
      const eventEngine = new EventEngine(data.seed);
      const eventExecutor = new EventExecutor(data.seed);
      const electionEngine = new ElectionEngine(data.seed);
      const opponentAI = new OpponentAI(data.seed);

      set({
        ...data,
        eventEngine,
        eventExecutor,
        electionEngine,
        opponentAI,
        promotionEngine: new PromotionEngine(),
        failureEngine: new FailureEngine(),
      });
    } catch (e) {
      console.error('Failed to load game:', e);
    }
  },
}));
