import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Blockly from 'blockly';
// 💡 C++ジェネレーターは標準ではないため、別途カスタム実装が必要です。
// ここでは仮のオブジェクトとして定義し、後ほど中身を実装します。
const Cpp = new Blockly.Generator('Cpp'); 

// --- 1. StampFlyカスタムブロックの定義 ---
const defineStampFlyBlocks = () => {
  // --- 1-1. ブロックの見た目と動作を定義 ---
  Blockly.Blocks['take_off'] = {
    init: function() {
      this.appendDummyInput().appendField("りりく 🚀");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("ドローンを安ていした高さまで上しょうさせます。");
    }
  };

  Blockly.Blocks['land'] = {
    init: function() {
      this.appendDummyInput().appendField("ちゃくりく ⬇️");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("ドローンをやさしくちゃくりくさせます。");
    }
  };

  Blockly.Blocks['forward_1s'] = {
    init: function() {
      this.appendDummyInput().appendField("前 １びょう ⬆️");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip("ドローンを前にむかって1びょうかんうごかします。");
    }
  };

  Blockly.Blocks['right_1s'] = {
    init: function() {
      this.appendDummyInput().appendField("右 １びょう ➡️");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip("ドローンを右にむかって1びょうかんうごかします。");
    }
  };

  Blockly.Blocks['left_1s'] = {
    init: function() {
      this.appendDummyInput().appendField("左 １びょう ⬅️");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip("ドローンを左にむかって1びょうかんうごかします。");
    }
  };

  Blockly.Blocks['back_1s'] = {
    init: function() {
      this.appendDummyInput().appendField("うしろ １びょう ⬇️");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip("ドローンをうしろにむかって1びょうかんうごかします。");
    }
  };

  Blockly.Blocks['rotate'] = {
    init: function() {
      this.appendDummyInput().appendField("かいてん 🔄");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip("ドローンをかいてんさせます。");
    }
  };

  // --- 1-2. C++コード生成器を定義 ---
  // 💡 ここがC++コードを出力する重要な部分です
  Cpp['take_off'] = function() {
    return '  take_off();\n';
  };

  Cpp['land'] = function() {
    return '  take_on();\n';
  };

  Cpp['forward_1s'] = function() {
    return '  forward();\n';
  };

  Cpp['right_1s'] = function() {
    return '  right();\n';
  };

  Cpp['left_1s'] = function() {
    return '  left();\n';
  };

  Cpp['back_1s'] = function() {
    return '  back();\n';
  };

  Cpp['rotate'] = function() {
    return '  flip();\n';
  };
};

// --- 2. ツールボックスXMLの定義（Palette） ---
const toolboxXml = `
<xml id="toolbox" style="display: none">
    <category name="きほんどうさ" colour="160">
        <block type="take_off"></block>
        <block type="land"></block>
    </category>
    <category name="いどうとせいぎょ" colour="20">
        <block type="forward_1s"></block>
        <block type="right_1s"></block>
        <block type="left_1s"></block>
        <block type="back_1s"></block>
        <block type="rotate"></block>
    </category>
</xml>
`;

// ブロック定義は一度だけ実行
defineStampFlyBlocks();

// --- 3. Reactコンポーネント本体 ---
import DroneSimulator from './DroneSimulator';
import LoadingModal from './LoadingModal';

const StampFlyBlockly = () => {
  const blocklyDiv = useRef(null); 
  const workspace = useRef(null); 
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('たいきちゅう...');
  const [isLoading, setIsLoading] = useState(false);
  // 書き込み先のデフォルトファイル名（BASE_DIR 以下の相対パス）
  const TARGET_FILENAME = 'M5Stampfly/src/direction_sequence.hpp';
  
  // ブロックタイプから Direction_t 列挙値へのマッピング
  const blockToDirection = {
    'take_off': '',
    'land': '',
    'forward_1s': 'FORWARD',
    'right_1s': 'RIGHT',
    'left_1s': 'LEFT',
    'back_1s': 'BACK',
    'rotate': 'FLIP',
  };

  // ワークスペース変更時にコードを再生成し、ステートを更新するコールバック
  const updateCode = useCallback(() => {
    if (workspace.current) {
        // ワークスペースから全てのトップレベルブロックを取得
        const topBlocks = workspace.current.getTopBlocks(true);
        
        const directionList = [];
        
        // 各トップレベルブロックから順番にDirection_t列挙値を収集
        topBlocks.forEach(block => {
          let currentBlock = block;
          
          // ブロックのチェーンを辿って順番に処理
          while (currentBlock) {
            const direction = blockToDirection[currentBlock.type];
            if (direction) {
              directionList.push(direction);
            }
            currentBlock = currentBlock.getNextBlock();
          }
        });
        
        // direction_sequence[] の配列宣言のみを生成
        const arrayContent = directionList.join(', ');
        const fullCode = `Direction_t direction_sequence[] = {${arrayContent}};`;
        setCode(fullCode);
    }
  }, []);

  // APIルートにコードを送信し、direction_sequence[] の行だけを書き換える処理
  const writeCodeToFile = async () => {
    setIsLoading(true);
    setStatus('ファイルをかきこみちゅう...');
    try {
      // まず現在のファイルを読み取る
      const readResponse = await fetch(`/api/read-file?filename=${TARGET_FILENAME}`);
      let fileContent = '';
      
      if (readResponse.ok) {
        const readJson = await readResponse.json();
        fileContent = readJson.content || '';
      } else {
        // ファイルが存在しない場合はデフォルトのテンプレートを使う
        fileContent = `#include <cstdint>

typedef enum {
    FORWARD,
    RIGHT,
    LEFT,
    BACK,
    NORMAL,
    FLIP,
} Direction_t;

Direction_t direction_sequence[] = {};

uint8_t MAX_STATES_NUM = sizeof(direction_sequence) / sizeof(direction_sequence[0]);
`;
      }

      // direction_sequence[] の行を置換
      const regex = /Direction_t\s+direction_sequence\[\]\s*=\s*\{[^}]*\};/;
      const newContent = fileContent.replace(regex, code);

      // 書き込み
      const response = await fetch('/api/write-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newContent, filename: TARGET_FILENAME }),
      });

      const respJson = await response.json().catch(() => ({}));
      if (response.ok) {
        setStatus(`✅ かきこみせいこう！ほぞんさき: ${respJson.path || 'ふめい'}`);
        alert(`direction_sequence[] がこうしんされました: ${respJson.path || TARGET_FILENAME}\nターミナルでPlatformIOコマンドをじっこうしてください。`);
      } else {
        setStatus(`❌ かきこみしっぱい: ${respJson.message || response.statusText}`);
      }
    } catch (error) {
      console.error('API通信エラー:', error);
      setStatus('❌ サーバーエラーがはっせいしました。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ワークスペースの初期化とリスナーの設定
    if (blocklyDiv.current && !workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxXml,
        trashcan: true,
        renderer: 'zelos', // 見やすいZelosレンダラーを使用
      });

      // ワークスペース変更時にコードを更新するリスナー
      workspace.current.addChangeListener(updateCode);
      
      // 初期状態のコードを生成
      updateCode();
    }

    // クリーンアップ
    return () => {
        if (workspace.current) {
            // リスナーを削除
            workspace.current.removeChangeListener(updateCode);
            // ワークスペースを破棄
            workspace.current.dispose();
            workspace.current = null;
        }
    };
  }, [updateCode]); // updateCodeが変更されたときのみ再実行

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Loading Modal */}
      <LoadingModal isLoading={isLoading} message="書き込み中..." />
      
      {/* 左側: Blocklyワークスペース */}
      <div ref={blocklyDiv} style={{ flex: '1', minWidth: '400px', border: '1px solid #ddd' }} />
      
      {/* 右側: コード、シミュレーター、ボタン */}
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#f9f9f9', 
        borderLeft: '1px solid #ccc',
        overflow: 'hidden'
      }}>
        {/* コード表示エリア */}
        {/* <div style={{ padding: '15px', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1em' }}>📝 生成された C++ コード</h3>
          <div style={{ 
            backgroundColor: '#eee', 
            padding: '10px', 
            height: '120px', 
            overflowY: 'auto', 
            border: '1px solid #ccc',
            fontSize: '11px'
          }}>
            <pre style={{ margin: 0 }}>{code}</pre>
          </div>
        </div> */}

        {/* シミュレーターエリア */}
        <div style={{ flex: '1', borderBottom: '1px solid #ddd', overflow: 'auto', minHeight: 0 }}>
          <DroneSimulator workspace={workspace.current} />
        </div>

        {/* 書き込みボタンエリア */}
        <div style={{ padding: '15px', flexShrink: 0 }}>
          <button 
            onClick={writeCodeToFile} 
            style={{ 
              width: '100%',
              padding: '12px', 
              fontSize: '1em', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💾 コードをファイルにかきこむ
          </button>
          <p style={{ marginTop: '8px', fontWeight: 'bold', textAlign: 'center', fontSize: '0.9em', margin: '8px 0 0 0' }}>
            ステータス: {status}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StampFlyBlockly;