// ============================================================
// EduMath AI — AI 助教邏輯 (ai.js)
// 引導式回應系統，不直接給答案
// ============================================================

const AI_CONTEXT = {
  unit: null,
  hintStage: {}, // questionKey -> stage(0,1,2,3)
  lastQuestion: null,
};

// 快捷提問按鈕 (依單元)
const AI_QUICK_QUESTIONS = {
  similarity: ['相似三角形怎麼判斷？', '相似比怎麼算？', '比例線段題目我不會', '幫我出一道相似形練習題'],
  circle: ['圓周角定理怎麼用？', '弦長怎麼計算？', '切線長公式是什麼？', '幫我出一道圓形練習題'],
  geometry: ['三角形全等和相似有什麼差？', '幾何證明怎麼寫？', '平行四邊形有哪些性質？', '幫我出一道幾何練習題'],
  coordinate: ['兩點距離公式怎麼用？', '中點公式是什麼？', '斜率怎麼算？', '幫我出一道座標練習題'],
  quadratic: ['二次函數頂點怎麼求？', '對稱軸公式是什麼？', '開口方向怎麼判斷？', '幫我出一道二次函數練習題'],
  statistics: ['平均數、中位數、眾數有什麼差？', '機率公式是什麼？', '怎麼算古典機率？', '幫我出一道統計機率練習題'],
};

// AI 回應資料庫（模擬引導式對話）
const AI_RESPONSES = {
  // 通用引導
  greet(unit) {
    const names = { similarity:'相似形', circle:'圓形', geometry:'幾何與證明', coordinate:'幾何與座標', quadratic:'二次函數', statistics:'統計與機率' };
    return `嗨！我是你的 **${names[unit]||'數學'} AI 助教** 🤖\n\n我會一步一步引導你解題，不會直接告訴你答案，讓你自己想出來！\n\n你有什麼問題，或者想練習哪種題型呢？`;
  },

  similarity: {
    '相似三角形怎麼判斷': `判斷三角形相似有三種方法，我們一步一步來：

**先想想：** 你知道什麼資訊？是「角度」還是「邊長」？

📌 **三種相似條件：**
1. **AA（角角）**：兩組對應角相等 → 三角形相似
2. **SAS（邊角邊）**：兩邊成比例 + 夾角相等 → 三角形相似  
3. **SSS（邊邊邊）**：三邊都成比例 → 三角形相似

你遇到的題目給了什麼條件呢？告訴我，我幫你分析用哪種方法！`,
    '相似比怎麼算': `相似比的計算，我先問你一個問題：

**你知道相似比是「什麼比什麼」嗎？**

💡 提示：如果 △ABC ∼ △DEF，相似比是**對應邊**的比值。

例如：AB對應DE，BC對應EF，AC對應DF。

下一步思考：
- 如果 AB=6，DE=4，相似比是 6:4，化簡後是？

你算算看！`,
    '比例線段題目我不會': `比例線段題目先不用擔心，我們拆成小步驟：

**第一步：** 題目有沒有說「平行線」？
- 如果有平行線截線段，就用**基本比例定理**

**基本比例定理：**
若 DE // BC，則 AD/DB = AE/EC（或 AD/AB = AE/AC）

**你的題目條件是什麼？** 告訴我，我們一起分析！`,
  },

  circle: {
    '圓周角定理怎麼用': `圓周角定理是圓形最重要的定理，我幫你整理一下：

**先問你：** 你知道圓周角和圓心角的差別嗎？

📌 **關鍵公式：**
- 圓周角 = 圓心角 ÷ **2**
- 同弧上所有圓周角都**相等**
- 直徑對的圓周角 = **90°**

**練習看看：** 如果圓心角是 80°，圓周角是多少？
你算算，然後告訴我你的答案！`,
    '弦長怎麼計算': `弦長計算需要用到勾股定理，我問你幾個問題：

**首先：** 題目給了什麼？
A. 圓心到弦的距離（垂直距離）？
B. 圓心角？
C. 弧長？

**最常用的方法（A的情況）：**
設半徑 r，圓心到弦距離 d，弦長的一半 = √(r²-d²)
所以弦長 = **2√(r²-d²)**

你的題目給了什麼條件？`,
    '切線長公式是什麼': `切線長公式很實用，先確認你懂基本概念：

**先問：** 什麼是切線？切線和半徑有什麼關係？

💡 切線在切點處垂直於半徑！

**切線長公式：**
從圓外一點 P 到圓心 O，半徑 r，
切線長 = **√(PO² - r²)**

**記憶方法：** 想像一個直角三角形，斜邊是 PO，短邊是 r，切線長是另一邊！

你能用勾股定理推導出來嗎？試試看！`,
  },

  geometry: {
    '三角形全等和相似有什麼差': `這是很好的問題！讓我一步一步比較：

**先問你：** 全等和相似，你覺得主要差別在哪裡？

📌 **比較表：**
| | 全等 | 相似 |
|---|---|---|
| 形狀 | 完全一樣 | 一樣 |
| 大小 | 完全一樣 | **不一定** |
| 角度 | 對應角相等 | 對應角相等 |
| 邊長 | 對應邊相等 | 對應邊**成比例** |

**簡單說：全等是相似的特例（相似比=1:1）**

這樣有幫助嗎？有問題繼續問我！`,
    '幾何證明怎麼寫': `幾何證明的格式很重要，我教你步驟：

**基本格式：**
1. **已知：** 列出所有條件
2. **求證：** 說明要證明什麼
3. **證明：** 逐步推理，每步都要有理由

**每一步的格式：**
「因為 ___（理由），所以 ___（結論）」

**常用理由：**
- 對頂角相等
- 平行線的性質
- 三角形全等（ASA, SAS, SSS, AAS, HL）

你有具體的題目嗎？告訴我，我幫你分析怎麼開始！`,
    '平行四邊形有哪些性質': `平行四邊形有很多重要性質！我來整理：

**先問你：** 你知道平行四邊形的定義是什麼嗎？

📌 **平行四邊形的性質：**
1. **對邊平行** — 定義本身
2. **對邊相等** — AB=CD，BC=AD
3. **對角相等** — ∠A=∠C，∠B=∠D
4. **鄰角互補** — ∠A+∠B=180°
5. **對角線互相平分** — 交點各自平分

**特殊情形：**
- 矩形：四個直角 + 對角線相等
- 菱形：四邊相等 + 對角線互相垂直
- 正方形：矩形+菱形的組合

你在解哪種類型的題目呢？`,
  },

  coordinate: {
    '兩點距離公式怎麼用': `兩點距離公式，我先讓你自己想想：

**你知道勾股定理嗎？** a² + b² = c²

**想一想：** 如果兩點 A(x₁,y₁) 和 B(x₂,y₂)，
- 水平距離是多少？（提示：x₂-x₁）
- 垂直距離是多少？（提示：y₂-y₁）

**公式推導：** d = √[(x₂-x₁)² + (y₂-y₁)²]

**練習：** A(1,1) 到 B(4,5) 的距離？
先算水平差和垂直差，再用公式！`,
    '中點公式是什麼': `中點公式很直觀，我問你一個問題：

**想想看：** 在數線上，1和5的中點是幾？

**答：** (1+5)/2 = 3，對嗎？

**那在座標平面上：** 兩點 A(x₁,y₁) 和 B(x₂,y₂) 的中點？

就是 x 和 y 各別取平均！
中點 M = **((x₁+x₂)/2, (y₁+y₂)/2)**

**練習：** A(2,4) 和 B(8,2) 的中點？你算算看！`,
    '斜率怎麼算': `斜率代表直線的「傾斜程度」，讓我引導你：

**先想想：** 斜率是什麼？爬坡時「升高」除以「前進距離」。

**公式：** m = (y₂-y₁) / (x₂-x₁) = 上升量 / 水平量

**注意事項：**
- m > 0：線往右上方
- m < 0：線往右下方
- m = 0：水平線
- 垂直線斜率**不存在**

**練習：** 通過 (1,2) 和 (3,8) 的直線，斜率是多少？
提示：分子是 8-2，分母是 3-1，你算算！`,
  },

  quadratic: {
    '二次函數頂點怎麼求': `求頂點有兩種方法，我先問你：

**你比較熟悉哪一種？**
A. 用公式 x = -b/(2a)
B. 用配方法

**方法A（公式法）：**
已知 y = ax² + bx + c
→ 對稱軸 x = -b/(2a)
→ 把 x 代回去求 y，得頂點 (h, k)

**方法B（配方法）：**
整理成 y = a(x-h)² + k 的形式
→ 直接讀出頂點 (h, k)

你有具體題目嗎？告訴我係數，我們一起算！`,
    '對稱軸公式是什麼': `對稱軸公式和頂點密切相關，我先確認你的基礎：

**已知：** y = ax² + bx + c（a≠0）

**對稱軸：** x = **-b/(2a)**

**為什麼是這個？** 因為二次函數的頂點 x 座標就是對稱軸！

**練習：** y = 2x² - 8x + 3
- a = 2, b = -8
- 對稱軸 x = -(-8)/(2×2) = ?

你算算看，分子分母各是多少？`,
    '開口方向怎麼判斷': `開口方向很簡單，只看一個數：

**就是 y = ax² + bx + c 中的 a！**

🔼 **a > 0** → 開口向上（像碗）
🔽 **a < 0** → 開口向下（像帽子）

**額外補充：**
- |a| 越大 → 拋物線越窄
- |a| 越小 → 拋物線越寬

**快速練習：** 判斷下列開口方向：
1. y = 3x² - 2x + 1 → ?
2. y = -x² + 4 → ?
3. y = -0.5x² + x → ?

你試試看，答案是什麼？`,
  },

  statistics: {
    '平均數、中位數、眾數有什麼差': `這三個都是「代表值」，我來幫你搞清楚：

**先問你：** 你覺得哪個最常用？

📌 **三者比較：**

**平均數：** 所有數加起來 ÷ 個數
→ 受極端值影響大

**中位數：** 排序後最中間的數
→ 不受極端值影響

**眾數：** 出現次數最多的數
→ 可能有多個，或沒有

**舉例：** 資料：1, 2, 2, 3, 100
- 平均數 = (1+2+2+3+100)/5 = 21.6（受100影響很大！）
- 中位數 = 2
- 眾數 = 2

哪個最能代表這組資料呢？`,
    '機率公式是什麼': `機率公式其實很直觀！先問你：

**想想看：** 擲一個公平硬幣，正面出現的機率是多少？

**答：** 1/2，對不對？

**機率公式：** P(A) = **有利結果數 / 所有可能結果數**

**注意：** 所有結果必須是**等可能**發生的！

**練習：** 袋子裡有3顆紅球和2顆白球，取一顆：
- 所有結果：5種
- 取到紅球的有利結果：3種
- P(紅球) = ?

你算算看！`,
    '怎麼算古典機率': `古典機率的計算步驟，我幫你整理：

**步驟一：** 找出「所有可能結果」的總數
**步驟二：** 找出「有利結果」的數量  
**步驟三：** 機率 = 有利數 / 總數

**例題：** 1到10隨機選一個整數，選到偶數的機率？
- 總數：10個（1,2,...,10）
- 偶數：2,4,6,8,10 → 5個
- 機率 = 5/10 = **1/2**

**你來試試：** 1到10選一個，選到3的倍數的機率？
先列出3的倍數有哪些！`,
  },
};

// 生成練習題
function generatePractice(unit) {
  const bank = QUESTION_BANK[unit];
  if (!bank) return null;
  const easy = bank.easy || [];
  if (easy.length === 0) return null;
  return easy[Math.floor(Math.random() * easy.length)];
}

// AI 回應主函式
function getAIResponse(userMsg, unit) {
  const msg = userMsg.trim().toLowerCase();

  // 生成練習題
  if (msg.includes('練習題') || msg.includes('出題') || msg.includes('考我')) {
    const q = generatePractice(unit);
    if (q) {
      AI_CONTEXT.lastQuestion = q;
      return `好！來一道 **${q.unit}** 的練習題：\n\n**題目：** ${q.question}\n\n選項：\n${q.options.map((o,i)=>`(${String.fromCharCode(65+i)}) ${o}`).join('\n')}\n\n你覺得答案是哪個？先想想看！`;
    }
  }

  // 如果有上一題且學生回答
  if (AI_CONTEXT.lastQuestion) {
    const q = AI_CONTEXT.lastQuestion;
    const opts = q.options.map(o => o.toLowerCase());
    const correctIdx = opts.indexOf(q.answer.toLowerCase());
    const selectedLetter = ['a','b','c','d'].find(l => msg.includes(l));
    const selectedIdx = selectedLetter ? ['a','b','c','d'].indexOf(selectedLetter) : -1;

    if (selectedIdx >= 0 || opts.some(o => msg.includes(o.split('').slice(0,3).join('')))) {
      const ans = selectedIdx >= 0 ? q.options[selectedIdx] : null;
      if (ans && ans.toLowerCase() === q.answer.toLowerCase()) {
        AI_CONTEXT.lastQuestion = null;
        return `🎉 **答對了！太棒了！**\n\n正確答案是：**${q.answer}**\n\n**解析：** ${q.explanation}\n\n**相關觀念：** ${q.concept}\n\n想再做一題嗎？`;
      } else if (selectedIdx >= 0) {
        const stage = AI_CONTEXT.hintStage[q.id] || 0;
        AI_CONTEXT.hintStage[q.id] = stage + 1;
        if (stage === 0) {
          return `這個答案不太對哦！不要氣餒 💪\n\n**提示一：** ${q.concept} 相關的公式，你記得嗎？\n\n再想想，答案是 A、B、C、D 其中一個！`;
        } else if (stage === 1) {
          return `再試一次！**提示二：** ${q.explanation.substring(0, Math.min(50, q.explanation.length))}...\n\n你可以嗎？`;
        } else {
          AI_CONTEXT.lastQuestion = null;
          return `沒關係！這次的答案是 **${q.answer}**\n\n**完整解析：** ${q.explanation}\n\n記住這個概念：**${q.concept}**\n下次你一定會的！`;
        }
      }
    }
  }

  // 匹配單元相關問題
  const unitResponses = AI_RESPONSES[unit];
  if (unitResponses) {
    for (const [key, resp] of Object.entries(unitResponses)) {
      if (typeof resp === 'string') {
        const keywords = key.toLowerCase().split(/[？?、，,\s]+/);
        if (keywords.some(k => k.length > 1 && msg.includes(k))) {
          return resp;
        }
      }
    }
  }

  // 解釋觀念的請求（「請幫我解釋」、「解釋一下」等）
  if (msg.includes('解釋') || msg.includes('說明') || msg.includes('什麼是') || msg.includes('是什麼')) {
    // 嘗試在單元回應中找對應觀念
    const unitResponses = AI_RESPONSES[unit];
    if (unitResponses) {
      for (const [key, resp] of Object.entries(unitResponses)) {
        if (typeof resp === 'string') {
          const keywords = key.toLowerCase().split(/[？?、，,\s]+/);
          if (keywords.some(k => k.length > 1 && msg.includes(k))) {
            return resp;
          }
        }
      }
    }
    // 通用解釋引導
    return `我很樂意幫你解釋！\n\n為了給你最適合的說明，請告訴我：\n**你具體想了解什麼？**\n\n例如：\n• 「這個公式是怎麼來的？」\n• 「這個方法怎麼用？」\n• 「可以舉個例子嗎？」\n\n有問題儘管問，我們慢慢來！`;
  }

  // 通用回應
  const generalReplies = [
    `這是一個好問題！讓我先問你：你目前對這個概念的了解到哪裡了？\n\n你可以描述一下你卡在哪個地方嗎？這樣我才能給你最適合的提示！`,
    `我了解你的困惑！解題的第一步是**弄清楚題目要求什麼**。\n\n你能把題目條件告訴我嗎？例如：已知什麼、求什麼？`,
    `很好，你願意問問題就是學習的開始！🌟\n\n先告訴我：你有試著解這題嗎？你的想法是什麼？（就算不完整也沒關係）`,
    `讓我們一起來解這個問題！\n\n**第一步：** 把題目的已知條件列出來。\n**第二步：** 想想要求的是什麼。\n\n你能做第一步嗎？`,
  ];

  // 跨單元特定關鍵詞回應
  if (msg.includes('頂點') || msg.includes('vertex')) {
    return AI_RESPONSES.quadratic?.['二次函數頂點怎麼求'] || generalReplies[0];
  }
  if (msg.includes('對稱軸')) {
    return AI_RESPONSES.quadratic?.['對稱軸公式是什麼'] || generalReplies[0];
  }
  if (msg.includes('開口')) {
    return AI_RESPONSES.quadratic?.['開口方向怎麼判斷'] || generalReplies[0];
  }
  if (msg.includes('配方')) {
    return AI_RESPONSES.quadratic?.['二次函數頂點怎麼求'] || generalReplies[0];
  }
  if (msg.includes('機率') || msg.includes('probability')) {
    return AI_RESPONSES.statistics?.['機率公式是什麼'] || generalReplies[0];
  }
  if (msg.includes('古典機率') || (msg.includes('古典') && msg.includes('機率'))) {
    return AI_RESPONSES.statistics?.['怎麼算古典機率'] || generalReplies[0];
  }
  if (msg.includes('圓周角')) {
    return AI_RESPONSES.circle?.['圓周角定理怎麼用'] || generalReplies[0];
  }
  if (msg.includes('切線')) {
    return AI_RESPONSES.circle?.['切線長公式是什麼'] || generalReplies[0];
  }
  if (msg.includes('弦') && msg.includes('長')) {
    return AI_RESPONSES.circle?.['弦長怎麼計算'] || generalReplies[0];
  }
  if (msg.includes('距離') && (msg.includes('公式') || msg.includes('兩點'))) {
    return AI_RESPONSES.coordinate?.['兩點距離公式怎麼用'] || generalReplies[0];
  }
  if (msg.includes('中點') && msg.includes('公式')) {
    return AI_RESPONSES.coordinate?.['中點公式是什麼'] || generalReplies[0];
  }
  if (msg.includes('斜率')) {
    return AI_RESPONSES.coordinate?.['斜率怎麼算'] || generalReplies[0];
  }
  if (msg.includes('相似') && (msg.includes('判斷') || msg.includes('條件'))) {
    return AI_RESPONSES.similarity?.['相似三角形怎麼判斷'] || generalReplies[0];
  }
  if (msg.includes('相似比')) {
    return AI_RESPONSES.similarity?.['相似比怎麼算'] || generalReplies[0];
  }
  if (msg.includes('平均') || msg.includes('中位') || msg.includes('眾數')) {
    return AI_RESPONSES.statistics?.['平均數、中位數、眾數有什麼差'] || generalReplies[0];
  }
  if (msg.includes('全等') || msg.includes('相似') && msg.includes('差')) {
    return AI_RESPONSES.geometry?.['三角形全等和相似有什麼差'] || generalReplies[0];
  }
  if (msg.includes('平行四邊形') || (msg.includes('平行') && msg.includes('性質'))) {
    return AI_RESPONSES.geometry?.['平行四邊形有哪些性質'] || generalReplies[0];
  }
  if (msg.includes('證明') || msg.includes('怎麼寫')) {
    return AI_RESPONSES.geometry?.['幾何證明怎麼寫'] || generalReplies[0];
  }

  return generalReplies[Math.floor(Math.random() * generalReplies.length)];
}

// AI 錯誤分析
function getAIErrorAnalysis(errors, unit) {
  if (!errors || errors.length === 0) {
    return '目前沒有錯題紀錄。繼續練習，做完測驗後我會幫你分析弱點！';
  }

  const unitErrors = errors.filter(e => !unit || e.unit === unit);
  if (unitErrors.length === 0) {
    return `${unit ? unit + ' 這個單元' : '這個單元'}目前還沒有錯題，表現很好！`;
  }

  const conceptCount = {};
  unitErrors.forEach(e => {
    const c = e.concept || '其他';
    conceptCount[c] = (conceptCount[c] || 0) + 1;
  });

  const topConcepts = Object.entries(conceptCount)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 3);

  let msg = `📊 **AI 錯誤分析結果：**\n\n`;
  msg += `你在 ${unit||'這個單元'} 共有 ${unitErrors.length} 道錯題。\n\n`;
  msg += `**較弱的觀念：**\n`;
  topConcepts.forEach(([concept, count]) => {
    msg += `• ${concept}（錯了 ${count} 次）\n`;
  });

  const topConcept = topConcepts[0]?.[0];
  msg += `\n**建議：** 優先複習「${topConcept}」相關影片，然後做基礎練習題！`;

  return msg;
}

// 測驗後 AI 分析
function getQuizAIAnalysis(results, unit) {
  const wrong = results.filter(r => !r.correct);
  const pct = Math.round(results.filter(r => r.correct).length / results.length * 100);

  let msg = '';
  if (pct >= 80) {
    msg = `🌟 **表現優秀！** 正確率 ${pct}%\n\n`;
    msg += '你對這個單元掌握得相當好！建議挑戰困難模式或綜合模式。';
  } else if (pct >= 60) {
    msg = `📈 **表現不錯！** 正確率 ${pct}%\n\n`;
    msg += '基本概念掌握了，但還有進步空間。';
  } else {
    msg = `💪 **繼續加油！** 正確率 ${pct}%\n\n`;
    msg += '建議先複習教學影片，重新理解基本概念。';
  }

  if (wrong.length > 0) {
    const concepts = [...new Set(wrong.map(r => r.concept).filter(Boolean))];
    msg += `\n\n**需要複習的觀念：**\n${concepts.slice(0,3).map(c => `• ${c}`).join('\n')}`;
  }

  return msg;
}

// ============================================================
// AI 動態出題系統 — 嚴格課綱 + 歷史去重
// ============================================================

/**
 * 難度中文標籤對應表
 */
const DIFFICULTY_LABEL = {
  easy: '初級',
  medium: '中級',
  hard: '高級',
  mixed: '綜合',
};

/**
 * 建構 AI 出題 System Prompt。
 * @param {string} unitId       - 單元 ID（如 'similarity'）
 * @param {string} unitName     - 單元名稱（如 '相似形'）
 * @param {string} grade        - 年級字串（如 '九年級'）
 * @param {string} difficulty   - 難度 key（easy/medium/hard/mixed）
 * @param {number} count        - 出題數量
 * @param {Array}  historyItems - Storage.getQuizHistory() 的最近紀錄（摘要陣列）
 * @returns {string} 完整 prompt 字串
 */
function generateQuizPrompt(unitId, unitName, grade, difficulty, count, historyItems = []) {
  const randomSeed = Math.random().toString(36).substring(2, 9);
  const timestamp = Date.now();
  const diffLabel = DIFFICULTY_LABEL[difficulty] || difficulty;

  // 依難度組合說明
  let diffDetail = '';
  if (difficulty === 'mixed') {
    const easy = Math.round(count * 0.625);
    const med  = Math.round(count * 0.25);
    const hard = count - easy - med;
    diffDetail = `【綜合】：包含 ${easy} 題初級、${med} 題中級、${hard} 題高級的混合試卷。`;
  } else {
    const detailMap = {
      easy:   '【初級】：單一觀念直接計算，基礎觀念辨析。',
      medium: '【中級】：需 2～3 步驟計算，包含常見應用題型與變體。',
      hard:   '【高級】：跨觀念綜合思考，邏輯推理與較複雜的代數/幾何變化題。',
    };
    diffDetail = detailMap[difficulty] || '';
  }

  // 取最近 20 筆已做過題目的摘要，傳給 AI 避免重複
  const recentHistory = historyItems.slice(0, 20).map(q => ({
    question: q.question,
    unit: q.unit,
  }));

  return `你是一位專業且嚴格的臺灣國中數學命題老師。
請針對【${grade}】【${unitName}】章節，生成 ${count} 道【${diffLabel}】難度的單選題。

【命題嚴格規範】：
1. **絕不超綱**：題目必須 100% 符合臺灣 108 課綱中【${grade} - ${unitName}】的觀念與能力指標。切勿使用更高年級的公式或概念（例如：七年級不可出現根號或勾股定理；八年級不可出現圓周角等）。
2. **難度精準度**：
   - 【初級】：單一觀念直接計算，基礎觀念辨析。
   - 【中級】：需 2～3 步驟計算，包含常見應用題型與變體。
   - 【高級】：跨觀念綜合思考，邏輯推理與較複雜的代數/幾何變化題。
   - ${diffDetail}
3. **隨機與多樣性（亂數標記：${randomSeed}_${timestamp}）**：
   - 每次生成的題目情境、數字與問法必須全新穎，避免重複。
   - 請避開以下學生最近做過的題型與題目（即使數字不同也要避開相同出題方向）：
     ${JSON.stringify(recentHistory)}

【輸出 JSON 格式需求】：
請嚴格僅輸出 JSON 格式（不要包含任何 markdown 標籤、\`\`\`json 包裝或額外文字）：
{
  "questions": [
    {
      "id": "${unitId}_ai_1",
      "question": "題目描述...",
      "options": ["(A) 選項1", "(B) 選項2", "(C) 選項3", "(D) 選項4"],
      "answer": "(A)",
      "explanation": "詳細步驟拆解與觀念說明...",
      "concept": "對應觀念名稱",
      "unit": "${unitName}",
      "difficulty": "${difficulty}"
    }
  ]
}`;
}

/**
 * AI 動態出題：呼叫後端 Proxy 向 LLM 請求出題，失敗時自動 fallback 到靜態題庫。
 * @param {string} unitId     - 單元 ID
 * @param {string} mode       - 難度模式（easy/medium/hard/mixed）
 * @param {number} total      - 題目數量
 * @returns {Promise<Array>}  - 題目陣列
 */
async function buildAIQuizQuestions(unitId, mode, total) {
  // 取得單元資訊
  const unit = (typeof UNITS !== 'undefined') ? UNITS.find(u => u.id === unitId) : null;
  const unitName = unit ? unit.name : unitId;

  // 年級對應（依單元推斷）
  const gradeMap = {
    similarity: '九年級', circle: '九年級', geometry: '八年級',
    coordinate: '八年級', quadratic: '九年級', statistics: '九年級',
  };
  const grade = gradeMap[unitId] || '國中';

  // 讀取歷史題目紀錄（去重用）
  const historyItems = (typeof Storage !== 'undefined') ? Storage.getQuizHistory() : [];

  // 建構 prompt
  const prompt = generateQuizPrompt(unitId, unitName, grade, mode, total, historyItems);

  // 嘗試呼叫 AI API（需後端 Proxy 支援）
  const AI_PROXY_URL = (typeof window !== 'undefined' && window.EDUMATH_AI_URL) || null;

  if (AI_PROXY_URL) {
    try {
      const res = await fetch(AI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, unitId, mode, total }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const questions = (data.questions || []).map((q, i) => ({
        ...q,
        id: q.id || `${unitId}_ai_${Date.now()}_${i}`,
        _diff: q.difficulty || mode,
        _aiGenerated: true,
      }));

      if (questions.length > 0) {
        return questions;
      }
      throw new Error('AI 回傳空題目');
    } catch (err) {
      console.warn('[EduMath] AI 出題失敗，使用靜態題庫 fallback:', err.message);
    }
  }

  // Fallback：使用靜態題庫（原本的 buildQuizQuestions 邏輯）
  return _buildStaticQuizQuestions(unitId, mode, total);
}

/**
 * 靜態題庫出題（原 buildQuizQuestions 邏輯，供 fallback 使用）。
 */
function _buildStaticQuizQuestions(unitId, mode, total) {
  if (typeof QUESTION_BANK === 'undefined') return [];
  const bank = QUESTION_BANK[unitId];
  if (!bank) return [];

  let pool = [];
  if (mode === 'mixed') {
    const easyCount = Math.round(total * 0.625);
    const medCount  = Math.round(total * 0.25);
    const hardCount = total - easyCount - medCount;
    pool = [
      ..._sampleQuestions(bank.easy   || [], easyCount).map(q => ({ ...q, _diff: 'easy' })),
      ..._sampleQuestions(bank.medium || [], medCount ).map(q => ({ ...q, _diff: 'medium' })),
      ..._sampleQuestions(bank.hard   || [], hardCount).map(q => ({ ...q, _diff: 'hard' })),
    ];
  } else {
    const source = bank[mode] || [];
    pool = _sampleQuestions(source, total).map(q => ({ ...q, _diff: mode }));
  }
  return _shuffleQuestions(pool);
}

/** 去重取樣：優先排除最近做過的題目 */
function _sampleQuestions(arr, n) {
  if (arr.length === 0 || n === 0) return [];

  // 取得最近做過題目的 ID 集合（最多 100 筆）
  const recentIds = new Set(
    (typeof Storage !== 'undefined' ? Storage.getQuizHistory() : [])
      .slice(0, 100)
      .map(q => q.id)
      .filter(Boolean)
  );

  // 優先用未做過的題目
  const fresh   = arr.filter(q => !recentIds.has(q.id));
  const stale   = arr.filter(q =>  recentIds.has(q.id));
  const ordered = [..._shuffleQuestions(fresh), ..._shuffleQuestions(stale)];

  // 若總數不足則重複填補
  const result = [];
  while (result.length < n) {
    result.push(...ordered.slice(0, Math.min(n - result.length, ordered.length)));
  }
  return result.slice(0, n);
}

function _shuffleQuestions(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
