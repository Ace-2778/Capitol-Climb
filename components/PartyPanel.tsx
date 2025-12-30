import React from 'react';
import { PartyData, Party } from '@/types/game';

interface PartyPanelProps {
  playerParty: Party;
  parties: {
    democrat: PartyData;
    republican: PartyData;
  };
}

export const PartyPanel: React.FC<PartyPanelProps> = ({ playerParty, parties }) => {
  const myParty = playerParty === Party.DEMOCRAT ? parties.democrat : parties.republican;
  const opposingParty = playerParty === Party.DEMOCRAT ? parties.republican : parties.democrat;

  const getPartyName = (party: Party): string => {
    return party === Party.DEMOCRAT ? '民主党' : '共和党';
  };

  const getPartyColor = (party: Party): string => {
    return party === Party.DEMOCRAT ? 'text-blue-400' : 'text-red-400';
  };

  const renderPartyCard = (partyData: PartyData, isMyParty: boolean) => (
    <div className={`bg-gray-700 p-3 rounded ${isMyParty ? 'border-2 border-yellow-500' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-lg font-bold ${getPartyColor(partyData.party)}`}>
          {getPartyName(partyData.party)}
          {isMyParty && <span className="text-xs text-yellow-400 ml-2">我的党派</span>}
        </h3>
        <div className="text-right">
          <div className="text-xs text-gray-400">全国民调</div>
          <div className="text-xl font-bold">{partyData.nationalPolling.toFixed(0)}%</div>
        </div>
      </div>

      {/* 党派资金池 */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-1">党派资金池</div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div
            className="bg-yellow-500 h-2 rounded-full"
            style={{ width: `${partyData.fundingPool}%` }}
          ></div>
        </div>
        <div className="text-right text-xs mt-1">{partyData.fundingPool}/100</div>
      </div>

      {/* 派系分布 */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-1">派系分布</div>
        <div className="flex h-4 rounded overflow-hidden">
          {Object.entries(partyData.factions).map(([faction, percentage]) => {
            const colors: Record<string, string> = {
              progressive: 'bg-green-500',
              moderate: 'bg-blue-500',
              conservative: 'bg-red-500',
              establishment: 'bg-purple-500',
              populist: 'bg-orange-500',
            };
            return (
              <div
                key={faction}
                className={colors[faction] || 'bg-gray-500'}
                style={{ width: `${percentage}%` }}
                title={`${faction}: ${percentage}%`}
              ></div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1 mt-2 text-xs">
          {Object.entries(partyData.factions).map(([faction, percentage]) => {
            const labels: Record<string, string> = {
              progressive: '进步派',
              moderate: '温和派',
              conservative: '保守派',
              establishment: '建制派',
              populist: '民粹派',
            };
            return (
              <span key={faction} className="text-gray-400">
                {labels[faction]}: {percentage}%
              </span>
            );
          })}
        </div>
      </div>

      {/* 核心议题 */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-1">核心议题</div>
        <div className="flex flex-wrap gap-1">
          {partyData.keyIssues.map((issue, index) => (
            <span
              key={index}
              className="text-xs bg-gray-600 px-2 py-1 rounded text-gray-200"
            >
              {issue}
            </span>
          ))}
        </div>
      </div>

      {/* 关键人物 */}
      {isMyParty && (
        <div>
          <div className="text-xs text-gray-400 mb-1">党内关键人物</div>
          <div className="space-y-2">
            {partyData.keyFigures.map((figure, index) => (
              <div key={index} className="bg-gray-600 p-2 rounded text-xs">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">{figure.name}</span>
                  <span className="text-gray-400">{figure.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">影响力: {figure.influence}</span>
                  <span className={figure.relationshipWithPlayer > 0 ? 'text-green-400' : 'text-red-400'}>
                    关系: {figure.relationshipWithPlayer > 0 ? '+' : ''}{figure.relationshipWithPlayer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        党派系统
      </h2>

      <div className="space-y-4">
        {/* 我的党派 */}
        {renderPartyCard(myParty, true)}

        {/* 对手党派 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">对手党派</h3>
          {renderPartyCard(opposingParty, false)}
        </div>
      </div>
    </div>
  );
};
