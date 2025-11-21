-- StampFly ランキングシステム用テーブル作成SQL
-- Supabaseのダッシュボードで実行してください

-- scoresテーブルの作成
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL CHECK (char_length(username) > 0 AND char_length(username) <= 50),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スコア降順のインデックス (高得点順にランキング表示するため)
CREATE INDEX IF NOT EXISTS idx_scores_score_desc ON scores(score DESC, created_at ASC);

-- 作成日時のインデックス (最新のスコア取得用)
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);

-- ユーザーネームのインデックス (特定ユーザーのスコア履歴検索用、オプション)
CREATE INDEX IF NOT EXISTS idx_scores_username ON scores(username);

-- Row Level Security (RLS) を有効化
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可能なポリシー
CREATE POLICY "Allow public read access" ON scores
  FOR SELECT
  USING (true);

-- 誰でも挿入可能なポリシー (新しいスコアを記録できるように)
CREATE POLICY "Allow public insert access" ON scores
  FOR INSERT
  WITH CHECK (true);

-- (オプション) ユーザーが自分のスコアのみ更新・削除できるようにする場合は、
-- 認証を導入してから以下のようなポリシーを追加してください:
-- CREATE POLICY "Users can update own scores" ON scores
--   FOR UPDATE
--   USING (auth.uid() = user_id);

-- テーブル作成完了
-- 以下のSQLでテーブルが正しく作成されたか確認できます:
-- SELECT * FROM scores ORDER BY score DESC, created_at ASC LIMIT 10;
