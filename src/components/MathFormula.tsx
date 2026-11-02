/**
 * MathFormula.tsx
 * Bộ hiển thị công thức toán học (LaTeX-to-JSX) nhẹ, không phụ thuộc thư viện nặng.
 * Hỗ trợ phân số tầng (\frac), mũi tên có nhãn (\xrightarrow), căn bậc hai (\sqrt),
 * gạch ngang trên (\bar), tổng (\sum), cực đại (\max), chỉ số dưới/trên (_{...}, ^{...})
 * và ký hiệu toán học / Hy Lạp chuẩn.
 */

import React from 'react';

const LATEX_SYMBOLS: Record<string, string> = {
  mid: ' | ',
  cdot: ' · ',
  times: ' × ',
  le: ' ≤ ',
  leq: ' ≤ ',
  ge: ' ≥ ',
  geq: ' ≥ ',
  approx: ' ≈ ',
  neq: ' ≠ ',
  to: ' → ',
  rightarrow: ' → ',
  longrightarrow: ' ⟶ ',
  infty: '∞',
  perp: ' ⊥ ',
  top: 'T',
  partial: '∂',
  mu: 'μ',
  sigma: 'σ',
  theta: 'θ',
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  lambda: 'λ',
  Lambda: 'Λ',
  Sigma: 'Σ',
  Delta: 'Δ',
  Omega: 'Ω',
  omega: 'ω',
  epsilon: 'ε',
  tau: 'τ',
  pi: 'π',
  sum: '∑',
  propto: ' ∝ ',
  cap: ' ∩ ',
  cup: ' ∪ ',
  in: ' ∈ ',
  emptyset: '∅',
  dots: '…',
  ldots: '…',
  cdots: '⋯',
  ln: 'ln ',
  log: 'log ',
  exp: 'exp',
  max: 'max',
  min: 'min',
  Cov: 'Cov',
  Var: 'Var',
  quad: '  ',
  qquad: '    ',
};

const CALLIGRAPHIC_MAP: Record<string, string> = {
  F: 'ℱ',
  L: 'ℒ',
  N: '𝒩',
  O: '𝒪',
  P: '𝒫',
  H: 'ℋ',
};

/** Đọc nội dung trong cặp ngoặc nhọn { ... } có tính độ sâu lồng nhau */
function extractBraced(input: string, startIdx: number): { content: string; nextIdx: number } | null {
  let i = startIdx;
  while (i < input.length && input[i] === ' ') i++;
  if (i >= input.length || input[i] !== '{') return null;

  let depth = 0;
  const contentStart = i + 1;
  for (; i < input.length; i++) {
    if (input[i] === '{' && (i === 0 || input[i - 1] !== '\\')) {
      depth++;
    } else if (input[i] === '}' && (i === 0 || input[i - 1] !== '\\')) {
      depth--;
      if (depth === 0) {
        return {
          content: input.slice(contentStart, i),
          nextIdx: i + 1,
        };
      }
    }
  }
  return { content: input.slice(contentStart), nextIdx: input.length };
}

/** Đọc đối số của _ hoặc ^ (có thể là {...}, \command, hoặc 1 ký tự) */
function extractScriptArg(input: string, startIdx: number): { content: string; nextIdx: number } {
  const braced = extractBraced(input, startIdx);
  if (braced) return braced;

  let i = startIdx;
  while (i < input.length && input[i] === ' ') i++;
  if (i >= input.length) return { content: '', nextIdx: i };

  if (input[i] === '\\') {
    let j = i + 1;
    while (j < input.length && /[a-zA-Z]/.test(input[j])) j++;
    return { content: input.slice(i, j), nextIdx: j };
  }

  return { content: input[i], nextIdx: i + 1 };
}

function parseMathNodes(expr: string, keyPrefix = 'm'): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let buffer = '';
  let i = 0;
  let tokenCount = 0;

  const flushBuffer = () => {
    if (buffer) {
      // Giữ khoảng trắng toán học quanh các toán tử quan hệ
      const formatted = buffer
        .replace(/\s*(≤|≥|≈|≠|⊥|∩|∪|∈|∝)\s*/g, ' $1 ')
        .replace(/\s+\|\s+/g, ' | ');
      nodes.push(
        <span key={`${keyPrefix}-t-${tokenCount++}`} className="whitespace-pre-wrap">
          {formatted}
        </span>
      );
      buffer = '';
    }
  };

  while (i < expr.length) {
    const ch = expr[i];

    // Xử lý lệnh bắt đầu bằng \
    if (ch === '\\') {
      const nextChar = expr[i + 1];
      // Các ký tự thoát hoặc khoảng trắng ngắn: \;, \,, \&, \{, \}
      if (nextChar && !/[a-zA-Z]/.test(nextChar)) {
        if (nextChar === ';' || nextChar === ',') {
          buffer += ' ';
        } else if (nextChar === '&' || nextChar === '%' || nextChar === '{' || nextChar === '}') {
          buffer += nextChar;
        }
        i += 2;
        continue;
      }

      let j = i + 1;
      while (j < expr.length && /[a-zA-Z]/.test(expr[j])) j++;
      const cmd = expr.slice(i + 1, j);
      i = j;

      if (cmd === 'left' || cmd === 'right') {
        continue;
      }

      if (cmd === 'mathcal') {
        const cal = extractBraced(expr, i);
        if (cal) {
          i = cal.nextIdx;
          const letter = cal.content.trim();
          buffer += CALLIGRAPHIC_MAP[letter] || letter;
          continue;
        }
      }

      if (cmd === 'frac') {
        flushBuffer();
        const num = extractBraced(expr, i);
        if (num) {
          i = num.nextIdx;
          const den = extractBraced(expr, i);
          if (den) {
            i = den.nextIdx;
            const k = `${keyPrefix}-frac-${tokenCount++}`;
            nodes.push(
              <span
                key={k}
                className="inline-flex flex-col items-center justify-center align-middle mx-1.5 leading-tight"
              >
                <span className="px-1.5 pb-0.5 text-[0.92em]">
                  {parseMathNodes(num.content, `${k}-n`)}
                </span>
                <span className="w-full border-t border-current pt-0.5 px-1.5 text-[0.92em]">
                  {parseMathNodes(den.content, `${k}-d`)}
                </span>
              </span>
            );
            continue;
          }
        }
      }

      if (cmd === 'xrightarrow') {
        flushBuffer();
        const label = extractBraced(expr, i);
        if (label) {
          i = label.nextIdx;
          const k = `${keyPrefix}-xarr-${tokenCount++}`;
          nodes.push(
            <span
              key={k}
              className="inline-flex flex-col items-center justify-center align-middle mx-2 leading-none"
            >
              <span className="text-[0.72em] text-cyan-300/90 pb-0.5">
                {parseMathNodes(label.content, `${k}-l`)}
              </span>
              <span className="text-base leading-none">⟶</span>
            </span>
          );
          continue;
        }
      }

      if (cmd === 'sqrt') {
        flushBuffer();
        const rad = extractBraced(expr, i);
        if (rad) {
          i = rad.nextIdx;
          const k = `${keyPrefix}-sqrt-${tokenCount++}`;
          nodes.push(
            <span key={k} className="inline-flex items-center align-middle mx-0.5">
              <span className="text-[1.15em] leading-none mr-[1px] select-none">√</span>
              <span className="border-t border-current px-1 pt-0.5 leading-tight">
                {parseMathNodes(rad.content, `${k}-r`)}
              </span>
            </span>
          );
          continue;
        }
      }

      if (cmd === 'bar') {
        flushBuffer();
        const inner = extractBraced(expr, i);
        if (inner) {
          i = inner.nextIdx;
          const k = `${keyPrefix}-bar-${tokenCount++}`;
          nodes.push(
            <span key={k} className="inline-block border-t border-current leading-none pt-0.5 mx-[1px]">
              {parseMathNodes(inner.content, `${k}-b`)}
            </span>
          );
          continue;
        }
      }

      if (cmd === 'text') {
        flushBuffer();
        const txt = extractBraced(expr, i);
        if (txt) {
          i = txt.nextIdx;
          const k = `${keyPrefix}-txt-${tokenCount++}`;
          nodes.push(
            <span key={k} className="font-sans font-medium text-[0.92em] tracking-normal">
              {parseMathNodes(txt.content, `${k}-tx`)}
            </span>
          );
          continue;
        }
      }

      if (cmd in LATEX_SYMBOLS) {
        buffer += LATEX_SYMBOLS[cmd];
      } else {
        buffer += cmd;
      }
      continue;
    }

    // Xử lý chỉ số dưới _ và chỉ số trên ^ (bao gồm cả trường hợp đi cặp _a^b)
    if (ch === '_' || ch === '^') {
      flushBuffer();
      let subContent: string | null = null;
      let supContent: string | null = null;

      while (i < expr.length) {
        while (i < expr.length && expr[i] === ' ') i++;
        if (i < expr.length && (expr[i] === '_' || expr[i] === '^')) {
          const isSub = expr[i] === '_';
          i++;
          const arg = extractScriptArg(expr, i);
          i = arg.nextIdx;
          if (isSub) subContent = arg.content;
          else supContent = arg.content;
        } else {
          break;
        }
      }

      const k = `${keyPrefix}-sc-${tokenCount++}`;
      if (subContent !== null && supContent !== null) {
        nodes.push(
          <span key={k} className="inline-flex flex-col items-start justify-center align-middle text-[0.68em] leading-none ml-[1px] mr-[2px]">
            <span className="pb-[1px]">{parseMathNodes(supContent, `${k}-sup`)}</span>
            <span className="pt-[1px]">{parseMathNodes(subContent, `${k}-sub`)}</span>
          </span>
        );
      } else if (subContent !== null) {
        nodes.push(
          <sub key={k} className="text-[0.72em] leading-none align-baseline relative -bottom-[0.2em] ml-[0.5px]">
            {parseMathNodes(subContent, `${k}-sub`)}
          </sub>
        );
      } else if (supContent !== null) {
        nodes.push(
          <sup key={k} className="text-[0.72em] leading-none align-baseline relative -top-[0.45em] ml-[0.5px]">
            {parseMathNodes(supContent, `${k}-sup`)}
          </sup>
        );
      }
      continue;
    }

    // Bỏ qua ngoặc nhọn bao ngoài nếu còn sót
    if (ch === '{' || ch === '}') {
      i++;
      continue;
    }

    buffer += ch;
    i++;
  }

  flushBuffer();
  return nodes;
}

export interface MathFormulaProps {
  formula: string;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ formula, className = '' }) => {
  // Tách các mệnh đề ngăn cách bởi \quad ; \quad hoặc ; có khoảng trắng
  const segments = formula
    .split(/\\quad\s*;\s*\\quad|\\;\s*;\s*\\;/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-y-2 gap-x-4 font-mono tracking-wide ${className}`}
    >
      {segments.map((seg, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <span aria-hidden className="text-cyan-400/50 select-none font-sans text-sm px-1.5">
              │
            </span>
          )}
          <span className="inline-flex flex-wrap items-center justify-center gap-y-1 leading-relaxed">
            {parseMathNodes(seg, `seg-${idx}`)}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};
