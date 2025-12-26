-- ====================================
-- posts 테이블 RLS (Row Level Security) 정책
-- ====================================

-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 1. SELECT 정책: 누구나 게시글을 조회할 수 있음
CREATE POLICY "누구나 게시글을 조회할 수 있습니다"
  ON posts
  FOR SELECT
  USING (true);

-- 2. INSERT 정책: 로그인한 사용자만 게시글을 작성할 수 있음
CREATE POLICY "로그인한 사용자만 게시글을 작성할 수 있습니다"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE 정책: 본인이 작성한 게시글만 수정할 수 있음
CREATE POLICY "본인이 작성한 게시글만 수정할 수 있습니다"
  ON posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. DELETE 정책: 본인이 작성한 게시글만 삭제할 수 있음
CREATE POLICY "본인이 작성한 게시글만 삭제할 수 있습니다"
  ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS 정책 확인 쿼리 (참고용)
-- SELECT * FROM pg_policies WHERE tablename = 'posts';
