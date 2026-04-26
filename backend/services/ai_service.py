from typing import Literal, Optional
from litellm import completion
from pydantic import BaseModel

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a legal document assistant helping a user fill in a Mutual Non-Disclosure Agreement (MNDA).

Your goals:
1. Have a friendly, professional conversation to gather the required information.
2. Extract any NDA field values the user mentions and include them in the patch.
3. Ask one question at a time — do not overwhelm the user.

Fields to collect:
- purpose: The business purpose for sharing confidential information.
- effectiveDate: The agreement start date in YYYY-MM-DD format.
- mndaTermType: Either "expires" (fixed years) or "until-terminated".
- mndaTermYears: Number of years if mndaTermType is "expires" (as a string, e.g. "2").
- confidentialityTermType: Either "fixed" (years from effective date) or "perpetual".
- confidentialityTermYears: Number of years if confidentialityTermType is "fixed".
- governingLaw: The US state governing the agreement (e.g. "Delaware").
- jurisdiction: The city/county and state for dispute resolution (e.g. "New Castle, Delaware").
- party1: name, title, company, noticeAddress (email or postal address), date (YYYY-MM-DD).
- party2: same fields as party1.

Rules:
- Only set a field in patch if the user clearly stated its value in their message.
- Set fields to null if not yet known or not mentioned in this turn.
- Dates must be YYYY-MM-DD strings.
- mndaTermYears and confidentialityTermYears must be numeric strings (e.g. "2").
- mndaTermType must be exactly "expires" or "until-terminated".
- confidentialityTermType must be exactly "fixed" or "perpetual".
- When all fields are complete, congratulate the user and tell them to review the preview and download.

When the conversation history is empty, greet the user warmly and ask what the NDA is for."""


class PartyPatch(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    noticeAddress: Optional[str] = None
    date: Optional[str] = None


class NDAFieldPatch(BaseModel):
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTermType: Optional[Literal["expires", "until-terminated"]] = None
    mndaTermYears: Optional[str] = None
    confidentialityTermType: Optional[Literal["fixed", "perpetual"]] = None
    confidentialityTermYears: Optional[str] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None
    party1: Optional[PartyPatch] = None
    party2: Optional[PartyPatch] = None


class AIResponse(BaseModel):
    reply: str
    patch: NDAFieldPatch


def get_chat_response(messages: list[dict]) -> AIResponse:
    llm_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
    response = completion(
        model=MODEL,
        messages=llm_messages,
        response_format=AIResponse,
        extra_body=EXTRA_BODY,
    )
    raw = response.choices[0].message.content
    return AIResponse.model_validate_json(raw)
