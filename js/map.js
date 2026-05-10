/* ============================================================
   부산러너 v8 - 지도 모듈 (코스별 색상 지원)
   ============================================================ */

window.BusanRunnerMap = (function() {
  'use strict';

  let mapInstance = null;
  let currentCourseId = null;

  function parseGPX(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    const trkpts = xml.getElementsByTagName('trkpt');
    const points = [];
    let totalDist = 0, elevGain = 0, elevLoss = 0;
    let minEle = Infinity, maxEle = -Infinity;

    for (let i = 0; i < trkpts.length; i++) {
      const lat = parseFloat(trkpts[i].getAttribute('lat'));
      const lon = parseFloat(trkpts[i].getAttribute('lon'));
      const eleEl = trkpts[i].getElementsByTagName('ele')[0];
      const ele = eleEl ? parseFloat(eleEl.textContent) : 0;
      points.push({ lat, lon, ele, dist: 0 });
      if (ele < minEle) minEle = ele;
      if (ele > maxEle) maxEle = ele;
      if (i > 0) {
        const prev = points[i-1];
        const d = haversine(prev.lat, prev.lon, lat, lon);
        totalDist += d;
        points[i].dist = totalDist;
        const diff = ele - prev.ele;
        if (diff > 0) elevGain += diff;
        else elevLoss += Math.abs(diff);
      }
    }
    return {
      points,
      stats: {
        distance_m: totalDist, distance_km: totalDist / 1000,
        elev_gain: elevGain, elev_loss: elevLoss,
        min_ele: minEle, max_ele: maxEle, elev_range: maxEle - minEle
      }
    };
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const dphi = (lat2 - lat1) * Math.PI / 180;
    const dlam = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dphi/2)**2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlam/2)**2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  async function render(course, lang) {
    const containerId = 'courseMap';
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 코스 색상
    const courseColor = (course.color && course.color.primary) || '#FF6B4A';

    if (mapInstance && currentCourseId !== course.id) {
      mapInstance.remove();
      mapInstance = null;
    }
    if (mapInstance) return;

    container.innerHTML = '<div class="map-loading">지도 로딩 중...</div>';

    try {
      const resp = await fetch(course.gpx);
      if (!resp.ok) throw new Error('GPX fetch 실패: ' + resp.status);
      const gpxText = await resp.text();
      const { points, stats } = parseGPX(gpxText);
      if (!points.length) {
        container.innerHTML = '<div class="map-error">트랙 데이터가 없어요</div>';
        return;
      }

      container.innerHTML = '<div id="leafletMapEl" class="leaflet-map"></div>';

      const map = L.map('leafletMapEl', {
        scrollWheelZoom: false,
        attributionControl: false,
        zoomControl: true,
      });
      mapInstance = map;
      currentCourseId = course.id;

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      L.control.attribution({ prefix: '' }).addAttribution('© OpenStreetMap').addTo(map);

      const latlngs = points.map(p => [p.lat, p.lon]);
      
      // 외곽선
      L.polyline(latlngs, {
        color: '#FFFFFF', weight: 7, opacity: 0.95, smoothFactor: 1,
      }).addTo(map);
      
      // 메인 라인 (코스 색상)
      L.polyline(latlngs, {
        color: courseColor, weight: 4, opacity: 1, smoothFactor: 1,
      }).addTo(map);

      // 시작 마커
      const startPt = points[0];
      const endPt = points[points.length - 1];
      
      // 루프 코스(시작=끝) 판단
      const isLoop = haversine(startPt.lat, startPt.lon, endPt.lat, endPt.lon) < 100;
      
      const startIcon = L.divIcon({
        className: 'br-marker br-marker-start',
        html: `<div class="br-pin br-pin-start">${isLoop ? 'S/F' : 'S'}</div>`,
        iconSize: [isLoop ? 40 : 30, 30],
        iconAnchor: [isLoop ? 20 : 15, 15],
      });
      L.marker([startPt.lat, startPt.lon], { icon: startIcon }).addTo(map);
      
      // 끝 마커 (루프가 아닐 때만)
      if (!isLoop) {
        const endIcon = L.divIcon({
          className: 'br-marker br-marker-end',
          html: '<div class="br-pin br-pin-end">F</div>',
          iconSize: [30, 30], iconAnchor: [15, 15],
        });
        L.marker([endPt.lat, endPt.lon], { icon: endIcon }).addTo(map);
      }

      // 정거장 마커 (코스 색상)
      if (course.stops && course.stops.length) {
        course.stops.forEach((stop, idx) => {
          const stopIcon = L.divIcon({
            className: 'br-marker br-marker-stop',
            html: `<div class="br-pin br-pin-stop" style="background:${courseColor}">${stop.num || (idx+1)}</div>`,
            iconSize: [32, 32], iconAnchor: [16, 16],
          });
          const m = L.marker([stop.lat, stop.lon], { icon: stopIcon }).addTo(map);
          
          const stopName = (stop.name && stop.name[lang]) || stop.name?.ko || '';
          const stopSecond = (stop.name_secondary && stop.name_secondary[lang]) || '';
          const stopDesc = (stop.desc && stop.desc[lang]) || stop.desc?.ko || '';
          
          const popupHtml = `
            <div class="br-popup">
              <div class="br-popup-num" style="color:${courseColor}">${stop.num || (idx+1)}</div>
              <div class="br-popup-name">${escapeHtml(stopName)}
                ${stopSecond ? `<em>${escapeHtml(stopSecond)}</em>` : ''}
              </div>
              <div class="br-popup-desc">${escapeHtml(stopDesc)}</div>
            </div>
          `;
          m.bindPopup(popupHtml, {
            offset: [0, -8], closeButton: true,
            className: 'br-popup-wrapper', maxWidth: 260,
          });
        });
      }

      // 명소 마커 (★ 별표 - 코스 색상)
      if (course.spots && course.spots.length) {
        course.spots.forEach((spot) => {
          const spotIcon = L.divIcon({
            className: 'br-marker br-marker-spot',
            html: `<div class="br-pin br-pin-spot" style="color:${courseColor}">★</div>`,
            iconSize: [28, 28], iconAnchor: [14, 14],
          });
          const m = L.marker([spot.lat, spot.lon], { icon: spotIcon }).addTo(map);
          
          const spotName = (spot.name && spot.name[lang]) || spot.name?.ko || '';
          const spotSecond = (spot.name_secondary && spot.name_secondary[lang]) || '';
          const spotDesc = (spot.desc && spot.desc[lang]) || spot.desc?.ko || '';
          
          const popupHtml = `
            <div class="br-popup">
              <div class="br-popup-spot-tag" style="color:${courseColor}">★ ${lang === 'en' ? 'POINT OF INTEREST' : '명소'}</div>
              <div class="br-popup-name">${escapeHtml(spotName)}
                ${spotSecond ? `<em>${escapeHtml(spotSecond)}</em>` : ''}
              </div>
              <div class="br-popup-desc">${escapeHtml(spotDesc)}</div>
            </div>
          `;
          m.bindPopup(popupHtml, {
            offset: [0, -8], closeButton: true,
            className: 'br-popup-wrapper', maxWidth: 260,
          });
        });
      }

      map.fitBounds(latlngs, { padding: [40, 40] });

      updateMapStats(stats, lang);

      if (stats.elev_range > 5) {
        renderElevationChart(points, stats, lang, courseColor);
      } else {
        const elevContainer = document.getElementById('elevChart');
        if (elevContainer) elevContainer.style.display = 'none';
      }

    } catch (err) {
      console.error('지도 렌더 실패:', err);
      container.innerHTML = `<div class="map-error">지도를 불러올 수 없어요<br><small>${err.message}</small></div>`;
    }
  }

  function updateMapStats(stats, lang) {
    const el = document.getElementById('mapStats');
    if (!el) return;
    const labels = lang === 'en'
      ? { dist: 'KM', elev: 'M GAIN' }
      : { dist: 'KM', elev: 'M 누적 상승' };
    el.innerHTML = `
      <div class="map-stat">
        <span class="map-stat-num">${stats.distance_km.toFixed(1)}</span>
        <span class="map-stat-lbl">${labels.dist}</span>
      </div>
      <div class="map-stat">
        <span class="map-stat-num">${Math.round(stats.elev_gain)}</span>
        <span class="map-stat-lbl">${labels.elev}</span>
      </div>
    `;
  }

  function renderElevationChart(points, stats, lang, color) {
    const container = document.getElementById('elevChart');
    if (!container) return;
    container.style.display = '';
    
    const target = 200;
    const step = Math.max(1, Math.floor(points.length / target));
    const sampled = [];
    for (let i = 0; i < points.length; i += step) sampled.push(points[i]);
    if (sampled[sampled.length - 1] !== points[points.length - 1]) {
      sampled.push(points[points.length - 1]);
    }

    const W = 600, H = 100;
    const padX = 4, padY = 8;
    const innerW = W - padX * 2;
    const innerH = H - padY * 2;
    const minE = stats.min_ele;
    const eRange = stats.max_ele - minE || 1;
    const dRange = stats.distance_m || 1;

    let d = 'M ';
    sampled.forEach((p, i) => {
      const x = padX + (p.dist / dRange) * innerW;
      const y = padY + (1 - (p.ele - minE) / eRange) * innerH;
      d += `${i === 0 ? '' : 'L '}${x.toFixed(1)} ${y.toFixed(1)} `;
    });
    let dArea = d + `L ${(padX + innerW).toFixed(1)} ${(padY + innerH).toFixed(1)} L ${padX.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

    const labelMin = lang === 'en' ? 'min' : '최저';
    const labelMax = lang === 'en' ? 'max' : '최고';
    const gradId = 'elevGrad_' + Math.random().toString(36).slice(2, 8);

    container.innerHTML = `
      <div class="elev-chart-head">
        <div class="elev-chart-label" style="color:${color}">${lang === 'en' ? '── ELEVATION' : '── 고도'}</div>
        <div class="elev-chart-meta">
          ${labelMin} ${stats.min_ele.toFixed(0)}m · ${labelMax} ${stats.max_ele.toFixed(0)}m
        </div>
      </div>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="elev-svg">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.4" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0.05" />
          </linearGradient>
        </defs>
        <path d="${dArea}" fill="url(#${gradId})" />
        <path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" />
      </svg>
    `;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function destroy() {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
      currentCourseId = null;
    }
  }

  return { render, destroy };
})();
