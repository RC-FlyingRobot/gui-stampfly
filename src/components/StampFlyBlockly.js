import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Blockly from 'blockly';
// 💡 C++ジェネレーターは標準ではないため、別途カスタム実装が必要です。
// ここでは仮のオブジェクトとして定義し、後ほど中身を実装します。
const Cpp = new Blockly.Generator('Cpp'); 
import { javascriptGenerator } from 'blockly/javascript'; // テスト用にインポート

// --- 1. StampFlyカスタムブロックの定義 ---
const defineStampFlyBlocks = () => {
  // --- 1-1. ブロックの見た目と動作を定義 ---
  Blockly.Blocks['take_off'] = {
    init: function() {
      this.appendDummyInput().appendField("離陸 🚀");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("ドローンを安定した高さまで上昇させます。");
    }
  };

  Blockly.Blocks['land'] = {
    init: function() {
      this.appendDummyInput().appendField("着陸 ⬇️");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("ドローンを優しく着陸させます。");
    }
  };

  Blockly.Blocks['fly_up'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("上昇 (距離:")
          .appendField(new Blockly.FieldNumber(50, 10, 200), "DISTANCE") // 10cmから200cmまで
          .appendField("cm)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(20);
      this.setTooltip("現在の位置から指定された距離だけ垂直に上昇します。");
    }
  };

  // --- 1-2. C++コード生成器を定義 ---
  // 💡 ここがC++コードを出力する重要な部分です
  Cpp['take_off'] = function(block) {
    return 'take_off();\n';
  };

  Cpp['land'] = function(block) {
    return 'land();\n';
  };

  Cpp['fly_up'] = function(block) {
    const distance = block.getFieldValue('DISTANCE');
    return `fly_up(${distance});\n`;
  };
};

// --- 2. ツールボックスXMLの定義（Palette） ---
const toolboxXml = `
<xml id="toolbox" style="display: none">
    <category name="基本動作" colour="160">
        <block type="take_off"></block>
        <block type="land"></block>
    </category>
    <category name="移動と制御" colour="20">
        <block type="fly_up"></block>
        <block type="controls_repeat_ext">
            <value name="TIMES">
                <block type="math_number"><field name="NUM">3</field></block>
            </value>
        </block>
    </category>
    <category name="その他" colour="60">
        <block type="math_number"></block>
    </category>
</xml>
`;

// ブロック定義は一度だけ実行
defineStampFlyBlocks();

// --- 3. Reactコンポーネント本体 ---
const StampFlyBlockly = () => {
  const blocklyDiv = useRef(null); 
  const workspace = useRef(null); 
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('待機中...');
  
  // ワークスペース変更時にコードを再生成し、ステートを更新するコールバック
  const updateCode = useCallback(() => {
    if (workspace.current) {
        // C++のカスタムジェネレーターを使ってコードを生成
        const codeString = "    take_off();\n"; // テスト用に固定コードを追加
        
        // StampFlyのファームウェアの構造に合わせてコードを整形
        const fullCode = 
`// ユーザーが生成したプログラム
void user_loop() {
${codeString}
}`;
        setCode(fullCode);
    }
  }, []);

  // take_offブロックがワークスペースに追加されたかを検出し、自動でAPIへ書き込む
  const detectAndWriteTakeOff = useCallback(async () => {
    if (!workspace.current) return;

    // take_offブロックが一つでも存在するかチェック
    const blocks = workspace.current.getAllBlocks(false);
    const hasTakeOff = blocks.some(b => b.type === 'take_off');

    if (hasTakeOff) {
      // ユーザの要望通り、正確に `takeof();` を書き込む
      const takeoffCode = `// ユーザーが生成したプログラム\nvoid user_loop() {\n  takeof();\n}`;

      try {
        const response = await fetch('/api/write-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: takeoffCode }),
        });

        if (response.ok) {
          setStatus('✅ takeof() を main.cpp に書き込みました');
        } else {
          const err = await response.json().catch(() => ({}));
          setStatus(`❌ takeof() 書き込み失敗: ${err.message || response.statusText}`);
        }
      } catch (error) {
        console.error('自動書き込みエラー:', error);
        setStatus('❌ 自動書き込み中にエラーが発生しました');
      }
    }
  }, []);

  // APIルートにコードを送信し、ローカルファイルに書き込む処理
  const writeCodeToFile = async () => {
    setStatus('ファイルを書き込み中...');
    try {
      const response = await fetch('/api/write-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code }),
      });

      if (response.ok) {
        setStatus('✅ 書き込み成功！ドローンに転送できます。');
        alert('コードがローカルの.cppファイルに保存されました！\nスタッフはターミナルでPlatformIOコマンドを実行してください。');
      } else {
        const errorData = await response.json();
        setStatus(`❌ 書き込み失敗: ${errorData.message}`);
      }
    } catch (error) {
      console.error('API通信エラー:', error);
      setStatus('❌ サーバーエラーが発生しました。');
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

      // take_off 検出用リスナー。簡易デバウンスのためにフラグを使う
      let pendingTakeoffCheck = false;
      workspace.current.addChangeListener(() => {
        if (pendingTakeoffCheck) return;
        pendingTakeoffCheck = true;
        setTimeout(async () => {
          await detectAndWriteTakeOff();
          pendingTakeoffCheck = false;
        }, 250); // 250ms の遅延で連続検出を防ぐ
      });
      
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
    <div style={{ display: 'flex', height: '80vh', width: '100%' }}>
      {/* Blocklyワークスペースエリア */}
      <div ref={blocklyDiv} style={{ flex: '3', minWidth: '600px', border: '1px solid #ddd' }} />
      
      {/* コードとコントロールパネル */}
      <div style={{ flex: '1', padding: '20px', backgroundColor: '#f9f9f9', borderLeft: '1px solid #ccc' }}>
        <h2>📝 生成された C++ コード</h2>
        <div style={{ backgroundColor: '#eee', padding: '10px', height: '50%', overflowY: 'auto', border: '1px solid #ccc' }}>
          <pre>{code}</pre>
        </div>
        
        <div style={{ marginTop: '20px' }}>
            <button 
                onClick={writeCodeToFile} 
                style={{ 
                    padding: '15px 30px', 
                    fontSize: '1.2em', 
                    backgroundColor: '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
                💾 コードをファイルに書き込む
            </button>
            <p style={{ marginTop: '15px', fontWeight: 'bold' }}>ステータス: {status}</p>
        </div>
      </div>
    </div>
  );
};

export default StampFlyBlockly;