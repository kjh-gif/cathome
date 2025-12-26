// ====================================
// 게시판 JavaScript
// ====================================

// Supabase 클라이언트 가져오기
const supabase = window.supabaseClient || window.supabase;

// Supabase 초기화 확인
if (!supabase) {
  console.error('❌ Supabase 클라이언트를 찾을 수 없습니다.');
  alert('오류: 페이지를 새로고침해주세요.');
}

// 전역 변수
let currentUser = null;
let currentPostId = null;
let isEditMode = false;

// DOM 요소
const postList = document.getElementById('postList');
const writeBtn = document.getElementById('writeBtn');
const writeForm = document.getElementById('writeForm');
const postDetail = document.getElementById('postDetail');
const boardList = document.querySelector('.board-list');
const postForm = document.getElementById('postForm');
const cancelBtn = document.getElementById('cancelBtn');
const authLink = document.getElementById('authLink');

// ====================================
// 초기화
// ====================================
document.addEventListener('DOMContentLoaded', async () => {
  // 로그인 상태 확인
  currentUser = await getCurrentUser();
  updateAuthUI();

  // 게시글 목록 로드
  await loadPosts();

  // 이벤트 리스너 등록
  setupEventListeners();
});

// ====================================
// 이벤트 리스너 설정
// ====================================
function setupEventListeners() {
  // 글쓰기 버튼
  writeBtn.addEventListener('click', showWriteForm);

  // 취소 버튼
  cancelBtn.addEventListener('click', () => {
    showBoardList();
    resetForm();
  });

  // 글 작성/수정 폼 제출
  postForm.addEventListener('submit', handleSubmit);

  // 목록 버튼
  document.getElementById('listBtn').addEventListener('click', showBoardList);

  // 수정 버튼
  document.getElementById('editBtn').addEventListener('click', handleEdit);

  // 삭제 버튼
  document.getElementById('deleteBtn').addEventListener('click', handleDelete);

  // 이미지 미리보기
  document.getElementById('postImage').addEventListener('change', handleImagePreview);
}

// ====================================
// UI 전환 함수
// ====================================
function showBoardList() {
  boardList.style.display = 'block';
  writeForm.style.display = 'none';
  postDetail.style.display = 'none';
  isEditMode = false;
  currentPostId = null;
}

function showWriteForm() {
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }

  boardList.style.display = 'none';
  writeForm.style.display = 'block';
  postDetail.style.display = 'none';

  // 폼 제목 변경
  writeForm.querySelector('h3').textContent = '글쓰기';
}

function showPostDetail() {
  boardList.style.display = 'none';
  writeForm.style.display = 'none';
  postDetail.style.display = 'block';
}

// ====================================
// 로그인 상태 UI 업데이트
// ====================================
function updateAuthUI() {
  if (currentUser) {
    authLink.textContent = '로그아웃';
    authLink.href = '#';
    authLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
      window.location.href = 'index.html';
    });
    writeBtn.style.display = 'block';
  } else {
    authLink.textContent = '로그인';
    authLink.href = 'login.html';
    writeBtn.style.display = 'none';
  }
}

// ====================================
// 게시글 목록 조회
// ====================================
async function loadPosts() {
  try {
    // Supabase에서 게시글 조회 (최신순)
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 테이블에 렌더링
    renderPosts(posts);
  } catch (error) {
    console.error('게시글 로드 오류:', error);
    alert('게시글을 불러오는데 실패했습니다.');
  }
}

// ====================================
// 게시글 목록 렌더링
// ====================================
function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    postList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">작성된 게시글이 없습니다.</td></tr>';
    return;
  }

  postList.innerHTML = posts.map((post, index) => `
    <tr onclick="viewPost('${post.id}')">
      <td>${posts.length - index}</td>
      <td>${escapeHtml(post.title)}</td>
      <td>${post.user_id ? post.user_id.substring(0, 8) : '알수없음'}</td>
      <td>${formatDate(post.created_at)}</td>
      <td>${post.views || 0}</td>
    </tr>
  `).join('');
}

// ====================================
// 게시글 상세보기
// ====================================
async function viewPost(postId) {
  try {
    // 조회수 증가
    await incrementViews(postId);

    // 게시글 조회
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) throw error;

    currentPostId = postId;

    // 상세 정보 렌더링
    document.getElementById('detailTitle').textContent = post.title;
    document.getElementById('detailAuthor').textContent = `작성자: ${post.user_id.substring(0, 8)}`;
    document.getElementById('detailDate').textContent = `작성일: ${formatDate(post.created_at)}`;
    document.getElementById('detailViews').textContent = `조회수: ${post.views || 0}`;
    document.getElementById('detailContent').textContent = post.content;

    // 이미지 표시
    const imageContainer = document.getElementById('detailImage');
    if (post.image_url) {
      imageContainer.innerHTML = `<img src="${post.image_url}" alt="게시글 이미지">`;
    } else {
      imageContainer.innerHTML = '';
    }

    // 본인 글인 경우에만 수정/삭제 버튼 표시
    const editBtn = document.getElementById('editBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    if (currentUser && currentUser.id === post.user_id) {
      editBtn.style.display = 'inline-block';
      deleteBtn.style.display = 'inline-block';
    } else {
      editBtn.style.display = 'none';
      deleteBtn.style.display = 'none';
    }

    showPostDetail();
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    alert('게시글을 불러오는데 실패했습니다.');
  }
}

// ====================================
// 조회수 증가
// ====================================
async function incrementViews(postId) {
  try {
    const { data: post } = await supabase
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single();

    const newViews = (post?.views || 0) + 1;

    await supabase
      .from('posts')
      .update({ views: newViews })
      .eq('id', postId);
  } catch (error) {
    console.error('조회수 증가 오류:', error);
  }
}

// ====================================
// 글 작성/수정 처리
// ====================================
async function handleSubmit(e) {
  e.preventDefault();

  if (!currentUser) {
    alert('로그인이 필요합니다.');
    return;
  }

  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();

  if (!title || !content) {
    alert('제목과 내용을 입력해주세요.');
    return;
  }

  try {
    if (isEditMode) {
      // 수정
      await updatePost(title, content);
    } else {
      // 작성
      await createPost(title, content);
    }
  } catch (error) {
    console.error('게시글 저장 오류:', error);
    alert('게시글 저장에 실패했습니다.');
  }
}

// ====================================
// 게시글 작성
// ====================================
async function createPost(title, content) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title: title,
          content: content,
          user_id: currentUser.id
        }
      ])
      .select();

    if (error) throw error;

    console.log('게시글 작성 완료:', data);
    alert('게시글이 등록되었습니다.');
    resetForm();
    showBoardList();
    await loadPosts();
  } catch (error) {
    console.error('게시글 작성 오류:', error);
    throw error;
  }
}

// ====================================
// 게시글 수정
// ====================================
async function updatePost(title, content) {
  try {
    const { error } = await supabase
      .from('posts')
      .update({
        title: title,
        content: content
      })
      .eq('id', currentPostId)
      .eq('user_id', currentUser.id); // 본인 글만 수정 가능

    if (error) throw error;

    alert('게시글이 수정되었습니다.');
    resetForm();
    await viewPost(currentPostId); // 수정된 글 다시 보기
    await loadPosts(); // 목록 새로고침
  } catch (error) {
    console.error('게시글 수정 오류:', error);
    throw error;
  }
}

// ====================================
// 수정 버튼 클릭
// ====================================
async function handleEdit() {
  try {
    // 현재 게시글 정보 가져오기
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', currentPostId)
      .single();

    if (error) throw error;

    // 본인 글인지 확인
    if (!currentUser || currentUser.id !== post.user_id) {
      alert('본인이 작성한 글만 수정할 수 있습니다.');
      return;
    }

    // 폼에 기존 내용 채우기
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postContent').value = post.content;

    // 수정 모드로 전환
    isEditMode = true;
    writeForm.querySelector('h3').textContent = '글 수정';

    boardList.style.display = 'none';
    writeForm.style.display = 'block';
    postDetail.style.display = 'none';
  } catch (error) {
    console.error('게시글 수정 준비 오류:', error);
    alert('게시글 정보를 불러오는데 실패했습니다.');
  }
}

// ====================================
// 게시글 삭제
// ====================================
async function handleDelete() {
  if (!confirm('정말 삭제하시겠습니까?')) {
    return;
  }

  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', currentPostId)
      .eq('user_id', currentUser.id); // 본인 글만 삭제 가능

    if (error) throw error;

    alert('게시글이 삭제되었습니다.');
    showBoardList();
    await loadPosts();
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    alert('게시글 삭제에 실패했습니다.');
  }
}

// ====================================
// 폼 초기화
// ====================================
function resetForm() {
  postForm.reset();
  document.getElementById('imagePreview').innerHTML = '';
  isEditMode = false;
  currentPostId = null;
}

// ====================================
// 이미지 미리보기
// ====================================
function handleImagePreview(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('imagePreview');

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="미리보기" style="max-width: 300px; border-radius: 8px;">`;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = '';
  }
}

// ====================================
// 유틸리티 함수
// ====================================

// 날짜 포맷팅
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
