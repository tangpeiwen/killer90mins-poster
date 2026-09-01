# 失败迭代归档（2026-08-22 前后）

这是 0829 那期 v1→v10 收敛失败的全部脚本与日志。**不要参考、不要复用、不要在此基础上继续改。**
保留的唯一理由：它们是「为什么这条路走不通」的原始证据。

对应的 .ai / .png 已于 2026-08-26 送入废纸篓（只留了 `killer90mins_v10.png` 作为视觉记录）。

## 三条已被证伪的做法

1. **关键输入靠目测** —— 发顶位置由模型看图估计。`_run_update_0829_v7.jsx` 里的 `faceX: 0.406023`
   六位小数看似精确，其实是编的；而 v10 里 `hairTop: 399` 是人肉试了八版试出来的，
   与 alpha 通道 200ms 算出的结果相同 —— 猜对了也是猜的，换个演员就崩。
2. **系统没有不动点** —— 脚本同时移动名牌和人像，且互为定位参照。基准在动，
   被基准定位的东西也在动，数学上不收敛。见 `_calibrate_*.jsx`、`_fix_portrait_head_gap_v8.jsx`。
3. **校验是自证的** —— 脚本打印 `verified_gap_mm=12.0`，但它校验的是自己的算术，输入错时同样输出 12.0。

## 目录

- `root/` —— 根目录下的一次性审计脚本与 `update_killer90mins_20260829_v1..v6.jsx`
- `0819/` —— `_run_update_0829*`、`_calibrate_*`、`_fix_portrait_head_gap_v8`、`_apply_uniform_12mm`
- `0829-logs/` —— 各版的 calibration / error / done / spacing 日志

当前在用的管线见 `tools/`，规则见 `skills/update-killer90mins-poster/`。
