/**
 * ================================================================
 * VIDEO API INTEGRATION
 * EduMath AI — Video API Service
 * ================================================================
 *
 * 架構：前端 → videoApi Service → Provider（Mock / 正式 API）
 *
 * 切換正式 API 步驟：
 *   1. 在 VideoApiConfig.PROVIDER 改成 'remote'
 *   2. 在 VideoApiConfig.BASE_URL 填入真實 Endpoint
 *   3. 在 VideoApiConfig.API_KEY 填入 API Key（僅開發用）
 *      正式環境請透過後端 Proxy，不要暴露 Secret 在前端
 *
 * 參考 .env.example 進行設定
 * ================================================================
 */

// ----------------------------------------------------------------
// 1. API 設定（環境變數注入點）
//    正式部署請透過後端 Proxy 或 build-time env injection
// ----------------------------------------------------------------
const VideoApiConfig = {
  /**
   * 'mock'   → 使用 MockProvider（目前預設，DEMO 資料）
   * 'remote' → 使用 RemoteProvider（需填入 BASE_URL / API_KEY）
   */
  PROVIDER: 'mock',

  /** VIDEO_API_BASE_URL — 正式 API Endpoint（不含 trailing slash） */
  BASE_URL: '',   // 例如: 'https://api.example.com/v1'

  /** VIDEO_API_KEY — 僅用於開發測試；正式請走後端 Proxy */
  API_KEY: '',    // 例如: 'your_api_key_here'

  /** VIDEO_API_PROVIDER — 影片來源名稱，用於 UI 顯示 */
  SOURCE_LABEL: '均一教育平台',

  /** 逾時毫秒 */
  TIMEOUT: 8000,

  /** Cache TTL（毫秒），預設 5 分鐘 */
  CACHE_TTL: 5 * 60 * 1000,
};

// ----------------------------------------------------------------
// 2. 統一影片資料格式（Video Model）
// ----------------------------------------------------------------
/**
 * @typedef {Object} VideoItem
 * @property {string}  id
 * @property {string}  title
 * @property {string}  description
 * @property {string}  thumbnailUrl
 * @property {string}  videoUrl         — 播放用 URL 或 embed src
 * @property {boolean} embedAllowed     — 是否允許 iframe 嵌入
 * @property {string}  duration         — 例如 '8:32'
 * @property {string}  unit             — 六大單元之一
 * @property {string}  topic            — 細分主題
 * @property {string}  source           — 平台名稱
 * @property {string}  sourceUrl        — 原始連結
 * @property {string}  publishedAt
 * @property {string[]} keypoints       — 影片重點（最多 6 項）
 * @property {boolean} watched          — 由本地觀看紀錄決定
 * @property {number}  watchProgress    — 0–100
 */

// ----------------------------------------------------------------
// 3. 單元關鍵字分類對照表
// ----------------------------------------------------------------
const UNIT_KEYWORDS = {
  '相似形':   ['相似形','相似三角形','比例線段','相似比','相似','AA相似','SAS相似','SSS相似'],
  '圓形':     ['圓','圓心角','圓周角','弧長','弦','切線','圓心','直徑','半徑','圓內接'],
  '幾何與證明':['幾何','證明','推理','幾何證明','全等','三角形證明','幾何推理'],
  '幾何與座標':['座標','座標平面','座標幾何','距離公式','中點公式','斜率','直線方程式'],
  '二次函數': ['二次函數','頂點','對稱軸','最大值','最小值','拋物線','配方法','頂點式'],
  '統計與機率':['統計','平均數','機率','統計圖表','資料分析','中位數','眾數','古典機率'],
};

/** 依關鍵字猜測影片所屬單元（找不到回傳 null） */
function detectUnit(text) {
  const t = text || '';
  for (const [unit, keywords] of Object.entries(UNIT_KEYWORDS)) {
    if (keywords.some(kw => t.includes(kw))) return unit;
  }
  return null;
}

// ----------------------------------------------------------------
// 4. 資料轉換層（Adapter）
//    把不同來源的原始格式統一轉成 VideoItem
// ----------------------------------------------------------------
const VideoAdapter = {
  /**
   * 轉換「均一教育平台」可能的 API 格式（待確認後補充）
   * 目前為預留結構，欄位對應請依正式文件調整
   */
  fromJunyi(raw) {
    return {
      id:           raw.id         || raw.video_id   || '',
      title:        raw.name       || raw.title       || '',
      description:  raw.description|| raw.desc        || '',
      thumbnailUrl: raw.thumbnail  || raw.cover_url   || '',
      videoUrl:     raw.video_url  || raw.url         || '',
      embedAllowed: raw.embed_allowed !== false,
      duration:     raw.duration   || '',
      unit:         raw.unit       || detectUnit(raw.name || raw.title || ''),
      topic:        raw.topic      || raw.category    || '',
      source:       '均一教育平台',
      sourceUrl:    raw.source_url || raw.link        || 'https://www.junyiacademy.org',
      publishedAt:  raw.created_at || raw.published_at|| '',
      keypoints:    Array.isArray(raw.keypoints) ? raw.keypoints : [],
      watched:      false,
      watchProgress:0,
    };
  },

  /**
   * 通用轉換（其他來源或自訂格式）
   * 欄位名稱已對齊 VideoItem 規格
   */
  fromGeneric(raw) {
    return {
      id:           String(raw.id          || ''),
      title:        raw.title              || raw.name || '',
      description:  raw.description        || raw.desc || '',
      thumbnailUrl: raw.thumbnailUrl       || raw.thumbnail || '',
      videoUrl:     raw.videoUrl           || raw.video_url || raw.url || '',
      embedAllowed: raw.embedAllowed       !== false,
      duration:     raw.duration           || '',
      unit:         raw.unit               || detectUnit(raw.title || ''),
      topic:        raw.topic              || '',
      source:       raw.source             || VideoApiConfig.SOURCE_LABEL,
      sourceUrl:    raw.sourceUrl          || raw.source_url || '',
      publishedAt:  raw.publishedAt        || '',
      keypoints:    Array.isArray(raw.keypoints) ? raw.keypoints : [],
      watched:      false,
      watchProgress:0,
    };
  },
};

// ----------------------------------------------------------------
// 5. Simple In-Memory Cache
// ----------------------------------------------------------------
const ApiCache = {
  _store: {},
  get(key) {
    const entry = this._store[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > VideoApiConfig.CACHE_TTL) {
      delete this._store[key];
      return null;
    }
    return entry.data;
  },
  set(key, data) {
    this._store[key] = { data, ts: Date.now() };
  },
  clear() { this._store = {}; },
};

// ----------------------------------------------------------------
// 6. Mock Provider（DEMO / MOCK DATA）
//    正式 API 尚未接入前使用此 Provider
//    所有資料皆為示範用，不代表真實影片內容
// ----------------------------------------------------------------
// ----------------------------------------------------------------
// 均一教育平台影片搜尋網址輔助函式
// ----------------------------------------------------------------
function junyiSearch(keyword) {
  return `https://www.junyiacademy.org/search?query=${encodeURIComponent(keyword)}`;
}
function junyiThumb(keyword) {
  // 使用均一平台 logo 色塊做縮圖（無法直接取得縮圖）
  return '';
}

const MockProvider = {
  _tag: '[均一教育平台]',

  // ----------------------------------------------------------------
  // 影片資料 — 對應均一教育平台九年級數學內容
  // sourceUrl 直接連到均一平台搜尋頁，點擊即可到均一觀看
  // ----------------------------------------------------------------
  _videos: [
    // ── 相似形 ──────────────────────────────────────────────────
    { id:'m_sim_01', title:'相似形的基本概念', description:'認識相似圖形的定義、性質與符號', unit:'相似形', topic:'相似形基本概念', keypoints:['相似的定義','相似符號 ~','邊長成比例','對應角相等'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E7%9B%B8%E4%BC%BC%E5%BD%A2%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5' },
    { id:'m_sim_02', title:'相似三角形的判別', description:'學習 AA、SAS、SSS 三種相似條件', unit:'相似形', topic:'相似三角形', keypoints:['AA 相似','SAS 相似','SSS 相似','判斷流程'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E7%9B%B8%E4%BC%BC%E4%B8%89%E8%A7%92%E5%BD%A2%E5%88%A4%E5%88%A5' },
    { id:'m_sim_03', title:'比例線段與基本比例定理', description:'平行線截比例線段定理的推導與計算', unit:'相似形', topic:'比例線段', keypoints:['截線定理','比例線段','基本比例定理','計算應用'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%9F%BA%E6%9C%AC%E6%AF%94%E4%BE%8B%E5%AE%9A%E7%90%86' },
    { id:'m_sim_04', title:'相似比與面積比', description:'相似比 k 與面積比 k²、周長比的關係', unit:'相似形', topic:'相似形的應用', keypoints:['相似比','面積比 k²','周長比 k','實際計算'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E7%9B%B8%E4%BC%BC%E6%AF%94%E8%88%87%E9%9D%A2%E7%A9%8D%E6%AF%94' },
    { id:'m_sim_05', title:'相似形的生活應用', description:'用相似原理測量建築高度、地圖比例尺', unit:'相似形', topic:'相似形的應用', keypoints:['影子測高法','鏡子法','地圖比例尺','應用例題'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E7%9B%B8%E4%BC%BC%E5%BD%A2%E7%94%9F%E6%B4%BB%E6%87%89%E7%94%A8' },

    // ── 圓形 ────────────────────────────────────────────────────
    { id:'m_cir_01', title:'圓的基本元素', description:'圓心、半徑、直徑、弦、弧的定義與關係', unit:'圓形', topic:'圓的基本概念', keypoints:['圓心 O','半徑 r','直徑 d=2r','弦與弧'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%9C%93%E7%9A%84%E5%9F%BA%E6%9C%AC%E5%85%83%E7%B4%A0' },
    { id:'m_cir_02', title:'圓心角與圓周角定理', description:'圓心角、圓周角的定義與圓周角定理', unit:'圓形', topic:'圓周角', keypoints:['圓周角=½圓心角','同弧圓周角相等','直徑對圓周角=90°'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%9C%93%E5%91%A8%E8%A7%92%E5%AE%9A%E7%90%86' },
    { id:'m_cir_03', title:'弦與圓心距離', description:'垂徑定理與弦長計算公式', unit:'圓形', topic:'弧與弦', keypoints:['垂徑定理','弦長公式','勾股定理應用'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%BC%A6%E8%88%87%E5%9C%93%E5%BF%83%E8%B7%9D%E9%9B%A2' },
    { id:'m_cir_04', title:'切線的性質', description:'切線垂直半徑、切線長公式與兩切線等長', unit:'圓形', topic:'圓的幾何應用', keypoints:['切線垂直半徑','切線長公式','兩切線等長'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%88%87%E7%B7%9A%E6%80%A7%E8%B3%AA%E5%9C%93' },
    { id:'m_cir_05', title:'圓內接四邊形', description:'圓內接四邊形對角互補的性質與應用', unit:'圓形', topic:'圓的幾何應用', keypoints:['對角互補','圓內接判斷','角度計算'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%9C%93%E5%85%A7%E6%8E%A5%E5%9B%9B%E9%82%8A%E5%BD%A2' },

    // ── 幾何與證明 ───────────────────────────────────────────────
    { id:'m_geo_01', title:'幾何證明的格式與方法', description:'學習如何撰寫完整的幾何證明步驟', unit:'幾何與證明', topic:'證明的基本方法', keypoints:['已知條件','要求證明','每步驟附理由','直接證明法'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%B9%BE%E4%BD%95%E8%AD%89%E6%98%8E%E6%96%B9%E6%B3%95' },
    { id:'m_geo_02', title:'三角形全等條件', description:'SSS、SAS、ASA、AAS、HL 五種全等條件', unit:'幾何與證明', topic:'幾何推理', keypoints:['五種全等條件','對應邊角','全等符號','例題練習'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E4%B8%89%E8%A7%92%E5%BD%A2%E5%85%A8%E7%AD%89' },
    { id:'m_geo_03', title:'平行四邊形的性質', description:'平行四邊形的對邊、對角與對角線性質', unit:'幾何與證明', topic:'幾何應用題', keypoints:['對邊相等','對角相等','對角線互平分','輔助線技巧'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%B9%B3%E8%A1%8C%E5%9B%9B%E9%82%8A%E5%BD%A2%E6%80%A7%E8%B3%AA' },

    // ── 幾何與座標 ───────────────────────────────────────────────
    { id:'m_coo_01', title:'座標平面與象限', description:'x 軸、y 軸、四個象限與座標讀取', unit:'幾何與座標', topic:'座標平面', keypoints:['x軸y軸','四個象限','原點(0,0)','座標表示'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%BA%A7%E6%A8%99%E5%B9%B3%E9%9D%A2%E8%88%87%E8%B1%A1%E9%99%90' },
    { id:'m_coo_02', title:'兩點距離公式', description:'用勾股定理推導兩點之間距離公式', unit:'幾何與座標', topic:'距離與位置關係', keypoints:['距離公式推導','計算步驟','應用例題'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%85%A9%E9%BB%9E%E8%B7%9D%E9%9B%A2%E5%85%AC%E5%BC%8F' },
    { id:'m_coo_03', title:'中點座標公式', description:'兩點中點座標的公式推導與計算應用', unit:'幾何與座標', topic:'點與座標', keypoints:['中點公式','座標取平均','應用例題'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E4%B8%AD%E9%BB%9E%E5%85%AC%E5%BC%8F%E5%BA%A7%E6%A8%99' },
    { id:'m_coo_04', title:'直線斜率與方程式', description:'斜率的定義、計算與直線方程式', unit:'幾何與座標', topic:'座標幾何應用', keypoints:['斜率公式','截距式','平行垂直判斷'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E7%9B%B4%E7%B7%9A%E6%96%9C%E7%8E%87%E8%88%87%E6%96%B9%E7%A8%8B%E5%BC%8F' },

    // ── 二次函數 ────────────────────────────────────────────────
    { id:'m_qua_01', title:'認識二次函數', description:'二次函數的定義 y=ax²+bx+c 與基本性質', unit:'二次函數', topic:'二次函數基本概念', keypoints:['定義 y=ax²+bx+c','a≠0 的意義','與一次函數的差別','製作對應表格'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E8%AA%8D%E8%AD%98%E4%BA%8C%E6%AC%A1%E5%87%BD%E6%95%B8' },
    { id:'m_qua_02', title:'拋物線的圖形', description:'開口方向與係數 a 的關係，圖形的寬窄', unit:'二次函數', topic:'二次函數圖形', keypoints:['a>0 開口向上','a<0 開口向下','|a|越大越窄','對稱軸'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E6%8B%8B%E7%89%A9%E7%B7%9A%E5%9C%96%E5%BD%A2' },
    { id:'m_qua_03', title:'頂點式與配方法', description:'用配方法整理成頂點式 y=a(x-h)²+k', unit:'二次函數', topic:'頂點', keypoints:['配方法步驟','頂點式','頂點座標 (h,k)','計算練習'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E9%85%8D%E6%96%B9%E6%B3%95%E4%BA%8C%E6%AC%A1%E5%87%BD%E6%95%B8' },
    { id:'m_qua_04', title:'對稱軸公式 x = -b/2a', description:'對稱軸公式的推導與計算應用', unit:'二次函數', topic:'對稱軸', keypoints:['公式推導','x=-b/2a','與配方法一致','計算例題'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E4%BA%8C%E6%AC%A1%E5%87%BD%E6%95%B8%E5%B0%8D%E7%A8%B1%E8%BB%B8' },
    { id:'m_qua_05', title:'二次函數最大值與最小值', description:'用頂點 y 座標求函數的極值', unit:'二次函數', topic:'最大值與最小值', keypoints:['a>0 有最小值','a<0 有最大值','頂點 y 值','區間限制'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E4%BA%8C%E6%AC%A1%E5%87%BD%E6%95%B8%E6%9C%80%E5%A4%A7%E5%80%BC%E6%9C%80%E5%B0%8F%E5%80%BC' },
    { id:'m_qua_06', title:'二次函數應用題', description:'拋體問題、面積最大化與生活情境建模', unit:'二次函數', topic:'二次函數應用', keypoints:['建立方程式','拋體問題','面積最大化','生活情境'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E4%BA%8C%E6%AC%A1%E5%87%BD%E6%95%B8%E6%87%89%E7%94%A8%E9%A1%8C' },

    // ── 統計與機率 ───────────────────────────────────────────────
    { id:'m_sta_01', title:'資料整理與次數分配表', description:'整理資料並製作次數分配表', unit:'統計與機率', topic:'資料分析', keypoints:['次數分配表','組距','組數','累計次數'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E8%B3%87%E6%96%99%E6%95%B4%E7%90%86%E6%AC%A1%E6%95%B8%E5%88%86%E9%85%8D%E8%A1%A8' },
    { id:'m_sta_02', title:'平均數、中位數、眾數', description:'三種集中趨勢代表值的計算與比較', unit:'統計與機率', topic:'平均數', keypoints:['平均數計算','中位數排序','眾數找法','如何選擇'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E5%B9%B3%E5%9D%87%E6%95%B8%E4%B8%AD%E4%BD%8D%E6%95%B8%E7%9C%BE%E6%95%B8' },
    { id:'m_sta_03', title:'長條圖與折線圖', description:'統計圖的繪製與讀取技巧', unit:'統計與機率', topic:'統計圖表', keypoints:['長條圖用途','折線圖趨勢','讀圖技巧'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E9%95%B7%E6%A2%9D%E5%9C%96%E6%8A%98%E7%B7%9A%E5%9C%96' },
    { id:'m_sta_04', title:'機率的定義與基本計算', description:'古典機率的概念與 P(A)=m/n 公式', unit:'統計與機率', topic:'機率基本概念', keypoints:['P(A)=m/n','0≤P≤1','等可能結果','計算練習'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E6%A9%9F%E7%8E%87%E5%AE%9A%E7%BE%A9%E8%88%87%E8%A8%88%E7%AE%97' },
    { id:'m_sta_05', title:'互斥事件與獨立事件', description:'機率的加法與乘法原理', unit:'統計與機率', topic:'機率計算', keypoints:['互斥加法','獨立乘法','組合計算','例題解析'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E4%BA%92%E6%96%A5%E4%BA%8B%E4%BB%B6%E7%8D%A8%E7%AB%8B%E4%BA%8B%E4%BB%B6' },
    { id:'m_sta_06', title:'生活中的統計應用', description:'統計在民調、抽樣與資料分析的實際應用', unit:'統計與機率', topic:'生活中的統計與機率', keypoints:['民調抽樣','統計圖解讀','資料可靠性','批判性思考'],
      sourceUrl:'https://www.junyiacademy.org/search?query=%E7%94%9F%E6%B4%BB%E4%B8%AD%E7%9A%84%E7%B5%B1%E8%A8%88%E6%A9%9F%E7%8E%87' },
  ].map(v => ({
    ...v,
    thumbnailUrl: '',
    videoUrl:     v.sourceUrl,   // 點擊直接跳到均一平台
    embedAllowed: false,         // 不內嵌，改為外部連結
    source:       '均一教育平台',
  })),

  async getVideos({ unit, search, page = 1, limit = 30 } = {}) {
    await _delay(300); // 模擬網路延遲
    let results = [...this._videos];
    if (unit)   results = results.filter(v => v.unit === unit);
    if (search) results = results.filter(v =>
      v.title.includes(search) || v.description.includes(search) || v.topic.includes(search)
    );
    const start = (page - 1) * limit;
    const paged = results.slice(start, start + limit);
    return {
      ok: true,
      data: paged,
      meta: { total: results.length, page, limit, hasNextPage: start + limit < results.length },
    };
  },

  async getVideoById(id) {
    await _delay(150);
    const v = this._videos.find(v => v.id === id);
    if (!v) return { ok: false, error: 'NOT_FOUND' };
    return { ok: true, data: v };
  },

  async searchVideos(keyword) {
    return this.getVideos({ search: keyword });
  },

  async getVideosByUnit(unit) {
    return this.getVideos({ unit });
  },
};

function _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ----------------------------------------------------------------
// 7. Remote Provider（正式 API，待接入）
//    所有 fetch 均透過此 Provider，不在前端直接呼叫
// ----------------------------------------------------------------
const RemoteProvider = {
  _buildHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (VideoApiConfig.API_KEY) h['Authorization'] = `Bearer ${VideoApiConfig.API_KEY}`;
    return h;
  },

  async _fetch(path, params = {}) {
    const url = new URL(VideoApiConfig.BASE_URL + path);
    Object.entries(params).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, v));
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), VideoApiConfig.TIMEOUT);
    try {
      const res = await fetch(url.toString(), { headers: this._buildHeaders(), signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { ok: true, raw: json };
    } catch (err) {
      clearTimeout(tid);
      return { ok: false, error: err.name === 'AbortError' ? 'TIMEOUT' : err.message };
    }
  },

  /**
   * 以下方法欄位對應待正式 API 文件確認後補充
   * 目前回傳 NOT_CONFIGURED 讓呼叫端知道需要設定
   */
  async getVideos(params = {}) {
    if (!VideoApiConfig.BASE_URL) return { ok: false, error: 'NOT_CONFIGURED' };
    const res = await this._fetch('/videos', params);
    if (!res.ok) return res;
    // TODO: 依正式 API 文件調整下方欄位對應
    const items = (res.raw.data || res.raw.items || res.raw.results || [])
      .map(raw => VideoAdapter.fromGeneric(raw));
    return { ok: true, data: items, meta: res.raw.meta || res.raw.pagination || {} };
  },

  async getVideoById(id) {
    if (!VideoApiConfig.BASE_URL) return { ok: false, error: 'NOT_CONFIGURED' };
    const res = await this._fetch(`/videos/${id}`);
    if (!res.ok) return res;
    return { ok: true, data: VideoAdapter.fromGeneric(res.raw.data || res.raw) };
  },

  async searchVideos(keyword) {
    return this.getVideos({ q: keyword });
  },

  async getVideosByUnit(unit) {
    return this.getVideos({ unit });
  },
};

// ----------------------------------------------------------------
// 8. videoApi — 公開介面（前端統一使用此物件）
// ----------------------------------------------------------------
const videoApi = {
  /** 取得目前使用的 Provider */
  _provider() {
    return VideoApiConfig.PROVIDER === 'remote' ? RemoteProvider : MockProvider;
  },

  _cacheKey(method, ...args) {
    return `${method}:${args.map(a => JSON.stringify(a)).join(',')}`;
  },

  /** 注入觀看紀錄（watched / watchProgress）到影片列表 */
  _injectWatchStatus(videos) {
    const records = WatchRecord.getAll();
    return videos.map(v => {
      const rec = records[v.id];
      return { ...v, watched: !!(rec && rec.progress >= 90), watchProgress: rec ? rec.progress : 0 };
    });
  },

  /**
   * 取得影片列表
   * @param {{ unit?:string, search?:string, page?:number, limit?:number }} opts
   */
  async getVideos(opts = {}) {
    const key = this._cacheKey('getVideos', opts);
    const cached = ApiCache.get(key);
    if (cached) return cached;
    const res = await this._provider().getVideos(opts);
    if (res.ok) {
      res.data = this._injectWatchStatus(res.data);
      ApiCache.set(key, res);
    }
    return res;
  },

  /** 取得單一影片 */
  async getVideoById(id) {
    const key = this._cacheKey('getVideoById', id);
    const cached = ApiCache.get(key);
    if (cached) return cached;
    const res = await this._provider().getVideoById(id);
    if (res.ok) {
      res.data = this._injectWatchStatus([res.data])[0];
      ApiCache.set(key, res);
    }
    return res;
  },

  /** 依關鍵字搜尋 */
  async searchVideos(keyword) {
    const res = await this._provider().searchVideos(keyword);
    if (res.ok) res.data = this._injectWatchStatus(res.data);
    return res;
  },

  /** 依單元取得影片 */
  async getVideosByUnit(unit) {
    return this.getVideos({ unit });
  },

  /**
   * 取得推薦影片（依單元 + 觀念關鍵字）
   * 供錯題推薦與學習推薦使用
   */
  async getRecommendedVideos(unit, concept) {
    const search = concept ? `${unit} ${concept}` : unit;
    return this.searchVideos(search);
  },

  /** 強制清除 cache（切換 Provider 後呼叫） */
  clearCache() { ApiCache.clear(); },

  /** 執行期切換 Provider（開發用） */
  setProvider(p) { VideoApiConfig.PROVIDER = p; this.clearCache(); },
};

// ----------------------------------------------------------------
// 9. 觀看紀錄管理
// ----------------------------------------------------------------
const WatchRecord = {
  _KEY: 'edumath_watch_records',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this._KEY) || '{}'); } catch { return {}; }
  },

  get(videoId) {
    return this.getAll()[videoId] || null;
  },

  update(videoId, progress) {
    const all = this.getAll();
    const prev = all[videoId] || {};
    all[videoId] = {
      videoId,
      progress: Math.max(prev.progress || 0, Math.min(100, Math.round(progress))),
      lastWatchedAt: new Date().toISOString(),
      completed: progress >= 90,
    };
    localStorage.setItem(this._KEY, JSON.stringify(all));
    // 讓 cache 失效，下次取得影片時重新注入 watch status
    ApiCache.clear();
  },

  markComplete(videoId) {
    this.update(videoId, 100);
  },

  isCompleted(videoId) {
    const r = this.get(videoId);
    return r ? r.completed : false;
  },
};
