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

CATEGORIES = [
    "Academic",
    "Certificates",
    "Student Services",
    "Hostel",
    "Admissions",
    "Examination",
    "Finance",
    "Administrative",
    "Other"
]

SYSTEM_PROMPT = """You are a college form classification assistant.

Classify the provided college form into exactly ONE category.

Allowed categories:
Academic
Certificates
Student Services
Hostel
Admissions
Examination
Finance
Administrative
Other

Analyze the form title, description, section headings, field labels, and overall purpose.

Return ONLY valid JSON.

Required format:
{
  "category": "Academic"
}

Do not return explanations.
Do not return markdown.
Do not create categories outside the allowed list."""

def clean_json_output(raw: str):
    cleaned = re.sub(r"```json|```", "", raw, flags=re.IGNORECASE).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1:
        cleaned = cleaned[start:end+1]
    return cleaned

def classify(title: str, description: str, schema: dict) -> dict:
    user_content = (
        f"FORM TITLE:\n{title}\n\n"
        f"FORM DESCRIPTION:\n{description}\n\n"
        f"FORM SCHEMA:\n{json.dumps(schema)}"
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
        parsed = json.loads(cleaned)

        cat = parsed.get("category")
        if cat in CATEGORIES:
            return {"category": cat}
        else:
            return {"category": "Other"}

    except Exception as e:
        print(f"Classification failed: {e}")
        return {"category": "Other"}
