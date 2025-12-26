-- ====================================
-- Storage 버킷 및 정책 설정
-- ====================================

-- 주의: Storage 버킷은 Supabase 대시보드에서 수동으로 생성해야 합니다!
-- 버킷 이름: post-images
-- Public 설정: false (RLS 정책으로 제어)

-- ====================================
-- Storage 정책 SQL (버킷 생성 후 실행)
-- ====================================

-- 1. SELECT 정책: 누구나 이미지를 조회할 수 있음
CREATE POLICY "누구나 이미지를 조회할 수 있습니다"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-images');

-- 2. INSERT 정책: 로그인한 사용자만 이미지를 업로드할 수 있음
CREATE POLICY "로그인한 사용자만 이미지를 업로드할 수 있습니다"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.role() = 'authenticated'
  );

-- 3. UPDATE 정책: 본인이 업로드한 이미지만 수정할 수 있음
CREATE POLICY "본인이 업로드한 이미지만 수정할 수 있습니다"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. DELETE 정책: 본인이 업로드한 이미지만 삭제할 수 있음
CREATE POLICY "본인이 업로드한 이미지만 삭제할 수 있습니다"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================================
-- Storage 버킷 생성 가이드
-- ====================================

/*
Supabase 대시보드에서 수동으로 생성:

1. Supabase Dashboard → Storage 메뉴
2. "New Bucket" 클릭
3. 버킷 설정:
   - Name: post-images
   - Public bucket: OFF (체크 해제)
   - File size limit: 5MB (선택사항)
   - Allowed MIME types: image/* (선택사항)
4. "Create bucket" 클릭
5. 위의 Storage 정책 SQL을 SQL Editor에서 실행
*/
