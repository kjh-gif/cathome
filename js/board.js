// ====================================
// 게시판 JavaScript
// ====================================

// Supabase 클라이언트 가져오기 (전역 변수 사용)
// supabase는 supabase-client.js에서 이미 선언됨

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
  console.log('게시판 초기화 시작');

  // DOM 요소 확인
  console.log('DOM 요소 확인:');
  console.log('- postList:', postList);
  console.log('- writeBtn:', writeBtn);
  console.log('- writeForm:', writeForm);
  console.log('- postDetail:', postDetail);
  console.log('- boardList:', boardList);

  // 로그인 상태 확인
  currentUser = await getCurrentUser();
  console.log('현재 로그인 사용자:', currentUser);
  updateAuthUI();

  // 게시글 목록 로드
  await loadPosts();

  // 이벤트 리스너 등록
  setupEventListeners();

  console.log('✅ 게시판 초기화 완료');
});

// ====================================
// 이벤트 리스너 설정
// ====================================
function setupEventListeners() {
  // DOM 요소 확인
  if (!writeBtn) {
    console.error('❌ 글쓰기 버튼을 찾을 수 없습니다.');
    return;
  }

  // 글쓰기 버튼
  writeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('글쓰기 버튼 클릭됨');
    console.log('현재 사용자:', currentUser);
    showWriteForm();
  });

  // 취소 버튼
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      console.log('취소 버튼 클릭됨');
      showBoardList();
      resetForm();
    });
  }

  // 글 작성/수정 폼 제출
  if (postForm) {
    postForm.addEventListener('submit', handleSubmit);
  }

  // 목록 버튼
  const listBtn = document.getElementById('listBtn');
  if (listBtn) {
    listBtn.addEventListener('click', showBoardList);
  }

  // 수정 버튼
  const editBtn = document.getElementById('editBtn');
  if (editBtn) {
    editBtn.addEventListener('click', handleEdit);
  }

  // 삭제 버튼
  const deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', handleDelete);
  }

  // 이미지 미리보기
  const postImage = document.getElementById('postImage');
  if (postImage) {
    postImage.addEventListener('change', handleImagePreview);
  }

  console.log('✅ 이벤트 리스너 등록 완료');
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
  console.log('showWriteForm 함수 실행');
  console.log('currentUser:', currentUser);

  if (!currentUser) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }

  // DOM 요소 확인
  if (!boardList || !writeForm || !postDetail) {
    console.error('❌ DOM 요소를 찾을 수 없습니다.');
    console.error('boardList:', boardList);
    console.error('writeForm:', writeForm);
    console.error('postDetail:', postDetail);
    return;
  }

  console.log('화면 전환 시작');
  boardList.style.display = 'none';
  writeForm.style.display = 'block';
  postDetail.style.display = 'none';

  // 폼 제목 변경
  const formTitle = writeForm.querySelector('h3');
  if (formTitle) {
    formTitle.textContent = '글쓰기';
  }

  console.log('✅ 글쓰기 화면으로 전환 완료');
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
  console.log('updateAuthUI 실행');
  console.log('currentUser:', currentUser);

  if (!authLink) {
    console.error('❌ authLink 요소를 찾을 수 없습니다.');
    return;
  }

  if (!writeBtn) {
    console.error('❌ writeBtn 요소를 찾을 수 없습니다.');
    return;
  }

  if (currentUser) {
    console.log('✅ 로그인 상태 - 글쓰기 버튼 표시');
    authLink.textContent = '로그아웃';
    authLink.href = '#';
    authLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut();
      window.location.href = 'index.html';
    });
    writeBtn.style.display = 'block';
    console.log('글쓰기 버튼 display:', writeBtn.style.display);
  } else {
    console.log('❌ 비로그인 상태 - 글쓰기 버튼 숨김');
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
    // 이미지 파일 가져오기
    const imageInput = document.getElementById('postImage');
    const imageFile = imageInput?.files[0];

    let imageUrl = null;

    // 이미지가 있으면 업로드
    if (imageFile) {
      console.log('이미지 업로드 시작...');
      const uploadResult = await uploadImage(imageFile);
      if (uploadResult) {
        imageUrl = uploadResult.url;
        console.log('이미지 URL:', imageUrl);
      }
    }

    // 게시글 데이터 생성
    const postData = {
      title: title,
      content: content,
      user_id: currentUser.id
    };

    // 이미지 URL이 있으면 추가
    if (imageUrl) {
      postData.image_url = imageUrl;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
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
    // 기존 게시글 정보 가져오기 (이미지 URL 확인용)
    const { data: existingPost } = await supabase
      .from('posts')
      .select('image_url')
      .eq('id', currentPostId)
      .single();

    const oldImageUrl = existingPost?.image_url;

    // 새 이미지 파일 확인
    const imageInput = document.getElementById('postImage');
    const imageFile = imageInput?.files[0];

    let newImageUrl = oldImageUrl; // 기본값은 기존 이미지 URL

    // 새 이미지가 업로드된 경우
    if (imageFile) {
      console.log('새 이미지 업로드 시작...');
      const uploadResult = await uploadImage(imageFile);

      if (uploadResult) {
        newImageUrl = uploadResult.url;
        console.log('새 이미지 URL:', newImageUrl);

        // 기존 이미지 삭제
        if (oldImageUrl) {
          console.log('기존 이미지 삭제 중...');
          await deleteImage(oldImageUrl);
        }
      }
    }

    // 게시글 업데이트
    const updateData = {
      title: title,
      content: content
    };

    // 이미지 URL 추가 (null이어도 괜찮음)
    if (newImageUrl !== undefined) {
      updateData.image_url = newImageUrl;
    }

    const { error } = await supabase
      .from('posts')
      .update(updateData)
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
    // 게시글 정보 가져오기 (이미지 URL 확인용)
    const { data: post } = await supabase
      .from('posts')
      .select('image_url')
      .eq('id', currentPostId)
      .single();

    // 이미지가 있으면 먼저 삭제
    if (post?.image_url) {
      console.log('이미지 삭제 중...');
      await deleteImage(post.image_url);
    }

    // 게시글 삭제
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
    // 파일 크기 확인 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.');
      e.target.value = '';
      preview.innerHTML = '';
      return;
    }

    // 이미지 파일 형식 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      e.target.value = '';
      preview.innerHTML = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `
        <div style="position: relative; display: inline-block;">
          <img src="${e.target.result}" alt="미리보기" style="max-width: 300px; border-radius: 8px;">
          <p style="margin-top: 0.5rem; font-size: 14px; color: #666;">
            파일명: ${file.name} (${(file.size / 1024).toFixed(2)} KB)
          </p>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = '';
  }
}

// ====================================
// 이미지 업로드 (Supabase Storage)
// ====================================
async function uploadImage(file) {
  if (!file) return null;

  try {
    console.log('이미지 업로드 시작:', file.name);

    // 파일명 생성 (고유한 이름: user_id + timestamp + 원본파일명)
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

    console.log('업로드 파일명:', fileName);

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('post-images')  // 버킷 이름
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('업로드 에러:', error);
      throw error;
    }

    console.log('업로드 성공:', data);

    // 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    console.log('이미지 URL:', urlData.publicUrl);

    return {
      path: fileName,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    alert('이미지 업로드에 실패했습니다: ' + error.message);
    return null;
  }
}

// ====================================
// 이미지 삭제 (Supabase Storage)
// ====================================
async function deleteImage(imagePath) {
  if (!imagePath) return;

  try {
    console.log('이미지 삭제 시작:', imagePath);

    // URL에서 파일 경로 추출
    let filePath = imagePath;
    if (imagePath.includes('/storage/v1/object/public/post-images/')) {
      filePath = imagePath.split('/storage/v1/object/public/post-images/')[1];
    }

    const { error } = await supabase.storage
      .from('post-images')
      .remove([filePath]);

    if (error) {
      console.error('이미지 삭제 에러:', error);
      // 이미지 삭제 실패해도 게시글 삭제는 진행
      return;
    }

    console.log('✅ 이미지 삭제 성공');
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    // 이미지 삭제 실패해도 계속 진행
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
