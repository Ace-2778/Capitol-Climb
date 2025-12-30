import React from 'react';
import { Player, Position } from '@/types/game';

interface PlayerPanelProps {
  player: Player;
  onAttemptPromotion?: () => void;
  canPromote?: boolean;
  promotionReason?: string;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ 
  player, 
  onAttemptPromotion,
  canPromote,
  promotionReason 
}) => {
  const getPositionName = (position: Position): string => {
    const names: Record<Position, string> = {
      [Position.LOCAL_COUNCIL]: '地方议会议员',
      [Position.STATE_REPRESENTATIVE]: '州众议员',
      [Position.STATE_SENATOR]: '州参议员',
      [Position.GOVERNOR]: '州长',
      [Position.HOUSE_REPRESENTATIVE]: '联邦众议员',
      [Position.SENATOR]: '联邦参议员',
      [Position.CABINET]: '内阁成员',
      [Position.VICE_PRESIDENT]: '副总统',
      [Position.PRESIDENT]: '总统',
    };
    return names[position];
  };

  const getPartyName = (party: string): string => {
    return party === 'democrat' ? '民主党' : party === 'republican' ? '共和党' : '独立';
  };

  const getPartyColor = (party: string): string => {
    return party === 'democrat' ? 'text-blue-400' : party === 'republican' ? 'text-red-400' : 'text-gray-400';
  };

  const getFactionName = (faction: string): string => {
    const names: Record<string, string> = {
      progressive: '进步派',
      moderate: '温和派',
      conservative: '保守派',
      establishment: '建制派',
      populist: '民粹派',
    };
    return names[faction] || faction;
  };

  const ResourceBar = ({ 
    label, 
    value, 
    color = 'blue',
    showValue = true 
  }: { 
    label: string; 
    value: number; 
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink';
    showValue?: boolean;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
    };

    const getValueColor = (val: number) => {
      if (val >= 70) return 'text-green-400';
      if (val >= 40) return 'text-yellow-400';
      return 'text-red-400';
    };

    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-300">{label}</span>
          {showValue && <span className={getValueColor(value)}>{value.toFixed(0)}</span>}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 shadow-lg">
      {/* 基本信息 */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">{player.name}</h2>
        <div className="text-sm text-gray-400">
          <span className={getPartyColor(player.party)}>{getPartyName(player.party)}</span>
          <span className="mx-2">•</span>
          <span>{getFactionName(player.faction)}</span>
          <span className="mx-2">•</span>
          <span>{player.state}</span>
        </div>
      </div>

      {/* 当前职位 */}
      <div className="mb-4 bg-gray-700 p-3 rounded">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400">当前职位</div>
            <div className="text-lg font-bold">{getPositionName(player.position)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">任期</div>
            <div className="text-lg font-bold">{player.termCount}</div>
          </div>
        </div>
        
        {player.turnsUntilElection > 0 && (
          <div className="mt-2 text-xs text-gray-400">
            距离下次选举：<span className="text-yellow-400 font-semibold">{player.turnsUntilElection}</span> 回合
          </div>
        )}

        {player.turnsUntilElection <= 0 && (
          <div className="mt-2 text-xs text-red-400 font-semibold">
            ⚠️ 选举即将到来！
          </div>
        )}
      </div>

      {/* 核心资源 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">核心资源</h3>
        <ResourceBar label="声望 (Reputation)" value={player.reputation} color="purple" />
        <ResourceBar label="民意支持 (Support)" value={player.support} color="green" />
        <ResourceBar label="资金 (Fundraising)" value={player.fundraising} color="yellow" />
        <ResourceBar label="人脉网络 (Network)" value={player.network} color="blue" />
        <ResourceBar label="党内影响力 (Party Influence)" value={player.partyInfluence} color="blue" />
      </div>

      {/* 风险指标 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">风险指标</h3>
        <ResourceBar 
          label="曝光风险 (Risk)" 
          value={player.risk} 
          color="red"
        />
        <ResourceBar 
          label="掌握黑料 (Leverage)" 
          value={player.leverage} 
          color="pink"
        />
        <div className="text-xs text-gray-400 mt-1">
          媒体关系: 
          <span className={player.media > 0 ? 'text-green-400' : 'text-red-400'}>
            {player.media > 0 ? ' +' : ' '}{player.media.toFixed(0)}
          </span>
        </div>
      </div>

      {/* 晋升按钮 */}
      {player.position !== Position.PRESIDENT && (
        <div className="mb-4">
          <button
            onClick={onAttemptPromotion}
            disabled={!canPromote}
            className={`w-full py-2 px-4 rounded font-semibold transition-all ${
              canPromote
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canPromote ? '尝试晋升' : '晋升条件未满足'}
          </button>
          {!canPromote && promotionReason && (
            <div className="mt-2 text-xs text-yellow-400">
              {promotionReason}
            </div>
          )}
        </div>
      )}

      {/* 状态标记 */}
      {player.flags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">状态标记</h3>
          <div className="flex flex-wrap gap-1">
            {player.flags.map((flag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
              >
                {flag.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
