// ============================================================
// EduMath AI — 資料層 (data.js)
// 設計成可替換成正式後端 API
// ============================================================

// ---------- 六大單元定義 ----------
const UNITS = [
  { id: 'similarity', name: '相似形', icon: '📐', desc: '認識相似圖形與比例關係' },
  { id: 'circle',     name: '圓形',   icon: '⭕', desc: '學習圓心角、圓周角與圓的幾何' },
  { id: 'geometry',   name: '幾何與證明', icon: '📏', desc: '學習幾何推理與證明' },
  { id: 'coordinate', name: '幾何與座標', icon: '🗺️', desc: '學習座標平面與幾何關係' },
  { id: 'quadratic',  name: '二次函數', icon: '📈', desc: '學習圖形、頂點、對稱軸與應用' },
  { id: 'statistics', name: '統計與機率', icon: '🎲', desc: '學習統計資料與機率' },
];

// ---------- 教學影片資料 ----------
const VIDEO_DATA = {
  similarity: [
    { category: '相似形基本概念', videos: [
      { id:'sv001', title:'什麼是相似圖形？', desc:'認識相似的定義與基本性質', keypoints:['相似的定義','邊長比例','角度關係','相似符號 ~'] },
      { id:'sv002', title:'相似比與面積比', desc:'學習相似比與面積、體積的關係', keypoints:['相似比k','面積比 k²','周長比 k','實際計算'] },
    ]},
    { category: '相似三角形', videos: [
      { id:'sv003', title:'三角形相似的判別條件', desc:'AA、SAS、SSS 相似條件', keypoints:['AA 相似','SAS 相似','SSS 相似','應用例題'] },
      { id:'sv004', title:'相似三角形計算', desc:'運用相似三角形求未知邊長', keypoints:['設未知數','建立比例式','解方程式','驗算'] },
    ]},
    { category: '比例線段', videos: [
      { id:'sv005', title:'平行線截比例線段', desc:'了解平行線截線段的比例關係', keypoints:['截線定理','比例線段','基本比例定理'] },
      { id:'sv006', title:'角平分線與比例', desc:'三角形角平分線定理', keypoints:['角平分線定理','內外分比','計算應用'] },
    ]},
    { category: '相似形的應用', videos: [
      { id:'sv007', title:'生活中的相似形', desc:'測量高度、距離的實際應用', keypoints:['影子測高法','鏡子法','地圖比例尺'] },
    ]},
  ],
  circle: [
    { category: '圓的基本概念', videos: [
      { id:'cv001', title:'圓的各部份名稱', desc:'圓心、半徑、直徑、弦、弧', keypoints:['圓心 O','半徑 r','直徑 d=2r','弦與弧'] },
      { id:'cv002', title:'圓的周長與面積', desc:'公式應用與計算', keypoints:['周長 C=2πr','面積 A=πr²','π≈3.14','計算練習'] },
    ]},
    { category: '圓心角與圓周角', videos: [
      { id:'cv003', title:'圓心角的性質', desc:'圓心角與弧的關係', keypoints:['圓心角定義','圓心角=弧度','計算圓心角'] },
      { id:'cv004', title:'圓周角定理', desc:'圓周角與圓心角的關係', keypoints:['圓周角=½圓心角','同弧上的圓周角相等','直徑所對圓周角=90°'] },
    ]},
    { category: '弧與弦', videos: [
      { id:'cv005', title:'弧長公式', desc:'弧長與圓心角的計算', keypoints:['弧長=rθ','扇形面積公式','計算練習'] },
      { id:'cv006', title:'弦的性質', desc:'弦長、距離與圓心的關係', keypoints:['弦的垂直平分線過圓心','等弦等距','垂徑定理'] },
    ]},
    { category: '圓的幾何應用', videos: [
      { id:'cv007', title:'圓與切線', desc:'切線的性質與計算', keypoints:['切線垂直半徑','切線長公式','兩切線等長'] },
      { id:'cv008', title:'圓的綜合應用', desc:'綜合幾何題的解題策略', keypoints:['組合圖形','輔助線','多步驟解題'] },
    ]},
  ],
  geometry: [
    { category: '幾何基本概念', videos: [
      { id:'gv001', title:'點、線、角複習', desc:'九年級幾何基礎複習', keypoints:['基本定義','角的種類','平行與垂直'] },
    ]},
    { category: '證明的基本方法', videos: [
      { id:'gv002', title:'數學證明的格式', desc:'如何寫一個完整的幾何證明', keypoints:['已知條件','要求證明','步驟說明','理由依據'] },
      { id:'gv003', title:'直接證明法', desc:'用已知條件直接推出結論', keypoints:['邏輯推理','舉例說明','注意事項'] },
    ]},
    { category: '幾何推理', videos: [
      { id:'gv004', title:'三角形的全等與相似', desc:'判斷三角形全等與相似的方法', keypoints:['全等條件','相似條件','差異比較'] },
      { id:'gv005', title:'多邊形的性質', desc:'四邊形與多邊形的推理', keypoints:['平行四邊形','菱形','矩形','正方形'] },
    ]},
    { category: '幾何應用題', videos: [
      { id:'gv006', title:'幾何應用題解題技巧', desc:'如何分析幾何應用題', keypoints:['畫輔助線','找關鍵條件','分步驟解題'] },
    ]},
  ],
  coordinate: [
    { category: '座標平面', videos: [
      { id:'cov001', title:'認識座標平面', desc:'x軸、y軸與四個象限', keypoints:['x軸與y軸','四個象限','原點(0,0)','座標符號(x,y)'] },
    ]},
    { category: '點與座標', videos: [
      { id:'cov002', title:'座標的讀取與繪製', desc:'如何在座標平面上標出點', keypoints:['橫軸為x','縱軸為y','正負座標','練習題'] },
      { id:'cov003', title:'中點與距離公式', desc:'兩點中點座標與距離計算', keypoints:['中點公式','距離公式','√計算','應用例題'] },
    ]},
    { category: '距離與位置關係', videos: [
      { id:'cov004', title:'點到直線的距離', desc:'計算點與直線的距離', keypoints:['距離公式','代入計算','幾何意義'] },
    ]},
    { category: '座標幾何應用', videos: [
      { id:'cov005', title:'直線方程式', desc:'直線的斜率與截距式', keypoints:['斜率m=(y2-y1)/(x2-x1)','截距式y=mx+b','圖形繪製'] },
      { id:'cov006', title:'座標幾何綜合', desc:'座標幾何綜合題解析', keypoints:['多步驟解題','面積計算','幾何關係'] },
    ]},
  ],
  quadratic: [
    { category: '二次函數基本概念', videos: [
      { id:'qv001', title:'認識二次函數', desc:'二次函數的定義與標準式', keypoints:['定義 y=ax²+bx+c','a≠0 的意義','一次函數的區別'] },
      { id:'qv002', title:'二次函數的圖形—拋物線', desc:'拋物線的形狀與開口方向', keypoints:['a>0 開口向上','a<0 開口向下','|a| 越大越窄','對稱軸'] },
    ]},
    { category: '頂點與對稱軸', videos: [
      { id:'qv003', title:'頂點式與頂點求法', desc:'用配方法求二次函數頂點', keypoints:['頂點式 y=a(x-h)²+k','頂點(h,k)','配方法步驟','練習計算'] },
      { id:'qv004', title:'對稱軸公式', desc:'x=-b/2a 的推導與應用', keypoints:['對稱軸 x=-b/2a','與頂點的關係','求 h 值','應用例題'] },
    ]},
    { category: '最大值與最小值', videos: [
      { id:'qv005', title:'最大值與最小值', desc:'二次函數的極值求解', keypoints:['a>0 有最小值','a<0 有最大值','頂點的 y 值','區間限制'] },
    ]},
    { category: '二次函數應用', videos: [
      { id:'qv006', title:'二次函數應用題', desc:'拋物線在生活中的應用', keypoints:['拋體問題','面積最大化','利潤最大化','建立方程式'] },
      { id:'qv007', title:'二次函數與圖形', desc:'由圖形求方程式', keypoints:['三點決定拋物線','頂點+一點','對稱性應用'] },
    ]},
  ],
  statistics: [
    { category: '資料分析', videos: [
      { id:'stv001', title:'統計資料的整理', desc:'如何整理與呈現資料', keypoints:['次數分配表','組距與組數','資料整理步驟'] },
      { id:'stv002', title:'平均數、中位數、眾數', desc:'三種集中趨勢的計算', keypoints:['平均數 x̄','中位數排序法','眾數最常出現','比較與選擇'] },
    ]},
    { category: '統計圖表', videos: [
      { id:'stv003', title:'長條圖與折線圖', desc:'常見統計圖表的繪製與讀取', keypoints:['長條圖用途','折線圖趨勢','橫縱軸標示','讀圖練習'] },
      { id:'stv004', title:'圓形圖與直方圖', desc:'圓形圖與直方圖的應用', keypoints:['圓形圖百分比','直方圖連續資料','如何繪製','解讀資訊'] },
    ]},
    { category: '機率基本概念', videos: [
      { id:'stv005', title:'機率的定義', desc:'機率的基本概念與公式', keypoints:['機率 P(A)=m/n','0≤P≤1','P=0不可能','P=1必然'] },
    ]},
    { category: '機率計算', videos: [
      { id:'stv006', title:'古典機率計算', desc:'計算各種情境的機率', keypoints:['列舉所有結果','計算有利結果','化簡分數','實際例題'] },
      { id:'stv007', title:'機率的加法與乘法', desc:'互斥事件與獨立事件的機率', keypoints:['互斥事件 P(A+B)','獨立事件 P(A×B)','條件機率入門','計算練習'] },
    ]},
    { category: '生活中的統計與機率', videos: [
      { id:'stv008', title:'生活中的統計應用', desc:'統計在生活中的實際應用', keypoints:['民調與抽樣','統計圖的解讀','資料可靠性','批判性思考'] },
    ]},
  ],
};

// ---------- 題庫（擴充版：每單元 簡單12題、中等10題、困難5題）----------
const QUESTION_BANK = {
  // ════════════════════════════════════════════════════════════
  // 相似形
  // ════════════════════════════════════════════════════════════
  similarity: {
    easy: [
      { id:'sim_e01', unit:'相似形', difficulty:'easy', question:'兩個三角形的三組對應角都相等，則這兩個三角形一定？', options:['全等','相似','等積','等周'], answer:'相似', explanation:'三組對應角都相等符合 AA 條件，但不一定全等（邊長可以不同），所以是相似三角形。', concept:'相似三角形 AA 條件', similarQuestion:'若兩三角形有兩組對應角相等，能否判斷相似？' },
      { id:'sim_e02', unit:'相似形', difficulty:'easy', question:'若 △ABC ∼ △DEF，且 AB=6, DE=4，則相似比為？', options:['2:3','3:2','4:6','無法判斷'], answer:'3:2', explanation:'相似比 = AB : DE = 6 : 4 = 3 : 2。', concept:'相似比', similarQuestion:'若相似比為 3:2，則 BC=9 時，EF 為多少？' },
      { id:'sim_e03', unit:'相似形', difficulty:'easy', question:'相似比為 1:2 的兩個正方形，大正方形面積是小正方形面積的幾倍？', options:['2倍','4倍','3倍','8倍'], answer:'4倍', explanation:'面積比 = 相似比的平方 = (1:2)² = 1:4，所以大的是小的 4 倍。', concept:'相似比與面積比', similarQuestion:'相似比為 1:3，面積比為多少？' },
      { id:'sim_e04', unit:'相似形', difficulty:'easy', question:'下列哪組圖形一定是相似圖形？', options:['任意兩個三角形','任意兩個正方形','任意兩個矩形','任意兩個菱形'], answer:'任意兩個正方形', explanation:'所有正方形角都是 90°，且邊長成比例，所以任意兩個正方形一定相似。', concept:'相似圖形的判別', similarQuestion:'任意兩個正三角形是否一定相似？' },
      { id:'sim_e05', unit:'相似形', difficulty:'easy', question:'△ABC 中，DE // BC，AD=3, DB=2，則 AD:AB 為？', options:['3:5','3:2','2:5','5:3'], answer:'3:5', explanation:'AD:AB = AD:(AD+DB) = 3:(3+2) = 3:5。', concept:'平行線截比例線段', similarQuestion:'若 AD:AB=2:5，且 AB=10，求 AD 長度。' },
      { id:'sim_e06', unit:'相似形', difficulty:'easy', question:'相似形中，對應角的關係是？', options:['互補','相等','互餘','無關係'], answer:'相等', explanation:'相似形的對應角一定相等，這是相似的基本性質。', concept:'相似圖形基本性質', similarQuestion:'全等圖形的對應角有何關係？' },
      { id:'sim_e07', unit:'相似形', difficulty:'easy', question:'兩相似三角形的周長比為 2:3，則其面積比為？', options:['2:3','4:9','4:6','8:27'], answer:'4:9', explanation:'面積比 = 周長比² = (2:3)² = 4:9。', concept:'相似比、周長比與面積比', similarQuestion:'面積比為 4:25 時，周長比為多少？' },
      { id:'sim_e08', unit:'相似形', difficulty:'easy', question:'若 △ABC ∼ △DEF，對應邊 AB 對應 DE，則 ∠A 對應的角是？', options:['∠D','∠E','∠F','∠B'], answer:'∠D', explanation:'相似三角形對應頂點按順序對應，△ABC ∼ △DEF 中，A 對應 D，所以 ∠A 對應 ∠D。', concept:'相似三角形對應關係', similarQuestion:'∠B 在 △DEF 中對應哪個角？' },
      { id:'sim_e09', unit:'相似形', difficulty:'easy', question:'一張地圖的比例尺為 1:50000，地圖上 2cm 代表實際距離多少？', options:['100m','500m','1km','5km'], answer:'1km', explanation:'實際距離 = 2cm × 50000 = 100000cm = 1000m = 1km。', concept:'比例尺應用', similarQuestion:'比例尺 1:100000，地圖上 3cm 代表多少公里？' },
      { id:'sim_e10', unit:'相似形', difficulty:'easy', question:'下列哪個條件不能判斷兩三角形相似？', options:['兩角相等（AA）','兩邊成比例且夾角相等（SAS）','三邊成比例（SSS）','兩邊相等'], answer:'兩邊相等', explanation:'相似判斷條件為 AA、SAS（比例）、SSS（比例），僅「兩邊相等」無法判斷相似。', concept:'相似三角形判別條件', similarQuestion:'「三邊對應相等」判斷全等還是相似？' },
      { id:'sim_e11', unit:'相似形', difficulty:'easy', question:'△ABC ∼ △DEF，相似比為 3:1，若 △DEF 面積為 4，則 △ABC 面積為？', options:['12','36','4','9'], answer:'36', explanation:'面積比 = 相似比² = 3² : 1² = 9:1，所以 △ABC 面積 = 4 × 9 = 36。', concept:'相似比與面積比計算', similarQuestion:'相似比為 2:5，小三角形面積為 8，大三角形面積為？' },
      { id:'sim_e12', unit:'相似形', difficulty:'easy', question:'所有正三角形（等邊三角形）之間的關係是？', options:['不一定相似','一定相似','一定全等','一定等積'], answer:'一定相似', explanation:'所有正三角形三角都是 60°，符合 AA 相似條件，所以任意兩個正三角形一定相似。', concept:'相似圖形判別', similarQuestion:'所有正五邊形是否一定相似？' },
    ],
    medium: [
      { id:'sim_m01', unit:'相似形', difficulty:'medium', question:'△ABC ∼ △DEF，AB=6, DE=4, BC=9，則 EF=？', options:['6','3','12','4.5'], answer:'6', explanation:'由相似比 AB:DE = 6:4 = 3:2，所以 BC:EF = 3:2，EF = 9×2/3 = 6。', concept:'相似三角形邊長計算', similarQuestion:'若 AC=12，求 DF。' },
      { id:'sim_m02', unit:'相似形', difficulty:'medium', question:'一根竹竿在陽光下影子長 2m，同時一棵樹的影子長 8m，竹竿高 1.5m，求樹高？', options:['3m','4m','5m','6m'], answer:'6m', explanation:'竹竿高/影長 = 樹高/影長，1.5/2 = 樹高/8，樹高 = 1.5×8/2 = 6m。', concept:'相似形的實際應用', similarQuestion:'若竹竿高 2m，影長 2.5m，另一物體影長 7.5m，求其高度。' },
      { id:'sim_m03', unit:'相似形', difficulty:'medium', question:'△ABC 中，D 在 AB 上、E 在 AC 上，DE // BC，AD:AB = 2:5，若 BC=15，則 DE=？', options:['6','5','8','7.5'], answer:'6', explanation:'DE:BC = AD:AB = 2:5，所以 DE = 15×2/5 = 6。', concept:'平行線截比例線段', similarQuestion:'若 AD:DB=1:2，BC=12，求 DE。' },
      { id:'sim_m04', unit:'相似形', difficulty:'medium', question:'△ABC ∼ △ADE，其中 D 在 AB 上，E 在 AC 上，AD=4，AB=10，若 BC=15，則 DE=？', options:['6','4','10','7.5'], answer:'6', explanation:'相似比 AD:AB = 4:10 = 2:5，DE:BC = 2:5，DE = 15×2/5 = 6。', concept:'相似三角形比例計算', similarQuestion:'若 △ABC ∼ △ADE，AD:DB=1:3，求 DE:BC。' },
      { id:'sim_m05', unit:'相似形', difficulty:'medium', question:'兩相似三角形面積比為 9:16，其相似比為？', options:['3:4','9:16','81:256','3:8'], answer:'3:4', explanation:'相似比 = √(面積比) = √(9:16) = 3:4。', concept:'由面積比求相似比', similarQuestion:'面積比為 1:4 時，相似比為多少？' },
      { id:'sim_m06', unit:'相似形', difficulty:'medium', question:'△ABC 中，∠B=∠ACD，則 △ABC 與 △ACD 的相似比（AC:AD）等於？', options:['AB:AC','BC:CD','AC:CD','AB:AD'], answer:'AB:AC', explanation:'△ABC ∼ △ACD（∠A公共角，∠B=∠ACD），所以對應邊 AB:AC = AC:AD，即 AC²=AB×AD，相似比 AB:AC。', concept:'角度條件判斷相似', similarQuestion:'若 AB=9，AC=6，求 AD。' },
      { id:'sim_m07', unit:'相似形', difficulty:'medium', question:'梯形 ABCD 中，AB // CD，對角線交於 E，若 AB=6，CD=4，則 AE:EC=？', options:['3:2','2:3','6:4','1:1'], answer:'3:2', explanation:'AB // CD，△AEB ∼ △CED（AA），所以 AE:CE = AB:CD = 6:4 = 3:2。', concept:'梯形對角線的比例', similarQuestion:'若 AE=9，求 CE。' },
      { id:'sim_m08', unit:'相似形', difficulty:'medium', question:'△ABC 中，D 是 BC 中點，E 是 AC 中點，則 △ADE 與 △ABC 的相似比為？', options:['1:2','1:4','2:1','1:3'], answer:'1:2', explanation:'DE 為中位線，DE = BC/2，△ADE ∼ △ABC，相似比 = AE:AC = 1:2。', concept:'中位線與相似', similarQuestion:'中位線 DE 的長度是 BC 的幾倍？' },
      { id:'sim_m09', unit:'相似形', difficulty:'medium', question:'地圖比例尺 1:25000，兩城市地圖距離 8cm，實際距離為多少公里？', options:['2km','4km','8km','20km'], answer:'2km', explanation:'實際距離 = 8 × 25000 = 200000cm = 2000m = 2km。', concept:'比例尺計算', similarQuestion:'兩點實際距離 5km，地圖比例尺 1:50000，地圖上距離為多少 cm？' },
      { id:'sim_m10', unit:'相似形', difficulty:'medium', question:'△ABC ∼ △DEF，AB=8，DE=6，△ABC 面積=48，則 △DEF 面積=？', options:['27','36','32','18'], answer:'27', explanation:'面積比 = 相似比² = (8:6)² = (4:3)² = 16:9，△DEF 面積 = 48 × 9/16 = 27。', concept:'相似比與面積計算', similarQuestion:'△ABC 周長為 32，求 △DEF 周長。' },
    ],
    hard: [
      { id:'sim_h01', unit:'相似形', difficulty:'hard', question:'△ABC 中，AB=10，AC=8，BC=6，∠C=90°，CD⊥AB，則 BD=？', options:['3.6','4.8','5','4'], answer:'3.6', explanation:'△ABC ∼ △CBD（共用 ∠B，均有直角），相似比 BC:AB = 6:10 = 3:5，BD:BC = BC:AB，BD = BC²/AB = 36/10 = 3.6。', concept:'直角三角形射影定理', similarQuestion:'求 AD 的長度。' },
      { id:'sim_h02', unit:'相似形', difficulty:'hard', question:'平行四邊形 ABCD 中，E 是 BC 中點，AE 延長線交 DC 延長線於 F，若 AB=6，則 CF=？', options:['3','6','9','12'], answer:'3', explanation:'△ABE ∼ △FCE（AA：對頂角相等，AB//CF 使兩角相等），AB:FC = BE:CE = 2:1（E 為中點），所以 FC = AB/2 = 3。', concept:'平行四邊形中的相似', similarQuestion:'若 AE=10，求 EF。' },
      { id:'sim_h03', unit:'相似形', difficulty:'hard', question:'△ABC 中，角平分線 AD 交 BC 於 D，若 AB=9，AC=6，BC=10，則 BD=？', options:['6','4','5','7.5'], answer:'6', explanation:'角平分線定理：BD:DC = AB:AC = 9:6 = 3:2，BC=10，BD = 10×3/(3+2) = 6。', concept:'角平分線定理', similarQuestion:'求 DC 的長度。' },
      { id:'sim_h04', unit:'相似形', difficulty:'hard', question:'△ABC 中，D 在 AB 上，E 在 AC 上，DE // BC，△ADE 面積為 9，梯形 BCED 面積為 16，則 AD:DB=？', options:['3:2','1:2','3:4','2:1'], answer:'3:2', explanation:'△ADE 面積 = 9，△ABC 面積 = 9+16 = 25。相似比 = √(9/25) = 3/5，AD:AB = 3:5，DB:AB = 2:5，AD:DB = 3:2。', concept:'相似面積比進階', similarQuestion:'若 △ADE 面積為 4，梯形面積為 5，求 AD:AB。' },
      { id:'sim_h05', unit:'相似形', difficulty:'hard', question:'直角三角形斜邊 AB=13，兩直角邊 AC=5，BC=12，斜邊上的高為 CD，則 AD=？', options:['25/13','60/13','144/13','5'], answer:'25/13', explanation:'CD 為斜邊上的高，△ACD ∼ △ACB，AD/AC = AC/AB，AD = AC²/AB = 25/13。', concept:'斜邊上高與射影定理', similarQuestion:'求 BD 的長度。' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // 圓形
  // ════════════════════════════════════════════════════════════
  circle: {
    easy: [
      { id:'cir_e01', unit:'圓形', difficulty:'easy', question:'圓的直徑與半徑的關係是？', options:['直徑=半徑','直徑=2倍半徑','直徑=半徑/2','直徑=3倍半徑'], answer:'直徑=2倍半徑', explanation:'直徑 d = 2r，是圓的基本公式。', concept:'圓的基本元素', similarQuestion:'半徑為 5，直徑為多少？' },
      { id:'cir_e02', unit:'圓形', difficulty:'easy', question:'圓周角是圓心角的幾倍？', options:['2倍','相等','1/2倍','4倍'], answer:'1/2倍', explanation:'圓周角定理：圓周角 = 圓心角的一半。', concept:'圓周角定理', similarQuestion:'圓心角為 120°，圓周角為多少？' },
      { id:'cir_e03', unit:'圓形', difficulty:'easy', question:'直徑所對的圓周角為多少度？', options:['90°','60°','45°','180°'], answer:'90°', explanation:'半圓所對的圓周角 = 90°（圓心角=180° 的一半）。', concept:'直徑所對圓周角', similarQuestion:'若圓周角為 90°，則它所對的弦一定是直徑嗎？' },
      { id:'cir_e04', unit:'圓形', difficulty:'easy', question:'半徑為 5 的圓，周長為？（π≈3.14）', options:['15.7','31.4','78.5','10π'], answer:'31.4', explanation:'圓周長 C = 2πr = 2×3.14×5 = 31.4。', concept:'圓的周長公式', similarQuestion:'直徑為 8 的圓，周長為多少？' },
      { id:'cir_e05', unit:'圓形', difficulty:'easy', question:'下列哪個是圓的弦？', options:['連接圓心到圓周的線段','圓周的一部分','連接圓周上兩點的線段','圓的邊界'], answer:'連接圓周上兩點的線段', explanation:'弦是連接圓上兩點的線段。直徑是最長的弦。', concept:'弦的定義', similarQuestion:'直徑與弦有何關係？' },
      { id:'cir_e06', unit:'圓形', difficulty:'easy', question:'同一弧上的所有圓周角大小？', options:['不一定相等','一定相等','一定互補','無法判斷'], answer:'一定相等', explanation:'同一弧（或等弧）所對的圓周角相等。', concept:'同弧圓周角', similarQuestion:'同弧上的圓心角與圓周角有何關係？' },
      { id:'cir_e07', unit:'圓形', difficulty:'easy', question:'半徑為 10 的圓，面積為？（π≈3.14）', options:['31.4','62.8','314','628'], answer:'314', explanation:'圓面積 A = πr² = 3.14×10² = 314。', concept:'圓的面積公式', similarQuestion:'直徑為 6 的圓，面積為多少？' },
      { id:'cir_e08', unit:'圓形', difficulty:'easy', question:'圓的最長弦是？', options:['任意弦','通過圓心的弦（直徑）','等於半徑的弦','與圓心最遠的弦'], answer:'通過圓心的弦（直徑）', explanation:'直徑是通過圓心的弦，也是所有弦中最長的。', concept:'直徑與弦', similarQuestion:'若弦長等於直徑，該弦位於哪裡？' },
      { id:'cir_e09', unit:'圓形', difficulty:'easy', question:'切線與圓的切點關係：過切點的半徑與切線的夾角是？', options:['60°','45°','90°','任意角'], answer:'90°', explanation:'切線垂直於過切點的半徑，夾角為 90°。', concept:'切線垂直半徑', similarQuestion:'若切線與圓交於兩點，它是切線嗎？' },
      { id:'cir_e10', unit:'圓形', difficulty:'easy', question:'一個圓心角為 60°，對應弧長占圓周的幾分之幾？', options:['1/3','1/4','1/6','1/12'], answer:'1/6', explanation:'弧長比例 = 圓心角/360° = 60°/360° = 1/6。', concept:'弧長與圓心角的比例', similarQuestion:'圓心角 90° 的弧長占圓周的幾分之幾？' },
      { id:'cir_e11', unit:'圓形', difficulty:'easy', question:'圓內接四邊形的對角之和為？', options:['90°','180°','270°','360°'], answer:'180°', explanation:'圓內接四邊形的對角互補，即兩對角之和均為 180°。', concept:'圓內接四邊形性質', similarQuestion:'若其中一角為 70°，對角為多少？' },
      { id:'cir_e12', unit:'圓形', difficulty:'easy', question:'弦的垂直平分線一定通過？', options:['弦的中點','圓周上的點','圓心','切點'], answer:'圓心', explanation:'弦的垂直平分線通過圓心，這是垂徑定理的推論。', concept:'垂徑定理', similarQuestion:'如何利用此性質找出圓心？' },
    ],
    medium: [
      { id:'cir_m01', unit:'圓形', difficulty:'medium', question:'圓內有一個圓心角為 80°，則同弧所對的圓周角為？', options:['160°','80°','40°','20°'], answer:'40°', explanation:'圓周角 = 圓心角 ÷ 2 = 80° ÷ 2 = 40°。', concept:'圓周角定理計算', similarQuestion:'若圓周角為 35°，則對應的圓心角為多少？' },
      { id:'cir_m02', unit:'圓形', difficulty:'medium', question:'半徑為 6 的圓中，弦 AB 距圓心距離為 4，則弦 AB 長為？', options:['4√5','4√2','6','2√20'], answer:'4√5', explanation:'設弦半長為 h，勾股定理：h² + 4² = 6²，h² = 20，h = 2√5，弦長 = 4√5。', concept:'弦與圓心距離', similarQuestion:'弦長為 8，圓心到弦距離為 3，求半徑。' },
      { id:'cir_m03', unit:'圓形', difficulty:'medium', question:'從圓外一點 P 到圓的兩條切線長，這兩條切線長一定？', options:['不等','相等','互補','互餘'], answer:'相等', explanation:'從圓外一點到圓的兩條切線長相等（切線長定理）。', concept:'切線長定理', similarQuestion:'如何用切線長定理求圓外一點到切點的距離？' },
      { id:'cir_m04', unit:'圓形', difficulty:'medium', question:'圓內接四邊形 ABCD，∠A=75°，則 ∠C=？', options:['75°','105°','90°','115°'], answer:'105°', explanation:'圓內接四邊形對角互補，∠A+∠C=180°，∠C=180°-75°=105°。', concept:'圓內接四邊形', similarQuestion:'若 ∠B=110°，求 ∠D。' },
      { id:'cir_m05', unit:'圓形', difficulty:'medium', question:'半徑為 5，圓心角為 72° 的扇形，其弧長為？（π≈3.14）', options:['3.14','6.28','12.56','π'], answer:'6.28', explanation:'弧長 = 2πr×(圓心角/360°) = 2×3.14×5×(72/360) = 31.4×0.2 = 6.28。', concept:'弧長公式計算', similarQuestion:'圓心角為 90°，半徑為 8，弧長為多少？' },
      { id:'cir_m06', unit:'圓形', difficulty:'medium', question:'圓外一點 P 到圓心距離為 13，圓半徑為 5，則從 P 到圓的切線長為？', options:['8','12','10','√144'], answer:'12', explanation:'切線長 = √(PO²-r²) = √(169-25) = √144 = 12。', concept:'切線長公式', similarQuestion:'若 PO=10，r=6，切線長為多少？' },
      { id:'cir_m07', unit:'圓形', difficulty:'medium', question:'半徑為 8 的圓，弦長為 12，則此弦距圓心的距離為？', options:['√28','4','√20','2√7'], answer:'2√7', explanation:'設距離為 d，勾股定理：(12/2)²+d²=8²，36+d²=64，d²=28，d=2√7。', concept:'弦與圓心距離計算', similarQuestion:'弦長為 16，半徑為 10，弦距圓心多遠？' },
      { id:'cir_m08', unit:'圓形', difficulty:'medium', question:'AB 為圓的直徑，C 是圓周上一點（C 不是 A 或 B），則 ∠ACB=？', options:['45°','60°','90°','180°'], answer:'90°', explanation:'直徑所對的圓周角為 90°（半圓對應圓周角定理）。', concept:'直徑對圓周角', similarQuestion:'若 C 在半圓上，∠CAB=30°，求 ∠ABC。' },
      { id:'cir_m09', unit:'圓形', difficulty:'medium', question:'兩弦 AB 和 CD 在圓內相交於 E，AE=3，EB=4，CE=2，則 ED=？', options:['6','4','8','3'], answer:'6', explanation:'兩弦相交定理：AE×EB = CE×ED，3×4 = 2×ED，ED = 12/2 = 6。', concept:'兩弦相交定理', similarQuestion:'若 AE=4，EB=9，CE=6，求 ED。' },
      { id:'cir_m10', unit:'圓形', difficulty:'medium', question:'圓的半徑為 r，一條弦長為 r，此弦所對的圓心角為？', options:['30°','45°','60°','90°'], answer:'60°', explanation:'弦長=r，設圓心角為 2θ，弦長 = 2r sin(θ) = r，sin(θ)=1/2，θ=30°，圓心角=60°。', concept:'弦長與圓心角', similarQuestion:'弦長等於 r√2 時，圓心角為多少？' },
    ],
    hard: [
      { id:'cir_h01', unit:'圓形', difficulty:'hard', question:'圓內接四邊形 ABCD，∠ABD=40°，∠ADB=60°，則 ∠BCD=？', options:['100°','80°','120°','140°'], answer:'100°', explanation:'△ABD 中，∠BAD=180°-40°-60°=80°。圓內接四邊形 ∠BAD+∠BCD=180°，∠BCD=100°。', concept:'圓內接四邊形角度計算', similarQuestion:'若 ∠ADB=50°，∠ABD=45°，求 ∠BCD。' },
      { id:'cir_h02', unit:'圓形', difficulty:'hard', question:'從圓外一點 P 作兩條割線，一條截圓於 A、B，另一條截圓於 C、D（A、C 較近 P），PA=4，PB=9，PC=3，則 PD=？', options:['12','9','8','6'], answer:'12', explanation:'割線定理：PA×PB = PC×PD，4×9 = 3×PD，PD = 36/3 = 12。', concept:'割線定理（冪次定理）', similarQuestion:'若 PA=2，PB=8，PC=4，求 PD。' },
      { id:'cir_h03', unit:'圓形', difficulty:'hard', question:'半徑為 5 的圓，兩條平行弦長分別為 6 和 8，則兩弦之間的距離為？', options:['1或7','2','3','4'], answer:'1或7', explanation:'弦 6 距圓心：√(25-9)=4；弦 8 距圓心：√(25-16)=3。若在同側距離 = |4-3|=1；若在異側距離 = 4+3=7。', concept:'平行弦距離計算', similarQuestion:'若兩平行弦長均為 6，兩弦距離為多少？' },
      { id:'cir_h04', unit:'圓形', difficulty:'hard', question:'△ABC 的外接圓半徑為 R，若 BC=8，∠A=30°，則 R=？', options:['8','4','16','2'], answer:'8', explanation:'正弦定理：a/sin A = 2R，BC/sin∠A = 2R，8/sin30° = 8/(1/2) = 16 = 2R，R=8。', concept:'正弦定理與外接圓', similarQuestion:'BC=10，∠A=45°，求外接圓半徑。' },
      { id:'cir_h05', unit:'圓形', difficulty:'hard', question:'在圓中，弦 AB 長為 8，∠AOB（O 為圓心）= 120°，則半徑為？', options:['4√3/3','8√3/3','4','8√3'], answer:'8√3/3', explanation:'弦長 = 2R sin(θ/2) = 2R sin60° = 2R×(√3/2) = R√3 = 8，R = 8/√3 = 8√3/3。', concept:'弦長與圓心角關係', similarQuestion:'弦長為 10，圓心角為 90°，求半徑。' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // 幾何與證明
  // ════════════════════════════════════════════════════════════
  geometry: {
    easy: [
      { id:'geo_e01', unit:'幾何與證明', difficulty:'easy', question:'兩條直線平行，被第三條直線截，同位角的關係是？', options:['互補','相等','互餘','無關係'], answer:'相等', explanation:'平行線被截線截，同位角（F形角）相等。', concept:'平行線性質', similarQuestion:'錯角（Z形角）在平行線中有何關係？' },
      { id:'geo_e02', unit:'幾何與證明', difficulty:'easy', question:'三角形內角和等於？', options:['90°','180°','270°','360°'], answer:'180°', explanation:'三角形三個內角之和為 180°。', concept:'三角形內角和', similarQuestion:'四邊形的內角和為多少？' },
      { id:'geo_e03', unit:'幾何與證明', difficulty:'easy', question:'一個三角形兩個內角分別是 50° 和 70°，第三個內角是？', options:['50°','60°','70°','80°'], answer:'60°', explanation:'三角形內角和 180°：第三角 = 180°-50°-70° = 60°。', concept:'三角形內角和計算', similarQuestion:'三角形兩角為 45° 和 90°，第三角為？' },
      { id:'geo_e04', unit:'幾何與證明', difficulty:'easy', question:'等腰三角形兩底角的關係是？', options:['互補','相等','互餘','不相關'], answer:'相等', explanation:'等腰三角形兩腰相等，對應的底角也相等。', concept:'等腰三角形性質', similarQuestion:'等邊三角形每個角各為多少度？' },
      { id:'geo_e05', unit:'幾何與證明', difficulty:'easy', question:'菱形的對角線關係是？', options:['相等且互相垂直','互相垂直但不相等','相等但不垂直','平行'], answer:'互相垂直但不相等', explanation:'菱形的對角線互相垂直平分，但長度不一定相等。', concept:'菱形性質', similarQuestion:'正方形的對角線有何特性？' },
      { id:'geo_e06', unit:'幾何與證明', difficulty:'easy', question:'平行四邊形的對邊關係是？', options:['對邊相等且平行','對邊只是平行','對邊只是相等','對邊垂直'], answer:'對邊相等且平行', explanation:'平行四邊形的兩組對邊分別相等且互相平行。', concept:'平行四邊形基本性質', similarQuestion:'矩形的對邊有何特性？' },
      { id:'geo_e07', unit:'幾何與證明', difficulty:'easy', question:'三角形的外角等於？', options:['兩內角之和','與它相鄰的內角','三內角之和','180°'], answer:'兩內角之和', explanation:'三角形的外角等於不相鄰的兩個內角之和。', concept:'三角形外角定理', similarQuestion:'一個外角為 110°，相鄰的兩個非鄰內角各為多少？' },
      { id:'geo_e08', unit:'幾何與證明', difficulty:'easy', question:'全等三角形的判別條件中，下列哪個是正確的？', options:['邊角邊（SAS）','邊邊角（SSA）','角角角（AAA）','角邊角邊'], answer:'邊角邊（SAS）', explanation:'全等三角形判別：SAS、ASA、AAS、SSS、HL（直角三角形）。SSA 不能判斷全等，AAA 只能判斷相似。', concept:'三角形全等條件', similarQuestion:'ASA 是什麼意思？' },
      { id:'geo_e09', unit:'幾何與證明', difficulty:'easy', question:'兩直線垂直，它們所形成的角為？', options:['30°','45°','60°','90°'], answer:'90°', explanation:'垂直的定義：兩線相交成 90°，稱為互相垂直。', concept:'垂直的定義', similarQuestion:'兩條線相交成 90°，稱為什麼關係？' },
      { id:'geo_e10', unit:'幾何與證明', difficulty:'easy', question:'矩形的對角線關係是？', options:['互相垂直','等長且互相平分','只等長','只互相平分'], answer:'等長且互相平分', explanation:'矩形的對角線等長且互相平分（但不一定垂直）。', concept:'矩形性質', similarQuestion:'正方形的對角線有何特殊性質？' },
      { id:'geo_e11', unit:'幾何與證明', difficulty:'easy', question:'n 邊形的內角和公式為？', options:['(n-2)×180°','n×180°','(n-1)×180°','n×90°'], answer:'(n-2)×180°', explanation:'n 邊形可分成 (n-2) 個三角形，內角和 = (n-2)×180°。', concept:'多邊形內角和', similarQuestion:'五邊形的內角和為多少？' },
      { id:'geo_e12', unit:'幾何與證明', difficulty:'easy', question:'兩平行線被截線截，同側內角（共側內角）的關係是？', options:['相等','互補','互餘','無關係'], answer:'互補', explanation:'平行線被截，同側內角（U形角）互補，即兩角之和為 180°。', concept:'同側內角', similarQuestion:'同側外角有何關係？' },
    ],
    medium: [
      { id:'geo_m01', unit:'幾何與證明', difficulty:'medium', question:'△ABC 中，∠A=∠B，則對應的邊長關係為？', options:['AC=BC','AB=AC','AB=BC','AC>BC'], answer:'AC=BC', explanation:'等角對等邊：∠A 的對邊是 BC，∠B 的對邊是 AC，∠A=∠B 所以 BC=AC。', concept:'等角對等邊', similarQuestion:'若三角形三個角都相等，三邊關係為何？' },
      { id:'geo_m02', unit:'幾何與證明', difficulty:'medium', question:'平行四邊形的對角線，以下何者正確？', options:['相等且互相垂直','互相平分','互相垂直','長度相等'], answer:'互相平分', explanation:'平行四邊形的對角線互相平分，但不一定相等也不一定垂直。', concept:'平行四邊形對角線', similarQuestion:'矩形的對角線有何特性？' },
      { id:'geo_m03', unit:'幾何與證明', difficulty:'medium', question:'△ABC 中，D 是 BC 的中點，則 △ABD 面積是 △ABC 面積的？', options:['1/2','1/4','1/3','2/3'], answer:'1/2', explanation:'D 是 BC 中點，△ABD 與 △ACD 等底（BD=DC）等高，面積相等，各為 △ABC 的 1/2。', concept:'中點與面積', similarQuestion:'若 D 是 BC 的三等分點，△ABD 面積與 △ABC 面積比為？' },
      { id:'geo_m04', unit:'幾何與證明', difficulty:'medium', question:'如果四邊形的對角互補，則此四邊形一定？', options:['是平行四邊形','是矩形','可以內接於圓','是菱形'], answer:'可以內接於圓', explanation:'對角互補是四邊形可以內接圓的充要條件。', concept:'圓內接四邊形充要條件', similarQuestion:'平行四邊形一定可以內接於圓嗎？' },
      { id:'geo_m05', unit:'幾何與證明', difficulty:'medium', question:'△ABC 中，AB=AC，D 在 BC 上，AD⊥BC，則 BD 與 DC 的關係是？', options:['BD>DC','BD<DC','BD=DC','無法確定'], answer:'BD=DC', explanation:'等腰三角形頂角的平分線、中線、高三線合一，AD⊥BC 表示 AD 是高，也是中線，所以 BD=DC。', concept:'等腰三角形三線合一', similarQuestion:'在等腰三角形中，頂角的角平分線與底邊的關係？' },
      { id:'geo_m06', unit:'幾何與證明', difficulty:'medium', question:'四邊形 ABCD 中，若 AB // CD 且 AB = CD，則 ABCD 一定是？', options:['梯形','菱形','平行四邊形','矩形'], answer:'平行四邊形', explanation:'一組對邊平行且相等，則四邊形是平行四邊形。', concept:'平行四邊形判別條件', similarQuestion:'若四邊形兩組對邊分別相等，是否一定是平行四邊形？' },
      { id:'geo_m07', unit:'幾何與證明', difficulty:'medium', question:'△ABC 中，∠C=90°，AB=10，AC=6，BC=8，則三角形的面積為？', options:['24','30','40','48'], answer:'24', explanation:'直角三角形面積 = (1/2)×AC×BC = (1/2)×6×8 = 24。', concept:'直角三角形面積計算', similarQuestion:'若斜邊為 13，兩直角邊為 5 和 12，求面積。' },
      { id:'geo_m08', unit:'幾何與證明', difficulty:'medium', question:'正六邊形的每個內角為多少度？', options:['108°','120°','135°','150°'], answer:'120°', explanation:'六邊形內角和 = (6-2)×180° = 720°，每個內角 = 720°/6 = 120°。', concept:'正多邊形內角', similarQuestion:'正五邊形每個內角為多少度？' },
      { id:'geo_m09', unit:'幾何與證明', difficulty:'medium', question:'△ABC 中，E 是 AC 的中點，D 是 BC 的中點，則中位線 DE 與 AB 的關係是？', options:['DE = AB','DE = AB/2 且 DE // AB','DE // AB 但 DE ≠ AB/2','DE ⊥ AB'], answer:'DE = AB/2 且 DE // AB', explanation:'三角形中位線定理：中位線平行於第三邊且等於第三邊的一半。', concept:'三角形中位線定理', similarQuestion:'若 AB=12，中位線 DE 的長度為多少？' },
      { id:'geo_m10', unit:'幾何與證明', difficulty:'medium', question:'平行四邊形 ABCD 中，∠A=60°，則 ∠B=？', options:['60°','90°','120°','150°'], answer:'120°', explanation:'平行四邊形的鄰角互補，∠A+∠B=180°，∠B=180°-60°=120°。', concept:'平行四邊形鄰角', similarQuestion:'若 ∠A=75°，求 ∠C。' },
    ],
    hard: [
      { id:'geo_h01', unit:'幾何與證明', difficulty:'hard', question:'△ABC 中，AB=AC=5，BC=6，D 是 BC 上一點，BD=2，則 AD=？', options:['√17','√21','4','3'], answer:'√17', explanation:'設 M 是 BC 中點，AM⊥BC，BM=3，AM²=AB²-BM²=25-9=16，AM=4。D 在 BC 上，BD=2，DM=BM-BD=3-2=1，AD²=AM²+DM²=16+1=17，AD=√17。', concept:'等腰三角形中線與高', similarQuestion:'若 BD=4，求 AD。' },
      { id:'geo_h02', unit:'幾何與證明', difficulty:'hard', question:'在△ABC 中，外角 ∠ACD=110°，∠B=50°，則 ∠BAC=？', options:['50°','60°','70°','40°'], answer:'60°', explanation:'∠ACD 是外角，∠ACD = ∠A+∠B，110° = ∠A+50°，∠A = 60°。', concept:'三角形外角定理應用', similarQuestion:'若外角為 130°，∠B=70°，求 ∠A。' },
      { id:'geo_h03', unit:'幾何與證明', difficulty:'hard', question:'菱形 ABCD 中，對角線 AC=6，BD=8，則菱形的面積和邊長各為多少？', options:['面積24，邊長5','面積48，邊長5','面積24，邊長4','面積48，邊長4'], answer:'面積24，邊長5', explanation:'菱形面積 = 對角線乘積/2 = 6×8/2 = 24。邊長 = √((6/2)²+(8/2)²) = √(9+16) = √25 = 5。', concept:'菱形面積與邊長', similarQuestion:'若對角線為 10 和 24，求面積和邊長。' },
      { id:'geo_h04', unit:'幾何與證明', difficulty:'hard', question:'△ABC 中，∠A=36°，AB=AC，∠B=∠C=72°，AD 是 ∠A 的角平分線交 BC 於 D，則 △ABD 與 △BCA 有何關係？', options:['全等','相似','等積','無關係'], answer:'相似', explanation:'∠ABD=72°，∠BAD=36°（∠A的一半），∠ABD+∠BAD+∠ADB=180°，∠ADB=72°。在 △ABD 中 ∠BAD=36°，∠ABD=72°，∠ADB=72°。與 △BCA：∠A=36°，∠B=∠C=72°，角度完全對應，所以 △ABD ∼ △BCA（AA）。', concept:'黃金三角形的相似性', similarQuestion:'在此三角形中，AB:BD 等於多少？' },
      { id:'geo_h05', unit:'幾何與證明', difficulty:'hard', question:'凸五邊形的外角和為多少度？', options:['180°','360°','540°','720°'], answer:'360°', explanation:'任何凸多邊形的外角和都等於 360°，這是多邊形外角和定理。', concept:'多邊形外角和', similarQuestion:'十邊形的外角和為多少？每個外角為多少度？' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // 幾何與座標
  // ════════════════════════════════════════════════════════════
  coordinate: {
    easy: [
      { id:'coo_e01', unit:'幾何與座標', difficulty:'easy', question:'點 A(-3, 4) 在第幾象限？', options:['第一象限','第二象限','第三象限','第四象限'], answer:'第二象限', explanation:'第二象限：x<0，y>0。A(-3,4) 滿足 x=-3<0，y=4>0，在第二象限。', concept:'座標平面與象限', similarQuestion:'點 B(2,-5) 在第幾象限？' },
      { id:'coo_e02', unit:'幾何與座標', difficulty:'easy', question:'點 (0, 5) 在座標平面的哪個位置？', options:['原點','x軸上','y軸上','第一象限'], answer:'y軸上', explanation:'x=0 的點在 y 軸上（不在任何象限）。', concept:'座標軸上的點', similarQuestion:'點 (-3, 0) 在哪個軸上？' },
      { id:'coo_e03', unit:'幾何與座標', difficulty:'easy', question:'兩點 A(1,1) 和 B(4,5) 的距離為？', options:['5','3','4','7'], answer:'5', explanation:'距離公式：d = √[(4-1)²+(5-1)²] = √[9+16] = √25 = 5。', concept:'兩點距離公式', similarQuestion:'A(0,0) 與 B(3,4) 的距離為？' },
      { id:'coo_e04', unit:'幾何與座標', difficulty:'easy', question:'A(2,4) 和 B(6,4) 的中點座標為？', options:['(4,4)','(4,8)','(8,4)','(4,2)'], answer:'(4,4)', explanation:'中點公式：((2+6)/2, (4+4)/2) = (4, 4)。', concept:'兩點中點公式', similarQuestion:'A(-2,3) 和 B(4,7) 的中點為？' },
      { id:'coo_e05', unit:'幾何與座標', difficulty:'easy', question:'原點的座標是？', options:['(1,1)','(0,1)','(0,0)','(1,0)'], answer:'(0,0)', explanation:'原點是 x 軸與 y 軸的交點，座標為 (0,0)。', concept:'原點定義', similarQuestion:'哪個點在所有象限的中心？' },
      { id:'coo_e06', unit:'幾何與座標', difficulty:'easy', question:'點 A(3,-2) 關於 x 軸的對稱點為？', options:['(-3,-2)','(3,2)','(-3,2)','(-2,3)'], answer:'(3,2)', explanation:'關於 x 軸對稱：x 不變，y 變號。(3,-2) 的 x 軸對稱點是 (3,2)。', concept:'座標的對稱', similarQuestion:'(4,3) 關於 y 軸的對稱點為？' },
      { id:'coo_e07', unit:'幾何與座標', difficulty:'easy', question:'點 (5, -3) 在第幾象限？', options:['第一象限','第二象限','第三象限','第四象限'], answer:'第四象限', explanation:'第四象限：x>0，y<0。(5,-3) 滿足 x=5>0，y=-3<0，在第四象限。', concept:'座標平面與象限', similarQuestion:'(-2,-4) 在第幾象限？' },
      { id:'coo_e08', unit:'幾何與座標', difficulty:'easy', question:'A(0,0) 到 B(6,8) 的距離為？', options:['10','8','6','14'], answer:'10', explanation:'d = √(6²+8²) = √(36+64) = √100 = 10。', concept:'兩點距離公式', similarQuestion:'A(0,0) 到 B(5,12) 的距離為？' },
      { id:'coo_e09', unit:'幾何與座標', difficulty:'easy', question:'A(-2,3) 和 B(4,-1) 的中點座標為？', options:['(1,1)','(2,2)','(1,2)','(3,1)'], answer:'(1,1)', explanation:'中點 M = ((-2+4)/2, (3+(-1))/2) = (1, 1)。', concept:'兩點中點公式', similarQuestion:'若中點為 (2,3)，A=(0,1)，求 B 座標。' },
      { id:'coo_e10', unit:'幾何與座標', difficulty:'easy', question:'點 A(-4, -7) 在哪個象限？', options:['第一象限','第二象限','第三象限','第四象限'], answer:'第三象限', explanation:'第三象限：x<0，y<0。(-4,-7) 均為負，在第三象限。', concept:'座標平面與象限', similarQuestion:'座標 (-1, 1) 在第幾象限？' },
      { id:'coo_e11', unit:'幾何與座標', difficulty:'easy', question:'x 軸上，橫座標為 5 的點座標是？', options:['(5,0)','(0,5)','(5,5)','(-5,0)'], answer:'(5,0)', explanation:'x 軸上的點 y 座標為 0，所以是 (5,0)。', concept:'座標軸上的點座標', similarQuestion:'y 軸上，縱座標為 -3 的點座標是？' },
      { id:'coo_e12', unit:'幾何與座標', difficulty:'easy', question:'點 A(a, b)，若 a>0 且 b<0，則此點在第幾象限？', options:['第一象限','第二象限','第三象限','第四象限'], answer:'第四象限', explanation:'x>0，y<0 是第四象限的條件。', concept:'象限條件判斷', similarQuestion:'若 a<0 且 b>0，點 (a,b) 在第幾象限？' },
    ],
    medium: [
      { id:'coo_m01', unit:'幾何與座標', difficulty:'medium', question:'直線通過 A(0,3) 和 B(2,7)，其斜率為？', options:['2','4','1/2','3'], answer:'2', explanation:'斜率 m = (y₂-y₁)/(x₂-x₁) = (7-3)/(2-0) = 4/2 = 2。', concept:'直線斜率', similarQuestion:'通過 (1,2) 和 (3,6) 的直線斜率為？' },
      { id:'coo_m02', unit:'幾何與座標', difficulty:'medium', question:'A(1,2), B(5,2), C(5,6) 三點圍成的三角形面積為？', options:['8','4','16','12'], answer:'8', explanation:'直角三角形，底 = 5-1=4，高 = 6-2=4，面積 = (1/2)×4×4 = 8。', concept:'座標平面上三角形面積', similarQuestion:'A(0,0), B(6,0), C(0,4) 圍成的三角形面積？' },
      { id:'coo_m03', unit:'幾何與座標', difficulty:'medium', question:'A(-1,3) 和 B(5,-1) 的中點 M 座標為？', options:['(2,1)','(3,2)','(1,2)','(2,2)'], answer:'(2,1)', explanation:'中點 M = ((-1+5)/2, (3+(-1))/2) = (2, 1)。', concept:'中點公式', similarQuestion:'若 M 是 AB 中點，M=(1,2)，A=(−2,4)，求 B 座標。' },
      { id:'coo_m04', unit:'幾何與座標', difficulty:'medium', question:'通過點 (2,3)，斜率為 2 的直線方程式為？', options:['y=2x-1','y=2x+1','y=2x-3','y=2x+2'], answer:'y=2x-1', explanation:'代入 y-3 = 2(x-2)，y-3 = 2x-4，y = 2x-1。', concept:'直線方程式', similarQuestion:'通過 (1,-2)，斜率為 3，直線方程式？' },
      { id:'coo_m05', unit:'幾何與座標', difficulty:'medium', question:'A(2,1)、B(8,1)、C(8,5) 三點圍成的三角形面積為？', options:['12','6','24','18'], answer:'12', explanation:'底 = 8-2=6，高 = 5-1=4，面積 = (1/2)×6×4 = 12。', concept:'座標三角形面積', similarQuestion:'A(0,0), B(4,0), C(2,6) 圍成三角形面積？' },
      { id:'coo_m06', unit:'幾何與座標', difficulty:'medium', question:'已知 A(1,3) 和 B(7,3)，中點 M 的座標以及 AB 的長度為？', options:['M=(4,3), AB=6','M=(4,6), AB=6','M=(4,3), AB=12','M=(3,4), AB=6'], answer:'M=(4,3), AB=6', explanation:'中點 M = ((1+7)/2,(3+3)/2) = (4,3)；AB = √((7-1)²+(3-3)²) = √36 = 6。', concept:'中點公式與兩點距離', similarQuestion:'A(2,5) 和 B(8,5)，求中點和距離。' },
      { id:'coo_m07', unit:'幾何與座標', difficulty:'medium', question:'直線 y=3x+2 的斜率和 y 截距分別為？', options:['斜率3，y截距2','斜率2，y截距3','斜率-3，y截距2','斜率3，y截距-2'], answer:'斜率3，y截距2', explanation:'斜截式 y=mx+b，m 是斜率，b 是 y 截距。y=3x+2 中 m=3，b=2。', concept:'直線斜截式', similarQuestion:'y=-2x+5 的斜率和截距？' },
      { id:'coo_m08', unit:'幾何與座標', difficulty:'medium', question:'通過 A(1,4) 和 B(3,-2) 的直線斜率為？', options:['-3','3','-2','2'], answer:'-3', explanation:'斜率 m = (-2-4)/(3-1) = -6/2 = -3。', concept:'由兩點求斜率', similarQuestion:'通過 (-1,5) 和 (2,-4) 的斜率？' },
      { id:'coo_m09', unit:'幾何與座標', difficulty:'medium', question:'兩點 P(1,2) 和 Q(4,6) 的距離為？', options:['5','3','4','7'], answer:'5', explanation:'d = √((4-1)²+(6-2)²) = √(9+16) = √25 = 5。', concept:'兩點距離公式', similarQuestion:'P(0,0) 到 Q(5,12) 的距離？' },
      { id:'coo_m10', unit:'幾何與座標', difficulty:'medium', question:'若 A(2,k) 和 B(5,3) 的距離為 5，則 k=？', options:['7或-1','6或0','5或1','無解'], answer:'7或-1', explanation:'(5-2)²+(3-k)² = 25，9+(3-k)²=25，(3-k)²=16，3-k=±4，k=-1 或 k=7。', concept:'利用距離公式求未知座標', similarQuestion:'若 A(1,k) 到 B(4,2) 距離為 √13，求 k。' },
    ],
    hard: [
      { id:'coo_h01', unit:'幾何與座標', difficulty:'hard', question:'A(1,1), B(4,2), C(3,5) 三點圍成的三角形面積為？', options:['5','4','6','7'], answer:'5', explanation:'鞋帶公式：面積=(1/2)|1(2-5)+4(5-1)+3(1-2)| = (1/2)|(-3)+16+(-3)| = (1/2)(10) = 5。', concept:'三角形面積—鞋帶公式', similarQuestion:'若三頂點為 (0,0),(6,0),(3,4)，求面積。' },
      { id:'coo_h02', unit:'幾何與座標', difficulty:'hard', question:'以 A(1,3) 和 B(5,7) 為直徑的圓，圓心座標為？', options:['(3,5)','(2,5)','(3,4)','(6,10)'], answer:'(3,5)', explanation:'圓心是直徑的中點，中點 = ((1+5)/2,(3+7)/2) = (3,5)。', concept:'直徑中點為圓心', similarQuestion:'以此為圓心的圓半徑為多少？' },
      { id:'coo_h03', unit:'幾何與座標', difficulty:'hard', question:'平行四邊形三頂點為 A(1,0)、B(4,0)、C(5,3)，則第四頂點 D 的座標為？', options:['(2,3)','(3,3)','(0,3)','(1,3)'], answer:'(2,3)', explanation:'平行四邊形 ABCD：AB 向量=(3,0)，DC 也應為 (3,0)，D = C-(3,0) = (5-3,3-0) = (2,3)。', concept:'平行四邊形座標計算', similarQuestion:'若 A(0,0)，B(4,0)，C(6,3)，求 D。' },
      { id:'coo_h04', unit:'幾何與座標', difficulty:'hard', question:'A(2,1)、B(6,1)、C(6,4)、D(2,4) 四點圍成的圖形面積為？', options:['12','8','16','24'], answer:'12', explanation:'ABCD 是矩形（兩組對邊分別水平和垂直），寬 = 6-2=4，高 = 4-1=3，面積 = 4×3 = 12。', concept:'矩形面積計算', similarQuestion:'A(0,0)、B(5,0)、C(5,4)、D(0,4) 的面積？' },
      { id:'coo_h05', unit:'幾何與座標', difficulty:'hard', question:'直線通過 A(-2,5) 和 B(4,2)，其方程式為？', options:['y=-x/2+4','y=-x/2+5','y=2x+4','y=x/2+6'], answer:'y=-x/2+4', explanation:'斜率 m=(2-5)/(4-(-2))=-3/6=-1/2。用點斜式：y-2=-1/2(x-4)，y=-x/2+2+2，y=-x/2+4。', concept:'由兩點求直線方程式', similarQuestion:'通過 (1,6) 和 (3,2) 的直線方程式？' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // 二次函數
  // ════════════════════════════════════════════════════════════
  quadratic: {
    easy: [
      { id:'qua_e01', unit:'二次函數', difficulty:'easy', question:'y=2x²-4x+1 的開口方向是？', options:['向上','向下','向左','向右'], answer:'向上', explanation:'二次函數 y=ax²+bx+c，a=2>0，拋物線開口向上。', concept:'拋物線開口方向', similarQuestion:'y=-3x²+2x-1 的開口方向？' },
      { id:'qua_e02', unit:'二次函數', difficulty:'easy', question:'y=x²-4x+3 的對稱軸為？', options:['x=2','x=-2','x=4','x=1'], answer:'x=2', explanation:'對稱軸 x = -b/(2a) = -(-4)/(2×1) = 2。', concept:'對稱軸公式', similarQuestion:'y=2x²+8x-3 的對稱軸為？' },
      { id:'qua_e03', unit:'二次函數', difficulty:'easy', question:'y=(x-3)²+2 的頂點座標為？', options:['(3,2)','(-3,2)','(3,-2)','(-3,-2)'], answer:'(3,2)', explanation:'頂點式 y=a(x-h)²+k，頂點為 (h,k)，即 (3,2)。', concept:'頂點式與頂點', similarQuestion:'y=(x+1)²-5 的頂點為？' },
      { id:'qua_e04', unit:'二次函數', difficulty:'easy', question:'y=-x²+4 的最大值為？', options:['4','0','-4','無最大值'], answer:'4', explanation:'a=-1<0，開口向下，有最大值。頂點在 (0,4)，最大值為 4。', concept:'最大值與最小值', similarQuestion:'y=x²-9 的最小值為？' },
      { id:'qua_e05', unit:'二次函數', difficulty:'easy', question:'二次函數的圖形稱為？', options:['直線','折線','拋物線','橢圓'], answer:'拋物線', explanation:'二次函數 y=ax²+bx+c（a≠0）的圖形是拋物線。', concept:'拋物線定義', similarQuestion:'一次函數的圖形是什麼？' },
      { id:'qua_e06', unit:'二次函數', difficulty:'easy', question:'y=x²-6x+9 可以化簡為？', options:['(x-3)²','(x+3)²','(x-3)²+1','(x-3)²-9'], answer:'(x-3)²', explanation:'x²-6x+9 = (x-3)²，是完全平方式。', concept:'完全平方式', similarQuestion:'x²+4x+4 能化成什麼形式？' },
      { id:'qua_e07', unit:'二次函數', difficulty:'easy', question:'y=3x² 的圖形，頂點座標為？', options:['(0,0)','(3,0)','(0,3)','(1,3)'], answer:'(0,0)', explanation:'y=3x² 沒有常數項，頂點在原點 (0,0)。', concept:'標準式二次函數頂點', similarQuestion:'y=-5x² 的頂點為？' },
      { id:'qua_e08', unit:'二次函數', difficulty:'easy', question:'y=x²+2x+1，x=0 時，y=？', options:['0','1','2','3'], answer:'1', explanation:'代入 x=0：y=0²+2(0)+1=1。', concept:'代入計算函數值', similarQuestion:'y=2x²-3，x=2 時，y=？' },
      { id:'qua_e09', unit:'二次函數', difficulty:'easy', question:'y=-2x²+8 的開口方向和頂點為？', options:['向下，(0,8)','向上，(0,8)','向下，(0,-8)','向上，(0,0)'], answer:'向下，(0,8)', explanation:'a=-2<0，開口向下；b=0，對稱軸 x=0，y(0)=8，頂點(0,8)。', concept:'二次函數基本圖形', similarQuestion:'y=x²-4 的頂點為？' },
      { id:'qua_e10', unit:'二次函數', difficulty:'easy', question:'y=x²-2x-3，令 y=0，則 x=？', options:['x=3 或 x=-1','x=-3 或 x=1','x=3 或 x=1','x=-3 或 x=-1'], answer:'x=3 或 x=-1', explanation:'x²-2x-3=0，因式分解 (x-3)(x+1)=0，x=3 或 x=-1。', concept:'二次方程式求根', similarQuestion:'y=x²+x-6，令 y=0，求 x。' },
      { id:'qua_e11', unit:'二次函數', difficulty:'easy', question:'y=ax²+bx+c 中，a 的正負決定什麼？', options:['頂點位置','對稱軸','開口方向','y截距'], answer:'開口方向', explanation:'a>0 開口向上，a<0 開口向下，a 的正負決定開口方向。', concept:'係數 a 的意義', similarQuestion:'b 決定什麼？c 決定什麼？' },
      { id:'qua_e12', unit:'二次函數', difficulty:'easy', question:'y=(x+2)²-3 的頂點是？', options:['(-2,-3)','(2,-3)','(-2,3)','(2,3)'], answer:'(-2,-3)', explanation:'頂點式 y=a(x-h)²+k，頂點為 (h,k)=(−2,−3)。', concept:'由頂點式讀取頂點', similarQuestion:'y=(x-1)²+5 的頂點為？' },
    ],
    medium: [
      { id:'qua_m01', unit:'二次函數', difficulty:'medium', question:'y=x²-6x+5 的頂點座標為？', options:['(3,-4)','(-3,4)','(3,4)','(-3,-4)'], answer:'(3,-4)', explanation:'對稱軸 x=6/2=3，代入 y=9-18+5=-4，頂點 (3,-4)。', concept:'頂點計算', similarQuestion:'y=2x²-4x+3 的頂點座標？' },
      { id:'qua_m02', unit:'二次函數', difficulty:'medium', question:'y=2x²-8x+6 的最小值為？', options:['-2','6','-6','2'], answer:'-2', explanation:'a=2>0，有最小值。對稱軸 x=8/4=2，y(2)=2(4)-8(2)+6=8-16+6=-2。', concept:'最小值計算', similarQuestion:'y=x²-4x+7 的最小值？' },
      { id:'qua_m03', unit:'二次函數', difficulty:'medium', question:'拋物線 y=ax²+bx+c 通過原點 (0,0)，則哪個值為 0？', options:['a','b','c','a+b+c'], answer:'c', explanation:'代入 x=0，y=0：0=a(0)+b(0)+c，得 c=0。', concept:'拋物線過原點條件', similarQuestion:'若拋物線通過 (1,0)，則 a+b+c=？' },
      { id:'qua_m04', unit:'二次函數', difficulty:'medium', question:'y=x²-4x+3，求其頂點、對稱軸、開口方向？', options:['頂點(2,-1)，x=2，向上','頂點(-2,1)，x=-2，向上','頂點(2,-1)，x=2，向下','頂點(-2,-1)，x=-2，向上'], answer:'頂點(2,-1)，x=2，向上', explanation:'a=1>0 向上；x=-b/2a=4/2=2；y(2)=4-8+3=-1；頂點(2,-1)，對稱軸 x=2。', concept:'二次函數圖形分析', similarQuestion:'y=-x²+2x+3 的頂點和開口？' },
      { id:'qua_m05', unit:'二次函數', difficulty:'medium', question:'y=-x²+6x-5 的最大值為？', options:['4','5','6','9'], answer:'4', explanation:'a=-1<0，有最大值。對稱軸 x=6/2=3，y(3)=-9+18-5=4。', concept:'最大值計算', similarQuestion:'y=-2x²+4x+1 的最大值？' },
      { id:'qua_m06', unit:'二次函數', difficulty:'medium', question:'二次函數 y=x²-2x-8，令 y=0 的解為？', options:['x=4 或 x=-2','x=-4 或 x=2','x=4 或 x=2','x=-4 或 x=-2'], answer:'x=4 或 x=-2', explanation:'x²-2x-8=0，(x-4)(x+2)=0，x=4 或 x=-2。', concept:'二次方程式求解', similarQuestion:'y=x²+3x-10，令 y=0 的解？' },
      { id:'qua_m07', unit:'二次函數', difficulty:'medium', question:'將 y=x²-4x+7 配方後的頂點式？', options:['(x-2)²+3','(x+2)²+3','(x-2)²-3','(x-2)²+7'], answer:'(x-2)²+3', explanation:'y=x²-4x+7=（x²-4x+4）-4+7=(x-2)²+3。', concept:'配方法', similarQuestion:'y=x²+6x+10 配方後的頂點式？' },
      { id:'qua_m08', unit:'二次函數', difficulty:'medium', question:'y=2x²-12x+14，對稱軸和最小值為？', options:['x=3，最小值-4','x=-3，最小值-4','x=3，最小值4','x=6，最小值4'], answer:'x=3，最小值-4', explanation:'x=-b/2a=12/4=3；y(3)=2(9)-12(3)+14=18-36+14=-4。', concept:'對稱軸與最小值計算', similarQuestion:'y=3x²-6x+5 的最小值？' },
      { id:'qua_m09', unit:'二次函數', difficulty:'medium', question:'拋物線 y=ax²+bx+c，若頂點為 (1,3)，且過點 (0,4)，則 a=？', options:['1','2','-1','4'], answer:'1', explanation:'頂點式 y=a(x-1)²+3，過 (0,4)：4=a(0-1)²+3=a+3，a=1。', concept:'由頂點和一點求二次函數', similarQuestion:'頂點(2,-1)，過點(0,3)，求 a。' },
      { id:'qua_m10', unit:'二次函數', difficulty:'medium', question:'一球以初速度往上拋，高度 h=20t-5t²（t 秒），最高點何時？高度為多少？', options:['t=2時，h=20','t=2時，h=18','t=4時，h=20','t=1時，h=15'], answer:'t=2時，h=20', explanation:'h=-5t²+20t，對稱軸 t=20/10=2，h(2)=-5(4)+40=20。', concept:'二次函數應用—拋體問題', similarQuestion:'若 h=30t-5t²，求最大高度及對應時間。' },
    ],
    hard: [
      { id:'qua_h01', unit:'二次函數', difficulty:'hard', question:'將 y=2x²-12x+14 化為頂點式，頂點座標為？', options:['(3,-4)','(-3,-4)','(3,4)','(-3,4)'], answer:'(3,-4)', explanation:'y=2(x²-6x)+14=2(x²-6x+9-9)+14=2(x-3)²-18+14=2(x-3)²-4，頂點(3,-4)。', concept:'配方法求頂點', similarQuestion:'y=3x²-6x+1 的頂點座標？' },
      { id:'qua_h02', unit:'二次函數', difficulty:'hard', question:'y=ax²+bx+c 的拋物線通過 (0,2)、(1,0)、(-1,6)，則 a+b+c=？', options:['0','1','2','-1'], answer:'0', explanation:'代入三點：c=2，a+b+c=0（代入x=1,y=0），a-b+c=6（代入x=-1,y=6）。由第二式 a+b=−2，由第三式 a-b=4，解得 a=1，b=-3，c=2，a+b+c=0。', concept:'三點決定二次函數', similarQuestion:'通過 (0,0)，(1,2)，(-1,2) 的拋物線方程式？' },
      { id:'qua_h03', unit:'二次函數', difficulty:'hard', question:'一個矩形的長加寬為 20，若長=x，面積 S=x(20-x)，面積最大時 x=？', options:['10','8','12','5'], answer:'10', explanation:'S=-x²+20x，對稱軸 x=20/2=10，面積最大時 x=10。', concept:'二次函數應用—最大面積', similarQuestion:'若周長為 24，面積最大時邊長為多少？' },
      { id:'qua_h04', unit:'二次函數', difficulty:'hard', question:'y=-x²+4x+k，若此函數有兩個不同零點，則 k 的範圍為？', options:['k>-4','k<4','k>4','k<-4'], answer:'k>-4', explanation:'判別式 Δ=b²-4ac=16+4k>0，k>-4。', concept:'判別式與零點個數', similarQuestion:'y=x²-6x+k 有兩不同零點，k 的範圍？' },
      { id:'qua_h05', unit:'二次函數', difficulty:'hard', question:'拋物線 y=x²-4x+3 與 x 軸的兩交點距離為？', options:['2','3','4','1'], answer:'2', explanation:'x²-4x+3=0，(x-1)(x-3)=0，x=1 或 x=3，兩交點距離=|3-1|=2。', concept:'拋物線與 x 軸交點距離', similarQuestion:'y=x²-5x+6 與 x 軸的兩交點距離？' },
    ],
  },

  // ════════════════════════════════════════════════════════════
  // 統計與機率
  // ════════════════════════════════════════════════════════════
  statistics: {
    easy: [
      { id:'sta_e01', unit:'統計與機率', difficulty:'easy', question:'數據 3, 7, 5, 9, 1 的平均數為？', options:['4','5','6','7'], answer:'5', explanation:'平均數 = (3+7+5+9+1)/5 = 25/5 = 5。', concept:'平均數計算', similarQuestion:'數據 2,4,6,8,10 的平均數？' },
      { id:'sta_e02', unit:'統計與機率', difficulty:'easy', question:'從標準撲克牌（52 張）中任抽一張，抽到紅心的機率是？', options:['1/4','1/2','1/13','1/52'], answer:'1/4', explanation:'紅心有 13 張，總共 52 張，機率 = 13/52 = 1/4。', concept:'古典機率', similarQuestion:'從 52 張牌中抽到 A（包含四種花色）的機率？' },
      { id:'sta_e03', unit:'統計與機率', difficulty:'easy', question:'數據 2, 4, 4, 6, 8 的眾數為？', options:['2','4','6','8'], answer:'4', explanation:'眾數是出現次數最多的數，4 出現了 2 次，是眾數。', concept:'眾數', similarQuestion:'資料 1,2,2,3,3,3 的眾數為？' },
      { id:'sta_e04', unit:'統計與機率', difficulty:'easy', question:'數據由小到大排列：1, 3, 5, 7, 9，中位數為？', options:['3','5','6','7'], answer:'5', explanation:'中位數是排序後中間的數，5 個數中間是第 3 個，即 5。', concept:'中位數', similarQuestion:'6 個數據的中位數如何求？' },
      { id:'sta_e05', unit:'統計與機率', difficulty:'easy', question:'一個事件發生的機率 P，範圍是？', options:['0≤P≤1','0<P<1','-1≤P≤1','P>0'], answer:'0≤P≤1', explanation:'機率 P(A) 的範圍是 0 到 1，P=0 不可能，P=1 必然。', concept:'機率的範圍', similarQuestion:'若某事件一定不會發生，機率為多少？' },
      { id:'sta_e06', unit:'統計與機率', difficulty:'easy', question:'擲一個骰子，出現 3 點的機率是？', options:['1/2','1/3','1/6','3/6'], answer:'1/6', explanation:'骰子有 6 面，出現 3 點只有 1 個結果，機率 = 1/6。', concept:'古典機率計算', similarQuestion:'擲骰子出現偶數的機率？' },
      { id:'sta_e07', unit:'統計與機率', difficulty:'easy', question:'數據 10, 20, 30, 40, 50 的平均數為？', options:['25','30','35','20'], answer:'30', explanation:'平均數 = (10+20+30+40+50)/5 = 150/5 = 30。', concept:'平均數計算', similarQuestion:'數據 5,10,15,20 的平均數？' },
      { id:'sta_e08', unit:'統計與機率', difficulty:'easy', question:'擲一枚硬幣，出現正面的機率是？', options:['1/4','1/3','1/2','1'], answer:'1/2', explanation:'硬幣有正反兩面，出現正面機率 = 1/2。', concept:'簡單機率', similarQuestion:'連擲兩次硬幣，兩次都正面的機率？' },
      { id:'sta_e09', unit:'統計與機率', difficulty:'easy', question:'數據 5, 5, 5, 5, 5 的眾數、中位數、平均數各是多少？', options:['都是5','眾數5，其他不同','無眾數','中位數不是5'], answer:'都是5', explanation:'全部相同，眾數=中位數=平均數=5。', concept:'三種代表值', similarQuestion:'若所有數據相同，三種代表值有何關係？' },
      { id:'sta_e10', unit:'統計與機率', difficulty:'easy', question:'不可能發生的事件，其機率為？', options:['0','1','0.5','無限大'], answer:'0', explanation:'不可能事件的機率為 0。', concept:'特殊機率值', similarQuestion:'必然事件的機率為多少？' },
      { id:'sta_e11', unit:'統計與機率', difficulty:'easy', question:'數據 1, 2, 3, 4, 5, 6 的中位數為？', options:['3','3.5','4','2.5'], answer:'3.5', explanation:'偶數個數據，中位數 = (第3個+第4個)/2 = (3+4)/2 = 3.5。', concept:'偶數個數據的中位數', similarQuestion:'數據 2,4,6,8 的中位數？' },
      { id:'sta_e12', unit:'統計與機率', difficulty:'easy', question:'袋中有 3 顆紅球和 7 顆白球，隨機取一顆，取到紅球的機率？', options:['3/10','7/10','1/3','3/7'], answer:'3/10', explanation:'機率 = 紅球數/總球數 = 3/(3+7) = 3/10。', concept:'古典機率基本計算', similarQuestion:'取到白球的機率為多少？' },
    ],
    medium: [
      { id:'sta_m01', unit:'統計與機率', difficulty:'medium', question:'數據 5, 8, 12, 15, 20 的中位數是？', options:['12','13','10','15'], answer:'12', explanation:'5 個數排序後中間第 3 個是 12。', concept:'中位數計算', similarQuestion:'數據 1,3,5,7,9,11 的中位數？' },
      { id:'sta_m02', unit:'統計與機率', difficulty:'medium', question:'袋子裡有 4 顆紅球和 6 顆白球，隨機取一顆，取到紅球的機率？', options:['4/10','6/10','2/5','3/5'], answer:'2/5', explanation:'機率 = 4/(4+6) = 4/10 = 2/5。', concept:'機率計算', similarQuestion:'取到白球的機率是多少？' },
      { id:'sta_m03', unit:'統計與機率', difficulty:'medium', question:'數據組的平均數為 10，加入一個新資料 12 後，新平均數為 11，則原來有幾個資料？', options:['1','2','3','4'], answer:'1', explanation:'設原有 n 個，(10n+12)/(n+1)=11，10n+12=11n+11，n=1。', concept:'平均數逆推', similarQuestion:'若原有 3 個資料平均 8，加入一個後平均 9，新加入的是多少？' },
      { id:'sta_m04', unit:'統計與機率', difficulty:'medium', question:'從 1 到 10 隨機選一個整數，選到偶數的機率？', options:['1/2','2/5','3/5','3/10'], answer:'1/2', explanation:'偶數有 2,4,6,8,10，共 5 個，機率 = 5/10 = 1/2。', concept:'列舉法求機率', similarQuestion:'從 1 到 10 選一個 3 的倍數的機率？' },
      { id:'sta_m05', unit:'統計與機率', difficulty:'medium', question:'5 個數據的平均數為 8，若加入一個數後平均數為 7，則加入的數為？', options:['2','3','4','5'], answer:'2', explanation:'原總和=5×8=40，加入後總和=6×7=42，加入的數=42-40=2。', concept:'加入新數後的平均數', similarQuestion:'若加入後平均數為 10，加入的數為多少？' },
      { id:'sta_m06', unit:'統計與機率', difficulty:'medium', question:'從 1 到 20 中選一個整數，選到 5 的倍數的機率？', options:['1/4','1/5','1/10','2/5'], answer:'1/5', explanation:'5 的倍數：5,10,15,20，共 4 個，機率 = 4/20 = 1/5。', concept:'倍數機率', similarQuestion:'從 1 到 30 選一個整數，是 3 的倍數的機率？' },
      { id:'sta_m07', unit:'統計與機率', difficulty:'medium', question:'一組數據：3,5,7,9,x，平均數為 6，求 x。', options:['6','4','5','8'], answer:'6', explanation:'(3+5+7+9+x)/5=6，24+x=30，x=6。', concept:'利用平均數求未知數', similarQuestion:'數據 2,4,6,8,x 平均數為 5，x=？' },
      { id:'sta_m08', unit:'統計與機率', difficulty:'medium', question:'擲兩個骰子，兩點數之和為 7 的機率？', options:['1/6','5/36','6/36','7/36'], answer:'1/6', explanation:'總共 36 種結果，和為 7：(1,6)(2,5)(3,4)(4,3)(5,2)(6,1)，共 6 種，機率=6/36=1/6。', concept:'兩個骰子機率', similarQuestion:'兩點數之和為 12 的機率？' },
      { id:'sta_m09', unit:'統計與機率', difficulty:'medium', question:'數據 6,3,9,2,8,5,1,7,4 的中位數是？', options:['5','4','6','3'], answer:'5', explanation:'排序後：1,2,3,4,5,6,7,8,9，共 9 個，中間第 5 個是 5。', concept:'中位數排序法', similarQuestion:'數據 8,2,5,1,9,3 的中位數？' },
      { id:'sta_m10', unit:'統計與機率', difficulty:'medium', question:'一個盒子有 5 顆白球、3 顆紅球、2 顆黑球，取出 1 顆，取到非黑球的機率？', options:['8/10','4/5','2/5','1/5'], answer:'4/5', explanation:'非黑球有 5+3=8 顆，機率=8/10=4/5。', concept:'補集機率計算', similarQuestion:'取到非紅球的機率？' },
    ],
    hard: [
      { id:'sta_h01', unit:'統計與機率', difficulty:'hard', question:'從 1 到 10 隨機選兩個不同的整數，兩數之和為偶數的機率？', options:['4/9','5/9','2/5','1/2'], answer:'4/9', explanation:'兩數之和為偶數：兩偶或兩奇。偶{2,4,6,8,10}選2：C(5,2)=10；奇{1,3,5,7,9}選2：C(5,2)=10；總=C(10,2)=45；機率=20/45=4/9。', concept:'組合機率', similarQuestion:'從 1 到 8 選兩個不同整數，之和為奇數的機率？' },
      { id:'sta_h02', unit:'統計與機率', difficulty:'hard', question:'袋中有 5 顆紅球、3 顆白球、2 顆藍球，不放回連取 2 顆，兩顆都是紅球的機率為？', options:['2/9','1/5','5/18','2/5'], answer:'2/9', explanation:'第一顆取到紅球：5/10=1/2，第二顆仍為紅球：4/9。機率=1/2×4/9=4/18=2/9。', concept:'不放回的連續機率', similarQuestion:'連取2顆，第一紅第二白的機率？' },
      { id:'sta_h03', unit:'統計與機率', difficulty:'hard', question:'擲三枚硬幣，恰好出現兩個正面的機率？', options:['1/4','3/8','1/2','1/3'], answer:'3/8', explanation:'總共 2³=8 種結果，恰好兩正面：HHT、HTH、THH 共 3 種，機率=3/8。', concept:'三枚硬幣機率', similarQuestion:'擲三枚硬幣，至少一個正面的機率？' },
      { id:'sta_h04', unit:'統計與機率', difficulty:'hard', question:'數據組 a₁,a₂,...,a₁₀ 的平均數為 5，另一組 b₁,b₂,...,b₅ 的平均數為 8，則合併後 15 個數的平均數為？', options:['6','6.5','7','5.5'], answer:'6', explanation:'a 組總和=10×5=50，b 組總和=5×8=40，合計=90，平均=90/15=6。', concept:'加權平均數', similarQuestion:'若 a 組 20 個平均 6，b 組 10 個平均 9，合併後平均？' },
      { id:'sta_h05', unit:'統計與機率', difficulty:'hard', question:'從 52 張撲克牌中，隨機抽 2 張（不放回），兩張都是 A 的機率？', options:['1/221','4/52','1/169','16/2704'], answer:'1/221', explanation:'第一張是 A 的機率=4/52，第二張也是 A（剩 3 張 A，51 張牌）=3/51。機率=4/52×3/51=12/2652=1/221。', concept:'不放回的條件機率', similarQuestion:'抽 2 張，第一張黑色第二張紅色的機率？' },
    ],
  },
};

// ---------- 本地儲存管理 ----------
const Storage = {
  KEY_ERRORS: 'edumath_errors',
  KEY_PROGRESS: 'edumath_progress',
  KEY_HISTORY: 'edumath_history',
  KEY_WATCHED: 'edumath_watched',
 feature/昕旂-技術開發
  KEY_QUIZ_HISTORY: 'edumath_quiz_question_history',

 main

  getErrors() {
    try { return JSON.parse(localStorage.getItem(this.KEY_ERRORS) || '[]'); } catch { return []; }
  },
  saveErrors(errors) {
    localStorage.setItem(this.KEY_ERRORS, JSON.stringify(errors));
  },
  addError(errorObj) {
    const errors = this.getErrors();
    const existIdx = errors.findIndex(e => e.questionId === errorObj.questionId);
    if (existIdx >= 0) {
      errors[existIdx] = { ...errors[existIdx], ...errorObj, count: (errors[existIdx].count||1)+1 };
    } else {
      errors.push({ ...errorObj, count: 1, learned: false });
    }
    this.saveErrors(errors);
  },
  markLearned(questionId, val) {
    const errors = this.getErrors();
    const idx = errors.findIndex(e => e.questionId === questionId);
    if (idx >= 0) { errors[idx].learned = val; this.saveErrors(errors); }
  },

  getProgress() {
    const defaults = {};
    UNITS.forEach(u => defaults[u.id] = { correct:0, total:0 });
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(this.KEY_PROGRESS) || '{}') }; } catch { return defaults; }
  },
  updateProgress(unitId, correct, total) {
    const p = this.getProgress();
    p[unitId] = p[unitId] || { correct:0, total:0 };
    p[unitId].correct += correct;
    p[unitId].total += total;
    localStorage.setItem(this.KEY_PROGRESS, JSON.stringify(p));
  },

  getHistory() {
    try { return JSON.parse(localStorage.getItem(this.KEY_HISTORY) || '[]'); } catch { return []; }
  },
  addHistory(record) {
    const h = this.getHistory();
    h.unshift(record);
    if (h.length > 50) h.pop();
    localStorage.setItem(this.KEY_HISTORY, JSON.stringify(h));
  },

 feature/昕旂-技術開發
  // 題目歷史紀錄（用於 AI 去重）
  getQuizHistory() {
    try { return JSON.parse(localStorage.getItem(this.KEY_QUIZ_HISTORY) || '[]'); } catch { return []; }
  },
  // questions: [{ id, question, unit, difficulty }] 摘要陣列
  addQuizHistory(questions) {
    const h = this.getQuizHistory();
    h.unshift(...questions);
    // 最多保留 200 道題的摘要，避免超過 localStorage 限制
    if (h.length > 200) h.splice(200);
    localStorage.setItem(this.KEY_QUIZ_HISTORY, JSON.stringify(h));
  },


 main
  getWatched() {
    try { return JSON.parse(localStorage.getItem(this.KEY_WATCHED) || '[]'); } catch { return []; }
  },
  markWatched(videoId) {
    const w = this.getWatched();
    if (!w.includes(videoId)) { w.push(videoId); localStorage.setItem(this.KEY_WATCHED, JSON.stringify(w)); }
  },
};
