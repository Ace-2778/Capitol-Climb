'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { useDecisionStore } from '@/store/decisionStore';
import { GameStatus } from '@/types/game';
import { CharacterCreation } from '@/components/CharacterCreation';
import { GameOverScreen } from '@/components/GameOverScreen';
import { NationalPanel } from '@/components/NationalPanel';
import { CongressPanel } from '@/components/CongressPanel';
import { PlayerPanel } from '@/components/PlayerPanel';
import { PartyPanel } from '@/components/PartyPanel';
import { OpponentList } from '@/components/OpponentList';
import { EventList } from '@/components/EventCard';

export default function Home() {
  const {
    status,
    player,
    nationalState,
    parties,
    opponents,
    currentEvents,
    messageLog,
    promotionEngine,
    initializeGame,
    restartGame,
    returnToMenu,
    nextTurn,
    selectEventOption,
    dismissEvent,
    runElection,
    attemptPromotion,
    loadGame,
  } = useGameStore();

  const { getDecisionSummary, initializeDecisionSystem, generateNewBills, generateNewSpeeches } = useDecisionStore();
  const decisionSummary = getDecisionSummary();

  // 加载保存的游戏
  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // 初始化决策系统
  useEffect(() => {
    if (status === GameStatus.IN_PROGRESS && player) {
      initializeDecisionSystem(Date.now(), player.party);
    }
  }, [status, player, initializeDecisionSystem]);

  // 处理下一回合（包含决策生成）
  const handleNextTurn = () => {
    nextTurn();
    // 在回合推进后，尝试生成新的重大决策
    if (player && nationalState) {
      generateNewBills(player, nationalState.turn + 1);
      generateNewSpeeches(player, nationalState.turn + 1);
    }
  };

  // 角色创建
  if (status === GameStatus.CHARACTER_CREATION) {
    return (
      <CharacterCreation
        onCreateCharacter={(name, party, faction, state) => {
          initializeGame(name, party, faction, state);
        }}
      />
    );
  }

  // 游戏结束
  if (status === GameStatus.WON || status === GameStatus.LOST) {
    const lastMessage = messageLog[messageLog.length - 1];
    return (
      <GameOverScreen
        status={status === GameStatus.WON ? 'won' : 'lost'}
        message={lastMessage?.message}
        onRestart={restartGame}
        onReturnToMenu={returnToMenu}
      />
    );
  }

  // 检查晋升条件
  const promotionCheck = promotionEngine.canPromote(player);

  // 主游戏界面
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 头部栏 */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                政治权力游戏
              </h1>
              <p className="text-xs text-gray-400">Political Power Game</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 重大决策入口 */}
              <Link
                href="/decisions"
                className="relative px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all"
              >
                <div className="flex items-center gap-2">
                  <span>📜 重大决策</span>
                  {decisionSummary.pendingCount > 0 && (
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
                      {decisionSummary.pendingCount}
                    </span>
                  )}
                </div>
                {decisionSummary.highestUrgency === 'critical' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </Link>

              {/* 下一回合按钮 */}
              <button
                onClick={handleNextTurn}
                disabled={currentEvents.length > 0}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  currentEvents.length > 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                }`}
                title={currentEvents.length > 0 ? '请先处理所有事件' : '推进到下一回合'}
              >
                {currentEvents.length > 0 ? '处理事件中...' : '下一回合 →'}
              </button>

              {/* 选举按钮 */}
              {player.turnsUntilElection <= 0 && (
                <button
                  onClick={runElection}
                  className="px-6 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg animate-pulse"
                >
                  进行选举！
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* 左侧栏 - 玩家和对手信息 */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <PlayerPanel
              player={player}
              onAttemptPromotion={attemptPromotion}
              canPromote={promotionCheck.canPromote}
              promotionReason={promotionCheck.reason}
            />
            <OpponentList opponents={opponents} />
          </div>

          {/* 中央区域 - 事件卡片 */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            {/* 消息日志（最近5条） */}
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">最近动态</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {messageLog.slice(-5).reverse().map((msg, index) => (
                  <div
                    key={index}
                    className={`text-xs p-2 rounded ${
                      msg.type === 'success' ? 'bg-green-900/30 text-green-300' :
                      msg.type === 'warning' ? 'bg-yellow-900/30 text-yellow-300' :
                      msg.type === 'danger' ? 'bg-red-900/30 text-red-300' :
                      'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">第{msg.turn}回合 |</span> {msg.message}
                  </div>
                ))}
              </div>
            </div>

            {/* 事件卡片 */}
            <div>
              <h2 className="text-xl font-bold mb-3">当前事件</h2>
              <EventList
                events={currentEvents}
                onSelectOption={selectEventOption}
                onDismiss={dismissEvent}
              />
            </div>
          </div>

          {/* 右侧栏 - 国家和党派信息 */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <NationalPanel state={nationalState} />
            <CongressPanel congress={nationalState.congress} />
            <PartyPanel playerParty={player.party} parties={parties} />
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-gray-400 text-sm">
          <p>政治权力游戏 | 从基层到权力顶峰</p>
          <p className="text-xs mt-1">游戏自动保存到本地存储</p>
        </div>
      </footer>
    </div>
  );
}
