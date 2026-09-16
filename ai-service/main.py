from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from processing.json_form_structurer import structure_schema
from processing.form_classifier import classify
from processing.autocomplete import get_autocomplete
from processing.schema_reviewer import review_schema
from processing.form_generator import generate_schema

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Spring Boot calls this, not the browser, but just in case
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StructureRequest(BaseModel):
    extractedText: str
    rawSchema: list

@app.post("/structure-schema")
def structure(req: StructureRequest):
    return structure_schema(req.extractedText, req.rawSchema)

class ClassifyRequest(BaseModel):
    title: str
    description: str
    schema: dict | list

@app.post("/classify-form")
def classify_form(req: ClassifyRequest):
    return classify(req.title, req.description, req.schema)

@app.get("/health")
def health():
    return {"status": "ok", "service": "json-form-structurer"}

class AutocompleteRequest(BaseModel):
    fieldLabel: str
    query: str
    options: list | None = []

@app.post("/autocomplete")
def autocomplete(req: AutocompleteRequest):
    return get_autocomplete(req.fieldLabel, req.query, req.options)

class ReviewSchemaRequest(BaseModel):
    title: str
    description: str
    schema: list

@app.post("/review-form-schema")
def review_form_schema(req: ReviewSchemaRequest):
    return review_schema(req.title, req.description, getattr(req, 'schema', []))

class GenerateSchemaRequest(BaseModel):
    extractedText: str

@app.post("/generate-schema")
def api_generate_schema(req: GenerateSchemaRequest):
    return generate_schema(req.extractedText)
