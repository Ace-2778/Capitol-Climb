import React from 'react';
import { GameEvent, EventOption } from '@/types/game';

interface EventCardProps {
  event: GameEvent;
  onSelectOption: (optionId: string) => void;
  onDismiss: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelectOption, onDismiss }) => {
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      media: 'border-purple-500',
      party_internal: 'border-blue-500',
      opponent: 'border-red-500',
      public_opinion: 'border-green-500',
      international: 'border-yellow-500',
      economy: 'border-orange-500',
      scandal: 'border-pink-500',
      investigation: 'border-red-700',
      opportunity: 'border-green-400',
    };
    return colors[category] || 'border-gray-500';
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      media: '媒体',
      party_internal: '党内',
      opponent: '对手',
      public_opinion: '舆论',
      international: '国际',
      economy: '经济',
      scandal: '丑闻',
      investigation: '调查',
      opportunity: '机遇',
    };
    return labels[category] || category;
  };

  const renderResourceChange = (change: Record<string, number> | undefined, label: string, showValues: boolean = true) => {
    if (!change || Object.keys(change).length === 0) return null;

    const resourceLabels: Record<string, string> = {
      reputation: '声望',
      support: '民意',
      fundraising: '资金',
      network: '人脉',
      media: '媒体',
      leverage: '黑料',
      risk: '风险',
      partyInfluence: '党内影响',
    };

    return (
      <div className="text-xs mt-1">
        <span className="text-gray-400">{label}: </span>
        {Object.entries(change).map(([key, value]) => (
          <span
            key={key}
            className={`mr-2 ${value > 0 ? 'text-green-400' : 'text-red-400'}`}
          >
            {resourceLabels[key] || key} {showValues ? `${value > 0 ? '+' : ''}${value}` : ''}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-gray-800 text-white rounded-lg p-4 shadow-xl border-l-4 ${getCategoryColor(event.category)}`}>
      {/* 头部 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="text-xs bg-gray-700 px-2 py-1 rounded mr-2">
              {getCategoryLabel(event.category)}
            </span>
          </div>
          <h3 className="text-lg font-bold">{event.title}</h3>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-white text-xl leading-none"
          title="忽略此事件"
        >
          ×
        </button>
      </div>

      {/* 描述 */}
      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
        {event.description}
      </p>

      {/* 选项 */}
      <div className="space-y-3">
        {event.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => onSelectOption(option.id)}
            className="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded transition-all border border-gray-600 hover:border-gray-500"
          >
            <div className="font-semibold mb-1">
              选项 {index + 1}: {option.text}
            </div>

            {/* 成本 - 显示具体数值 */}
            {option.cost && Object.keys(option.cost).length > 0 && (
              <div className="text-xs mt-1 bg-red-900/30 px-2 py-1 rounded">
                <span className="text-red-400">💰 成本: </span>
                {Object.entries(option.cost).map(([key, value]) => {
                  const resourceLabels: Record<string, string> = {
                    reputation: '声望',
                    support: '民意',
                    fundraising: '资金',
                    network: '人脉',
                    media: '媒体',
                    leverage: '黑料',
                    risk: '风险',
                    partyInfluence: '党内影响',
                  };
                  return (
                    <span key={key} className="mr-2 text-red-300">
                      {resourceLabels[key] || key} -{value}
                    </span>
                  );
                })}
              </div>
            )}

            {/* 效果提示 - 隐藏具体数值，只显示影响的资源类型 */}
            {option.immediateEffects && Object.keys(option.immediateEffects).length > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                🎲 可能影响: {renderResourceChange(option.immediateEffects, '', false)}
              </div>
            )}

            {/* 概率提示 */}
            {option.outcomes && option.outcomes.length > 0 && (
              <div className="text-xs text-yellow-400 mt-2">
                ⚠️ 此选择有多种可能结果（结果未知）
              </div>
            )}

            {/* 长期效果提示 */}
            {(option.addFlags && option.addFlags.length > 0) && (
              <div className="text-xs text-blue-400 mt-1">
                📌 可能产生长期影响
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

interface EventListProps {
  events: GameEvent[];
  onSelectOption: (eventId: string, optionId: string) => void;
  onDismiss: (eventId: string) => void;
}

export const EventList: React.FC<EventListProps> = ({ events, onSelectOption, onDismiss }) => {
  if (events.length === 0) {
    return (
      <div className="bg-gray-800 text-white rounded-lg p-8 text-center">
        <div className="text-gray-400 text-lg mb-2">📭</div>
        <div className="text-gray-400">当前没有待处理的事件</div>
        <div className="text-gray-500 text-sm mt-2">点击"下一回合"继续游戏</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onSelectOption={(optionId) => onSelectOption(event.id, optionId)}
          onDismiss={() => onDismiss(event.id)}
        />
      ))}
    </div>
  );
};
