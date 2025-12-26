// ====================================
// 로그인 페이지 UI 로직
// ====================================

document.addEventListener('DOMContentLoaded', async () => {
  // DOM 요소 가져오기
  const loginBox = document.querySelector('.login-box');
  const signupBox = document.querySelector('.signup-box');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const signupLink = document.getElementById('signupLink');
  const loginLink = document.getElementById('loginLink');

  // DOM 요소 확인
  if (!loginBox || !signupBox || !loginForm || !signupForm || !signupLink || !loginLink) {
    console.error('필수 DOM 요소를 찾을 수 없습니다.');
    return;
  }

  // 회원가입 링크 클릭
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('회원가입 링크 클릭됨');
    loginBox.style.display = 'none';
    signupBox.style.display = 'block';
  });

  // 로그인 링크 클릭
  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('로그인 링크 클릭됨');
    signupBox.style.display = 'none';
    loginBox.style.display = 'block';
  });

  // 이미 로그인되어 있는지 확인 (페이지 로드 후 체크)
  const user = await getCurrentUser();
  if (user) {
    // 로그인되어 있으면 메인 페이지로 리다이렉트
    alert(`이미 로그인되어 있습니다: ${user.email}`);
    window.location.href = 'index.html';
    return;
  }

  // 로그인 폼 제출
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const result = await signIn(email, password);

    if (result.success) {
      // 로그인 성공 시 메인 페이지로 이동
      window.location.href = 'index.html';
    }
  });

  // 회원가입 폼 제출
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // 유효성 검사
    if (!email || !password || !confirmPassword) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    console.log('회원가입 진행 중:', email);

    // 회원가입 실행
    const result = await signUp(email, password);

    console.log('회원가입 결과:', result);

    if (result.success) {
      console.log('회원가입 성공! 로그인 폼으로 전환');

      // 회원가입 성공 시 로그인 폼으로 전환
      signupBox.style.display = 'none';
      loginBox.style.display = 'block';

      // 폼 초기화
      signupForm.reset();

      // 로그인 폼에 이메일 자동 입력
      document.getElementById('email').value = email;

      console.log('로그인 폼 전환 완료');
    } else {
      console.error('회원가입 실패:', result.error);
    }
  });
});
