/* ============================================================
   부산러너 v8 - 관리자 페이지 로직
   - SHA-256 비밀번호 인증 (Supabase admin_auth 테이블)
   - 슬롯별 카드/히어로/갤러리 사진 업로드/삭제
   - 자동 압축 (1200px, JPEG 85%)
   ============================================================ */
'use strict';

const SUPABASE_URL = 'https://zuajsnpgubnznnqflqiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1YWpzbnBndWJuem5ucWZscWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjU4MDcsImV4cCI6MjA5MzgwMTgwN30.o365Otr1TRTfl5iXDAvVB0lVQFdqTuombt5oHMuNZMM';
const STORAGE_BUCKET = 'course-photos';
const SESSION_TOKEN_KEY = 'br_admin_token';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let courses = [];
let cardPhotos = []; // 현재 코스의 모든 카드/히어로/갤러리 사진
let currentCourseId = null;

/* ============== UTILS ============== */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastIcon').textContent = 
    type === 'error' ? 'error' : 'check_circle';
  toast.classList.toggle('error', type === 'error');
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2400);
}

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ============== AUTH ============== */
async function checkPassword(password) {
  if (!password) return false;
  try {
    const inputHash = await sha256(password);
    const { data, error } = await sb.from('admin_auth')
      .select('password_hash').limit(1).maybeSingle();
    if (error) {
      console.error('인증 조회 실패:', error);
      return false;
    }
    if (!data) {
      console.warn('admin_auth 테이블에 비밀번호가 없습니다');
      return false;
    }
    return inputHash === data.password_hash;
  } catch (e) {
    console.error('checkPassword 에러:', e);
    return false;
  }
}

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_TOKEN_KEY) === 'authenticated';
}

function setLoggedIn() {
  sessionStorage.setItem(SESSION_TOKEN_KEY, 'authenticated');
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminApp').classList.add('active');
  initAdmin();
}

function logout() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  location.reload();
}

function setupLogin() {
  const input = document.getElementById('passwordInput');
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('loginError');

  input.addEventListener('input', () => {
    btn.disabled = !input.value;
    err.style.display = 'none';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !btn.disabled) btn.click();
  });

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = '확인 중...';
    const password = input.value;
    const ok = await checkPassword(password);
    btn.textContent = '로그인';
    if (ok) {
      setLoggedIn();
    } else {
      err.textContent = '비밀번호가 틀렸습니다.';
      err.style.display = 'block';
      input.value = '';
      btn.disabled = true;
      input.focus();
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('로그아웃하시겠어요?')) logout();
  });
}

/* ============== IMAGE COMPRESSION ============== */
/* ============== IMAGE COMPRESSION (v8 - createImageBitmap 기반) ============== */
// createImageBitmap이 EXIF orientation을 자동 처리 → 회전 문제 해결
// iOS Safari 14+ / Chrome 50+ / Firefox 90+ 지원
async function compressImage(file, maxSide = 1200, quality = 0.85) {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif') return file;

  try {
    let bitmap;
    
    // createImageBitmap with imageOrientation: EXIF 자동 적용
    if (typeof createImageBitmap !== 'undefined') {
      try {
        bitmap = await createImageBitmap(file, {
          imageOrientation: 'from-image'
        });
      } catch (e) {
        // 옵션 미지원 → 옵션 없이 시도
        console.warn('imageOrientation 미지원, 폴백:', e);
        bitmap = await createImageBitmap(file);
      }
    } else {
      // 매우 오래된 브라우저: 원본 그대로 (회전 안 됨)
      console.warn('createImageBitmap 미지원');
      return file;
    }

    let { width, height } = bitmap;
    const longSide = Math.max(width, height);
    if (longSide > maxSide) {
      const ratio = maxSide / longSide;
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    if (bitmap.close) bitmap.close();

    const blob = await new Promise(r => canvas.toBlob(b => r(b), 'image/jpeg', quality));
    if (!blob) return file;
    if (blob.size > file.size && file.type === 'image/jpeg') return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (e) {
    console.warn('압축 실패:', e);
    return file;
  }
}

/* ============== DATA LOADING ============== */
async function loadCourses() {
  try {
    const resp = await fetch('data/courses.json');
    if (!resp.ok) throw new Error('courses.json 로드 실패');
    const data = await resp.json();
    courses = (data.courses || []).filter(c => c.ready);
  } catch (e) {
    console.error(e);
    showToast('코스 데이터 로드 실패', 'error');
  }
}

async function loadPhotos() {
  if (!currentCourseId) return;
  try {
    const { data, error } = await sb.from('course_card_photos')
      .select('*')
      .eq('course_id', currentCourseId)
      .order('display_order', { ascending: true });
    if (error) {
      console.error('photos load:', error);
      cardPhotos = [];
      return;
    }
    cardPhotos = data || [];
  } catch (e) {
    console.error(e);
    cardPhotos = [];
  }
}

/* ============== UI: COURSE SELECT ============== */
function renderCourseSelect() {
  const select = document.getElementById('courseSelect');
  select.innerHTML = courses.map(c => 
    `<option value="${escapeHtml(c.id)}">${escapeHtml(c.num)} ${escapeHtml(c.name?.ko || '')}</option>`
  ).join('');
  select.addEventListener('change', async () => {
    currentCourseId = select.value;
    await loadPhotos();
    renderAllSlots();
  });
}

/* ============== UI: SLOTS RENDERING ============== */
function renderAllSlots() {
  renderCardSlots();
  renderHeroSlot();
  renderGallerySlots();
}

// 카드 사진 3슬롯
function renderCardSlots() {
  const container = document.getElementById('cardSlots');
  const slots = ['card_1', 'card_2', 'card_3'];
  
  container.innerHTML = slots.map(slot => {
    const photo = cardPhotos.find(p => p.slot === slot);
    const labels = { 'card_1': 'CARD 1', 'card_2': 'CARD 2', 'card_3': 'CARD 3' };
    
    if (photo) {
      return `
        <div class="slot" data-slot="${slot}">
          <div class="slot-label">${labels[slot]}</div>
          <img src="${escapeHtml(photo.public_url)}" alt="${slot}" />
          <div class="slot-actions">
            <button class="slot-replace" data-slot="${slot}" title="교체">
              <span class="icon">refresh</span>
            </button>
            <button class="slot-delete" data-photo-id="${photo.id}" data-path="${escapeHtml(photo.storage_path)}" title="삭제">
              <span class="icon">delete</span>
            </button>
          </div>
          <input type="file" class="slot-input" data-slot="${slot}" accept="image/*" />
        </div>
      `;
    } else {
      return `
        <div class="slot" data-slot="${slot}">
          <div class="slot-label">${labels[slot]}</div>
          <div class="slot-empty" data-slot="${slot}">
            <span class="icon">add_a_photo</span>
            <span>${labels[slot]}</span>
          </div>
          <input type="file" class="slot-input" data-slot="${slot}" accept="image/*" />
        </div>
      `;
    }
  }).join('');

  attachSlotHandlers(container);
}

// 히어로 1슬롯
function renderHeroSlot() {
  const container = document.getElementById('heroSlot');
  const photo = cardPhotos.find(p => p.slot === 'hero');

  if (photo) {
    container.innerHTML = `
      <div class="slot" data-slot="hero">
        <div class="slot-label">HERO</div>
        <img src="${escapeHtml(photo.public_url)}" alt="hero" />
        <div class="slot-actions">
          <button class="slot-replace" data-slot="hero" title="교체">
            <span class="icon">refresh</span>
          </button>
          <button class="slot-delete" data-photo-id="${photo.id}" data-path="${escapeHtml(photo.storage_path)}" title="삭제">
            <span class="icon">delete</span>
          </button>
        </div>
        <input type="file" class="slot-input" data-slot="hero" accept="image/*" />
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="slot" data-slot="hero">
        <div class="slot-label">HERO</div>
        <div class="slot-empty" data-slot="hero">
          <span class="icon">add_a_photo</span>
          <span>HERO</span>
        </div>
        <input type="file" class="slot-input" data-slot="hero" accept="image/*" />
      </div>
    `;
  }

  attachSlotHandlers(container);
}

// 갤러리 (다중)
function renderGallerySlots() {
  const container = document.getElementById('gallerySlots');
  const galleryPhotos = cardPhotos.filter(p => p.slot === 'gallery');
  
  if (!galleryPhotos.length) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = galleryPhotos.map(photo => `
    <div class="slot gallery-slot" data-photo-id="${photo.id}">
      <div class="slot-label">GALLERY</div>
      <img src="${escapeHtml(photo.public_url)}" alt="gallery" />
      <div class="slot-actions">
        <button class="slot-delete" data-photo-id="${photo.id}" data-path="${escapeHtml(photo.storage_path)}" title="삭제">
          <span class="icon">delete</span>
        </button>
      </div>
    </div>
  `).join('');

  attachSlotHandlers(container);
}

function attachSlotHandlers(container) {
  // 빈 슬롯 클릭 → 파일 선택
  container.querySelectorAll('.slot-empty').forEach(empty => {
    empty.addEventListener('click', () => {
      const slot = empty.dataset.slot;
      const input = container.querySelector(`.slot-input[data-slot="${slot}"]`);
      if (input) input.click();
    });
  });

  // 교체 버튼 → 파일 선택
  container.querySelectorAll('.slot-replace').forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = btn.dataset.slot;
      const input = container.querySelector(`.slot-input[data-slot="${slot}"]`);
      if (input) input.click();
    });
  });

  // 파일 선택 → 업로드 처리
  container.querySelectorAll('.slot-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const slot = input.dataset.slot;
      const slotEl = input.closest('.slot');
      
      // 진행 표시
      const overlay = document.createElement('div');
      overlay.className = 'uploading-overlay';
      overlay.innerHTML = '압축 + 업로드 중...';
      slotEl.appendChild(overlay);
      
      // 기존 사진 있으면 먼저 삭제 (단일 슬롯의 경우)
      if (slot !== 'gallery') {
        const existing = cardPhotos.find(p => p.slot === slot);
        if (existing) {
          await deletePhotoSilent(existing);
        }
      }
      
      const ok = await uploadCardPhoto(file, slot);
      input.value = '';
      
      if (ok) {
        showToast('사진 업로드 완료');
        await loadPhotos();
        renderAllSlots();
      } else {
        slotEl.removeChild(overlay);
        showToast('업로드 실패', 'error');
      }
    });
  });

  // 삭제 버튼
  container.querySelectorAll('.slot-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('이 사진을 삭제할까요?')) return;
      const photoId = parseInt(btn.dataset.photoId, 10);
      const path = btn.dataset.path;
      const ok = await deletePhotoFull(photoId, path);
      if (ok) {
        showToast('삭제 완료');
        await loadPhotos();
        renderAllSlots();
      } else {
        showToast('삭제 실패', 'error');
      }
    });
  });
}

/* ============== UPLOAD/DELETE ============== */
async function uploadCardPhoto(file, slot) {
  if (!currentCourseId) return false;
  try {
    const compressed = await compressImage(file, 1200, 0.85);
    console.log(`📷 압축: ${(file.size/1024).toFixed(0)}KB → ${(compressed.size/1024).toFixed(0)}KB`);
    
    const ext = 'jpg';
    const filename = `_admin/${currentCourseId}/${slot}_${Date.now()}.${ext}`;
    
    const { error: upErr } = await sb.storage
      .from(STORAGE_BUCKET)
      .upload(filename, compressed, { cacheControl: '3600', upsert: false });
    
    if (upErr) {
      console.error('Storage 업로드 실패:', upErr);
      return false;
    }
    
    const { data: urlData } = sb.storage
      .from(STORAGE_BUCKET).getPublicUrl(filename);
    
    // 갤러리는 display_order를 마지막으로
    let displayOrder = 0;
    if (slot === 'gallery') {
      const galleryCount = cardPhotos.filter(p => p.slot === 'gallery').length;
      displayOrder = galleryCount;
    }
    
    const { error: dbErr } = await sb.from('course_card_photos').insert({
      course_id: currentCourseId,
      slot: slot,
      storage_path: filename,
      public_url: urlData.publicUrl,
      display_order: displayOrder,
    });
    
    if (dbErr) {
      console.error('DB 저장 실패:', dbErr);
      return false;
    }
    return true;
  } catch (e) {
    console.error('업로드 에러:', e);
    return false;
  }
}

async function deletePhotoSilent(photo) {
  // 교체 시 기존 사진 조용히 삭제 (토스트 없음)
  try {
    if (photo.storage_path) {
      await sb.storage.from(STORAGE_BUCKET).remove([photo.storage_path]);
    }
    await sb.from('course_card_photos').delete().eq('id', photo.id);
  } catch (e) { console.warn(e); }
}

async function deletePhotoFull(photoId, storagePath) {
  try {
    if (storagePath) {
      const { error: storageErr } = await sb.storage.from(STORAGE_BUCKET).remove([storagePath]);
      if (storageErr) console.warn('Storage 삭제 실패:', storageErr);
    }
    const { error: dbErr } = await sb.from('course_card_photos')
      .delete().eq('id', photoId);
    if (dbErr) {
      console.error('DB 삭제 실패:', dbErr);
      return false;
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/* ============== GALLERY ADD ============== */
function setupGalleryAdd() {
  const zone = document.getElementById('galleryAddZone');
  const input = document.getElementById('galleryInput');
  
  zone.addEventListener('click', () => input.click());
  
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    zone.style.opacity = '0.5';
    zone.querySelector('div').textContent = '업로드 중...';
    
    const ok = await uploadCardPhoto(file, 'gallery');
    input.value = '';
    
    zone.style.opacity = '';
    zone.querySelector('div').textContent = '갤러리에 사진 추가';
    
    if (ok) {
      showToast('갤러리 사진 추가 완료');
      await loadPhotos();
      renderAllSlots();
    } else {
      showToast('업로드 실패', 'error');
    }
  });
}

/* ============== INIT ============== */
async function initAdmin() {
  await loadCourses();
  if (!courses.length) {
    showToast('코스 데이터 없음', 'error');
    return;
  }
  
  currentCourseId = courses[0].id;
  await loadPhotos();
  
  renderCourseSelect();
  setupGalleryAdd();
  renderAllSlots();
}

document.addEventListener('DOMContentLoaded', () => {
  setupLogin();
  // 이미 로그인됐으면 바로 진입
  if (isLoggedIn()) {
    setLoggedIn();
  }
});
