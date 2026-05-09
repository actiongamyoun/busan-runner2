# 부산러너 (Busan Runner)

부산의 시그니처 러닝 코스 카탈로그 + 같이 달릴 사람 매칭 서비스.

> **러닝 앱이 아닙니다.** 코스를 발견하고, 같이 달릴 사람을 만나는 곳.

## 📁 폴더 구조

```
busan-runner/
├── index.html              # 메인 (디자인, HTML 구조)
├── data/
│   ├── courses.json        # 모든 코스 메타데이터
│   └── tracks/
│       └── *.gpx           # 코스별 GPX 트랙 파일
├── images/
│   └── {course-id}/
│       ├── hero.jpg        # 랜딩/상세 히어로 이미지
│       └── card.jpg        # 코스 카드 이미지
├── js/
│   ├── app.js              # 메인 앱 로직
│   └── map.js              # Leaflet 지도 모듈
└── README.md
```

## 🆕 새 코스 추가하는 법

### Step 1. GPX 트랙 준비
- Zepp, Garmin, Strava 등 운동 앱에서 GPX 추출
- `data/tracks/{course-id}.gpx`로 저장
  - 예: `data/tracks/gwangalli.gpx`

### Step 2. 이미지 준비
- 본인이 직접 찍은 사진 권장 (저작권)
- `images/{course-id}/hero.jpg` (1600px 이하 추천)
- `images/{course-id}/card.jpg` (800-1200px 추천)
- EXIF 회전 미리 처리 권장

### Step 3. courses.json에 추가
`data/courses.json`을 열어 `courses` 배열에 객체 추가:

```json
{
  "id": "gwangalli",
  "num": "02",
  "ready": true,
  "tag": "NIGHT VIEW",
  "name": {
    "en": "GWANGALLI ARC",
    "ko": "광안리 해변"
  },
  "title_en": "GWANGALLI\nNIGHTS.",
  "subtitle_ko": "광안리 → 민락 → 수영만",
  "subtitle_en": "Gwangalli → Millak → Suyeong",
  "distance_km": 6.5,
  "duration_min": 40,
  "difficulty": { "ko": "초급", "en": "EASY" },
  "elev_gain_m": 25,
  "card_image": "images/gwangalli/card.jpg",
  "hero_image": "images/gwangalli/hero.jpg",
  "gpx": "data/tracks/gwangalli.gpx",
  "story": {
    "ko": "코스의 역사/매력...",
    "en": "Course story..."
  },
  "story_title": {
    "ko": "광안대교 아래, <em>야경의 코스.</em>",
    "en": "Under Gwangan Bridge, <em>a course of lights.</em>"
  },
  "stops": [
    {
      "id": "...",
      "num": "01",
      "lat": 35.1525,
      "lon": 129.1185,
      "name": { "ko": "...", "en": "..." },
      "name_secondary": { "ko": "Roman", "en": "한글" },
      "desc": { "ko": "설명", "en": "Description" }
    }
  ],
  "practical": {
    "time": { "label": {...}, "value": {...}, "sub": {...} },
    "start": { ... },
    "parking": { ... },
    "cautions": { ... },
    "nearby": { ... }
  },
  "restrooms": [
    {
      "icon": "wc",
      "name": { "ko": "...", "en": "..." },
      "dist": { "ko": "0 KM", "en": "START · 0 KM" },
      "hours": { "ko": "24시간", "en": "24 HOURS" },
      "always": true
    }
  ]
}
```

### Step 4. 배포
- GitHub에 변경사항 commit & push
- Vercel이 자동 재배포 (1-2분)

## 🛠 기술 스택

- **프론트엔드**: 단일 HTML + Vanilla JS (프레임워크 없음)
- **지도**: Leaflet + OpenStreetMap (무료)
- **백엔드**: Supabase (Postgres + Storage)
- **이미지 압축**: 브라우저 Canvas API (1200px, JPEG 85%)
- **다국어**: 자체 i18n (KO/EN)
- **호스팅**: Vercel

## 🔐 백엔드 설정 (Supabase)

이미 셋업된 테이블:
- `course_likes` (좋아요)
- `course_comments` (댓글)
- `course_photos` (사진 메타)
- `course_views` (조회수)
- Storage bucket: `course-photos` (Public)

API URL과 anon key는 `js/app.js` 상단에 설정.

## 🎨 디자인 시스템

- **컬러**: navy `#1B3A5C`, coral `#FF6B4A`, paper `#FAFAF7`
- **폰트**:
  - 한글: Pretendard Variable
  - 영문 디스플레이: Big Shoulders Display
  - 이탤릭 강조: Fraunces
  - 모노: JetBrains Mono
  - 아이콘: Material Symbols Rounded

## 📜 관리자 가이드

### 사용자 콘텐츠 삭제
Supabase SQL Editor에서:
```sql
-- 부적절한 댓글
DELETE FROM course_comments WHERE id = 5;

-- 특정 사용자 모든 글
DELETE FROM course_comments WHERE user_name = '닉네임';
DELETE FROM course_photos WHERE user_name = '닉네임';

-- 사진은 Storage도 청소 필요
-- Storage > course-photos에서 직접 삭제
```

### 통계 조회
```sql
-- 코스별 인기도
SELECT course_id, 
  (SELECT COUNT(*) FROM course_likes WHERE course_id = c.course_id) as likes,
  (SELECT COUNT(*) FROM course_views WHERE course_id = c.course_id) as views
FROM (SELECT DISTINCT course_id FROM course_views) c;
```

---

EST. 2026 · MADE FOR RUNNERS, BY RUNNERS
