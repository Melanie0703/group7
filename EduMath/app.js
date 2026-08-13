// ============================================================
// EduMath AI — 主應用程式邏輯 (app.js)
// ============================================================

// ---------- 全域狀態 ----------
let currentUnit = null;
let currentVideo = null;
let quizMode = null;
let quizCount = 0;
let quizQuestions = [];
let quizIndex = 0;
let quizResults = [];
let quizStartTime = null;
let answered = false;
let errorViewUnit = null; // 錯題紀錄篩選

// ---------- 頁面切換 ----------
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }
}

// ---------- Toast 提示 ----------
function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ---------- Modal ----------
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ============================================================
// 首頁 — 渲染六大單元
// ============================================================
function renderHome() {
  const grid = document.getElementById('unit-grid');
  const progress = Storage.getProgress();
  grid.innerHTML = UNITS.map(u => {
    const p = progress[u.id] || { correct:0, total:0 };
    const pct = p.total > 0 ? Math.round(p.correct / p.total * 100) : 0;
    const pctBar = p.total > 0 ? `<div style="margin-top:8px;height:4px;background:#D6EAF8;border-radius:2px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:#4A90D9;border-radius:2px;"></div></div><div style="font-size:0.72rem;color:#7f8c8d;margin-top:3px;">${pct}% 正確率</div>` : '';
    return `<div class="unit-card" onclick="selectUnit('${u.id}')">
      <div class="unit-icon">${u.icon}</div>
      <div class="unit-info">
        <h3>${u.name}</h3>
        <p>${u.desc}</p>
        ${pctBar}
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// 單元頁
// ============================================================
function selectUnit(unitId) {
  currentUnit = UNITS.find(u => u.id === unitId);
  if (!currentUnit) return;
  document.getElementById('unit-page-title').textContent = currentUnit.icon + ' ' + currentUnit.name;
  document.getElementById('unit-page-subtitle').textContent = currentUnit.desc;
  showPage('unit');
}

// ============================================================
// 影片頁
// ============================================================
function showVideoPage() {
  if (!currentUnit) return;
  document.getElementById('video-page-title').textContent = '🎬 ' + currentUnit.name + '｜教學影片';
  renderVideoCategories();
  showPage('video');
}

function renderVideoCategories() {
  const categories = VIDEO_DATA[currentUnit.id] || [];
  const watched = Storage.getWatched();
  const container = document.getElementById('video-categories');

  container.innerHTML = categories.map(cat => `
    <div class="video-category">
      <div class="category-label">📂 ${cat.category}</div>
      <div class="video-list">
        ${cat.videos.map(v => {
          const isWatched = watched.includes(v.id);
          return `<div class="video-card" onclick="openVideo('${v.id}')">
            <div class="video-thumb">
              <div class="play-btn">▶</div>
              ${isWatched ? '<div class="video-watched-badge">✓ 已觀看</div>' : ''}
            </div>
            <div class="video-info">
              <h4>${v.title}</h4>
              <p>${v.desc}</p>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `).join('');
}

function openVideo(videoId) {
  // 找到影片資料
  const categories = VIDEO_DATA[currentUnit.id] || [];
  let found = null;
  for (const cat of categories) {
    found = cat.videos.find(v => v.id === videoId);
    if (found) break;
  }
  if (!found) return;

  currentVideo = found;
  document.getElementById('player-video-title').textContent = found.title;
  document.getElementById('player-title').textContent = found.title;
  document.getElementById('player-desc').textContent = found.desc;
  document.getElementById('player-keypoints').innerHTML = `
    <h4>📌 本影片重點</h4>
    <ul>${found.keypoints.map(kp => `<li>${kp}</li>`).join('')}</ul>
  `;
  showPage('videoplayer');
}

function markVideoWatched() {
  if (!currentVideo) return;
  Storage.markWatched(currentVideo.id);
  showToast('✅ 已標記為觀看！');
  // 更新播放頁按鈕
  const btn = document.querySelector('#page-videoplayer button[onclick="markVideoWatched()"]');
  if (btn) { btn.textContent = '✓ 已觀看'; btn.style.background = '#27AE60'; }
}

// ============================================================
// AI 助教頁
// ============================================================
function showAIPage() {
  if (!currentUnit) return;
  AI_CONTEXT.unit = currentUnit.id;
  AI_CONTEXT.hintStage = {};
  AI_CONTEXT.lastQuestion = null;

  // 渲染快捷按鈕
  const quickBtns = AI_QUICK_QUESTIONS[currentUnit.id] || [];
  // 加入錯題中最常犯的觀念問題（若有錯題）
  const errors = Storage.getErrors().filter(e => e.unit === currentUnit.name && !e.learned);
  const conceptCount = {};
  errors.forEach(e => { const c = e.concept||''; if(c) conceptCount[c] = (conceptCount[c]||0)+1; });
  const topErrConcept = Object.entries(conceptCount).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const extraBtns = topErrConcept
    ? [`請幫我解釋「${topErrConcept}」的觀念`]
    : [];

  document.getElementById('ai-quick-btns').innerHTML = [...quickBtns, ...extraBtns]
    .map(q => `<button class="quick-btn" onclick="sendQuickQuestion('${q.replace(/'/g,'&#39;')}')">${q}</button>`)
    .join('');

  // 清空訊息並歡迎
  document.getElementById('ai-messages').innerHTML = '';
  appendAIMessage(AI_RESPONSES.greet(currentUnit.id), 'ai');

  // 若有錯題觀念，AI 自動提示
  if (topErrConcept) {
    setTimeout(() => {
      appendAIMessage(`💡 我注意到你在「**${topErrConcept}**」這個觀念上曾經答錯。\n\n你想先從這個觀念開始討論嗎？點上方的按鈕，或直接輸入問題！`, 'ai');
    }, 1000);
  }

  showPage('ai');
}

function appendAIMessage(text, role) {
  const container = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = 'msg ' + role;

  const avatar = role === 'ai' ? '🤖' : '🧑‍🎓';
  // 簡單 markdown：**bold**, 換行
  const formatted = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  div.innerHTML = `<div class="msg-avatar">${avatar}</div><div class="msg-bubble">${formatted}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function sendQuickQuestion(q) {
  document.getElementById('ai-input').value = q;
  sendAIMessage();
}

function sendAIMessage() {
  const input = document.getElementById('ai-input');
  const msg = input.value.trim();
  if (!msg) return;

  appendAIMessage(msg, 'user');
  input.value = '';

  // 顯示 typing indicator
  const container = document.getElementById('ai-messages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'msg ai';
  typingDiv.id = 'ai-typing';
  typingDiv.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;

  // 模擬延遲
  setTimeout(() => {
    const typing = document.getElementById('ai-typing');
    if (typing) typing.remove();
    const response = getAIResponse(msg, AI_CONTEXT.unit);
    appendAIMessage(response, 'ai');
  }, 800 + Math.random() * 600);
}

// ============================================================
// 測驗模式選擇
// ============================================================
function showQuizModePage() {
  if (!currentUnit) return;
  // 重置模式選擇
  ['easy','medium','hard','mixed'].forEach(m => {
    document.getElementById('mode-' + m)?.classList.remove('selected');
  });
  document.getElementById('count-section').style.display = 'none';
  quizMode = null;
  quizCount = 0;
  showPage('quizmode');
}

function selectMode(mode) {
  quizMode = mode;
  ['easy','medium','hard','mixed'].forEach(m => {
    document.getElementById('mode-' + m)?.classList.remove('selected');
  });
  document.getElementById('mode-' + mode)?.classList.add('selected');

  // 顯示題數選擇
  document.getElementById('count-section').style.display = 'block';
  const grid = document.getElementById('count-grid');
  grid.innerHTML = [8,16,24].map(n =>
    `<button class="count-btn" id="cnt-${n}" onclick="selectCount(${n})">${n} 題</button>`
  ).join('');

  const ratioInfo = document.getElementById('mixed-ratio-info');
  if (mode === 'mixed') {
    ratioInfo.style.display = 'block';
    ratioInfo.innerHTML = `<strong>比例：簡單 62.5%：中等 25%：困難 12.5%</strong><br>8題=5:2:1　16題=10:4:2　24題=15:6:3`;
  } else {
    ratioInfo.style.display = 'none';
  }
}

function selectCount(n) {
  quizCount = n;
  document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('cnt-' + n)?.classList.add('selected');

  setTimeout(() => startQuiz(), 300);
}

// ============================================================
// 開始測驗
// ============================================================
async function startQuiz() {
  if (!currentUnit || !quizMode || !quizCount) return;

  // 顯示載入提示
  showToast('⏳ 正在準備題目…', 4000);

  // 優先嘗試 AI 動態出題，失敗時自動 fallback 至靜態題庫
  quizQuestions = (typeof buildAIQuizQuestions === 'function')
    ? await buildAIQuizQuestions(currentUnit.id, quizMode, quizCount)
    : buildQuizQuestions(currentUnit.id, quizMode, quizCount);

  if (quizQuestions.length === 0) {
    showToast('⚠️ 題庫題目不足，請稍後再試');
    return;
  }

  quizIndex = 0;
  quizResults = [];
  quizSelections = new Array(quizQuestions.length).fill(null);
  quizStartTime = Date.now();
  answered = false;

  renderQuestion();
  showPage('quiz');
}

// 靜態抽題演算法（保留供 legacy 相容；主流程已改用 buildAIQuizQuestions）
function buildQuizQuestions(unitId, mode, total) {
  return (typeof _buildStaticQuizQuestions === 'function')
    ? _buildStaticQuizQuestions(unitId, mode, total)
    : [];
}

function sample(arr, n) {
  return (typeof _sampleQuestions === 'function')
    ? _sampleQuestions(arr, n)
    : arr.slice(0, n);
}

function shuffle(arr) {
  return (typeof _shuffleQuestions === 'function')
    ? _shuffleQuestions(arr)
    : arr;
}

// ============================================================
// 渲染題目（全部作答後才對答案）
// quizSelections[i] = 學生選擇的答案（未作答為 null）
// ============================================================
let quizSelections = [];   // 每題學生的選擇

function renderQuestion() {
  const q = quizQuestions[quizIndex];
  answered = (quizSelections[quizIndex] !== null && quizSelections[quizIndex] !== undefined);

  // 更新標頭
  document.getElementById('q-current').textContent = quizIndex + 1;
  document.getElementById('q-total').textContent = quizQuestions.length;

  // 題號導覽點
  const navDots = document.getElementById('q-nav-dots');
  if (navDots) {
    navDots.innerHTML = quizQuestions.map((_, i) => {
      const sel = quizSelections[i];
      const isCurrent = i === quizIndex;
      let bg = sel ? 'var(--primary)' : 'var(--border)';
      let border = isCurrent ? '2px solid var(--text)' : '2px solid transparent';
      return `<button onclick="jumpToQuestion(${i})" style="width:28px;height:28px;border-radius:50%;background:${bg};border:${border};color:${sel ? '#fff' : 'var(--muted)'};font-size:0.72rem;font-weight:700;cursor:pointer;transition:all 0.15s;line-height:1;" title="第${i+1}題${sel?'（已作答）':'（未作答）'}">${i+1}</button>`;
    }).join('');
  }

  // 進度條（已作答題數）
  const answeredCount = quizSelections.filter(s => s !== null && s !== undefined).length;
  const pct = (answeredCount / quizQuestions.length) * 100;
  document.getElementById('q-progress-fill').style.width = pct + '%';

  // 難度標籤
  const diff = q._diff || q.difficulty;
  const badge = document.getElementById('q-diff-badge');
  badge.className = 'diff-badge diff-' + diff;
  badge.textContent = diff === 'easy' ? '簡單' : diff === 'medium' ? '中等' : '困難';

  // 題目
  document.getElementById('q-text').textContent = q.question;

  // 清除回饋（作答中不顯示對錯）
  const fb = document.getElementById('q-feedback');
  fb.className = 'answer-feedback';
  fb.innerHTML = '';

  // 選項（還原成可點擊狀態，但若已選擇則標示）
  const optsList = document.getElementById('q-options');
  const prevSel = quizSelections[quizIndex];
  optsList.innerHTML = q.options.map((opt, i) => {
    const letter = String.fromCharCode(65 + i);
    const isSelected = prevSel === opt;
    return `<li class="option-item${isSelected ? ' selected' : ''}" onclick="selectOption(this, '${opt.replace(/'/g,"\\'")}')">
      <span class="option-label">${letter}</span>
      <span>${opt}</span>
    </li>`;
  }).join('');

  // 更新導航按鈕
  updateQuizNavBtn();
}

// 更新「下一題 / 完成測驗」按鈕
function updateQuizNavBtn() {
  const btn = document.getElementById('q-next-btn');
  const answeredCount = quizSelections.filter(s => s !== null && s !== undefined).length;
  const allAnswered = answeredCount === quizQuestions.length;
  const isLast = quizIndex + 1 >= quizQuestions.length;

  if (allAnswered) {
    // 所有題都已作答，無論在哪一題都顯示「查看測驗結果」
    btn.disabled = false;
    btn.textContent = '📊 查看測驗結果';
  } else {
    const sel = quizSelections[quizIndex];
    btn.disabled = !sel;
    if (isLast) {
      // 最後一題但還有未答題
      const unansweredCount = quizQuestions.length - answeredCount;
      btn.textContent = `還有 ${unansweredCount} 題未作答`;
    } else {
      btn.textContent = '下一題 →';
    }
  }
}

function selectOption(el, selectedAnswer) {
  // 記錄選擇（可以重複點擊更改）
  quizSelections[quizIndex] = selectedAnswer;

  // 更新選項視覺
  document.querySelectorAll('.option-item').forEach(item => {
    item.classList.remove('selected');
    const text = item.querySelector('span:last-child').textContent;
    if (text === selectedAnswer) item.classList.add('selected');
  });

  // 更新按鈕
  updateQuizNavBtn();
}

function nextQuestion() {
  const allAnswered = quizSelections.filter(s => s !== null && s !== undefined).length === quizQuestions.length;

  if (allAnswered) {
    // 全部作答完畢，進入結果頁（無論目前在哪一題）
    submitAllAnswers();
    return;
  }

  // 移動到下一題（若已是最後一題但還有未答題，找第一題未答的）
  if (quizIndex + 1 < quizQuestions.length) {
    quizIndex++;
  } else {
    // 找第一題未作答的
    const firstUnanswered = quizSelections.findIndex(s => s === null || s === undefined);
    if (firstUnanswered >= 0) quizIndex = firstUnanswered;
  }
  renderQuestion();
  window.scrollTo(0, 0);
}

// 跳到指定題號
function jumpToQuestion(idx) {
  quizIndex = idx;
  renderQuestion();
  window.scrollTo(0, 0);
}

// 全部作答後統一對答案、儲存錯題
function submitAllAnswers() {
  quizResults = [];
  quizQuestions.forEach((q, i) => {
    const selected = quizSelections[i] || '';
    const isCorrect = selected === q.answer;
    quizResults.push({
      question: q,
      selected,
      correct: isCorrect,
      concept: q.concept,
    });
    if (!isCorrect) {
      Storage.addError({
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswer: selected,
        correctAnswer: q.answer,
        unit: q.unit,
        difficulty: q._diff || q.difficulty,
        concept: q.concept,
        explanation: q.explanation,
        similarQuestion: q.similarQuestion,
        date: new Date().toLocaleDateString('zh-TW'),
        aiAnalysis: `你選了「${selected}」，但正確答案是「${q.answer}」。${q.explanation}`,
      });
    }
  });
  finishQuiz();
}

// ============================================================
// 測驗結束
// ============================================================
function finishQuiz() {
  const elapsed = Math.round((Date.now() - quizStartTime) / 1000);
  const totalQ = quizResults.length;
  const correctN = quizResults.filter(r => r.correct).length;
  const wrongN = totalQ - correctN;
  const pct = Math.round(correctN / totalQ * 100);
  const score = pct;

  // 儲存本次題目摘要到歷史（用於 AI 去重）
  Storage.addQuizHistory(
    quizQuestions.map(q => ({
      id: q.id,
      question: q.question ? q.question.substring(0, 80) : '',
      unit: q.unit || currentUnit.name,
      difficulty: q._diff || q.difficulty || quizMode,
    }))
  );

  // 更新進度
  Storage.updateProgress(currentUnit.id, correctN, totalQ);
  Storage.addHistory({
    unit: currentUnit.name,
    mode: quizMode,
    total: totalQ,
    correct: correctN,
    score,
    date: new Date().toLocaleDateString('zh-TW'),
    elapsed,
  });

  // 渲染結果頁
  document.getElementById('r-score').textContent = score;
  document.getElementById('r-correct').textContent = correctN;
  document.getElementById('r-wrong').textContent = wrongN;
  document.getElementById('r-pct').textContent = pct + '%';
  document.getElementById('r-unit').textContent = currentUnit.name;
  document.getElementById('r-mode').textContent = { easy:'簡單', medium:'中等', hard:'困難', mixed:'綜合' }[quizMode] || quizMode;
  document.getElementById('r-count').textContent = totalQ + ' 題';
  document.getElementById('r-date').textContent = new Date().toLocaleDateString('zh-TW');
  document.getElementById('r-time').textContent = formatTime(elapsed);

  const msgs = [
    score >= 90 ? '🌟 太厲害了！你已經精通這個單元！' :
    score >= 70 ? '👍 表現很好！繼續努力會更棒！' :
    score >= 50 ? '💪 有進步空間！複習後再來挑戰！' :
    '📚 需要多多練習！先看教學影片吧！'
  ];
  document.getElementById('r-msg').textContent = msgs[0];

  // 隱藏 AI 分析框
  document.getElementById('ai-analysis-box').style.display = 'none';

  // 渲染逐題解析
  renderQuizReview();

  showPage('result');
}

// 結果頁：逐題解析
function renderQuizReview() {
  const container = document.getElementById('quiz-review-list');
  if (!container) return;
  container.innerHTML = quizResults.map((r, i) => {
    const q = r.question;
    const diff = q._diff || q.difficulty;
    const diffLabel = diff === 'easy' ? '簡單' : diff === 'medium' ? '中等' : '困難';
    const diffClass = 'diff-' + diff;
    return `<div style="background:var(--card);border-radius:12px;padding:18px;margin-bottom:12px;box-shadow:var(--shadow);border-left:4px solid ${r.correct ? 'var(--success)' : 'var(--danger)'};">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px;">
        <span style="font-size:0.85rem;font-weight:700;color:var(--muted);">第 ${i+1} 題</span>
        <div style="display:flex;gap:6px;align-items:center;">
          <span class="diff-badge ${diffClass}" style="font-size:0.72rem;">${diffLabel}</span>
          <span style="font-size:0.85rem;font-weight:700;color:${r.correct ? 'var(--success)' : 'var(--danger)'};">
            ${r.correct ? '✅ 答對' : '❌ 答錯'}
          </span>
        </div>
      </div>
      <div style="font-size:0.95rem;font-weight:600;color:var(--text);margin-bottom:10px;">${q.question}</div>
      <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px;">
        ${q.options.map(opt => {
          const isCorrect = opt === q.answer;
          const isSelected = opt === r.selected;
          let style = 'border-radius:8px;padding:7px 12px;font-size:0.88rem;';
          if (isCorrect) style += 'background:#D5F5E3;border:1.5px solid var(--success);';
          else if (isSelected && !isCorrect) style += 'background:#FADBD8;border:1.5px solid var(--danger);';
          else style += 'background:var(--bg);border:1.5px solid var(--border);';
          const mark = isCorrect ? ' ✓' : (isSelected && !isCorrect ? ' ✗' : '');
          return `<div style="${style}">${opt}${mark}</div>`;
        }).join('')}
      </div>
      ${!r.correct ? `<div style="font-size:0.83rem;color:var(--muted);margin-bottom:4px;">你的答案：<span style="color:var(--danger);font-weight:700;">${r.selected || '未作答'}</span>　正確答案：<span style="color:var(--success);font-weight:700;">${q.answer}</span></div>` : ''}
      <div style="background:var(--primary-light);border-radius:8px;padding:10px 12px;font-size:0.85rem;line-height:1.6;border-left:3px solid var(--primary);">
        <strong style="color:var(--primary);">📌 ${q.concept}</strong><br>${q.explanation}
      </div>
      ${q.similarQuestion ? `<div style="font-size:0.82rem;color:var(--muted);margin-top:6px;">📝 類似題：${q.similarQuestion}</div>` : ''}
    </div>`;
  }).join('');
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} 分 ${s} 秒` : `${s} 秒`;
}

function showWrongReview() {
  showErrorBook(currentUnit ? currentUnit.name : null, true);
}

async function showAIAnalysis() {
  const box = document.getElementById('ai-analysis-box');
  if (box.style.display === 'none') {
    const analysis = getQuizAIAnalysis(quizResults, currentUnit.name);
    box.innerHTML = `<strong>🤖 AI 測驗分析</strong><br><br>` +
      analysis.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    box.style.display = 'block';

    // 取得推薦影片（影片 API 整合）
    const wrongConcepts = [...new Set(quizResults.filter(r=>!r.correct).map(r=>r.concept).filter(Boolean))];
    if (wrongConcepts.length > 0 && typeof videoApi !== 'undefined') {
      const topConcept = wrongConcepts[0];
      const res = await videoApi.getRecommendedVideos(currentUnit.name, topConcept);
      if (res.ok && res.data.length > 0) {
        const recHtml = `
          <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px;">
            <div style="font-weight:700;color:var(--primary);margin-bottom:8px;">🎬 推薦複習影片</div>
            ${res.data.slice(0,3).map(v=>`
              <div onclick="openVideoPlayer && openVideoPlayer('${v.id}')" style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:#fff;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;margin-bottom:6px;transition:border 0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
                <span style="font-size:1.3rem;">🎬</span>
                <div style="flex:1;">
                  <div style="font-size:0.88rem;font-weight:700;">${v.title}</div>
                  <div style="font-size:0.76rem;color:var(--muted);">${v.unit}｜${v.duration||''}</div>
                </div>
                <span style="color:var(--primary);">▶</span>
              </div>
            `).join('')}
          </div>`;
        box.insertAdjacentHTML('beforeend', recHtml);
      }
    }

    box.scrollIntoView({ behavior: 'smooth' });
  } else {
    box.style.display = 'none';
  }
}

function retryQuiz() {
  showQuizModePage();
}

// ============================================================
// 錯題紀錄
// ============================================================

// 渲染錯題 AI 統計摘要（依目前篩選單元）
function renderErrorAnalysis() {
  const box = document.getElementById('error-analysis-box');
  if (!box) return;

  const allErrors = Storage.getErrors();
  const unitErrors = errorViewUnit ? allErrors.filter(e => e.unit === errorViewUnit) : allErrors;

  if (unitErrors.length === 0) {
    box.style.display = 'none';
    return;
  }

  // 統計各觀念的錯誤次數
  const conceptCount = {};
  unitErrors.forEach(e => {
    const c = e.concept || '其他';
    conceptCount[c] = (conceptCount[c] || 0) + (e.count || 1);
  });

  const topConcepts = Object.entries(conceptCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const totalMistakes = unitErrors.length;
  const learnedCount = unitErrors.filter(e => e.learned).length;
  const topConcept = topConcepts[0]?.[0];
  const topCount = topConcepts[0]?.[1] || 0;
  const topPct = Math.round((topCount / totalMistakes) * 100);

  // 單元名稱標題
  const unitTitle = errorViewUnit || '全部單元';

  box.style.display = 'block';
  box.innerHTML = `
    <div style="background:var(--primary-light);border-radius:12px;padding:18px;margin-bottom:16px;border-left:4px solid var(--primary);">
      <div style="font-weight:800;color:var(--primary);font-size:1rem;margin-bottom:10px;">🤖 AI 錯誤統計分析｜${unitTitle}</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
        <div style="text-align:center;background:#fff;border-radius:10px;padding:10px 18px;">
          <div style="font-size:1.6rem;font-weight:800;color:var(--danger);">${totalMistakes}</div>
          <div style="font-size:0.75rem;color:var(--muted);">錯題總數</div>
        </div>
        <div style="text-align:center;background:#fff;border-radius:10px;padding:10px 18px;">
          <div style="font-size:1.6rem;font-weight:800;color:var(--success);">${learnedCount}</div>
          <div style="font-size:0.75rem;color:var(--muted);">已學會</div>
        </div>
        <div style="text-align:center;background:#fff;border-radius:10px;padding:10px 18px;">
          <div style="font-size:1.6rem;font-weight:800;color:var(--warning);">${totalMistakes - learnedCount}</div>
          <div style="font-size:0.75rem;color:var(--muted);">待複習</div>
        </div>
      </div>
      ${topConcept ? `
      <div style="font-size:0.88rem;color:var(--text);margin-bottom:10px;">
        📊 近 ${totalMistakes} 題錯誤中，有 <strong>${topPct}%</strong> 是「<strong>${topConcept}</strong>」相關錯誤。
      </div>
      <div style="font-size:0.85rem;color:var(--muted);margin-bottom:12px;">
        <strong>最常錯的觀念：</strong>
        ${topConcepts.map(([c, n]) => `<span style="background:#fff;border-radius:8px;padding:3px 10px;margin:2px;display:inline-block;border:1.5px solid var(--border);">${c} <strong style="color:var(--danger);">${n}</strong>次</span>`).join('')}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="small-btn primary" onclick="executeErrorRecVideoRec()"
          style="display:inline-flex;align-items:center;gap:6px;">🎬 複習${unitTitle}影片</button>
        <button class="small-btn outline" onclick="showAIFromError()"
          style="display:inline-flex;align-items:center;gap:6px;">🤖 查看AI講解</button>
        <button class="small-btn outline" onclick="executeErrPractice()"
          style="display:inline-flex;align-items:center;gap:6px;">📝 做5題基礎練習</button>
      </div>
      ` : ''}
    </div>
  `;
}

// 錯題推薦影片
function executeErrorRecVideoRec() {
  const unit = errorViewUnit
    ? UNITS.find(u => u.name === errorViewUnit)
    : currentUnit;
  if (!unit) { showToast('請先選擇單元'); return; }
  currentUnit = unit;
  showVideoPage();
}

// 錯題推薦做5題基礎練習
function executeErrPractice() {
  const unit = errorViewUnit ? UNITS.find(u => u.name === errorViewUnit) : currentUnit;
  if (!unit) { showToast('請先選擇單元'); return; }
  currentUnit = unit;
  quizMode = 'easy';
  quizCount = 8;
  startQuiz();
}

// 從錯題頁進入AI助教（確保 currentUnit 已設定）
function showAIFromError() {
  const unit = errorViewUnit ? UNITS.find(u => u.name === errorViewUnit) : currentUnit;
  if (!unit) { showToast('請先選擇單元'); return; }
  currentUnit = unit;
  showAIPage();
}

// fromResult: 若為 true，返回按鈕指向結果頁
function showErrorBook(filterUnit, fromResult) {
  errorViewUnit = filterUnit || (currentUnit ? currentUnit.name : null);

  // 根據來源設定返回按鈕目標
  const backBtn = document.getElementById('errorbook-back-btn');
  if (backBtn) {
    if (fromResult) {
      backBtn.setAttribute('onclick', "showPage('result')");
      backBtn.textContent = '← 返回測驗結果';
    } else {
      backBtn.setAttribute('onclick', "showPage('unit')");
      backBtn.textContent = '← 返回單元';
    }
  }

  // 篩選按鈕
  const filterRow = document.getElementById('error-filter-row');
  const allErrors = Storage.getErrors();
  const unitNames = [...new Set(allErrors.map(e => e.unit))].filter(Boolean);

  filterRow.innerHTML = [
    `<button class="small-btn ${!errorViewUnit ? 'primary' : 'outline'}" onclick="filterErrors(null)">全部 (${allErrors.length})</button>`,
    ...unitNames.map(u => {
      const cnt = allErrors.filter(e => e.unit === u).length;
      return `<button class="small-btn ${errorViewUnit===u ? 'primary' : 'outline'}" onclick="filterErrors('${u}')">${u} (${cnt})</button>`;
    })
  ].join('');

  renderErrorAnalysis();
  renderErrorList();
  showPage('errorbook');
}

function filterErrors(unit) {
  errorViewUnit = unit;
  // 更新按鈕
  const allErrors = Storage.getErrors();
  const filterRow = document.getElementById('error-filter-row');
  const unitNames = [...new Set(allErrors.map(e => e.unit))].filter(Boolean);
  filterRow.innerHTML = [
    `<button class="small-btn ${!unit ? 'primary' : 'outline'}" onclick="filterErrors(null)">全部 (${allErrors.length})</button>`,
    ...unitNames.map(u => {
      const cnt = allErrors.filter(e => e.unit === u).length;
      return `<button class="small-btn ${unit===u ? 'primary' : 'outline'}" onclick="filterErrors('${u}')">${u} (${cnt})</button>`;
    })
  ].join('');
  renderErrorAnalysis();
  renderErrorList();
}

function renderErrorList() {
  let errors = Storage.getErrors();
  if (errorViewUnit) errors = errors.filter(e => e.unit === errorViewUnit);

  const list = document.getElementById('error-list');
  if (errors.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🎉</div><p>沒有錯題紀錄！繼續保持！</p></div>`;
    return;
  }

  list.innerHTML = errors.map((e, idx) => {
    const diffClass = `tag-${e.difficulty}`;
    const diffLabel = e.difficulty === 'easy' ? '簡單' : e.difficulty === 'medium' ? '中等' : '困難';
    return `<div class="error-card ${e.learned ? 'learned' : ''}" id="ecard-${idx}">
      <div class="error-card-header">
        <div class="error-card-title">${e.question}</div>
        <div class="error-card-meta">
          <span class="tag tag-unit">${e.unit||''}</span>
          <span class="tag ${diffClass}">${diffLabel}</span>
          ${e.learned ? '<span class="tag tag-learned">✓ 已學會</span>' : ''}
        </div>
      </div>
      <div class="error-answer-row">
        我的答案：<span class="wrong-ans">${e.userAnswer}</span>　
        正確答案：<span class="correct-ans">${e.correctAnswer}</span>　
        日期：${e.date||''}
      </div>
      <div class="error-actions">
        <button class="small-btn primary" onclick="toggleExplanation(${idx})">📖 查看解析</button>
        <button class="small-btn outline" onclick="showQuestionModal(${idx})">🔍 詳細分析</button>
        <button class="small-btn danger-outline" onclick="retryErrorQuestion(${idx})">🔄 重新挑戰</button>
        ${!e.learned ? `<button class="small-btn success" onclick="markLearned(${idx})">✅ 已學會</button>` : ''}
      </div>
      <div class="error-explanation" id="exp-${idx}">
        <strong>📌 觀念：</strong> ${e.concept||''}<br>
        <strong>解析：</strong> ${e.explanation||''}<br>
        <strong>🤖 AI 分析：</strong> ${e.aiAnalysis||''}<br>
        ${e.similarQuestion ? `<strong>📝 類似題：</strong> ${e.similarQuestion}` : ''}
      </div>
    </div>`;
  }).join('');
}

function toggleExplanation(idx) {
  const el = document.getElementById('exp-' + idx);
  el.classList.toggle('show');
}

function showQuestionModal(idx) {
  const errors = Storage.getErrors();
  if (errorViewUnit) {
    const filtered = errors.filter(e => e.unit === errorViewUnit);
    if (!filtered[idx]) return;
    showModalData(filtered[idx]);
  } else {
    if (!errors[idx]) return;
    showModalData(errors[idx]);
  }
}

function showModalData(e) {
  document.getElementById('modal-concept').textContent = e.concept || '';
  document.getElementById('modal-question').textContent = e.question;
  document.getElementById('modal-answer').textContent = '正確答案：' + e.correctAnswer;
  document.getElementById('modal-explanation').textContent = e.explanation || '';
  document.getElementById('modal-ai-analysis').textContent = e.aiAnalysis || '你選了「' + e.userAnswer + '」，正確答案是「' + e.correctAnswer + '」。' + (e.explanation||'');
  document.getElementById('modal-similar').textContent = e.similarQuestion || '暫無類似題目';
  document.getElementById('modal-explain').classList.add('active');
}

function markLearned(idx) {
  const errors = Storage.getErrors();
  let e;
  if (errorViewUnit) {
    const filtered = errors.filter(err => err.unit === errorViewUnit);
    e = filtered[idx];
  } else {
    e = errors[idx];
  }
  if (e) {
    Storage.markLearned(e.questionId, true);
    showToast('✅ 已標記為學會！');
    renderErrorAnalysis();
    renderErrorList();
  }
}

function retryErrorQuestion(idx) {
  const errors = Storage.getErrors();
  let e;
  if (errorViewUnit) {
    const filtered = errors.filter(err => err.unit === errorViewUnit);
    e = filtered[idx];
  } else {
    e = errors[idx];
  }
  if (!e) return;

  // 找到對應的單元並進入測驗
  const unit = UNITS.find(u => u.name === e.unit);
  if (unit) {
    currentUnit = unit;
    // 直接建立一個只含這題的測驗
    const qId = e.questionId;
    const unitBank = QUESTION_BANK[unit.id];
    let found = null;
    if (unitBank) {
      for (const diff of ['easy','medium','hard']) {
        found = (unitBank[diff]||[]).find(q => q.id === qId);
        if (found) { found = {...found, _diff: diff}; break; }
      }
    }
    if (!found) {
      // 從 error 重建題目
      found = {
        id: e.questionId,
        unit: e.unit,
        difficulty: e.difficulty,
        _diff: e.difficulty,
        question: e.question,
        options: e.options || [],
        answer: e.correctAnswer,
        explanation: e.explanation || '',
        concept: e.concept || '',
        similarQuestion: e.similarQuestion || '',
      };
    }
    quizQuestions = [found];
    quizIndex = 0;
    quizResults = [];
    quizSelections = [null];   // ← Bug 修正：重置選擇陣列
    quizMode = e.difficulty;
    quizCount = 1;
    quizStartTime = Date.now();
    answered = false;
    renderQuestion();
    showPage('quiz');
  }
}

// ============================================================
// 學習進度頁
// ============================================================
function renderProgress() {
  const progress = Storage.getProgress();
  const container = document.getElementById('progress-units');

  // 計算總體統計
  let totalCorrect = 0, totalAnswered = 0;
  UNITS.forEach(u => {
    const p = progress[u.id] || { correct:0, total:0 };
    totalCorrect += p.correct;
    totalAnswered += p.total;
  });
  const overallPct = totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0;

  // 找出最弱單元
  let weakUnit = null, weakPct = 101;
  UNITS.forEach(u => {
    const p = progress[u.id] || { correct:0, total:0 };
    if (p.total > 0) {
      const pct = Math.round(p.correct / p.total * 100);
      if (pct < weakPct) { weakPct = pct; weakUnit = u; }
    }
  });

  // 整體摘要
  const summaryHtml = totalAnswered > 0 ? `
    <div style="background:var(--card);border-radius:12px;padding:16px;margin-bottom:20px;box-shadow:var(--shadow);display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
      <div style="flex:1;min-width:200px;">
        <div style="font-size:0.82rem;color:var(--muted);margin-bottom:4px;">整體正確率</div>
        <div style="height:12px;background:var(--border);border-radius:6px;overflow:hidden;">
          <div style="width:${overallPct}%;height:100%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:6px;transition:width 0.8s;"></div>
        </div>
        <div style="font-size:0.8rem;color:var(--muted);margin-top:4px;">${totalCorrect} / ${totalAnswered} 題 = ${overallPct}%</div>
      </div>
      <div style="text-align:center;min-width:80px;">
        <div style="font-size:2rem;font-weight:900;color:var(--primary);">${overallPct}%</div>
        <div style="font-size:0.75rem;color:var(--muted);">整體正確率</div>
      </div>
      ${weakUnit ? `<div style="font-size:0.82rem;background:var(--primary-light);border-radius:8px;padding:8px 12px;border-left:3px solid var(--warning);">
        ⚠️ 需加強：<strong>${weakUnit.name}</strong>（${weakPct}%）
      </div>` : ''}
    </div>
  ` : '';

  container.innerHTML = summaryHtml + UNITS.map(u => {
    const p = progress[u.id] || { correct:0, total:0 };
    const pct = p.total > 0 ? Math.round(p.correct / p.total * 100) : 0;
    const barColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : pct > 0 ? 'var(--danger)' : 'var(--border)';
    const statusLabel = p.total === 0 ? '<span style="font-size:0.75rem;color:var(--muted);">尚未測驗</span>' :
      pct >= 80 ? '<span style="font-size:0.75rem;color:var(--success);font-weight:700;">✓ 掌握良好</span>' :
      pct >= 60 ? '<span style="font-size:0.75rem;color:var(--warning);font-weight:700;">△ 可以更好</span>' :
      '<span style="font-size:0.75rem;color:var(--danger);font-weight:700;">⚠ 需要加強</span>';
    return `<div class="progress-unit" style="cursor:pointer;" onclick="selectUnit('${u.id}')">
      <div class="progress-unit-header">
        <h4>${u.icon} ${u.name}</h4>
        <div style="display:flex;align-items:center;gap:8px;">
          ${statusLabel}
          <span class="pct" style="color:${barColor};">${pct}%</span>
        </div>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width:${pct}%;background:${barColor};"></div>
      </div>
      <div class="progress-stats-row">
        <span class="progress-stat">總答題：<span>${p.total}</span></span>
        <span class="progress-stat">答對：<span>${p.correct}</span></span>
        <span class="progress-stat">答錯：<span>${p.total - p.correct}</span></span>
      </div>
    </div>`;
  }).join('');

  renderHistory();
  renderRecommendations(progress);
}

// 渲染最近測驗歷程
function renderHistory() {
  const section = document.getElementById('history-section');
  const list = document.getElementById('history-list');
  if (!section || !list) return;

  const history = Storage.getHistory();
  if (history.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  const modeLabel = { easy:'簡單', medium:'中等', hard:'困難', mixed:'綜合' };
  list.innerHTML = history.slice(0, 8).map(h => {
    const pct = Math.round(h.correct / h.total * 100);
    const barColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)';
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg);border-radius:10px;margin-bottom:8px;border:1.5px solid var(--border);">
      <div style="flex:1;">
        <div style="font-size:0.9rem;font-weight:700;color:var(--text);">${h.unit} <span style="font-size:0.75rem;font-weight:400;color:var(--muted);">${modeLabel[h.mode]||h.mode}模式</span></div>
        <div style="font-size:0.78rem;color:var(--muted);margin-top:2px;">${h.date} ｜ ${h.total}題 ｜ 花費 ${formatTime(h.elapsed||0)}</div>
      </div>
      <div style="text-align:center;min-width:52px;">
        <div style="font-size:1.3rem;font-weight:900;color:${barColor};">${pct}%</div>
        <div style="font-size:0.7rem;color:var(--muted);">${h.correct}/${h.total}</div>
      </div>
    </div>`;
  }).join('');
}

async function renderRecommendations(progress) {
  const recList = document.getElementById('rec-list');
  const recs = [];

  UNITS.forEach(u => {
    const p = progress[u.id] || { correct:0, total:0 };
    const pct = p.total > 0 ? Math.round(p.correct / p.total * 100) : -1;

    if (pct === -1 || pct < 60) {
      recs.push({ icon:'🎬', title:`複習${u.name}影片`, desc:'觀看基礎教學影片，建立概念', unit:u.id, action:'video' });
      recs.push({ icon:'📝', title:`${u.name}簡單測驗`, desc:'先從簡單題型開始練習', unit:u.id, action:'easy' });
    } else if (pct < 80) {
      recs.push({ icon:'📝', title:`${u.name}中等測驗`, desc:'挑戰中等難度題目', unit:u.id, action:'medium' });
      recs.push({ icon:'❌', title:`複習${u.name}錯題`, desc:'針對錯誤觀念加強', unit:u.id, action:'error' });
    } else {
      recs.push({ icon:'🔥', title:`${u.name}困難測驗`, desc:'已掌握基礎，挑戰高難度！', unit:u.id, action:'hard' });
    }
  });

  // 只顯示前5條
  const top5 = recs.slice(0, 5);
  recList.innerHTML = top5.map(r => `
    <div class="rec-item" onclick="executeRec('${r.unit}','${r.action}')">
      <span class="rec-item-icon">${r.icon}</span>
      <div class="rec-item-info">
        <h5>${r.title}</h5>
        <p>${r.desc}</p>
      </div>
      <span style="color:var(--primary);">→</span>
    </div>
  `).join('');
}

function executeRec(unitId, action) {
  currentUnit = UNITS.find(u => u.id === unitId);
  if (!currentUnit) return;

  if (action === 'video') {
    showVideoPage();
  } else if (action === 'error') {
    showErrorBook(currentUnit.name);
  } else {
    // 快速進入測驗
    quizMode = action;
    quizCount = 8;
    startQuiz();
  }
}

// 離開測驗確認
function confirmQuitQuiz() {
  const answeredCount = quizSelections.filter(s => s !== null && s !== undefined).length;
  if (answeredCount === 0) {
    // 還沒作答，直接離開
    showPage('quizmode');
    return;
  }
  const confirmed = window.confirm(`你已作答 ${answeredCount} / ${quizQuestions.length} 題。\n確定要離開測驗嗎？作答中的紀錄將不會儲存。`);
  if (confirmed) {
    showPage('quizmode');
  }
}

// ============================================================
// 初始化
// ============================================================
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }
  if (pageId === 'progress') renderProgress();
  if (pageId === 'home') renderHome();
}

// 覆蓋 showPage 加入側效
window.showPage = navigateTo;

function init() {
  renderHome();
  navigateTo('home');
}

// 啟動
init();
