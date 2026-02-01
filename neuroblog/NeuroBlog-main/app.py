from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

app = FastAPI()

# CORS for React development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your Vite dev port!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/response schemas
class PromptRequest(BaseModel):
    prompt: str
    max_new_tokens: int = 400

class PromptResponse(BaseModel):
    generated_text: str

tokenizer = None
model = None
device = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "C:/Users/rupas/OneDrive/Documents/MINI_PROJECT/fast-blog-llm-final"

@app.on_event("startup")
async def load_model():
    global tokenizer, model
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    base_model = AutoModelForCausalLM.from_pretrained(MODEL_PATH).to(device)
    model = PeftModel.from_pretrained(base_model, MODEL_PATH).to(device)
    model.eval()

@app.post("/generate", response_model=PromptResponse)
async def generate_text(request: PromptRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet.")
    try:
        inputs = tokenizer(request.prompt, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=request.max_new_tokens,
                temperature=0.85,
                top_p=0.9,
                no_repeat_ngram_size=3,
                pad_token_id=tokenizer.eos_token_id
            )
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return PromptResponse(generated_text=generated_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
