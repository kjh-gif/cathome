// ====================================
// Supabase 클라이언트 설정
// ====================================

// 즉시 실행 함수로 감싸서 스코프 문제 방지
(function() {
  'use strict';

  // 이미 초기화되어 있으면 중복 실행 방지
  if (window.supabaseClient) {
    console.log('✅ Supabase 클라이언트 이미 초기화됨');
    return;
  }

  const SUPABASE_URL = 'https://boqtmeqagfrchdqmgkxv.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcXRtZXFhZ2ZyY2hkcW1na3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MDUzNTIsImV4cCI6MjA4MjI4MTM1Mn0.-2Cxb2UQztFeQQQF6zQjlmqa44mtshQe-_Cq7xmZ3q0';

  // Supabase CDN이 로드되었는지 확인
  if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
    console.error('❌ Supabase CDN이 로드되지 않았습니다.');
    console.error('HTML 파일에 다음 스크립트가 있는지 확인하세요:');
    console.error('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
    return;
  }

  // Supabase 클라이언트 생성 (전역 변수로 저장)
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('✅ Supabase 클라이언트 초기화 완료');
  console.log('📍 Supabase URL:', SUPABASE_URL);
})();

// 편의를 위한 전역 변수 설정 (다른 파일에서 supabase로 접근 가능)
var supabase = window.supabaseClient;
