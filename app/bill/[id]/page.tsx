'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { useDecisionStore } from '@/store/decisionStore';
import { BILL_TEMPLATES } from '@/data/bills';
import { BillDimensions, DealType } from '@/types/decision';

// 将支持度转换为模糊描述
const getSupportText = (value: number): { text: string; color: string } => {
  if (value >= 70) return { text: '强烈支持', color: 'text-green-400' };
  if (value >= 55) return { text: '倾向支持', color: 'text-green-300' };
  if (value >= 45) return { text: '态度不明', color: 'text-gray-400' };
  if (value >= 30) return { text: '倾向反对', color: 'text-orange-300' };
  return { text: '强烈反对', color: 'text-red-400' };
};

// 将通过概率转换为模糊描述
const getPassageText = (min: number, max: number): { text: string; color: string } => {
  const avg = (min + max) / 2;
  if (avg >= 70) return { text: '很可能通过', color: 'text-green-400' };
  if (avg >= 55) return { text: '有望通过', color: 'text-green-300' };
  if (avg >= 40) return { text: '前景未明', color: 'text-yellow-400' };
  if (avg >= 25) return { text: '通过困难', color: 'text-orange-400' };
  return { text: '几乎不可能', color: 'text-red-400' };
};

export default function BillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.id as string;
  
  const { player, nationalState } = useGameStore();
  const {
    getActiveBillById,
    adjustBillDimension,
    advanceBill,
    createBillDeal,
    legislators,
  } = useDecisionStore();

  const bill = getActiveBillById(billId);
  const template = bill ? BILL_TEMPLATES.find((t) => t.id === bill.templateId) : null;

  const [showDealModal, setShowDealModal] = useState(false);
  const [selectedLegislator, setSelectedLegislator] = useState<string>('');

  if (!bill || !template) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <Link href="/decisions" className="text-blue-400 hover:underline">← 返回决策中心</Link>
        <div className="mt-8 text-center text-gray-400">法案不存在</div>
      </div>
    );
  }

  // 处理维度调整
  const handleDimensionChange = (dimension: keyof BillDimensions, value: number) => {
    if (!template.adjustableDimensions.includes(dimension)) return;
    adjustBillDimension(billId, dimension, value);
  };

  // 推进法案
  const handleAdvance = () => {
    const result = advanceBill(billId);
    alert(result.message);
    if (!result.success || bill.status === 'passed' || bill.status === 'rejected') {
      router.push('/decisions');
    }
  };

  // 创建交易
  const handleCreateDeal = (dealType: DealType) => {
    if (!selectedLegislator) {
      alert('请选择交易对象');
      return;
    }

    const cost = {
      fundraising: dealType === DealType.FUNDING ? 20 : 0,
      leverage: dealType === DealType.BLACKMAIL ? 25 : 15,
      partyInfluence: dealType === DealType.COMMITTEE_SEAT ? 10 : 0,
    };

    const benefit = 5 + Math.floor(Math.random() * 5);

    createBillDeal(billId, dealType, selectedLegislator, cost, benefit, nationalState.turn);
    setShowDealModal(false);
    setSelectedLegislator('');
    alert(`交易已达成！预计提升 ${benefit}% 支持率`);
  };

  // 维度标签映射
  const dimensionLabels: Record<keyof BillDimensions, { name: string; left: string; right: string }> = {
    ideology: { name: '意识形态', left: '进步', right: '保守' },
    spending: { name: '预算规模', left: '低预算', right: '高预算' },
    enforcement: { name: '执行力度', left: '宽松', right: '强硬' },
    transparency: { name: '透明度', left: '暗箱', right: '透明' },
    compromise: { name: '妥协度', left: '原则', right: '妥协' },
    pork: { name: '私货项目', left: '无', right: '多' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* 返回按钮 */}
      <Link href="/decisions" className="inline-block mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all">
        ← 返回决策中心
      </Link>

      {/* 法案标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{bill.title}</h1>
        <p className="text-gray-400">{template.description}</p>
        <div className="flex gap-3 mt-3">
          <span className="px-3 py-1 bg-blue-600 rounded text-sm">{bill.category}</span>
          <span className="px-3 py-1 bg-purple-600 rounded text-sm">{bill.status}</span>
          <span className="px-3 py-1 bg-orange-600 rounded text-sm">剩余 {bill.turnsRemaining} 回合</span>
        </div>
      </div>

      {/* 主布局 - 两列 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左列 - 法案调整 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 维度调节面板 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">📊 法案参数调整</h2>
            <p className="text-sm text-gray-400 mb-6">
              调整法案的各项维度，实时查看对支持度和风险的影响
            </p>

            <div className="space-y-6">
              {(Object.keys(dimensionLabels) as Array<keyof BillDimensions>).map((dimension) => {
                const isAdjustable = template.adjustableDimensions.includes(dimension);
                const value = bill.dimensions[dimension];
                const label = dimensionLabels[dimension];

                return (
                  <div key={dimension} className={`${!isAdjustable && 'opacity-50'}`}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold">{label.name}</span>
                      <span className="text-sm text-blue-400">{value}</span>
                    </div>
                    <input
                      type="range"
                      min={dimension === 'ideology' ? -100 : 0}
                      max="100"
                      value={value}
                      onChange={(e) => handleDimensionChange(dimension, Number(e.target.value))}
                      disabled={!isAdjustable}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{label.left}</span>
                      <span>{label.right}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 支持度实时反馈（模糊化） */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-green-400">📈 各方态度</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">民主党</div>
                <div className={`text-xl font-bold ${getSupportText(bill.support.democratSupport).color}`}>
                  {getSupportText(bill.support.democratSupport).text}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">共和党</div>
                <div className={`text-xl font-bold ${getSupportText(bill.support.republicanSupport).color}`}>
                  {getSupportText(bill.support.republicanSupport).text}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">委员会</div>
                <div className={`text-xl font-bold ${getSupportText(bill.support.committeeApproval).color}`}>
                  {getSupportText(bill.support.committeeApproval).text}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">公众舆论</div>
                <div className={`text-xl font-bold ${getSupportText(bill.support.publicSupport).color}`}>
                  {getSupportText(bill.support.publicSupport).text}
                </div>
              </div>
            </div>

            {/* 通过概率（模糊化） */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">预估通过前景</span>
                <span className={`font-bold text-xl ${getPassageText(bill.passageProbability.min, bill.passageProbability.max).color}`}>
                  {getPassageText(bill.passageProbability.min, bill.passageProbability.max).text}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                💡 提示：真实结果会受到临场因素影响，建议根据直觉决策
              </div>
            </div>
          </div>

          {/* 风险评估（简化） */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-red-400">⚠️ 潜在风险</h2>
            <div className="space-y-3 text-sm">
              {bill.risks.investigationRisk > 30 && (
                <div className="flex items-center gap-2 p-3 bg-orange-900/30 rounded">
                  <span className="text-orange-400">🔍</span>
                  <span className="text-gray-300">可能引发调查关注</span>
                </div>
              )}
              {bill.risks.scandalRisk > 30 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-900/30 rounded">
                  <span className="text-yellow-400">📰</span>
                  <span className="text-gray-300">存在丑闻曝光风险</span>
                </div>
              )}
              {bill.risks.partySplitRisk > 30 && (
                <div className="flex items-center gap-2 p-3 bg-purple-900/30 rounded">
                  <span className="text-purple-400">⚡</span>
                  <span className="text-gray-300">可能导致党内分裂</span>
                </div>
              )}
              {bill.risks.investigationRisk <= 30 && bill.risks.scandalRisk <= 30 && bill.risks.partySplitRisk <= 30 && (
                <div className="text-gray-400 text-center py-2">
                  暂无明显风险
                </div>
              )}
            </div>
          </div>

          {/* 交易记录 */}
          {bill.deals.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">🤝 已达成交易</h2>
              <div className="space-y-2">
                {bill.deals.map((deal) => (
                  <div key={deal.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <div>
                      <span className="font-semibold">{deal.target}</span>
                      <span className="text-sm text-gray-400 ml-2">({deal.type})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">+{deal.benefit}%</div>
                      <div className="text-xs text-red-400">背叛概率: {Math.round(deal.betrayalChance * 100)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={handleAdvance}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all"
            >
              推进到下一阶段 →
            </button>
            <button
              onClick={() => setShowDealModal(true)}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-6 rounded-lg transition-all"
            >
              🤝 达成交易
            </button>
          </div>
        </div>

        {/* 右列 - 关键相关方 */}
        <div className="space-y-6">
          {/* 派系态度 */}
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-blue-400">🎭 派系态度</h3>
            <div className="space-y-3">
              {Object.entries(bill.support.factionSupport).map(([faction, support]) => (
                <div key={faction}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{faction}</span>
                    <span className={`font-semibold ${support > 60 ? 'text-green-400' : support > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {Math.round(support)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${support > 60 ? 'bg-green-600' : support > 40 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${support}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 摇摆议员 */}
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-yellow-400">🎯 可争取议员</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {legislators.filter((l) => l.committedVote === 'swing').slice(0, 5).map((legislator) => (
                <div key={legislator.id} className="p-3 bg-gray-700 rounded text-sm">
                  <div className="font-semibold">{legislator.name}</div>
                  <div className="text-xs text-gray-400">
                    {legislator.party} - {legislator.faction}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    关系: {legislator.relationshipWithPlayer > 0 ? '+' : ''}{legislator.relationshipWithPlayer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 交易模态框 */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">达成政治交易</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">选择交易对象</label>
              <select
                value={selectedLegislator}
                onChange={(e) => setSelectedLegislator(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">-- 选择议员 --</option>
                {legislators.filter((l) => l.committedVote === 'swing').map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name} ({l.party} - {l.faction})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => handleCreateDeal(DealType.FUNDING)}
                className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                💰 资金支持 (成本: 20募资)
              </button>
              <button
                onClick={() => handleCreateDeal(DealType.COMMITTEE_SEAT)}
                className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                🪑 委员会席位 (成本: 10党内影响力)
              </button>
              <button
                onClick={() => handleCreateDeal(DealType.POLICY_SUPPORT)}
                className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
              >
                📜 政策支持 (成本: 15筹码)
              </button>
              <button
                onClick={() => handleCreateDeal(DealType.BLACKMAIL)}
                className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                ⚠️ 黑料威胁 (成本: 25筹码, 高风险)
              </button>
            </div>

            <button
              onClick={() => setShowDealModal(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
