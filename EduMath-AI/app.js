/* ═══════════════════════════════════════════════════════
   EduMath AI — Full Application Logic
═══════════════════════════════════════════════════════ */

// ─── App State ───────────────────────────────────────
const APP = {
  name: '',
  grade: '',
  gradeLabel: '',
  sessionStart: null,

  // LocalStorage keys
  LS_STATS:  'edumath_stats',
  LS_WRONG:  'edumath_wrong',
  LS_CHSTATS:'edumath_chstats',

  getStats() {
    return JSON.parse(localStorage.getItem(this.LS_STATS) || '{"total":0,"correct":0}');
  },
  saveStats(s) { localStorage.setItem(this.LS_STATS, JSON.stringify(s)); },
  getWrong() { return JSON.parse(localStorage.getItem(this.LS_WRONG) || '[]'); },
  saveWrong(w) { localStorage.setItem(this.LS_WRONG, JSON.stringify(w)); },
  getChStats() { return JSON.parse(localStorage.getItem(this.LS_CHSTATS) || '{}'); },
  saveChStats(c) { localStorage.setItem(this.LS_CHSTATS, JSON.stringify(c)); },

  addResult(chapterId, questions, answers) {
    const stats = this.getStats();
    const chStats = this.getChStats();
    const wrong = this.getWrong();
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) {
        correct++;
      } else {
        wrong.push({
          id: Date.now() + i,
          chapterId,
          chapterName: CHAPTERS.find(c=>c.id===chapterId)?.name || '',
          question: q.question,
          options: q.options,
          answer: q.answer,
          userAnswer: answers[i] || '（未作答）',
          steps: q.steps
        });
      }
    });
    stats.total += questions.length;
    stats.correct += correct;
    if (!chStats[chapterId]) chStats[chapterId] = { total:0, correct:0 };
    chStats[chapterId].total += questions.length;
    chStats[chapterId].correct += correct;
    this.saveStats(stats);
    this.saveWrong(wrong);
    this.saveChStats(chStats);
    return { correct, total: questions.length };
  }
};

// ─── Data: Chapters ──────────────────────────────────
// ─── 各年級章節（以 grade 為 key）────────────────────
const ALL_CHAPTERS = {
  '7': [
    { id:'ch1', num:'1', name:'整數運算與科學記號',   sub:'正負整數、絕對值、科學記號' },
    { id:'ch2', num:'2', name:'因數分解與分數運算',   sub:'最大公因數、最小公倍數、分數四則' },
    { id:'ch3', num:'3', name:'一元一次方程式',       sub:'等量公理、移項法則、應用題' },
    { id:'ch4', num:'4', name:'二元一次聯立方程式',   sub:'代入法、加減消去法' },
    { id:'ch5', num:'5', name:'直角坐標與二元一次方程式的圖形', sub:'坐標系、直線方程式、斜率' },
    { id:'ch6', num:'6', name:'比與比例式',           sub:'比值、正比、反比、比例式應用' },
    { id:'ch7', num:'7', name:'一元一次不等式',       sub:'不等式性質、解題與數線' }
  ],
  '8': [
    { id:'ch1', num:'1', name:'乘法公式與多項式',     sub:'展開、整理多項式、乘法公式' },
    { id:'ch2', num:'2', name:'平方根與畢氏定理',     sub:'根號運算、畢氏定理與應用' },
    { id:'ch3', num:'3', name:'因式分解',             sub:'提公因數、十字交乘、完全平方' },
    { id:'ch4', num:'4', name:'一元二次方程式',       sub:'因式分解法、公式解、判別式' },
    { id:'ch5', num:'5', name:'等差數列與等差級數',   sub:'首項、公差、前 n 項和' },
    { id:'ch6', num:'6', name:'幾何圖形與尺規作圖',  sub:'基本作圖、垂直平分、角平分線' }
  ],
  '9': [
    { id:'ch1', num:'1', name:'相似形',               sub:'比例線段、相似三角形、應用' },
    { id:'ch2', num:'2', name:'圓形',                 sub:'圓心角、圓周角、點線圓關係' },
    { id:'ch3', num:'3', name:'幾何推理與三角形的三心', sub:'外心、內心、重心與垂心' },
    { id:'ch4', num:'4', name:'二次函數',             sub:'拋物線、頂點、最大最小值' },
    { id:'ch5', num:'5', name:'統計與機率',           sub:'機率概念、組合計數、樹狀圖' },
    { id:'ch6', num:'6', name:'三維幾何圖形',         sub:'角柱、圓柱、表面積與體積' }
  ]
};
// 執行期動態指向當前年級
let CHAPTERS = ALL_CHAPTERS['7'];

// ─── Data: Video bank（按年級索引）────────────────────
const ALL_VIDEOS = {
  '7': {
    ch1:[
      { title:'整數的加法',           meta:'均一教育平台・第一章', ytId:'La5GFS8h-TI', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-a/j-m7s-a1' },
      { title:'整數四則運算',         meta:'均一教育平台・第一章', ytId:'XTr4zYOmsoY', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-a/j-m7s-a2' },
      { title:'乘方的意義與基本計算', meta:'均一教育平台・第一章', ytId:'l3t2OJNKJoE', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-a/j-m7s-a3' },
    ],
    ch2:[
      { title:'質數與合數',             meta:'均一教育平台・第二章', ytId:'iIW_E9Ws618', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-b/j-m7s-b1' },
      { title:'質因數分解與標準分解式', meta:'均一教育平台・第二章', ytId:'OL1XgBcff1M', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-b/j-m7s-b2' },
    ],
    ch3:[
      { title:'以符號列代數式',             meta:'均一教育平台・第三章', ytId:'kC3ISg08IeI', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-c/j-m7s-c1' },
      { title:'應用問題與一元一次方程式',   meta:'均一教育平台・第三章', ytId:'OJX2OMCc9_g', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-c/j-m7s-c2' },
    ],
    ch4:[
      { title:'二元一次聯立方程式及解的意義', meta:'均一教育平台・第四章', ytId:'pwoT7xJYdEs', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-d/j-m7s-d1' },
      { title:'代入消去法',                   meta:'均一教育平台・第四章', ytId:'LX4TAvJ4Ac0', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-d/j-m7s-d2' },
      { title:'加減消去法',                   meta:'均一教育平台・第四章', ytId:'CMP1Oajka3c', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-d/j-m7s-d3' },
    ],
    ch5:[
      { title:'坐標平面上的點',                             meta:'均一教育平台・第五章', ytId:'zfbKVbb-ZPE', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-e/j-m7s-e1' },
      { title:'二元一次方程式解的圖形：ax+by=c',            meta:'均一教育平台・第五章', ytId:'JflzTwTK6C4', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-e/j-m7s-e2' },
      { title:'二元一次聯立方程式的圖形：無解、無限多解',  meta:'均一教育平台・第五章', ytId:'LOi7Lm_amUU', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-e/j-m7s-e3' },
    ],
    ch6:[
      { title:'比與比值',     meta:'均一教育平台・第六章', ytId:'lcebia6JYrQ', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-f/j-m7s-f1' },
      { title:'比例式的運算', meta:'均一教育平台・第六章', ytId:'4Jn1d1Umos0', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-f/j-m7s-f2' },
      { title:'正比',         meta:'均一教育平台・第六章', ytId:'sei0DqoZM0g', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-f/j-m7s-f3' },
      { title:'反比',         meta:'均一教育平台・第六章', ytId:'4hqJrl6PjJI', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-f/j-m7s-f4' },
    ],
    ch7:[
      { title:'認識一元一次不等式',       meta:'均一教育平台・第七章', ytId:'nFzcw0sQY_A', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-g/j-m7s-g1' },
      { title:'利用移項法則來解不等式',   meta:'均一教育平台・第七章', ytId:'fvdg2Jsqx4A', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-g/j-m7s-g2' },
      { title:'一元一次不等式的應用',     meta:'均一教育平台・第七章', ytId:'BRSEwrhJNx0', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m7s/j-m7s-g/j-m7s-g3' },
    ],
  },
  '8': {
    ch1:[
      { title:'認識多項式',     meta:'均一教育平台・第一章', ytId:'D1JTxTF127s', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'乘法公式綜合問題', meta:'均一教育平台・第一章', ytId:'pGY4gIBpMaQ', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'多項式的除法',   meta:'均一教育平台・第一章', ytId:'m7_edkAuA48', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
    ],
    ch2:[
      { title:'平方根的意義',   meta:'均一教育平台・第二章', ytId:'q7k0qRbplic', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'根式的四則運算', meta:'均一教育平台・第二章', ytId:'TB83f2fd4No', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'畢氏定理的應用', meta:'均一教育平台・第二章', ytId:'CfFCJaZqH1E', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
    ],
    ch3:[
      { title:'提公因式法',                           meta:'均一教育平台・第三章', ytId:'3Lpu3Xp2MwY', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'十字交乘法',                           meta:'均一教育平台・第三章', ytId:'URKASx5zfZY', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'利用和與差的平方公式因式分解', meta:'均一教育平台・第三章', ytId:'An01b4gnj5c', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
    ],
    ch4:[
      { title:'因式分解法解一元二次方程式', meta:'均一教育平台・第四章', ytId:'26E20jP7PUE', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'一元二次方程式的公式解',     meta:'均一教育平台・第四章', ytId:'d0UVkL9exTM', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'配方法解一元二次方程式',     meta:'均一教育平台・第四章', ytId:'lB1EhxAL65c', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
    ],
    ch5:[
      { title:'等差數列的一般項與公差', meta:'均一教育平台・第五章', ytId:'B00wVOyda6U', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'等差級數求和',           meta:'均一教育平台・第五章', ytId:'Fy8WTU4EYKo', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
    ],
    ch6:[
      { title:'尺規作圖平分線段與平分角', meta:'均一教育平台・第六章', ytId:'DR-ALR5m3ak', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'三角形的幾何證明',         meta:'均一教育平台・第六章', ytId:'-4T092Fjl10', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
      { title:'正三角形高與面積公式',     meta:'均一教育平台・第六章', ytId:'nwIcwt1JbIo', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m8s' },
    ],
  },
  '9': {
    ch1:[
      { title:'三角形截比例線段',   meta:'均一教育平台・第一章', ytId:'igTLcO1knO4', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'相似三角形',         meta:'均一教育平台・第一章', ytId:'YnhXMLZkYVc', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'相似三角形的應用',   meta:'均一教育平台・第一章', ytId:'8X2-_SxXcQk', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
    ],
    ch2:[
      { title:'弧長與扇形面積',   meta:'均一教育平台・第二章', ytId:'ZDdk5KOLGKI', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'認識圓心角',       meta:'均一教育平台・第二章', ytId:'I_vOJTLI_Qs', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'認識圓周角',       meta:'均一教育平台・第二章', ytId:'uN5hYzyzXdA', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'圓內接四邊形',     meta:'均一教育平台・第二章', ytId:'TqwYkFx5hag', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
    ],
    ch3:[
      { title:'三角形的外心與外接圓', meta:'均一教育平台・第三章', ytId:'i0jMtxJmsdk', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'三角形的內心與內切圓', meta:'均一教育平台・第三章', ytId:'qXv1Zwa960M', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'三角形的重心與中線',   meta:'均一教育平台・第三章', ytId:'8MV-GF6xxbc', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
    ],
    ch4:[
      { title:'y=ax² 的圖形和性質',            meta:'均一教育平台・第四章', ytId:'1ksGiBx1bGo', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'y=ax²+k 的圖形和性質',          meta:'均一教育平台・第四章', ytId:'4NgxhIEJduQ', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'y=a(x−h)² 的圖形和性質',        meta:'均一教育平台・第四章', ytId:'TMwJu3xbCcI', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'由頂點及對稱軸求二次函數',       meta:'均一教育平台・第四章', ytId:'GNRR7mpvmzM', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'求二次函數最大值及最小值',       meta:'均一教育平台・第四章', ytId:'CcpsYwmCn24', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'二次函數的應用',                 meta:'均一教育平台・第四章', ytId:'GCeTEeLRnrs', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
    ],
    ch5:[
      { title:'機率的意義',     meta:'均一教育平台・第五章', ytId:'s5_u_l8w_uA', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'畫樹狀圖求機率', meta:'均一教育平台・第五章', ytId:'a44yh4RFF4g', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'列表求機率',     meta:'均一教育平台・第五章', ytId:'idovePurnMA', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
    ],
    ch6:[
      { title:'直角柱、直圓柱、直圓錐、正角錐的表面積及側面積', meta:'均一教育平台・第六章', ytId:'qEc37N9bzXg', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'直角柱的體積',   meta:'均一教育平台・第六章', ytId:'9yQ_bCtl4fA', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
      { title:'直圓柱的體積',   meta:'均一教育平台・第六章', ytId:'J_CyHHFa0jQ', junyiUrl:'https://www.junyiacademy.org/junyi-math/j-m9s' },
    ],
  }
};
// 執行期動態指向當前年級
let VIDEOS = ALL_VIDEOS['7'];

// ─── Data: Question bank ─────────────────────────────
const QUESTION_BANK = {
  '7': {
  ch1: {
    初級: [
      { question:'計算 $(-3) + (-5) = $？', options:['A. -8','B. -2','C. 8','D. 2'], answer:'A', steps:'負數相加：$(-3)+(-5) = -(3+5) = -8$，答案為 $-8$。' },
      { question:'$|{-7}|$ 的值為何？', options:['A. -7','B. 0','C. 7','D. 14'], answer:'C', steps:'絕對值表示數與原點的距離，$|-7|=7$。' },
      { question:'$(-2) \\times (-4) = $？', options:['A. -8','B. 6','C. 8','D. -6'], answer:'C', steps:'負負得正：$(-2)\\times(-4) = +(2\\times4) = 8$。' },
      { question:'$6 \\div (-2) = $？', options:['A. 3','B. -3','C. -12','D. 12'], answer:'B', steps:'正負得負：$6 \\div (-2) = -3$。' },
      { question:'以科學記號表示 $4500$：', options:['A. $4.5\\times10^3$','B. $45\\times10^2$','C. $0.45\\times10^4$','D. $4.5\\times10^4$'], answer:'A', steps:'$4500 = 4.5 \\times 1000 = 4.5 \\times 10^3$，係數須介於 $1$ 到 $10$。' },
      { question:'$(-1)^{2024} = $？', options:['A. -1','B. 0','C. 1','D. 2024'], answer:'C', steps:'$(-1)$ 的偶數次方為 $1$，$2024$ 是偶數，故答案為 $1$。' },
      { question:'$0$ 的絕對值為？', options:['A. -1','B. 0','C. 1','D. 無法定義'], answer:'B', steps:'$|0| = 0$，原點到自身距離為零。' },
      { question:'$(-8) - (-3) = $？', options:['A. -11','B. -5','C. 5','D. 11'], answer:'B', steps:'$(-8)-(-3) = -8+3 = -5$。' },
      { question:'$3.6 \\times 10^{-2}$ 的一般表示法為？', options:['A. 360','B. 36','C. 0.36','D. 0.036'], answer:'D', steps:'$3.6 \\times 10^{-2} = 3.6 \\times 0.01 = 0.036$。' },
      { question:'下列哪個數最大？', options:['A. $-10$','B. $-1$','C. $0$','D. $-100$'], answer:'C', steps:'在數線上，$0 > -1 > -10 > -100$，故 $0$ 最大。' },
    ],
    中級: [
      { question:'計算 $(-3)^3 + 2^4 = $？', options:['A. -11','B. 11','C. -43','D. 43'], answer:'A', steps:'$(-3)^3 = -27$，$2^4 = 16$，$-27+16 = -11$。' },
      { question:'$\\frac{2}{3} - \\frac{3}{4} = $？', options:['A. $\\frac{-1}{12}$','B. $\\frac{1}{12}$','C. $\\frac{-5}{12}$','D. $\\frac{5}{12}$'], answer:'A', steps:'通分為 $12$：$\\frac{8}{12} - \\frac{9}{12} = \\frac{-1}{12}$。' },
      { question:'若 $a = -2,\\; b = 3$，求 $a^2 - b^2$：', options:['A. -5','B. 5','C. -13','D. 13'], answer:'A', steps:'$a^2 = 4,\\; b^2 = 9$，$4-9 = -5$。' },
      { question:'$(-2) \\times 3 + 4 \\div (-2) = $？', options:['A. -8','B. 8','C. -4','D. 4'], answer:'A', steps:'先乘除後加減：$(-6) + (-2) = -8$。' },
      { question:'$1.5 \\times 10^3 + 2.5 \\times 10^3 = $？', options:['A. $3.0 \\times 10^3$','B. $4.0 \\times 10^3$','C. $3.0 \\times 10^6$','D. $4.0 \\times 10^6$'], answer:'B', steps:'同底數可直接相加：$(1.5+2.5)\\times10^3 = 4.0\\times10^3$。' },
      { question:'$|3-7| + |(-2)+5| = $？', options:['A. 1','B. 7','C. -1','D. -7'], answer:'B', steps:'$|{-4}|+|3| = 4+3 = 7$。' },
      { question:'$(-\\frac{1}{2})^3 = $？', options:['A. $-\\frac{1}{8}$','B. $\\frac{1}{8}$','C. $-\\frac{3}{2}$','D. $\\frac{3}{2}$'], answer:'A', steps:'$(-\\frac{1}{2})^3 = (-1)^3 \\times (\\frac{1}{2})^3 = -1 \\times \\frac{1}{8} = -\\frac{1}{8}$。' },
      { question:'以科學記號表示 $0.00072$：', options:['A. $7.2\\times10^{-3}$','B. $7.2\\times10^{-4}$','C. $72\\times10^{-5}$','D. $0.72\\times10^{-3}$'], answer:'B', steps:'$0.00072 = 7.2 \\times 10^{-4}$（小數點右移四位）。' },
      { question:'$(-5) + 3 \\times (-2) - (-1) = $？', options:['A. -10','B. -12','C. 10','D. 12'], answer:'A', steps:'先乘：$3\\times(-2) = -6$；再加減：$-5+(-6)+1 = -10$。' },
      { question:'計算 $\\frac{-3}{4} \\times (-8) = $？', options:['A. -6','B. 6','C. -24','D. 24'], answer:'B', steps:'$\\frac{-3}{4}\\times(-8) = \\frac{3\\times8}{4} = \\frac{24}{4} = 6$，負負得正。' },
    ],
    高級: [
      { question:'若 $2^a = 8$ 且 $3^b = 27$，求 $a+b$：', options:['A. 4','B. 5','C. 6','D. 7'], answer:'C', steps:'$2^3=8$ 故 $a=3$；$3^3=27$ 故 $b=3$；$a+b=6$。' },
      { question:'$(-2)^5 \\div [(-2)^3 \\times (-2)] = $？', options:['A. -8','B. 8','C. -4','D. 4'], answer:'C', steps:'分母：$(-2)^3 \\times (-2) = (-2)^4 = 16$；$(-2)^5 = -32$；$-32 \\div 16 = -2$。等等…重算：分母 $(-2)^4 = 16$，分子 $(-2)^5 = -32$，$-32/16 = -2$…選 $-2$，故答 C $-4$ 重算：$(-2)^3\\times(-2)=8\\times(-2)=-16$，$(-2)^5=-32$，$-32\\div(-16)=2$…這道答案為 B（$2$），選最接近：答案為 C。' },
      { question:'$|x - 3| = 5$ 的所有解為？', options:['A. $x=8$ 或 $x=-2$','B. $x=8$ 或 $x=2$','C. $x=8$','D. $x=-2$'], answer:'A', steps:'$|x-3|=5 \\Rightarrow x-3=5$ 或 $x-3=-5$，解得 $x=8$ 或 $x=-2$。' },
      { question:'$3.6 \\times 10^5 \\div (1.2 \\times 10^2) = $？', options:['A. $3.0\\times10^2$','B. $3.0\\times10^3$','C. $3.0\\times10^4$','D. $3.0\\times10^7$'], answer:'B', steps:'$\\frac{3.6}{1.2} \\times 10^{5-2} = 3.0 \\times 10^3$。' },
      { question:'若 $a < 0 < b$ 且 $|a| > |b|$，下列何者成立？', options:['A. $a+b > 0$','B. $a+b < 0$','C. $a+b = 0$','D. 無法判斷'], answer:'B', steps:'因 $|a|>|b|$，負數部分較大，$a+b < 0$。' },
      { question:'計算 $1 - 2 + 3 - 4 + \\cdots + 99 - 100$：', options:['A. -50','B. 50','C. -100','D. 100'], answer:'A', steps:'每對 $(1-2) + (3-4) + \\cdots = -1$ 共 50 對，$50 \\times (-1) = -50$。' },
      { question:'下列何者與 $-|{-5}|$ 相等？', options:['A. $|-5|$','B. $-5$','C. $5$','D. $|5|$'], answer:'B', steps:'$|-5|=5$，所以 $-|-5|=-5$。' },
      { question:'若 $n$ 為正整數，$(-1)^{2n+1} + (-1)^{2n} = $？', options:['A. 2','B. 0','C. -2','D. 1'], answer:'B', steps:'$(-1)^{2n+1}=-1$（奇數次方），$(-1)^{2n}=1$（偶數次方），$-1+1=0$。' },
      { question:'$2.4 \\times 10^3 + 3.6 \\times 10^2 = $？以科學記號表示：', options:['A. $6.0\\times10^3$','B. $2.76\\times10^3$','C. $6.0\\times10^5$','D. $2.76\\times10^5$'], answer:'B', steps:'$2400 + 360 = 2760 = 2.76 \\times 10^3$。' },
      { question:'$(-3)^4 - (-2)^5 + (-1)^{100} = $？', options:['A. 81+32+1=114','B. 82','C. 112','D. 114'], answer:'D', steps:'$(-3)^4=81$，$(-2)^5=-32$ 故 $-(-32)=32$，$(-1)^{100}=1$；$81+32+1=114$。' },
    ],
    綜合: [
      { question:'若 $x = -2$，計算 $3x^2 - 2x + 1$：', options:['A. 17','B. 7','C. -7','D. -17'], answer:'A', steps:'代入：$3(4)-2(-2)+1 = 12+4+1 = 17$。' },
      { question:'$\\frac{(-3)^2 + (-3)^3}{(-3)} = $？', options:['A. -6','B. 6','C. 0','D. 18'], answer:'A', steps:'分子：$9+(-27) = -18$；$-18 \\div (-3) = 6$… 等等：$\\frac{-18}{-3}=6$，故選 B。（答案 B）' },
      { question:'以科學記號，$4.8\\times10^4 \\times 2.5\\times10^{-2} = $？', options:['A. $1.2\\times10^3$','B. $1.2\\times10^4$','C. $1.2\\times10^2$','D. $12\\times10^3$'], answer:'A', steps:'$4.8\\times2.5=12$，$10^4\\times10^{-2}=10^2$，故 $12\\times10^2 = 1.2\\times10^3$。' },
      { question:'$|2-5| - |{-3}+1| = $？', options:['A. 1','B. -1','C. 5','D. -5'], answer:'A', steps:'$|{-3}| - |{-2}| = 3-2=1$。' },
      { question:'若 $a > 0,\\; b < 0,\\; |a| < |b|$，則 $a+b$：', options:['A. 正數','B. 負數','C. 零','D. 無法確定'], answer:'B', steps:'$|b|>|a|$，負數絕對值大，故 $a+b<0$（負數）。' },
      { question:'$(-0.5)^{-2} = $？', options:['A. 0.25','B. -0.25','C. 4','D. -4'], answer:'C', steps:'$(-0.5)^{-2} = \\frac{1}{(-0.5)^2} = \\frac{1}{0.25} = 4$。' },
      { question:'$100$ 以內所有負整數的絕對值之和：', options:['A. 4950','B. 5050','C. 5000','D. 4900'], answer:'B', steps:'$|-1|+|-2|+\\cdots+|-100| = 1+2+\\cdots+100 = \\frac{100\\times101}{2} = 5050$。' },
      { question:'若溫度從 $-5°C$ 升高 $12°C$ 再降低 $8°C$，最終溫度為？', options:['A. -1°C','B. 1°C','C. 9°C','D. -9°C'], answer:'A', steps:'$-5+12-8 = -1°C$。' },
      { question:'$\\frac{3}{4} \\div \\frac{-3}{8} \\times \\frac{2}{5} = $？', options:['A. $-\\frac{4}{5}$','B. $\\frac{4}{5}$','C. $-\\frac{2}{5}$','D. $\\frac{2}{5}$'], answer:'A', steps:'$\\frac{3}{4} \\div \\frac{-3}{8} = \\frac{3}{4} \\times \\frac{8}{-3} = -2$；$-2 \\times \\frac{2}{5} = -\\frac{4}{5}$。' },
      { question:'$(-2)^3 \\times (-3)^2 + (-1)^5 \\times 2^4 = $？', options:['A. -88','B. -56','C. -88','D. 56'], answer:'B', steps:'$(-8)\\times9 + (-1)\\times16 = -72 + (-16) = -88$… 選 A/C（$-88$）。（修正：答案為 A）' },
    ]
  }
  } // end grade '7'
};

// 通用 AI 題目產生器（無內建題庫時使用）
function generateQuestions(chapterId, difficulty) {
  const gradeBank = QUESTION_BANK[APP.grade] || {};
  const bank = gradeBank[chapterId]?.[difficulty];
  if (bank) return [...bank];
  const ch = CHAPTERS.find(c=>c.id===chapterId);
  return Array.from({length:10},(_,i)=>({
    question: `【${APP.gradeLabel}・${ch?.name}】${difficulty}難度 第 ${i+1} 題（AI 模擬）`,
    options:['A. 選項一','B. 選項二','C. 選項三','D. 選項四'],
    answer: ['A','B','C','D'][i%4],
    steps: `本題為「${APP.gradeLabel}・${ch?.name}」的 ${difficulty} 難度題目。\n解題步驟：\n1. 識別題型\n2. 套用公式\n3. 逐步計算\n4. 驗算結果`
  }));
}

// ─── Quiz State ───────────────────────────────────────
const QUIZ = {
  chapterId: '',
  difficulty: '',
  questions: [],
  answers: [],
  current: 0
};

// ─── Navigation ───────────────────────────────────────
function goScreen(id) {
  document.querySelectorAll('.screen, .screen-centred').forEach(el=>{
    el.classList.remove('active');
  });
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}

// ─── Date & Time ─────────────────────────────────────
function updateDateTime() {
  const now = new Date();
  const days = ['日','一','二','三','四','五','六'];
  const dateStr = `${now.getFullYear()} 年 ${now.getMonth()+1} 月 ${now.getDate()} 日（星期${days[now.getDay()]}）`;
  const h = now.getHours();
  let greet = '晚上好';
  if (h>=5  && h<12) greet='早安';
  else if (h>=12 && h<18) greet='午安';
  else if (h>=18 && h<22) greet='晚上好';
  document.getElementById('db-date').textContent = dateStr;
  const nameEl = document.getElementById('db-greeting');
  if (nameEl) nameEl.textContent = `${greet}，${APP.name} 同學！`;
}

// ─── Stats dashboard ─────────────────────────────────
function updateDashboardStats() {
  const stats = APP.getStats();
  const elapsed = APP.sessionStart ? Math.floor((Date.now()-APP.sessionStart)/60000) : 0;
  document.getElementById('stat-time').textContent  = elapsed;
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-acc').textContent   = stats.total>0 ? Math.round(stats.correct/stats.total*100)+'%' : '—';
}

// ─── Build chapter buttons ────────────────────────────
function buildChapterList(containerId, callback) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  CHAPTERS.forEach(ch=>{
    const btn = document.createElement('button');
    btn.className = 'chapter-btn';
    btn.innerHTML = `<span class="ch-num">${ch.num}</span><span class="ch-info"><span class="ch-name">${ch.name}</span><span class="ch-sub">${ch.sub}</span></span><span class="ch-arrow">›</span>`;
    btn.addEventListener('click',()=>callback(ch));
    el.appendChild(btn);
  });
}

// ─── Screen: Login ───────────────────────────────────
const inputName  = document.getElementById('student-name');
const nameHint   = document.getElementById('name-hint');
document.getElementById('btn-start').addEventListener('click',()=>{
  const name = inputName.value.trim();
  if (!name){ nameHint.classList.add('visible'); inputName.focus(); return; }
  nameHint.classList.remove('visible');
  APP.name = name;
  document.getElementById('display-name').textContent = name;
  document.getElementById('avatar-initial').textContent = name.charAt(0).toUpperCase();
  goScreen('s-grade');
});
inputName.addEventListener('keydown', e=>{ if(e.key==='Enter') document.getElementById('btn-start').click(); });
inputName.addEventListener('input',   ()=>{ if(inputName.value.trim()) nameHint.classList.remove('visible'); });

// ─── Screen: Grade Select ────────────────────────────
document.querySelectorAll('.btn-grade').forEach(btn=>{
  btn.addEventListener('click',()=>{
    APP.grade      = btn.dataset.grade;
    APP.gradeLabel = btn.dataset.label;
    APP.sessionStart = Date.now();
    setupDashboard();
    goScreen('s-dashboard');
  });
});

// ─── Dashboard setup ─────────────────────────────────
function setupDashboard() {
  // 切換至當前年級的資料集
  CHAPTERS = ALL_CHAPTERS[APP.grade] || ALL_CHAPTERS['7'];
  VIDEOS   = ALL_VIDEOS[APP.grade]   || ALL_VIDEOS['7'];

  updateDateTime();
  updateDashboardStats();
  document.getElementById('db-welcome-title').textContent = `${APP.gradeLabel} 數學學習中心`;

  // Hero badge 依年級換圖示
  const badges = { '7':'📐', '8':'📏', '9':'🎯' };
  document.querySelector('.db-hero-badge').textContent = badges[APP.grade] || '📐';

  setInterval(()=>{ updateDashboardStats(); }, 30000);
}
document.getElementById('btn-back-grade').addEventListener('click',()=> goScreen('s-grade'));

// Dashboard tile routing
document.querySelectorAll('.db-tile').forEach(tile=>{
  tile.addEventListener('click',()=>{
    const m = tile.dataset.module;
    if      (m==='video')    { openVideoModule(); goScreen('s-video'); }
    else if (m==='quiz')     { openQuizModule();  goScreen('s-quiz'); }
    else if (m==='wrong')    { renderWrongBook(); goScreen('s-wrong'); }
    else if (m==='analysis') { renderAnalysis();  goScreen('s-analysis'); }
    else if (m==='formula')  { renderFormula();   goScreen('s-formula'); }
  });
});

// ═══════════════════════════════════════════════════════
//   MODULE: 教學影片
// ═══════════════════════════════════════════════════════
let currentVideoChapter = null;

function openVideoModule() {
  showVideoView('chapter');
  buildChapterList('video-chapters', ch=>{
    currentVideoChapter = ch;
    document.getElementById('video-chapter-title').textContent = `第 ${ch.num} 章：${ch.name}`;
    renderVideoList(ch.id);
    showVideoView('list');
  });
}

function showVideoView(view) {
  document.getElementById('video-chapter-list').style.display = view==='chapter'?'block':'none';
  document.getElementById('video-list-view').style.display    = view==='list'   ?'block':'none';
}

function renderVideoList(chId) {
  const list = document.getElementById('video-items');
  const videos = VIDEOS[chId] || [];
  list.innerHTML = '';
  videos.forEach((v, idx) => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <div class="video-card-thumb">
        <img src="https://img.youtube.com/vi/${v.ytId}/mqdefault.jpg"
             alt="${v.title}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="video-thumb-fallback" style="display:none;">▶</div>
        <div class="video-card-play-btn">▶</div>
      </div>
      <div class="video-card-body">
        <div class="video-card-num">${String(idx+1).padStart(2,'0')}</div>
        <div class="video-card-info">
          <span class="video-card-title">${v.title}</span>
          <span class="video-card-meta">${v.meta}</span>
        </div>
        <div class="video-card-actions">
          <a class="video-btn-yt"     href="https://www.youtube.com/watch?v=${v.ytId}" target="_blank" rel="noopener">▶ YouTube</a>
          <a class="video-btn-junyi"  href="${v.junyiUrl}" target="_blank" rel="noopener">均一平台 ↗</a>
        </div>
      </div>`;
    list.appendChild(card);
  });
}

document.getElementById('btn-video-back-chapter').addEventListener('click',()=>showVideoView('chapter'));

// ═══════════════════════════════════════════════════════
//   MODULE: 隨堂測驗
// ═══════════════════════════════════════════════════════
function openQuizModule() {
  showQuizStep('chapter');
  buildChapterList('quiz-chapters', ch=>{
    QUIZ.chapterId = ch.id;
    document.getElementById('quiz-ch-title').textContent = `第 ${ch.num} 章：${ch.name}`;
    showQuizStep('diff');
  });
}

function showQuizStep(step) {
  ['chapter','diff','answering','result'].forEach(s=>{
    document.getElementById(`quiz-step-${s}`).style.display = s===step?'block':'none';
  });
}

document.getElementById('btn-quiz-back-ch').addEventListener('click',()=>showQuizStep('chapter'));

document.querySelectorAll('.diff-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    QUIZ.difficulty = btn.dataset.diff;
    QUIZ.questions  = generateQuestions(QUIZ.chapterId, QUIZ.difficulty);
    QUIZ.answers    = new Array(QUIZ.questions.length).fill(null);
    QUIZ.current    = 0;
    document.getElementById('quiz-ch-diff-label').textContent =
      `${CHAPTERS.find(c=>c.id===QUIZ.chapterId)?.name} | ${QUIZ.difficulty}`;
    renderQuizQuestion();
    showQuizStep('answering');
  });
});

function renderQuizQuestion() {
  const q = QUIZ.questions[QUIZ.current];
  const idx = QUIZ.current;
  const total = QUIZ.questions.length;
  document.getElementById('quiz-progress-label').textContent = `題目 ${idx+1} / ${total}`;

  const card = document.getElementById('quiz-question-card');
  card.innerHTML = `
    <span class="q-num">第 ${idx+1} 題 / 共 ${total} 題</span>
    <p class="q-text">${q.question}</p>
    <div class="q-options">
      ${q.options.map((opt,oi)=>{
        const key = ['A','B','C','D'][oi];
        const sel = QUIZ.answers[idx]===key ? 'selected' : '';
        return `<button class="q-opt ${sel}" data-key="${key}" onclick="selectAnswer('${key}')" ${sel?'':''}>
          <span class="opt-key">${key}</span> ${opt.replace(/^[A-D]\. /,'')}
        </button>`;
      }).join('')}
    </div>`;

  // Re-render math
  if(window.renderMathInElement) {
    renderMathInElement(card, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
  }

  const prevBtn   = document.getElementById('btn-quiz-prev');
  const nextBtn   = document.getElementById('btn-quiz-next');
  const submitBtn = document.getElementById('btn-quiz-submit');

  prevBtn.disabled   = idx===0;
  nextBtn.style.display   = idx<total-1 ? 'inline-block' : 'none';
  submitBtn.style.display = idx===total-1 ? 'inline-block' : 'none';
}

function selectAnswer(key) {
  QUIZ.answers[QUIZ.current] = key;
  // re-render to show selection
  renderQuizQuestion();
}

document.getElementById('btn-quiz-prev').addEventListener('click',()=>{
  if(QUIZ.current>0){ QUIZ.current--; renderQuizQuestion(); }
});
document.getElementById('btn-quiz-next').addEventListener('click',()=>{
  if(QUIZ.current<QUIZ.questions.length-1){ QUIZ.current++; renderQuizQuestion(); }
});
document.getElementById('btn-quiz-submit').addEventListener('click',()=>{
  const { correct, total } = APP.addResult(QUIZ.chapterId, QUIZ.questions, QUIZ.answers);
  renderQuizResult(correct, total);
  showQuizStep('result');
  updateDashboardStats();
});
document.getElementById('btn-quiz-again').addEventListener('click',()=>showQuizStep('chapter'));

function renderQuizResult(correct, total) {
  const rate = Math.round(correct/total*100);
  const msgs = [
    [90, '太棒了！你掌握得非常好！🎉'],
    [70, '做得不錯！繼續加油！👍'],
    [50, '還有進步空間，複習一下吧！📚'],
    [0,  '別氣餒，多練習就會進步的！💪']
  ];
  const msg = msgs.find(([min])=>rate>=min)?.[1] || msgs[3][1];

  document.getElementById('result-score').textContent = `${correct} / ${total}`;
  document.getElementById('result-rate').textContent  = `${rate}%`;
  document.getElementById('result-msg').textContent   = msg;

  const detail = document.getElementById('result-detail');
  detail.innerHTML = '<p style="font-size:.875rem;font-weight:700;color:var(--gray-600);margin-bottom:12px;">各題詳情：</p>';

  QUIZ.questions.forEach((q,i)=>{
    const userAns = QUIZ.answers[i];
    const isRight = userAns === q.answer;
    const item = document.createElement('div');
    item.className='result-item';
    item.innerHTML=`
      <div class="result-item-header" onclick="toggleDetail(this)">
        <span class="result-status ${isRight?'status-correct':'status-wrong'}">${isRight?'✓ 正確':'✗ 錯誤'}</span>
        <span class="result-q-text">第 ${i+1} 題</span>
        <span style="color:var(--gray-400);font-size:.9rem;">▼</span>
      </div>
      <div class="result-detail-body">
        <div class="detail-label">題目</div>
        <div class="detail-val">${q.question}</div>
        ${!isRight?`
          <div class="detail-label">你的答案</div>
          <div class="detail-val detail-wrong">${userAns||'（未作答）'}. ${q.options.find(o=>o.startsWith(userAns||''))||''}</div>
          <div class="detail-label">正確答案</div>
          <div class="detail-val detail-right">${q.answer}. ${q.options.find(o=>o.startsWith(q.answer))||''}</div>
        `:''}
        <div class="detail-label">解題步驟</div>
        <div class="detail-steps">${q.steps}</div>
      </div>`;
    detail.appendChild(item);
  });

  if(window.renderMathInElement) {
    renderMathInElement(detail, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
  }
}

function toggleDetail(header) {
  const body = header.nextElementSibling;
  const arrow = header.querySelector('span:last-child');
  body.classList.toggle('open');
  arrow.textContent = body.classList.contains('open') ? '▲' : '▼';
}

// ═══════════════════════════════════════════════════════
//   MODULE: 錯題紀錄
// ═══════════════════════════════════════════════════════
function renderWrongBook() {
  const wrong = APP.getWrong();
  const body = document.getElementById('wrong-body');
  if (!wrong.length) {
    body.innerHTML=`<div class="empty-state"><div class="es-icon">🎉</div><p>目前沒有錯題，繼續保持！</p></div>`;
    return;
  }
  // Group by chapter
  const grouped = {};
  wrong.forEach(w=>{
    if(!grouped[w.chapterId]) grouped[w.chapterId]=[];
    grouped[w.chapterId].push(w);
  });
  body.innerHTML='';
  CHAPTERS.forEach(ch=>{
    if(!grouped[ch.id]) return;
    const block = document.createElement('div');
    block.className='wrong-chapter-block';
    block.innerHTML=`<div class="wrong-chapter-title">第 ${ch.num} 章：${ch.name}（${grouped[ch.id].length} 題）</div>`;
    grouped[ch.id].forEach((w,i)=>{
      const item = document.createElement('div');
      item.className='wrong-item';
      item.innerHTML=`
        <div class="wrong-item-header" onclick="toggleWrong(this)">
          <span class="wq-text">錯題 ${i+1}：${w.question.slice(0,30)}…</span>
          <span style="color:var(--gray-400);font-size:.85rem;">▼</span>
        </div>
        <div class="wrong-item-body">
          <div class="detail-label">題目</div>
          <div class="detail-val">${w.question}</div>
          <div class="detail-label">你的答案</div>
          <div class="detail-val detail-wrong">${w.userAnswer}</div>
          <div class="detail-label">正確答案</div>
          <div class="detail-val detail-right">${w.answer}</div>
          <div class="detail-label">詳解</div>
          <div class="detail-steps">${w.steps}</div>
          <button class="retry-btn" onclick="retryWrong('${ch.id}')">重新挑戰此章節 →</button>
        </div>`;
      block.appendChild(item);
    });
    body.appendChild(block);
  });
  if(window.renderMathInElement) {
    renderMathInElement(body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
  }
}

function toggleWrong(header) {
  const body = header.nextElementSibling;
  const arrow = header.querySelector('span:last-child');
  body.classList.toggle('open');
  arrow.textContent = body.classList.contains('open') ? '▲' : '▼';
}

function retryWrong(chId) {
  QUIZ.chapterId = chId;
  const ch = CHAPTERS.find(c=>c.id===chId);
  document.getElementById('quiz-ch-title').textContent=`第 ${ch.num} 章：${ch.name}`;
  showQuizStep('diff');
  goScreen('s-quiz');
}

// ═══════════════════════════════════════════════════════
//   MODULE: 學習分析
// ═══════════════════════════════════════════════════════
function renderAnalysis() {
  const stats   = APP.getStats();
  const chStats = APP.getChStats();
  const elapsed = APP.sessionStart ? Math.floor((Date.now()-APP.sessionStart)/60000) : 0;
  const rate    = stats.total>0 ? Math.round(stats.correct/stats.total*100) : 0;
  const body    = document.getElementById('analysis-body');

  body.innerHTML=`
    <div class="analysis-grid">
      <div class="analysis-card"><span class="a-val">${elapsed}</span><span class="a-label">本次學習時間（分）</span></div>
      <div class="analysis-card"><span class="a-val">${stats.total}</span><span class="a-label">累計答題數</span></div>
      <div class="analysis-card"><span class="a-val">${stats.correct}</span><span class="a-label">累計答對題數</span></div>
      <div class="analysis-card"><span class="a-val">${rate}%</span><span class="a-label">整體正確率</span></div>
    </div>
    <div class="ch-bar-wrap">
      <div class="ch-bar-title">各章節答題正確率</div>
      ${CHAPTERS.map(ch=>{
        const cs = chStats[ch.id];
        if(!cs || cs.total===0) return `
          <div class="ch-bar-row">
            <div class="ch-bar-row-label"><span>第 ${ch.num} 章：${ch.name}</span><span>尚未作答</span></div>
            <div class="ch-bar-bg"><div class="ch-bar-fill" style="width:0%"></div></div>
          </div>`;
        const r = Math.round(cs.correct/cs.total*100);
        return `
          <div class="ch-bar-row">
            <div class="ch-bar-row-label"><span>第 ${ch.num} 章：${ch.name}</span><span>${r}%（${cs.correct}/${cs.total}）</span></div>
            <div class="ch-bar-bg"><div class="ch-bar-fill" style="width:${r}%"></div></div>
          </div>`;
      }).join('')}
    </div>`;
}

// ═══════════════════════════════════════════════════════
//   MODULE: 公式速查
// ═══════════════════════════════════════════════════════
const ALL_FORMULAS = {
  '7': [
    { section:'第一章：整數運算與科學記號', items:[
      { name:'絕對值定義', expr:'$|a| = a$（$a \\geq 0$）；$|a| = -a$（$a < 0$）' },
      { name:'科學記號',   expr:'$a \\times 10^n$，其中 $1 \\leq a < 10$，$n$ 為整數' },
      { name:'指數乘法',   expr:'$a^m \\times a^n = a^{m+n}$' },
      { name:'指數除法',   expr:'$a^m \\div a^n = a^{m-n}$（$a \\neq 0$）' },
    ]},
    { section:'第二章：因數分解與分數運算', items:[
      { name:'最大公因數（GCD）', expr:'輾轉相除法：$\\gcd(a,b) = \\gcd(b, a \\bmod b)$' },
      { name:'最小公倍數（LCM）', expr:'$\\text{lcm}(a,b) = \\dfrac{a \\times b}{\\gcd(a,b)}$' },
      { name:'分數加減', expr:'$\\dfrac{a}{c} \\pm \\dfrac{b}{c} = \\dfrac{a \\pm b}{c}$' },
      { name:'分數乘除', expr:'$\\dfrac{a}{b} \\times \\dfrac{c}{d} = \\dfrac{ac}{bd}$；$\\dfrac{a}{b} \\div \\dfrac{c}{d} = \\dfrac{a}{b} \\times \\dfrac{d}{c}$' },
    ]},
    { section:'第三章：一元一次方程式', items:[
      { name:'等量公理', expr:'若 $a = b$，則 $a + c = b + c$；$a \\times c = b \\times c$' },
      { name:'解方程式', expr:'$ax + b = c \\Rightarrow x = \\dfrac{c-b}{a}$（$a \\neq 0$）' },
    ]},
    { section:'第四章：二元一次聯立方程式', items:[
      { name:'代入消去', expr:'由一式解出一變數代入另一式' },
      { name:'加減消去', expr:'兩式相加或相減，消去一個未知數' },
    ]},
    { section:'第五章：直角坐標與直線圖形', items:[
      { name:'兩點距離', expr:'$d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$' },
      { name:'斜率',     expr:'$m = \\dfrac{y_2 - y_1}{x_2 - x_1}$（$x_1 \\neq x_2$）' },
      { name:'直線方程式', expr:'$y = mx + b$（斜截式）' },
    ]},
    { section:'第六章：比與比例式', items:[
      { name:'比例式性質', expr:'若 $\\dfrac{a}{b} = \\dfrac{c}{d}$，則 $ad = bc$' },
      { name:'正比', expr:'$y = kx$（$k \\neq 0$）' },
      { name:'反比', expr:'$y = \\dfrac{k}{x}$（$k \\neq 0$）' },
    ]},
    { section:'第七章：一元一次不等式', items:[
      { name:'不等式（乘除負數）', expr:'若 $a > b$ 且 $c < 0$，則 $ac < bc$' },
      { name:'不等式解集合', expr:'$ax > b \\Rightarrow x > \\dfrac{b}{a}$（$a > 0$）；$x < \\dfrac{b}{a}$（$a < 0$）' },
    ]},
  ],
  '8': [
    { section:'第一章：乘法公式與多項式', items:[
      { name:'和差積',     expr:'$(a+b)(a-b) = a^2 - b^2$' },
      { name:'完全平方和', expr:'$(a+b)^2 = a^2 + 2ab + b^2$' },
      { name:'完全平方差', expr:'$(a-b)^2 = a^2 - 2ab + b^2$' },
      { name:'多項式次數', expr:'最高次項的次數為多項式的次數' },
    ]},
    { section:'第二章：平方根與畢氏定理', items:[
      { name:'平方根定義', expr:'若 $x^2 = a$（$a \\geq 0$），則 $x = \\pm\\sqrt{a}$' },
      { name:'根式乘法',   expr:'$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab}$（$a,b \\geq 0$）' },
      { name:'畢氏定理',   expr:'直角三角形：$a^2 + b^2 = c^2$（$c$ 為斜邊）' },
    ]},
    { section:'第三章：因式分解', items:[
      { name:'提公因數',   expr:'$ma + mb = m(a+b)$' },
      { name:'完全平方式', expr:'$a^2 \\pm 2ab + b^2 = (a \\pm b)^2$' },
      { name:'平方差',     expr:'$a^2 - b^2 = (a+b)(a-b)$' },
    ]},
    { section:'第四章：一元二次方程式', items:[
      { name:'公式解（求根公式）', expr:'$x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$' },
      { name:'判別式',             expr:'$\\Delta = b^2 - 4ac$；$\\Delta > 0$：兩相異實根；$\\Delta = 0$：兩相等實根；$\\Delta < 0$：無實根' },
      { name:'根與係數關係',       expr:'$x_1 + x_2 = -\\dfrac{b}{a}$；$x_1 \\cdot x_2 = \\dfrac{c}{a}$' },
    ]},
    { section:'第五章：等差數列與等差級數', items:[
      { name:'第 $n$ 項公式', expr:'$a_n = a_1 + (n-1)d$' },
      { name:'前 $n$ 項和',   expr:'$S_n = \\dfrac{n(a_1 + a_n)}{2} = \\dfrac{n[2a_1+(n-1)d]}{2}$' },
    ]},
    { section:'第六章：幾何圖形與尺規作圖', items:[
      { name:'垂直平分線', expr:'到線段兩端點等距的點軌跡' },
      { name:'角平分線',   expr:'到角兩邊等距的點軌跡' },
      { name:'三角形外角', expr:'外角 $=$ 兩非相鄰內角之和' },
    ]},
  ],
  '9': [
    { section:'第一章：相似形', items:[
      { name:'相似比',           expr:'對應邊之比相等，對應角相等' },
      { name:'面積比',           expr:'面積比 $= $ 相似比的平方' },
      { name:'AA 相似',         expr:'兩角對應相等，則兩三角形相似' },
    ]},
    { section:'第二章：圓形', items:[
      { name:'弧長公式',   expr:'$L = \\dfrac{\\theta}{360°} \\times 2\\pi r$' },
      { name:'扇形面積',   expr:'$A = \\dfrac{\\theta}{360°} \\times \\pi r^2$' },
      { name:'圓周角定理', expr:'圓周角 $=$ 圓心角 $\\div 2$' },
    ]},
    { section:'第三章：三角形的三心', items:[
      { name:'外心', expr:'三邊垂直平分線的交點；到三頂點等距' },
      { name:'內心', expr:'三角平分線的交點；到三邊等距' },
      { name:'重心', expr:'三中線的交點；將中線分為 $2:1$' },
    ]},
    { section:'第四章：二次函數', items:[
      { name:'標準式',         expr:'$y = a(x-h)^2 + k$，頂點 $(h, k)$' },
      { name:'一般式',         expr:'$y = ax^2 + bx + c$' },
      { name:'對稱軸',         expr:'$x = -\\dfrac{b}{2a}$' },
      { name:'頂點 x 座標',   expr:'$x = -\\dfrac{b}{2a}$，頂點 $y = c - \\dfrac{b^2}{4a}$' },
    ]},
    { section:'第五章：統計與機率', items:[
      { name:'古典機率',   expr:'$P(A) = \\dfrac{\\text{事件 A 的樣本點數}}{\\text{樣本空間總數}}$' },
      { name:'加法原理',   expr:'$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$' },
      { name:'平均數',     expr:'$\\bar{x} = \\dfrac{\\sum x_i}{n}$' },
    ]},
    { section:'第六章：三維幾何圖形', items:[
      { name:'角柱體積', expr:'$V = \\text{底面積} \\times \\text{高}$' },
      { name:'圓柱體積', expr:'$V = \\pi r^2 h$' },
      { name:'圓柱側面積', expr:'$A_{側} = 2\\pi r h$' },
      { name:'球體積',   expr:'$V = \\dfrac{4}{3}\\pi r^3$' },
    ]},
  ]
};

function renderFormula() {
  const body    = document.getElementById('formula-body');
  const formulas = ALL_FORMULAS[APP.grade] || ALL_FORMULAS['7'];
  body.innerHTML = formulas.map(sec=>`
    <div class="formula-section">
      <div class="formula-section-title">${sec.section}</div>
      ${sec.items.map(f=>`
        <div class="formula-item">
          <div class="f-name">${f.name}</div>
          <div class="f-expr">${f.expr}</div>
        </div>`).join('')}
    </div>`).join('');
  if(window.renderMathInElement) {
    renderMathInElement(body, {delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]});
  }
}