import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY")
)

MODEL = os.getenv("NVIDIA_MODEL", "deepseek-ai/deepseek-v4-pro-0813")

def clean_json_array(raw: str):
    cleaned = re.sub(r"```json|```", "", raw, flags=re.IGNORECASE).strip()
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start != -1 and end != -1:
        cleaned = cleaned[start:end+1]
    return cleaned

def generate_schema(extracted_text: str) -> dict:
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": extracted_text}],
            temperature=0.2,
            max_tokens=4096,
            stream=False
        )
        raw = completion.choices[0].message.content
        cleaned = clean_json_array(raw)
        parsed = json.loads(cleaned)

        if not isinstance(parsed, list):
            return {"error": "NVIDIA model did not return a JSON array", "raw": raw}

        return {"formSchema": parsed}

    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON from NVIDIA model: {e}", "raw": raw}
    except Exception as e:
        return {"error": f"NVIDIA API call failed: {e}", "raw": str(e)}
