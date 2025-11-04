import React, { useState, useEffect } from 'react';

const DroneSimulator = ({ workspace }) => {
  const [droneState, setDroneState] = useState({
    x: 5, // グリッド中央
    y: 5,
    altitude: 0, // 0=地上, 1=飛行中
    rotation: 0,
    isFlipping: false,
    isMoving: false,
    currentAction: '待機中'
  });
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1000); // ms per action

  // ブロックから動作シーケンスを生成
  const generateActionSequence = () => {
    if (!workspace) return [];
    
    const topBlocks = workspace.getTopBlocks(true);
    const actions = [];
    
    topBlocks.forEach(block => {
      let currentBlock = block;
      while (currentBlock) {
        actions.push(currentBlock.type);
        currentBlock = currentBlock.getNextBlock();
      }
    });
    
    return actions;
  };

  // シミュレーション実行
  const runSimulation = async () => {
    const actions = generateActionSequence();
    if (actions.length === 0) {
      alert('ブロックを配置してください！');
      return;
    }

    setIsSimulating(true);
    
    // 初期状態にリセット
    setDroneState({
      x: 5,
      y: 5,
      altitude: 0,
      rotation: 0,
      isFlipping: false,
      isMoving: false,
      currentAction: '開始'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // 各アクションを順次実行
    for (const action of actions) {
      await executeAction(action);
      await new Promise(resolve => setTimeout(resolve, simulationSpeed));
    }

    setDroneState(prev => ({ ...prev, currentAction: '完了！', isMoving: false }));
    setIsSimulating(false);
  };

  // 個別のアクション実行
  const executeAction = async (actionType) => {
    setDroneState(prev => {
      const newState = { ...prev, isMoving: true };

      switch (actionType) {
        case 'take_off':
          newState.altitude = 1;
          newState.currentAction = '🚀 離陸中';
          break;
        case 'land':
          newState.altitude = 0;
          newState.currentAction = '⬇️ 着陸中';
          break;
        case 'forward_1s':
          newState.y = Math.max(0, prev.y - 1);
          newState.currentAction = '⬆️ 前進中';
          break;
        case 'back_1s':
          newState.y = Math.min(10, prev.y + 1);
          newState.currentAction = '⬇️ 後退中';
          break;
        case 'left_1s':
          newState.x = Math.max(0, prev.x - 1);
          newState.currentAction = '⬅️ 左移動中';
          break;
        case 'right_1s':
          newState.x = Math.min(10, prev.x + 1);
          newState.currentAction = '➡️ 右移動中';
          break;
        case 'rotate':
          newState.isFlipping = true;
          newState.currentAction = '🔄 回転中';
          setTimeout(() => {
            setDroneState(s => ({ ...s, isFlipping: false }));
          }, 500);
          break;
        default:
          newState.currentAction = '不明な動作';
      }

      return newState;
    });
  };

  // 停止ボタン
  const stopSimulation = () => {
    setIsSimulating(false);
    setDroneState(prev => ({ ...prev, currentAction: '停止', isMoving: false }));
  };

  return (
    <div className="simulator-container">
      <h3>🎮 ドローンシミュレーター</h3>
      
      {/* コントロール */}
      <div className="controls">
        <button 
          onClick={runSimulation} 
          disabled={isSimulating}
          className={`control-button ${isSimulating ? 'disabled' : 'start'}`}
        >
          ▶️ シミュレーション開始
        </button>
        <button 
          onClick={stopSimulation}
          disabled={!isSimulating}
          className={`control-button ${!isSimulating ? 'disabled' : 'stop'}`}
        >
          ⏹️ 停止
        </button>
      </div>

      {/* ステータス表示 */}
      <div className="status-display">
        <div>
          <strong>現在の動作:</strong> {droneState.currentAction}
        </div>
        <div>
          <strong>高度:</strong> {droneState.altitude === 0 ? '地上 🟤' : '飛行中 🟦'}
        </div>
      </div>

      {/* グリッド表示 */}
      <div className="grid-container">
        {Array.from({ length: 121 }).map((_, idx) => {
          const x = idx % 11;
          const y = Math.floor(idx / 11);
          const isDrone = x === droneState.x && y === droneState.y;
          
          return (
            <div
              key={idx}
              className={`grid-cell ${isDrone ? 'drone-cell' : ''}`}
              style={{
                backgroundColor: isDrone 
                  ? (droneState.altitude === 0 ? '#ff9800' : '#4CAF50')
                  : 'white',
                transform: isDrone ? `rotate(${droneState.rotation}deg)` : 'none',
                animation: droneState.isFlipping && isDrone ? 'flip 0.5s' : 'none'
              }}
            >
              {isDrone && '🚁'}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .simulator-container {
          padding: 20px;
          background-color: #f0f0f0;
          border-top: 2px solid #ccc;
        }

        .controls {
          margin-bottom: 15px;
        }

        .control-button {
          padding: 10px 20px;
          margin-right: 10px;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .control-button.start {
          background-color: #2196F3;
        }

        .control-button.stop {
          background-color: #f44336;
        }

        .control-button.disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .status-display {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
          padding: 10px;
          background-color: white;
          border-radius: 5px;
        }

        .grid-container {
          display: grid;
          gridTemplateColumns: repeat(11, 40px);
          gridTemplateRows: repeat(11, 40px);
          gap: 2px;
          background-color: #ddd;
          padding: 5px;
          border-radius: 5px;
          justify-content: center;
        }

        .grid-cell {
          border: 1px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.3s ease;
        }

        @keyframes flip {
          0%, 100% { transform: rotate(${droneState.rotation}deg) rotateY(0deg); }
          50% { transform: rotate(${droneState.rotation}deg) rotateY(180deg); }
        }

        /* モバイル対応 */
        @media (max-width: 768px) {
          .simulator-container {
            padding: 10px;
          }

          .controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .control-button {
            margin-right: 0;
            width: 100%;
            padding: 12px;
          }

          .status-display {
            flex-direction: column;
            gap: 8px;
            font-size: 0.9em;
          }

          .grid-container {
            gridTemplateColumns: repeat(11, min(30px, 8vw));
            gridTemplateRows: repeat(11, min(30px, 8vw));
            gap: 1px;
            padding: 3px;
          }

          .grid-cell {
            font-size: min(18px, 5vw);
          }
        }
      `}</style>
    </div>
  );
};

export default DroneSimulator;