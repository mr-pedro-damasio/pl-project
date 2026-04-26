import json
from typing import Optional, Literal
from litellm import completion
from pydantic import BaseModel
from services.doc_registry import DocTypeSpec, get_doc_spec

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

_RULES = """
Rules:
- Only set a field in patch if the user clearly stated its value.
- Set unmentioned fields to null in the patch.
- Dates must be YYYY-MM-DD strings.
- Numeric year fields must be numeric strings (e.g. "2").
- Enum fields must use exactly one of the allowed values.
- For party fields, populate partyA and partyB sub-objects (name, title, company, noticeAddress, date).
- When all required fields are filled, congratulate the user and suggest reviewing the preview.
- When the conversation is empty, greet the user warmly and ask the first question.
"""

_SUPPLEMENT_INSTRUCTION = """
IMPORTANT: This is a supplement document that attaches to an existing agreement.
Ask for {hint} at the start of the conversation if the user has not already mentioned it.
"""


def _build_system_prompt(spec: DocTypeSpec) -> str:
    field_lines = "\n".join(f"- {f.label}: {f.ai_description}" for f in spec.fields)
    supplement = (
        _SUPPLEMENT_INSTRUCTION.format(hint=spec.supplement_hint)
        if spec.is_supplement
        else ""
    )
    return f"""{spec.system_prompt_preamble}
{supplement}
Fields to collect:
{field_lines}
{_RULES}"""


def _build_response_schema(spec: DocTypeSpec) -> dict:
    party_schema = {
        "type": "object",
        "properties": {
            "name": {"anyOf": [{"type": "string"}, {"type": "null"}]},
            "title": {"anyOf": [{"type": "string"}, {"type": "null"}]},
            "company": {"anyOf": [{"type": "string"}, {"type": "null"}]},
            "noticeAddress": {"anyOf": [{"type": "string"}, {"type": "null"}]},
            "date": {"anyOf": [{"type": "string"}, {"type": "null"}]},
        },
        "additionalProperties": False,
        "required": ["name", "title", "company", "noticeAddress", "date"],
    }

    # Collect unique field keys (exclude party sub-fields which go into partyA/partyB)
    patch_props: dict = {}
    for f in spec.fields:
        if f.key.startswith("partyA_") or f.key.startswith("partyB_"):
            continue
        if f.is_enum:
            patch_props[f.key] = {
                "anyOf": [
                    {"type": "string", "enum": f.enum_values},
                    {"type": "null"},
                ]
            }
        else:
            patch_props[f.key] = {"anyOf": [{"type": "string"}, {"type": "null"}]}

    if spec.has_signatures:
        patch_props["partyA"] = {"anyOf": [party_schema, {"type": "null"}]}
        patch_props["partyB"] = {"anyOf": [party_schema, {"type": "null"}]}

    return {
        "type": "json_schema",
        "json_schema": {
            "name": "AIResponse",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "reply": {"type": "string"},
                    "patch": {
                        "type": "object",
                        "properties": patch_props,
                        "additionalProperties": False,
                        "required": list(patch_props.keys()),
                    },
                },
                "required": ["reply", "patch"],
                "additionalProperties": False,
            },
        },
    }


def _strip_nulls(obj: dict) -> dict:
    """Recursively remove None/null values from a dict."""
    result = {}
    for k, v in obj.items():
        if v is None:
            continue
        if isinstance(v, dict):
            stripped = _strip_nulls(v)
            if stripped:
                result[k] = stripped
        else:
            result[k] = v
    return result


def _normalize_patch(raw_patch: dict, spec: DocTypeSpec) -> dict:
    """Convert flat partyA_* / partyB_* fields into nested partyA/partyB dicts."""
    patch = _strip_nulls(raw_patch)

    # Re-assemble party objects from flat keys (used by NDA)
    party_a: dict = {}
    party_b: dict = {}
    other: dict = {}

    for k, v in patch.items():
        if k.startswith("partyA_"):
            party_a[k[7:]] = v  # strip "partyA_"
        elif k.startswith("partyB_"):
            party_b[k[7:]] = v  # strip "partyB_"
        elif k == "partyA" and isinstance(v, dict):
            party_a.update(_strip_nulls(v))
        elif k == "partyB" and isinstance(v, dict):
            party_b.update(_strip_nulls(v))
        else:
            other[k] = v

    result: dict = {}
    if other:
        result["fields"] = other
    if party_a:
        result["partyA"] = party_a
    if party_b:
        result["partyB"] = party_b
    return result


def get_chat_response(doc_type_id: str, messages: list[dict]) -> dict:
    spec = get_doc_spec(doc_type_id)
    if spec is None:
        raise ValueError(f"Unknown doc type: {doc_type_id}")

    system_prompt = _build_system_prompt(spec)
    response_format = _build_response_schema(spec)

    llm_messages = [{"role": "system", "content": system_prompt}] + messages
    response = completion(
        model=MODEL,
        messages=llm_messages,
        response_format=response_format,
        extra_body=EXTRA_BODY,
    )
    raw = response.choices[0].message.content
    parsed = json.loads(raw)
    patch = _normalize_patch(parsed.get("patch", {}), spec)
    return {"reply": parsed["reply"], "patch": patch}
