add at the beginning of each script the groq api key

node paralell.js

-> you get many json failed errors even if strict is enabled

node sequential.js

-> you get one or two json failed errors even if strict is enabled

req_01kjm4f7rffhdvaqqgez14s1k5

{
"request_id": "req_01kjm4f7rffhdvaqqgez14s1k5",
"created_at": "2026-03-01T07:23:12.015Z",
"error": {
"message": "Generated JSON does not match the expected schema. Please adjust your prompt. See 'failed_generation' for more details. Error: jsonschema: '' does not validate with /additionalProperties: additionalProperties 'additionalProperties', 'properties', 'required', 'type', '$schema' not allowed",
"type": "invalid_request_error",
"param": "",
"code": "json_validate_failed"
}
}

if i run node paralell-with-retry.js or node sequential-with-retry.js all tests pass
