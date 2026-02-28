// run-100-parallel.js
// Node 18+ recommended (has global fetch). If you're on Node <18, install node-fetch.

const URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = "";

if (!API_KEY) {
  console.error("Missing GROQ_API_KEY env var. Example: GROQ_API_KEY=... node run-100-parallel.js");
  process.exit(1);
}

const payload = {
  model: "openai/gpt-oss-20b",
  seed: 42,
  messages: [
    {
      role: "user",
      content:
        "### Role\nYou are an expert customs broker\n\n### Task\nIs the vat notice relevant to the item description?\n\n### Input\n\n**Item description:**\nOrganic Extra Virgin Cypriot Olive Oil – 0.5L\n\n**vat notice:**\nvat-on-education-and-vocational-training-notice-70130\n  \n\n### Output Format\n**return in json format with the following fields: **Return true if the vat notice is relevant to the item description, false otherwise.** , confidence score as a NUMBER between 0 and 100 and reason as a string**"
    }
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "value",
      strict: true,
      schema: {
        type: "object",
        properties: {
          value: { type: "boolean", description: "Whether the vat notice is relevant to the item description." },
          reason: {
            type: "string",
            nullable: true,
            description: "A very short description of the reason for your answer. It should be no more than 100 characters."
          },
          confidence: {
            anyOf: [{ type: "number", minimum: 0, maximum: 100 }, { type: "null" }],
            description: "The confidence score of the answer. It should be a number between 0 and 100."
          }
        },
        required: ["value", "reason", "confidence"],
        additionalProperties: false,
        $schema: "http://json-schema.org/draft-07/schema#"
      }
    }
  }
};

async function oneCall(i) {
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Request #${i} failed (${res.status}): ${text}`);
  }

  // Groq/OpenAI-style responses: parse JSON, then read message content
  const data = JSON.parse(text);

  // Usually the model output is in choices[0].message.content
  const content = data?.choices?.[0]?.message?.content;

  // content should be JSON (since response_format enforces it), but keep it safe:
  let parsed;
  try {
    parsed = typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    parsed = { raw: content };
  }

  return { i, result: parsed };
}

(async () => {
  const N = 100;

  const start = Date.now();
  const promises = Array.from({ length: N }, (_, i) => oneCall(i));

  // Fully parallel
  const results = await Promise.allSettled(promises);

  const ok = results.filter(r => r.status === "fulfilled").length;
  const fail = results.length - ok;

  console.log(`Done. ok=${ok} fail=${fail} elapsed_ms=${Date.now() - start}`);

  // Print successes
  for (const r of results) {
    if (r.status !== "fulfilled") {
      console.error("ERR", r.reason?.message || r.reason);
    }
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});