/**
 * Vault.tsx
 * Hồ Sơ Nghiên Cứu — Kho Tài Liệu & Báo Cáo Chuyên Đề
 * Hệ thống tài liệu kiểm chứng định lượng và báo cáo chuyên đề gắn với tiêu chuẩn "Đo trước khi tin" của Strategy Audit.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  CheckCircle2,
  FolderOpen,
  Award,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  X,
  FileText,
  Loader2,
  Code,
  Layers
} from 'lucide-react';
import { GlassCard } from './Glass';
import { MathFormula } from './MathFormula';
import { track } from '../analytics';

const VAULT_LEADS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyH6xzJc9J4Dj8fKJi-Rp91tfeS0tZbLtjz0m26bON4kjLKFnMLjS8btAxo66CoPDCGbA/exec';

interface VaultProps {
  setActiveTab: (tab: string) => void;
  initialDocId?: string | null;
  onDocChange?: (id: string | null) => void;
}

interface ArchiveTopic {
  id: string;
  docCode: string;
  categoryLabel: string;
  track: 'math' | 'systems';
  title: string;
  subtitle: string;
  keyEquation: string;
  equationNote: string;
  coreConcepts: string[];
  auditBridge: string;
  books: Array<{ name: string; author: string; note: string; link?: string }>;
  practiceNote: string;
  codeSnippet: string;
}

const ARCHIVE_TOPICS: ArchiveTopic[] = [
  {
    id: 'probability',
    docCode: 'HS-01',
    categoryLabel: 'Xác suất & Thống kê',
    track: 'math',
    title: 'Xác Suất Có Điều Kiện & Luật Số Lớn (Probability Foundations)',
    subtitle: 'Định lý Bayes, Luật số lớn, Phân phối đuôi dày & Chuỗi lệnh dài hạn',
    keyEquation: 'P(A \\mid B) = \\frac{P(B \\mid A) \\cdot P(A)}{P(B)} \\quad ; \\quad \\bar{X}_n \\xrightarrow{n \\to \\infty} \\mu',
    equationNote: 'Một lệnh đơn lẻ là ngẫu nhiên, nhưng qua chuỗi 500 đến 1.000 lệnh, kết quả hội tụ về lợi thế thực của bộ quy tắc sau khi trừ chi phí giao dịch.',
    coreConcepts: [
      'Xác suất có điều kiện P(A|B) và cập nhật niềm tin theo dữ liệu thực nghiệm Bayes',
      'Các phân phối nền tảng: Bernoulli, Binomial, Poisson, Normal và Student-t đuôi dày',
      'Luật số lớn (LLN) và Định lý giới hạn trung tâm (CLT) trên chuỗi hàng nghìn lệnh',
      'Mô phỏng xáo trộn Monte Carlo để quan sát chuỗi thua dài nhất trước khi áp dụng'
    ],
    auditBridge: 'Trong kiểm định "Đo trước khi tin", mỗi chiến lược đều được chạy qua hàng nghìn lệnh trên 22 năm dữ liệu vàng thật có tính phí. Nếu chỉ nhìn vài lệnh thắng đầu tiên mà bỏ qua chuỗi thua dài nhất, tài khoản sẽ không trụ nổi tới lúc lợi thế phát huy.',
    books: [
      { name: 'Introduction to Probability + Stat 110', author: 'Blitzstein & Hwang (Harvard)', note: 'Tài liệu nền tảng về tư duy xác suất có điều kiện', link: 'https://projects.iq.harvard.edu/stat110' },
      { name: 'A Man for All Markets', author: 'Edward O. Thorp', note: 'Góc nhìn lịch sử về đo lường lợi thế bằng toán học' }
    ],
    practiceNote: 'Mô phỏng 10.000 lần tung đồng xu trên Python, cập nhật tỉ lệ thắng ước lượng theo phân phối Beta-Binomial.',
    codeSnippet: `import numpy as np
from scipy import stats
# Mô phỏng cập nhật Bayes cho tỉ lệ thắng qua 100 lệnh
trades = np.random.default_rng(42).random(100) < 0.54
post = stats.beta(10 + trades.sum(), 10 + (~trades).sum())
print(f"Ước lượng tỉ lệ thắng trung bình: {post.mean():.3f}")`
  },
  {
    id: 'statistics-inference',
    docCode: 'HS-02',
    categoryLabel: 'Xác suất & Thống kê',
    track: 'math',
    title: 'Kiểm Định Giả Thuyết & Bẫy Đa Thử Nghiệm (Statistical Traps)',
    subtitle: 'Kiểm định H0, Hiệu chỉnh Benjamini-Hochberg & Bẫy thử nghiệm hàng loạt',
    keyEquation: 'p_{(k)} \\le \\frac{k}{m}\\alpha \\quad ; \\quad E[\\max_i Z_i] \\approx \\sqrt{2 \\ln m}',
    equationNote: 'Khi thử nghiệm hàng trăm biến thể tham số ngẫu nhiên, luôn có những biến thể trông vượt trội thuần túy do may mắn. Phải hiệu chỉnh ngưỡng kiểm định theo tổng số lần thử m.',
    coreConcepts: [
      'Kiểm định giả thuyết H0: Bộ quy tắc vào lệnh có khác biệt thực sự so với vào lệnh ngẫu nhiên?',
      'Bẫy Multiple Testing: Kiểm soát tỉ lệ phát hiện sai lệch (FDR Benjamini-Hochberg)',
      'Sai số chuẩn tự tương quan Newey-West (HAC) cho chuỗi dữ liệu theo thời gian',
      'Đánh giá suy giảm hiệu quả khi chọn lọc từ hàng trăm bộ tham số (Selection Bias)'
    ],
    auditBridge: 'Trong 242 chiến lược được kiểm định đầy đủ tại thư viện, có tới 188 chiến lược nhận kết quả CHÁT vì không vượt qua được ngưỡng kiểm chứng thống kê khi so với vào lệnh ngẫu nhiên hoặc bị sụp đổ ở kỳ chấm lại.',
    books: [
      { name: 'All of Statistics', author: 'Larry Wasserman (CMU)', note: 'Chương 1 đến 13 — nền tảng suy luận thống kê hiện đại' },
      { name: 'The Deflated Sharpe Ratio (2014)', author: 'David Bailey & Marcos López de Prado', note: 'Báo cáo học thuật về bẫy thử nghiệm đa tham số' }
    ],
    practiceNote: 'Xây dựng bài kiểm tra hoán vị (Permutation Test) 10.000 lần xáo trộn thứ tự lệnh để đo giá trị p-value thực tế.',
    codeSnippet: `# Kiểm tra bẫy thử nghiệm đa biến (Multiple Testing)
from scipy import stats
from statsmodels.stats.multitest import multipletests
rng = np.random.default_rng(42)
raw_pvals = [stats.ttest_1samp(rng.normal(0, 1, 500), 0).pvalue for _ in range(200)]
print("Chưa hiệu chỉnh p < 0.05:", sum(p < 0.05 for p in raw_pvals))
print("Sau Benjamini-Hochberg:", multipletests(raw_pvals, method="fdr_bh")[0].sum())`
  },
  {
    id: 'linear-algebra',
    docCode: 'HS-03',
    categoryLabel: 'Xác suất & Thống kê',
    track: 'math',
    title: 'Ma Trận Tương Quan & Phân Rã Nhân Tố (Matrix & PCA)',
    subtitle: 'Ma trận hiệp phương sai, Phân tích thành phần chính PCA & Co ước lượng Ledoit-Wolf',
    keyEquation: '\\Sigma_p = w^\\top \\Sigma w \\quad ; \\quad \\Sigma = Q \\Lambda Q^\\top',
    equationNote: 'Phân rã trị riêng (PCA) giúp bóc tách xem nhiều chiến lược có đang phụ thuộc vào cùng một nhân tố biến động ẩn hay thực sự độc lập với nhau.',
    coreConcepts: [
      'Không gian véc-tơ, tích vô hướng, trị riêng và véc-tơ riêng (Eigendecomposition)',
      'Phân tích thành phần chính (PCA) để tách nhiễu và nhận diện nhân tố dẫn dắt chung',
      'Đo lường mức độ trùng lặp tín hiệu giữa các phương pháp giao dịch cùng khung giờ',
      'Kỹ thuật co ma trận Ledoit-Wolf Shrinkage giảm sai số ước lượng trên mẫu hữu hạn'
    ],
    auditBridge: 'Nhiều trader dùng 5 chỉ báo khác nhau trên cùng một biểu đồ và tưởng rằng đã có 5 lớp xác nhận độc lập. Khi kiểm tra ma trận tương quan trong hồ sơ Strategy Audit, cả 5 chỉ báo thực chất đều phản ánh chung một biến động trễ.',
    books: [
      { name: 'Introduction to Linear Algebra + MIT 18.06', author: 'Gilbert Strang (MIT OCW)', note: 'Tài liệu chuẩn mực về đại số tuyến tính ứng dụng', link: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/' },
      { name: 'Convex Optimization', author: 'Stephen Boyd & Lieven Vandenberghe (Stanford)', note: 'Lý thuyết tối ưu hóa có ràng buộc' }
    ],
    practiceNote: 'Phân rã PCA trên tập chuỗi kết quả của nhiều chiến lược để kiểm tra số lượng nhân tố độc lập thực sự.',
    codeSnippet: `import numpy as np
# Phân rã trị riêng ma trận tương quan giữa các chiến lược
corr_matrix = np.corrcoef(strategy_series_matrix)
eigvals, eigvecs = np.linalg.eigh(corr_matrix)
explained_first = eigvals[-1] / eigvals.sum()
print(f"Nhân tố lớn nhất giải thích: {explained_first:.2f} tổng biến động")`
  },
  {
    id: 'time-series-stat-arb',
    docCode: 'HS-04',
    categoryLabel: 'Xác suất & Thống kê',
    track: 'math',
    title: 'Chuỗi Thời Gian, Tính Dừng & Chu Kỳ Mùa Vụ (Time Series)',
    subtitle: 'Kiểm định tính dừng ADF, Cụm biến động GARCH, Ornstein-Uhlenbeck & Hiệu ứng Lịch',
    keyEquation: 'dX_t = \\theta(\\mu - X_t)dt + \\sigma dW_t \\quad ; \\quad \\tau_{1/2} = \\frac{\\ln 2}{\\theta}',
    equationNote: 'Quá trình Ornstein-Uhlenbeck mô tả lực kéo hồi quy về trạng thái cân bằng, trong khi chu kỳ bán rã (Half-life) đo thời gian cần để độ lệch thu hẹp một nửa.',
    coreConcepts: [
      'Tính dừng (Stationarity) & Kiểm định Augmented Dickey-Fuller (ADF) trên chuỗi dữ liệu',
      'Hiện tượng cụm biến động (Volatility Clustering) và mô hình GARCH(1,1)',
      'Sự khác biệt bản chất giữa Tương quan ngắn hạn (Correlation) và Đồng tích hợp (Cointegration)',
      'Hiệu ứng mùa vụ và thời điểm theo lịch (Seasonality & Calendar Effects) trên dữ liệu vàng'
    ],
    auditBridge: 'Thực tế từ thư viện 300 chiến lược: nhóm phương pháp dựa trên thời điểm và lịch (như mua ở 2 ngày giao dịch cuối tháng, bán ở ngày giao dịch thứ 3 tháng mới — mã SEA003) lại có tỉ lệ vượt qua bài kiểm tra cao gấp khoảng 3,5 lần các nhóm chỉ báo phức tạp.',
    books: [
      { name: 'Analysis of Financial Time Series', author: 'Ruey S. Tsay', note: 'Giáo trình phân tích chuỗi thời gian định lượng' },
      { name: 'Quantitative Trading', author: 'Ernest P. Chan', note: 'Phương pháp kiểm chứng tính dừng và hồi quy trung bình' }
    ],
    practiceNote: 'Kiểm định tính dừng ADF và tính chu kỳ bán rã trên chuỗi chênh lệch dữ liệu lịch sử.',
    codeSnippet: `# Kiểm định tính dừng ADF trên chuỗi thời gian
from statsmodels.tsa.stattools import adfuller
adf_stat, p_val, *_ = adfuller(spread_series)
print(f"ADF Statistic: {adf_stat:.3f} | p-value: {p_val:.4f}")`
  },
  {
    id: 'data-pipeline',
    docCode: 'HS-05',
    categoryLabel: 'Dữ liệu & Hệ thống',
    track: 'systems',
    title: 'Kỹ Nghệ Dữ Liệu Lịch Sử & Chặn Lỗi Nhìn Trước Tương Lai',
    subtitle: 'Look-ahead Bias, Survivorship Bias, Đồng bộ múi giờ UTC, Gap Detection & Parquet',
    keyEquation: 'S_t = f(\\mathcal{F}_{t-1}) \\quad ; \\quad \\mathcal{F}_{t-1} \\cap \\{P_t, P_{t+1}, \\dots\\} = \\emptyset',
    equationNote: 'Nếu tín hiệu tính trên giá đóng cửa của thanh hiện tại mà lại khớp lệnh ngay tại giá mở cửa của chính thanh đó, bài đo đã phạm lỗi nhìn trước tương lai (Look-ahead Bias).',
    coreConcepts: [
      'Cấu trúc dữ liệu lịch sử: Thanh giá theo giờ/ngày, dữ liệu khớp lệnh và sổ lệnh',
      'Các lỗi dữ liệu chí mạng: Look-ahead bias, Survivorship bias, lệch múi giờ UTC & DST, khoảng trống giá',
      'Lưu trữ và truy vấn dữ liệu 22 năm tốc độ cao với định dạng cột Parquet, DuckDB và Polars',
      'Đối chiếu tính toàn vẹn Point-in-Time: Chỉ dùng thông tin đã đóng xong tại thời điểm ra quyết định'
    ],
    auditBridge: 'Dữ liệu đầu vào lệch thì mọi con số thống kê phía sau đều vô giá trị. Toàn bộ 242 hồ sơ đo đầy đủ của Strategy Audit đều chạy trên bộ dữ liệu vàng 22 năm đã làm sạch múi giờ và khóa chặt quy tắc chỉ đọc dữ liệu đã đóng.',
    books: [
      { name: 'Advances in Financial Machine Learning', author: 'Marcos López de Prado', note: 'Chương 2–5 về cấu trúc và làm sạch dữ liệu tài chính' }
    ],
    practiceNote: 'Viết quy trình kiểm tra dữ liệu lịch sử bằng Polars: phát hiện khoảng trống thời gian và khóa dịch chuyển tín hiệu shift(1).',
    codeSnippet: `# Xác thực dữ liệu lịch sử sạch với Polars
import polars as pl
bars = pl.read_parquet("gold_historical.parquet")
assert bars.filter(pl.col("close") <= 0).height == 0
# Luôn dịch tín hiệu 1 bước để chặn Look-ahead Bias
bars = bars.with_columns(pl.col("signal_raw").shift(1).alias("executable_signal"))`
  },
  {
    id: 'backtesting-audit',
    docCode: 'HS-06',
    categoryLabel: 'Dữ liệu & Hệ thống',
    track: 'systems',
    title: 'Khung Kiểm Định Walk-Forward & Tiêu Chuẩn Sáu Ô',
    subtitle: 'Tách dữ liệu chỉnh luật / chấm thi, Purge & Embargo, Kiểm tra độ bền ngoài mẫu',
    keyEquation: '\\text{Tập Chỉnh Luật (In-Sample)} \\;\\perp\\; \\text{Tập Chấm Thi 1 (2019–2023)} \\;\\perp\\; \\text{Kỳ Thi 2 (2024–2026)}',
    equationNote: 'Một phương pháp chỉ có giá trị khi giữ vững kết quả trên phần dữ liệu chưa từng được nhìn thấy lúc thiết kế quy tắc.',
    coreConcepts: [
      'Khung Sáu Ô: Làm rõ 6 mảnh ghép của hệ thống trước khi đem đi đo bằng máy',
      'Quy trình Walk-Forward: Tách bạch giai đoạn xây dựng quy tắc và giai đoạn chấm thi độc lập',
      'Purge & Embargo: Cắt bỏ vùng chồng lấn tại biên giới hai tập dữ liệu để chống rò rỉ thông tin',
      'Chấm thi nhiều vòng: Kiểm tra số năm dương, số lệnh, tỉ lệ thắng và chuỗi thua dài nhất'
    ],
    auditBridge: 'Tại Strategy Audit, 15 chiến lược đạt dấu CHẤT trong kỳ thi đầu (2019–2023) đã được đem chấm lại trên dữ liệu vàng hoàn toàn mới từ 02/2024 đến 07/2026. Kết quả: cả 15/15 chiến lược đều tiếp tục vượt qua bài kiểm tra.',
    books: [
      { name: 'Algorithmic Trading', author: 'Ernest P. Chan', note: 'Phương pháp thiết lập quy trình kiểm chứng ngoài mẫu (Out-of-sample)' }
    ],
    practiceNote: 'Thiết lập bộ chia chuỗi thời gian TimeSeriesSplit có khoảng cách đệm (gap) để tách tập huấn luyện và tập kiểm chứng.',
    codeSnippet: `# Chia dữ liệu kiểm chứng theo thời gian có khoảng đệm (Purge gap)
from sklearn.model_selection import TimeSeriesSplit
tscv = TimeSeriesSplit(n_splits=5, gap=10)
for train_idx, test_idx in tscv.split(historical_data):
    in_sample = historical_data.iloc[train_idx]
    out_of_sample = historical_data.iloc[test_idx]`
  },
  {
    id: 'risk-sizing-killswitch',
    docCode: 'HS-07',
    categoryLabel: 'Dữ liệu & Hệ thống',
    track: 'systems',
    title: 'Định Cỡ Vị Thế, Chuỗi Thua Dài Nhất & Cầu Dao Tự Động',
    subtitle: 'Nguyên lý Kelly thận trọng, Điều chỉnh theo biến động EWMA & Ngắt mạch Kill Switch',
    keyEquation: 'f_{\\text{safe}} = \\frac{1}{2} f^* \\quad ; \\quad \\text{Chuỗi thua kỳ vọng } L_{\\max} \\approx \\frac{\\ln N}{-\\ln(1 - p)}',
    equationNote: 'Trong chuỗi N = 1.000 lệnh, ngay cả một hệ thống có tỉ lệ thắng p = 50% cũng gần như chắc chắn xuất hiện chuỗi thua khoảng 10 lệnh liên tiếp.',
    coreConcepts: [
      'Ước tính độ dài chuỗi thua liên tiếp dài nhất theo quy mô mẫu N và tỉ lệ thắng p',
      'Tại sao đặt cược vượt ngưỡng an toàn chắc chắn dẫn đến chạm ngưỡng dừng cuộc chơi',
      'Điều chỉnh quy mô vị thế ngược chiều với độ biến động thị trường (Volatility Targeting)',
      'Hệ thống cầu dao tự động (Kill Switch 3 tầng): Kiểm tra trước lệnh, giám sát tức thời và ngắt khẩn cấp'
    ],
    auditBridge: 'Một phương pháp có quy tắc vào lệnh tốt vẫn có thể xóa sổ tài khoản nếu thiếu quy tắc dừng khi thị trường biến động bất thường. Trong khung Sáu Ô của Strategy Audit, ô Quản trị rủi ro và Ngắt mạch luôn là điều kiện bắt buộc.',
    books: [
      { name: 'Active Portfolio Management', author: 'Richard Grinold & Ronald Kahn', note: 'Nguyên tắc phân bổ và kiểm soát rủi ro hệ thống' }
    ],
    practiceNote: 'Viết hàm tính xác suất xuất hiện chuỗi thua k lệnh liên tiếp trong N lệnh và cổng kiểm tra ngắt mạch tự động.',
    codeSnippet: `class RiskGate:
    def __init__(self, max_consecutive_losses: int = 12):
        self.max_consecutive_losses = max_consecutive_losses
        self.tripped = False

    def check_status(self, current_loss_streak: int):
        if current_loss_streak >= self.max_consecutive_losses:
            self.tripped = True
            return False, "CẦU DAO KÍCH HOẠT: VƯỢT NGƯỠNG CHUỖI THUA CHO PHÉP"
        return True, "HỆ THỐNG TRONG NGƯỠNG AN TOÀN"`
  },
  {
    id: 'microstructure-execution',
    docCode: 'HS-08',
    categoryLabel: 'Dữ liệu & Hệ thống',
    track: 'systems',
    title: 'Cấu Trúc Vi Mô Sổ Lệnh & Chi Phí Thực Thi Thực Tế',
    subtitle: 'Sổ lệnh giới hạn (Limit Order Book), Chênh lệch giá Bid-Ask, Trượt giá & Thanh khoản',
    keyEquation: 'P_{\\text{micro}} = \\frac{P_{\\text{bid}} Q_{\\text{ask}} + P_{\\text{ask}} Q_{\\text{bid}}}{Q_{\\text{bid}} + Q_{\\text{ask}}} \\quad ; \\quad \\text{OFI}_t = \\Delta Q_{\\text{bid}} - \\Delta Q_{\\text{ask}}',
    equationNote: 'Giá khớp thực tế luôn chịu ảnh hưởng bởi độ dày sổ lệnh và chênh lệch mua-bán (spread). Bỏ qua chi phí này là nguyên nhân hàng đầu khiến chiến lược tần suất cao thất bại.',
    coreConcepts: [
      'Cơ chế vận hành của sổ lệnh giới hạn: Hàng đợi giá chào mua (Bids), giá chào bán (Asks)',
      'Hiện tượng lựa chọn bất lợi (Adverse Selection) khi đặt lệnh chờ trong giờ tin tức',
      'Tác động của phí giao dịch và độ trượt giá (Slippage) lên tổng kết quả sau 1.000 lệnh',
      'Tại sao các chiến lược lướt sóng khung quá nhỏ thường bị chi phí hai chiều bào mòn hết lợi thế'
    ],
    auditBridge: 'Khi kiểm định tại Strategy Audit, mọi lệnh đều bị tính đầy đủ chi phí chênh lệch và trượt giá thực tế. Rất nhiều chiến lược nhìn có vẻ thắng trên lý thuyết nhưng chuyển sang CHÁT ngay khi tính đúng chi phí khớp lệnh.',
    books: [
      { name: 'Trading and Exchanges', author: 'Larry Harris', note: 'Tài liệu kinh điển giải thích cấu trúc thị trường và sổ lệnh' },
      { name: 'Algorithmic and High-Frequency Trading', author: 'Álvaro Cartea & Sebastian Jaimungal', note: 'Toán học về cấu trúc vi mô và thực thi lệnh' }
    ],
    practiceNote: 'Tính toán giá trọng số khối lượng Microprice và mất cân bằng dòng lệnh (Order Flow Imbalance) từ dữ liệu sổ lệnh.',
    codeSnippet: `def calculate_microprice(bid_px: float, ask_px: float, bid_sz: float, ask_sz: float):
    # Giá trung bình trọng số theo khối lượng chờ tại đỉnh sổ lệnh
    microprice = (bid_px * ask_sz + ask_px * bid_sz) / (bid_sz + ask_sz)
    imbalance = (bid_sz - ask_sz) / (bid_sz + ask_sz)
    return microprice, imbalance`
  }
];

export default function Vault({ initialDocId, onDocChange }: VaultProps) {
  const [activeTrack, setActiveTrack] = useState<'all' | 'briefings' | 'math' | 'systems'>('all');
  const [selectedTopic, setSelectedTopic] = useState<ArchiveTopic | null>(null);

  // Form Lead unlock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('quant_vault_unlocked') === 'true' || Boolean(initialDocId);
  });
  const [name, setName] = useState<string>(() => localStorage.getItem('quant_vault_user_name') || '');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>(() => localStorage.getItem('quant_vault_user_email') || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);

  // Core special briefings state
  const [activeBriefingId, setActiveBriefingIdState] = useState<string | null>(initialDocId || null);

  const setActiveBriefingId = (id: string | null) => {
    setActiveBriefingIdState(id);
    onDocChange?.(id);
  };

  const coreBriefings = [
    {
      id: 'risk-of-ruin',
      code: 'BC-01',
      title: 'Sự Thật Về Risk Of Ruin (Xác Suất Chạm Ngưỡng Cháy)',
      desc: 'Chứng minh toán học vì sao tỉ lệ thắng cao vẫn có thể mất sạch vốn nếu không tính trước chuỗi thua dài nhất.',
      category: 'Quản trị rủi ro',
      readTime: '6 phút đọc',
      content: {
        intro: 'Nhiều người tin rằng chỉ cần có tỉ lệ thắng (Win Rate) cao thì tài khoản sẽ an toàn. Dữ liệu kiểm chứng trên hàng nghìn lệnh cho thấy điều ngược lại.',
        body1: 'Xác suất chạm ngưỡng dừng cuộc chơi (Risk of Ruin) phụ thuộc vào ba yếu tố đi liền với nhau: tỉ lệ thắng thực tế, tương quan giữa độ lớn lệnh thắng và lệnh thua, và quy mô vốn đặt vào mỗi lệnh.',
        body2: 'Hiệu ứng bờ vực (Cliff effect): Khi giữ quy mô mỗi lệnh ở mức nhỏ và kỷ luật, xác suất chạm đáy sụt giảm gần như bằng không. Nhưng khi nâng quy mô lệnh lên quá lớn, rủi ro không tăng cộng tuyến tính mà vọt thẳng lên mức chắc chắn gặp sự cố khi gặp biến động ngược.',
        body3: 'Trong một chuỗi 1.000 lệnh, ngay cả với tỉ lệ thắng 60 trên 100 lệnh, việc xuất hiện một chuỗi thua liên tiếp từ 10 đến 12 lệnh là hiện tượng toán học bình thường. Cùng một cách vào lệnh trong thư viện, cách chốt lời sớm cho tỉ lệ thắng khoảng 48 trên 100 lệnh (cao hơn các cách chốt khác), nhưng vì lệnh thắng nhỏ còn lệnh thua chịu đủ nên cộng cả chuỗi lại có kết quả gần như tệ nhất.',
        truth: 'Khi tham gia các bài thi quỹ có giới hạn sụt giảm tối đa hẹp, khoảng đệm thực sự để chịu chuỗi thua chỉ là phần hạn mức sụt giảm đó chứ không phải tổng con số danh nghĩa. Không đo trước chuỗi thua dài nhất thì không thể định cỡ lệnh an toàn.'
      }
    },
    {
      id: 'alpha-vs-beta',
      code: 'BC-02',
      title: 'Phân Tách Alpha vs Beta Trong Kiểm Định Hệ Thống',
      desc: 'Bóc tách bản chất: Kết quả đến từ lợi thế thật của bộ quy tắc (Alpha) hay chỉ đang ăn may theo một đoạn xu hướng (Beta)?',
      category: 'Phương pháp đo',
      readTime: '5 phút đọc',
      content: {
        intro: 'Khi đánh giá một phương pháp giao dịch, điều quan trọng nhất là tách bạch giữa biến động chung của thị trường (Beta) và lợi thế riêng có của bộ quy tắc (Alpha).',
        body1: 'Beta là hiện tượng nước lên thuyền lên. Một quy tắc chỉ chuyên mua vào trong đúng giai đoạn vàng tăng mạnh một chiều sẽ cho kết quả trông rất đẹp, nhưng đó là kết quả của đợt sóng chứ chưa chắc là lợi thế của quy tắc.',
        body2: 'Alpha là lợi thế thực sự sau khi đã đối chiếu với việc vào lệnh ngẫu nhiên và đi qua nhiều giai đoạn thị trường khác nhau: tăng, giảm, đi ngang và biến động gắt.',
        body3: 'Nếu một chiến lược chỉ ăn trong một đoạn thị trường ngắn rồi gãy khi bối cảnh đổi chiều, tại Strategy Audit phương pháp đó được xếp vào nhóm TÌNH HUỐNG (39 chiến lược trong thư viện) hoặc CHÁT (188 chiến lược), chứ không được đóng dấu CHẤT.',
        truth: 'Để được xếp hạng CHẤT, phương pháp phải vượt qua bài kiểm định dài hạn trên 22 năm dữ liệu vàng và giữ vững kết quả ở kỳ chấm lại trên dữ liệu mới (từ 02/2024 đến 07/2026, cả 15/15 chiến lược CHẤT đều tiếp tục vượt qua).'
      }
    },
    {
      id: 'curve-fitting',
      code: 'BC-03',
      title: 'Bóc Trần Bẫy Khớp Đường Cong (Curve-Fitting / Overfitting)',
      desc: 'Tại sao 4 trường phái phổ biến nhất mạng xã hội qua 22.938 lệnh đều không vượt qua bài kiểm tra độc lập?',
      category: 'Chống ép số',
      readTime: '7 phút đọc',
      content: {
        intro: 'Hãy hình dung việc bắn một mũi tên lên tường rồi mới lấy bút vẽ hồng tâm bao quanh mũi tên đó. Đó chính là những gì xảy ra khi người ta liên tục chỉnh tham số chỉ báo cho vừa khít với biểu đồ quá khứ.',
        body1: 'Khớp đường cong (Curve-fitting) xảy ra khi người thiết kế thử hàng chục chu kỳ RSI, MA hay khung giờ khác nhau, rồi chỉ giữ lại đúng bộ số tình cờ khớp đẹp nhất với dữ liệu cũ.',
        body2: 'Thị trường tương lai không lặp lại từng nhịp nhiễu của quá khứ. Một bộ quy tắc càng bị ép sát vào dữ liệu cũ bằng nhiều điều kiện chồng chéo thì càng dễ vỡ vụn khi gặp dữ liệu mới chưa từng thấy.',
        body3: 'Tại Strategy Audit, chúng tôi lấy 4 trường phái được chia sẻ nhiều nhất trên mạng (42 chiến lược), cho máy chạy đúng luật qua 22.938 lệnh trên dữ liệu độc lập. Kết quả: không có chiến lược nào vượt qua bài kiểm tra.',
        truth: 'Thuốc thử duy nhất chống lại bẫy ép số là tách riêng phần dữ liệu dùng lúc chỉnh luật và phần dữ liệu dùng để chấm thi (Out-of-sample & Walk-Forward). Quy tắc càng đơn giản, ít tham số tự do, càng có cơ hội sống sót thực tế.'
      }
    }
  ];

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (name.trim().length < 2) {
      setErrorMessage('Vui lòng nhập họ tên hợp lệ (ít nhất 2 ký tự).');
      return;
    }
    const phoneRegex = /^[+]?[0-9\s-]{8,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      setErrorMessage('Số điện thoại không hợp lệ (từ 8-15 số).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Email không đúng định dạng (vd: name@domain.com).');
      return;
    }

    setIsLoading(true);

    if (VAULT_LEADS_WEBHOOK && !VAULT_LEADS_WEBHOOK.startsWith('__')) {
      try {
        await fetch(VAULT_LEADS_WEBHOOK, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            source: 'library_vault_research_archive',
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            submitted_at: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Lead webhook error:', err);
      }
    }

    setIsLoading(false);
    setIsUnlocked(true);
    setShowUnlockModal(false);
    localStorage.setItem('quant_vault_unlocked', 'true');
    if (name.trim()) localStorage.setItem('quant_vault_user_name', name.trim());
    if (email.trim()) localStorage.setItem('quant_vault_user_email', email.trim());
    track('vault_unlock_archive', {});
  };

  const filteredTopics = ARCHIVE_TOPICS.filter((topic) => {
    if (activeTrack === 'all') return true;
    if (activeTrack === 'briefings') return false;
    return topic.track === activeTrack;
  });

  return (
    <div className="relative min-h-screen text-gray-200 font-sans pb-24 pt-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">

        {/* Hero Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[linear-gradient(160deg,rgba(43,255,234,0.16),rgba(43,255,234,0.04))] border border-[#9ff6ff]/40 shadow-[0_0_18px_rgba(43,255,234,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase">
            <FolderOpen className="w-3.5 h-3.5" /> Hồ Sơ Nghiên Cứu · Kho Tài Liệu & Báo Cáo Chuyên Đề
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Kho Tài Liệu &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFDD00] to-[#2BFFEA]">
              Báo Cáo Chuyên Đề
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Tổng hợp các báo cáo phân tích chuyên sâu và nền tảng toán học — thống kê phục vụ trực tiếp cho quy trình{' '}
            <b className="text-white">Strategy Audit — "Đo trước khi tin"</b> trên 22 năm dữ liệu vàng.
          </p>

          {/* Verified Library Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 max-w-3xl mx-auto">
            <GlassCard className="p-3.5 text-center" tilt={false}>
              <div className="text-xl sm:text-2xl font-mono font-bold text-[#2BFFEA]">3 Báo Cáo</div>
              <div className="text-[11px] text-gray-400">Chuyên đề cốt lõi</div>
            </GlassCard>
            <GlassCard className="p-3.5 text-center" tilt={false}>
              <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-300">8 Hồ Sơ</div>
              <div className="text-[11px] text-gray-400">Tài liệu phương pháp đo</div>
            </GlassCard>
            <GlassCard className="p-3.5 text-center" tilt={false}>
              <div className="text-xl sm:text-2xl font-mono font-bold text-amber-300">242 Hồ Sơ</div>
              <div className="text-[11px] text-gray-400">Chiến lược đã kiểm định</div>
            </GlassCard>
            <GlassCard className="p-3.5 text-center" tilt={false}>
              <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-300">22 Năm</div>
              <div className="text-[11px] text-gray-400">Dữ liệu vàng kiểm chứng</div>
            </GlassCard>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTrack('briefings')}
              className="sa-glass-btn px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4" /> Đọc 3 Báo Cáo Chuyên Sâu
            </button>
            <button
              onClick={() => setActiveTrack('all')}
              className="sa-glass-ghost px-4 py-2.5 rounded-xl text-gray-200 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" /> Xem Toàn Bộ Kho Tài Liệu
            </button>
            <button
              onClick={() => setShowUnlockModal(true)}
              className="sa-glass-ghost px-4 py-2.5 rounded-xl text-cyan-300 text-xs font-semibold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" /> {isUnlocked ? 'Tải lại Trọn Bộ Tài Liệu PDF' : 'Nhận Bản PDF Hồ Sơ Nghiên Cứu'}
            </button>
          </div>
        </div>

        {/* Archive Directory Structure Overview */}
        <GlassCard className="p-6 space-y-4" tilt={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2BFFEA]" />
                Cấu Trúc Hồ Sơ Nghiên Cứu (4 Danh Mục Lưu Trữ)
              </h2>
              <p className="text-xs text-gray-400">
                Toàn bộ tài liệu được sắp xếp theo mục đích tra cứu: từ các báo cáo thực tế đến cơ sở thống kê và quy chuẩn dữ liệu
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 self-start sm:self-auto">
              Đo trước khi tin · Không đoán mò
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
            <div className="sa-glass p-3.5 rounded-2xl space-y-1.5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[#9ff6ff]/45 hover:shadow-[0_0_24px_rgba(43,255,234,0.15)]">
              <span className="font-mono font-bold text-[#2BFFEA] text-[11px]">Danh mục 01 · BC-01..03</span>
              <h3 className="font-bold text-white text-xs">Báo Cáo Chuyên Đề</h3>
              <p className="text-[11px] text-gray-400">Xác suất chạm ngưỡng dừng, phân tách Alpha/Beta và bẫy khớp đường cong.</p>
            </div>

            <div className="sa-glass p-3.5 rounded-2xl space-y-1.5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[#9ff6ff]/45 hover:shadow-[0_0_24px_rgba(43,255,234,0.15)]">
              <span className="font-mono font-bold text-[#2BFFEA] text-[11px]">Danh mục 02 · HS-01..02</span>
              <h3 className="font-bold text-white text-xs">Xác Suất & Kiểm Định</h3>
              <p className="text-[11px] text-gray-400">Luật số lớn qua 1.000 lệnh, suy luận Bayes và khử bẫy thử nghiệm đa tham số.</p>
            </div>

            <div className="sa-glass p-3.5 rounded-2xl space-y-1.5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[#9ff6ff]/45 hover:shadow-[0_0_24px_rgba(43,255,234,0.15)]">
              <span className="font-mono font-bold text-[#2BFFEA] text-[11px]">Danh mục 03 · HS-03..05</span>
              <h3 className="font-bold text-white text-xs">Chuỗi Thời Gian & Dữ Liệu</h3>
              <p className="text-[11px] text-gray-400">Ma trận tương quan, tính dừng ADF, chu kỳ lịch và chặn lỗi nhìn trước tương lai.</p>
            </div>

            <div className="sa-glass p-3.5 rounded-2xl space-y-1.5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[#9ff6ff]/45 hover:shadow-[0_0_24px_rgba(43,255,234,0.15)]">
              <span className="font-mono font-bold text-[#2BFFEA] text-[11px]">Danh mục 04 · HS-06..08</span>
              <h3 className="font-bold text-white text-xs">Khung Sáu Ô & Quản Trị</h3>
              <p className="text-[11px] text-gray-400">Kiểm định Walk-Forward, ước tính chuỗi thua dài nhất, cầu dao tự động và chi phí sổ lệnh.</p>
            </div>
          </div>
        </GlassCard>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTrack('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTrack === 'all'
                  ? 'sa-glass-btn'
                  : 'sa-glass-ghost text-gray-300 hover:text-white'
              }`}
            >
              Tất cả Hồ sơ ({coreBriefings.length + ARCHIVE_TOPICS.length})
            </button>
            <button
              onClick={() => setActiveTrack('briefings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTrack === 'briefings'
                  ? 'sa-glass-btn'
                  : 'sa-glass-ghost text-cyan-300 hover:text-white'
              }`}
            >
              3 Báo Cáo Chuyên Sâu
            </button>
            <button
              onClick={() => setActiveTrack('math')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTrack === 'math'
                  ? 'sa-glass-btn'
                  : 'sa-glass-ghost text-gray-300 hover:text-white'
              }`}
            >
              Xác suất & Thống kê (4)
            </button>
            <button
              onClick={() => setActiveTrack('systems')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTrack === 'systems'
                  ? 'sa-glass-btn'
                  : 'sa-glass-ghost text-gray-300 hover:text-white'
              }`}
            >
              Dữ liệu & Khung Kiểm định (4)
            </button>
          </div>

          <span className="text-xs text-gray-400 font-mono hidden sm:inline">
            {activeTrack === 'briefings'
              ? `Đang mở: ${coreBriefings.length} báo cáo chuyên sâu`
              : activeTrack === 'all'
                ? `Đang mở: ${coreBriefings.length} báo cáo + ${ARCHIVE_TOPICS.length} chuyên đề`
                : `Đang mở: ${filteredTopics.length} chuyên đề`}
          </span>
        </div>

        {/* Section 1: 3 Core Special Briefings (shown when 'all' or 'briefings' is active) */}
        {(activeTrack === 'all' || activeTrack === 'briefings') && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Báo Cáo Chuyên Đề Cốt Lõi
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  3 báo cáo đúc kết trực tiếp từ dữ liệu kiểm định thực tế của Strategy Audit
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coreBriefings.map((doc) => (
                <GlassCard
                  key={doc.id}
                  tint="cyan"
                  className="p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {doc.code} · {doc.category}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{doc.readTime}</span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {doc.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveBriefingId(doc.id)}
                    className="sa-glass-btn w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    Đọc hồ sơ báo cáo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </GlassCard>
              ))}
            </div>

            {/* Expanded Briefing Detail View */}
            {activeBriefingId && (
              <div className="sa-glass sa-glass-cyan p-6 sm:p-8 rounded-3xl space-y-5 animate-in fade-in">
                {(() => {
                  const b = coreBriefings.find((x) => x.id === activeBriefingId);
                  if (!b) return null;
                  return (
                    <>
                      <div className="flex items-start justify-between border-b border-white/10 pb-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">
                            Hồ sơ {b.code} · {b.category}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                            {b.title}
                          </h2>
                        </div>
                        <button
                          onClick={() => setActiveBriefingId(null)}
                          className="p-2 text-gray-400 hover:text-white"
                          aria-label="Đóng báo cáo"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4 text-xs sm:text-sm text-gray-200 leading-relaxed">
                        <div className="sa-glass p-4 rounded-2xl text-white font-medium">
                          {b.content.intro}
                        </div>
                        <p>{b.content.body1}</p>
                        <p>{b.content.body2}</p>
                        <p>{b.content.body3}</p>
                        <div className="p-4 rounded-2xl bg-[linear-gradient(150deg,rgba(78,222,163,0.16),rgba(78,222,163,0.04))] border border-emerald-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] text-emerald-100">
                          <b className="text-emerald-300 uppercase text-xs block mb-1">
                            Kết luận kiểm định từ Strategy Audit:
                          </b>
                          {b.content.truth}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setActiveBriefingId(null)}
                          className="sa-glass-ghost px-4 py-2 rounded-xl text-xs text-white font-semibold"
                        >
                          Đóng báo cáo
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Section 2: 8 Specialized Archive Topics */}
        {activeTrack !== 'briefings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#2BFFEA]" />
                  Chuyên Đề Tài Liệu & Phương Pháp Đo Lường
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Cơ sở toán học, thống kê, quy chuẩn làm sạch dữ liệu và khung kiểm định Sáu Ô
                </p>
              </div>
            </div>

            {filteredTopics.map((topic) => (
              <GlassCard
                key={topic.id}
                tilt={false}
                className="p-6 space-y-5"
              >
                {/* Topic Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-2 rounded-xl bg-[#2BFFEA]/10 border border-[#2BFFEA]/30 flex items-center justify-center font-mono font-bold text-[#2BFFEA] text-xs shrink-0">
                      {topic.docCode}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {topic.categoryLabel}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-xl font-bold text-white tracking-tight mt-0.5">
                        {topic.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTopic(topic)}
                    className="sa-glass-ghost px-4 py-2 rounded-xl text-cyan-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    Mở hồ sơ chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtitle & Key Equation */}
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {topic.subtitle}
                </p>

                <div className="sa-glass p-4 rounded-2xl space-y-2">
                  <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Biểu thức & Quy luật cốt lõi
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 text-[#2BFFEA] text-xs sm:text-sm text-center border border-cyan-500/10 overflow-x-auto">
                    <MathFormula formula={topic.keyEquation} />
                  </div>
                  <p className="text-xs text-gray-400">
                    {topic.equationNote}
                  </p>
                </div>

                {/* 2-Column: Core Concepts & Strategy Audit Bridge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="sa-glass p-4 rounded-2xl space-y-2">
                    <div className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Nội dung trọng tâm
                    </div>
                    <ul className="space-y-1.5 text-gray-300">
                      {topic.coreConcepts.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#2BFFEA] mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-[linear-gradient(150deg,rgba(78,222,163,0.16),rgba(78,222,163,0.04))] border border-emerald-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] space-y-2">
                    <div className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Ứng dụng tại Strategy Audit ("Đo trước khi tin")
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {topic.auditBridge}
                    </p>
                  </div>
                </div>

                {/* Recommended Books & Practice Note Footer */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-white/10">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      Tài liệu tham khảo: <b className="text-white">{topic.books[0]?.name}</b> — {topic.books[0]?.author}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <Award className="w-3.5 h-3.5 text-[#2BFFEA] shrink-0" />
                    <span>Thực hành kiểm chứng: <b className="text-[#2BFFEA] font-mono">{topic.practiceNote}</b></span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Detailed Topic Modal */}
        <AnimatePresence>
          {selectedTopic && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="sa-glass sa-glass-solid relative w-full max-w-3xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden text-gray-200 font-sans"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-white/10 bg-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-2 rounded-xl bg-[#2BFFEA]/10 border border-[#2BFFEA]/30 flex items-center justify-center text-[#2BFFEA] font-mono font-bold text-xs">
                      {selectedTopic.docCode}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                        Hồ Sơ Nghiên Cứu · {selectedTopic.categoryLabel}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {selectedTopic.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm leading-relaxed">
                  {/* Equation Block */}
                  <div className="sa-glass p-4 rounded-2xl space-y-2">
                    <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                      Công thức & Định luật toán học
                    </div>
                    <div className="p-3.5 bg-black/60 rounded-xl text-[#2BFFEA] text-sm sm:text-base text-center border border-cyan-500/20 overflow-x-auto">
                      <MathFormula formula={selectedTopic.keyEquation} />
                    </div>
                    <p className="text-xs text-gray-400">
                      {selectedTopic.equationNote}
                    </p>
                  </div>

                  {/* Core Concepts */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Nội dung chi tiết trong hồ sơ
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {selectedTopic.coreConcepts.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2BFFEA] shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Strategy Audit Bridge */}
                  <div className="p-4 rounded-2xl bg-[linear-gradient(150deg,rgba(78,222,163,0.16),rgba(78,222,163,0.04))] border border-emerald-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] space-y-2">
                    <div className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Liên hệ thực tế tại Thư viện Strategy Audit
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {selectedTopic.auditBridge}
                    </p>
                  </div>

                  {/* Recommended Books */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Tài liệu & Sách chuyên khảo
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedTopic.books.map((b, i) => (
                        <div key={i} className="sa-glass p-3 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-white flex items-center justify-between">
                            <span>{b.name}</span>
                            {b.link && (
                              <a href={b.link} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                                <ExternalLink className="w-3 h-3 inline" />
                              </a>
                            )}
                          </div>
                          <div className="text-gray-400 text-[11px]">{b.author}</div>
                          <div className="text-gray-500 text-[10px]">{b.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice & Code Snippet */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-[#2BFFEA]" /> Đoạn mã kiểm chứng minh họa (Python)
                    </h4>
                    <div className="p-4 rounded-2xl bg-[#030910] border border-[#172c3d] font-mono text-xs text-emerald-300 overflow-x-auto">
                      <pre>{selectedTopic.codeSnippet}</pre>
                    </div>
                    <div className="sa-glass p-3 rounded-xl text-xs text-gray-300">
                      <b>Thực hành kiểm chứng:</b> {selectedTopic.practiceNote}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/[0.03] flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Mã lưu trữ: {selectedTopic.docCode} · Hồ Sơ Nghiên Cứu Strategy Audit
                  </span>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="sa-glass-btn px-4 py-2 rounded-xl font-bold"
                  >
                    Đóng hồ sơ
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lead Unlock Modal */}
        <AnimatePresence>
          {showUnlockModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="sa-glass sa-glass-solid w-full max-w-md rounded-3xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-[#2BFFEA]" />
                    Nhận Bản PDF Hồ Sơ Nghiên Cứu
                  </h3>
                  <button onClick={() => setShowUnlockModal(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <p className="text-xs text-gray-300">
                  Để lại thông tin để Strategy Audit gửi trọn bộ PDF 3 Báo cáo chuyên đề và 8 Hồ sơ phương pháp đo lường qua Email/Zalo.
                </p>

                <form onSubmit={handleUnlock} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1">Họ và tên:</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:outline-none focus:border-[#2BFFEA]/70 focus:shadow-[0_0_0_3px_rgba(43,255,234,0.15)] transition-[border-color,box-shadow]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Số điện thoại / Zalo:</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:outline-none focus:border-[#2BFFEA]/70 focus:shadow-[0_0_0_3px_rgba(43,255,234,0.15)] transition-[border-color,box-shadow]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Email:</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:outline-none focus:border-[#2BFFEA]/70 focus:shadow-[0_0_0_3px_rgba(43,255,234,0.15)] transition-[border-color,box-shadow]"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="sa-glass-btn w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Nhận Trọn Bộ Hồ Sơ Nghiên Cứu'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
