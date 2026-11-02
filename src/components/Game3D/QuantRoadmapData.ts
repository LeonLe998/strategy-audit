/**
 * QuantRoadmapData.ts
 * Nền tảng Tri thức & Lộ trình Quant Finance toàn diện (Base từ agents.surf/quant-roadmap)
 * Kết nối chặt chẽ với định hướng Kiểm định Chiến lược "Đo trước khi tin" (Strategy Audit).
 */

export interface RoadmapTopic {
  id: string;
  stageNumber: string;
  category: 'Foundations' | 'Systems' | 'Career';
  title: string;
  subtitle: string;
  landmarkName: string;
  coordinates: { x: number; y: number; z: number };
  badge: string;
  keyEquation: string;
  equationDescription: string;
  summary: string;
  strategyAuditBridge: string; // Kết nối với định hướng Strategy Audit của web
  pythonSnippet: string;
  challenge: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    xpReward: number;
  };
}

export const QUANT_ROADMAP_STAGES: RoadmapTopic[] = [
  {
    id: 'probability-foundations',
    stageNumber: '01',
    category: 'Foundations',
    title: 'Xác suất & Tư duy Sòng bạc (Probability & Casino Edge)',
    subtitle: 'Kỳ vọng toán học, Định lý Bayes & Luật số lớn',
    landmarkName: 'Đền thờ Xác suất Gauss (Probability Sanctuary)',
    coordinates: { x: -16, y: 1.5, z: -8 },
    badge: 'Xác suất Học viện',
    keyEquation: 'E[P&L] = p \\cdot W - (1-p) \\cdot L - \\text{costs}',
    equationDescription: 'Kỳ vọng P&L sau chi phí. Sòng bạc không đoán một vòng quay roulette; họ chạy hàng triệu lần với lợi thế 2.7%.',
    summary: 'Mọi chiến lược định lượng bắt đầu từ tư duy có điều kiện P(A|B) và cập nhật niềm tin Bayesian. Một tỷ lệ thắng 52% với phí giao dịch 0.5% nếu chỉ đánh một lần là cờ bạc, nhưng lặp lại 2.000 lần với định cỡ chuẩn sẽ thành một doanh nghiệp sinh lời bền vững.',
    strategyAuditBridge: 'Trong kiểm định "Đo trước khi tin", chúng ta kiểm tra xem lợi thế (edge) của bạn có thực sự tồn tại sau khi trừ phí trượt giá (slippage) và phí hoa hồng, hay chỉ là may mắn ngắn hạn của một con bạc.',
    pythonSnippet: `# Luật số lớn: Tỷ lệ thắng hội tụ về kỳ vọng
import numpy as np
rng = np.random.default_rng(42)
flips = rng.random(10_000) < 0.55
running_avg = np.cumsum(flips) / np.arange(1, flips.size + 1)
print(f"Sau 100 lệnh: {running_avg[99]:.3f} | Sau 10.000 lệnh: {running_avg[-1]:.4f}")`,
    challenge: {
      question: 'Tại sao một chiến lược có win-rate 55% vẫn có thể làm nhà đầu tư phá sản hoàn toàn?',
      options: [
        'Do thị trường luôn biến động ngẫu nhiên không có quy luật',
        'Do định cỡ vị thế (position sizing) quá lớn so với phương sai (variance), dính chuỗi thua liên tiếp trước khi kỳ vọng kịp thể hiện',
        'Do định lý Bayes không áp dụng được vào thị trường tài chính',
        'Do luật số lớn chỉ áp dụng cho tài sản có thanh khoản cao'
      ],
      correctIndex: 1,
      explanation: 'Chính xác! Có kỳ vọng dương (+EV) là điều kiện cần nhưng không đủ. Nếu bạn cược quá lớn so với phương sai, chuỗi drawdown sẽ quét sạch tài khoản (ruin problem) trước khi luật số lớn có thời gian đưa kết quả về mức trung bình.',
      xpReward: 150
    }
  },
  {
    id: 'statistics-inference',
    stageNumber: '02',
    category: 'Foundations',
    title: 'Thống kê, Bẫy Đa thử nghiệm & Deflated Sharpe',
    subtitle: 'Hypothesis Testing, Bonferroni & Hồi quy Fama-French HAC',
    landmarkName: 'Viện Kiểm định Thống kê & Phân phối Đuôi Dày',
    coordinates: { x: -8, y: 2.0, z: -18 },
    badge: 'Chuyên gia Suy luận',
    keyEquation: 't \\approx \\text{Sharpe} \\times \\sqrt{\\text{years}} \\quad ; \\quad p_{(k)} \\le \\frac{k}{m}\\alpha',
    equationDescription: 'Sharpe ratio 1.0 trong 4 năm cho t ≈ 2.0 (chỉ xấp xỉ biên giới ý nghĩa thống kê). Thử 1.000 chiến lược ngẫu nhiên sẽ có 50 cái p < 0.05 thuần do may mắn.',
    summary: 'Hầu hết các tín hiệu trông đẹp mắt trong backtest chỉ là nhiễu trắng (noise). Khi thử nghiệm hàng trăm biến thể tham số, bạn bắt buộc phải dùng hiệu chỉnh Benjamini-Hochberg hoặc Deflated Sharpe Ratio của Bailey & López de Prado để trừ khử ảo tưởng.',
    strategyAuditBridge: 'Trọng tâm số 1 của Strategy Audit: "Bóc mẽ" các chiến lược curve-fitted được bán trên mạng với Sharpe > 3.0 nhưng thực chất đã được tác giả chạy grid-search qua 5.000 bộ tham số.',
    pythonSnippet: `# Kiểm định nhiều chiến lược ngẫu nhiên (Multiple Testing Trap)
from scipy import stats
from statsmodels.stats.multitest import multipletests
pvals = [stats.ttest_1samp(rng.normal(0, 0.01, 756), 0).pvalue for _ in range(200)]
print("Ngây thơ p < 0.05:", sum(p < 0.05 for p in pvals)) # ~10 chiến lược giả tạo
print("Sau Benjamini-Hochberg:", multipletests(pvals, alpha=0.05, method="fdr_bh")[0].sum()) # 0!`,
    challenge: {
      question: 'Nếu bạn backtest 1.000 chiến lược ngẫu nhiên trên dữ liệu 3 năm và chọn ra chiến lược có Sharpe cao nhất (2.1), kết quả thực tế khi trade live thường là gì?',
      options: [
        'Tiếp tục duy trì Sharpe 2.1 vì dữ liệu 3 năm đã đủ dài',
        'Lợi nhuận giảm 10% do phí sàn',
        'Chiến lược sụp đổ và PnL quay về 0 vì Sharpe 2.1 đó chỉ là giá trị cực trị của phân phối ngẫu nhiên (selection bias)',
        'Chiến lược biến thành chiến lược phòng hộ delta'
      ],
      correctIndex: 2,
      explanation: 'Đúng! Đây là Selection Bias / Data Snooping Trap. Khi chọn cực đại từ 1.000 mẫu ngẫu nhiên, bạn chắc chắn chọn trúng điểm may mắn nhất. Công thức Deflated Sharpe Ratio (DSR) chứng minh rằng Sharpe kỳ vọng từ thử nghiệm ngẫu nhiên N lần luôn lớn hơn 0.',
      xpReward: 200
    }
  },
  {
    id: 'linear-algebra-markowitz',
    stageNumber: '03',
    category: 'Foundations',
    title: 'Đại số Tuyến tính & Tối ưu Danh mục Markowitz',
    subtitle: 'Ma trận Hiệp phương sai, Eigendecomposition (PCA) & Co màng Ledoit-Wolf',
    landmarkName: 'Đài quan sát Ma trận Hiệp phương sai',
    coordinates: { x: 8, y: 1.8, z: -18 },
    badge: 'Kiến trúc sư Danh mục',
    keyEquation: '\\sigma_p^2 = w^\\top \\Sigma w \\quad ; \\quad \\Sigma = Q \\Lambda Q^\\top',
    equationDescription: 'Phương sai danh mục thu gọn thành dạng toàn phương. 5 thành phần chính (PCA) đầu tiên giải thích hơn 70% biến động của 500 cổ phiếu.',
    summary: 'Đại số tuyến tính là ngôn ngữ vận hành toàn bộ thế giới tài chính định lượng. Tối ưu hóa Markowitz nguyên bản thường dồn vốn vào các cổ phiếu "may mắn nhất" trong quá khứ do sai số ước lượng (estimation error), vì vậy các quỹ chuyên nghiệp luôn co màng ma trận bằng kỹ thuật Ledoit-Wolf shrinkage.',
    strategyAuditBridge: 'Strategy Audit kiểm toán phân bổ vốn của bạn: liệu lợi nhuận danh mục đến từ Alpha thực sự hay chỉ là việc âm thầm mua rủi ro thị trường (PC1 - Market beta)?',
    pythonSnippet: `# Tối ưu hóa Markowitz giảm thiểu phương sai với CVXPY
import cvxpy as cp
w = cp.Variable(n)
prob = cp.Problem(cp.Minimize(cp.quad_form(w, cov_shrunk)), [cp.sum(w) == 1, w >= 0, w <= 0.25])
prob.solve()
print("Trọng số tối ưu sau co màng:", np.round(w.value, 3))`,
    challenge: {
      question: 'Tại sao mô hình Markowitz tối ưu hóa trung bình - phương sai truyền thống thường thất bại thảm hại khi ứng dụng thực tế ngoài đời?',
      options: [
        'Vì máy tính không giải được ma trận 500x500',
        'Vì nó là "bộ khuếch đại sai số ước lượng" (error maximizer), tự động dồn tỷ trọng lớn vào các tài sản có ước lượng lợi nhuận quá lạc quan',
        'Vì ma trận hiệp phương sai luôn có định thức bằng 0',
        'Vì cổ phiếu không bao giờ tương quan với nhau'
      ],
      correctIndex: 1,
      explanation: 'Chính xác! Michaud (1989) gọi Markowitz là "Error Maximizer". Các tài sản có lợi nhuận mẫu cao bất thường trong quá khứ (thường do may mắn) sẽ được bộ tối ưu cấp tỷ trọng cực lớn.',
      xpReward: 200
    }
  },
  {
    id: 'stochastic-black-scholes',
    stageNumber: '04',
    category: 'Foundations',
    title: 'Giải tích Ngẫu nhiên & Đỉnh cao Black-Scholes',
    subtitle: 'Chuyển động Brown (GBM), Bổ đề Itô & Mặt cong Biến động (Volatility Smile)',
    landmarkName: 'Đỉnh phong Volatility Surface & Phương trình Itô',
    coordinates: { x: 18, y: 2.2, z: -6 },
    badge: 'Chủ nhân Phái sinh',
    keyEquation: '\\frac{\\partial V}{\\partial t} + \\frac{1}{2}\\sigma^2 S^2 \\frac{\\partial^2 V}{\\partial S^2} + rS\\frac{\\partial V}{\\partial S} - rV = 0',
    equationDescription: 'Phương trình vi phân đạo hàm riêng Black-Scholes PDE. Chú ý: tham số xu hướng mu hoàn toàn biến mất nhờ danh mục phòng hộ delta không rủi ro.',
    summary: 'Chuyển động Brown có tính chất kỳ diệu: (dW_t)^2 = dt. Bổ đề Itô giữ lại số hạng bậc hai 1/2 sigma^2 S^2, từ đó tạo ra phương trình định giá quyền chọn bất hủ. Các chỉ số Hy Lạp (Greeks: Delta, Gamma, Theta, Vega) chính là la bàn quản trị rủi ro của mọi desk giao dịch vol.',
    strategyAuditBridge: 'Trong Web 3D của chúng ta, bề mặt Volatility Surface trực quan hóa chính xác hiện tượng Volatility Smile - minh chứng sống phủ nhận giả định phân phối chuẩn phẳng của Black-Scholes cổ điển.',
    pythonSnippet: `# Định giá Call Black-Scholes & Greeks
from scipy.stats import norm
d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
d2 = d1 - sigma * np.sqrt(T)
price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
delta = norm.cdf(d1)
vega = S * np.sqrt(T) * norm.pdf(d1)
print(f"Giá Option: {price:.4f} | Delta: {delta:.3f} | Vega: {vega:.3f}")`,
    challenge: {
      question: 'Tại sao trong phương trình PDE Black-Scholes, tỷ suất sinh lời kỳ vọng của cổ phiếu (mu) lại hoàn toàn biến mất?',
      options: [
        'Vì giả định rằng cổ phiếu không bao giờ tăng giá',
        'Vì danh mục phòng hộ gồm quyền chọn và lượng cổ phiếu Delta = dV/dS loại bỏ hoàn toàn rủi ro ngẫu nhiên dW_t, buộc danh mục phải sinh lời đúng bằng lãi suất phi rủi ro r',
        'Vì Itô lemma đã triệt tiêu biến số thời gian t',
        'Do giả định thị trường không có chi phí vay vốn'
      ],
      correctIndex: 1,
      explanation: 'Xuất sắc! Bằng cách lập danh mục Pi = V - (dV/dS)*S, thành phần ngẫu nhiên dW_t bị triệt tiêu hoàn toàn. Theo nguyên lý không có cơ hội ac-bít (no-arbitrage), danh mục không rủi ro này bắt buộc phải tăng trưởng theo lãi suất r.',
      xpReward: 250
    }
  },
  {
    id: 'time-series-stat-arb',
    stageNumber: '05',
    category: 'Foundations',
    title: 'Chuỗi Thời gian & Statistical Arbitrage',
    subtitle: 'Tính dừng (ADF Test), GARCH Biến động & Pairs Trading Ornstein-Uhlenbeck',
    landmarkName: 'Đấu trường Hỗn mang Lorenz & Kinh tế lượng',
    coordinates: { x: 14, y: 1.6, z: 8 },
    badge: 'Chiến binh Stat-Arb',
    keyEquation: 'dX_t = \\theta(\\mu - X_t)dt + \\sigma dW_t \\quad ; \\quad \\text{Half-life} = \\frac{\\ln 2}{\\theta}',
    equationDescription: 'Phương trình quá trình Ornstein-Uhlenbeck mô tả spread hồi quy trung bình. Chu kỳ bán rã cho biết tốc độ spread trở về cân bằng.',
    summary: 'Giá tài sản không dừng (non-stationary), nhưng chênh lệch giữa hai tài sản đồng tích hợp (cointegrated pairs như KO và PEP) là chuỗi dừng. Mô hình GARCH(1,1) giải thích hiện tượng cụm biến động: những ngày bão tố thường tiếp nối bằng những ngày bão tố.',
    strategyAuditBridge: 'Strategy Audit cung cấp công cụ tự động chạy kiểm định ADF, Johansen Cointegration và tính Half-life, giúp nhà đầu tư tránh bẫy vào lệnh khi cặp tài sản đã vĩnh viễn rạn nứt cấu trúc (structural break).',
    pythonSnippet: `# Kiểm định ADF và tính Half-life chuỗi spread
from statsmodels.tsa.stattools import adfuller
adf_pval = adfuller(spread)[1]
phi = sm.OLS(spread.diff().dropna(), sm.add_constant(spread.shift(1).dropna())).fit().params.iloc[1]
half_life = np.log(2) / -phi
print(f"ADF p-value: {adf_pval:.4f} | Chu kỳ bán rã: {half_life:.1f} ngày")`,
    challenge: {
      question: 'Khi giao dịch cặp cổ phiếu (Pairs Trading), điều kiện tiên quyết nào quan trọng hơn hệ số tương quan giá (price correlation)?',
      options: [
        'Khối lượng giao dịch của hai mã phải bằng nhau',
        'Tính đồng tích hợp (Cointegration) - đảm bảo tồn tại tổ hợp tuyến tính dừng, spread không trôi dạt vô tận',
        'Cả hai công ty phải cùng một hội đồng quản trị',
        'Chỉ số P/E của hai mã phải chênh lệch trên 50%'
      ],
      correctIndex: 1,
      explanation: 'Đúng! Hai chuỗi giá có thể có tương quan cao trong ngắn hạn nhưng trôi dạt xa nhau mãi mãi (spurious correlation). Đồng tích hợp (Cointegration) đảm bảo spread có lực đàn hồi kéo về giá trị trung bình ổn định.',
      xpReward: 220
    }
  },
  {
    id: 'data-engineering-sins',
    stageNumber: '06',
    category: 'Systems',
    title: 'Kỹ nghệ Dữ liệu & 7 Tội lỗi Chí mạng',
    subtitle: 'Look-ahead, Survivorship bias, Múi giờ UTC & Quản trị Lỗ hổng Dữ liệu',
    landmarkName: 'Pháo đài Dữ liệu Sạch & Lọc Nhiễu',
    coordinates: { x: 0, y: 1.5, z: 18 },
    badge: 'Thanh tra Dữ liệu',
    keyEquation: 'S_t = f(\\mathcal{F}_{t-1}) \\quad ; \\quad \\mathcal{F}_{t-1} \\cap \\{P_t, P_{t+1}, \\dots\\} = \\emptyset',
    equationDescription: 'Tín hiệu sinh ra từ giá đóng cửa phiên t chỉ được phép khớp lệnh sớm nhất ở giá mở cửa phiên t+1.',
    summary: 'Nhiều chiến lược thất bại không phải do ý tưởng tồi, mà do dữ liệu nhiễm độc. 7 tội lỗi chí mạng: Look-ahead bias, Survivorship bias (chỉ test cổ phiếu còn sống hôm nay), tách gộp cổ tức sai, lệch múi giờ UTC, mất gói tin WebSocket âm thầm, tick rác và ghi đè dữ liệu thô.',
    strategyAuditBridge: 'Nguyên lý cốt lõi của Strategy Audit: "Không có dữ liệu sạch thì không có sự thật". Chúng tôi thiết lập rào chắn cô lập dữ liệu điểm trong quá khứ (point-in-time database).',
    pythonSnippet: `# Kiểm tra rò rỉ Look-Ahead trong Pandas
signal = (px.rolling(50).mean() > px.rolling(200).mean()).astype(float)
# BẮT BUỘC shift(1) để mô phỏng quyết định ở t, vào lệnh t+1
position = signal.shift(1).fillna(0)
turnover = position.diff().abs().fillna(0)`,
    challenge: {
      question: 'Tại sao backtest chỉ trên danh sách cổ phiếu S&P 500 hiện tại trong 20 năm qua lại là một sai lầm nghiêm trọng (Survivorship Bias)?',
      options: [
        'Vì S&P 500 không đại diện cho nền kinh tế',
        'Vì backtest đã âm thầm loại bỏ tất cả các công ty phá sản, hủy niêm yết trong 20 năm qua (Enron, Lehman Brothers...), biến danh mục thành cỗ máy chỉ chọn kẻ sống sót',
        'Vì chỉ số S&P 500 không có tính thanh khoản',
        'Vì không tính được cổ tức của chỉ số'
      ],
      correctIndex: 1,
      explanation: 'Chính xác! Survivorship Bias làm đường cong vốn tăng ảo gấp nhiều lần vì bạn đã vô thức "biết trước tương lai" rằng những công ty này sẽ không bị phá sản hay hủy niêm yết.',
      xpReward: 250
    }
  },
  {
    id: 'backtesting-validation',
    stageNumber: '07',
    category: 'Systems',
    title: 'Kiểm định Khách quan: Walk-Forward & Purge/Embargo',
    subtitle: 'Tác động Thị trường (Square Root Impact Law), Chi phí Fills & Chống Overfitting',
    landmarkName: 'Đấu trường Kiểm định Sáu Ô (Strategy Audit Arena)',
    coordinates: { x: -14, y: 1.8, z: 8 },
    badge: 'Kiểm toán viên Trưởng',
    keyEquation: '\\text{Cost} \\approx \\frac{1}{2}\\text{Spread} + c \\cdot \\sigma_{\\text{daily}} \\sqrt{\\frac{Q}{V_{\\text{daily}}}}',
    equationDescription: 'Quy luật căn bậc hai về tác động thị trường (Market Impact). Khối lượng đặt lệnh Q càng lớn so với thanh khoản ngày V, chi phí trượt giá càng tăng theo hàm căn bậc hai.',
    summary: 'Mục đích của backtest không phải là tìm ra đường cong vốn đẹp, mà là nỗ lực hết sức để GIẾT CHẾT ý tưởng. Walk-forward cross validation với khoảng ngắt Purge (loại bỏ chồng lấn nhãn) và Embargo (ngăn ngừa rò rỉ chuỗi thời gian) là tiêu chuẩn vàng.',
    strategyAuditBridge: 'Đây chính là trái tim của nền tảng Strategy Audit: Quy trình Kiểm định Sáu Ô độc quyền đo lường tính bất biến của chiến lược qua các chế độ thị trường (Regime Shift).',
    pythonSnippet: `# Phân tích Walk-Forward với Purged TimeSeriesSplit
from sklearn.model_selection import TimeSeriesSplit
# gap = khoảng thời gian dự báo của nhãn (Purge)
for train, test in TimeSeriesSplit(n_splits=5, gap=10).split(data):
    model.fit(data.iloc[train], labels.iloc[train])
    auc = evaluate(model, data.iloc[test])`,
    challenge: {
      question: 'Trong quy trình kiểm định Walk-Forward chuyên nghiệp, mục đích của "Purge & Embargo" là gì?',
      options: [
        'Tăng tốc độ tính toán của thuật toán',
        'Loại bỏ các mẫu huấn luyện bị chồng lấn nhãn tương lai với tập kiểm tra, triệt tiêu hoàn toàn rò rỉ thông tin (leakage)',
        'Xóa bỏ các ngày thị trường giảm điểm mạnh',
        'Tự động tăng gấp đôi số lượng vị thế'
      ],
      correctIndex: 1,
      explanation: 'Hoàn hảo! Nếu bạn dùng nhãn lợi nhuận 5 ngày tiếp theo, các mẫu gần biên giới train/test sẽ dùng chung dữ liệu tương lai. Purge cắt bỏ phần chồng lấn, và Embargo tạo khoảng đệm an toàn sau tập test.',
      xpReward: 300
    }
  },
  {
    id: 'risk-management-killswitch',
    stageNumber: '08',
    category: 'Systems',
    title: 'Quản trị Quy mô Kelly & Hệ thống Ngắt mạch (Kill Switch)',
    subtitle: 'Half-Kelly, Volatility Targeting EWMA & Circuit Breakers 3 Cấp độ',
    landmarkName: 'Tháp Canh Rủi ro & Cầu dao Tự động',
    coordinates: { x: -6, y: 2.5, z: 0 },
    badge: 'Người Giữ Cửa Sinh Tồn',
    keyEquation: 'f^* = p - \\frac{1-p}{b} \\quad ; \\quad f_{\\text{safe}} = \\frac{1}{2} f^*',
    equationDescription: 'Công thức Kelly tối ưu tốc độ tăng trưởng vốn dài hạn. Cược trên 2*f* chắc chắn sẽ làm tài khoản teo tóp về 0.',
    summary: 'Tín hiệu quyết định hướng đi, nhưng định cỡ vị thế (Sizing) quyết định bạn có còn sống sót vào năm sau hay không. Năm 2012, quỹ Knight Capital bốc hơi 440 triệu USD chỉ trong 45 phút vì lỗi triển khai code cũ và thiếu công tắc ngắt mạch khẩn cấp (Kill Switch).',
    strategyAuditBridge: 'Mọi chiến lược gửi vào Strategy Audit đều phải vượt qua bài kiểm tra Kill Switch: Tự động hủy lệnh, đóng băng vị thế khi lỗ vượt hạn mức ngày hoặc drawdown chạm trần.',
    pythonSnippet: `# Lớp bảo vệ Rủi ro Pre-trade Gate & Kill Switch
class RiskGate:
    def check_order(self, qty, price, current_pos, equity, peak_equity):
        if self.tripped_kill_switch:
            return False, "CẦU DAO ĐÃ KÍCH HOẠT - TỪ CHỐI MỌI LỆNH"
        if (peak_equity - equity) / peak_equity > 0.15: # Drawdown > 15%
            self.tripped_kill_switch = True
            return False, "VƯỢT NGƯỠNG MAX DRAWDOWN"
        return True, "HỢP LỆ"`,
    challenge: {
      question: 'Điều gì xảy ra nếu một nhà giao dịch có lợi thế thực tế nhưng cược với quy mô gấp 3 lần tiêu chuẩn Kelly (3x Kelly)?',
      options: [
        'Lợi nhuận tăng gấp ba lần trong dài hạn',
        'Gần như chắc chắn sẽ bị cháy sạch tài khoản (ruin) vì phương sai lớn kéo tốc độ tăng trưởng hình học g(f) về vùng âm',
        'Giảm thiểu được tối đa biến động danh mục',
        'Không ảnh hưởng gì nếu có đòn bẩy cao'
      ],
      correctIndex: 1,
      explanation: 'Chính xác! Hàm tăng trưởng g(f) = p*ln(1+bf) + (1-p)*ln(1-f) đạt đỉnh tại f*, quay về 0 tại khoảng 2*f*, và lao dốc âm không đáy sau đó. Cược 3x Kelly là tự sát toán học!',
      xpReward: 300
    }
  },
  {
    id: 'microstructure-orderbook-hft',
    stageNumber: '09',
    category: 'Systems',
    title: 'Cấu trúc Vi mô Sổ lệnh & Thực thi Tốc độ cao',
    subtitle: 'L2/L3 Order Book, Microprice, Mất cân bằng OFI & Mô hình Avellaneda-Stoikov',
    landmarkName: 'Đấu trường Sổ lệnh L2 & Khớp lệnh Nano-giây',
    coordinates: { x: 6, y: 2.0, z: 0 },
    badge: 'Kiến trúc sư Khớp lệnh',
    keyEquation: 'P_{\\text{micro}} = \\frac{P_b Q_a + P_a Q_b}{Q_a + Q_b} \\quad ; \\quad r = s - q \\gamma \\sigma^2 (T-t)',
    equationDescription: 'Microprice tính giá trọng số theo khối lượng hàng đợi. Mô hình Avellaneda-Stoikov điều chỉnh giá đặt lệnh (reservation price) lệch ngược lại lượng hàng tồn kho q.',
    summary: 'Tại tầng cấu trúc vi mô, giá chuyển động do luồng lệnh đến, hủy và khớp. Market Maker kiếm tiền từ chênh lệch bid-ask spread nhưng phải đối mặt với rủi ro lựa chọn bất lợi (adverse selection) từ luồng lệnh thông tin của cá mập. Lõi thực thi yêu cầu Rust/C++ không cấp phát bộ nhớ động trên luồng nóng (zero-allocation).',
    strategyAuditBridge: 'Strategy Audit kết nối với các engine khớp lệnh tối ưu (Almgren-Chriss, TWAP/VWAP) để giúp chiến lược lớn xé nhỏ lệnh mà không làm sập giá thị trường.',
    pythonSnippet: `# Tính giá Microprice và Mất cân bằng dòng lệnh OFI
def calculate_microprice(bid_px, ask_px, bid_sz, ask_sz):
    microprice = (bid_px * ask_sz + ask_px * bid_sz) / (bid_sz + ask_sz)
    imbalance = (bid_sz - ask_sz) / (bid_sz + ask_sz)
    return microprice, imbalance`,
    challenge: {
      question: 'Khi một Market Maker đang bị ôm quá nhiều hàng tồn kho mua (long inventory q > 0), theo mô hình Avellaneda-Stoikov họ phải làm gì?',
      options: [
        'Giữ nguyên giá chào để chờ thị trường tăng',
        'Hạ thấp cả giá Bid và giá Ask để giảm sức hút người bán và thu hút người mua xả bớt hàng',
        'Tăng giá Ask lên cao nhất có thể',
        'Hủy bỏ toàn bộ hệ thống khớp lệnh'
      ],
      correctIndex: 1,
      explanation: 'Đúng! Giá tham chiếu r = s - q*gamma*sigma^2*(T-t) bị kéo lùi xuống. Mức giá chào thấp hơn sẽ làm nản lòng người bán và kích thích người mua vào giải tỏa lượng tồn kho rủi ro.',
      xpReward: 350
    }
  },
  {
    id: 'agent-harness-career',
    stageNumber: '10',
    category: 'Career',
    title: 'Hệ Thống Kiểm Thử Tự Động & Quy Chuẩn Kiểm Định',
    subtitle: 'Đặc tả Spec, Red-Green Testing & Kiểm chứng độc lập',
    landmarkName: 'Trung tâm Kiểm định Chiến lược & Hồ sơ Nghiên cứu',
    coordinates: { x: 0, y: 2.2, z: -10 },
    badge: 'Kiểm Toán Viên Chiến Lược',
    keyEquation: 'P(\\text{Type I Error}) \\le \\alpha \\quad ; \\quad T_{\\text{train}} \\cap T_{\\text{test}} = \\emptyset',
    equationDescription: 'Quy trình kiểm thử nghiêm ngặt: Đặc tả trước mã nguồn, viết test chặn các bẫy look-ahead, review logic toán học rồi mới đưa vào kiểm chứng độc lập.',
    summary: 'Công cụ lập trình hiện đại giúp rút ngắn thời gian viết mã, nhưng toán học và thống kê là thứ không thể bỏ qua. Mọi quy tắc đều phải đi qua quy trình kiểm chứng từ Xác suất -> Thống kê -> Chuỗi thời gian -> Dữ liệu sạch -> Walk-Forward.',
    strategyAuditBridge: 'Trọng tâm của nền tảng Strategy Audit: Tự động hóa quy trình kiểm định, chặn rò rỉ dữ liệu và đối chiếu tính hợp lệ của chiến lược trên dữ liệu lịch sử.',
    pythonSnippet: `# Triết lý Quant chuyên nghiệp:
# 1. Spec rõ ràng
# 2. Test fail trước khi code (TDD)
# 3. Phản biện mọi kết quả quá đẹp
print("Chiến lược đã vượt qua 100% kiểm định Strategy Audit!")`,
    challenge: {
      question: 'Điểm khác biệt quan trọng nhất giữa một nhà nghiên cứu Quant chuyên nghiệp và một người lập trình bot nghiệp dư bằng AI chat là gì?',
      options: [
        'Người chuyên nghiệp gõ phím nhanh hơn',
        'Người chuyên nghiệp thiết lập khung kiểm thử phủ nhận (falsification harness), bắt AI phải viết test chứng minh không có look-ahead và chịu chi phí trượt giá trước khi viết mã',
        'Người chuyên nghiệp chỉ dùng C++ mà không bao giờ dùng Python',
        'Người chuyên nghiệp không cần đọc tài liệu học thuật'
      ],
      correctIndex: 1,
      explanation: 'Tuyệt đối chính xác! AI chat thông thường sẽ sẵn sàng vẽ ra cho bạn một script có vẻ sinh lời nhưng ngập tràn bẫy rò rỉ dữ liệu. Một chuyên gia dùng harness để bắt buộc AI phải đối mặt với các trường hợp biên nguy hiểm và kiểm toán lại mã nguồn!',
      xpReward: 500
    }
  }
];
