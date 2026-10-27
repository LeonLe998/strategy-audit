// Helper gửi sự kiện Google Analytics 4 (an toàn nếu gtag chưa load).
export function track(event: string, params?: Record<string, unknown>): void {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === "function") {
      w.gtag("event", event, params || {});
    }
  } catch {
    // no-op
  }
}
