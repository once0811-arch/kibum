import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = new URL(".", import.meta.url);
const read = (fileName) => readFileSync(new URL(fileName, root), "utf8");
const server = read("server.mjs");
const core = read("poppy-core.cjs");
const api = read("api/chat.js");
const app = read("app.js");

assert.match(core, /Poppy/);
assert.match(core, /채용담당자_QA_지식베이스\.md/);
assert.match(core, /once0811@gmail\.com/);
assert.match(core, /010-2671-6967/);
assert.match(core, /관련 근거가 하나라도 있으면 먼저 답/);
assert.match(core, /팀 대표/);
assert.doesNotMatch(server, /function offlineAnswer/);
assert.doesNotMatch(server, /\/.*\.test\(q\)/);
assert.match(api, /answerWithPoppy/);
assert.doesNotMatch(api, /function offlineAnswer/);
assert.doesNotMatch(api, /\/.*\.test\(q\)/);
const html = read("index.html");
assert.match(html, /Poppy/);
assert.match(html, /once0811@gmail\.com/);
assert.match(html, /010-2671-6967/);
assert.match(app, /Poppy/);
assert.doesNotMatch(app, /function localFallback/);
assert.doesNotMatch(app, /\/.*\.test\(q\)/);
assert.ok(existsSync(new URL("채용담당자_QA_지식베이스.md", root)));

const qa = read("채용담당자_QA_지식베이스.md");
assert.match(qa, /데블록에서 정확히 본인이 책임진 범위/);
assert.match(qa, /관련 근거가 하나라도 있으면 최대한 답/);
assert.match(qa, /면접에서 기범님께 직접 질문/);
