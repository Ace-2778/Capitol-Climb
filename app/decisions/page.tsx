'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useDecisionStore } from '@/store/decisionStore';
import Link from 'next/link';
import { DecisionType, DecisionUrgency, BillStatus } from '@/types/decision';
import { Faction } from '@/types/game';

export default function DecisionsPage() {
  const { player, nationalState } = useGameStore();
  const {
    activeBills,
    activeSpeeches,
    powerDynamics,
    publicOpinion,
    statusFlags,
    getDecisionSummary,
  } = useDecisionStore();

  const summary = getDecisionSummary();

  // 紧急度徽章
  const getUrgencyBadge = (urgency: DecisionUrgency) => {
    switch (urgency) {
      case DecisionUrgency.CRITICAL:
        return <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">⚠️ 危急</span>;
      case DecisionUrgency.HIGH:
        return <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">🕒 紧急</span>;
      case DecisionUrgency.MEDIUM:
        return <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">📌 重要</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">📋 常规</span>;
    }
  };

  // 法案状态徽章
  const getBillStatusBadge = (status: BillStatus) => {
    const statusMap = {
      [BillStatus.DRAFTING]: { text: '起草中', color: 'bg-blue-600' },
      [BillStatus.COMMITTEE]: { text: '委员会', color: 'bg-purple-600' },
      [BillStatus.CAUCUS]: { text: '党内协调', color: 'bg-indigo-600' },
      [BillStatus.FLOOR_VOTE]: { text: '议会表决', color: 'bg-red-600' },
      [BillStatus.PASSED]: { text: '通过', color: 'bg-green-600' },
      [BillStatus.REJECTED]: { text: '否决', color: 'bg-gray-600' },
      [BillStatus.SHELVED]: { text: '搁置', color: 'bg-gray-500' },
    };
    const s = statusMap[status];
    return <span className={`px-2 py-1 ${s.color} text-white text-xs rounded`}>{s.text}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* 返回按钮 */}
      <Link href="/" className="inline-block mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all">
        ← 返回主界面
      </Link>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          重大决策中心
        </h1>
        <p className="text-gray-400">Decision Center - 塑造你的政治遗产</p>
      </div>

      {/* 顶部汇总面板 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">待处理决策</div>
          <div className="text-3xl font-bold text-blue-400">{summary.pendingCount}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">最高紧急度</div>
          <div className="mt-2">{getUrgencyBadge(summary.highestUrgency)}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">党内地位</div>
          <div className="text-2xl font-bold text-purple-400">{player.partyInfluence}/100</div>
          <div className="text-xs text-gray-500 mt-1">党鞭支持: {powerDynamics.playerPartyStatus.whipSupport}%</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">公众形象</div>
          <div className="text-sm font-semibold text-green-400">{publicOpinion.narrativeFrame}</div>
          <div className="text-xs text-gray-500 mt-1">民调: {publicOpinion.pollTrend[publicOpinion.pollTrend.length - 1]}%</div>
        </div>
      </div>

      {/* 临近截止警告 */}
      {summary.criticalDeadlines.length > 0 && (
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-8">
          <h3 className="text-red-400 font-bold mb-2">⚠️ 紧急截止警告</h3>
          <ul className="space-y-2">
            {summary.criticalDeadlines.map((item) => (
              <li key={item.id} className="text-red-200">
                <span className="font-semibold">{item.title}</span> - 剩余 {item.turnsRemaining} 回合
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 主内容区 - 三列布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左列 - 待处理决策列表 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 法案列表 */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>📜</span> 法案提案
              <span className="text-sm text-gray-400">({activeBills.length})</span>
            </h2>
            
            {activeBills.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
                暂无进行中的法案
              </div>
            ) : (
              <div className="space-y-4">
                {activeBills.map((bill) => (
                  <Link
                    key={bill.id}
                    href={`/bill/${bill.id}`}
                    className="block bg-gray-800 hover:bg-gray-750 p-5 rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-blue-400 mb-1">{bill.title}</h3>
                        <p className="text-sm text-gray-400">{bill.category}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getBillStatusBadge(bill.status)}
                        <span className="text-xs text-gray-400">剩余 {bill.turnsRemaining} 回合</span>
                      </div>
                    </div>

                    {/* 通过概率 */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">通过概率</span>
                        <span className="text-yellow-400 font-semibold">
                          {bill.passageProbability.min}% ~ {bill.passageProbability.max}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                          style={{ width: `${(bill.passageProbability.min + bill.passageProbability.max) / 2}%` }}
                        />
                      </div>
                    </div>

                    {/* 关键相关方 */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">民主党:</span>
                        <span className={`ml-1 font-semibold ${bill.support.democratSupport > 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.round(bill.support.democratSupport)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">共和党:</span>
                        <span className={`ml-1 font-semibold ${bill.support.republicanSupport > 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.round(bill.support.republicanSupport)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">公众:</span>
                        <span className={`ml-1 font-semibold ${bill.support.publicSupport > 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.round(bill.support.publicSupport)}%
                        </span>
                      </div>
                    </div>

                    {/* 风险提示 */}
                    {(bill.risks.investigationRisk > 30 || bill.risks.scandalRisk > 30 || bill.risks.partySplitRisk > 30) && (
                      <div className="mt-3 pt-3 border-t border-gray-700 flex gap-2 flex-wrap">
                        {bill.risks.investigationRisk > 30 && (
                          <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                            🔍 调查风险: {Math.round(bill.risks.investigationRisk)}%
                          </span>
                        )}
                        {bill.risks.scandalRisk > 30 && (
                          <span className="text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded">
                            💥 丑闻风险: {Math.round(bill.risks.scandalRisk)}%
                          </span>
                        )}
                        {bill.risks.partySplitRisk > 30 && (
                          <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">
                            ⚠️ 分裂风险: {Math.round(bill.risks.partySplitRisk)}%
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 讲话列表 */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🎤</span> 公开讲话
              <span className="text-sm text-gray-400">({activeSpeeches.length})</span>
            </h2>
            
            {activeSpeeches.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
                暂无安排的讲话
              </div>
            ) : (
              <div className="space-y-4">
                {activeSpeeches.map((speech) => (
                  <Link
                    key={speech.id}
                    href={`/speech/${speech.id}`}
                    className="block bg-gray-800 hover:bg-gray-750 p-5 rounded-lg border border-gray-700 hover:border-purple-500 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-purple-400 mb-1">{speech.title}</h3>
                        <p className="text-sm text-gray-400">{speech.type}</p>
                      </div>
                      <span className="text-xs text-gray-400">剩余 {speech.turnsRemaining} 回合</span>
                    </div>

                    {/* 进度指示 */}
                    <div className="flex gap-2 mt-3">
                      <div className={`flex-1 h-2 rounded ${speech.selectedOptions.opening ? 'bg-purple-600' : 'bg-gray-700'}`} />
                      <div className={`flex-1 h-2 rounded ${speech.selectedOptions.core ? 'bg-purple-600' : 'bg-gray-700'}`} />
                      <div className={`flex-1 h-2 rounded ${speech.selectedOptions.closing ? 'bg-purple-600' : 'bg-gray-700'}`} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {speech.selectedOptions.opening && speech.selectedOptions.core && speech.selectedOptions.closing
                        ? '✅ 已准备完成，可执行'
                        : '📝 正在准备...'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右列 - 权力态势与舆论面板 */}
        <div className="space-y-6">
          {/* 权力态势 */}
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-blue-400">🏛️ 权力态势</h3>
            
            {/* 众议院 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">众议院</span>
                <span className="text-xs text-gray-500">({powerDynamics.houseSeats.total} 席位)</span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600"
                  style={{ width: `${(powerDynamics.houseSeats.democrat / powerDynamics.houseSeats.total) * 100}%` }}
                  title={`民主党: ${powerDynamics.houseSeats.democrat}`}
                />
                <div
                  className="bg-red-600"
                  style={{ width: `${(powerDynamics.houseSeats.republican / powerDynamics.houseSeats.total) * 100}%` }}
                  title={`共和党: ${powerDynamics.houseSeats.republican}`}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-blue-400">民主党 {powerDynamics.houseSeats.democrat}</span>
                <span className="text-red-400">共和党 {powerDynamics.houseSeats.republican}</span>
              </div>
            </div>

            {/* 参议院 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">参议院</span>
                <span className="text-xs text-gray-500">({powerDynamics.senateSeats.total} 席位)</span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600"
                  style={{ width: `${(powerDynamics.senateSeats.democrat / powerDynamics.senateSeats.total) * 100}%` }}
                  title={`民主党: ${powerDynamics.senateSeats.democrat}`}
                />
                <div
                  className="bg-red-600"
                  style={{ width: `${(powerDynamics.senateSeats.republican / powerDynamics.senateSeats.total) * 100}%` }}
                  title={`共和党: ${powerDynamics.senateSeats.republican}`}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-blue-400">民主党 {powerDynamics.senateSeats.democrat}</span>
                <span className="text-red-400">共和党 {powerDynamics.senateSeats.republican}</span>
              </div>
            </div>

            {/* 党内派系关系 */}
            <div className="pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400 mb-2">党内派系影响力</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>进步派</span>
                  <span className="text-purple-400">{powerDynamics.playerPartyStatus.factionInfluence[Faction.PROGRESSIVE]}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>温和派</span>
                  <span className="text-blue-400">{powerDynamics.playerPartyStatus.factionInfluence[Faction.MODERATE]}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>保守派</span>
                  <span className="text-red-400">{powerDynamics.playerPartyStatus.factionInfluence[Faction.CONSERVATIVE]}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>建制派</span>
                  <span className="text-gray-400">{powerDynamics.playerPartyStatus.factionInfluence[Faction.ESTABLISHMENT]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 舆论态势 */}
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-green-400">📊 舆论态势</h3>
            
            {/* 民调趋势 */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">近6回合民调</div>
              <div className="flex items-end justify-between h-20 gap-1">
                {publicOpinion.pollTrend.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-600 rounded-t"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-1">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 受众细分 */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">基础盘</span>
                <span className="text-green-400 font-semibold">{publicOpinion.baseVotersSupport}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">摇摆选民</span>
                <span className="text-yellow-400 font-semibold">{publicOpinion.swingVotersSupport}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">精英阶层</span>
                <span className="text-blue-400 font-semibold">{publicOpinion.elitesSupport}%</span>
              </div>
            </div>
          </div>

          {/* 状态标记 */}
          {(statusFlags.underInvestigation || statusFlags.mediaHostile || statusFlags.partySplit) && (
            <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
              <h3 className="text-red-400 font-bold mb-2">⚠️ 状态警告</h3>
              <div className="space-y-1 text-sm">
                {statusFlags.underInvestigation && (
                  <div className="text-red-300">🔍 正在接受调查</div>
                )}
                {statusFlags.mediaHostile && (
                  <div className="text-red-300">📰 媒体敌对</div>
                )}
                {statusFlags.partySplit && (
                  <div className="text-red-300">💔 党内分裂</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
