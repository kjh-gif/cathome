# 데이터베이스 설정 가이드

## 📋 실행 순서

Supabase 대시보드에서 다음 순서대로 SQL을 실행하세요.

### 1단계: posts 테이블 생성
**파일**: `posts-table.sql`

Supabase Dashboard → SQL Editor → New query에서 실행

이 SQL은:
- posts 테이블 생성
- 인덱스 생성 (검색 성능 향상)
- updated_at 자동 업데이트 트리거 설정
- 작성자 정보 조회 뷰 생성

### 2단계: posts RLS 정책 설정
**파일**: `posts-rls-policy.sql`

Supabase Dashboard → SQL Editor → New query에서 실행

RLS 정책:
- ✅ SELECT: 누구나 조회 가능
- ✅ INSERT: 로그인한 사용자만 작성 가능
- ✅ UPDATE: 본인 글만 수정 가능
- ✅ DELETE: 본인 글만 삭제 가능

### 3단계: comments 테이블 생성 및 RLS 정책
**파일**: `comments-table.sql`

Supabase Dashboard → SQL Editor → New query에서 실행

이 SQL은:
- comments 테이블 생성
- 인덱스 및 트리거 설정
- RLS 정책 설정 (posts와 동일한 규칙)

### 4단계: Storage 버킷 생성 (수동 작업)
**참고 파일**: `storage-policy.sql`

#### 버킷 생성:
1. Supabase Dashboard → **Storage** 메뉴
2. **"New Bucket"** 클릭
3. 설정:
   - **Name**: `post-images`
   - **Public bucket**: OFF (체크 해제)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`
4. **"Create bucket"** 클릭

#### Storage 정책 설정:
버킷 생성 후 `storage-policy.sql`의 정책 부분만 SQL Editor에서 실행

---

## ✅ 확인 사항

### posts 테이블 확인
1. Supabase Dashboard → **Table Editor**
2. `posts` 테이블에 🔒 자물쇠 아이콘이 있는지 확인
3. **Authentication** → **Policies** 메뉴에서 4개 정책 확인:
   - SELECT 정책
   - INSERT 정책
   - UPDATE 정책
   - DELETE 정책

### comments 테이블 확인
1. `comments` 테이블에 🔒 자물쇠 아이콘 확인
2. 4개 RLS 정책 확인

### Storage 확인
1. **Storage** 메뉴에서 `post-images` 버킷 확인
2. **Policies** 탭에서 4개 정책 확인

---

## 📊 테이블 구조

### posts 테이블
| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | BIGSERIAL | 게시글 번호 (자동 생성) |
| title | VARCHAR(255) | 제목 |
| content | TEXT | 내용 |
| user_id | UUID | 작성자 ID (auth.users 참조) |
| image_url | TEXT | 이미지 URL (nullable) |
| views | INTEGER | 조회수 (기본값 0) |
| created_at | TIMESTAMP | 작성일 |
| updated_at | TIMESTAMP | 수정일 |

### comments 테이블
| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | BIGSERIAL | 댓글 번호 (자동 생성) |
| post_id | BIGINT | 게시글 ID (posts 참조) |
| user_id | UUID | 작성자 ID (auth.users 참조) |
| content | TEXT | 댓글 내용 |
| created_at | TIMESTAMP | 작성일 |
| updated_at | TIMESTAMP | 수정일 |

---

## 🚨 문제 해결

### RLS 정책이 작동하지 않는 경우
```sql
-- RLS가 활성화되어 있는지 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('posts', 'comments');

-- RLS 정책 확인
SELECT * FROM pg_policies
WHERE tablename IN ('posts', 'comments');
```

### Storage 정책 오류
- 버킷이 먼저 생성되어 있어야 합니다
- 버킷 이름이 정확히 `post-images`인지 확인
- Public bucket이 OFF로 설정되어 있는지 확인

---

## 📌 다음 단계

데이터베이스 설정이 완료되면:
1. 게시판 CRUD 기능 구현
2. 이미지 업로드 기능 구현
3. 댓글 기능 구현
4. 검색 및 페이지네이션 구현
