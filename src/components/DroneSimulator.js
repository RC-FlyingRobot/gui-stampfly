import React, { useState, useEffect } from 'react';
import styles from './DroneSimulator.module.css';

const DroneSimulator = ({ workspace }) => {
  // グリッドサイズを定義（ここを変えればマップサイズが変わる）
  const GRID_SIZE = 5;
  const START_Y_OFFSET = 2;
  const centerCoord = Math.floor(GRID_SIZE / 2 );

  const [droneState, setDroneState] = useState({
    x: centerCoord, // グリッド中央に初期化
    y: centerCoord + START_Y_OFFSET, // 手前の位置に初期化
    altitude: 0, // 0=地上, 1=飛行中
    rotation: 0 ,
    isFlipping: false,
    isMoving: false,
    currentAction: 'たいきちゅう'
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
      alert('ブロックをならべてください！');
      return;
    }

    setIsSimulating(true);
    
    // 初期状態にリセット（中央に戻す）
    setDroneState({
      x: centerCoord,
      y: centerCoord + START_Y_OFFSET,
      altitude: 0,
      rotation: 0,
      isFlipping: false,
      isMoving: false,
      currentAction: 'かいし'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // 各アクションを順次実行
    for (const action of actions) {
      await executeAction(action);
      await new Promise(resolve => setTimeout(resolve, simulationSpeed));
    }

    setDroneState(prev => ({ ...prev, currentAction: 'かんりょう！', isMoving: false }));
    setIsSimulating(false);
  };

  // 個別のアクション実行
  const executeAction = async (actionType) => {
    setDroneState(prev => {
      const newState = { ...prev, isMoving: true };

      switch (actionType) {
        case 'take_off':
          newState.altitude = 1;
          newState.currentAction = '🚀 りりくちゅう';
          break;
        case 'land':
          newState.altitude = 0;
          newState.currentAction = '⬇️ ちゃくりくちゅう';
          break;
        case 'forward_1s':
          newState.y = Math.max(0, prev.y - 1);
          newState.currentAction = '⬆️ ぜんしんちゅう';
          break;
        case 'back_1s':
          newState.y = Math.min(GRID_SIZE - 1, prev.y + 1);
          newState.currentAction = '⬇️ こうたいちゅう';
          break;
        case 'left_1s':
          newState.x = Math.max(0, prev.x - 1);
          newState.currentAction = '⬅️ ひだりいどうちゅう';
          break;
        case 'right_1s':
          newState.x = Math.min(GRID_SIZE - 1, prev.x + 1);
          newState.currentAction = '➡️ みぎいどうちゅう';
          break;
        case 'rotate':
          newState.isFlipping = true;
          newState.currentAction = '🔄 かいてんちゅう';
          setTimeout(() => {
            setDroneState(s => ({ ...s, isFlipping: false }));
          }, 500);
          break;
        default:
          newState.currentAction = 'ふめいなどうさ';
      }

      return newState;
    });
  };

  // 停止ボタン
  const stopSimulation = () => {
    setIsSimulating(false);
    setDroneState(prev => ({ ...prev, currentAction: 'ていし', isMoving: false }));
  };

  return (
    <div className={styles.root}>
      <h3>🎮 ドローンシミュレーター</h3>
      
      {/* コントロール */}
      <div className={styles.controls}>
        <button onClick={runSimulation} disabled={isSimulating} className={`${styles.button} ${styles.primary}`}>
          ▶️ シミュレーション開始
        </button>
        <button onClick={stopSimulation} disabled={!isSimulating} className={`${styles.button} ${styles.danger}`}>
          ⏹️ 停止
        </button>
      </div>

      {/* ステータス表示とグリッドのラッパー（レスポンシブ） */}
      <div className={styles.statusGridWrapper}>
        <div className={styles.statusBox}>
          <div className={styles.statusContent}>
            <div>
              <strong>今のどうさ:</strong> {droneState.currentAction}
            </div>
            <div>
              <strong>たかさ:</strong> {droneState.altitude === 0 ? '地上 🟤' : '飛行中 🟦'}
            </div>
          </div>
        </div>
        {/* グリッド表示（中央寄せ） */}
        <div className={styles.gridContainer}>
          <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 40px)`, gridTemplateRows: `repeat(${GRID_SIZE}, 40px)` }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
              const x = idx % GRID_SIZE;
              const y = Math.floor(idx / GRID_SIZE);
              const isDrone = x === droneState.x && y === droneState.y;

              return (
                <div
                  key={idx}
                  className={styles.cell}
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
        </div>
      </div>

      <style jsx>{`
        @keyframes flip {
          0%, 100% { transform: rotate(${droneState.rotation}deg) rotateY(0deg); }
          50% { transform: rotate(${droneState.rotation}deg) rotateY(180deg); }
        }
      `}</style>
    </div>
  );
};

export default DroneSimulator;