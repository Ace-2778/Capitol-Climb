import React from 'react';
import { NationalState } from '@/types/game';

interface CongressPanelProps {
  congress: NationalState['congress'];
}

export const CongressPanel: React.FC<CongressPanelProps> = ({ congress }) => {
  const { house, senate, majorBills } = congress;

  const getPartyColor = (party: 'democrat' | 'republican') => {
    return party === 'democrat' ? 'bg-blue-600' : 'bg-red-600';
  };

  const getMajorityParty = (dem: number, rep: number) => {
    return dem > rep ? 'democrat' : 'republican';
  };

  const renderChamber = (
    name: string,
    democratSeats: number,
    republicanSeats: number,
    total: number
  ) => {
    const demPercent = (democratSeats / total) * 100;
    const repPercent = (republicanSeats / total) * 100;
    const majority = getMajorityParty(democratSeats, republicanSeats);

    return (
      <div className="bg-gray-700 p-3 rounded">
        <h3 className="text-sm font-semibold mb-2">{name}</h3>
        
        {/* 席位条形图 */}
        <div className="flex h-6 rounded overflow-hidden mb-2">
          <div
            className={getPartyColor('democrat')}
            style={{ width: `${demPercent}%` }}
            title={`民主党: ${democratSeats}席`}
          ></div>
          <div
            className={getPartyColor('republican')}
            style={{ width: `${repPercent}%` }}
            title={`共和党: ${republicanSeats}席`}
          ></div>
        </div>

        {/* 席位数字 */}
        <div className="flex justify-between text-xs">
          <div>
            <span className="text-blue-400">民主党</span>
            <span className="font-bold ml-1">{democratSeats}</span>
          </div>
          <div className="text-gray-400">
            多数党: {majority === 'democrat' ? '民主党' : '共和党'}
          </div>
          <div>
            <span className="text-red-400">共和党</span>
            <span className="font-bold ml-1">{republicanSeats}</span>
          </div>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      proposed: 'bg-gray-600',
      voting: 'bg-yellow-600',
      passed: 'bg-green-600',
      failed: 'bg-red-600',
    };
    const labels = {
      proposed: '提案中',
      voting: '投票中',
      passed: '已通过',
      failed: '未通过',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        国会立法机构
      </h2>

      {/* 众议院 */}
      <div className="mb-4">
        {renderChamber('众议院 (House)', house.democratSeats, house.republicanSeats, house.total)}
      </div>

      {/* 参议院 */}
      <div className="mb-4">
        {renderChamber('参议院 (Senate)', senate.democratSeats, senate.republicanSeats, senate.total)}
      </div>

      {/* 重要法案 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">重要法案</h3>
        <div className="space-y-2">
          {majorBills.map(bill => (
            <div key={bill.id} className="bg-gray-700 p-2 rounded text-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold flex-1">{bill.title}</div>
                {getStatusBadge(bill.status)}
              </div>
              
              {/* 党派支持度 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-blue-400">民主党支持</div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${bill.democratSupport}%` }}
                    ></div>
                  </div>
                  <div className="text-right">{bill.democratSupport}%</div>
                </div>
                <div>
                  <div className="text-red-400">共和党支持</div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${bill.republicanSupport}%` }}
                    ></div>
                  </div>
                  <div className="text-right">{bill.republicanSupport}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
