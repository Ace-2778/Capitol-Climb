import React from 'react';
import { Opponent, OpponentArchetype } from '@/types/game';

interface OpponentListProps {
  opponents: Opponent[];
}

export const OpponentList: React.FC<OpponentListProps> = ({ opponents }) => {
  const getArchetypeLabel = (archetype: OpponentArchetype): string => {
    const labels: Record<OpponentArchetype, string> = {
      [OpponentArchetype.POPULIST]: '民粹型',
      [OpponentArchetype.ESTABLISHMENT]: '建制型',
      [OpponentArchetype.CONSPIRATOR]: '阴谋型',
    };
    return labels[archetype];
  };

  const getArchetypeColor = (archetype: OpponentArchetype): string => {
    const colors: Record<OpponentArchetype, string> = {
      [OpponentArchetype.POPULIST]: 'bg-orange-600',
      [OpponentArchetype.ESTABLISHMENT]: 'bg-blue-600',
      [OpponentArchetype.CONSPIRATOR]: 'bg-purple-600',
    };
    return colors[archetype];
  };

  const getPartyColor = (party: string): string => {
    return party === 'democrat' ? 'text-blue-400' : 'text-red-400';
  };

  const getRelationshipColor = (relationship: number): string => {
    if (relationship > 20) return 'text-green-400';
    if (relationship > -20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const StatBar = ({ value, max = 100 }: { value: number; max?: number }) => (
    <div className="w-full bg-gray-700 rounded-full h-1.5">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  );

  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        政治对手
      </h2>

      {opponents.length === 0 ? (
        <div className="text-center text-gray-400 py-4">
          暂无对手信息
        </div>
      ) : (
        <div className="space-y-3">
          {opponents.map((opponent) => (
            <div key={opponent.id} className="bg-gray-700 p-3 rounded">
              {/* 头部 */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{opponent.name}</h3>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className={getPartyColor(opponent.party)}>
                      {opponent.party === 'democrat' ? '民主党' : '共和党'}
                    </span>
                    <span className={`${getArchetypeColor(opponent.archetype)} px-2 py-0.5 rounded`}>
                      {getArchetypeLabel(opponent.archetype)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">民调</div>
                  <div className="text-xl font-bold">{opponent.polling.toFixed(0)}%</div>
                </div>
              </div>

              {/* 关系 */}
              <div className="mb-3 text-xs">
                <span className="text-gray-400">与你的关系: </span>
                <span className={getRelationshipColor(opponent.relationshipWithPlayer)}>
                  {opponent.relationshipWithPlayer > 0 ? '+' : ''}
                  {opponent.relationshipWithPlayer}
                </span>
              </div>

              {/* 属性 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">资金</span>
                    <span>{opponent.funding.toFixed(0)}</span>
                  </div>
                  <StatBar value={opponent.funding} />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">党内影响</span>
                    <span>{opponent.partyInfluence.toFixed(0)}</span>
                  </div>
                  <StatBar value={opponent.partyInfluence} />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">媒体</span>
                    <span>{opponent.media.toFixed(0)}</span>
                  </div>
                  <StatBar value={Math.max(0, opponent.media + 100)} max={200} />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">防御</span>
                    <span>{opponent.defense.toFixed(0)}</span>
                  </div>
                  <StatBar value={opponent.defense} />
                </div>
              </div>

              {/* 特质提示 */}
              <div className="mt-2 text-xs text-gray-400 italic">
                {opponent.archetype === OpponentArchetype.POPULIST && '擅长煽动民意和媒体炒作'}
                {opponent.archetype === OpponentArchetype.ESTABLISHMENT && '拥有雄厚的资金和党内资源'}
                {opponent.archetype === OpponentArchetype.CONSPIRATOR && '善于收集黑料和背后操作'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
