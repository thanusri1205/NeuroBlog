import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

# 🔹 Base model used during training
BASE_MODEL = "EleutherAI/gpt-neo-125M"

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)

# GPT-Neo needs padding token set
tokenizer.pad_token = tokenizer.eos_token

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(BASE_MODEL)

# Load LoRA adapter
model = PeftModel.from_pretrained(
    base_model,
    "../fast-blog-llm-final"   # adjust if needed
)

model.eval()


def generate_blog(prompt: str):
    inputs = tokenizer(prompt, return_tensors="pt", padding=True)

    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_length=600,
            temperature=0.8,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )

    text = tokenizer.decode(output[0], skip_special_tokens=True)
    return text