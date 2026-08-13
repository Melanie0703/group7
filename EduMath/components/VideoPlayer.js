/**
 * ================================================================
 * VIDEO API INTEGRATION
 * EduMath AI — VideoPlayer 統一播放元件 (components/VideoPlayer.js)
 * ================================================================
 *
 * 負責：
 *  1. URL 驗證 validateVideoUrl()
 *  2. URL 正規化 normalizeVideoUrl()
 *  3. 來源類型判斷 getVideoType()
 *  4. 統一播放器渲染 VideoPlayer.render()
 *  5. 播放錯誤處理（iframe onload / video onerror）
 *  6. 觀看進度（只在實際播放後記錄）
 * ================================================================
 */

// ----------------------------------------------------------------
// 1. URL 正規化 — 把各種 YouTube URL 統一轉成 embed 格式
// ----------------------------------------------------------------
const VideoUrlUtils = {
  /**
   * 從各種 YouTube URL 格式抽取 video ID
   * 支援：
   *   https://www.youtube.com/watch?v=ID
   *   https://youtu.be/ID
   *   https://www.youtube.com/embed/ID
   *   https://www.youtube.com/shorts/ID
   */
  extractYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    const patterns = [
      /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_\-]{11})/,
      /(?:youtu\.be\/)([A-Za-z0-9_\-]{11})/,
      /(?:youtube\.com\/embed\/)([A-Za-z0-9_\-]{11})/,
      /(?:youtube\.com\/shorts\/)([A-Za-z0-9_\-]{11})/,
      /(?:youtube\.com\/v\/)([A-Za-z0-9_\-]{11})/,
    ];
    for (const re of patterns) {
      const m = url.match(re);
      if (m) return m[1];
    }
    return null;
  },

  /**
   * 判斷 URL 的影片類型
   * 回傳: 'youtube' | 'mp4' | 'webm' | 'ogg' | 'hls' | 'iframe' | 'external' | 'invalid'
   */
  getVideoType(url) {
    if (!url || typeof url !== 'string') return 'invalid';
    const u = url.trim().toLowerCase();
    if (!u.startsWith('http://') && !u.startsWith('https://')) return 'invalid';
    if (this.extractYouTubeId(url)) return 'youtube';
    if (u.includes('.mp4'))  return 'mp4';
    if (u.includes('.webm')) return 'webm';
    if (u.includes('.ogg'))  return 'ogg';
    if (u.includes('.m3u8')) return 'hls';
    // 已知可嵌入的教育平台
    if (u.includes('junyiacademy.org') || u.includes('junyi.ac')) return 'iframe';
    return 'external';
  },

  /**
   * 驗證影片 URL 是否可用
   * 回傳: { valid: bool, reason: string }
   */
  validateVideoUrl(url) {
    if (!url || url === '' || url === null || url === undefined) {
      return { valid: false, reason: 'NO_URL' };
    }
    if (typeof url !== 'string') {
      return { valid: false, reason: 'INVALID_TYPE' };
    }
    const u = url.trim();
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      return { valid: false, reason: 'NOT_HTTP' };
    }
    // 拒絕明顯的佔位 URL
    const fakePatterns = [
      'example.com', 'placeholder', 'your-video', 'VIDEO_ID',
      'your_api', 'test.mp4', 'sample.mp4', 'dummy',
    ];
    if (fakePatterns.some(p => u.toLowerCase().includes(p))) {
      return { valid: false, reason: 'PLACEHOLDER_URL' };
    }
    return { valid: true, reason: 'OK' };
  },

  /**
   * 正規化 YouTube URL → embed URL（加上建議參數）
   */
  normalizeYouTubeEmbed(url) {
    const ytId = this.extractYouTubeId(url);
    if (!ytId) return null;
    return `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&enablejsapi=0`;
  },

  /**
   * 針對影片物件，回傳最終可用的 embed/play URL
   */
  resolvePlayUrl(video) {
    // 優先用已是 embed 格式的 videoUrl
    if (video.videoUrl) {
      const type = this.getVideoType(video.videoUrl);
      if (type === 'youtube') return this.normalizeYouTubeEmbed(video.videoUrl);
      const v = this.validateVideoUrl(video.videoUrl);
      if (v.valid) return video.videoUrl;
    }
    // 備援：嘗試從 ytId 直接產生
    if (video.ytId) {
      return `https://www.youtube.com/embed/${video.ytId}?rel=0&modestbranding=1`;
    }
    // 備援：嘗試從 sourceUrl 抽取 YouTube ID
    if (video.sourceUrl) {
      const embed = this.normalizeYouTubeEmbed(video.sourceUrl);
      if (embed) return embed;
    }
    return null;
  },
};

// ----------------------------------------------------------------
// 2. VideoPlayer — 統一播放器渲染
// ----------------------------------------------------------------
const VideoPlayer = {
  /**
   * 渲染到指定容器
   * @param {HTMLElement} container  — 播放器容器元素
   * @param {VideoItem}   video      — 影片資料物件
   * @param {Function}    onPlay     — 開始播放時的 callback(videoId)
   * @param {Function}    onComplete — 完成播放時的 callback(videoId)
   */
  render(container, video, { onPlay, onComplete } = {}) {
    if (!container) return;

    const playUrl  = VideoUrlUtils.resolvePlayUrl(video);
    const urlValid = VideoUrlUtils.validateVideoUrl(playUrl);
    const type     = playUrl ? VideoUrlUtils.getVideoType(playUrl) : 'invalid';

    // ── 無有效 URL ──────────────────────────────────────────────
    if (!urlValid.valid || type === 'invalid') {
      container.innerHTML = this._renderNoUrl(video, urlValid.reason);
      return;
    }

    // ── YouTube iframe ──────────────────────────────────────────
    if (type === 'youtube') {
      container.innerHTML = this._renderYouTubeIframe(video, playUrl);
      this._attachIframeHandlers(container, video, onPlay, onComplete);
      return;
    }

    // ── HTML5 video（mp4 / webm / ogg）──────────────────────────
    if (['mp4', 'webm', 'ogg'].includes(type)) {
      container.innerHTML = this._renderHtml5Video(video, playUrl, type);
      this._attachVideoHandlers(container, video, onPlay, onComplete);
      return;
    }

    // ── HLS ──────────────────────────────────────────────────────
    if (type === 'hls') {
      // 檢查瀏覽器是否原生支援 HLS（Safari）
      const testVid = document.createElement('video');
      if (testVid.canPlayType('application/vnd.apple.mpegurl')) {
        container.innerHTML = this._renderHtml5Video(video, playUrl, 'hls');
        this._attachVideoHandlers(container, video, onPlay, onComplete);
      } else {
        container.innerHTML = this._renderExternalLink(video,
          '此影片格式（HLS）需要進階播放器，建議前往官方平台觀看。');
      }
      return;
    }

    // ── 其他外部連結 ─────────────────────────────────────────────
    container.innerHTML = this._renderExternalLink(video, null);
  },

  // ── 渲染：YouTube iframe ──────────────────────────────────────
  _renderYouTubeIframe(video, embedUrl) {
    return `
      <div class="vp-wrap" id="vp-${video.id}">
        <div class="vp-iframe-wrap">
          <div class="vp-loading" id="vp-loading-${video.id}">
            <div class="vp-loading-spinner"></div>
            <p>載入影片中…</p>
          </div>
          <iframe
            id="vp-iframe-${video.id}"
            class="vp-iframe"
            src="${embedUrl}"
            title="${_esc(video.title)}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            style="opacity:0;transition:opacity 0.3s;"
          ></iframe>
          <div class="vp-error" id="vp-error-${video.id}" style="display:none;">
            ${this._renderIframeError(video)}
          </div>
        </div>
        <div class="vp-yt-actions">
          <a href="${video.sourceUrl || `https://www.youtube.com/watch?v=${video.ytId}`}"
             target="_blank" rel="noopener"
             class="vp-yt-btn"
             onclick="VideoPlayer._trackExternalClick('${video.id}')">
            ▶ 在 YouTube 開啟
          </a>
        </div>
      </div>`;
  },

  // ── 渲染：HTML5 video ─────────────────────────────────────────
  _renderHtml5Video(video, url, type) {
    const mimeMap = { mp4:'video/mp4', webm:'video/webm', ogg:'video/ogg', hls:'application/vnd.apple.mpegurl' };
    const mime = mimeMap[type] || 'video/mp4';
    return `
      <div class="vp-wrap" id="vp-${video.id}">
        <video
          id="vp-video-${video.id}"
          class="vp-video"
          controls
          playsinline
          preload="metadata"
          poster="${video.thumbnailUrl || ''}"
        >
          <source src="${_esc(url)}" type="${mime}">
          <p>您的瀏覽器不支援此影片格式。</p>
        </video>
        <div class="vp-error" id="vp-error-${video.id}" style="display:none;">
          ${this._renderVideoError(video)}
        </div>
      </div>`;
  },

  // ── 渲染：外部平台連結（不允許嵌入）────────────────────────────
  _renderExternalLink(video, note) {
    return `
      <div class="vp-wrap vp-external" id="vp-${video.id}">
        ${video.thumbnailUrl
          ? `<img src="${video.thumbnailUrl}" class="vp-ext-thumb" alt="${_esc(video.title)}" onerror="this.style.display='none'">`
          : `<div class="vp-ext-thumb vp-ext-placeholder"></div>`}
        <div class="vp-ext-info">
          <p class="vp-ext-note">
            ${note || '此影片來源不支援網站內嵌，請前往官方平台觀看。'}
          </p>
          <a href="${video.sourceUrl || '#'}" target="_blank" rel="noopener"
             class="vp-ext-btn"
             onclick="VideoPlayer._trackExternalClick('${video.id}')">
            ↗ 前往官方平台觀看
          </a>
        </div>
      </div>`;
  },

  // ── 渲染：無有效 URL ─────────────────────────────────────────
  _renderNoUrl(video, reason) {
    const msgs = {
      NO_URL:          '此影片目前沒有有效的播放連結。',
      PLACEHOLDER_URL: '此影片連結尚未設定（開發中）。',
      NOT_HTTP:        '此影片連結格式無效，無法播放。',
      INVALID_TYPE:    '影片資料異常，請重新載入。',
    };
    return `
      <div class="vp-wrap vp-no-url" id="vp-${video.id}">
        <div class="vp-no-url-icon">🎬</div>
        <p class="vp-no-url-title">影片資源尚未連接</p>
        <p class="vp-no-url-msg">${msgs[reason] || '此影片目前無法播放。'}</p>
        ${video.sourceUrl
          ? `<a href="${video.sourceUrl}" target="_blank" rel="noopener" class="vp-ext-btn" style="margin-top:12px;">↗ 前往官方平台</a>`
          : ''}
        <button class="vp-reload-btn" onclick="location.reload()">🔄 重新載入</button>
      </div>`;
  },

  // ── 渲染：iframe 錯誤（X-Frame-Options 等）──────────────────
  _renderIframeError(video) {
    return `
      <div style="text-align:center;padding:24px 16px;color:#fff;">
        <div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div>
        <p style="font-weight:700;font-size:1rem;margin-bottom:8px;">影片無法在頁面內播放</p>
        <p style="font-size:0.85rem;opacity:0.8;margin-bottom:16px;">
          可能原因：來源網站不允許嵌入，或網路問題。
        </p>
        <a href="${video.sourceUrl || '#'}" target="_blank" rel="noopener"
           style="background:#FF0000;color:#fff;border-radius:20px;padding:10px 22px;text-decoration:none;font-size:0.9rem;font-weight:700;">
          ▶ 在 YouTube 直接觀看
        </a>
      </div>`;
  },

  // ── 渲染：video 元素錯誤 ────────────────────────────────────
  _renderVideoError(video) {
    return `
      <div style="text-align:center;padding:20px 16px;color:var(--text);">
        <div style="font-size:2rem;margin-bottom:8px;">⚠️</div>
        <p style="font-weight:700;margin-bottom:6px;">影片目前無法播放</p>
        <p style="font-size:0.85rem;color:var(--muted);margin-bottom:14px;">
          可能原因：影片連結失效、格式不支援或來源網站限制。
        </p>
        ${video.sourceUrl
          ? `<a href="${video.sourceUrl}" target="_blank" rel="noopener" class="vp-ext-btn">↗ 前往官方平台</a>`
          : ''}
        <button class="vp-reload-btn" onclick="location.reload()" style="margin-top:8px;">🔄 重新載入</button>
      </div>`;
  },

  // ── 事件處理：YouTube iframe ──────────────────────────────────
  _attachIframeHandlers(container, video, onPlay, onComplete) {
    const iframe   = container.querySelector(`#vp-iframe-${video.id}`);
    const loading  = container.querySelector(`#vp-loading-${video.id}`);
    const errorDiv = container.querySelector(`#vp-error-${video.id}`);
    if (!iframe) return;

    let loadTimer;
    // 5 秒後若 iframe 仍未 load，顯示備用連結（但不強制判定失敗）
    loadTimer = setTimeout(() => {
      if (iframe.style.opacity === '0') {
        if (loading) loading.style.display = 'none';
        // YouTube 在 file:// 下會被封鎖，透過 http:// 則正常
        // 直接顯示 iframe（讓瀏覽器自行決定）
        iframe.style.opacity = '1';
        if (onPlay) onPlay(video.id);
        // 模擬觀看開始（外部播放時）
        WatchRecord && WatchRecord.update(video.id, 10);
      }
    }, 5000);

    iframe.addEventListener('load', () => {
      clearTimeout(loadTimer);
      if (loading) loading.style.display = 'none';
      iframe.style.opacity = '1';
      if (onPlay) onPlay(video.id);
      // iframe load 成功 = 使用者開始觀看，記錄最低進度
      if (WatchRecord) WatchRecord.update(video.id, Math.max(10, (WatchRecord.get(video.id)||{}).progress||0));
    });

    iframe.addEventListener('error', () => {
      clearTimeout(loadTimer);
      if (loading) loading.style.display = 'none';
      if (errorDiv) errorDiv.style.display = 'block';
      iframe.style.display = 'none';
    });
  },

  // ── 事件處理：HTML5 video ────────────────────────────────────
  _attachVideoHandlers(container, video, onPlay, onComplete) {
    const vid      = container.querySelector(`#vp-video-${video.id}`);
    const errorDiv = container.querySelector(`#vp-error-${video.id}`);
    if (!vid) return;

    let progressInterval;

    vid.addEventListener('canplay', () => {
      if (onPlay) onPlay(video.id);
    });

    vid.addEventListener('play', () => {
      // 開始計算進度
      progressInterval = setInterval(() => {
        if (!vid.duration) return;
        const pct = Math.round((vid.currentTime / vid.duration) * 100);
        if (WatchRecord) WatchRecord.update(video.id, pct);
        if (pct >= 90) {
          if (onComplete) onComplete(video.id);
          clearInterval(progressInterval);
        }
      }, 5000);
    });

    vid.addEventListener('pause', () => clearInterval(progressInterval));
    vid.addEventListener('ended', () => {
      clearInterval(progressInterval);
      if (WatchRecord) WatchRecord.markComplete(video.id);
      if (onComplete) onComplete(video.id);
    });

    vid.addEventListener('error', () => {
      clearInterval(progressInterval);
      vid.style.display = 'none';
      if (errorDiv) errorDiv.style.display = 'block';
    });
  },

  // ── 追蹤外部點擊（記錄觀看開始）────────────────────────────
  _trackExternalClick(videoId) {
    if (WatchRecord) {
      const cur = (WatchRecord.get(videoId) || {}).progress || 0;
      WatchRecord.update(videoId, Math.max(50, cur));
    }
  },
};

// ── 工具：HTML 轉義 ───────────────────────────────────────────
function _esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ----------------------------------------------------------------
// 3. VideoPlayer CSS（動態注入）
// ----------------------------------------------------------------
(function injectVideoPlayerStyles() {
  if (document.getElementById('vp-styles')) return;
  const s = document.createElement('style');
  s.id = 'vp-styles';
  s.textContent = `
  /* ── VideoPlayer 共用 ── */
  .vp-wrap { width:100%; }

  /* ── YouTube iframe ── */
  .vp-iframe-wrap {
    position:relative;
    width:100%;
    aspect-ratio:16/9;
    background:#0f0f0f;
    border-radius:12px;
    overflow:hidden;
  }
  .vp-iframe {
    position:absolute;
    inset:0;
    width:100%;
    height:100%;
    border:none;
  }
  .vp-loading {
    position:absolute;
    inset:0;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    background:#0f0f0f;
    color:#fff;
    z-index:2;
    gap:12px;
    font-size:0.9rem;
  }
  .vp-loading-spinner {
    width:36px;
    height:36px;
    border:3px solid rgba(255,255,255,0.2);
    border-top-color:#fff;
    border-radius:50%;
    animation:vpSpin 0.8s linear infinite;
  }
  @keyframes vpSpin { to { transform:rotate(360deg); } }
  .vp-error {
    position:absolute;
    inset:0;
    background:#1a1a2e;
    z-index:3;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .vp-yt-actions {
    display:flex;
    justify-content:flex-end;
    margin-top:8px;
  }
  .vp-yt-btn {
    background:#FF0000;
    color:#fff;
    text-decoration:none;
    border-radius:20px;
    padding:7px 16px;
    font-size:0.82rem;
    font-weight:700;
    transition:opacity 0.2s;
  }
  .vp-yt-btn:hover { opacity:0.85; }

  /* ── HTML5 video ── */
  .vp-video {
    width:100%;
    border-radius:12px;
    background:#000;
    display:block;
    aspect-ratio:16/9;
  }

  /* ── 外部連結 ── */
  .vp-external {
    border-radius:12px;
    overflow:hidden;
    background:#1a2940;
    display:flex;
    flex-direction:column;
    align-items:center;
  }
  .vp-ext-thumb {
    width:100%;
    aspect-ratio:16/9;
    object-fit:cover;
    opacity:0.7;
  }
  .vp-ext-placeholder {
    background:linear-gradient(135deg,#2c6fad,#5DADE2);
    display:flex;
    align-items:center;
    justify-content:center;
  }
  .vp-ext-info {
    padding:20px;
    text-align:center;
    width:100%;
  }
  .vp-ext-note {
    font-size:0.88rem;
    color:rgba(255,255,255,0.8);
    margin-bottom:14px;
    line-height:1.5;
  }
  .vp-ext-btn {
    display:inline-block;
    background:var(--primary,#4A90D9);
    color:#fff;
    text-decoration:none;
    border-radius:20px;
    padding:10px 24px;
    font-size:0.9rem;
    font-weight:700;
    border:none;
    cursor:pointer;
    transition:opacity 0.2s;
  }
  .vp-ext-btn:hover { opacity:0.85; }

  /* ── 無 URL / 錯誤 ── */
  .vp-no-url {
    background:var(--primary-light,#E8F4FD);
    border-radius:12px;
    padding:40px 24px;
    text-align:center;
    border:2px dashed var(--border,#D6EAF8);
  }
  .vp-no-url-icon { font-size:3rem; margin-bottom:12px; }
  .vp-no-url-title { font-weight:800; font-size:1.05rem; color:var(--text,#1a2940); margin-bottom:6px; }
  .vp-no-url-msg { font-size:0.88rem; color:var(--muted,#7f8c8d); line-height:1.5; }
  .vp-reload-btn {
    display:block;
    margin:10px auto 0;
    background:none;
    border:1.5px solid var(--border,#D6EAF8);
    border-radius:20px;
    padding:7px 20px;
    font-size:0.85rem;
    cursor:pointer;
    color:var(--text,#1a2940);
    transition:background 0.2s;
  }
  .vp-reload-btn:hover { background:var(--border,#D6EAF8); }
  `;
  document.head.appendChild(s);
})();
