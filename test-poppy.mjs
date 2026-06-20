import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = new URL(".", import.meta.url);
const read = (fileName) => readFileSync(new URL(fileName, root), "utf8");

assert.match(read("server.mjs"), /Poppy/);
assert.match(read("server.mjs"), /채용담당자_QA_지식베이스\.md/);
assert.match(read("index.html"), /Poppy/);
assert.match(read("app.js"), /Poppy/);
assert.ok(existsSync(new URL("채용담당자_QA_지식베이스.md", root)));

const qa = read("채용담당자_QA_지식베이스.md");
assert.match(qa, /데블록에서 정확히 본인이 책임진 범위/);
assert.match(qa, /면접에서 기범님께 직접 질문/);
