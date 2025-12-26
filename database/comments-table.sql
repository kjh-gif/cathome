-- ====================================
-- comments 테이블 생성
-- ====================================

-- comments 테이블 생성
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- updated_at 자동 업데이트 트리거 적용
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 댓글 작성자 이메일을 조회하기 위한 뷰 (선택사항)
CREATE OR REPLACE VIEW comments_with_author AS
SELECT
  c.*,
  u.email as author_email
FROM comments c
LEFT JOIN auth.users u ON c.user_id = u.id;

-- ====================================
-- comments 테이블 RLS 정책
-- ====================================

-- RLS 활성화
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 1. SELECT 정책: 누구나 댓글을 조회할 수 있음
CREATE POLICY "누구나 댓글을 조회할 수 있습니다"
  ON comments
  FOR SELECT
  USING (true);

-- 2. INSERT 정책: 로그인한 사용자만 댓글을 작성할 수 있음
CREATE POLICY "로그인한 사용자만 댓글을 작성할 수 있습니다"
  ON comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE 정책: 본인이 작성한 댓글만 수정할 수 있음
CREATE POLICY "본인이 작성한 댓글만 수정할 수 있습니다"
  ON comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. DELETE 정책: 본인이 작성한 댓글만 삭제할 수 있음
CREATE POLICY "본인이 작성한 댓글만 삭제할 수 있습니다"
  ON comments
  FOR DELETE
  USING (auth.uid() = user_id);
