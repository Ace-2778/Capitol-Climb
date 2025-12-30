'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { useDecisionStore } from '@/store/decisionStore';
import { SPEECH_TEMPLATES } from '@/data/speeches';

export default function SpeechDetailPage() {
  const params = useParams();
  const router = useRouter();
  const speechId = params.id as string;
  
  const { player, nationalState, nextTurn } = useGameStore();
  const {
    getActiveSpeechById,
    selectSpeechOption,
    executeSpeechAndApply,
  } = useDecisionStore();

  const speech = getActiveSpeechById(speechId);
  const template = speech ? SPEECH_TEMPLATES.find((t) => t.id === speech.templateId) : null;

  if (!speech || !template) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <Link href="/decisions" className="text-blue-400 hover:underline">← 返回决策中心</Link>
        <div className="mt-8 text-center text-gray-400">讲话不存在</div>
      </div>
    );
  }

  const isComplete = speech.selectedOptions.opening && speech.selectedOptions.core && speech.selectedOptions.closing;

  // 执行讲话
  const handleExecute = () => {
    if (!isComplete) {
      alert('请完成所有三段选择');
      return;
    }

    const result = executeSpeechAndApply(speechId, player);
    if (result) {
      // 应用效果
      const updatedPlayer = {
        ...player,
        support: Math.max(0, Math.min(100, player.support + result.support)),
        reputation: Math.max(0, Math.min(100, player.reputation + result.reputation)),
        media: Math.max(-100, Math.min(100, player.media + result.media)),
        partyInfluence: Math.max(0, Math.min(100, player.partyInfluence + result.partyInfluence)),
        fundraising: Math.max(0, Math.min(100, player.fundraising + result.fundraising)),
        risk: Math.max(0, Math.min(100, player.risk + (result.risks.investigation + result.risks.scandal) / 2)),
      };

      // 这里应该调用 gameStore 的更新方法，简化起见直接展示结果
      alert(`讲话效果:\n支持度: ${result.support > 0 ? '+' : ''}${result.support}\n声望: ${result.reputation > 0 ? '+' : ''}${result.reputation}\n媒体: ${result.media > 0 ? '+' : ''}${result.media}\n\n媒体标题:\n友好媒体: "${result.headlines.friendly}"\n中立媒体: "${result.headlines.neutral}"\n敌对媒体: "${result.headlines.hostile}"`);
      
      router.push('/decisions');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      {/* 返回按钮 */}
      <Link href="/decisions" className="inline-block mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all">
        ← 返回决策中心
      </Link>

      {/* 讲话标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{speech.title}</h1>
        <p className="text-gray-400">{template.description}</p>
        <p className="text-sm text-gray-500 mt-2">{template.context}</p>
        <div className="flex gap-3 mt-3">
          <span className="px-3 py-1 bg-purple-600 rounded text-sm">{speech.type}</span>
          <span className="px-3 py-1 bg-orange-600 rounded text-sm">剩余 {speech.turnsRemaining} 回合</span>
        </div>
      </div>

      {/* 进度指示器 */}
      <div className="mb-8 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center gap-4">
          <div className={`flex-1 text-center p-2 rounded ${speech.selectedOptions.opening ? 'bg-purple-600' : 'bg-gray-700'}`}>
            <div className="text-xs">开场</div>
            <div className="font-bold">{speech.selectedOptions.opening ? '✓' : '○'}</div>
          </div>
          <div className="text-gray-600">→</div>
          <div className={`flex-1 text-center p-2 rounded ${speech.selectedOptions.core ? 'bg-purple-600' : 'bg-gray-700'}`}>
            <div className="text-xs">核心论点</div>
            <div className="font-bold">{speech.selectedOptions.core ? '✓' : '○'}</div>
          </div>
          <div className="text-gray-600">→</div>
          <div className={`flex-1 text-center p-2 rounded ${speech.selectedOptions.closing ? 'bg-purple-600' : 'bg-gray-700'}`}>
            <div className="text-xs">结尾</div>
            <div className="font-bold">{speech.selectedOptions.closing ? '✓' : '○'}</div>
          </div>
        </div>
      </div>

      {/* 主内容 - 两列 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左列 - 讲话选项 */}
        <div className="lg:col-span-2 space-y-8">
          {template.segments.map((segment) => {
            const segmentLabels: Record<string, string> = {
              opening: '开场定调',
              core: '核心论点',
              closing: '收尾策略',
            };

            const isSelected = !!speech.selectedOptions[segment.type];
            const selectedOption = segment.options.find((o) => o.id === speech.selectedOptions[segment.type]);

            return (
              <div key={segment.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">
                  {segment.type === 'opening' && '🎯'} 
                  {segment.type === 'core' && '💡'} 
                  {segment.type === 'closing' && '🎬'} 
                  {segmentLabels[segment.type]}
                </h2>

                <div className="space-y-4">
                  {segment.options.map((option) => {
                    const isThisSelected = speech.selectedOptions[segment.type] === option.id;
                    
                    return (
                      <div
                        key={option.id}
                        onClick={() => selectSpeechOption(speechId, segment.type as any, option.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isThisSelected
                            ? 'border-purple-500 bg-purple-900/30'
                            : 'border-gray-600 hover:border-purple-400 bg-gray-700/50'
                        }`}
                      >
                        {/* 选项文本 */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isThisSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-500'
                            }`}>
                              {isThisSelected && <span className="text-xs">✓</span>}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-600 rounded">{option.tone}</span>
                          </div>
                          <p className="text-white leading-relaxed">{option.text}</p>
                        </div>

                        {/* 表现值（保留，因为这是你的表现能力） */}
                        <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                          <div className={option.performance.charisma > 0 ? 'text-blue-400' : 'text-gray-500'}>
                            <div className="text-gray-400">口才</div>
                            <div className="font-semibold">{option.performance.charisma > 0 ? '+' : ''}{option.performance.charisma}</div>
                          </div>
                          <div className={option.performance.credibility > 0 ? 'text-green-400' : 'text-gray-500'}>
                            <div className="text-gray-400">可信度</div>
                            <div className="font-semibold">{option.performance.credibility > 0 ? '+' : ''}{option.performance.credibility}</div>
                          </div>
                          <div className={option.performance.aggression > 0 ? 'text-red-400' : 'text-gray-500'}>
                            <div className="text-gray-400">攻击性</div>
                            <div className="font-semibold">{option.performance.aggression > 0 ? '+' : ''}{option.performance.aggression}</div>
                          </div>
                          <div className={option.performance.empathy > 0 ? 'text-purple-400' : 'text-gray-500'}>
                            <div className="text-gray-400">同理心</div>
                            <div className="font-semibold">{option.performance.empathy > 0 ? '+' : ''}{option.performance.empathy}</div>
                          </div>
                        </div>

                        {/* 受众反应预测（只显示会影响哪些方面） */}
                        <div className="mb-3 p-3 bg-gray-900/50 rounded">
                          <div className="text-xs text-gray-400 mb-2">🎭 可能影响</div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {(() => {
                              const impacts: string[] = [];
                              const baseAvg = (option.audienceImpact.baseVoters.min + option.audienceImpact.baseVoters.max) / 2;
                              const swingAvg = (option.audienceImpact.swingVoters.min + option.audienceImpact.swingVoters.max) / 2;
                              const eliteAvg = (option.audienceImpact.elites.min + option.audienceImpact.elites.max) / 2;
                              const donorAvg = (option.audienceImpact.donors.min + option.audienceImpact.donors.max) / 2;
                              
                              if (Math.abs(baseAvg) > 5) impacts.push('基础盘');
                              if (Math.abs(swingAvg) > 5) impacts.push('摇摆选民');
                              if (Math.abs(eliteAvg) > 5) impacts.push('精英阶层');
                              if (Math.abs(donorAvg) > 5) impacts.push('金主');
                              
                              return impacts.length > 0 ? (
                                impacts.map((impact) => (
                                  <span key={impact} className="px-2 py-1 bg-gray-800 rounded text-gray-300">
                                    {impact}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500">影响较小</span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* 媒体标题预览 */}
                        <div className="mb-3 space-y-1 text-xs">
                          <div className="text-gray-400 mb-1">📰 媒体标题预测:</div>
                          <div className="p-2 bg-green-900/30 rounded text-green-300">
                            友好: "{option.mediaReaction.friendly}"
                          </div>
                          <div className="p-2 bg-yellow-900/30 rounded text-yellow-300">
                            中立: "{option.mediaReaction.neutral}"
                          </div>
                          <div className="p-2 bg-red-900/30 rounded text-red-300">
                            敌对: "{option.mediaReaction.hostile}"
                          </div>
                        </div>

                        {/* 风险提示 */}
                        {(option.risks.factCheckRisk > 15 || option.risks.investigationRisk > 15 || 
                          option.risks.scandalRisk > 15 || option.risks.partySplitRisk > 15) && (
                          <div className="pt-3 border-t border-gray-700">
                            <div className="text-xs text-red-400 mb-1">⚠️ 风险警告:</div>
                            <div className="flex flex-wrap gap-1">
                              {option.risks.factCheckRisk > 15 && (
                                <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                                  事实核查 {option.risks.factCheckRisk}%
                                </span>
                              )}
                              {option.risks.investigationRisk > 15 && (
                                <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded">
                                  调查风险 {option.risks.investigationRisk}%
                                </span>
                              )}
                              {option.risks.scandalRisk > 15 && (
                                <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">
                                  丑闻风险 {option.risks.scandalRisk}%
                                </span>
                              )}
                              {option.risks.partySplitRisk > 15 && (
                                <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                                  分裂风险 {option.risks.partySplitRisk}%
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* 执行按钮 */}
          {isComplete && (
            <button
              onClick={handleExecute}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 px-6 rounded-lg transition-all shadow-lg"
            >
              🎤 发表讲话并应用效果
            </button>
          )}
        </div>

        {/* 右列 - 累计表现与预测效果 */}
        <div className="space-y-6">
          {/* 累计表现值 */}
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-blue-400">🎭 累计表现</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">口才魅力</span>
                <span className="text-2xl font-bold text-blue-400">{speech.totalPerformance.charisma}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">可信度</span>
                <span className="text-2xl font-bold text-green-400">{speech.totalPerformance.credibility}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">攻击性</span>
                <span className="text-2xl font-bold text-red-400">{speech.totalPerformance.aggression}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">同理心</span>
                <span className="text-2xl font-bold text-purple-400">{speech.totalPerformance.empathy}</span>
              </div>
            </div>
          </div>

          {/* 预测效果（仅在三段都选了之后显示） */}
          {isComplete && (
            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-green-400">📊 预测效果</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">支持度</span>
                    <span className="text-green-400 font-semibold">
                      {speech.predictedEffects.support.min > 0 ? '+' : ''}
                      {speech.predictedEffects.support.min} ~ {speech.predictedEffects.support.max > 0 ? '+' : ''}
                      {speech.predictedEffects.support.max}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">声望</span>
                    <span className="text-blue-400 font-semibold">
                      {speech.predictedEffects.reputation.min > 0 ? '+' : ''}
                      {speech.predictedEffects.reputation.min} ~ {speech.predictedEffects.reputation.max > 0 ? '+' : ''}
                      {speech.predictedEffects.reputation.max}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">媒体关系</span>
                    <span className="text-purple-400 font-semibold">
                      {speech.predictedEffects.media.min > 0 ? '+' : ''}
                      {speech.predictedEffects.media.min} ~ {speech.predictedEffects.media.max > 0 ? '+' : ''}
                      {speech.predictedEffects.media.max}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">党内影响力</span>
                    <span className="text-yellow-400 font-semibold">
                      {speech.predictedEffects.partyInfluence.min > 0 ? '+' : ''}
                      {speech.predictedEffects.partyInfluence.min} ~ {speech.predictedEffects.partyInfluence.max > 0 ? '+' : ''}
                      {speech.predictedEffects.partyInfluence.max}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded text-xs text-yellow-200">
                ⚠️ 实际效果将在上述区间内随机，并受到媒体态度、公众舆论等因素影响
              </div>
            </div>
          )}

          {/* 提示 */}
          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 text-sm">
            <h4 className="font-bold text-blue-300 mb-2">💡 提示</h4>
            <ul className="space-y-1 text-blue-200 text-xs">
              <li>• 不同口吻会影响不同受众群体</li>
              <li>• 高攻击性可能激怒对手和媒体</li>
              <li>• 高可信度降低事实核查风险</li>
              <li>• 激进言论可能引发党内分裂</li>
              <li>• 媒体会根据自身立场报道</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
