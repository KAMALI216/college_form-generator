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

SYSTEM_PROMPT = """You are a form-field autocomplete assistant.
Given a field label, a user query, and optionally a list of valid options, return the best matching valid options.
If options are provided, ONLY return options from the provided list. Do not invent options.
If no options are provided, generate the best logical completions for the field based on the query.

Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    {
      "value": "Computer Science and Engineering",
      "confidence": 0.99
    }
  ]
}

Return up to 5 suggestions.
Do not return markdown, explanations, or any other text."""

def clean_json_output(raw: str):
    cleaned = re.sub(r"```json|```", "", raw, flags=re.IGNORECASE).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1:
        cleaned = cleaned[start:end+1]
    return cleaned

def get_autocomplete(label: str, query: str, options: list) -> dict:
    options_str = json.dumps(options) if options else "[]"
    user_content = (
        f"FIELD LABEL: {label}\n"
        f"USER QUERY: {query}\n"
        f"AVAILABLE OPTIONS: {options_str}\n"
    )

    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            temperature=0.1,
            max_tokens=256,
            stream=False
        )
        raw = completion.choices[0].message.content
        cleaned = clean_json_output(raw)
        return json.loads(cleaned)

    except Exception as e:
        print(f"Autocomplete failed: {e}")
        return {"suggestions": []}
