-- ====================================
-- posts 테이블 재생성 (기존 테이블 삭제 후 생성)
-- ====================================
-- 주의: 이 SQL은 기존 데이터를 모두 삭제합니다!
-- 데이터 백업 후 실행하세요.

-- 1. 기존 뷰 삭제 (있는 경우)
DROP VIEW IF EXISTS posts_with_author;

-- 2. 기존 테이블 삭제 (있는 경우)
DROP TABLE IF EXISTS posts CASCADE;

-- 3. 트리거 함수가 없는 경우를 대비하여 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. posts 테이블 생성
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_title ON posts USING gin(to_tsvector('korean', title));

-- 6. posts 테이블에 트리거 적용
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. 작성자 이메일을 조회하기 위한 뷰 (선택사항)
CREATE OR REPLACE VIEW posts_with_author AS
SELECT
  p.*,
  u.email as author_email
FROM posts p
LEFT JOIN auth.users u ON p.user_id = u.id;

-- 8. RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 9. 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "누구나 게시글을 조회할 수 있습니다" ON posts;
DROP POLICY IF EXISTS "로그인한 사용자만 게시글을 작성할 수 있습니다" ON posts;
DROP POLICY IF EXISTS "본인이 작성한 게시글만 수정할 수 있습니다" ON posts;
DROP POLICY IF EXISTS "본인이 작성한 게시글만 삭제할 수 있습니다" ON posts;

-- 10. RLS 정책 생성
-- SELECT 정책: 누구나 게시글을 조회할 수 있음
CREATE POLICY "누구나 게시글을 조회할 수 있습니다"
  ON posts
  FOR SELECT
  USING (true);

-- INSERT 정책: 로그인한 사용자만 게시글을 작성할 수 있음
CREATE POLICY "로그인한 사용자만 게시글을 작성할 수 있습니다"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE 정책: 본인이 작성한 게시글만 수정할 수 있음
CREATE POLICY "본인이 작성한 게시글만 수정할 수 있습니다"
  ON posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE 정책: 본인이 작성한 게시글만 삭제할 수 있음
CREATE POLICY "본인이 작성한 게시글만 삭제할 수 있습니다"
  ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================
-- 완료 메시지
-- ====================================
-- posts 테이블이 성공적으로 재생성되었습니다!
-- RLS 정책도 모두 적용되었습니다.
