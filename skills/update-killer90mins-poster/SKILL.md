---
name: update-killer90mins-poster
description: 从 brief 更新 Killer90mins 系列 Illustrator 海报（换演员照片、姓名、日期、主持人标签、第五格真人/神秘嘉宾），并用可执行验收确认结果。当需要出新一期 Killer90mins 海报、替换演员或日期、切换神秘嘉宾模式、或诊断该模板能否自动化时使用。所有几何常量已实测确认，摆放是纯算术，验收读回 .ai 实际状态而非脚本日志。
---

# Update Killer90mins Poster

一期海报只变五件事：**演员照片、姓名、日期时间、主持人标签、第五格模式**。其余版式一律不动。

本 skill 描述的是一条**已跑通并经验收的管线**，不是建议。2026-08-29 期由它生成，L4 四项全部通过，全程无人工补位。

---

## 唯一纪律

> **L4 报 FAIL 时，回去改 `config/slots.json` 或 `actors/<id>.json` 里的一个数字，然后整体重跑。**
> **永远不要写补丁脚本，永远不要在上一版输出上继续改。**

这条是全部机制。此前 v1→v10 十个版本无法收敛，根因就是每一版都在上一版结果上打补丁、且用移动中的名牌当人像的定位基准——**那个系统没有不动点，数学上就不收敛**。

---

## 四层

| 层 | 工具 | 职责 | 跑几次 |
|---|---|---|---|
| **L1 模板常量** | `config/slots.json` | 五格黑板几何、上沿角度、规则与容差 | 换模板才改 |
| **L2 素材闸门** | `tools/measure_actor.py` | 量 PNG 的 alpha，输出三个比例值 + 核对图；不合格直接拒收 | 每张新照片一次，永久缓存 |
| **L3 摆放** | `tools/build_poster.py` | Python 算出全部目标坐标，生成**只做赋值**的 JSX | 每期 |
| **L4 验收** | `tools/_audit_output.jsx` + `tools/verify_poster.py` | 读回 .ai 的**实际**状态重算，逐项 PASS/FAIL | 每期 |

**所有算术在 Python 侧。JSX 只做两件蠢事：测量和赋值。** ExtendScript 里不写几何运算——这个项目所有的反复正是从那里开始的。

---

## 流程

### 0. 准备 brief

照 `references/brief-schema.md` 写 `briefs/<date>.json`。演员顺序、主持人、第五格模式都要显式写出，**不要从"少了一张照片"推断神秘嘉宾模式**。

### 1. L2 素材闸门

```bash
python3 tools/measure_actor.py "0829 Killer/1.CASPER.png" ... 
```

产出 `actors/<id>.json`（`headTopRatio` / `headCenterXRatio` / `headWidthRatio`）与 `actors/<id>_check.jpg`。

**必须看一次核对图**：品红线应压在发顶、绿框应在太阳穴或眼睛高度、黄线应穿过脸中心。

硬性拒收：无 alpha 通道 / dpi < 250 / 头顶被裁切 / 主体偏下。
软性警告：头中心定位偏软（长发常见）、裁切极紧。

**素材问题在这里拦，不要等出图**。

### 2. L3 Stage 1 — 换内容并测量

```bash
python3 tools/build_poster.py stage1 briefs/<date>.json
```

在 Illustrator 里打开母版，运行生成的 `tools/_stage1_<date>.jsx`。它**另存副本**后：换 NAME 文本/字体/颜色、换照片链接、切第五格显隐、改日期，然后测量五个名牌的**真实墨迹边界**写进 txt。**不做任何定位。**

分两阶段的原因：换了名字之后名牌的墨迹边界才能知道（字数不同宽度不同，中文字体度量完全不同），而人像位置由名牌下边决定。

### 3. L3 Stage 2 — 施加坐标

```bash
python3 tools/build_poster.py stage2 briefs/<date>.json
```

打开 stage1 的产物，运行 `tools/_stage2_<date>.jsx`。它施加名牌位移与人像的 left/top/width/height，另存并导出 PNG。

### 4. L4 验收

打开产物，运行 `tools/_audit_output.jsx`（只读，跑完**不要保存**），然后：

```bash
python3 tools/verify_poster.py <...>_L4.txt briefs/<date>.json
```

**验收脚本本身也要先过验收**：拿设计师认可的 `killer90mins_20260819/killer90mins_v3.ai` 跑一遍，必须五格全 PASS。通不过说明容差定错了——容差应当**从认可稿反推**，取"不严于人工水平"，而不是凭印象拍。（实际发生过：R3 容差拍成 4.0mm，而认可稿实测最差 4.21mm。）

---

## 摆放规则

名牌位置**只与模板有关，与演员无关**——这是不动点，一次冻结，永不逐期调整。人像位置由名牌决定。整条链是单向的，无循环、无判断：

```
黑板上沿（模板常量）
  ↓ 垂线 R0（逐格，见下），角度 = 该格上沿角度，横向居中于黑板
名牌
  ↓ 垂线 12mm（最小净距）
发顶
  ↓
placed.width  = 目标头宽 / headWidthRatio
placed.height = width / 图片宽高比
placed.top    = 发顶目标 − headTopRatio × height
placed.left   = 黑板中心 − headCenterXRatio × width
```

常量与角度见 [references/template-contract.md](references/template-contract.md)。
「发顶」「头宽」「最小净距」的规范定义见 [references/measurement-definitions.md](references/measurement-definitions.md) —— **这三个词不定义清楚，整条管线无效**。

**R0 是逐格值，不是统一的 12mm：**

| slot | 01 | 02 | 03 | 04 | 05 |
|---|---|---|---|---|---|
| R0 (mm) | 16.13 | 14.95 | 14.15 | 12.71 | 不动（神秘嘉宾单独对待） |

12mm 是设计师口述的规格，但**他认可的两份文件都不执行它**（v3 = 15.28/14.82/14.35/12.54，
0829 = 16.98/15.08/13.95/12.88）。逐格值取这两份的均值。两份文件血脉独立
（v3 手工校准，0829 出自旧 AI 管线 v6 分支），却在 slot 02/03/04 上吻合到 0.4mm 以内——
**「从左到右递减」是真实版式意图，统一成一个数会抹掉它。**

底部出血保护：人像底部必须低于黑板最低角 ≥1mm；不足时以发顶为不动点微放大。

---

## 已被证伪的做法

**读 [references/history-to-rules.md](references/history-to-rules.md)。** 那份文件比本文其余部分更值钱——它记录了已经试过、失败、以及失败原因的做法。不看它会重新推导一遍同样的错误。

最容易重犯的三条，先列在这里：

1. **`alpha > 16` 判定发顶是错的。** 6% 不透明的发丝渲染出来接近纯黑、肉眼不可见，会让蓬松发质的人偏 0.8mm。用 `alpha ≥ 128`。
2. **不要在压平的成品图上做精密像素取证。** 黑板边缘、名牌边缘都有抗锯齿羽化带，会被误判成"人像轮廓"；纸面色与白色印章块在亮度上不可分。本项目在这上面栽过四次。L4 要读 .ai，不要读像素。
3. **验收必须覆盖每一条规则。** R0（黑板上沿→名牌）一度不在验收项里——意味着 stage2 在这里出错时验收会全绿放行。加进去之后立刻发现认可稿在这一项上 4/5 不达标，进而导出了逐格 R0。**漏检的规则等于没有规则。**

---

## 完成的定义

见 [references/qa-checklist.md](references/qa-checklist.md)。**不满足其中任一条，不算完成。**

---

## 已知限制

- **中文名没有白色印章板** —— 白块是拉丁字体的字形，中文回退到 `Huiwen-MinchoGBK-Regular` 后消失。现行做法：中文名用该字体 + 白色填充 + 无框（`预览2.jpg` 的「凌 浩」即此形态），已获认可。
- **头宽量的是轮廓，包含头发。** 长发者的脸会因此偏小。已试过头高、人脸检测、双眼距、肤色宽四种替代，全部更差（见 history-to-rules）。现行做法：默认 64.4mm，某位演员看着不对就在 brief 里覆盖那一个数字——**这是每位演员只发生一次的判断，且演员是复用的**。
- **头宽的搜索窗口按图片高度取 5%–20%**，对顶部裁切极紧的照片会整体下移到脸的下半部（Ayin 的最宽行落在嘴的高度）。改用「头部高度」的百分比更对，但头部高度依赖脖子检测，而高领毛衣测不出来。
- **日期未做自动重排。** `AUG` 比 `SEPT` 窄约 34mm，字间距会变。两份认可稿的日期是每期手工摆的，没有可反推的对齐规则。
- `ACTOR_03` 的组名是 `PHTOTO`（拼写错误），所有版本均有，脚本需兼容。
