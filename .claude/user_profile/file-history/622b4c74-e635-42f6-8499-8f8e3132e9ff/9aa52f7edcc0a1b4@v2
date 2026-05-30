from unsloth import FastLanguageModel
from transformers import TrainingArguments
from trl import SFTTrainer
import torch
import json
import argparse
from pathlib import Path
from datasets import load_dataset

def main():
    parser = argparse.ArgumentParser(description="Train POG2 Pedagogy LoRA using Unsloth")
    parser.add_argument("--data", type=str, default="pog2_pedagogy_verified.jsonl", help="Verified training corpus")
    parser.add_argument("--output", type=str, default="./models/", help="Output directory for models")
    args = parser.parse_args()

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # 1. Load Base Model (Qwen3-8B optimized for structured data)
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name = "unsloth/Qwen3-8B",
        max_seq_length = 32768,
        dtype = torch.bfloat16,
        load_in_4bit = True,
    )

    # 2. Configure PEFT/LoRA
    model = FastLanguageModel.get_peft_model(
        model,
        r = 64,
        target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                          "gate_proj", "up_proj", "down_proj"],
        lora_alpha = 128,
        lora_dropout = 0,
        bias = "none",
        use_gradient_checkpointing = "unsloth",
        random_state = 3407,
        use_rslora = True,
    )

    # 3. POG2 Prompt Template
    pog2_template = """You are the POG2 Pedagogy Engine, trained on 229,000 verified RuneScape cache entities and Jagex Bestiary API primary sources.

Your 27-limb neural architecture includes:
- Creative Core: image, animation, material, meshops, video, creative, audio
- Technical Core: code, data, file, entity, system, versioncontrol, network, security
- Spatial Core: spatialpipeline, landscapegeneration, physics, world, livegame
- Metaphysical Core: ghost, divine, quantum, reality, relic, idauditor, orchestrator

Rules:
1. [VERIFIED] = confirmed by Jagex API + cache forensics
2. [UNVERIFIED] = wiki or community source, flag uncertainty
3. [WIKI_CONFLICT] = discrepancy between API and wiki, note both
4. Always reference entity IDs (NPC 239, Item 4151, etc.)
5. Use POG2 limb terminology for routing hints
6. Never hallucinate stats — if unknown, state [DATA_MISSING]

### Instruction:
{}

### Input:
{}

### Response:
{}"""

    EOS_TOKEN = tokenizer.eos_token

    def format_samples(examples):
        instructions = examples["instruction"]
        inputs = examples["input"]
        outputs = examples["output"]
        texts = []
        for i, inp, out in zip(instructions, inputs, outputs):
            text = pog2_template.format(i, inp, out) + EOS_TOKEN
            texts.append(text)
        return {"text": texts}

    # 4. Load and Map Dataset
    dataset = load_dataset("json", data_files=args.data, split="train")
    dataset = dataset.map(format_samples, batched=True)

    # 5. Trainer Configuration
    trainer = SFTTrainer(
        model = model,
        tokenizer = tokenizer,
        train_dataset = dataset,
        dataset_text_field = "text",
        max_seq_length = 32768,
        dataset_num_proc = 4,
        packing = True,
        args = TrainingArguments(
            per_device_train_batch_size = 1,
            gradient_accumulation_steps = 8,
            warmup_steps = 10,
            max_steps = 1000,
            learning_rate = 1e-4,
            fp16 = not torch.cuda.is_bf16_supported(),
            bf16 = torch.cuda.is_bf16_supported(),
            logging_steps = 1,
            optim = "adamw_8bit",
            weight_decay = 0.01,
            lr_scheduler_type = "cosine",
            seed = 3407,
            output_dir = str(output_dir / "pog2_pedagogy_outputs"),
            report_to = "none",
        ),
    )

    # 6. Train
    trainer.train()

    # 7. Save Artifacts
    lora_path = output_dir / "pog2_pedagogy_lora"
    model.save_pretrained(str(lora_path))
    tokenizer.save_pretrained(str(lora_path))

    # Export merged GGUF for zero-overhead inference
    model.save_pretrained_gguf(str(output_dir / "pog2_pedagogy_q8"), tokenizer, quantization_method="q8_0")
    model.save_pretrained_gguf(str(output_dir / "pog2_pedagogy_q4"), tokenizer, quantization_method="q4_K_M")

    print(f"Training complete. Artifacts saved to {output_dir}")

if __name__ == "__main__":
    main()
