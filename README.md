# 🎨 부산러너 아이콘 적용 가이드

## 📦 파일 구성

```
icons/
├── icon-1024.png         ← 마스터 (OG 이미지용, 인스타 공유)
├── icon-512.png          ← PWA 큰 아이콘
├── icon-192.png          ← PWA 작은 아이콘, Android 홈
├── icon-180.png          ← (apple-touch-icon 사본)
├── icon-96.png           ← 작은 알림용
├── favicon.png           ← 32x32 브라우저 탭
└── apple-touch-icon.png  ← iOS 홈 화면 (180x180)
```

---

## 🛠 GitHub 업로드

repo 루트에 **`icons/`** 폴더로 통째로 업로드:

```
busan-runner-repo/
├── index.html
├── admin.html
├── data/
├── images/
├── js/
└── icons/   ← 새 폴더
    ├── icon-1024.png
    ├── icon-512.png
    └── ... (7개 파일)
```

---

## 📋 index.html 수정 — `<head>` 안에 추가

`<head>` 안에 아래 태그들을 추가하세요 (기존 `<link>` 태그들 옆에):

```html
<!-- 🎨 앱 아이콘 + PWA -->
<link rel="icon" type="image/png" href="/icons/favicon.png" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />

<!-- 🎨 OG 이미지 (인스타·카톡·페북 공유) -->
<meta property="og:image" content="/icons/icon-1024.png" />
<meta property="og:image:width" content="1024" />
<meta property="og:image:height" content="1024" />
<meta property="og:title" content="부산러너 - Busan Runner" />
<meta property="og:description" content="부산의 모든 러닝 코스를 한 곳에. 함께 달릴 사람도 여기서 찾아보세요." />
<meta property="og:type" content="website" />

<!-- Twitter 카드 (트위터에서 미리보기) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="/icons/icon-1024.png" />

<!-- 테마 색상 (모바일 브라우저 상단바 색) -->
<meta name="theme-color" content="#0F2340" />
```

---

## 📋 manifest.json — repo 루트에 새 파일 생성

```json
{
  "name": "부산러너 - Busan Runner",
  "short_name": "부산러너",
  "description": "부산의 모든 러닝 코스를 한 곳에",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F2340",
  "theme_color": "#0F2340",
  "orientation": "portrait",
  "lang": "ko",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-1024.png",
      "sizes": "1024x1024",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

---

## 🧪 적용 후 확인

### 1. 브라우저 탭 (favicon)
- 사이트 열면 탭에 작은 아이콘 표시
- 강제 새로고침 필요 (Ctrl+Shift+R)

### 2. 인스타/카톡 공유 (OG 이미지)
- 카톡에 사이트 링크 보내기
- 미리보기에 1024x1024 아이콘 나옴
- ⚠️ 처음 공유 후 캐시되니, 카톡/인스타에서 즉시 안 보일 수 있음

### 3. iOS 홈 화면 추가
- Safari에서 사이트 열기
- 공유 버튼 → "홈 화면에 추가"
- 부산러너 아이콘 + 이름 보임

### 4. Android 홈 화면 추가 (PWA)
- Chrome에서 사이트 열기
- 메뉴 → "홈 화면에 추가"
- 부산러너 PWA 설치됨

---

## 💡 진짜 빠른 적용 (5분)

만약 manifest.json + meta 태그 수정 부담스러우면:

**최소만 추가 (index.html `<head>`)**:
```html
<link rel="icon" href="/icons/favicon.png" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<meta property="og:image" content="/icons/icon-1024.png" />
```

이것만 있어도:
- 브라우저 탭 아이콘 ✅
- iOS 홈 화면 아이콘 ✅
- 인스타/카톡 공유 미리보기 ✅

PWA 설치는 manifest.json 필요하니 나중에.
