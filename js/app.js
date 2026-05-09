/* ============================================================
   부산러너 v7 - 메인 앱 로직
   - courses.json 동적 로드
   - Supabase 통합 (좋아요/댓글/사진)
   - 자동 이미지 압축
   - 본인 콘텐츠 삭제
   - 다국어 (KO/EN)
   ============================================================ */
'use strict';

/* ============== SUPABASE CONFIG ============== */
const SUPABASE_URL = 'https://zuajsnpgubnznnqflqiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1YWpzbnBndWJuem5ucWZscWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjU4MDcsImV4cCI6MjA5MzgwMTgwN30.o365Otr1TRTfl5iXDAvVB0lVQFdqTuombt5oHMuNZMM';
const STORAGE_BUCKET = 'course-photos';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============== I18N ============== */
const I18N = {
  ko: {
    'hero.tag': '러너들이 모이는 곳 · 2026',
    'hero.title.l1': 'RUN BUSAN.',
    'hero.title.l2': 'GATHER<br>BY THE SEA.',
    'hero.subtitle': '아름다운 부산을, 함께 달립니다.',
    'hero.cta.text': '코스 살펴보기',
    'hero.stats.courses': '코스',
    'hero.stats.distance': '킬로미터',
    'hero.stats.runners': '러너',
    'courses.eyebrow': '── 코스 컬렉션',
    'courses.title.l1': 'SELECT',
    'courses.title.l2': 'YOUR <em>route.</em>',
    'courses.desc': '매주 한 코스씩 공개됩니다. 첫 번째는 옛 동해남부선이 지나던 미포-송정 구간.',
    'community.eyebrow': '── ABOUT',
    'community.quote.l1': '코스를 발견하고,',
    'community.quote.l2': '같이 달릴 사람',
    'community.quote.l3': '을 만나는 곳.',
    'detail.hero.tag': 'SIGNATURE<br>COURSE',
    'detail.hero.min': '분',
    'engagement.views': '조회',
    'engagement.photos': '사진',
    'engagement.comments': '후기',
    'detail.story.eyebrow': '── 이 코스의 이야기',
    'detail.route.eyebrow': '── 코스',
    'detail.route.title': '3개의 정거장,<br>하나의 해안선.',
    'detail.route.hint': '지도의 <b>코랄색 마커</b>를 누르면 정거장 정보가 나와요.',
    'detail.practical.eyebrow': '── 알아두기',
    'detail.practical.title': '알아두면 좋은 것들.',
    'detail.restroom.eyebrow': '── 화장실 · RESTROOMS',
    'detail.restroom.title': '러너의 <em>필수 정보.</em>',
    'detail.photos.eyebrow': '── 사진 · 러너의 시선',
    'detail.photos.title': '이 코스의 <em>풍경.</em>',
    'detail.photos.upload': '사진 올리기',
    'gallery.empty': '아직 사진이 없어요.<br>첫 번째 풍경을 남겨보세요.',
    'detail.comments.eyebrow': '── 후기 · COMMENTS',
    'detail.comments.title': '달려본 사람들의 <em>한 마디.</em>',
    'detail.comments.placeholder': '이 코스 어떠셨어요?',
    'detail.comments.submit': '등록',
    'comments.empty': '— 첫 댓글의 주인공이 되어보세요 —',
    'detail.cta.eyebrow': '── 같이 달리기',
    'detail.cta.title': '이 코스 같이 달릴 사람?',
    'detail.cta.sub': '다른 러너와 모임을 만들거나 참가해보세요.',
    'detail.cta.btn': '모임 만들기',
    'modal.nick.title': '먼저 닉네임을 알려주세요',
    'modal.nick.label': '닉네임 · NICKNAME',
    'modal.nick.placeholder': '예: 부산러너123',
    'modal.nick.color': '아바타 색 · COLOR',
    'modal.nick.submit': '시작하기',
    'modal.photo.title': '사진 올리기',
    'modal.photo.label': '사진 · PHOTO',
    'modal.photo.t': '사진을 선택하세요',
    'modal.photo.s': '자동 압축됩니다 · JPG, PNG, HEIC',
    'modal.photo.submit': '등록',
    'notif.none': '새 알림 없음',
    'toast.share': '링크 복사됨',
    'toast.meet': '모임 기능 준비 중',
    'toast.photo.ok': '사진 등록 완료',
    'toast.comment.ok': '후기 등록 완료',
    'toast.photo.size': '사진이 너무 커요 (20MB 이하)',
    'toast.coming': '다른 코스도 곧 공개됩니다',
    'toast.like': '좋아요!',
    'toast.deleted': '삭제 완료',
    'toast.delete.fail': '삭제 실패',
    'time.now': '방금',
    'time.min': '분 전',
    'time.hour': '시간 전',
    'time.day': '일 전',
    'confirm.title': '정말 삭제할까요?',
    'confirm.msg': '이 작업은 되돌릴 수 없어요.',
    'confirm.cancel': '취소',
    'confirm.yes': '삭제',
    'confirm.photo.msg': '이 사진을 삭제합니다.',
    'confirm.comment.msg': '이 댓글을 삭제합니다.',
    'easy': '초급',
    'mine': 'MINE',
    'soon': 'SOON',
  },
  en: {
    'hero.tag': 'WHERE RUNNERS GATHER · 2026',
    'hero.title.l1': 'RUN BUSAN.',
    'hero.title.l2': 'GATHER<br>BY THE SEA.',
    'hero.subtitle': 'Beautiful Busan. Together we run.',
    'hero.cta.text': 'EXPLORE COURSES',
    'hero.stats.courses': 'COURSES',
    'hero.stats.distance': 'KILOMETERS',
    'hero.stats.runners': 'RUNNERS',
    'courses.eyebrow': '── COURSE COLLECTION',
    'courses.title.l1': 'SELECT',
    'courses.title.l2': 'YOUR <em>route.</em>',
    'courses.desc': 'A new course every week. We start with the old Donghae railway path from Mipo to Songjeong.',
    'community.eyebrow': '── ABOUT',
    'community.quote.l1': 'Find the route,',
    'community.quote.l2': 'meet the runners',
    'community.quote.l3': '.',
    'detail.hero.tag': 'SIGNATURE<br>COURSE',
    'detail.hero.min': 'MIN',
    'engagement.views': 'views',
    'engagement.photos': 'photos',
    'engagement.comments': 'reviews',
    'detail.story.eyebrow': '── THE STORY',
    'detail.route.eyebrow': '── THE ROUTE',
    'detail.route.title': 'Three stations,<br>one coastline.',
    'detail.route.hint': 'Tap the <b>coral markers</b> on the map for station info.',
    'detail.practical.eyebrow': '── PRACTICAL',
    'detail.practical.title': 'Things worth knowing.',
    'detail.restroom.eyebrow': '── RESTROOMS',
    'detail.restroom.title': "A runner's <em>essentials.</em>",
    'detail.photos.eyebrow': '── PHOTOS',
    'detail.photos.title': 'Through a <em>runner\'s eye.</em>',
    'detail.photos.upload': 'Add Photo',
    'gallery.empty': 'No photos yet.<br>Be the first to share a view.',
    'detail.comments.eyebrow': '── REVIEWS',
    'detail.comments.title': 'From those who <em>ran it.</em>',
    'detail.comments.placeholder': 'How was this course?',
    'detail.comments.submit': 'Post',
    'comments.empty': '— Be the first to leave a review —',
    'detail.cta.eyebrow': '── GATHER & RUN',
    'detail.cta.title': 'Want to run this together?',
    'detail.cta.sub': 'Create or join a meet-up with other runners.',
    'detail.cta.btn': 'Create Meet-up',
    'modal.nick.title': 'Tell us your nickname',
    'modal.nick.label': 'NICKNAME',
    'modal.nick.placeholder': 'e.g. busanrunner123',
    'modal.nick.color': 'AVATAR COLOR',
    'modal.nick.submit': 'Get started',
    'modal.photo.title': 'Add a photo',
    'modal.photo.label': 'PHOTO',
    'modal.photo.t': 'Choose a photo',
    'modal.photo.s': 'Auto-compressed · JPG, PNG, HEIC',
    'modal.photo.submit': 'Post',
    'notif.none': 'No new notifications',
    'toast.share': 'Link copied',
    'toast.meet': 'Meet-ups coming soon',
    'toast.photo.ok': 'Photo posted',
    'toast.comment.ok': 'Review posted',
    'toast.photo.size': 'Photo too large (max 20MB)',
    'toast.coming': 'More courses coming soon',
    'toast.like': 'Liked!',
    'toast.deleted': 'Deleted',
    'toast.delete.fail': 'Delete failed',
    'time.now': 'just now',
    'time.min': 'm ago',
    'time.hour': 'h ago',
    'time.day': 'd ago',
    'confirm.title': 'Delete this?',
    'confirm.msg': "This can't be undone.",
    'confirm.cancel': 'Cancel',
    'confirm.yes': 'Delete',
    'confirm.photo.msg': 'This photo will be removed.',
    'confirm.comment.msg': 'This comment will be removed.',
    'easy': 'EASY',
    'mine': 'MINE',
    'soon': 'SOON',
  },
};

let currentLang = 'ko';
function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.ko[key] || key;
}

/* ============== STATE ============== */
const STORAGE_KEY = 'busan_runner_v7';
const COLORS = ['#FF6B4A', '#1B3A5C', '#2E8B57', '#9C6ADE', '#E8A317', '#3B82F6', '#EC4899', '#0F766E'];

function getSessionId() {
  let sid = localStorage.getItem('br_session_id');
  if (!sid) {
    sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('br_session_id', sid);
  }
  return sid;
}
const SESSION_ID = getSessionId();

const state = {
  user: { nick: null, color: COLORS[0] },
  courses: [],          // courses.json에서 로드
  currentCourse: null,  // 현재 보고 있는 코스
  photos: [],
  comments: [],
  likes: 0,
  liked: false,
  views: 0,
  totalRunners: 0,
};

function loadUserState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const d = JSON.parse(saved);
      if (d.user) state.user = d.user;
    }
    const savedLang = localStorage.getItem(STORAGE_KEY + '_lang');
    if (savedLang === 'en' || savedLang === 'ko') currentLang = savedLang;
  } catch (e) { console.warn(e); }
}
function saveUserState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user }));
  } catch (e) { console.warn(e); }
}

/* ============== HELPERS ============== */
function showToast(msg, icon = 'check_circle') {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastIcon').textContent = icon;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2400);
}
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return t('time.now');
  if (diff < 3_600_000) return Math.floor(diff / 60_000) + t('time.min');
  if (diff < 86_400_000) return Math.floor(diff / 3_600_000) + t('time.hour');
  return Math.floor(diff / 86_400_000) + t('time.day');
}
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ============== I18N APPLY ============== */
function applyI18n() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  // 데이터 의존 영역 다시 그리기
  renderCourseGrid();
  if (state.currentCourse) renderDetail(state.currentCourse);
  renderGallery();
  renderComments();
}

function setupLangToggle() {
  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === currentLang) return;
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY + '_lang', lang);
      applyI18n();
    });
  });
}

/* ============== DATA LOADING ============== */
async function loadCourses() {
  try {
    const resp = await fetch('data/courses.json');
    if (!resp.ok) throw new Error('courses.json fetch 실패');
    const data = await resp.json();
    state.courses = data.courses || [];
  } catch (e) {
    console.error('코스 데이터 로드 실패:', e);
    state.courses = [];
  }
}

/* ============== COURSE GRID (랜딩) ============== */
function renderCourseGrid() {
  const grid = document.getElementById('courseGrid');
  if (!grid || !state.courses.length) return;

  grid.innerHTML = state.courses.map(c => {
    // 위쪽: 영문 슬로건 (브랜드처럼 언어 무관 고정)
    const titleSlogan = c.name?.en || '';
    // 아래쪽: 현재 언어에 맞는 라우트
    // - 한국어 모드: 한글 라우트 (예: 미포 → 청사포 → 송정)
    // - 영어 모드: 영문 라우트 (없으면 빈칸 — 영문 슬로건이 이미 위에 있어서 OK)
    let titleRoute;
    if (currentLang === 'en') {
      titleRoute = c.subtitle_en || ''; // 영문 모드에서 영문 라우트 없으면 빈칸
    } else {
      titleRoute = c.subtitle_ko || c.name?.ko || '';
    }
    const dist = c.distance_km;
    const dur = c.duration_min;
    const diff = c.difficulty?.[currentLang] || c.difficulty?.ko || '';
    let meta;
    if (c.ready) {
      meta = `${dist} KM · ${dur} ${t('detail.hero.min')} · ${diff}`;
    } else {
      meta = `${dist} KM · COMING SOON`;
    }
    const photo = c.card_image;

    return `
      <div class="course-card ${c.featured ? 'featured' : ''} ${c.ready ? '' : 'locked'}"
           data-ready="${c.ready}" data-course-id="${escapeHtml(c.id)}">
        ${photo
          ? `<div class="course-card-photo"><img src="${escapeHtml(photo)}" alt="${escapeHtml(titleSlogan)}" loading="lazy" /></div>`
          : '<div class="course-card-bg"></div>'}
        <div class="course-card-num">${escapeHtml(c.num)}</div>
        ${c.ready
          ? `<div class="course-card-arrow"><span class="icon">arrow_forward</span></div>`
          : `<div class="course-card-coming"><span class="icon">schedule</span>${t('soon')}</div>`}
        <div class="course-card-content">
          <div class="course-card-tag">${escapeHtml(c.tag || '')}</div>
          <div class="course-card-title-en">${escapeHtml(titleSlogan)}</div>
          ${titleRoute ? `<div class="course-card-title-ko">${escapeHtml(titleRoute)}</div>` : ''}
          <div class="course-card-meta">${escapeHtml(meta)}</div>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.dataset.ready === 'true') {
        const id = card.dataset.courseId;
        const course = state.courses.find(c => c.id === id);
        if (course) go('detail', course);
      } else {
        showToast(t('toast.coming'), 'schedule');
      }
    });
  });

  // 헤더 통계 갱신
  const totalCourses = state.courses.length;
  const totalDist = state.courses.reduce((s, c) => s + (c.distance_km || 0), 0);
  const tcEl = document.getElementById('totalCourses');
  const tdEl = document.getElementById('totalDistance');
  if (tcEl) tcEl.textContent = totalCourses;
  if (tdEl) tdEl.textContent = Math.round(totalDist);
}

/* ============== DETAIL RENDERING ============== */
function renderDetail(course) {
  if (!course) return;

  // 히어로
  const photo = document.getElementById('detailHeroPhoto');
  if (photo) {
    photo.src = course.hero_image || course.card_image || '';
    photo.alt = course.name?.[currentLang] || '';
  }
  document.getElementById('detailHeroNum').textContent = course.num;
  document.getElementById('detailHeroTitle').textContent = course.title_en || course.name?.en || '';
  document.getElementById('detailHeroSubtitle').textContent =
    currentLang === 'en' ? (course.subtitle_en || '') : (course.subtitle_ko || '');

  const stats = document.getElementById('detailHeroStats');
  if (stats) {
    const diff = course.difficulty?.[currentLang] || course.difficulty?.ko || '';
    stats.innerHTML = `
      <span><b>${course.distance_km}</b> KM</span>
      <span><b>${course.duration_min}</b> <span>${t('detail.hero.min')}</span></span>
      <span><b>${escapeHtml(diff)}</b></span>
      <span><b>★ <span id="likeStarCount">${state.likes}</span></b></span>
    `;
  }

  // 스토리
  const storyTitle = document.getElementById('storyTitle');
  const storyText = document.getElementById('storyText');
  if (storyTitle) storyTitle.innerHTML = course.story_title?.[currentLang] || course.story_title?.ko || '';
  if (storyText) storyText.textContent = course.story?.[currentLang] || course.story?.ko || '';

  // 실용 정보
  const list = document.getElementById('practicalList');
  if (list && course.practical) {
    const order = ['time', 'start', 'parking', 'cautions', 'nearby'];
    list.innerHTML = order.map(key => {
      const row = course.practical[key];
      if (!row) return '';
      const label = row.label?.[currentLang] || row.label?.ko || '';
      const value = row.value?.[currentLang] || row.value?.ko || '';
      const sub = row.sub?.[currentLang] || row.sub?.ko || '';
      const isCautions = key === 'cautions' || key === 'nearby';
      return `
        <div class="info-row">
          <div class="info-row-label">${escapeHtml(label)}</div>
          <div class="info-row-value" ${isCautions ? 'style="font-weight:400;font-size:14px;line-height:1.6"' : ''}>${value}</div>
          ${sub ? `<div class="info-row-sub">${escapeHtml(sub)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  // 화장실
  const restroomGrid = document.getElementById('restroomGrid');
  if (restroomGrid && course.restrooms) {
    restroomGrid.innerHTML = course.restrooms.map(r => `
      <div class="restroom-card">
        <div class="restroom-icon"><span class="icon">${escapeHtml(r.icon || 'wc')}</span></div>
        <div class="restroom-info">
          <div class="restroom-name">${escapeHtml(r.name?.[currentLang] || r.name?.ko || '')}</div>
          <div class="restroom-meta">${escapeHtml(r.dist?.[currentLang] || r.dist?.ko || '')}</div>
          <div class="restroom-hours ${r.always ? 'always' : ''}">${escapeHtml(r.hours?.[currentLang] || r.hours?.ko || '')}</div>
        </div>
      </div>
    `).join('');
  }

  // 지도 (Leaflet)
  if (course.gpx && window.BusanRunnerMap) {
    window.BusanRunnerMap.render(course, currentLang);
  }
}

/* ============== SUPABASE QUERIES ============== */
async function fetchLikes() {
  try {
    const { count } = await sb
      .from('course_likes')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', state.currentCourse.id);
    state.likes = count || 0;
    const { data: mine } = await sb
      .from('course_likes')
      .select('id')
      .eq('course_id', state.currentCourse.id)
      .eq('session_id', SESSION_ID)
      .maybeSingle();
    state.liked = !!mine;
  } catch (e) { console.error('fetchLikes', e); }
}

async function toggleLike() {
  if (!state.currentCourse) return;
  if (state.liked) {
    await sb.from('course_likes').delete()
      .eq('course_id', state.currentCourse.id)
      .eq('session_id', SESSION_ID);
    state.liked = false;
    state.likes = Math.max(0, state.likes - 1);
  } else {
    const { error } = await sb.from('course_likes')
      .insert({ course_id: state.currentCourse.id, session_id: SESSION_ID });
    if (!error) {
      state.liked = true;
      state.likes++;
      showToast(t('toast.like'), 'favorite');
    }
  }
  renderEngagement();
}

async function fetchComments() {
  try {
    const { data, error } = await sb
      .from('course_comments').select('*')
      .eq('course_id', state.currentCourse.id)
      .order('created_at', { ascending: false }).limit(50);
    if (!error && data) {
      state.comments = data.map(c => ({
        id: c.id, text: c.content, by: c.user_name, color: c.user_color,
        time: new Date(c.created_at).getTime(),
        mine: c.session_id === SESSION_ID,
      }));
    }
  } catch (e) { console.error('fetchComments', e); }
}

async function postComment(text) {
  const { data, error } = await sb.from('course_comments').insert({
    course_id: state.currentCourse.id,
    session_id: SESSION_ID,
    user_name: state.user.nick,
    user_color: state.user.color,
    content: text,
  }).select().single();
  if (error) {
    console.error('postComment', error);
    showToast('댓글 등록 실패', 'warning');
    return false;
  }
  state.comments.unshift({
    id: data.id, text: data.content, by: data.user_name, color: data.user_color,
    time: new Date(data.created_at).getTime(), mine: true,
  });
  return true;
}

async function deleteComment(commentId) {
  try {
    const { error } = await sb.from('course_comments').delete()
      .eq('id', commentId).eq('session_id', SESSION_ID);
    if (error) { console.error('댓글 삭제', error); showToast(t('toast.delete.fail'), 'warning'); return false; }
    state.comments = state.comments.filter(c => c.id !== commentId);
    return true;
  } catch (e) { console.error(e); showToast(t('toast.delete.fail'), 'warning'); return false; }
}

async function fetchPhotos() {
  try {
    const { data, error } = await sb.from('course_photos').select('*')
      .eq('course_id', state.currentCourse.id)
      .order('created_at', { ascending: false }).limit(50);
    if (!error && data) {
      state.photos = data.map(p => ({
        id: p.id, url: p.public_url, path: p.storage_path,
        session_id: p.session_id, by: p.user_name, color: p.user_color,
        time: new Date(p.created_at).getTime(),
        mine: p.session_id === SESSION_ID,
      }));
    }
  } catch (e) { console.error('fetchPhotos', e); }
}

async function uploadPhoto(file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const filename = `${state.currentCourse.id}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
  const { error: upErr } = await sb.storage.from(STORAGE_BUCKET).upload(filename, file, {
    cacheControl: '3600', upsert: false,
  });
  if (upErr) { console.error('upload', upErr); showToast('사진 업로드 실패', 'warning'); return false; }
  const { data: urlData } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
  const publicUrl = urlData.publicUrl;
  const { data, error: dbErr } = await sb.from('course_photos').insert({
    course_id: state.currentCourse.id, session_id: SESSION_ID,
    user_name: state.user.nick, user_color: state.user.color,
    storage_path: filename, public_url: publicUrl,
  }).select().single();
  if (dbErr) { console.error('photo db', dbErr); showToast('사진 저장 실패', 'warning'); return false; }
  state.photos.unshift({
    id: data.id, url: publicUrl, path: filename, session_id: SESSION_ID,
    by: data.user_name, color: data.user_color,
    time: new Date(data.created_at).getTime(), mine: true,
  });
  return true;
}

async function deletePhoto(photo) {
  try {
    if (photo.path) {
      const { error: storageErr } = await sb.storage.from(STORAGE_BUCKET).remove([photo.path]);
      if (storageErr) console.warn('Storage 삭제 실패:', storageErr);
    }
    const { error: dbErr } = await sb.from('course_photos').delete()
      .eq('id', photo.id).eq('session_id', SESSION_ID);
    if (dbErr) { console.error('사진 DB 삭제', dbErr); showToast(t('toast.delete.fail'), 'warning'); return false; }
    state.photos = state.photos.filter(p => p.id !== photo.id);
    return true;
  } catch (e) { console.error(e); showToast(t('toast.delete.fail'), 'warning'); return false; }
}

async function recordView() {
  try {
    await sb.from('course_views').insert({ course_id: state.currentCourse.id, session_id: SESSION_ID });
    const { count } = await sb.from('course_views').select('*', { count: 'exact', head: true })
      .eq('course_id', state.currentCourse.id);
    state.views = count || 0;
  } catch (e) { console.error('recordView', e); }
}

async function fetchTotalRunners() {
  try {
    const [likes, comments, photos] = await Promise.all([
      sb.from('course_likes').select('*', { count: 'exact', head: true }),
      sb.from('course_comments').select('*', { count: 'exact', head: true }),
      sb.from('course_photos').select('*', { count: 'exact', head: true }),
    ]);
    state.totalRunners = (likes.count || 0) + (comments.count || 0) + (photos.count || 0);
  } catch (e) { console.error('fetchTotalRunners', e); }
}

async function refreshAll() {
  if (!state.currentCourse) return;
  await Promise.all([fetchLikes(), fetchComments(), fetchPhotos()]);
  renderEngagement();
  renderGallery();
  renderComments();
}

/* ============== ENGAGEMENT ============== */
function renderEngagement() {
  const v = document.getElementById('viewCount');
  const p = document.getElementById('photoCount');
  const c = document.getElementById('commentCount');
  const l = document.getElementById('likeCount');
  const s = document.getElementById('likeStarCount');
  if (v) v.textContent = state.views;
  if (p) p.textContent = state.photos.length;
  if (c) c.textContent = state.comments.length;
  if (l) l.textContent = state.likes;
  if (s) s.textContent = state.likes;
  const likeBtn = document.getElementById('likeBtn');
  if (likeBtn) {
    if (state.liked) {
      likeBtn.classList.add('liked');
      likeBtn.querySelector('.icon').classList.add('fill');
    } else {
      likeBtn.classList.remove('liked');
      likeBtn.querySelector('.icon').classList.remove('fill');
    }
  }
}

function setupLike() {
  const btn = document.getElementById('likeBtn');
  let pending = false;
  btn.addEventListener('click', async () => {
    if (pending) return;
    if (!state.user.nick) { ensureUser(() => btn.click()); return; }
    pending = true; btn.disabled = true;
    await toggleLike();
    pending = false; btn.disabled = false;
  });
}

/* ============== NICKNAME ============== */
function ensureUser(callback) {
  if (state.user.nick) { callback(); return; }
  const nickInput = document.getElementById('nickInput');
  const submit = document.getElementById('nickSubmit');
  nickInput.value = '';
  submit.disabled = true;
  openModal('nickModal');
  nickInput.focus();
  submit.onclick = () => {
    const nick = nickInput.value.trim();
    if (!nick) return;
    state.user.nick = nick;
    saveUserState();
    closeModal('nickModal');
    callback();
  };
}

function setupNickModal() {
  const nickInput = document.getElementById('nickInput');
  const submit = document.getElementById('nickSubmit');
  nickInput.addEventListener('input', () => { submit.disabled = !nickInput.value.trim(); });
  nickInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !submit.disabled) submit.click(); });
  const picker = document.getElementById('colorPicker');
  picker.innerHTML = COLORS.map((c, i) => `
    <div class="color-swatch ${i === 0 ? 'active' : ''}" style="background:${c}" data-color="${c}"></div>
  `).join('');
  picker.querySelectorAll('.color-swatch').forEach(s => {
    s.addEventListener('click', () => {
      picker.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('active'));
      s.classList.add('active');
      state.user.color = s.dataset.color;
    });
  });
}

/* ============== IMAGE COMPRESSION ============== */
async function getExifOrientation(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target.result);
      if (view.getUint16(0, false) !== 0xFFD8) { resolve(1); return; }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) { resolve(1); return; }
        const marker = view.getUint16(offset, false); offset += 2;
        if (marker === 0xFFE1) {
          if (view.getUint32(offset += 2, false) !== 0x45786966) { resolve(1); return; }
          const little = view.getUint16(offset += 6, false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          const tags = view.getUint16(offset, little); offset += 2;
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) === 0x0112) {
              resolve(view.getUint16(offset + i * 12 + 8, little)); return;
            }
          }
        } else if ((marker & 0xFF00) !== 0xFF00) break;
        else offset += view.getUint16(offset, false);
      }
      resolve(1);
    };
    reader.onerror = () => resolve(1);
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

async function compressImage(file, maxSide = 1200, quality = 0.85) {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif') return file;
  try {
    const orientation = await getExifOrientation(file);
    const img = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const i = new Image();
      i.onload = () => { URL.revokeObjectURL(url); resolve(i); };
      i.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      i.src = url;
    });
    let { width, height } = img;
    const rotated = orientation >= 5 && orientation <= 8;
    let drawWidth = width, drawHeight = height;
    const longSide = Math.max(width, height);
    if (longSide > maxSide) {
      const ratio = maxSide / longSide;
      drawWidth = Math.round(width * ratio);
      drawHeight = Math.round(height * ratio);
    }
    const canvas = document.createElement('canvas');
    if (rotated) { canvas.width = drawHeight; canvas.height = drawWidth; }
    else { canvas.width = drawWidth; canvas.height = drawHeight; }
    const ctx = canvas.getContext('2d');
    switch (orientation) {
      case 2: ctx.transform(-1, 0, 0, 1, drawWidth, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, drawWidth, drawHeight); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, drawHeight); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, drawHeight, 0); break;
      case 7: ctx.transform(0, -1, -1, 0, drawHeight, drawWidth); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, drawWidth); break;
      default: break;
    }
    ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
    const blob = await new Promise(r => canvas.toBlob(b => r(b), 'image/jpeg', quality));
    if (!blob) return file;
    if (blob.size > file.size && file.type === 'image/jpeg') return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (e) {
    console.warn('압축 실패, 원본 사용:', e);
    return file;
  }
}

/* ============== PHOTO MODAL ============== */
function setupPhotoModal() {
  const area = document.getElementById('photoArea');
  const input = document.getElementById('photoInput');
  const preview = document.getElementById('photoPreview');
  const submit = document.getElementById('photoSubmit');
  let currentFile = null;
  const MAX_INPUT_SIZE = 20 * 1024 * 1024;

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_INPUT_SIZE) {
      showToast(t('toast.photo.size'), 'warning');
      input.value = ''; return;
    }
    submit.disabled = true;
    const orig = submit.textContent;
    submit.textContent = '...';
    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result;
      area.classList.add('has-image');
    };
    reader.readAsDataURL(file);
    try {
      const compressed = await compressImage(file, 1200, 0.85);
      currentFile = compressed;
      console.log(`📷 압축: ${(file.size/1024).toFixed(0)}KB → ${(compressed.size/1024).toFixed(0)}KB`);
    } catch (err) {
      console.warn('압축 실패', err);
      currentFile = file;
    }
    submit.textContent = orig;
    submit.disabled = false;
  });

  submit.addEventListener('click', async () => {
    if (!currentFile) return;
    submit.disabled = true;
    const orig = submit.textContent;
    submit.textContent = '업로드 중...';
    const success = await uploadPhoto(currentFile);
    submit.textContent = orig;
    if (success) {
      renderGallery();
      renderEngagement();
      closeModal('photoModal');
      showToast(t('toast.photo.ok'), 'check_circle');
    } else { submit.disabled = false; }
    currentFile = null;
    input.value = '';
    preview.src = '';
    area.classList.remove('has-image');
  });
}

/* ============== GALLERY ============== */
function renderGallery() {
  const c = document.getElementById('galleryContainer');
  if (!c) return;
  if (!state.photos.length) {
    c.innerHTML = `
      <div class="gallery-empty">
        <span class="icon">photo_camera</span>
        <p>${t('gallery.empty')}</p>
      </div>`;
    return;
  }
  c.innerHTML = `
    <div class="gallery-grid">
      ${state.photos.map(p => `
        <div class="gallery-item ${p.mine ? 'mine' : ''}" data-url="${escapeHtml(p.url)}" data-photo-id="${p.id}">
          <img src="${escapeHtml(p.url)}" alt="" loading="lazy" />
          <div class="gallery-item-by">@${escapeHtml(p.by)}</div>
          ${p.mine ? `<button class="gallery-item-delete" data-photo-id="${p.id}" aria-label="Delete photo"><span class="icon">delete</span></button>` : ''}
        </div>
      `).join('')}
    </div>`;
  c.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.gallery-item-delete')) return;
      openLightbox(item.dataset.url);
    });
  });
  c.querySelectorAll('.gallery-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.photoId, 10);
      const photo = state.photos.find(p => p.id === id);
      if (!photo) return;
      showConfirm('confirm.photo.msg', async () => {
        const ok = await deletePhoto(photo);
        if (ok) {
          renderGallery(); renderEngagement();
          showToast(t('toast.deleted'), 'check_circle');
        }
      });
    });
  });
}

/* ============== LIGHTBOX ============== */
function openLightbox(url) {
  document.getElementById('lightboxImg').src = url;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============== COMMENTS ============== */
function setupComments() {
  const input = document.getElementById('commentInput');
  const submit = document.getElementById('commentSubmit');
  input.addEventListener('input', () => { submit.disabled = !input.value.trim(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !submit.disabled) submit.click(); });
  submit.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    ensureUser(async () => {
      submit.disabled = true;
      const ok = await postComment(text);
      if (ok) {
        renderComments(); renderEngagement();
        input.value = '';
        showToast(t('toast.comment.ok'), 'check_circle');
      } else { submit.disabled = false; }
    });
  });
}

function renderComments() {
  const list = document.getElementById('commentsList');
  if (!list) return;
  if (!state.comments.length) {
    list.innerHTML = `<div class="comments-empty">${t('comments.empty')}</div>`;
    return;
  }
  list.innerHTML = state.comments.map(c => `
    <div class="comment" data-comment-id="${c.id}">
      <div class="comment-avatar" style="background:${escapeHtml(c.color)}">${escapeHtml((c.by[0] || '?').toUpperCase())}</div>
      <div class="comment-body">
        <div class="comment-head">
          <span class="comment-name">${escapeHtml(c.by)}</span>
          ${c.mine ? `<span class="comment-mine">${t('mine')}</span>` : ''}
          <span class="comment-time">${timeAgo(c.time)}</span>
          ${c.mine ? `<button class="comment-delete" data-comment-id="${c.id}" aria-label="Delete"><span class="icon">delete</span></button>` : ''}
        </div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('.comment-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.commentId, 10);
      showConfirm('confirm.comment.msg', async () => {
        const ok = await deleteComment(id);
        if (ok) {
          renderComments(); renderEngagement();
          showToast(t('toast.deleted'), 'check_circle');
        }
      });
    });
  });
}

/* ============== CONFIRM ============== */
function showConfirm(messageKey, onConfirm) {
  const overlay = document.getElementById('confirmModal');
  const msg = document.getElementById('confirmMsg');
  const yesBtn = document.getElementById('confirmYesBtn');
  const cancelBtn = document.getElementById('confirmCancelBtn');
  msg.textContent = t(messageKey || 'confirm.msg');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  const newYes = yesBtn.cloneNode(true);
  yesBtn.parentNode.replaceChild(newYes, yesBtn);
  const newCancel = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
  newYes.textContent = t('confirm.yes');
  newCancel.textContent = t('confirm.cancel');
  const closeIt = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };
  newYes.addEventListener('click', async () => { closeIt(); await onConfirm(); });
  newCancel.addEventListener('click', closeIt);
  overlay.onclick = (e) => { if (e.target === overlay) closeIt(); };
}

/* ============== ROUTING ============== */
async function go(view, course) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'auto' });

  if (view === 'detail' && course) {
    state.currentCourse = course;
    history.pushState({ view, courseId: course.id }, '', '#' + course.id);
    renderDetail(course);
    recordView();
    refreshAll();
  } else {
    state.currentCourse = null;
    if (window.BusanRunnerMap) window.BusanRunnerMap.destroy();
    history.pushState({ view }, '', '#');
    fetchTotalRunners().then(() => {
      const el = document.getElementById('totalRunners');
      if (el) el.textContent = state.totalRunners;
    });
  }
}

window.addEventListener('popstate', (e) => {
  const stateVal = e.state || {};
  if (stateVal.view === 'detail' && stateVal.courseId) {
    const course = state.courses.find(c => c.id === stateVal.courseId);
    if (course) { go('detail', course); return; }
  }
  go('landing');
});

/* ============== SCROLL ============== */
function setupScroll() {
  const top = document.getElementById('detailTop');
  if (!top) return;
  document.addEventListener('scroll', () => {
    if (window.scrollY > 30) top.classList.add('scrolled');
    else top.classList.remove('scrolled');
  });
}

/* ============== INIT ============== */
async function init() {
  loadUserState();

  // 데이터 로드 (병렬)
  await loadCourses();

  applyI18n();
  setupLangToggle();
  setupNickModal();
  setupPhotoModal();
  setupComments();
  setupScroll();
  setupLike();

  document.getElementById('backBtn').addEventListener('click', () => go('landing'));
  document.getElementById('addPhotoBtn').addEventListener('click', () => {
    ensureUser(() => openModal('photoModal'));
  });

  // Toast 키 바인딩
  document.querySelectorAll('[data-toast-key]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const key = el.dataset.toastKey;
      const icons = { 'notif.none': 'notifications', 'toast.share': 'check_circle', 'toast.meet': 'schedule' };
      showToast(t(key), icons[key] || 'info');
    });
  });

  // 모달 외부 클릭 닫기
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => { if (e.target === m) closeModal(m.id); });
  });

  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
      const conf = document.getElementById('confirmModal');
      if (conf && conf.classList.contains('open')) {
        conf.classList.remove('open');
        document.body.style.overflow = '';
      }
      closeLightbox();
    }
  });

  // 초기 RUNNERS 카운트
  fetchTotalRunners().then(() => {
    const el = document.getElementById('totalRunners');
    if (el) el.textContent = state.totalRunners;
  });

  // URL 해시로 상세 진입 처리
  const hash = location.hash.slice(1);
  if (hash) {
    const course = state.courses.find(c => c.id === hash);
    if (course && course.ready) { go('detail', course); return; }
  }
}

// 닉/모달 닫기 글로벌 노출 (HTML onclick 호환)
window.closeModal = closeModal;
window.closeLightbox = closeLightbox;

document.addEventListener('DOMContentLoaded', init);
