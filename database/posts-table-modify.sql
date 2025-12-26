-- ====================================
-- posts 테이블 수정 (데이터 유지)
-- ====================================
-- 기존 데이터를 유지하면서 테이블 구조만 수정합니다.

-- 1. 컬럼이 없는 경우에만 추가 (이미 있으면 에러 방지)
DO $$
BEGIN
  -- title 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'title'
  ) THEN
    ALTER TABLE posts ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '';
  END IF;

  -- content 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'content'
  ) THEN
    ALTER TABLE posts ADD COLUMN content TEXT NOT NULL DEFAULT '';
  END IF;

  -- user_id 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- image_url 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN image_url TEXT;
  END IF;

  -- views 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'views'
  ) THEN
    ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0;
  END IF;

  -- created_at 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE posts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- updated_at 컬럼이 없으면 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 2. 인덱스 추가 (이미 있으면 에러 방지)
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_title ON posts USING gin(to_tsvector('korean', title));

-- 3. 트리거 함수 생성 (없는 경우)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. 뷰 생성 (이미 있으면 교체)
CREATE OR REPLACE VIEW posts_with_author AS
SELECT
  p.*,
  u.email as author_email
FROM posts p
LEFT JOIN auth.users u ON p.user_id = u.id;

-- 6. RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 7. RLS 정책 추가 (이미 있으면 건너뜀)
DO $$
BEGIN
  -- SELECT 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'posts'
    AND policyname = '누구나 게시글을 조회할 수 있습니다'
  ) THEN
    CREATE POLICY "누구나 게시글을 조회할 수 있습니다"
      ON posts FOR SELECT USING (true);
  END IF;

  -- INSERT 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'posts'
    AND policyname = '로그인한 사용자만 게시글을 작성할 수 있습니다'
  ) THEN
    CREATE POLICY "로그인한 사용자만 게시글을 작성할 수 있습니다"
      ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- UPDATE 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'posts'
    AND policyname = '본인이 작성한 게시글만 수정할 수 있습니다'
  ) THEN
    CREATE POLICY "본인이 작성한 게시글만 수정할 수 있습니다"
      ON posts FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- DELETE 정책
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'posts'
    AND policyname = '본인이 작성한 게시글만 삭제할 수 있습니다'
  ) THEN
    CREATE POLICY "본인이 작성한 게시글만 삭제할 수 있습니다"
      ON posts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ====================================
-- 완료 메시지
-- ====================================
-- posts 테이블이 성공적으로 수정되었습니다!
-- 기존 데이터는 유지됩니다.
