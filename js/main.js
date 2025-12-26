// ====================================
// 모바일 메뉴 기능
// ====================================
class MobileMenu {
  constructor() {
    this.menuBtn = document.querySelector('.mobile-menu-btn');
    this.menuOverlay = document.querySelector('.mobile-menu-overlay');
    this.menuClose = document.querySelector('.mobile-menu-close');
    this.searchBtn = document.querySelector('.mobile-search-btn');
    this.searchBar = document.querySelector('.mobile-search-bar');

    this.init();
  }

  init() {
    // 햄버거 메뉴 버튼 클릭
    if (this.menuBtn) {
      this.menuBtn.addEventListener('click', () => this.openMenu());
    }

    // 메뉴 닫기 버튼 클릭
    if (this.menuClose) {
      this.menuClose.addEventListener('click', () => this.closeMenu());
    }

    // 오버레이 클릭 시 메뉴 닫기
    if (this.menuOverlay) {
      this.menuOverlay.addEventListener('click', (e) => {
        if (e.target === this.menuOverlay) {
          this.closeMenu();
        }
      });
    }

    // 모바일 검색 버튼 클릭
    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => this.toggleSearch());
    }

    // ESC 키로 메뉴 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMenu();
        this.closeSearch();
      }
    });
  }

  openMenu() {
    this.menuBtn.classList.add('active');
    this.menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // 스크롤 방지
  }

  closeMenu() {
    this.menuBtn.classList.remove('active');
    this.menuOverlay.classList.remove('active');
    document.body.style.overflow = ''; // 스크롤 복원
  }

  toggleSearch() {
    this.searchBar.classList.toggle('active');
  }

  closeSearch() {
    this.searchBar.classList.remove('active');
  }
}

// ====================================
// 슬라이더 기능
// ====================================
class HeroSlider {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.prevBtn = document.querySelector('.slider-btn.prev');
    this.nextBtn = document.querySelector('.slider-btn.next');
    this.currentSlide = 0;
    this.totalSlides = this.slides.length;

    this.init();
  }

  init() {
    // 버튼 이벤트 리스너 등록
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.showPrevSlide());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.showNextSlide());
    }

    // 자동 슬라이드 시작 (5초마다)
    this.startAutoSlide();

    // 슬라이드 인디케이터 업데이트
    this.updateIndicator();
  }

  showSlide(index) {
    // 모든 슬라이드에서 active 클래스 제거
    this.slides.forEach(slide => {
      slide.classList.remove('active');
    });

    // 현재 슬라이드에 active 클래스 추가
    this.slides[index].classList.add('active');
    this.currentSlide = index;

    // 인디케이터 업데이트
    this.updateIndicator();
  }

  showNextSlide() {
    let nextIndex = (this.currentSlide + 1) % this.totalSlides;
    this.showSlide(nextIndex);
  }

  showPrevSlide() {
    let prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.showSlide(prevIndex);
  }

  updateIndicator() {
    const currentEl = document.querySelector('.slider-indicator .current');
    const totalEl = document.querySelector('.slider-indicator .total');

    if (currentEl) currentEl.textContent = this.currentSlide + 1;
    if (totalEl) totalEl.textContent = this.totalSlides;
  }

  startAutoSlide() {
    setInterval(() => {
      this.showNextSlide();
    }, 5000);
  }
}

// ====================================
// 탭 메뉴 기능
// ====================================
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 모든 탭에서 active 클래스 제거
      tabButtons.forEach(btn => btn.classList.remove('active'));

      // 클릭한 탭에 active 클래스 추가
      this.classList.add('active');

      // 탭에 해당하는 컨텐츠 표시 (추후 구현)
      const tabName = this.dataset.tab;
      console.log(`${tabName} 탭 활성화`);
    });
  });
}

// ====================================
// 검색 기능
// ====================================
function initSearch() {
  // 데스크톱 검색
  const searchBtn = document.querySelector('.search-bar .search-btn');
  const searchInput = document.querySelector('.search-bar input');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      performSearch(searchInput.value);
    });

    // 엔터키 검색
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch(searchInput.value);
      }
    });
  }

  // 모바일 검색
  const mobileSearchBtn = document.querySelector('.mobile-search-bar .search-btn');
  const mobileSearchInput = document.querySelector('.mobile-search-bar input');

  if (mobileSearchBtn && mobileSearchInput) {
    mobileSearchBtn.addEventListener('click', () => {
      performSearch(mobileSearchInput.value);
    });

    // 엔터키 검색
    mobileSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch(mobileSearchInput.value);
      }
    });
  }
}

// 검색 실행 함수
function performSearch(searchTerm) {
  const term = searchTerm.trim();
  if (term) {
    console.log(`검색어: ${term}`);
    // 실제 검색 기능은 추후 구현
    alert(`"${term}" 검색 결과를 표시합니다.`);
  }
}

// ====================================
// 스크롤 시 헤더 고정
// ====================================
function initStickyHeader() {
  const header = document.querySelector('.header');

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // 스크롤이 100px 이상이면 scrolled 클래스 추가
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ====================================
// 부드러운 스크롤
// ====================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // '#'만 있는 경우는 처리하지 않음
      if (href === '#') {
        e.preventDefault();
        return;
      }

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ====================================
// 상품 카드 클릭 이벤트
// ====================================
function initProductCards() {
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach(card => {
    card.addEventListener('click', function() {
      console.log('상품 카드 클릭');
      // 상품 상세 페이지로 이동 (추후 구현)
      alert('상품 상세 페이지로 이동합니다.');
    });
  });
}

// ====================================
// 커뮤니티 카드 클릭 이벤트
// ====================================
function initCommunityCards() {
  const communityCards = document.querySelectorAll('.community-card');

  communityCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // 링크가 아닌 경우에만 처리
      if (e.target.tagName !== 'A') {
        console.log('커뮤니티 카드 클릭');
        window.location.href = 'board.html';
      }
    });
  });
}

// ====================================
// 페이지 로드 시 초기화
// ====================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('CATHOME 메인 페이지 로드 완료');

  // 모바일 메뉴 초기화
  if (document.querySelector('.mobile-menu-btn')) {
    new MobileMenu();
  }

  // 슬라이더 초기화
  if (document.querySelector('.hero-slider')) {
    new HeroSlider();
  }

  // 탭 메뉴 초기화
  initTabs();

  // 검색 기능 초기화
  initSearch();

  // 고정 헤더 초기화
  initStickyHeader();

  // 부드러운 스크롤 초기화
  initSmoothScroll();

  // 상품 카드 초기화
  initProductCards();

  // 커뮤니티 카드 초기화
  initCommunityCards();
});

// ====================================
// 윈도우 리사이즈 이벤트
// ====================================
window.addEventListener('resize', () => {
  // 반응형 처리 (필요시 추가)
  console.log('윈도우 리사이즈');
});
