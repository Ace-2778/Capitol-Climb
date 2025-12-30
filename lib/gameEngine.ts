import {
  Player,
  NationalState,
  GameEvent,
  EventOption,
  ResourceChange,
  Position,
  SeededRandom,
  Opponent,
  OpponentArchetype,
  Party,
  Election,
  ElectionCandidate,
  GameState,
} from '@/types/game';
import { ALL_EVENTS } from '@/data/events';

// ==================== 事件生成引擎 ====================

export class EventEngine {
  private rng: SeededRandom;
  private usedEventIds: Set<string> = new Set();

  constructor(seed: number) {
    this.rng = new SeededRandom(seed);
  }

  // 生成当回合事件
  generateEvents(
    player: Player,
    state: NationalState,
    count: number = 3
  ): GameEvent[] {
    // 过滤可用事件
    const availableEvents = ALL_EVENTS.filter(event => {
      // 检查职位要求
      if (event.minPosition && !this.meetsPositionRequirement(player.position, event.minPosition)) {
        return false;
      }
      if (event.maxPosition && this.exceedsPositionRequirement(player.position, event.maxPosition)) {
        return false;
      }

      // 检查党派要求
      if (event.requiredParty && player.party !== event.requiredParty) {
        return false;
      }

      // 检查flag要求
      if (event.requiredFlags) {
        const hasAllFlags = event.requiredFlags.every(flag => player.flags.includes(flag));
        if (!hasAllFlags) return false;
      }

      // 检查自定义条件
      if (event.condition && !event.condition(player, state)) {
        return false;
      }

      // 避免重复（最近5个回合）
      if (this.usedEventIds.has(event.id)) {
        return false;
      }

      return true;
    });

    if (availableEvents.length === 0) {
      return [];
    }

    // 根据权重进行加权随机选择
    const selectedEvents: GameEvent[] = [];
    const actualCount = Math.min(count, availableEvents.length);

    for (let i = 0; i < actualCount; i++) {
      const event = this.weightedRandomChoice(availableEvents, player, state);
      if (event) {
        selectedEvents.push({ ...event });
        this.usedEventIds.add(event.id);
        // 从可用列表中移除，避免同一回合重复
        const index = availableEvents.indexOf(event);
        if (index > -1) {
          availableEvents.splice(index, 1);
        }
      }
    }

    // 清理旧的已使用事件ID（保留最近的20个）
    if (this.usedEventIds.size > 20) {
      const idsArray = Array.from(this.usedEventIds);
      this.usedEventIds = new Set(idsArray.slice(-20));
    }

    return selectedEvents;
  }

  // 加权随机选择
  private weightedRandomChoice(
    events: GameEvent[],
    player: Player,
    state: NationalState
  ): GameEvent | null {
    if (events.length === 0) return null;

    // 计算动态权重
    const weights = events.map(event => {
      let weight = event.baseWeight;
      
      // 根据玩家风险调整丑闻事件权重
      if (event.category === 'scandal' || event.category === 'investigation') {
        weight *= (1 + player.risk / 100);
      }

      // 根据经济状况调整经济事件权重
      if (event.category === 'economy') {
        weight *= (1 + Math.abs(state.gdpGrowth) / 10);
      }

      // 根据国际局势调整国际事件权重
      if (event.category === 'international') {
        weight *= (1 + state.warRisk / 100);
      }

      return weight;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.rng.next() * totalWeight;

    for (let i = 0; i < events.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return events[i];
      }
    }

    return events[events.length - 1];
  }

  // 职位等级比较
  private meetsPositionRequirement(current: Position, required: Position): boolean {
    const hierarchy = [
      Position.LOCAL_COUNCIL,
      Position.STATE_REPRESENTATIVE,
      Position.STATE_SENATOR,
      Position.GOVERNOR,
      Position.HOUSE_REPRESENTATIVE,
      Position.SENATOR,
      Position.CABINET,
      Position.VICE_PRESIDENT,
      Position.PRESIDENT,
    ];
    return hierarchy.indexOf(current) >= hierarchy.indexOf(required);
  }

  private exceedsPositionRequirement(current: Position, max: Position): boolean {
    const hierarchy = [
      Position.LOCAL_COUNCIL,
      Position.STATE_REPRESENTATIVE,
      Position.STATE_SENATOR,
      Position.GOVERNOR,
      Position.HOUSE_REPRESENTATIVE,
      Position.SENATOR,
      Position.CABINET,
      Position.VICE_PRESIDENT,
      Position.PRESIDENT,
    ];
    return hierarchy.indexOf(current) > hierarchy.indexOf(max);
  }
}

// ==================== 事件执行引擎 ====================

export class EventExecutor {
  private rng: SeededRandom;

  constructor(seed: number) {
    this.rng = new SeededRandom(seed);
  }

  // 执行玩家选择
  executeChoice(
    option: EventOption,
    player: Player
  ): {
    player: Player;
    message: string;
    effects: ResourceChange;
  } {
    const updatedPlayer = { ...player };

    // 扣除成本
    if (option.cost) {
      this.applyResourceChange(updatedPlayer, this.negateResourceChange(option.cost));
    }

    // 应用即时效果
    this.applyResourceChange(updatedPlayer, option.immediateEffects);

    // 处理概率分支
    let outcomeMessage = '';
    let outcomeEffects: ResourceChange = {};

    if (option.outcomes && option.outcomes.length > 0) {
      const random = this.rng.next();
      let cumulative = 0;

      for (const outcome of option.outcomes) {
        cumulative += outcome.probability;
        if (random <= cumulative) {
          outcomeMessage = outcome.description;
          outcomeEffects = outcome.effects;
          this.applyResourceChange(updatedPlayer, outcome.effects);

          // 添加/移除flags
          if (outcome.addFlags) {
            outcome.addFlags.forEach(flag => {
              if (!updatedPlayer.flags.includes(flag)) {
                updatedPlayer.flags.push(flag);
              }
            });
          }
          if (outcome.removeFlags) {
            updatedPlayer.flags = updatedPlayer.flags.filter(
              flag => !outcome.removeFlags!.includes(flag)
            );
          }
          break;
        }
      }
    }

    // 处理长期效果（flags）
    if (option.addFlags) {
      option.addFlags.forEach(flag => {
        if (!updatedPlayer.flags.includes(flag)) {
          updatedPlayer.flags.push(flag);
        }
      });
    }
    if (option.removeFlags) {
      updatedPlayer.flags = updatedPlayer.flags.filter(
        flag => !option.removeFlags!.includes(flag)
      );
    }

    // 限制资源范围
    this.clampPlayerResources(updatedPlayer);

    return {
      player: updatedPlayer,
      message: outcomeMessage,
      effects: { ...option.immediateEffects, ...outcomeEffects },
    };
  }

  // 应用资源变化
  private applyResourceChange(player: Player, change: ResourceChange): void {
    if (change.reputation !== undefined) player.reputation += change.reputation;
    if (change.support !== undefined) player.support += change.support;
    if (change.fundraising !== undefined) player.fundraising += change.fundraising;
    if (change.network !== undefined) player.network += change.network;
    if (change.media !== undefined) player.media += change.media;
    if (change.leverage !== undefined) player.leverage += change.leverage;
    if (change.risk !== undefined) player.risk += change.risk;
    if (change.partyInfluence !== undefined) player.partyInfluence += change.partyInfluence;
  }

  // 取反资源变化（用于成本）
  private negateResourceChange(change: ResourceChange): ResourceChange {
    const negated: ResourceChange = {};
    Object.keys(change).forEach(key => {
      const k = key as keyof ResourceChange;
      if (change[k] !== undefined) {
        negated[k] = -(change[k] as number);
      }
    });
    return negated;
  }

  // 限制玩家资源在合理范围内
  private clampPlayerResources(player: Player): void {
    player.reputation = Math.max(0, Math.min(100, player.reputation));
    player.support = Math.max(0, Math.min(100, player.support));
    player.fundraising = Math.max(0, Math.min(100, player.fundraising));
    player.network = Math.max(0, Math.min(100, player.network));
    player.media = Math.max(-100, Math.min(100, player.media));
    player.leverage = Math.max(0, Math.min(100, player.leverage));
    player.risk = Math.max(0, Math.min(100, player.risk));
    player.partyInfluence = Math.max(0, Math.min(100, player.partyInfluence));
  }
}

// ==================== 选举引擎 ====================

export class ElectionEngine {
  private rng: SeededRandom;

  constructor(seed: number) {
    this.rng = new SeededRandom(seed);
  }

  // 运行选举
  runElection(election: Election, player: Player): {
    winner: ElectionCandidate;
    results: ElectionCandidate[];
  } {
    const candidates = election.candidates.map(c => ({ ...c }));

    // 计算每个候选人的最终得票率
    candidates.forEach(candidate => {
      let finalSupport = candidate.baseSupport;

      // 资金影响
      finalSupport += candidate.funding * 0.2;

      // 背书影响
      finalSupport += candidate.endorsements * 0.15;

      // 媒体影响
      finalSupport += candidate.mediaSupport * 0.15;

      // 如果是玩家，应用玩家优势
      if (candidate.isPlayer) {
        finalSupport += election.playerAdvantage;
        finalSupport += player.reputation * 0.1;
        finalSupport += player.network * 0.1;
      }

      // 添加随机波动（±5%）
      finalSupport += this.rng.nextFloat(-5, 5);

      // 考虑投票率（低投票率对现任有利）
      if (candidate.isPlayer && player.termCount > 0) {
        finalSupport += (100 - election.turnoutRate) * 0.1;
      }

      candidate.finalVoteShare = Math.max(0, finalSupport);
    });

    // 归一化得票率
    const totalVotes = candidates.reduce((sum, c) => sum + (c.finalVoteShare || 0), 0);
    candidates.forEach(c => {
      c.finalVoteShare = ((c.finalVoteShare || 0) / totalVotes) * 100;
    });

    // 排序
    candidates.sort((a, b) => (b.finalVoteShare || 0) - (a.finalVoteShare || 0));

    return {
      winner: candidates[0],
      results: candidates,
    };
  }

  // 判断是否需要选举
  shouldHoldElection(player: Player): boolean {
    return player.turnsUntilElection <= 0;
  }

  // 生成选举对手
  generateOpponents(
    player: Player,
    count: number = 2
  ): ElectionCandidate[] {
    const opponents: ElectionCandidate[] = [];
    
    for (let i = 0; i < count; i++) {
      // 根据玩家实力生成对手
      const strengthFactor = this.rng.nextFloat(0.6, 1.2);
      
      opponents.push({
        id: `opponent_${i}`,
        name: this.generateName(),
        party: player.party === Party.DEMOCRAT ? Party.REPUBLICAN : Party.DEMOCRAT,
        isPlayer: false,
        baseSupport: player.support * strengthFactor + this.rng.nextFloat(-10, 10),
        funding: player.fundraising * strengthFactor + this.rng.nextFloat(-10, 10),
        endorsements: this.rng.nextFloat(0, 50),
        mediaSupport: this.rng.nextFloat(-20, 20),
      });
    }

    return opponents;
  }

  private generateName(): string {
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jennifer', 'Robert', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    return `${this.rng.choice(firstNames)} ${this.rng.choice(lastNames)}`;
  }
}

// ==================== 对手AI引擎 ====================

export class OpponentAI {
  private rng: SeededRandom;

  constructor(seed: number) {
    this.rng = new SeededRandom(seed);
  }

  // 对手执行行动
  executeOpponentActions(
    opponents: Opponent[],
    player: Player
  ): {
    opponents: Opponent[];
    events: string[];
  } {
    const updatedOpponents = opponents.map(opp => ({ ...opp }));
    const events: string[] = [];

    updatedOpponents.forEach(opponent => {
      // 根据原型决定行动倾向
      const action = this.selectAction(opponent, player);

      switch (action) {
        case 'fundraise':
          opponent.funding = Math.min(100, opponent.funding + this.rng.nextInt(5, 15));
          break;
        
        case 'attack':
          if (player.risk > 30) {
            events.push(`${opponent.name} 发起了针对你的攻击`);
            // 攻击效果由事件系统处理
          }
          break;
        
        case 'build_support':
          opponent.polling = Math.min(100, opponent.polling + this.rng.nextInt(3, 10));
          break;
        
        case 'gather_leverage':
          opponent.leverage = Math.min(100, opponent.leverage + this.rng.nextInt(5, 15));
          break;
      }

      // 自然衰减/增长
      opponent.polling += this.rng.nextFloat(-2, 2);
      opponent.polling = Math.max(0, Math.min(100, opponent.polling));
    });

    return { opponents: updatedOpponents, events };
  }

  private selectAction(opponent: Opponent, player: Player): string {
    const random = this.rng.next();

    switch (opponent.archetype) {
      case OpponentArchetype.POPULIST:
        // 民粹型：更倾向于媒体攻击
        if (random < 0.4) return 'attack';
        if (random < 0.7) return 'build_support';
        return 'fundraise';

      case OpponentArchetype.ESTABLISHMENT:
        // 建制型：更倾向于募款和建立支持
        if (random < 0.5) return 'fundraise';
        if (random < 0.8) return 'build_support';
        return 'gather_leverage';

      case OpponentArchetype.CONSPIRATOR:
        // 阴谋型：更倾向于收集黑料和攻击
        if (random < 0.4) return 'gather_leverage';
        if (random < 0.7) return 'attack';
        return 'fundraise';

      default:
        return 'build_support';
    }
  }

  // 生成对手
  generateOpponents(player: Player, count: number = 3): Opponent[] {
    const opponents: Opponent[] = [];
    const archetypes = [
      OpponentArchetype.POPULIST,
      OpponentArchetype.ESTABLISHMENT,
      OpponentArchetype.CONSPIRATOR,
    ];

    for (let i = 0; i < count; i++) {
      const archetype = archetypes[i % archetypes.length];
      opponents.push(this.createOpponent(player, archetype, i));
    }

    return opponents;
  }

  private createOpponent(player: Player, archetype: OpponentArchetype, index: number): Opponent {
    const names = [
      'Richard Morrison', 'Margaret Sullivan', 'Thomas Anderson',
      'Patricia Reynolds', 'James Crawford', 'Elizabeth Hayes'
    ];

    return {
      id: `opponent_${index}`,
      name: names[index] || `Opponent ${index + 1}`,
      party: player.party === Party.DEMOCRAT ? Party.REPUBLICAN : Party.DEMOCRAT,
      archetype,
      position: player.position,
      funding: this.rng.nextInt(30, 70),
      polling: this.rng.nextInt(30, 60),
      media: this.rng.nextInt(-20, 20),
      partyInfluence: this.rng.nextInt(30, 70),
      leverage: this.rng.nextInt(10, 40),
      defense: archetype === OpponentArchetype.ESTABLISHMENT ? 
        this.rng.nextInt(60, 80) : this.rng.nextInt(30, 60),
      ambition: archetype === OpponentArchetype.CONSPIRATOR ? 
        this.rng.nextInt(70, 90) : this.rng.nextInt(40, 70),
      relationshipWithPlayer: this.rng.nextInt(-50, 20),
    };
  }
}

// ==================== 晋升系统 ====================

export class PromotionEngine {
  // 检查是否满足晋升条件
  canPromote(player: Player): { canPromote: boolean; nextPosition?: Position; reason?: string } {
    const positionPath = [
      Position.LOCAL_COUNCIL,
      Position.STATE_REPRESENTATIVE,
      Position.STATE_SENATOR,
      Position.HOUSE_REPRESENTATIVE,
      Position.SENATOR,
      Position.PRESIDENT,
    ];

    const currentIndex = positionPath.indexOf(player.position);
    if (currentIndex === -1 || currentIndex === positionPath.length - 1) {
      return { canPromote: false, reason: '已达到最高职位' };
    }

    const nextPosition = positionPath[currentIndex + 1];

    // 基本要求
    const requirements = this.getPromotionRequirements(nextPosition);

    if (player.reputation < requirements.minReputation) {
      return { canPromote: false, reason: `声望不足（需要${requirements.minReputation}）` };
    }

    if (player.support < requirements.minSupport) {
      return { canPromote: false, reason: `民意支持不足（需要${requirements.minSupport}）` };
    }

    if (player.fundraising < requirements.minFunding) {
      return { canPromote: false, reason: `资金不足（需要${requirements.minFunding}）` };
    }

    if (player.partyInfluence < requirements.minPartyInfluence) {
      return { canPromote: false, reason: `党内影响力不足（需要${requirements.minPartyInfluence}）` };
    }

    if (player.termCount < requirements.minTerms) {
      return { canPromote: false, reason: `任期不足（需要${requirements.minTerms}个任期）` };
    }

    return { canPromote: true, nextPosition };
  }

  private getPromotionRequirements(position: Position): {
    minReputation: number;
    minSupport: number;
    minFunding: number;
    minPartyInfluence: number;
    minTerms: number;
  } {
    switch (position) {
      case Position.STATE_REPRESENTATIVE:
        return { minReputation: 30, minSupport: 35, minFunding: 25, minPartyInfluence: 20, minTerms: 1 };
      case Position.STATE_SENATOR:
        return { minReputation: 40, minSupport: 45, minFunding: 35, minPartyInfluence: 30, minTerms: 1 };
      case Position.HOUSE_REPRESENTATIVE:
        return { minReputation: 50, minSupport: 50, minFunding: 45, minPartyInfluence: 40, minTerms: 2 };
      case Position.SENATOR:
        return { minReputation: 60, minSupport: 60, minFunding: 55, minPartyInfluence: 50, minTerms: 2 };
      case Position.PRESIDENT:
        return { minReputation: 75, minSupport: 70, minFunding: 70, minPartyInfluence: 70, minTerms: 3 };
      default:
        return { minReputation: 100, minSupport: 100, minFunding: 100, minPartyInfluence: 100, minTerms: 99 };
    }
  }
}

// ==================== 失败判定系统 ====================

export class FailureEngine {
  checkFailureConditions(player: Player): {
    hasFailed: boolean;
    reason?: string;
  } {
    // 1. 声望崩盘
    if (player.reputation < 10) {
      return { hasFailed: true, reason: '声望崩盘：你的政治声誉已经跌至谷底，无人愿意支持你。' };
    }

    // 2. 民意流失
    if (player.support < 15) {
      return { hasFailed: true, reason: '民意流失：选民已经完全抛弃了你，政治生涯结束。' };
    }

    // 3. 资金枯竭
    if (player.fundraising < 5 && player.termCount > 0) {
      return { hasFailed: true, reason: '资金枯竭：没有金主愿意资助你，竞选活动无法继续。' };
    }

    // 4. 党内边缘化
    if (player.partyInfluence < 5 && player.position !== Position.LOCAL_COUNCIL) {
      return { hasFailed: true, reason: '党内边缘化：你已被党组织完全排斥，失去了政治基础。' };
    }

    // 5. 丑闻摧毁
    if (player.flags.includes('caught_lying') && player.reputation < 30) {
      return { hasFailed: true, reason: '丑闻摧毁：谎言被揭穿后，你的政治生涯彻底终结。' };
    }

    // 6. 调查起诉
    if (player.flags.includes('hostile_to_investigation') && player.risk > 80) {
      return { hasFailed: true, reason: '调查起诉：联邦调查发现了实质性证据，你被起诉并被迫辞职。' };
    }

    // 7. 背叛孤立
    if (player.network < 10 && player.partyInfluence < 20) {
      return { hasFailed: true, reason: '背叛孤立：盟友纷纷背叛，你陷入完全孤立，政治生涯结束。' };
    }

    return { hasFailed: false };
  }
}
