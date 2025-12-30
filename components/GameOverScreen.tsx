import React from 'react';

interface GameOverScreenProps {
  status: 'won' | 'lost';
  message?: string;
  onRestart: () => void;
  onReturnToMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ status, message, onRestart, onReturnToMenu }) => {
  const isWin = status === 'won';

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 text-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 text-center">
        {/* 图标 */}
        <div className="text-8xl mb-4">
          {isWin ? '🏆' : '💔'}
        </div>

        {/* 标题 */}
        <h1 className={`text-4xl font-bold mb-4 ${
          isWin ? 'text-green-400' : 'text-red-400'
        }`}>
          {isWin ? '恭喜！你赢了！' : '游戏结束'}
        </h1>

        {/* 消息 */}
        {message && (
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {message}
          </p>
        )}

        {/* 成就 */}
        {isWin ? (
          <div className="mb-8 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">你的成就</h3>
            <p className="text-gray-400">
              你成功地从基层政治人物一路攀升到了权力的顶峰！
              <br />
              你的政治智慧、手腕和运气成就了这段传奇。
            </p>
          </div>
        ) : (
          <div className="mb-8 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-yellow-400">教训</h3>
            <p className="text-gray-400">
              政治生涯充满风险，有时一个错误的决定就会导致一切崩溃。
              <br />
              吸取教训，重新开始，这次你会做得更好！
            </p>
          </div>
        )}

        {/* 按钮 */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02]"
          >
            重新开始
          </button>
          
          <button
            onClick={onReturnToMenu}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            返回主菜单
          </button>
        </div>

        {/* 统计 */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-500 text-sm">
            感谢游玩《政治权力游戏》
          </p>
        </div>
      </div>
    </div>
  );
};
