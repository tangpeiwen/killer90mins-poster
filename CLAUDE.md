# spicy海报 / Killer90mins

固定版式海报的自动化改版：每期只换演员照片、姓名、日期、主持人标签、第五格（真人 / 神秘嘉宾剪影），其余版式一个像素不动。

## 从哪里开始

| 要做的事 | 去哪 |
|---|---|
| 出一期新海报 | 用 skill `update-killer90mins-poster` |
| 理解为什么这么做 | `docs/specs/2026-08-23-killer90mins-poster-automation-design.md` |
| 查模板常量 / 规则定义 | `skills/update-killer90mins-poster/references/` |

**不要在本文件里复述规则和数字。** 唯一真相在 skill 的 references 和 spec 里，这里只放路径和禁令。

## 文件消歧（重要）

- **母版：`killer90mins_20260819/killer90mins_v3_12mm.ai`** —— 只读，任何情况下都不在它上面保存
- **认可参照：`killer90mins_20260829/killer90mins_0829.ai`** —— 设计师认可的观感基准，只读
- 当前审计脚本在 `tools/` 和 `killer90mins_20260819/_audit_*.jsx`，其余 JSX 一律不是
- `.archive/failed-iterations-20260822/` 是 v1→v10 收敛失败的历史，**不要参考、不要接着改**

`killer90mins_20260819/` 里的 `MISSION.md` / `NOTES.md` / `lessons/` / `learning-records/` / `reference/` 是教学工作区，与出图管线无关，不是待办事项。

## 硬纪律

1. **母版只读。** 改图一律先 `saveAs` 副本，再在副本上操作。
2. **审计 JSX 是只读的。** 跑完直接关闭，不要保存。
3. **不打补丁。** 验收不过时，改 `config/slots.json` 或 `actors/<id>.json` 里的**一个数字**，然后整条管线重跑。绝不写修补脚本、绝不在上一版输出上继续改 —— 这条是防止 v1→v10 重演的全部机制。
4. **算术留在 Python。** 生成的 JSX 只做测量和赋值，里面不应出现任何计算表达式。
5. **验收必须独立。** 回头读 .ai 里的真实坐标重算，不采信执行脚本自己打印的结论。

## 环境

- macOS + Illustrator，通过 ExtendScript (JSX) 驱动
- Python 侧依赖：Pillow、NumPy（NumPy 2.x，注意 `np.ptp(x)` 而非 `x.ptp()`）
- 字体：`LaMachineCompany`（英文名，白色印章板是字形自带）、`Huiwen-MinchoGBK-Regular`（中文名，无白框 —— 已知模板缺陷）
