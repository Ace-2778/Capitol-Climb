import {
  GameEvent,
  EventCategory,
  Position,
  Party,
  Player,
  NationalState,
} from '@/types/game';

// ==================== 事件数据库 ====================
// 至少30个政治事件，覆盖各种场景

export const ALL_EVENTS: GameEvent[] = [
  // ========== 媒体事件 ==========
  {
    id: 'media_scandal_exposed',
    title: '媒体曝光疑似丑闻',
    description: '一家地方报纸声称掌握了你的黑料，准备发布一篇深度调查报道。你需要快速应对。',
    category: EventCategory.MEDIA,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.risk > 30,
    options: [
      {
        id: 'deny',
        text: '强硬否认，召开新闻发布会',
        cost: { fundraising: 5 },
        immediateEffects: { media: -10 },
        outcomes: [
          {
            probability: 0.6,
            effects: { support: -5, reputation: -5 },
            description: '媒体不买账,舆论持续发酵',
          },
          {
            probability: 0.4,
            effects: { support: 5, media: 10 },
            description: '你的强硬态度赢得了部分选民的支持',
          },
        ],
      },
      {
        id: 'settle',
        text: '私下和解，花钱消灾',
        cost: { fundraising: 20 },
        immediateEffects: { risk: -15, leverage: 10 },
        outcomes: [
          {
            probability: 0.7,
            effects: {},
            description: '事件被压下,但对方掌握了你的把柄',
          },
          {
            probability: 0.3,
            effects: { risk: 10, reputation: -20 },
            description: '和解失败,反而被媒体报道为"封口费丑闻"',
            addFlags: ['media_settlement_exposed'],
          },
        ],
      },
      {
        id: 'ignore',
        text: '忽视报道，专注政务',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { support: -10, reputation: -5 },
            description: '沉默被解读为默认，民意小幅下滑',
          },
          {
            probability: 0.5,
            effects: {},
            description: '几天后事件逐渐被其他新闻淹没',
          },
        ],
      },
    ],
  },

  {
    id: 'media_positive_coverage',
    title: '主流媒体正面报道',
    description: '一家有影响力的媒体计划对你做正面专题报道，这是个提升知名度的好机会。',
    category: EventCategory.MEDIA,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.reputation > 40,
    options: [
      {
        id: 'accept_interview',
        text: '接受采访，展现个人魅力',
        immediateEffects: { media: 15, support: 10 },
        outcomes: [
          {
            probability: 0.8,
            effects: { reputation: 10 },
            description: '采访效果很好，知名度大增',
          },
          {
            probability: 0.2,
            effects: { support: -5 },
            description: '你的某些言论引发争议',
          },
        ],
      },
      {
        id: 'control_narrative',
        text: '要求审稿权，确保完全正面',
        cost: { network: 10 },
        immediateEffects: { media: 5, reputation: 5 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '报道非常安全，但缺乏亮点',
          },
        ],
      },
      {
        id: 'decline',
        text: '婉拒采访，保持低调',
        immediateEffects: {},
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你保持了神秘感，但错过了曝光机会',
          },
        ],
      },
    ],
  },

  {
    id: 'media_debate_invitation',
    title: '电视辩论邀请',
    description: '你被邀请参加一场热门政治脱口秀节目，将与一位知名对手辩论。',
    category: EventCategory.MEDIA,
    minPosition: Position.STATE_REPRESENTATIVE,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'accept_debate',
        text: '接受邀请，正面交锋',
        immediateEffects: { risk: 10 },
        outcomes: [
          {
            probability: 0.4,
            effects: { support: 20, reputation: 15, media: 20 },
            description: '你在辩论中大获全胜，成为网络热议话题',
          },
          {
            probability: 0.4,
            effects: { support: 5, media: 5 },
            description: '双方打成平手，但你获得了曝光',
          },
          {
            probability: 0.2,
            effects: { support: -15, reputation: -10, media: -15 },
            description: '你被对手抓住把柄，表现失常',
          },
        ],
      },
      {
        id: 'decline_politely',
        text: '以日程冲突为由婉拒',
        immediateEffects: { media: -5 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你避免了风险，但也失去了曝光机会',
          },
        ],
      },
    ],
  },

  // ========== 党内政治事件 ==========
  {
    id: 'party_endorsement_offer',
    title: '党内大佬寻求背书',
    description: '党内一位资深政客希望获得你的公开支持，以换取未来的政治支持。',
    category: EventCategory.PARTY_INTERNAL,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'endorse',
        text: '公开支持对方',
        immediateEffects: { network: 15, partyInfluence: 10 },
        outcomes: [
          {
            probability: 0.7,
            effects: { fundraising: 10 },
            description: '对方感激你的支持，给予资金回报',
            addFlags: ['party_ally_senior'],
          },
          {
            probability: 0.3,
            effects: { support: -5 },
            description: '部分选民认为你过于依附建制派',
          },
        ],
      },
      {
        id: 'negotiate',
        text: '提出条件，交换利益',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.6,
            effects: { partyInfluence: 20, leverage: 10 },
            description: '双方达成秘密协议，你获得更多党内话语权',
            addFlags: ['party_deal_senior'],
          },
          {
            probability: 0.4,
            effects: { partyInfluence: -10 },
            description: '对方认为你太贪婪，交易破裂',
          },
        ],
      },
      {
        id: 'refuse',
        text: '拒绝，保持独立立场',
        immediateEffects: { partyInfluence: -5 },
        outcomes: [
          {
            probability: 1.0,
            effects: { support: 5 },
            description: '你的独立形象得到选民认可，但得罪了党内人士',
          },
        ],
      },
    ],
  },

  {
    id: 'party_primary_challenge',
    title: '党内初选挑战',
    description: '有党内人士准备在下次初选中挑战你的席位，你需要提前布局。',
    category: EventCategory.PARTY_INTERNAL,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.termCount > 0,
    options: [
      {
        id: 'fundraise_early',
        text: '提前发起募款攻势',
        cost: { network: 10 },
        immediateEffects: { fundraising: 20 },
        outcomes: [
          {
            probability: 0.7,
            effects: { partyInfluence: 10 },
            description: '雄厚的资金让潜在挑战者望而却步',
          },
          {
            probability: 0.3,
            effects: {},
            description: '对手也开始筹款，竞争加剧',
          },
        ],
      },
      {
        id: 'attack_opponent',
        text: '主动出击，挖掘对手黑料',
        cost: { fundraising: 15 },
        immediateEffects: { risk: 15 },
        outcomes: [
          {
            probability: 0.5,
            effects: { leverage: 20, partyInfluence: 15 },
            description: '你掌握了对手的致命弱点',
            addFlags: ['has_opponent_leverage'],
          },
          {
            probability: 0.5,
            effects: { reputation: -10, media: -10 },
            description: '你的行动被曝光，被批评为"内斗"',
          },
        ],
      },
      {
        id: 'strengthen_base',
        text: '深耕基层，巩固票仓',
        cost: { fundraising: 10 },
        immediateEffects: { support: 15, network: 10 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你与选民建立了更紧密的联系',
          },
        ],
      },
    ],
  },

  {
    id: 'party_faction_conflict',
    title: '党内派系斗争',
    description: '党内温和派和进步派/保守派发生激烈冲突，你必须表态。',
    category: EventCategory.PARTY_INTERNAL,
    weight: 1,
    baseWeight: 1,
    minPosition: Position.STATE_SENATOR,
    options: [
      {
        id: 'side_progressive',
        text: '支持进步派/保守派',
        immediateEffects: { partyInfluence: -10 },
        outcomes: [
          {
            probability: 1.0,
            effects: { support: 15 },
            description: '你获得基层选民的热烈支持，但建制派不满',
            addFlags: ['progressive_wing'],
          },
        ],
      },
      {
        id: 'side_moderate',
        text: '支持温和派',
        immediateEffects: { partyInfluence: 10, fundraising: 15 },
        outcomes: [
          {
            probability: 1.0,
            effects: { support: -5 },
            description: '你获得党内大佬和金主支持，但基层认为你妥协',
            addFlags: ['moderate_wing'],
          },
        ],
      },
      {
        id: 'stay_neutral',
        text: '保持中立，呼吁团结',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { reputation: 10 },
            description: '你的理性态度受到认可',
          },
          {
            probability: 0.5,
            effects: { partyInfluence: -15 },
            description: '双方都认为你是骑墙派，影响力下降',
          },
        ],
      },
    ],
  },

  // ========== 对手行动事件 ==========
  {
    id: 'opponent_attack_ad',
    title: '对手发起负面广告攻势',
    description: '你的主要对手投放了大量负面广告，攻击你的政策记录和个人品格。',
    category: EventCategory.OPPONENT,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'counter_attack',
        text: '以牙还牙，发起反击广告',
        cost: { fundraising: 20 },
        immediateEffects: { risk: 10 },
        outcomes: [
          {
            probability: 0.6,
            effects: { support: 5 },
            description: '你的反击奏效，抵消了负面影响',
          },
          {
            probability: 0.4,
            effects: { media: -10, reputation: -5 },
            description: '媒体批评双方互相抹黑，你也受波及',
          },
        ],
      },
      {
        id: 'positive_campaign',
        text: '坚持正面宣传，展示政绩',
        cost: { fundraising: 15 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { reputation: 15, support: 10 },
            description: '你的高姿态赢得尊重',
          },
          {
            probability: 0.5,
            effects: { support: -10 },
            description: '对手的攻击未被反驳，部分选民相信了负面信息',
          },
        ],
      },
      {
        id: 'expose_funding',
        text: '揭露对手的资金来源',
        cost: { network: 10 },
        immediateEffects: { risk: 15 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 15, media: 20 },
            description: '你成功转移话题，对手陷入资金丑闻',
            addFlags: ['opponent_damaged'],
          },
          {
            probability: 0.5,
            effects: { reputation: -10 },
            description: '你的指控缺乏证据，反被批评造谣',
          },
        ],
      },
    ],
  },

  {
    id: 'opponent_coalition',
    title: '对手结成反对联盟',
    description: '多个政治对手联合起来，试图在下次选举中击败你。',
    category: EventCategory.OPPONENT,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.partyInfluence > 60,
    options: [
      {
        id: 'divide_conquer',
        text: '分化瓦解，私下拉拢其中一人',
        cost: { fundraising: 15, leverage: 10 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.6,
            effects: { network: 20, partyInfluence: 10 },
            description: '你成功拉拢一人，联盟破裂',
            removeFlags: ['opponent_coalition'],
          },
          {
            probability: 0.4,
            effects: { reputation: -10 },
            description: '你的分化策略被曝光，被批评为阴谋家',
          },
        ],
      },
      {
        id: 'strengthen_position',
        text: '巩固自身优势，正面对抗',
        cost: { fundraising: 25 },
        immediateEffects: { support: 10, fundraising: 20 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你展现实力，让对手知难而退',
          },
        ],
      },
      {
        id: 'seek_party_help',
        text: '寻求党内支持，动用组织力量',
        cost: { partyInfluence: 20 },
        immediateEffects: { fundraising: 15, network: 15 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '党组织出面调停，化解危机',
            addFlags: ['party_owes_favor'],
          },
        ],
      },
    ],
  },

  // ========== 民意/舆论事件 ==========
  {
    id: 'public_protest',
    title: '民众抗议活动',
    description: '一群选民在你的办公室外抗议，要求你改变在某个议题上的立场。',
    category: EventCategory.PUBLIC_OPINION,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'meet_protesters',
        text: '亲自会见抗议者，倾听诉求',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.6,
            effects: { support: 10, reputation: 10 },
            description: '你的亲民态度赢得赞誉',
          },
          {
            probability: 0.4,
            effects: { support: -5 },
            description: '抗议者对你的回应不满意，继续施压',
          },
        ],
      },
      {
        id: 'change_position',
        text: '顺应民意，改变立场',
        immediateEffects: { support: 15, partyInfluence: -10 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '民众满意，但党内认为你缺乏原则',
          },
        ],
      },
      {
        id: 'ignore_protest',
        text: '无视抗议，坚持原有立场',
        immediateEffects: { support: -10 },
        outcomes: [
          {
            probability: 0.5,
            effects: { partyInfluence: 10 },
            description: '党内认可你的坚定，但民意受损',
          },
          {
            probability: 0.5,
            effects: { support: -15, media: -10 },
            description: '抗议升级，媒体大幅报道，舆论恶化',
            addFlags: ['public_protest_escalated'],
          },
        ],
      },
    ],
  },

  {
    id: 'viral_moment',
    title: '意外走红网络',
    description: '你的一段演讲视频或某个瞬间在社交媒体上疯传，获得数百万浏览。',
    category: EventCategory.PUBLIC_OPINION,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'capitalize',
        text: '趁热打铁，发起募款和宣传攻势',
        cost: { fundraising: 5 },
        immediateEffects: { media: 25, support: 20, fundraising: 30 },
        outcomes: [
          {
            probability: 1.0,
            effects: { reputation: 15 },
            description: '你成功将网络热度转化为实际支持',
          },
        ],
      },
      {
        id: 'stay_humble',
        text: '保持低调，避免过度曝光',
        immediateEffects: { support: 10, reputation: 5 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你的谦逊获得好感，但热度逐渐消退',
          },
        ],
      },
    ],
  },

  {
    id: 'policy_backfire',
    title: '政策失误遭到批评',
    description: '你曾大力推动的一项政策产生了负面后果，反对者抓住机会攻击你。',
    category: EventCategory.PUBLIC_OPINION,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.termCount > 0,
    options: [
      {
        id: 'admit_mistake',
        text: '公开承认错误，承诺改进',
        immediateEffects: { reputation: -10, support: -5 },
        outcomes: [
          {
            probability: 0.6,
            effects: { reputation: 15 },
            description: '你的诚实赢得尊重，长期声誉提升',
          },
          {
            probability: 0.4,
            effects: { support: -10 },
            description: '对手利用你的认错大做文章',
          },
        ],
      },
      {
        id: 'deflect_blame',
        text: '将责任推给其他因素',
        immediateEffects: { risk: 10 },
        outcomes: [
          {
            probability: 0.5,
            effects: {},
            description: '你暂时逃避了责任',
          },
          {
            probability: 0.5,
            effects: { reputation: -20, media: -15 },
            description: '媒体揭穿你的推诿，声誉大损',
            addFlags: ['seen_as_dishonest'],
          },
        ],
      },
      {
        id: 'double_down',
        text: '坚持政策正确，反驳批评',
        immediateEffects: { support: -10 },
        outcomes: [
          {
            probability: 0.3,
            effects: { partyInfluence: 15 },
            description: '党内欣赏你的坚定，但民意继续下滑',
          },
          {
            probability: 0.7,
            effects: { support: -15, reputation: -10 },
            description: '你被视为固执己见，舆论进一步恶化',
          },
        ],
      },
    ],
  },

  // ========== 经济事件 ==========
  {
    id: 'economy_downturn',
    title: '经济衰退来袭',
    description: '国家经济陷入衰退，失业率上升，你需要展现应对能力。',
    category: EventCategory.ECONOMY,
    weight: 1,
    baseWeight: 1,
    minPosition: Position.STATE_SENATOR,
    options: [
      {
        id: 'stimulus_plan',
        text: '推动经济刺激计划',
        cost: { partyInfluence: 15 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.6,
            effects: { reputation: 20, support: 15 },
            description: '计划获得通过，你成为经济复苏的功臣',
          },
          {
            probability: 0.4,
            effects: { partyInfluence: -10 },
            description: '计划遭到党内保守派反对，未能通过',
          },
        ],
      },
      {
        id: 'blame_administration',
        text: '将责任归咎于现政府',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 10, media: 10 },
            description: '你的批评引发共鸣',
          },
          {
            probability: 0.5,
            effects: { reputation: -10 },
            description: '选民认为你只会抱怨，不提供解决方案',
          },
        ],
      },
      {
        id: 'local_relief',
        text: '专注地方救济，帮助选区民众',
        cost: { fundraising: 20 },
        immediateEffects: { support: 20, network: 15 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '选区民众感激你的实际行动',
          },
        ],
      },
    ],
  },

  {
    id: 'donor_request',
    title: '大金主的特殊请求',
    description: '一位重要捐赠者希望你在某项立法上投出关键一票，作为回报愿意提供巨额捐款。',
    category: EventCategory.ECONOMY,
    weight: 1,
    baseWeight: 1,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    options: [
      {
        id: 'accept_deal',
        text: '接受交易，投支持票',
        immediateEffects: { fundraising: 40, risk: 20 },
        outcomes: [
          {
            probability: 0.7,
            effects: { leverage: 15 },
            description: '你获得巨额资金，但金主掌握了你的把柄',
            addFlags: ['donor_leverage'],
          },
          {
            probability: 0.3,
            effects: { reputation: -30, media: -25 },
            description: '交易被曝光，你深陷腐败丑闻',
            addFlags: ['corruption_scandal'],
          },
        ],
      },
      {
        id: 'refuse_politely',
        text: '礼貌拒绝，保持独立',
        immediateEffects: { fundraising: -10 },
        outcomes: [
          {
            probability: 1.0,
            effects: { reputation: 10 },
            description: '你失去了资金，但保持了清白',
          },
        ],
      },
      {
        id: 'negotiate_publicly',
        text: '公开谈判，要求对方改进提案',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { reputation: 15, fundraising: 20 },
            description: '你成功促成双赢，获得资金和声誉',
          },
          {
            probability: 0.5,
            effects: { fundraising: -15 },
            description: '金主不满，转投你的对手',
          },
        ],
      },
    ],
  },

  // ========== 丑闻/调查事件 ==========
  {
    id: 'investigation_launched',
    title: '联邦调查启动',
    description: '联邦机构对你展开调查，怀疑你涉嫌滥用职权或财务违规。',
    category: EventCategory.INVESTIGATION,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.risk > 50 || player.leverage > 40,
    options: [
      {
        id: 'cooperate_fully',
        text: '全力配合调查',
        cost: { fundraising: 25 },
        immediateEffects: { risk: -10 },
        outcomes: [
          {
            probability: 0.6,
            effects: { reputation: 10 },
            description: '调查未发现重大问题，你的配合态度受到认可',
            removeFlags: ['under_investigation'],
          },
          {
            probability: 0.4,
            effects: { reputation: -15, support: -15 },
            description: '调查发现一些小问题，你受到公开谴责',
          },
        ],
      },
      {
        id: 'fight_back',
        text: '反击调查，声称政治迫害',
        immediateEffects: { media: 10 },
        outcomes: [
          {
            probability: 0.4,
            effects: { support: 20 },
            description: '支持者相信你是受害者，民意反弹',
          },
          {
            probability: 0.6,
            effects: { reputation: -25, risk: 30 },
            description: '你的反击被视为心虚，调查力度加大',
            addFlags: ['hostile_to_investigation'],
          },
        ],
      },
      {
        id: 'settle_quietly',
        text: '私下和解，付罚款了事',
        cost: { fundraising: 40 },
        immediateEffects: { risk: -20 },
        outcomes: [
          {
            probability: 0.5,
            effects: {},
            description: '调查结束，但你付出了巨大代价',
            removeFlags: ['under_investigation'],
          },
          {
            probability: 0.5,
            effects: { reputation: -20, media: -15 },
            description: '和解被曝光，公众认为你有罪',
          },
        ],
      },
    ],
  },

  {
    id: 'personal_scandal',
    title: '个人私生活丑闻',
    description: '你的私生活被媒体曝光，引发轰动。这可能严重损害你的政治生涯。',
    category: EventCategory.SCANDAL,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.risk > 40,
    options: [
      {
        id: 'public_apology',
        text: '公开道歉，寻求宽恕',
        immediateEffects: { reputation: -20, support: -15 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 15 },
            description: '时间抚平伤痕，你逐渐走出阴影',
          },
          {
            probability: 0.5,
            effects: { support: -20 },
            description: '道歉未能平息舆论，你的支持率持续下滑',
            addFlags: ['scandal_survivor'],
          },
        ],
      },
      {
        id: 'deny_everything',
        text: '强烈否认，起诉媒体',
        cost: { fundraising: 20 },
        immediateEffects: { media: -30 },
        outcomes: [
          {
            probability: 0.3,
            effects: { reputation: 10 },
            description: '你打赢了官司，媒体道歉',
          },
          {
            probability: 0.7,
            effects: { reputation: -30, support: -25 },
            description: '更多证据被曝光，你的否认不攻自破',
            addFlags: ['caught_lying'],
          },
        ],
      },
      {
        id: 'resign_position',
        text: '暂时退出公众视野',
        immediateEffects: { risk: -30, support: -25 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你暂时避开风头，但政治生涯蒙上阴影',
            addFlags: ['comeback_attempt'],
          },
        ],
      },
    ],
  },

  // ========== 国际/安全事件 ==========
  {
    id: 'international_crisis',
    title: '国际危机爆发',
    description: '海外发生重大事件，国家面临安全威胁，你需要表明立场。',
    category: EventCategory.INTERNATIONAL,
    weight: 1,
    baseWeight: 1,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    options: [
      {
        id: 'hawkish_stance',
        text: '主张强硬回应',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 15, partyInfluence: 10 },
            description: '你的强硬立场受到鹰派支持',
          },
          {
            probability: 0.5,
            effects: { support: -10 },
            description: '反战民众批评你好战',
          },
        ],
      },
      {
        id: 'diplomatic_solution',
        text: '呼吁外交解决',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { reputation: 10, media: 10 },
            description: '你被视为理性和平的政治家',
          },
          {
            probability: 0.5,
            effects: { partyInfluence: -10 },
            description: '党内强硬派批评你软弱',
          },
        ],
      },
      {
        id: 'remain_silent',
        text: '暂不表态，观望形势',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: {},
            description: '你避免了站错队',
          },
          {
            probability: 0.5,
            effects: { reputation: -10, media: -10 },
            description: '选民认为你在关键时刻缺乏担当',
          },
        ],
      },
    ],
  },

  // ========== 机遇事件 ==========
  {
    id: 'celebrity_endorsement',
    title: '名人背书',
    description: '一位知名人士公开表示支持你，这将大幅提升你的知名度。',
    category: EventCategory.OPPORTUNITY,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.support > 50,
    options: [
      {
        id: 'embrace_endorsement',
        text: '欣然接受，共同举办活动',
        cost: { fundraising: 10 },
        immediateEffects: { support: 25, media: 30, fundraising: 20 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '名人效应显著，你的支持率飙升',
          },
        ],
      },
      {
        id: 'polite_distance',
        text: '礼貌致谢，保持距离',
        immediateEffects: { support: 10, media: 10 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你获得曝光，但未过度依赖名人',
          },
        ],
      },
    ],
  },

  {
    id: 'insider_tip',
    title: '内幕消息',
    description: '有人向你透露了对手的重大丑闻，你可以选择如何使用这一信息。',
    category: EventCategory.OPPORTUNITY,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'leak_to_media',
        text: '匿名泄露给媒体',
        immediateEffects: { risk: 15 },
        outcomes: [
          {
            probability: 0.7,
            effects: { support: 15 },
            description: '对手深陷丑闻，你的相对支持率上升',
            addFlags: ['opponent_damaged'],
          },
          {
            probability: 0.3,
            effects: { reputation: -20, media: -20 },
            description: '泄密源头被追查到你，声誉受损',
            addFlags: ['known_as_leaker'],
          },
        ],
      },
      {
        id: 'hold_as_leverage',
        text: '保留信息，作为谈判筹码',
        immediateEffects: { leverage: 30 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你掌握了对手的把柄，可以在关键时刻使用',
            addFlags: ['has_opponent_secret'],
          },
        ],
      },
      {
        id: 'ignore_tip',
        text: '无视消息，不使用阴招',
        immediateEffects: {},
        outcomes: [
          {
            probability: 1.0,
            effects: { reputation: 5 },
            description: '你保持了道德高地，但错过了打击对手的机会',
          },
        ],
      },
    ],
  },

  {
    id: 'grassroots_movement',
    title: '草根运动支持',
    description: '一场自发的草根运动将你视为代表，愿意为你提供义工和宣传支持。',
    category: EventCategory.OPPORTUNITY,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'embrace_movement',
        text: '拥抱草根，调整政策立场',
        immediateEffects: { support: 30, network: 25 },
        outcomes: [
          {
            probability: 0.6,
            effects: { partyInfluence: -15, fundraising: -10 },
            description: '你获得强大民意支持，但与建制派渐行渐远',
            addFlags: ['grassroots_champion'],
          },
          {
            probability: 0.4,
            effects: { reputation: 10 },
            description: '你成功平衡草根和建制派',
          },
        ],
      },
      {
        id: 'keep_distance',
        text: '保持距离，避免过度激进',
        immediateEffects: { support: 10 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你获得一些支持，但未完全利用草根力量',
          },
        ],
      },
    ],
  },

  {
    id: 'major_legislation_opportunity',
    title: '重大立法机会',
    description: '你有机会成为一项重大法案的主要发起人，这可能成为你的标志性政绩。',
    category: EventCategory.OPPORTUNITY,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'lead_bill',
        text: '全力推动法案通过',
        cost: { partyInfluence: 20, fundraising: 15 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { reputation: 30, partyInfluence: 30, support: 25 },
            description: '法案通过！你成为政治明星',
            addFlags: ['major_legislative_win'],
          },
          {
            probability: 0.5,
            effects: { reputation: -10, partyInfluence: -15 },
            description: '法案未能通过，你浪费了大量政治资本',
          },
        ],
      },
      {
        id: 'cosponsor_only',
        text: '作为联合发起人，降低风险',
        cost: { partyInfluence: 5 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { reputation: 10, partyInfluence: 10 },
            description: '法案通过，你获得部分功劳',
          },
          {
            probability: 0.5,
            effects: {},
            description: '法案失败，但你的损失有限',
          },
        ],
      },
      {
        id: 'decline',
        text: '婉拒，专注其他事务',
        immediateEffects: {},
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你错过了一次重大立法机会',
          },
        ],
      },
    ],
  },

  {
    id: 'debate_viral_moment',
    title: '辩论中的精彩时刻',
    description: '在一场辩论中，你有机会发表一段可能引起轰动的言论。',
    category: EventCategory.OPPORTUNITY,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'take_risk',
        text: '发表大胆言论，争取出圈',
        immediateEffects: { risk: 20 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 30, media: 40, fundraising: 25 },
            description: '你的言论引爆社交媒体，成为现象级话题',
            addFlags: ['viral_star'],
          },
          {
            probability: 0.5,
            effects: { reputation: -15, support: -10 },
            description: '言论引发争议，被批评为哗众取宠',
          },
        ],
      },
      {
        id: 'play_safe',
        text: '稳健发言，避免争议',
        immediateEffects: {},
        outcomes: [
          {
            probability: 1.0,
            effects: { reputation: 5 },
            description: '你的表现四平八稳，但缺乏亮点',
          },
        ],
      },
    ],
  },

  // ========== 关键晋升事件 ==========
  {
    id: 'higher_office_opportunity',
    title: '更高职位空缺',
    description: '一个更高级别的职位出现空缺或即将选举，党内希望你考虑参选。',
    category: EventCategory.OPPORTUNITY,
    weight: 1,
    baseWeight: 1,
    condition: (player) => 
      player.partyInfluence > 50 && 
      player.reputation > 60 &&
      player.position !== Position.PRESIDENT,
    options: [
      {
        id: 'run_for_office',
        text: '宣布参选更高职位',
        cost: { fundraising: 30 },
        immediateEffects: { risk: 15 },
        outcomes: [
          {
            probability: 0.6,
            effects: { support: 20, media: 25 },
            description: '你的宣布获得广泛关注和支持',
            addFlags: ['running_for_higher_office'],
          },
          {
            probability: 0.4,
            effects: { reputation: -10, partyInfluence: -10 },
            description: '部分人认为你过于急功近利',
          },
        ],
      },
      {
        id: 'wait_for_timing',
        text: '暂不参选，等待更好时机',
        immediateEffects: {},
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你保持耐心，但机会可能被他人抓住',
          },
        ],
      },
    ],
  },

  // ========== 地方议会阶段专属事件 ==========
  {
    id: 'local_town_hall',
    title: '市政厅会议',
    description: '你需要主持一场社区市政厅会议，讨论地方发展议题。这是展现能力的机会。',
    category: EventCategory.PUBLIC_OPINION,
    maxPosition: Position.STATE_REPRESENTATIVE,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'listen_actively',
        text: '认真倾听每一位居民的声音',
        immediateEffects: { support: 15, reputation: 10, network: 10 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你的亲民作风赢得社区信任',
          },
        ],
      },
      {
        id: 'make_promises',
        text: '作出大胆承诺，争取支持',
        immediateEffects: { support: 20, risk: 15 },
        outcomes: [
          {
            probability: 0.6,
            effects: { reputation: 10 },
            description: '居民对你的承诺充满期待',
          },
          {
            probability: 0.4,
            effects: { reputation: -10 },
            description: '有人质疑你的承诺是否能兑现',
            addFlags: ['made_big_promises'],
          },
        ],
      },
      {
        id: 'delegate',
        text: '让助手处理，自己专注重要事务',
        immediateEffects: { support: -5 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '一些居民对你的缺席表示失望',
          },
        ],
      },
    ],
  },

  {
    id: 'local_business_support',
    title: '地方企业寻求支持',
    description: '一家地方企业希望你支持一项有争议的开发计划，承诺提供大量就业机会。',
    category: EventCategory.ECONOMY,
    maxPosition: Position.STATE_REPRESENTATIVE,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'support_development',
        text: '支持开发，促进就业',
        immediateEffects: { fundraising: 20, support: -10 },
        outcomes: [
          {
            probability: 0.7,
            effects: { network: 15 },
            description: '商界人士认可你的务实态度',
            addFlags: ['pro_business'],
          },
          {
            probability: 0.3,
            effects: { reputation: -15 },
            description: '环保组织和社区活动家强烈反对',
          },
        ],
      },
      {
        id: 'oppose_development',
        text: '反对开发，保护社区环境',
        immediateEffects: { support: 15, fundraising: -10 },
        outcomes: [
          {
            probability: 1.0,
            effects: { reputation: 10 },
            description: '社区居民赞赏你的原则立场',
            addFlags: ['environmental_advocate'],
          },
        ],
      },
      {
        id: 'negotiate_compromise',
        text: '寻求折中方案',
        cost: { network: 10 },
        immediateEffects: { reputation: 10 },
        outcomes: [
          {
            probability: 0.6,
            effects: { support: 10, fundraising: 10 },
            description: '你成功促成双方达成妥协',
          },
          {
            probability: 0.4,
            effects: {},
            description: '双方都不满意，但接受了方案',
          },
        ],
      },
    ],
  },

  {
    id: 'local_school_crisis',
    title: '学区预算危机',
    description: '地方学区面临严重的资金短缺，家长们向你求助。',
    category: EventCategory.PUBLIC_OPINION,
    maxPosition: Position.STATE_SENATOR,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'raise_taxes',
        text: '提议增加教育税收',
        immediateEffects: { reputation: 10, support: -15 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 20 },
            description: '家长们感激你的支持，经过宣传后民意回升',
          },
          {
            probability: 0.5,
            effects: { support: -10 },
            description: '增税提案引发强烈反对',
          },
        ],
      },
      {
        id: 'cut_other_budgets',
        text: '削减其他预算，转移资金',
        immediateEffects: { reputation: -5 },
        outcomes: [
          {
            probability: 0.6,
            effects: { support: 10 },
            description: '教育获得资金，但其他部门不满',
          },
          {
            probability: 0.4,
            effects: { reputation: -15, support: -10 },
            description: '削减决策引发多方抗议',
          },
        ],
      },
      {
        id: 'seek_state_funding',
        text: '向州政府申请特别拨款',
        cost: { network: 15 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 20, reputation: 15 },
            description: '成功获得州政府资助',
            addFlags: ['good_state_relations'],
          },
          {
            probability: 0.5,
            effects: { support: -5 },
            description: '申请被拒，你显得无能为力',
          },
        ],
      },
    ],
  },

  // ========== 州议员阶段专属事件 ==========
  {
    id: 'state_redistricting',
    title: '选区重划争议',
    description: '州议会正在进行选区重划，你可以影响过程，但这可能引发争议。',
    category: EventCategory.PARTY_INTERNAL,
    minPosition: Position.STATE_REPRESENTATIVE,
    maxPosition: Position.GOVERNOR,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'favor_party',
        text: '支持对本党有利的划分方案',
        immediateEffects: { partyInfluence: 20, risk: 20 },
        outcomes: [
          {
            probability: 0.6,
            effects: { fundraising: 15 },
            description: '党组织对你的忠诚表示赞赏',
            addFlags: ['party_loyalist'],
          },
          {
            probability: 0.4,
            effects: { reputation: -20, media: -20 },
            description: '媒体批评你参与gerrymandering（不公正划分选区）',
            addFlags: ['gerrymandering_scandal'],
          },
        ],
      },
      {
        id: 'fair_redistricting',
        text: '坚持公平划分原则',
        immediateEffects: { reputation: 15, partyInfluence: -15 },
        outcomes: [
          {
            probability: 1.0,
            effects: { media: 20 },
            description: '你的正直获得跨党派赞誉',
            addFlags: ['reformer'],
          },
        ],
      },
      {
        id: 'abstain_vote',
        text: '弃权，避免争议',
        immediateEffects: { partyInfluence: -10, reputation: -5 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你的中立立场让双方都不满',
          },
        ],
      },
    ],
  },

  {
    id: 'state_budget_showdown',
    title: '州预算僵局',
    description: '州预算谈判陷入僵局，你的投票可能是关键一票。',
    category: EventCategory.PARTY_INTERNAL,
    minPosition: Position.STATE_REPRESENTATIVE,
    maxPosition: Position.HOUSE_REPRESENTATIVE,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'vote_party_line',
        text: '按党派立场投票',
        immediateEffects: { partyInfluence: 15 },
        outcomes: [
          {
            probability: 0.5,
            effects: {},
            description: '预算通过/未通过，你展现了党派忠诚',
          },
          {
            probability: 0.5,
            effects: { support: -10 },
            description: '选民认为你过于党派化',
          },
        ],
      },
      {
        id: 'vote_conscience',
        text: '按良心和选民利益投票',
        immediateEffects: { reputation: 10, partyInfluence: -20 },
        outcomes: [
          {
            probability: 0.6,
            effects: { support: 15 },
            description: '选民赞赏你的独立性',
            addFlags: ['maverick'],
          },
          {
            probability: 0.4,
            effects: { partyInfluence: -15 },
            description: '党鞭警告你的背叛行为',
            addFlags: ['party_traitor'],
          },
        ],
      },
      {
        id: 'broker_compromise',
        text: '尝试斡旋妥协',
        cost: { network: 20 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { reputation: 25, partyInfluence: 20, media: 25 },
            description: '你成功促成妥协，成为州内明星',
            addFlags: ['dealmaker'],
          },
          {
            probability: 0.5,
            effects: { reputation: -10 },
            description: '调解失败，双方都责怪你',
          },
        ],
      },
    ],
  },

  {
    id: 'state_governor_feud',
    title: '与州长的矛盾',
    description: '你与州长在重要议题上发生冲突，关系急剧恶化。',
    category: EventCategory.PARTY_INTERNAL,
    minPosition: Position.STATE_REPRESENTATIVE,
    maxPosition: Position.HOUSE_REPRESENTATIVE,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'escalate_conflict',
        text: '公开批评州长',
        cost: { network: 10 },
        immediateEffects: { media: 20, risk: 15 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 20, reputation: 15 },
            description: '你的批评引起共鸣，声望大涨',
            addFlags: ['governor_enemy'],
          },
          {
            probability: 0.5,
            effects: { partyInfluence: -25, fundraising: -20 },
            description: '州长动用资源打压你',
            addFlags: ['blacklisted_by_governor'],
          },
        ],
      },
      {
        id: 'seek_reconciliation',
        text: '私下寻求和解',
        cost: { leverage: 15 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.6,
            effects: { partyInfluence: 10, network: 10 },
            description: '你们达成和解，关系缓和',
          },
          {
            probability: 0.4,
            effects: { reputation: -10 },
            description: '州长拒绝和解，你显得软弱',
          },
        ],
      },
      {
        id: 'avoid_confrontation',
        text: '避免正面冲突',
        immediateEffects: { reputation: -5 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你保持低调，但错过了挑战州长的机会',
          },
        ],
      },
    ],
  },

  // ========== 联邦众议员阶段专属事件 ==========
  {
    id: 'house_committee_assignment',
    title: '委员会席位竞争',
    description: '一个重要的众议院委员会有空缺，多人竞争这个有影响力的席位。',
    category: EventCategory.PARTY_INTERNAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    maxPosition: Position.SENATOR,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'lobby_leadership',
        text: '游说党内领导层',
        cost: { fundraising: 20, network: 15 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.6,
            effects: { partyInfluence: 30, reputation: 20 },
            description: '你获得委员会席位，影响力大增',
            addFlags: ['committee_member'],
          },
          {
            probability: 0.4,
            effects: { partyInfluence: -10 },
            description: '你未能获得席位，浪费了资源',
          },
        ],
      },
      {
        id: 'public_campaign',
        text: '发起公开宣传攻势',
        cost: { fundraising: 15 },
        immediateEffects: { media: 15 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 20, reputation: 15 },
            description: '民意压力帮你获得席位',
            addFlags: ['committee_member'],
          },
          {
            probability: 0.5,
            effects: { partyInfluence: -15 },
            description: '党内领导层不满你施压的方式',
          },
        ],
      },
      {
        id: 'trade_favors',
        text: '与其他议员交换支持',
        cost: { leverage: 20 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.7,
            effects: { partyInfluence: 20, network: 20 },
            description: '你通过政治交易获得席位',
            addFlags: ['committee_member', 'owes_favors'],
          },
          {
            probability: 0.3,
            effects: { leverage: -10 },
            description: '交易失败，你失去了筹码',
          },
        ],
      },
    ],
  },

  {
    id: 'house_floor_speech',
    title: '重要议题发言机会',
    description: '你有机会在众议院就全国关注的议题发表演讲，这将是重要的曝光机会。',
    category: EventCategory.MEDIA,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    maxPosition: Position.SENATOR,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'fiery_speech',
        text: '发表激情演讲，表明鲜明立场',
        immediateEffects: { risk: 15 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 30, media: 35, reputation: 20 },
            description: '演讲引发轰动，你成为全国焦点',
            addFlags: ['rising_star'],
          },
          {
            probability: 0.5,
            effects: { support: -15, reputation: -10 },
            description: '演讲引发争议，反对者猛烈攻击',
          },
        ],
      },
      {
        id: 'measured_speech',
        text: '发表理性、平衡的演讲',
        immediateEffects: { reputation: 15 },
        outcomes: [
          {
            probability: 0.7,
            effects: { media: 15, support: 10 },
            description: '演讲获得好评，但缺乏爆点',
          },
          {
            probability: 0.3,
            effects: {},
            description: '演讲过于平淡，反响平平',
          },
        ],
      },
      {
        id: 'decline_speech',
        text: '将发言机会让给同僚',
        immediateEffects: { network: 15, partyInfluence: 10 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '同僚感激你的慷慨，但你失去了曝光机会',
          },
        ],
      },
    ],
  },

  {
    id: 'house_speaker_conflict',
    title: '与议长的分歧',
    description: '你在关键投票中反对议长的立场，引发党内紧张。',
    category: EventCategory.PARTY_INTERNAL,
    minPosition: Position.HOUSE_REPRESENTATIVE,
    maxPosition: Position.SENATOR,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'stand_ground',
        text: '坚持立场，不向议长妥协',
        immediateEffects: { partyInfluence: -20, reputation: 15 },
        outcomes: [
          {
            probability: 0.6,
            effects: { support: 20 },
            description: '选民欣赏你的独立性',
            addFlags: ['speaker_adversary'],
          },
          {
            probability: 0.4,
            effects: { partyInfluence: -20, fundraising: -15 },
            description: '议长切断你的资源和支持',
            addFlags: ['blacklisted_by_speaker'],
          },
        ],
      },
      {
        id: 'apologize',
        text: '向议长道歉，寻求和解',
        immediateEffects: { reputation: -10 },
        outcomes: [
          {
            probability: 0.7,
            effects: { partyInfluence: 10 },
            description: '议长接受道歉，关系修复',
          },
          {
            probability: 0.3,
            effects: { support: -15, reputation: -10 },
            description: '你的软弱让支持者失望',
          },
        ],
      },
      {
        id: 'build_coalition',
        text: '联合其他反对者形成压力',
        cost: { network: 25 },
        immediateEffects: { risk: 20 },
        outcomes: [
          {
            probability: 0.4,
            effects: { partyInfluence: 25, reputation: 25 },
            description: '你成功挑战议长权威，影响力大增',
            addFlags: ['power_broker'],
          },
          {
            probability: 0.6,
            effects: { partyInfluence: -30, network: -20 },
            description: '联盟失败，你被边缘化',
            addFlags: ['failed_rebel'],
          },
        ],
      },
    ],
  },

  // ========== 参议员阶段专属事件 ==========
  {
    id: 'senate_filibuster',
    title: '冗长辩论决策',
    description: '反对党威胁对重要法案进行冗长辩论（filibuster），你需要决定如何应对。',
    category: EventCategory.PARTY_INTERNAL,
    minPosition: Position.SENATOR,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'negotiate_end',
        text: '与反对党谈判，修改法案',
        cost: { partyInfluence: 15 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.6,
            effects: { reputation: 25, network: 20 },
            description: '你促成跨党派妥协，法案通过',
            addFlags: ['bipartisan_leader'],
          },
          {
            probability: 0.4,
            effects: { partyInfluence: -20 },
            description: '谈判失败，本党批评你软弱',
          },
        ],
      },
      {
        id: 'force_vote',
        text: '动用程序手段强行推进',
        cost: { network: 20 },
        immediateEffects: { partyInfluence: 15 },
        outcomes: [
          {
            probability: 0.5,
            effects: { reputation: 15 },
            description: '法案通过，但加剧党派对立',
            addFlags: ['partisan_warrior'],
          },
          {
            probability: 0.5,
            effects: { reputation: -15, media: -20 },
            description: '强推失败，被批评破坏传统',
          },
        ],
      },
      {
        id: 'table_bill',
        text: '暂时搁置法案，等待时机',
        immediateEffects: { partyInfluence: -10 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '法案搁置，但你避免了激烈对抗',
          },
        ],
      },
    ],
  },

  {
    id: 'senate_supreme_court',
    title: '最高法院提名投票',
    description: '总统提名的最高法院大法官引发争议，你的投票至关重要。',
    category: EventCategory.PARTY_INTERNAL,
    minPosition: Position.SENATOR,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'confirm_nominee',
        text: '投票确认提名',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { partyInfluence: 20, fundraising: 15 },
            description: '你支持本党立场，获得党内奖励',
          },
          {
            probability: 0.5,
            effects: { support: -20, reputation: -15 },
            description: '选民对提名人选强烈反对',
            addFlags: ['controversial_vote'],
          },
        ],
      },
      {
        id: 'oppose_nominee',
        text: '投票反对提名',
        immediateEffects: { partyInfluence: -25 },
        outcomes: [
          {
            probability: 0.6,
            effects: { support: 20, reputation: 15 },
            description: '你的反对立场获得选民支持',
            addFlags: ['conscience_voter'],
          },
          {
            probability: 0.4,
            effects: { fundraising: -25, partyInfluance: -20 },
            description: '党内金主和领导层对你极度不满',
            addFlags: ['party_outcast'],
          },
        ],
      },
      {
        id: 'demand_hearings',
        text: '要求更多听证和调查',
        cost: { network: 15 },
        immediateEffects: { media: 20 },
        outcomes: [
          {
            probability: 0.5,
            effects: { reputation: 20 },
            description: '你的谨慎态度获得尊重',
          },
          {
            probability: 0.5,
            effects: { partyInfluence: -15 },
            description: '双方都批评你拖延',
          },
        ],
      },
    ],
  },

  {
    id: 'senate_presidential_run_hint',
    title: '总统竞选试探',
    description: '党内大佬私下询问你是否有意参加下届总统初选，这是个重要信号。',
    category: EventCategory.OPPORTUNITY,
    minPosition: Position.SENATOR,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.partyInfluence > 60 && player.reputation > 65,
    options: [
      {
        id: 'express_interest',
        text: '表达兴趣，开始筹备',
        cost: { fundraising: 30 },
        immediateEffects: { media: 30, risk: 25 },
        outcomes: [
          {
            probability: 0.6,
            effects: { fundraising: 40, support: 25, reputation: 20 },
            description: '你的总统野心引发关注，捐款涌入',
            addFlags: ['presidential_exploratory'],
          },
          {
            probability: 0.4,
            effects: { partyInfluence: -20 },
            description: '党内认为你还不够格，时机未到',
          },
        ],
      },
      {
        id: 'decline_politely',
        text: '礼貌婉拒，继续积累',
        immediateEffects: { reputation: 10 },
        outcomes: [
          {
            probability: 1.0,
            effects: { partyInfluence: 15 },
            description: '你的谦逊赢得党内好感',
          },
        ],
      },
      {
        id: 'test_waters',
        text: '保持模糊，观察反应',
        immediateEffects: { media: 15 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '媒体开始猜测你的总统野心',
          },
        ],
      },
    ],
  },

  {
    id: 'senate_war_authorization',
    title: '战争授权投票',
    description: '总统要求国会授权对外军事行动，这是极其重大的决定。',
    category: EventCategory.INTERNATIONAL,
    minPosition: Position.SENATOR,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'vote_yes_war',
        text: '投票支持战争授权',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { partyInfluence: 20, reputation: 10 },
            description: '如果军事行动成功，你将获得政治资本',
            addFlags: ['supported_war'],
          },
          {
            probability: 0.5,
            effects: { support: -25, reputation: -20 },
            description: '如果陷入泥潭，你将承担历史责任',
            addFlags: ['war_mistake'],
          },
        ],
      },
      {
        id: 'vote_no_war',
        text: '投票反对战争授权',
        immediateEffects: { partyInfluence: -15 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 20, reputation: 25 },
            description: '如果战争失败，你的远见将被铭记',
            addFlags: ['antiwar_prophet'],
          },
          {
            probability: 0.5,
            effects: { reputation: -15, media: -20 },
            description: '如果战争成功，你将被视为软弱',
          },
        ],
      },
      {
        id: 'conditional_support',
        text: '提出条件，要求明确目标和退出策略',
        cost: { network: 20 },
        immediateEffects: { reputation: 15 },
        outcomes: [
          {
            probability: 0.6,
            effects: { reputation: 20, media: 20 },
            description: '你的理性态度获得跨党派赞誉',
          },
          {
            probability: 0.4,
            effects: { partyInfluence: -10 },
            description: '双方都认为你过于谨慎',
          },
        ],
      },
    ],
  },

  {
    id: 'senate_climate_deal',
    title: '气候法案大妥协',
    description: '一项跨党派气候法案需要你的支持票，但会损害你州的能源产业利益。',
    category: EventCategory.OPPORTUNITY,
    minPosition: Position.SENATOR,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'support_climate',
        text: '支持法案，站在历史正确一边',
        immediateEffects: { support: -20, fundraising: -15 },
        outcomes: [
          {
            probability: 0.6,
            effects: { reputation: 30, media: 25 },
            description: '你的勇气获得全国赞誉',
            addFlags: ['climate_hero'],
          },
          {
            probability: 0.4,
            effects: { support: -20 },
            description: '本州选民对你的背叛愤怒不已',
            addFlags: ['betrayed_state'],
          },
        ],
      },
      {
        id: 'oppose_climate',
        text: '反对法案，保护本州利益',
        immediateEffects: { support: 15, fundraising: 20 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你获得本州支持，但被环保派批评',
            addFlags: ['climate_denier'],
          },
        ],
      },
      {
        id: 'negotiate_amendments',
        text: '谈判修正案，保护本州同时支持法案',
        cost: { network: 30, leverage: 20 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { reputation: 35, support: 15, partyInfluence: 25 },
            description: '你成功斡旋，成为国家级立法者',
            addFlags: ['master_legislator'],
          },
          {
            probability: 0.5,
            effects: { reputation: -15 },
            description: '修正案未获通过，你两头不讨好',
          },
        ],
      },
    ],
  },

  {
    id: 'party_nomination_bid',
    title: '争取党内提名',
    description: '党内总统/州长提名竞争开始，你需要决定是否参与。',
    category: EventCategory.OPPORTUNITY,
    minPosition: Position.SENATOR,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.partyInfluence > 70 && player.fundraising > 60,
    options: [
      {
        id: 'enter_race',
        text: '正式宣布参选',
        cost: { fundraising: 50 },
        immediateEffects: { media: 40, risk: 30 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 30, partyInfluence: 20 },
            description: '你成为有力竞争者',
            addFlags: ['presidential_candidate'],
          },
          {
            probability: 0.5,
            effects: { reputation: -15 },
            description: '初选竞争激烈，你面临严峻挑战',
            addFlags: ['tough_primary'],
          },
        ],
      },
      {
        id: 'support_ally',
        text: '支持盟友，换取未来回报',
        immediateEffects: { partyInfluence: 15 },
        outcomes: [
          {
            probability: 1.0,
            effects: { network: 20 },
            description: '你为未来竞选积累了政治资本',
            addFlags: ['party_kingmaker'],
          },
        ],
      },
    ],
  },

  // ========== 失败路径事件 ==========
  {
    id: 'betrayal_by_ally',
    title: '盟友背叛',
    description: '你的一个重要盟友突然转向支持你的对手，并公开披露你的一些秘密。',
    category: EventCategory.OPPONENT,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.leverage > 20,
    options: [
      {
        id: 'damage_control',
        text: '紧急公关，降低损害',
        cost: { fundraising: 25, network: 20 },
        immediateEffects: { reputation: -15, support: -10 },
        outcomes: [
          {
            probability: 0.6,
            effects: {},
            description: '你成功控制了局面',
          },
          {
            probability: 0.4,
            effects: { reputation: -20, support: -15 },
            description: '情况持续恶化',
            addFlags: ['damaged_by_betrayal'],
          },
        ],
      },
      {
        id: 'counter_betrayal',
        text: '反击，曝光盟友的黑料',
        cost: { leverage: 25 },
        immediateEffects: { media: -15 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 10 },
            description: '以牙还牙，双方两败俱伤',
          },
          {
            probability: 0.5,
            effects: { reputation: -25 },
            description: '你被批评为无情，进一步失去支持',
          },
        ],
      },
    ],
  },

  {
    id: 'funding_crisis',
    title: '资金链断裂',
    description: '多个主要捐赠者突然撤回支持，你的竞选资金严重不足。',
    category: EventCategory.ECONOMY,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.fundraising < 30,
    options: [
      {
        id: 'emergency_fundraising',
        text: '紧急募款，寻求小额捐赠',
        cost: { network: 15 },
        immediateEffects: { fundraising: 20 },
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 10 },
            description: '草根捐赠挽救了你的竞选',
          },
          {
            probability: 0.5,
            effects: {},
            description: '募款效果有限，你仍面临困境',
          },
        ],
      },
      {
        id: 'cut_campaign',
        text: '大幅削减竞选开支',
        immediateEffects: { media: -20, support: -15 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你的竞选活动严重受限',
            addFlags: ['underfunded_campaign'],
          },
        ],
      },
      {
        id: 'seek_pac_money',
        text: '寻求超级政治行动委员会（Super PAC）支持',
        immediateEffects: { fundraising: 40, risk: 25 },
        outcomes: [
          {
            probability: 0.6,
            effects: { leverage: 20 },
            description: '你获得资金，但被利益集团控制',
            addFlags: ['pac_controlled'],
          },
          {
            probability: 0.4,
            effects: { reputation: -20 },
            description: 'PAC资金来源被曝光，你被指责为傀儡',
          },
        ],
      },
    ],
  },

  {
    id: 'health_crisis',
    title: '健康危机',
    description: '你的健康问题被媒体关注，引发对你是否适合继续任职的质疑。',
    category: EventCategory.SCANDAL,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'full_disclosure',
        text: '公开健康状况，展示透明度',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.6,
            effects: { reputation: 10 },
            description: '你的诚实赢得尊重',
          },
          {
            probability: 0.4,
            effects: { support: -15 },
            description: '选民担心你无法履行职责',
          },
        ],
      },
      {
        id: 'minimize_issue',
        text: '淡化问题，强调能力',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: {},
            description: '你成功转移了话题',
          },
          {
            probability: 0.5,
            effects: { media: -20, reputation: -15 },
            description: '媒体持续追问，你被指责不透明',
          },
        ],
      },
    ],
  },

  {
    id: 'voter_suppression_accusation',
    title: '被指控选举舞弊',
    description: '对手阵营指控你的团队涉嫌选举舞弊或压制选民投票。',
    category: EventCategory.INVESTIGATION,
    weight: 1,
    baseWeight: 1,
    options: [
      {
        id: 'full_audit',
        text: '主动要求独立审计',
        cost: { fundraising: 20 },
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.7,
            effects: { reputation: 15 },
            description: '审计证明你的清白',
            removeFlags: ['election_fraud_accusation'],
          },
          {
            probability: 0.3,
            effects: { reputation: -20, support: -15 },
            description: '审计发现一些程序问题',
            addFlags: ['election_irregularities'],
          },
        ],
      },
      {
        id: 'dismiss_accusations',
        text: '驳斥指控，反击对手',
        immediateEffects: {},
        outcomes: [
          {
            probability: 0.5,
            effects: { support: 10 },
            description: '支持者相信你',
          },
          {
            probability: 0.5,
            effects: { media: -15, reputation: -10 },
            description: '争议持续，损害你的形象',
          },
        ],
      },
    ],
  },

  {
    id: 'party_faction_purge',
    title: '党内清洗',
    description: '党内主流派系认为你过于激进/保守，试图边缘化你。',
    category: EventCategory.PARTY_INTERNAL,
    weight: 1,
    baseWeight: 1,
    condition: (player) => player.partyInfluence < 30 || player.flags.includes('progressive_wing') || player.flags.includes('moderate_wing'),
    options: [
      {
        id: 'fight_back',
        text: '团结基层，对抗建制派',
        cost: { fundraising: 20 },
        immediateEffects: { support: 20, partyInfluence: -20 },
        outcomes: [
          {
            probability: 0.5,
            effects: { network: 25 },
            description: '你成功动员基层，保住了地位',
            addFlags: ['party_rebel'],
          },
          {
            probability: 0.5,
            effects: { partyInfluence: -30 },
            description: '党组织全力打压你',
            addFlags: ['party_outcast'],
          },
        ],
      },
      {
        id: 'compromise',
        text: '向主流派妥协，调整立场',
        immediateEffects: { support: -15, partyInfluence: 20 },
        outcomes: [
          {
            probability: 1.0,
            effects: {},
            description: '你保住了党内地位，但失去了部分基层支持',
            removeFlags: ['progressive_wing', 'moderate_wing'],
          },
        ],
      },
      {
        id: 'consider_independent',
        text: '考虑脱离党派，以独立身份参选',
        immediateEffects: { partyInfluence: -50, fundraising: -30 },
        outcomes: [
          {
            probability: 0.3,
            effects: { support: 30, media: 40 },
            description: '你的独立宣言引发轰动，开创新路',
            addFlags: ['independent_candidate'],
          },
          {
            probability: 0.7,
            effects: { support: -20, network: -30 },
            description: '失去党组织支持后，你的竞选陷入困境',
            addFlags: ['political_suicide'],
          },
        ],
      },
    ],
  },
];

// 导出事件数量
export const EVENT_COUNT = ALL_EVENTS.length;
