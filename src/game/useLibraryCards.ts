/**
 * Đọc dữ liệu công khai của thư viện cho lá bài và phễu số ở Màn 2.
 * Chỉ dùng file do scripts/build-data.mjs sinh ra (đã lọc R/PF).
 */
import { useEffect, useState } from 'react';
import type { Verdict } from '../content/journey';

export interface LibraryCard {
  id: string;
  ten: string;
  ho: string;
  tf: string;
  moTa: string;
  verdict: Verdict;
  /** Kỳ thi thật 2019–2023 */
  soLenh: number;
  tiLeThang: number;
  namDuong: string;
  thiLan2?: string;
}

export interface LibrarySummary {
  tong: number;
  daChay: number;
  verdict: Record<string, number>;
  capNhat: string;
}

const BASE = '/data/thuvien_data';

export function useLibrarySummary() {
  const [summary, setSummary] = useState<LibrarySummary | null>(null);
  useEffect(() => {
    let active = true;
    fetch(`${BASE}/thu_vien_index.json`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setSummary({ tong: d.tong, daChay: d.da_chay, verdict: d.verdict_da_chay, capNhat: d.cap_nhat });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return summary;
}

export function useLibraryCards(ids: string[]) {
  const [cards, setCards] = useState<LibraryCard[] | null>(null);
  const key = ids.join(',');

  useEffect(() => {
    let active = true;
    Promise.all(
      key.split(',').map((id) =>
        fetch(`${BASE}/reports_json/${id}.json`)
          .then((r) => r.json())
          .then(
            (r): LibraryCard => ({
              id: r.spec.id,
              ten: r.spec.ten,
              ho: r.spec.ho,
              tf: r.spec.tf,
              moTa: r.spec.mo_ta,
              verdict: r.verdict,
              soLenh: r.OOS?.n,
              tiLeThang: r.OOS?.wr,
              namDuong: r.OOS?.years_pos,
              thiLan2: r.OOS2?.status,
            }),
          ),
      ),
    )
      .then((list) => {
        if (active) setCards(list);
      })
      .catch(() => {
        if (active) setCards([]);
      });
    return () => {
      active = false;
    };
  }, [key]);

  return cards;
}
