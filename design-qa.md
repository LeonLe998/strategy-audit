# Design review — refreshed Stitch and funnel implementation

## New design references reviewed

- `stitch_fintech_web_redesign/quantitative_intelligence_strategy_audit/DESIGN.md` — analytical, evidence-led visual direction.
- `stitch_fintech_web_redesign/strategy_audit_trang_ch_mobile/screen.png` — mobile homepage.
- `stitch_fintech_web_redesign/th_vi_n_300_chi_n_l_c_mobile/screen.png` — mobile strategy library.
- `stitch_fintech_web_redesign/trang_th_nh_vi_n_lab_mobile/screen.png` — membership page.
- Existing homepage and Six Ô Stitch references remain useful for the overall visual language and process flow.

## Changes completed

- Refocused the home hero on whether a method holds up when measured with data.
- Kept a real, dated BRK001 record as the concrete example and its limitations visible. Reworked the later case card into three questions for reading an audit record instead of repeating the same metrics.
- Added persistent mobile navigation across Home, Six Ô, Library and Membership; tightened desktop navigation labels so they remain on one line at medium window widths.
- Tightened the library's mobile first screen: search, filters and the first strategy record appear sooner; the five-category statistic block and long explanatory note remain available on larger screens.
- Tightened the membership mobile hero and price card so the $50 first month, $100 subsequent monthly fee, manual confirmation and Telegram action are visible together without scrolling on the tested 390 × 844 viewport.
- Preserved clear copy that membership is not a signal room and past results do not guarantee future results. No performance statistics from Stitch mockups were adopted without evidence.

## Interactive checks

- Local preview: `http://127.0.0.1:5175/` (backup project only; the older `5173` preview was left untouched).
- Inspected Home at 1164 × 900 and mobile Library/Membership at 390 × 844.
- Library search/filter controls and actual strategy cards render. Did not submit the interest form or send contact information.
- Six Ô flow, result language, primary navigation and manual payment route were checked during the preceding implementation pass; the app supports beginning the six-question flow and preserves “not a performance score” language.
- `npm run build` completed successfully after the final edits (2,991 modules transformed). Vite reported a bundle-size warning for the 1.04 MB JavaScript chunk.

## Limitations

The available browser surface shows screenshots for visual review but does not save implementation captures locally for a normalized, side-by-side pixel comparison against the Stitch PNGs. A full accessibility audit (keyboard-only, screen reader, reduced motion and zoom) was not performed.

**Result: implemented, interactively reviewed at mobile and desktop sizes, and build verified; pixel-comparison evidence not captured.**

