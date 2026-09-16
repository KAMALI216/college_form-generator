from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import json
import re
import time
import gc
import io
import fitz  # PyMuPDF
import docx
import pytesseract
from PIL import Image

from fastapi.middleware.cors import CORSMiddleware

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# MODEL
# ============================================================

MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

print("=" * 70)
print("Loading Qwen model...")
print(f"Model: {MODEL_NAME}")

device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Device: {device}")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float32
)

model.eval()
model.to(device)

print("Model loaded successfully.")
print("=" * 70)


# ============================================================
# REQUEST MODEL
# ============================================================

class SchemaRequest(BaseModel):
    extractedText: str

class ProfileExtractionRequest(BaseModel):
    resumeText: str


# ============================================================
# SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are an expert document-to-digital-form conversion system.

Your task is to analyze OCR text extracted from a real printed form
and convert the form into a structured JSON representation.

The form may be complex and may contain:

- personal information
- contact information
- addresses
- academic information
- employment information
- parent/guardian information
- dates
- numbers
- email addresses
- phone numbers
- radio button choices
- checkboxes
- dropdown choices
- yes/no questions
- declarations
- signatures
- document checklists
- tables
- multiple sections
- repeated fields
- optional fields

Your job is to identify the actual fields that a user would need
to fill, select, check, or provide.

Do NOT simply convert every OCR line into a field.

You must understand the STRUCTURE of the form.
"""


# ============================================================
# JSON FORMAT
# ============================================================

JSON_FORMAT = """
Return ONLY a JSON object using exactly this structure:

{
  "title": "Form title",
  "description": "Short description",
  "fields": [
    {
      "label": "Field label",
      "name": "uniqueFieldName",
      "type": "text",
      "required": true
    }
  ]
}

Allowed field types:

text
textarea
number
date
email
tel
radio
checkbox
dropdown

For radio, checkbox and dropdown fields:

{
  "label": "Gender",
  "name": "gender",
  "type": "radio",
  "required": true,
  "options": [
    "Male",
    "Female",
    "Other"
  ]
}

For normal fields DO NOT include options.

For checkbox groups:

{
  "label": "Documents Submitted",
  "name": "documentsSubmitted",
  "type": "checkbox",
  "required": false,
  "options": [
    "Aadhaar Card",
    "Mark Sheet",
    "Transfer Certificate"
  ]
}
"""


# ============================================================
# EXTRACTION RULES
# ============================================================

EXTRACTION_RULES = """
IMPORTANT EXTRACTION RULES:

1. Identify the actual fields that require user interaction.

2. Ignore:
   - form titles
   - page numbers
   - section headings
   - instructions
   - paragraphs
   - notes
   - decorative text
   - university names
   - department names
   - addresses printed by the institution
   - explanatory statements

3. DO NOT invent fields that are not supported by the OCR text.

4. Preserve the original meaning of field labels.

5. Clean obvious OCR noise when the intended label is clear.

6. If several fields appear on one OCR line, separate them into
   separate fields.

Example:

"Name: ______ Date of Birth: ______ Gender: ______"

must become three fields:

Name
Date of Birth
Gender

7. Detect field types intelligently.

Examples:

"Name" -> text

"Full Name" -> text

"Date of Birth" -> date

"DOB" -> date

"Email Address" -> email

"Email ID" -> email

"Mobile Number" -> tel

"Phone Number" -> tel

"Age" -> number

"PIN Code" -> number

"Gender" -> radio

"Category" -> radio or dropdown if choices are present

"Address" -> textarea

"Permanent Address" -> textarea

"Comments" -> textarea

"Remarks" -> textarea

8. If explicit choices appear near a field, preserve them.

Example:

Gender:
Male
Female
Other

becomes:

{
  "label": "Gender",
  "name": "gender",
  "type": "radio",
  "required": true,
  "options": ["Male", "Female", "Other"]
}

9. If the form clearly contains Yes/No choices, use radio.

Example:

"Hostel Required? Yes / No"

becomes:

{
  "label": "Hostel Required?",
  "name": "hostelRequired",
  "type": "radio",
  "required": true,
  "options": ["Yes", "No"]
}

10. Multiple selectable documents should use checkbox.

Example:

"Documents Attached:
Aadhaar
10th Mark Sheet
12th Mark Sheet
Transfer Certificate"

becomes one checkbox group if these are choices under
"Documents Attached".

11. Do not create fields from individual checkbox options.

12. Do not create a field for every sentence.

13. Do not create fields for printed institutional information.

14. If a section contains several genuine fields, extract ALL of them.

15. Do not stop after finding the first few fields.

16. Process the ENTIRE OCR input.

17. Keep fields in approximately the same order in which they
appear in the original form.

18. Each field must have a unique "name".

19. Names must be camelCase.

Examples:

Full Name -> fullName

Date of Birth -> dateOfBirth

Mobile Number -> mobileNumber

Parent Name -> parentName

Permanent Address -> permanentAddress

10th Percentage -> tenthPercentage

20. Required should normally be true when the form clearly
requires the information.

Use false when the OCR explicitly indicates:
- optional
- if applicable
- if any
- not mandatory

21. Do not add explanations outside the JSON.

22. Return VALID JSON ONLY.
"""


# ============================================================
# COMPLETE PROMPT
# ============================================================

PROMPT_TEMPLATE = f"""
{SYSTEM_PROMPT}

{JSON_FORMAT}

{EXTRACTION_RULES}

Now analyze the following OCR text.

IMPORTANT:
- The OCR may contain multiple pages.
- The OCR may contain noisy formatting.
- The OCR may contain multiple fields on the same line.
- The OCR may contain tables.
- Extract fields from the ENTIRE document.
- Do not stop early.
- Do not summarize the form.
- Do not omit fields simply because the form is long.

OCR TEXT:

{{ocr_text}}

Return ONLY the JSON object.
"""


# ============================================================
# CLEAN OCR
# ============================================================

def clean_ocr_text(text: str) -> str:

    if not text:
        return ""

    # Normalize line endings
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


# ============================================================
# EXTRACT JSON FROM MODEL OUTPUT
# ============================================================

def extract_json(text: str):

    text = text.strip()

    # Remove markdown fences
    text = re.sub(
        r"```json",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"```",
        "",
        text
    )

    text = text.strip()

    # First attempt
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find first JSON object
    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1 and end > start:

        candidate = text[start:end + 1]

        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    return None


# ============================================================
# VALIDATE SCHEMA
# ============================================================

ALLOWED_TYPES = {
    "text",
    "textarea",
    "number",
    "date",
    "email",
    "tel",
    "radio",
    "checkbox",
    "dropdown"
}


def validate_schema(schema):

    if not isinstance(schema, dict):
        return False, "Schema is not an object"

    if "fields" not in schema:
        return False, "Missing fields"

    if not isinstance(schema["fields"], list):
        return False, "fields is not an array"

    if len(schema["fields"]) == 0:
        return False, "No fields generated"

    for index, field in enumerate(schema["fields"]):

        if not isinstance(field, dict):
            return False, f"Field {index} is not an object"

        if "label" not in field:
            return False, f"Field {index} missing label"

        if "type" not in field:
            return False, f"Field {index} missing type"

        if field["type"] not in ALLOWED_TYPES:
            return False, (
                f"Invalid field type: {field['type']}"
            )

        if "name" not in field:
            return False, f"Field {index} missing name"

        if "required" not in field:
            return False, f"Field {index} missing required"

        if field["type"] in {
            "radio",
            "checkbox",
            "dropdown"
        }:

            if "options" not in field:
                return False, (
                    f"{field['label']} missing options"
                )

            if not isinstance(field["options"], list):
                return False, (
                    f"{field['label']} options invalid"
                )

    return True, "Valid"


# ============================================================
# FIX FIELD NAMES
# ============================================================

def make_field_name(label, existing_names):

    name = re.sub(
        r"[^a-zA-Z0-9 ]",
        "",
        label
    )

    words = name.split()

    if not words:
        name = "field"
    else:
        name = words[0].lower()

        for word in words[1:]:
            name += word.capitalize()

    original = name
    counter = 2

    while name in existing_names:

        name = f"{original}{counter}"

        counter += 1

    return name


# ============================================================
# NORMALIZE SCHEMA
# ============================================================

def normalize_schema(schema):

    if "title" not in schema:
        schema["title"] = "Generated Form"

    if "description" not in schema:
        schema["description"] = ""

    normalized_fields = []

    existing_names = set()

    for field in schema.get("fields", []):

        if not isinstance(field, dict):
            continue

        label = str(
            field.get("label", "")
        ).strip()

        if not label:
            continue

        field_type = field.get(
            "type",
            "text"
        )

        if field_type not in ALLOWED_TYPES:
            field_type = "text"

        name = field.get("name")

        if not name:
            name = make_field_name(
                label,
                existing_names
            )

        existing_names.add(name)

        normalized = {
            "label": label,
            "name": name,
            "type": field_type,
            "required": bool(
                field.get("required", True)
            )
        }

        if field_type in {
            "radio",
            "checkbox",
            "dropdown"
        }:

            options = field.get(
                "options",
                []
            )

            if not isinstance(options, list):
                options = []

            normalized["options"] = [
                str(option).strip()
                for option in options
                if str(option).strip()
            ]

        normalized_fields.append(
            normalized
        )

    schema["fields"] = normalized_fields

    return schema


# ============================================================
# GENERATE SCHEMA
# ============================================================

@app.post("/generate-schema")
def generate_schema(req: SchemaRequest):

    start_time = time.time()

    ocr_text = clean_ocr_text(
        req.extractedText
    )

    print("=" * 70)
    print("GENERATE SCHEMA REQUEST")
    print(f"OCR characters: {len(ocr_text)}")

    if not ocr_text:

        return {
            "error": "OCR text is empty",
            "formSchema": None
        }

    # ========================================================
    # PROMPT
    # ========================================================

    prompt = PROMPT_TEMPLATE.replace(
        "{ocr_text}",
        ocr_text
    )

    messages = [
        {
            "role": "user",
            "content": prompt
        }
    ]

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    # ========================================================
    # TOKENIZE
    # ========================================================

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=8192
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    input_tokens = inputs[
        "input_ids"
    ].shape[1]

    print(f"Input tokens: {input_tokens}")

    # ========================================================
    # GENERATION
    # ========================================================

    print("Generating form schema...")

    with torch.inference_mode():

        outputs = model.generate(

            **inputs,

            max_new_tokens=2048,

            do_sample=False,

            num_beams=1,

            repetition_penalty=1.05,

            pad_token_id=(
                tokenizer.eos_token_id
            )
        )

    # ========================================================
    # DECODE
    # ========================================================

    generated_tokens = outputs[
        0
    ][input_tokens:]

    raw = tokenizer.decode(
        generated_tokens,
        skip_special_tokens=True
    ).strip()

    print(
        f"Generated characters: {len(raw)}"
    )

    # ========================================================
    # PARSE JSON
    # ========================================================

    parsed = extract_json(raw)

    if parsed is None:

        print("ERROR: Invalid JSON")
        print(raw)

        return {
            "error": "Model output was not valid JSON",
            "raw": raw
        }

    # ========================================================
    # VALIDATE
    # ========================================================

    valid, message = validate_schema(
        parsed
    )

    if not valid:

        print(
            f"Schema validation failed: {message}"
        )

        return {
            "error": f"Invalid form schema: {message}",
            "raw": parsed
        }

    # ========================================================
    # NORMALIZE
    # ========================================================

    parsed = normalize_schema(
        parsed
    )

    field_count = len(
        parsed["fields"]
    )

    total_time = (
        time.time() - start_time
    )

    print(
        f"Fields generated: {field_count}"
    )

    print(
        f"Total time: {total_time:.2f} seconds"
    )

    print("=" * 70)

    # ========================================================
    # CLEAN MEMORY
    # ========================================================

    del inputs
    del outputs

    gc.collect()

    if device == "cuda":
        torch.cuda.empty_cache()


# ============================================================
# RESUME PROFILE EXTRACTION SYSTEM PROMPT
# ============================================================

PROFILE_SYSTEM_PROMPT = """
You are an expert resume information extraction system.

Your task is to convert the supplied resume text into a structured student profile.

IMPORTANT RULES:

1. Extract information ONLY when it is supported by the resume.
2. NEVER invent information.
3. NEVER guess missing information.
4. If a value is not present, return null.
5. Preserve the person's actual information.
6. Do not confuse the university with the degree.
7. Do not confuse the company with the job role.
8. Do not confuse project names with company names.
9. Preserve multiple education records.
10. Preserve multiple projects.
11. Preserve multiple certifications.
12. Preserve multiple internships or work experiences.
13. Preserve all clearly identifiable technical skills.
14. Preserve professional links such as GitHub, LinkedIn and portfolio.
15. Extract phone numbers carefully.
16. Extract email addresses exactly.
17. Do not change the email address.
18. Do not invent dates of birth.
19. Do not invent gender.
20. Do not invent address information.
21. If the resume contains CGPA, preserve it.
22. If the resume contains percentage, preserve it.
23. If both CGPA and percentage exist, preserve both.
24. If education contains multiple degrees, preserve every degree.
25. If there are multiple projects, preserve every project.
26. If there are multiple skills, preserve every skill.
27. If there are multiple certifications, preserve every certification.
28. If there is no work experience, return an empty array.
29. If there is no project information, return an empty array.
30. If there is no certification information, return an empty array.
31. Do not include information that is not present in the resume.
32. Return valid JSON.
33. Return ONLY JSON.
34. Do not use markdown code fences.
35. Do not add comments.
36. Do not add explanations before or after the JSON.
"""

PROFILE_JSON_STRUCTURE = """
Return exactly this structure:

{
  "personal": {
    "fullName": null,
    "dateOfBirth": null,
    "gender": null
  },
  "contact": {
    "email": null,
    "phone": null,
    "alternatePhone": null
  },
  "address": {
    "address": null,
    "city": null,
    "state": null,
    "country": null,
    "pincode": null
  },
  "education": [
    {
      "degree": null,
      "branch": null,
      "institution": null,
      "university": null,
      "startYear": null,
      "endYear": null,
      "cgpa": null,
      "percentage": null
    }
  ],
  "skills": [],
  "projects": [
    {
      "name": null,
      "description": null,
      "technologies": []
    }
  ],
  "experience": [
    {
      "company": null,
      "role": null,
      "location": null,
      "startDate": null,
      "endDate": null,
      "description": null
    }
  ],
  "certifications": [
    {
      "name": null,
      "organization": null,
      "date": null
    }
  ],
  "achievements": [
    {
      "title": null,
      "description": null
    }
  ],
  "links": {
    "linkedin": null,
    "github": null,
    "portfolio": null
  }
}
"""

PROFILE_EXTRACTION_PRIORITY = """
Prioritize information in this order:

1. Full Name
2. Email
3. Phone
4. Address
5. Education
6. Skills
7. Projects
8. Experience
9. Certifications
10. Achievements
11. LinkedIn
12. GitHub
13. Portfolio
14. Optional personal information

Do not sacrifice important information merely to fill every field.
"""

PROFILE_PROMPT_TEMPLATE = f"""
{PROFILE_SYSTEM_PROMPT}

==================================================
OUTPUT JSON STRUCTURE
==================================================

{PROFILE_JSON_STRUCTURE}

==================================================
EXTRACTION PRIORITY
==================================================

{PROFILE_EXTRACTION_PRIORITY}

==================================================
RESUME TEXT
==================================================

RESUME_TEXT_START

{{resume_text}}

RESUME_TEXT_END

Return ONLY the JSON object.
"""

# ============================================================
# EXTRACT TEXT ENDPOINT (UPLOAD RESUME)
# ============================================================

def clean_resume_text(text: str) -> str:
    if not text:
        return ""
    
    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    
    # Remove excessive spaces but preserve structure somewhat
    text = re.sub(r"[ \t]{2,}", " ", text)
    
    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    
    return text.strip()

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    print("=" * 70)
    print(f"EXTRACT TEXT REQUEST: {file.filename}")
    
    content_type = file.content_type
    filename = file.filename.lower()
    file_bytes = await file.read()
    
    raw_text = ""
    
    try:
        if filename.endswith(".pdf") or content_type == "application/pdf":
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                raw_text += page.get_text()
            
            # Fallback to OCR if text is very small (likely scanned PDF)
            if len(raw_text.strip()) < 50:
                print("PDF text extraction yielded little text, attempting OCR...")
                raw_text = ""
                for page in doc:
                    pix = page.get_pixmap(dpi=300)
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    raw_text += pytesseract.image_to_string(img)
                    
        elif filename.endswith(".docx") or "wordprocessingml" in content_type:
            doc = docx.Document(io.BytesIO(file_bytes))
            raw_text = "\n".join([para.text for para in doc.paragraphs])
            
        elif filename.endswith((".png", ".jpg", ".jpeg")) or content_type.startswith("image/"):
            img = Image.open(io.BytesIO(file_bytes))
            raw_text = pytesseract.image_to_string(img)
            
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
    except Exception as e:
        print(f"Extraction error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")
        
    cleaned_text = clean_resume_text(raw_text)
    
    print(f"Extracted {len(cleaned_text)} characters.")
    print("=" * 70)
    
    return {"text": cleaned_text}


# ============================================================
# EXTRACT PROFILE ENDPOINT (QWEN)
# ============================================================

@app.post("/extract-profile")
def extract_profile(req: ProfileExtractionRequest):
    start_time = time.time()
    
    resume_text = clean_resume_text(req.resumeText)
    
    print("=" * 70)
    print("EXTRACT PROFILE REQUEST")
    print(f"Resume characters: {len(resume_text)}")
    
    if not resume_text:
        return {
            "error": "Resume text is empty",
            "profile": None
        }

    prompt = PROFILE_PROMPT_TEMPLATE.replace("{resume_text}", resume_text)

    messages = [
        {
            "role": "user",
            "content": prompt
        }
    ]

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=8192
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    input_tokens = inputs["input_ids"].shape[1]
    print(f"Input tokens: {input_tokens}")

    print("Generating profile JSON...")

    with torch.inference_mode():
        outputs = model.generate(
            **inputs,
            max_new_tokens=2048,
            do_sample=False,
            num_beams=1,
            repetition_penalty=1.05,
            pad_token_id=tokenizer.eos_token_id
        )

    generated_tokens = outputs[0][input_tokens:]
    
    raw = tokenizer.decode(
        generated_tokens,
        skip_special_tokens=True
    ).strip()

    print(f"Generated characters: {len(raw)}")

    parsed = extract_json(raw)

    if parsed is None:
        print("ERROR: Invalid JSON")
        print(raw)
        return {
            "error": "Model output was not valid JSON",
            "raw": raw
        }

    total_time = time.time() - start_time
    print(f"Total time: {total_time:.2f} seconds")
    print("=" * 70)

    # Clean memory
    del inputs
    del outputs
    gc.collect()
    if device == "cuda":
        torch.cuda.empty_cache()

    return {"profile": parsed}

    return {
        "formSchema": parsed,
        "fieldCount": field_count,
        "generationTime": round(
            total_time,
            2
        )
    }