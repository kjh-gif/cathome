// ====================================
// 인증 관련 기능
// ====================================

// Supabase 클라이언트 가져오기
function getSupabase() {
  return window.supabaseClient || window.supabase;
}

// 현재 사용자 정보 가져오기
async function getCurrentUser() {
  const supabase = getSupabase();
  if (!supabase) {
    console.error('❌ Supabase 클라이언트를 찾을 수 없습니다.');
    return null;
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// 회원가입
async function signUp(email, password) {
  const supabase = getSupabase();
  if (!supabase) {
    alert('Supabase 클라이언트를 초기화할 수 없습니다.');
    return { success: false, error: new Error('Supabase not initialized') };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // 이메일 확인 없이 자동 로그인 (개발용)
        emailRedirectTo: window.location.origin
      }
    });

    if (error) throw error;

    // 이메일 확인이 필요한 경우
    if (data.user && !data.session) {
      alert('회원가입이 완료되었습니다!\n이메일을 확인하여 인증을 완료해주세요.');
    } else {
      // 바로 로그인된 경우 (이메일 확인 비활성화 시)
      alert('회원가입이 완료되었습니다! 로그인하여 이용하실 수 있습니다.');
    }

    return { success: true, data };
  } catch (error) {
    console.error('회원가입 오류:', error);

    // 에러 메시지를 더 친절하게 표시
    let errorMessage = error.message;
    if (error.message.includes('User already registered')) {
      errorMessage = '이미 가입된 이메일입니다.';
    } else if (error.message.includes('Password should be at least')) {
      errorMessage = '비밀번호는 최소 6자 이상이어야 합니다.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = '유효한 이메일 주소를 입력해주세요.';
    }

    alert('회원가입 실패: ' + errorMessage);
    return { success: false, error };
  }
}

// 로그인
async function signIn(email, password) {
  const supabase = getSupabase();
  if (!supabase) {
    alert('Supabase 클라이언트를 초기화할 수 없습니다.');
    return { success: false, error: new Error('Supabase not initialized') };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    alert('로그인 성공!');
    return { success: true, data };
  } catch (error) {
    console.error('로그인 오류:', error);

    // 에러 메시지를 더 친절하게 표시
    let errorMessage = error.message;
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = '이메일 또는 비밀번호가 일치하지 않습니다.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
    } else if (error.message.includes('Invalid email')) {
      errorMessage = '유효한 이메일 주소를 입력해주세요.';
    }

    alert('로그인 실패: ' + errorMessage);
    return { success: false, error };
  }
}

// 로그아웃
async function signOut() {
  const supabase = getSupabase();
  if (!supabase) {
    alert('Supabase 클라이언트를 초기화할 수 없습니다.');
    return { success: false, error: new Error('Supabase not initialized') };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    alert('로그아웃 되었습니다.');
    return { success: true };
  } catch (error) {
    console.error('로그아웃 오류:', error);
    alert('로그아웃 실패: ' + error.message);
    return { success: false, error };
  }
}

// 로그인 상태 확인
async function checkAuthState() {
  const user = await getCurrentUser();
  return user !== null;
}

// 인증 상태 변경 감지 (안전하게 처리)
(function() {
  const supabase = getSupabase();
  if (supabase && supabase.auth) {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('인증 상태 변경:', event, session);

      if (event === 'SIGNED_IN') {
        console.log('사용자 로그인됨:', session?.user?.email);
      } else if (event === 'SIGNED_OUT') {
        console.log('사용자 로그아웃됨');
      }
    });
  } else {
    console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
  }
})();
