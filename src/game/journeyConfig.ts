/**
 * Cấu hình hành trình 6 màn và bảng điểm.
 * Đổi số điểm ở đây, không rải số trong component.
 */

export type StageId =
  | 'khai-niem'
  | 'vi-sao-kiem-dinh'
  | 'sau-o'
  | 'thu-vien'
  | 'kiem-diem'
  | 'chuyen-doi';

export interface StageDef {
  id: StageId;
  order: number;
  title: string;
  /** Điểm thưởng khi hoàn thành màn (0 = màn không cho điểm) */
  reward: number;
}

export const STAGES: StageDef[] = [
  { id: 'khai-niem', order: 1, title: 'Khái niệm', reward: 10 },
  { id: 'vi-sao-kiem-dinh', order: 2, title: 'Vì sao kiểm định', reward: 10 },
  { id: 'sau-o', order: 3, title: 'Sáu Ô', reward: 30 },
  { id: 'thu-vien', order: 4, title: 'Thư viện 300', reward: 0 },
  { id: 'kiem-diem', order: 5, title: 'Kiếm thêm điểm', reward: 0 },
  { id: 'chuyen-doi', order: 6, title: 'Chuyển đổi', reward: 0 },
];

/** Giá mở một hồ sơ chiến lược ở Màn 4. 50 điểm từ 3 màn đầu → đúng 2 hồ sơ. */
export const PROFILE_UNLOCK_COST = 25;

/** Tên gọi điểm hiển thị cho người dùng (chờ Leon chốt) */
export const POINT_NAME = 'Điểm Đo';
