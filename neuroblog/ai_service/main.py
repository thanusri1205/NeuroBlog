from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

app = FastAPI()

MODEL_PATH = "./fast-blog-llm-final"
device = "cuda" if torch.cuda.is_available() else "cpu"

print("Loading model...")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "gpt2-medium",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
).to(device)

# Load LoRA adapter
model = PeftModel.from_pretrained(base_model, MODEL_PATH).to(device)

model.eval()

class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate")
def generate_text(data: PromptRequest):

    inputs = tokenizer(
        data.prompt,
        return_tensors="pt",
        truncation=True,
        max_length=512
    ).to(device)

    with torch.inference_mode():   # Faster than no_grad
        output = model.generate(
            **inputs,
            max_new_tokens=300,     # 🔥 Reduced from 400
            temperature=0.85,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            use_cache=True,
            early_stopping=True
        )

    text = tokenizer.decode(output[0], skip_special_tokens=True)

    return {"generated_text": text}