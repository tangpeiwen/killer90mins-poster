# Killer90mins 海报自动化

固定版式海报的自动化改版：每期只换**演员照片、姓名、日期、主持人标签、第五格（真人 / 神秘嘉宾剪影）**，其余版式一个像素不动。

管线分四层（L1 模板常量 → L2 素材闸门 → L3 摆放 → L4 验收），所有算术在 Python 侧，生成的 JSX 只做测量和赋值。完整说明见 **[skills/update-killer90mins-poster/SKILL.md](skills/update-killer90mins-poster/SKILL.md)**。

---

## ⚠️ 本仓库只有代码，clone 下来跑不动

母版 `.ai`、产出图、演员照片、商业字体**都不在仓库里**，需要在本地补齐。

排除的原因分三类，都不是懒：

- **超限** —— `killer90mins_v3.ai` 单文件 158MB，超过 GitHub 100MB 单文件硬限，普通 push 会被直接拒绝
- **肖像** —— 演员照片是真人肖像，不放进公开仓库
- **授权** —— 字体是商业授权，不再分发

---

## 补齐清单

下表列出的路径**必须原样放置**，因为它们被 `config/slots.json` 和各期 brief 按相对路径引用。

### 1. 母版与参照稿（必须）

| 放到这个路径 | 用途 | 缺了会怎样 |
|---|---|---|
| `killer90mins_20260819/killer90mins_v3_12mm.ai` | **母版**。`config/slots.json` 的 `_source` 指向它，stage1 从它另存副本 | stage1 无法开始 |
| `killer90mins_20260819/killer90mins_v3.ai` | 设计师认可稿。L4 验收脚本自身的基准 | 无法自检容差，验收结论不可信 |
| `killer90mins_20260829/killer90mins_0829.ai` | 第二份认可稿，观感基准 | 逐格 R0 的来源之一无从复核 |

> **母版与两份认可稿一律只读。** 任何操作先 `saveAs` 副本。详见 [CLAUDE.md](CLAUDE.md) 的硬纪律。

### 2. 字体（必须，两个）

管线按**字体名**引用，不是按文件名 —— 装好后名字对不上就会静默回退，出图字形全错。

| 代码里的字体名 | 实际文件 | 从哪来 |
|---|---|---|
| `LaMachineCompany` | `La Machine Company.ttf` | 仓库外的 `killer90mins_20260819/Fonts/` 目录（随母版一起交付） |
| `Huiwen-MinchoGBK-Regular` | **`匯文明朝體GBK.ttf`** | 不在 `Fonts/` 里，需单独安装到 `~/Library/Fonts/` |

`Fonts/` 目录里另有 `Anton-Regular.ttf`、`AlibabaPuHuiTi-3-105-Heavy.ttf`、`GenEiKiwamiGo.ttf` —— 这三个是母版设计所用，**脚本不引用**，不装也能跑通管线（但打开母版时 Illustrator 会报缺字体）。

### 3. 演员照片（每期变化）

放哪都行，只要 brief 里的 `photo` 字段写的是**相对仓库根目录**的路径。2026-08-29 那期用的是：

```
0829 Killer/1.CASPER.png
0829 Killer/2.Caleb.png
0829 Killer/3.Ayin.png
0829 Killer/4.凌浩.png
```

照片必须带 alpha 通道、dpi ≥ 250、头顶不能裁切 —— 不合格由 L2 闸门 (`tools/measure_actor.py`) 直接拒收，不要等到出图才发现。

`actors/*.json`（已入库）是这些照片的**测量缓存**，含 `headTopRatio` 等比例值。照片本身没了但 json 还在，摆放算得出来，只是 Illustrator 会找不到链接图。

### 4. 运行环境

- macOS + Adobe Illustrator（通过 ExtendScript 驱动）
- Python 3 + **Pillow**、**NumPy 2.x**

```bash
pip3 install Pillow 'numpy>=2'
```

> NumPy 2.x 下用 `np.ptp(x)`，不是 `x.ptp()`。

---

## 补齐后自检

```bash
python3 - <<'PY'
import json, pathlib, shutil, subprocess
root = pathlib.Path('.')
need = [root / json.loads((root/'config/slots.json').read_text())['_source'],
        root / 'killer90mins_20260819/killer90mins_v3.ai',
        root / 'killer90mins_20260829/killer90mins_0829.ai']
for p in need:
    print(('  OK  ' if p.exists() else 'MISSING'), p)

if shutil.which('fc-list'):
    # fc-list 把家族名里的连字符转义成 \-，先去掉反斜杠再匹配
    out = subprocess.run(['fc-list'], capture_output=True, text=True).stdout
    fonts = out.replace(chr(92), '')
    for name in ('La Machine Company', 'Huiwen-MinchoGBK'):
        print(('  OK  ' if name in fonts else 'MISSING'), '字体:', name)
else:
    print('  跳过  字体检查（无 fc-list；可 brew install fontconfig，'
          '或直接在 Illustrator 字体菜单里确认这两个名字存在）')
PY
```

全部 OK 后，照 SKILL.md 的流程跑一期。

---

## 已知限制

除 SKILL.md 里列的之外，补一条基础设施层面的：

- **产出目录写死在 `killer90mins_20260829/`**（`tools/build_poster.py` 里的 `outdir`），与 brief 的日期无关。出新一期时产物会落进这个 8/29 的目录，文件名靠 `killer90mins_auto_<date>` 区分，不会互相覆盖，但目录名会越来越名不副实。

---

## 目录导航

| 要做的事 | 去哪 |
|---|---|
| 出一期新海报 | skill `update-killer90mins-poster` |
| 理解为什么这么做 | [docs/specs/2026-08-23-killer90mins-poster-automation-design.md](docs/specs/2026-08-23-killer90mins-poster-automation-design.md) |
| 查模板常量 / 规则定义 | [skills/update-killer90mins-poster/references/](skills/update-killer90mins-poster/references/) |
| 看哪些做法已被证伪 | [references/history-to-rules.md](skills/update-killer90mins-poster/references/history-to-rules.md) |

`.archive/failed-iterations-20260822/` 是 v1→v10 收敛失败的历史存档，**只作记录，不要参考、不要接着改**。
