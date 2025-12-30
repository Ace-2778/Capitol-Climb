import React from 'react';
import { NationalState } from '@/types/game';

interface NationalPanelProps {
  state: NationalState;
}

export const NationalPanel: React.FC<NationalPanelProps> = ({ state }) => {
  const getIndicatorColor = (value: number, isGood: boolean) => {
    if (isGood) {
      return value > 0 ? 'text-green-500' : 'text-red-500';
    }
    return value < 5 ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = (value: number) => {
    if (value > 0.5) return '↑';
    if (value < -0.5) return '↓';
    return '→';
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        国家环境 - 第{state.turn}回合
      </h2>

      {/* 经济指标 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">经济指标</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-700 p-2 rounded">
            <div className="text-gray-400">GDP增长率</div>
            <div className={getIndicatorColor(state.gdpGrowth, true)}>
              {state.gdpGrowth.toFixed(1)}% {getTrendIcon(state.gdpGrowth)}
            </div>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <div className="text-gray-400">失业率</div>
            <div className={getIndicatorColor(state.unemployment, false)}>
              {state.unemployment.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <div className="text-gray-400">通胀率</div>
            <div className={getIndicatorColor(state.inflation, false)}>
              {state.inflation.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <div className="text-gray-400">股市</div>
            <div className={getIndicatorColor(state.stockMarket, true)}>
              {state.stockMarket > 0 ? '+' : ''}{state.stockMarket.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* 国际局势 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">国际局势</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-700 p-2 rounded">
            <div className="text-gray-400">战争风险</div>
            <div className={state.warRisk > 50 ? 'text-red-500' : 'text-green-500'}>
              {state.warRisk.toFixed(0)}/100
            </div>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <div className="text-gray-400">外交关系</div>
            <div className={state.diplomaticRelations > 0 ? 'text-green-500' : 'text-red-500'}>
              {state.diplomaticRelations > 0 ? '+' : ''}{state.diplomaticRelations.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* 总统支持率 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">总统</h3>
        <div className="bg-gray-700 p-2 rounded">
          <div className="flex justify-between items-center">
            <span>{state.president.name}</span>
            <span className={`font-bold ${
              state.president.party === 'democrat' ? 'text-blue-400' : 'text-red-400'
            }`}>
              {state.president.party === 'democrat' ? '民主党' : '共和党'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-gray-400 text-xs">支持率</div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  state.president.approval > 50 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${state.president.approval}%` }}
              ></div>
            </div>
            <div className="text-right text-sm mt-1">{state.president.approval.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* 社会议题热度 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">社会议题热度</h3>
        <div className="space-y-2 text-xs">
          {Object.entries(state.issues).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="capitalize">
                  {key === 'immigration' ? '移民' :
                   key === 'gunControl' ? '枪支管控' :
                   key === 'healthcare' ? '医疗' :
                   key === 'education' ? '教育' : '环境'}
                </span>
                <span>{value}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full"
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
