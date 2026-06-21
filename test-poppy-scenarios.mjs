import assert from "node:assert/strict";

import { answerWithPoppy, apiUnavailableAnswer } from "./poppy-core.cjs";

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
  };
}

async function scenario(name, run) {
  await run();
  console.log(`ok - ${name}`);
}

async function withoutWarnings(run) {
  const warn = console.warn;
  console.warn = () => {};
  try {
    return await run();
  } finally {
    console.warn = warn;
  }
}

await scenario("formats assistant history as output_text", async () => {
  let payload = null;
  const result = await answerWithPoppy(
    [
      { role: "user", content: "Dimetric 설명해줘" },
      { role: "assistant", content: "Dimetric은 Text to CAD 프로젝트입니다." },
      { role: "user", content: "검증 구조도 설명해줘" },
    ],
    "test-key",
    "test-model",
    {
      fetch: async (_url, options) => {
        payload = JSON.parse(options.body);
        return jsonResponse(200, { output_text: "정상 답변" });
      },
      sleep: async () => {},
    },
  );

  assert.equal(result.mode, "api");
  assert.equal(payload.input[1].role, "assistant");
  assert.equal(payload.input[1].content[0].type, "output_text");
  assert.equal(payload.input[2].content[0].type, "input_text");
});

await scenario("retries retryable OpenAI failures once", async () => {
  let calls = 0;
  const result = await withoutWarnings(() =>
    answerWithPoppy([{ role: "user", content: "연락처 알려줘" }], "test-key", "test-model", {
      fetch: async () => {
        calls += 1;
        if (calls === 1) return jsonResponse(500, { error: { message: "temporary" } });
        return jsonResponse(200, { output_text: "이메일 once0811@gmail.com, 전화번호 010-2671-6967입니다." });
      },
      sleep: async () => {},
    }),
  );

  assert.equal(calls, 2);
  assert.equal(result.mode, "api");
  assert.match(result.answer, /once0811@gmail\.com/);
});

await scenario("does not retry non-retryable OpenAI failures", async () => {
  let calls = 0;
  const result = await withoutWarnings(() =>
    answerWithPoppy([{ role: "user", content: "테스트" }], "test-key", "test-model", {
      fetch: async () => {
        calls += 1;
        return jsonResponse(400, { error: { message: "bad request" } });
      },
      sleep: async () => {},
    }),
  );

  assert.equal(calls, 1);
  assert.equal(result.mode, "api_unavailable");
});

await scenario("drops empty and api-unavailable history before sending", async () => {
  let payload = null;
  await answerWithPoppy(
    [
      { role: "assistant", content: apiUnavailableAnswer },
      { role: "user", content: "   " },
      { role: "user", content: "인터엑스 적합성 알려줘" },
    ],
    "test-key",
    "test-model",
    {
      fetch: async (_url, options) => {
        payload = JSON.parse(options.body);
        return jsonResponse(200, { output_text: "정상 답변" });
      },
      sleep: async () => {},
    },
  );

  assert.deepEqual(
    payload.input.map((message) => message.content[0].text),
    ["인터엑스 적합성 알려줘"],
  );
});

await scenario("keeps useful answer when only part of a question is unknown", async () => {
  let payload = null;
  await answerWithPoppy([{ role: "user", content: "나이랑 Dimetric 검증 구조를 같이 알려줘" }], "test-key", "test-model", {
    fetch: async (_url, options) => {
      payload = JSON.parse(options.body);
      return jsonResponse(200, { output_text: "공개 자료에는 나이는 없고, Dimetric 검증 구조는..." });
    },
    sleep: async () => {},
  });

  assert.match(payload.instructions, /답변 가능\/불명확\/면접 질문 권장/);
  assert.match(payload.instructions, /요청한 항목이 여러 개면/);
});
