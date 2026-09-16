import os
import json
from openai import OpenAI
from dotenv import load_dotenv
import re

load_dotenv()

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)

MODEL = os.getenv("NVIDIA_MODEL", "deepseek-ai/deepseek-v4-pro-0813")

SYSTEM_PROMPT = """You are a form schema AI reviewer.
Given a form title, description, and JSON schema, review the schema for semantic mismatches between field labels and types.
Look for opportunities to improve the UX.
Examples:
- "Date of Birth" typed as "text" -> suggest "date"
- "Gender" typed as "text" -> suggest "radio"
- "Nationality" typed as "text" -> suggest "autocomplete" or "dropdown"
- "Upload Aadhaar" typed as "text" -> suggest "file"

Return ONLY valid JSON in this exact format:
{
  "valid": false,
  "issues": [
    {
      "field": "Date of Birth",
      "currentType": "text",
      "suggestedType": "date",
      "confidence": 0.99,
      "reason": "This field represents a calendar date."
    }
  ]
}

If no issues are found, return:
{
  "valid": true,
  "issues": []
}

Do not return markdown, explanations, or any other text."""

def clean_json_output(raw: str):
    cleaned = re.sub(r"```json|```", "", raw, flags=re.IGNORECASE).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1:
        cleaned = cleaned[start:end+1]
    return cleaned

def review_schema(title: str, description: str, schema: list) -> dict:
    user_content = (
        f"FORM TITLE: {title}\n"
        f"FORM DESCRIPTION: {description}\n"
        f"SCHEMA:\n{json.dumps(schema)}\n"
    )

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            temperature=0.1,
            max_tokens=512,
            stream=False
        )
        raw = completion.choices[0].message.content
        cleaned = clean_json_output(raw)
        return json.loads(cleaned)

    except Exception as e:
        print(f"Schema review failed: {e}")
        return {"valid": True, "issues": []}
