/**
 * ================================================================
 * VIDEO API INTEGRATION
 * EduMath AI — 影片頁面 UI 控制器 (videoUI.js)
 * ================================================================
 *
 * 所有影片頁相關 UI 邏輯統一在此，由 videoApi Service 提供資料
 * 前端不直接 fetch，也不依賴 API 原始格式
 */

// ----------------------------------------------------------------
// 全域影片頁狀態
// ----------------------------------------------------------------
const VideoPageState = {
  currentUnit: null,       // 目前篩選單元（null = 全部）
  searchKeyword: '',       // 搜尋關鍵字
  currentList: [],         // 目前顯示的影片列表
  currentVideo: null,      // 目前播放的影片
  playerProgress: 0,       // 模擬播放進度（0-100）
  progressTimer: null,     // 模擬計時器
};

// ----------------------------------------------------------------
// 單元篩選 Tab 標籤
// ----------------------------------------------------------------
const VIDEO_UNIT_TABS = [
  { id: null,         label: '全部' },
  { id: '相似形',     label: '相似形' },
  { id: '圓形',       label: '圓形' },
  { id: '幾何與證明', label: '幾何與證明' },
  { id: '幾何與座標', label: '幾何與座標' },
  { id: '二次函數',   label: '二次函數' },
  { id: '統計與機率', label: '統計與機率' },
];

// ----------------------------------------------------------------
// 顏色配對（每個單元一個主題色）
// ----------------------------------------------------------------
const UNIT_COLORS = {
  '相似形':     '#4A90D9',
  '圓形':       '#27AE60',
  '幾何與證明': '#8E44AD',
  '幾何與座標': '#E67E22',
  '二次函數':   '#E74C3C',
  '統計與機率': '#16A085',
  'default':    '#4A90D9',
};

function unitColor(unit) {
  return UNIT_COLORS[unit] || UNIT_COLORS.default;
}

// ----------------------------------------------------------------
// 主入口：顯示影片頁
// ----------------------------------------------------------------
async function showVideoPageNew(fromUnit) {
  // 初始化頁面單元狀態（來自主畫面點擊的單元）
  VideoPageState.currentUnit = fromUnit || (currentUnit ? currentUnit.name : null);
  VideoPageState.searchKeyword = '';

  renderVideoPageShell();
  showPage('video');
  await loadVideos();
}

// ----------------------------------------------------------------
// 渲染影片頁面框架（搜尋欄 + 篩選 Tab + 內容區）
// ----------------------------------------------------------------
function renderVideoPageShell() {
  const titleEl = document.getElementById('video-page-title');
  const catEl   = document.getElementById('video-categories');
  if (!titleEl || !catEl) return;

  titleEl.innerHTML = '🎬 教學影片';

  catEl.innerHTML = `
    <!-- 搜尋欄 -->
    <div class="vid-search-wrap">
      <div class="vid-search-box">
        <span class="vid-search-icon">🔍</span>
        <input
          id="vid-search-input"
          class="vid-search-input"
          type="text"
          placeholder="搜尋九年級數學影片（例如：頂點、圓周角）"
          value="${VideoPageState.searchKeyword}"
          oninput="handleVideoSearch(this.value)"
        >
        <button class="vid-search-clear" id="vid-search-clear" onclick="clearVideoSearch()" style="${VideoPageState.searchKeyword?'':'display:none'}" title="清除">✕</button>
      </div>
    </div>

    <!-- 單元篩選 Tab -->
    <div class="vid-tabs" id="vid-tabs">
      ${VIDEO_UNIT_TABS.map(t => `
        <button
          class="vid-tab ${VideoPageState.currentUnit === t.id ? 'active' : ''}"
          data-unit="${t.id || ''}"
          onclick="handleUnitFilter(${t.id ? `'${t.id}'` : 'null'})"
        >${t.label}</button>
      `).join('')}
    </div>

    <!-- 提示列（顯示目前搜尋/篩選狀態） -->
    <div id="vid-status-bar" class="vid-status-bar" style="display:none;"></div>

    <!-- ⚠️ DEMO 提示 -->
    <div class="vid-demo-notice" id="vid-demo-notice" style="${VideoApiConfig.PROVIDER==='mock'?'':'display:none'}">
      🔧 <strong>開發模式</strong>：目前使用 <em>Demo 示範資料</em>。接入正式 API 後，請將 <code>VideoApiConfig.PROVIDER</code> 改為 <code>'remote'</code>。
    </div>

    <!-- 影片內容區 -->
    <div id="vid-content"></div>

    <!-- 分頁（預留） -->
    <div id="vid-pagination"></div>
  `;
}

// ----------------------------------------------------------------
// 載入影片（核心呼叫）
// ----------------------------------------------------------------
let _searchDebounceTimer = null;

async function loadVideos() {
  const content = document.getElementById('vid-content');
  if (!content) return;

  showVideoLoading(content);

  const opts = {
    unit:   VideoPageState.currentUnit  || undefined,
    search: VideoPageState.searchKeyword || undefined,
  };

  const res = await videoApi.getVideos(opts);
  updateVideoStatusBar(res);

  if (!res.ok) {
    showVideoError(content, res.error);
    return;
  }

  VideoPageState.currentList = res.data;

  if (res.data.length === 0) {
    showVideoEmpty(content);
    return;
  }

  renderVideoGrid(content, res.data);
}

// ----------------------------------------------------------------
// Loading Skeleton
// ----------------------------------------------------------------
function showVideoLoading(container) {
  container.innerHTML = `
    <div class="vid-loading-wrap">
      <div class="vid-loading-text">⏳ 正在取得教學影片...</div>
      <div class="vid-skeleton-grid">
        ${[1,2,3,4,5,6].map(() => `
          <div class="vid-skeleton-card">
            <div class="skel skel-thumb"></div>
            <div class="skel-body">
              <div class="skel skel-line long"></div>
              <div class="skel skel-line short"></div>
              <div class="skel skel-line mid"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------
// Error State
// ----------------------------------------------------------------
function showVideoError(container, errCode) {
  const msgs = {
    NOT_CONFIGURED: '影片 API 尚未設定。<br>請確認 <code>VideoApiConfig.BASE_URL</code> 與 <code>API_KEY</code>。',
    TIMEOUT:        '連線逾時，請確認網路狀態。',
  };
  container.innerHTML = `
    <div class="vid-state-box error-state">
      <div class="vid-state-icon">⚠️</div>
      <h3>目前無法取得影片資料</h3>
      <p>${msgs[errCode] || '發生未知錯誤，請稍後再試。'}</p>
      <button class="vid-action-btn" onclick="loadVideos()">🔄 重新載入</button>
    </div>
  `;
}

// ----------------------------------------------------------------
// Empty State
// ----------------------------------------------------------------
function showVideoEmpty(container) {
  const hasSearch = VideoPageState.searchKeyword;
  container.innerHTML = `
    <div class="vid-state-box empty-state-vid">
      <div class="vid-state-icon">🔍</div>
      <h3>${hasSearch ? '找不到相關影片' : '目前沒有影片'}</h3>
      <p>${hasSearch ? `找不到「${VideoPageState.searchKeyword}」相關影片，請換一個關鍵字試試看。` : '此單元目前暫無影片資料。'}</p>
      ${hasSearch ? `<button class="vid-action-btn" onclick="clearVideoSearch()">← 返回全部影片</button>` : ''}
    </div>
  `;
}

// ----------------------------------------------------------------
// 渲染影片格
// ----------------------------------------------------------------
function renderVideoGrid(container, videos) {
  // 依單元分組
  const grouped = {};
  videos.forEach(v => {
    const key = v.unit || '其他';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(v);
  });

  const sections = Object.entries(grouped).map(([unit, list]) => `
    <div class="vid-section">
      <div class="vid-section-header">
        <span class="vid-section-dot" style="background:${unitColor(unit)}"></span>
        <span class="vid-section-title">${unit}</span>
        <span class="vid-section-count">${list.length} 部</span>
      </div>
      <div class="vid-grid">
        ${list.map(v => renderVideoCard(v)).join('')}
      </div>
    </div>
  `).join('');

  container.innerHTML = sections;
}

// ----------------------------------------------------------------
// 影片卡片
// ----------------------------------------------------------------
function renderVideoCard(v) {
  const color  = unitColor(v.unit);
  const prog   = v.watchProgress || 0;
  const done   = v.watched || prog >= 90;
  const progBar = prog > 0 && !done
    ? `<div class="vid-card-progress-wrap"><div class="vid-card-progress-fill" style="width:${prog}%"></div></div><div class="vid-card-progress-label">${prog}%</div>`
    : '';
  // 縮圖：YouTube 縮圖 or 顏色漸層
  const thumbStyle = v.thumbnailUrl
    ? `background:url('${v.thumbnailUrl}') center/cover no-repeat;`
    : `background:linear-gradient(135deg,${color}dd,${color}88);`;

  return `
    <div class="vid-card" onclick="openVideoPlayer('${v.id}')">
      <div class="vid-card-thumb" style="${thumbStyle}">
        <div class="vid-card-play">▶</div>
        ${done ? '<div class="vid-card-watched">✓ 已觀看</div>' : ''}
        ${v.duration ? `<div class="vid-card-duration">${v.duration}</div>` : ''}
      </div>
      <div class="vid-card-body">
        <div class="vid-card-unit-tag" style="color:${color};">${v.unit}</div>
        <h4 class="vid-card-title">${v.title}</h4>
        <p class="vid-card-desc">${v.description}</p>
        ${progBar}
        <div class="vid-card-source" style="display:flex;align-items:center;gap:4px;">
          <span style="color:#FF0000;font-size:0.85rem;">▶</span> ${v.source}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------
// 狀態列（顯示搜尋/篩選結果數量）
// ----------------------------------------------------------------
function updateVideoStatusBar(res) {
  const bar = document.getElementById('vid-status-bar');
  if (!bar) return;
  if (VideoPageState.searchKeyword || VideoPageState.currentUnit) {
    bar.style.display = 'flex';
    const parts = [];
    if (VideoPageState.currentUnit) parts.push(`單元：<strong>${VideoPageState.currentUnit}</strong>`);
    if (VideoPageState.searchKeyword) parts.push(`搜尋：<strong>「${VideoPageState.searchKeyword}」</strong>`);
    if (res.ok) parts.push(`找到 <strong>${res.data.length}</strong> 部影片`);
    bar.innerHTML = parts.join('　｜　') + `　<button class="vid-clear-filter" onclick="resetVideoFilter()">✕ 清除篩選</button>`;
  } else {
    bar.style.display = 'none';
  }
}

// ----------------------------------------------------------------
// 搜尋 Handler（加 debounce 避免頻繁觸發）
// ----------------------------------------------------------------
function handleVideoSearch(val) {
  VideoPageState.searchKeyword = val.trim();
  const clearBtn = document.getElementById('vid-search-clear');
  if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';

  clearTimeout(_searchDebounceTimer);
  _searchDebounceTimer = setTimeout(() => loadVideos(), 400);
}

function clearVideoSearch() {
  VideoPageState.searchKeyword = '';
  const input = document.getElementById('vid-search-input');
  if (input) input.value = '';
  const clearBtn = document.getElementById('vid-search-clear');
  if (clearBtn) clearBtn.style.display = 'none';
  loadVideos();
}

function handleUnitFilter(unit) {
  VideoPageState.currentUnit = unit;
  // 更新 Tab 樣式
  document.querySelectorAll('.vid-tab').forEach(btn => {
    const btnUnit = btn.dataset.unit || null;
    btn.classList.toggle('active', btnUnit === (unit || ''));
  });
  loadVideos();
}

function resetVideoFilter() {
  VideoPageState.currentUnit = null;
  VideoPageState.searchKeyword = '';
  const input = document.getElementById('vid-search-input');
  if (input) input.value = '';
  document.querySelectorAll('.vid-tab').forEach(btn =>
    btn.classList.toggle('active', !btn.dataset.unit)
  );
  loadVideos();
}

// ----------------------------------------------------------------
// 影片播放頁（使用統一 VideoPlayer 元件）
// ----------------------------------------------------------------
async function openVideoPlayer(videoId) {
  const res = await videoApi.getVideoById(videoId);
  if (!res.ok) { showToast('⚠️ 無法取得影片資料'); return; }

  VideoPageState.currentVideo = res.data;
  stopProgressSimulation(); // 停止舊的模擬計時器
  renderVideoPlayer(res.data);
  showPage('videoplayer');
}

function renderVideoPlayer(v) {
  const color    = unitColor(v.unit);
  const prevNext = getPrevNextVideos(v.id);

  // ---- 播放區（交由 VideoPlayer 統一處理）----
  const playerEl = document.querySelector('.video-player-wrap');
  if (playerEl) {
    // 重設 inline style（清除舊的）
    playerEl.removeAttribute('style');
    playerEl.style.marginBottom = '20px';

    VideoPlayer.render(playerEl, v, {
      onPlay: (id) => {
        // 真正開始播放後才更新進度條 UI
        refreshProgressBar(id);
      },
      onComplete: (id) => {
        showToast('🎉 影片觀看完成！已標記為已觀看');
        refreshProgressBar(id);
      },
    });
  }

  // ---- 影片資訊 ----
  const metaEl = document.getElementById('player-title');
  const descEl = document.getElementById('player-desc');
  if (metaEl) metaEl.textContent = v.title;
  if (descEl) descEl.innerHTML = `
    <span style="background:${color}22;color:${color};border-radius:6px;padding:2px 8px;font-size:0.8rem;font-weight:700;margin-right:8px;">${v.unit}</span>
    ${v.description}
    <div style="margin-top:8px;font-size:0.78rem;color:var(--muted);">
      📡 來源：${v.source || '均一教育平台 × YouTube'}
    </div>
  `;

  // ---- 觀看進度條 ----
  renderPlayerProgressBar(v.id);

  // ---- 單元重點 ----
  const kpEl = document.getElementById('player-keypoints');
  if (kpEl) {
    kpEl.innerHTML = v.keypoints && v.keypoints.length
      ? `<h4>📌 本影片重點</h4><ul>${v.keypoints.map(kp=>`<li>${kp}</li>`).join('')}</ul>`
      : '';
  }

  // ---- 上一部 / 下一部 ----
  renderPrevNextButtons(prevNext);
}

/** 進度條渲染（從 WatchRecord 讀取最新進度） */
function renderPlayerProgressBar(videoId) {
  const existing = document.getElementById('player-prog-wrap');
  if (existing) existing.remove();

  const metaEl = document.querySelector('.video-meta');
  if (!metaEl) return;

  const record = WatchRecord.get(videoId);
  const prog   = record ? record.progress : 0;
  const done   = prog >= 90;

  const wrap = document.createElement('div');
  wrap.id = 'player-prog-wrap';
  wrap.style.cssText = 'background:var(--bg);border-radius:10px;padding:12px 16px;margin-bottom:14px;';
  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <span style="font-size:0.85rem;font-weight:700;color:var(--text);">觀看進度</span>
      <span id="player-prog-label" style="font-size:0.85rem;font-weight:700;color:${done?'var(--success)':'var(--primary)'};">
        ${done ? '✅ 已完成' : (prog > 0 ? prog + '%' : '尚未開始')}
      </span>
    </div>
    <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
      <div id="player-prog-fill" style="height:100%;width:${prog}%;background:${done?'var(--success)':'var(--primary)'};border-radius:4px;transition:width 0.5s;"></div>
    </div>
    ${prog > 0 && !done ? `<div style="font-size:0.75rem;color:var(--muted);margin-top:4px;">距離完成還有 ${100-prog}%</div>` : ''}
  `;
  metaEl.insertAdjacentElement('beforebegin', wrap);
}

/** 播放後更新進度條 UI */
function refreshProgressBar(videoId) {
  const record = WatchRecord.get(videoId);
  if (!record) return;
  const prog = record.progress;
  const done = prog >= 90;
  const fill  = document.getElementById('player-prog-fill');
  const label = document.getElementById('player-prog-label');
  if (fill)  { fill.style.width = prog + '%'; fill.style.background = done ? 'var(--success)' : 'var(--primary)'; }
  if (label) label.textContent = done ? '✅ 已完成' : prog + '%';
}

function renderPrevNextButtons(prevNext) {
  const existing = document.getElementById('vid-prev-next');
  if (existing) existing.remove();

  const kpEl = document.getElementById('player-keypoints');
  if (!kpEl) return;

  const wrap = document.createElement('div');
  wrap.id = 'vid-prev-next';
  wrap.style.cssText = 'display:flex;gap:12px;margin-top:16px;';
  wrap.innerHTML = `
    ${prevNext.prev
      ? `<button class="back-btn" style="flex:1;" onclick="openVideoPlayer('${prevNext.prev.id}')">← ${prevNext.prev.title}</button>`
      : `<div style="flex:1;"></div>`}
    ${prevNext.next
      ? `<button class="back-btn" style="flex:1;justify-content:flex-end;" onclick="openVideoPlayer('${prevNext.next.id}')">→ ${prevNext.next.title}</button>`
      : ''}
  `;
  kpEl.insertAdjacentElement('afterend', wrap);
}

function getPrevNextVideos(currentId) {
  const list = VideoPageState.currentList;
  const idx  = list.findIndex(v => v.id === currentId);
  return {
    prev: idx > 0           ? list[idx - 1] : null,
    next: idx < list.length - 1 ? list[idx + 1] : null,
  };
}

// ----------------------------------------------------------------
// 觀看進度模擬（前往外部平台時標記；嵌入播放時可接真實事件）
// ----------------------------------------------------------------
function handleExternalPlay(videoId) {
  // 點擊「前往平台觀看」視為開始觀看，進度至少 50%
  const rec = WatchRecord.get(videoId);
  if (!rec || rec.progress < 50) {
    WatchRecord.update(videoId, 50);
    updatePlayerProgressUI(50);
  }
}

function markVideoWatchedNew(videoId) {
  WatchRecord.markComplete(videoId);
  updatePlayerProgressUI(100);
  showToast('✅ 已標記為觀看完成！');
  stopProgressSimulation();
}

function updatePlayerProgressUI(prog) {
  const fill = document.getElementById('player-prog-fill');
  if (fill) {
    fill.style.width = prog + '%';
    fill.style.background = prog >= 90 ? 'var(--success)' : 'var(--primary)';
  }
  const label = fill?.parentElement?.parentElement?.querySelector('span:last-child');
  if (label && prog >= 90) label.textContent = '✅ 已完成';
  else if (label) label.textContent = prog + '%';
}

/** 模擬觀看進度遞增（僅 mock 演示用） */
function startProgressSimulation(videoId) {
  stopProgressSimulation();
  const rec = WatchRecord.get(videoId);
  let prog = rec ? rec.progress : 0;
  if (prog >= 100) return;

  // 每 6 秒增加 5%，模擬用戶在看影片
  VideoPageState.progressTimer = setInterval(() => {
    prog = Math.min(prog + 5, 95);
    WatchRecord.update(videoId, prog);
    updatePlayerProgressUI(prog);
    renderPlayerProgressBar(prog, videoId);
    if (prog >= 95) stopProgressSimulation();
  }, 6000);
}

function stopProgressSimulation() {
  if (VideoPageState.progressTimer) {
    clearInterval(VideoPageState.progressTimer);
    VideoPageState.progressTimer = null;
  }
}

// ----------------------------------------------------------------
// 錯題推薦影片連動
// ----------------------------------------------------------------
async function getRecommendedVideosForError(unit, concept) {
  const res = await videoApi.getRecommendedVideos(unit, concept);
  if (!res.ok || res.data.length === 0) return [];
  return res.data.slice(0, 3); // 最多推薦 3 部
}

function renderRecommendedVideosInline(videos, containerEl) {
  if (!containerEl || videos.length === 0) return;
  const html = `
    <div class="rec-vid-list">
      ${videos.map(v => `
        <div class="rec-vid-item" onclick="openVideoPlayer('${v.id}')">
          <div class="rec-vid-thumb" style="background:${unitColor(v.unit)}22;">🎬</div>
          <div class="rec-vid-info">
            <div class="rec-vid-title">${v.title}</div>
            <div class="rec-vid-sub">${v.unit}｜${v.duration||''}</div>
          </div>
          <span style="color:var(--primary);">▶</span>
        </div>
      `).join('')}
    </div>
  `;
  containerEl.insertAdjacentHTML('beforeend', html);
}

// ----------------------------------------------------------------
// CSS 動態注入（影片頁專用樣式）
// ----------------------------------------------------------------
(function injectVideoStyles() {
  const style = document.createElement('style');
  style.textContent = `
  /* ---- 搜尋欄 ---- */
  .vid-search-wrap { margin-bottom: 16px; }
  .vid-search-box { display:flex; align-items:center; background:#fff; border:2px solid var(--border); border-radius:50px; padding:0 18px; gap:8px; transition:border 0.2s; }
  .vid-search-box:focus-within { border-color:var(--primary); }
  .vid-search-icon { font-size:1.1rem; color:var(--muted); flex-shrink:0; }
  .vid-search-input { flex:1; border:none; outline:none; font-size:0.95rem; padding:12px 0; background:transparent; font-family:inherit; }
  .vid-search-clear { background:none; border:none; cursor:pointer; color:var(--muted); font-size:1rem; padding:0; display:flex; align-items:center; }

  /* ---- 篩選 Tab ---- */
  .vid-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
  .vid-tab { background:#fff; border:1.5px solid var(--border); border-radius:20px; padding:7px 16px; font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.2s; color:var(--text); }
  .vid-tab:hover { border-color:var(--primary); color:var(--primary); }
  .vid-tab.active { background:var(--primary); color:#fff; border-color:var(--primary); }

  /* ---- 狀態列 ---- */
  .vid-status-bar { align-items:center; gap:8px; font-size:0.85rem; color:var(--muted); background:var(--primary-light); border-radius:10px; padding:8px 14px; margin-bottom:14px; flex-wrap:wrap; }
  .vid-clear-filter { background:none; border:none; color:var(--primary); cursor:pointer; font-size:0.82rem; font-weight:600; padding:0; }

  /* ---- DEMO 提示 ---- */
  .vid-demo-notice { background:#fff8e1; border:1.5px solid #F39C12; border-radius:10px; padding:10px 16px; font-size:0.82rem; color:#7d5400; margin-bottom:16px; }
  .vid-demo-notice code { background:#fdebd0; border-radius:4px; padding:1px 5px; font-size:0.8rem; }

  /* ---- Skeleton ---- */
  .vid-loading-text { text-align:center; color:var(--muted); padding:12px 0 20px; font-size:0.95rem; }
  .vid-skeleton-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
  .vid-skeleton-card { background:#fff; border-radius:12px; overflow:hidden; border:2px solid var(--border); }
  .skel { background:linear-gradient(90deg,#f0f4f8 25%,#e8edf2 50%,#f0f4f8 75%); background-size:200% 100%; animation:skelShimmer 1.4s infinite; border-radius:6px; }
  .skel-thumb { height:110px; border-radius:0; }
  .skel-body { padding:12px; display:flex; flex-direction:column; gap:8px; }
  .skel-line.long { height:14px; width:90%; }
  .skel-line.mid  { height:12px; width:70%; }
  .skel-line.short{ height:12px; width:50%; }
  @keyframes skelShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ---- State Box ---- */
  .vid-state-box { text-align:center; padding:60px 24px; }
  .vid-state-icon { font-size:3.5rem; margin-bottom:16px; }
  .vid-state-box h3 { font-size:1.15rem; font-weight:800; color:var(--text); margin-bottom:8px; }
  .vid-state-box p  { color:var(--muted); font-size:0.9rem; line-height:1.6; margin-bottom:18px; }
  .vid-action-btn { background:var(--primary); color:#fff; border:none; border-radius:24px; padding:12px 28px; font-size:0.95rem; font-weight:700; cursor:pointer; }

  /* ---- 分組標題 ---- */
  .vid-section { margin-bottom:28px; }
  .vid-section-header { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
  .vid-section-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .vid-section-title { font-size:1rem; font-weight:800; color:var(--text); }
  .vid-section-count { font-size:0.78rem; color:var(--muted); background:var(--border); border-radius:10px; padding:2px 8px; }

  /* ---- 影片格 ---- */
  .vid-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
  .vid-card { background:#fff; border-radius:12px; overflow:hidden; border:2px solid var(--border); cursor:pointer; transition:all 0.2s; box-shadow:0 2px 8px rgba(74,144,217,0.08); }
  .vid-card:hover { border-color:var(--primary); transform:translateY(-3px); box-shadow:0 8px 20px rgba(74,144,217,0.18); }
  .vid-card-thumb { height:110px; display:flex; align-items:center; justify-content:center; position:relative; }
  .vid-card-play { width:46px; height:46px; background:rgba(255,255,255,0.9); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.3rem; transition:transform 0.2s; }
  .vid-card:hover .vid-card-play { transform:scale(1.12); }
  .vid-card-watched { position:absolute; top:8px; right:8px; background:var(--success); color:#fff; font-size:0.7rem; border-radius:10px; padding:2px 8px; font-weight:700; }
  .vid-card-duration { position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.55); color:#fff; font-size:0.7rem; border-radius:6px; padding:2px 7px; }
  .vid-card-body { padding:12px; }
  .vid-card-unit-tag { font-size:0.72rem; font-weight:800; margin-bottom:4px; }
  .vid-card-title { font-size:0.88rem; font-weight:700; color:var(--text); line-height:1.4; margin-bottom:4px; }
  .vid-card-desc { font-size:0.76rem; color:var(--muted); line-height:1.4; margin-bottom:6px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .vid-card-progress-wrap { height:4px; background:var(--border); border-radius:2px; margin-bottom:2px; overflow:hidden; }
  .vid-card-progress-fill { height:100%; background:var(--primary); border-radius:2px; transition:width 0.4s; }
  .vid-card-progress-label { font-size:0.7rem; color:var(--primary); font-weight:700; }
  .vid-card-source { font-size:0.7rem; color:var(--muted); margin-top:4px; }

  /* ---- 推薦影片列表 ---- */
  .rec-vid-list { margin-top:12px; display:flex; flex-direction:column; gap:8px; }
  .rec-vid-item { display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--primary-light); border-radius:10px; cursor:pointer; border:1.5px solid var(--border); transition:all 0.2s; }
  .rec-vid-item:hover { border-color:var(--primary); }
  .rec-vid-thumb { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0; }
  .rec-vid-info { flex:1; }
  .rec-vid-title { font-size:0.88rem; font-weight:700; color:var(--text); }
  .rec-vid-sub { font-size:0.76rem; color:var(--muted); margin-top:2px; }

  @media (max-width:600px) {
    .vid-grid { grid-template-columns: repeat(2,1fr); }
    .vid-tabs { gap:6px; }
    .vid-tab { padding:6px 12px; font-size:0.78rem; }
  }
  @media (max-width:380px) {
    .vid-grid { grid-template-columns: 1fr; }
  }
  `;
  document.head.appendChild(style);
})();
