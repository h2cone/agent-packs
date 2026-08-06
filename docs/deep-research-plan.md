# Deep Research 实现计划（pi extension）

在 **pi coding-agent** 上以 extension 实现 `/deep-research <query>`：保留 Grok Build 文档中的 **四阶段核心流水线与数据契约**，但不引入 Rhai、workflow 引擎、子 Agent 进程、agent budget、`/workflows` 看板等 Grok 运行时组件。严格按 pi 的极简扩展模型落地。

**参考**

| 来源 | 用途 |
|------|------|
| `C:\Users\tw8ap\projc\grok-build\docs\deep-research-how-it-works.md` | 流水线语义、schema、fail-closed、报告结构 |
| `C:\Users\tw8ap\projc\grok-build\crates\codegen\xai-grok-shell\src\session\workflows\deep_research.rhai` | 字段级校验与拼装细节 |
| `pi-mono/packages/coding-agent/docs/extensions.md` | extension API |
| `examples/extensions/summarize.ts` / `handoff.ts` | `registerCommand` + `modelRegistry.complete` 模式 |
| `examples/extensions/plan-mode/` | 只读约束与状态展示的极简参考 |

**落点仓库**：本仓库 `agent-packs` 的 `pi-extensions/deep-research/`（当前为空目录，待实现）。

---

## 1. 目标与非目标

### 1.1 目标

- 用户输入 `/deep-research <query>` 后，**extension 主机端**串行跑完：
  1. **Plan** — 拆成 ≤ breadth 个独立问题（默认 4，范围 2–6）
  2. **Research** — 每题产出结构化 claims + uncertainties
  3. **Verify** — fail-closed 独立复核
  4. **Report** — 合成正文、校验 `[Sn]`、拼 Sources / Coverage，写出完整报告
- 与 Grok 文档一致的 **status 语义**（`Verified` / `Partial`）与 **claim 字段契约**。
- 单文件级可理解：无脚本引擎、无子进程 agent、无并行 fan-out 基础设施。
- 使用 **当前会话 model**（`ctx.model` + `ctx.modelRegistry`），与 `handoff` / `summarize` 一致。

### 1.2 非目标（刻意不做）

| Grok 能力 | 本实现 |
|-----------|--------|
| Rhai workflow / `phase()` / `complete()` | 普通 TypeScript 函数流水线 |
| `agent()` / `parallel()` 子 Agent | **不** spawn pi 子进程；不依赖 subagent 示例 |
| `agent_budget`、display-name `deep-research-N` | 无预算系统；一次 slash = 一次前台 run |
| `/workflows` pause/resume/stop | 仅 AbortSignal（loader 取消） |
| Background 与主对话解耦 | **前台阻塞式** run（UI loader），结束后写文件 + 通知 |
| capability_mode / 独立 sandbox | 不做权限子系统；Research/Verify 仅通过 **extension 自带只读工具** 取证 |
| 全局候选 cap 以外的复杂编排 UI | 固定常量 + 日志/状态行 |

### 1.3 一句话架构

**`/deep-research` = pi `registerCommand` → TypeScript 主机编排 → 多次 `modelRegistry.complete`（必要时带极小 tool 环）→ 主机端 schema 校验与 fail-closed → 写 `report.md`。**

---

## 2. 与 Grok 流水线的映射

```text
Grok (Rhai + sub-agents)          pi extension (本计划)
─────────────────────────         ─────────────────────────
Host slash DeepResearch     →     pi.registerCommand("deep-research")
args.query / breadth        →     解析 command args
agent(planner, schema)      →     complete + 解析 JSON plan
parallel(researchers)       →     for 顺序 complete（可选 Promise.all 二期）
host claim 清洗 / cap=24    →     同逻辑 TypeScript
parallel(verifiers) 分片    →     顺序 complete，round-robin 分片
agent(synthesizer)          →     complete 取 <report-body>
write_scratch_file          →     写 session 旁或 cwd 下报告路径
system-reminder 回主对话    →     notify + 可选 custom message / 打印路径
```

**保留的核心语义（不可稀释）**

1. 研究与校验分离；verifier 不得“修好” claim，只能 supported true/false。
2. 缺字段 / shard 无效 / 无独立证据 → 排除（fail-closed）。
3. 候选 claim 全局 cap=24；每题 claims≤6、uncertainties≤6。
4. status 在 Verify 结束时由 `partial` 标志定案；Report 合成失败 **不** 把 Verified 改成 Partial，只回退 bullet 列表并记 Coverage。
5. 合成正文必须引用每个 `[Sn]` 至少一次、无非法编号、无 Sources/References 节。

---

## 3. 极简文件布局

```text
pi-extensions/deep-research/
  index.ts          # 唯一入口：export default + registerCommand
  pipeline.ts       # runDeepResearch()：四阶段 + 状态机
  types.ts          # Claim / Verdict / RunState 类型
  parse.ts          # 从模型输出抽 JSON / report-body
  validate.ts       # fail-closed 字段与 shard 校验
  prompts.ts        # 各阶段 prompt 模板（字符串常量）
  report.ts         # Sources 合并、Coverage、写文件
  README.md         # 安装与用法（实现时写）
```

原则：

- 无 `package.json`（零 npm 依赖；只用 pi 已提供的 `@earendil-works/pi-coding-agent` / `pi-ai` / `pi-tui`）。
- 不拆 “agent 人格 md 文件”；prompt 全在 `prompts.ts`。
- 单命令、无额外 slash（不做 `/deep-research-stop` 等；取消靠 loader abort）。

安装（实现后）：

```text
# 全局
ln -s /path/to/agent-packs/pi-extensions/deep-research ~/.pi/agent/extensions/deep-research
# 或 settings.json "extensions": [".../pi-extensions/deep-research"]
```

---

## 4. 命令与运行时行为

### 4.1 注册

```ts
// index.ts 示意
pi.registerCommand("deep-research", {
  description: "Bounded research: plan → claims → verify → cited report",
  handler: async (args, ctx) => { ... },
});
```

### 4.2 参数

| 输入 | 规则 |
|------|------|
| `args` trim 后非空 | 作为 `query` |
| 空 | `notify` 用法：`/deep-research <query>`，return |
| 可选：`--breadth=N` 前缀/后缀 | N∈[2,6]；解析失败则默认 4。**一期可只支持纯 query**，breadth 固定 4，二期再加 |

### 4.3 前置检查

1. `ctx.model` 存在，否则 error notify。
2. `ctx.modelRegistry.hasConfiguredAuth(ctx.model)`，否则提示配置认证。
3. 若 `!ctx.isIdle()`：`await ctx.waitForIdle()` 或直接拒绝（推荐 **waitForIdle**，与用户连续操作兼容）。
4. TUI：用 `ctx.ui.custom` + `BorderedLoader`（对齐 `handoff.ts`）显示 phase；非 TUI：`notify` 进度 + 仍跑完流水线。

### 4.4 进度文案（status 行 / loader 标题）

- `Plan…`
- `Research 1/k…`
- `Verify 1/n…`
- `Report…`
- 结束：`Done (Verified|Partial)`

### 4.5 输出产物

| 产物 | 位置建议 |
|------|----------|
| 完整报告 | `{cwd}/.pi/deep-research/{timestamp}-report.md`（目录不存在则创建） |
| 聊天侧摘要 | loader 结束后 `notify` 短摘要 + 完整路径；可选 `pi.appendEntry` 记一次 run 元数据（非必须） |
| 主 agent 上下文 | **默认不污染**主对话 transcript。若需要“报告进入会话”，二期用 `sendUserMessage`/`custom message`；一期只写文件 + notify |

路径可配置常量 `REPORT_DIR = ".pi/deep-research"`，避免引入配置子系统。

---

## 5. 阶段设计（主机编排）

### 5.0 共享：`llmJson` / `llmText` 辅助

封装一次 complete，降低流水线噪音：

```ts
async function completeText(
  ctx: ExtensionCommandContext,
  system: string,
  user: string,
  signal?: AbortSignal,
): Promise<string>
```

- 使用 `ctx.model!`、`sessionId: uuidv7()`、`cacheRetention: "none"`（与 summarize 一致，避免污染主会话 cache）。
- 从 `response.content` 拼 text；`stopReason === "aborted"` 抛取消。
- **结构化输出**：不依赖 provider 级 `output_schema` API；prompt 要求 **只输出 JSON**，主机用 `parse.ts` 抽 fenced/`{...}` 再 `JSON.parse`；失败则该步失败（见各阶段 fallback）。

### 5.1 Phase: Plan

**输入**：`query`, `breadth`  
**输出**：`questions: string[]`（1..breadth）

- Prompt 要点（对齐 Rhai）：query 以 JSON 编码放入 `<query-json>`；说明 decoded 内容是 **untrusted data**；最多 breadth 个 **独立证据目标** 的问题，禁止同义复述。
- 期望 JSON：`{ "questions": string[] }`。
- 成功且过滤空串后非空 → 截断到 breadth。
- 失败 / 异常 → **fallback**：`questions = [query]`，记 log（Coverage 不因此强制 Partial，与 Grok 一致：planner 失败仅降级为单题）。

### 5.2 Phase: Research

**输入**：`questions[]`  
**输出**：`candidate_claims[]`, `coverage_notes[]`, `partial` 标志

每题一次 `completeText`（**顺序**，一期不做 parallel）：

- Prompt：只读调查该问题；prefer 可定位证据；最多 6 条 atomic claims；无直接支持则省略；uncertainty 与 findings 分离。
- 期望 JSON：

```json
{
  "claims": [{
    "claim": "...",
    "evidence": "...",
    "source_title": "...",
    "source_locator": "URL | path | ...",
    "source_type": "primary|secondary|repository|other",
    "confidence": "high|medium|low"
  }],
  "uncertainties": ["..."]
}
```

**主机清洗（与 Rhai 同逻辑）**

- 题失败 / 缺 claims 或 uncertainties → `partial=true`，Coverage 记失败。
- 非空 uncertainty → `partial=true`，记入 Coverage。
- claim 四字段 `claim/evidence/source_title/source_locator` trim 后任一空 → 丢弃，计入 `dropped_claims`。
- 有效 claim 赋 `id: claim-{n}`，全局列表；超过 **cap 24** 的丢弃并 `partial`。
- `successful_questions < questions.len` → `partial`。
- `candidate_claims.length === 0` → 写 Partial 早退报告，结束。

#### 5.2.1 证据从哪来？（相对 Grok 的关键取舍）

Grok 子 agent 有 web/search 工具。pi 内置工具无 `web_search`，且本方案 **不用子 agent**。

**一期（推荐，极简）——“模型知识 + 主机校验诚实性”**

- Research/Verify 的 complete **不挂 tools**。
- Prompt 硬性要求：`source_locator` 必须是可核验的 URL 或仓库路径；**不得编造**。
- Verify 阶段用独立 complete 对抗复核；无法打开源时 `supported=false`。
- 局限：模型可能 hallucinate URL；fail-closed 与 Partial 会暴露覆盖缺口。对编码仓内问题可辅以 **二期工具环**。

**二期（可选增强，仍非 sub-agent）——extension 内极小 tool 环**

仅 Research + Verify 使用，主机实现：

| 工具名 | 行为 |
|--------|------|
| `fetch_url` | `fetch` GET，截断 body（如 50KB），只读 |
| `read_path` | 相对 `ctx.cwd` 读文件，路径穿越拒绝 |

自写最多 N 轮（如 6）的 tool-call 循环：`complete` with `tools` → 执行 → 追加 toolResult → 再 complete，直到无 tool call 或达上限。  
这是 **同进程主机循环**，不是 spawn `pi` 子进程，符合“无子 Agents”。

**一期实现计划默认：无 tool 环**；`README` 与本计划注明二期入口，避免首版膨胀。

### 5.3 Phase: Verify（fail-closed）

**输入**：`candidate_claims`  
**输出**：`verified_claims[]`, 更新 `partial` / `coverage_notes`

- `verifier_count = min(2, claims.length)`。
- Round-robin 分片到 `verifier_count` 个 shard。
- 每 shard 一次 complete：prompt 要求 **恰好每个 claim_id 一条 verdict**，禁止包外 ID；`supported=true` 时必须非空 `evidence` / `source_title` / `source_locator`（独立复核，不照抄）。

期望 JSON：

```json
{
  "verdicts": [{
    "claim_id": "claim-0",
    "supported": true,
    "reason": "...",
    "evidence": "...",
    "source_title": "...",
    "source_locator": "..."
  }]
}
```

**Shard 合法性（主机）**

- 失败 / 无 verdicts / 长度 ≠ expected / 任一 id 非恰好一次 → **整 shard 无效**，该 shard 全部 claim 排除，`partial=true`。

**单 claim 接受条件**

- 所在 shard 有效，且对应 verdict：`supported === true` 且三项证据字段非空。
- 否则排除并记 reason。

若 `verified_claims` 空 → Partial 早退报告。

### 5.4 Phase: Report

**输入**：`verified_claims`, `partial`, `coverage_notes`, `query`  
**输出**：`report.md` + 摘要文本

1. 编号 `S1..Sn`；构造 `citation_packet`。
2. 确定性 fallback body：`## Findings` + bullet + `[Sn]`。
3. 一次 synthesis complete：要求 `<report-body>...</report-body>` 纯 markdown（对齐 Rhai 合成约束：直接答问、主题小节、cite `[Sn]`、禁止 Sources 节等）。
4. **引用校验**（主机）：
   - 每个 `1..n` 的 `[Sk]` 至少出现一次；
   - 解析所有 `[Sdigits]`，编号必须 ∈[1,n]；
   - 不得含 `## Sources` / `## References`；
   - 失败 → 用 fallback，Coverage 记一条（**不改** status）。
5. 拼完整报告：

```markdown
# Research result

**Status: Verified|Partial**

{body}

## Sources
- [S1] [S2] "title" — locator (independently checked against ... 可选)

## Coverage and uncertainty
- ...
```

6. Sources 合并：相同 original+verifier title/locator 元组合并 citation 列表（对齐 Rhai）。
7. `status = partial ? "partial" : "verified"`；**仅当**无丢弃、无 uncertainty、全部题成功、全部候选 claim 通过时为 Verified（与 Grok 表一致）。

### 5.5 取消与错误

- Loader `AbortSignal` 传到所有 complete；取消时 notify，不写半成品或写 `*-aborted.md`（一期：**不写**，仅 notify）。
- 未捕获异常：notify error 信息，不崩溃 pi。

---

## 6. 数据契约（TypeScript 侧）

```ts
type SourceType = "primary" | "secondary" | "repository" | "other";
type Confidence = "high" | "medium" | "low";
type RunStatus = "verified" | "partial";

interface CandidateClaim {
  id: string;                 // claim-0..
  questionIndex: number;
  claim: string;
  evidence: string;
  sourceTitle: string;
  sourceLocator: string;
  sourceType: SourceType;
  confidence: Confidence;
}

interface VerifiedClaim {
  id: string;
  claim: string;
  originalEvidence: string;
  originalSourceTitle: string;
  originalSourceLocator: string;
  verifierEvidence: string;
  verifierSourceTitle: string;
  verifierSourceLocator: string;
  verifierNote: string;
}

interface RunResult {
  status: RunStatus;
  reportPath: string;
  chatSummary: string;        // 可展示的短 body（含 Partial 头）
  verifiedClaimIds: string[];
}
```

常量：

```ts
const DEFAULT_BREADTH = 4;
const MIN_BREADTH = 2;
const MAX_BREADTH = 6;
const MAX_CLAIMS_PER_QUESTION = 6;
const MAX_UNCERTAINTIES_PER_QUESTION = 6;
const CANDIDATE_CAP = 24;
const MAX_VERIFIERS = 2;
```

---

## 7. 与 pi 极简主义的对照检查

| 原则 | 做法 |
|------|------|
| Extension 即模块 | 一个目录 + default export |
| 命令即入口 | 仅 `/deep-research` |
| 复用会话 model | 不另造 provider/config |
| 主机做可靠部分 | schema、分片校验、引用校验、Sources 拼装全在 TS |
| LLM 做不可靠部分 | 拆题、抽 claim、复核判断、文笔合成 |
| 不引入编排平台 | 无 Rhai、无 workflow registry、无 budget |
| 不引入子 agent | 无 `pi` subprocess、无 agents/*.md |
| 可读失败 | Partial + Coverage 列表，不静默编造 |

---

## 8. 实现步骤（建议 commit 切片）

### Step 0 — 文档（本文件）

- [x] `docs/deep-research-plan.md`（当前）

### Step 1 — 骨架

- [ ] `pi-extensions/deep-research/index.ts`：注册命令、参数校验、model/auth 检查、loader 壳
- [ ] `types.ts` + 常量
- [ ] `README.md`：安装、用法、限制（无 web 工具 / 前台阻塞）

### Step 2 — 解析与校验纯函数

- [ ] `parse.ts`：`extractJson`、`extractReportBody`
- [ ] `validate.ts`：claim 字段、verdict shard、citation 校验
- [ ] 手工用例：用固定 JSON 字符串测边界（可无测试框架，在 README 列 checklist）

### Step 3 — Plan + Research + 早退

- [ ] `prompts.ts`：plan / research
- [ ] `pipeline.ts`：跑到 candidate_claims；零 claim 写 Partial 报告

### Step 4 — Verify

- [ ] prompts + 分片 + fail-closed 汇总
- [ ] 零 verified 早退

### Step 5 — Report

- [ ] synthesis + citation gate + Sources/Coverage + 写文件
- [ ] 结束 notify：status + path

### Step 6 — 打磨

- [ ] 取消路径、错误 notify
- [ ] 状态文案
- [ ] 与本计划差异的代码注释（仅非显然处）
- [ ] 可选：breadth CLI 解析
- [ ] 可选：tool 环（二期，单独 PR）

### Step 7 — 仓库文档挂钩

- [ ] 根 `README.md` 增加 **Pi Extensions** 小节与安装说明
- [ ] `AGENTS.md` 补充 `pi-extensions/` 约定（kebab 目录、`index.ts` 入口、无构建）

---

## 9. 手动验收清单

在已配置 model 的 pi 中：

1. `/deep-research`（无参数）→ 用法提示，不调用模型。
2. `/deep-research What is the default HTTP port for Redis?`  
   - 生成 `.pi/deep-research/*-report.md`  
   - 含 Status、Sources 或 Coverage  
   - 进程内无第二 `pi` 子进程（任务管理器 / 日志确认）
3. 取消 loader（Esc）→ 干净退出，主会话仍可用。
4. 刻意模糊 query（如 `asdf research nothing`）→ **Partial**，Coverage 有说明，不崩溃。
5. 合成若被破坏（可临时改 prompt 测）→ bullet fallback，status 仍由 Verify 决定。

---

## 10. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 无真实抓取导致假 URL | fail-closed Verify；README 诚实写限制；二期 `fetch_url` |
| 模型不按 JSON 输出 | 强约束 prompt + fenced 抽取；失败当步 fallback/partial |
| 顺序 Research 较慢 | 接受；二期可用 `Promise.all` 有界并发 complete（仍非 sub-agent） |
| 阻塞 TUI | BorderedLoader + abort；不进 background 队列 |
| 报告污染 git | 默认写入 `.pi/`（应在用户 `.gitignore`）；README 提示 |
| 与 subagent 示例混淆 | README 明确：本扩展 **不** 依赖 `examples/extensions/subagent` |

---

## 11. 决策摘要（实现时勿回摆）

1. **载体**：pi extension command，不是 skill、不是 Rhai、不是 grok workflow。
2. **编排**：单线程 TypeScript `pipeline.ts`。
3. **LLM**：仅 `ctx.modelRegistry.complete` + 当前 `ctx.model`。
4. **并行 / 子 agent / budget / 后台看板**：不做。
5. **契约**：claims / verify / status / citation 与 Grok 文档对齐。
6. **首版证据**：无 tool 环；主机校验 + Partial 暴露空洞。
7. **产物**：本地 markdown 报告 + notify；默认不改主对话 history。

---

## 12. 完成定义（Definition of Done）

- 用户安装 `pi-extensions/deep-research` 后可运行 `/deep-research <query>`。
- 四阶段行为与 status/Sources/Coverage 符合第 2、5 节。
- 无新增 npm 依赖、无 Rhai、无子进程 agent。
- `README.md` 写清安装、限制与验收步骤。
- 本计划中的 Step 1–5 代码已落地；Step 6–7 可同 PR 或紧随。
