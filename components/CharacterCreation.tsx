import React, { useState } from 'react';
import { Party, Faction } from '@/types/game';

interface CharacterCreationProps {
  onCreateCharacter: (name: string, party: Party, faction: Faction, state: string) => void;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCreateCharacter }) => {
  const [name, setName] = useState('');
  const [party, setParty] = useState<Party>(Party.DEMOCRAT);
  const [faction, setFaction] = useState<Faction>(Faction.MODERATE);
  const [state, setState] = useState('California');

  const states = [
    'California', 'Texas', 'Florida', 'New York', 'Pennsylvania',
    'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'
  ];

  const factions: { value: Faction; label: string; description: string }[] = [
    {
      value: Faction.PROGRESSIVE,
      label: '进步派',
      description: '支持大胆改革，重视社会公正和平等。基层支持强，但建制派可能有戒心。'
    },
    {
      value: Faction.MODERATE,
      label: '温和派',
      description: '寻求中间道路，平衡各方利益。容易获得广泛支持，但有时被批评缺乏原则。'
    },
    {
      value: Faction.CONSERVATIVE,
      label: '保守派',
      description: '维护传统价值观，强调财政责任。在红色州有优势，但可能失去年轻选民。'
    },
    {
      value: Faction.ESTABLISHMENT,
      label: '建制派',
      description: '深耕党内关系，擅长资源运作。容易获得党内支持和资金，但被视为精英。'
    },
    {
      value: Faction.POPULIST,
      label: '民粹派',
      description: '直接诉诸人民，挑战既有体制。能迅速获得民意，但党内关系紧张，风险高。'
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateCharacter(name.trim(), party, faction, state);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 text-white rounded-2xl shadow-2xl max-w-3xl w-full p-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            政治权力游戏
          </h1>
          <h2 className="text-2xl font-semibold mb-4">Political Power Game</h2>
          <p className="text-gray-400 text-sm">
            从基层政治人物到权力顶峰 —— 每一个选择都会影响你的命运
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名 */}
          <div>
            <label className="block text-sm font-semibold mb-2">你的姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入你的角色名"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 党派选择 */}
          <div>
            <label className="block text-sm font-semibold mb-2">选择党派</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setParty(Party.DEMOCRAT)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  party === Party.DEMOCRAT
                    ? 'border-blue-500 bg-blue-900/50'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="text-xl font-bold text-blue-400">民主党</div>
                <div className="text-xs text-gray-400 mt-1">Democrat</div>
              </button>
              <button
                type="button"
                onClick={() => setParty(Party.REPUBLICAN)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  party === Party.REPUBLICAN
                    ? 'border-red-500 bg-red-900/50'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="text-xl font-bold text-red-400">共和党</div>
                <div className="text-xs text-gray-400 mt-1">Republican</div>
              </button>
            </div>
          </div>

          {/* 派系选择 */}
          <div>
            <label className="block text-sm font-semibold mb-2">选择派系</label>
            <div className="space-y-2">
              {factions.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFaction(f.value)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    faction === f.value
                      ? 'border-purple-500 bg-purple-900/30'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="font-semibold">{f.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{f.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 州选择 */}
          <div>
            <label className="block text-sm font-semibold mb-2">起始州</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
          >
            开始政治生涯
          </button>
        </form>

        {/* 游戏说明 */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-semibold mb-2 text-gray-400">游戏说明</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• 你从地方议会议员起步，目标是成为总统（或其他高级职位）</li>
            <li>• 每个回合会遇到随机事件，你的选择会影响声望、资金、民意等属性</li>
            <li>• 需要定期参加选举，落选或声誉崩盘都会导致游戏结束</li>
            <li>• 可以使用正道或阴谋手段，但阴招有风险</li>
            <li>• 游戏会自动保存，可随时继续</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
