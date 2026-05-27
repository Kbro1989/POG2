import fireworks.client as fc
import json
import time
import argparse
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Fine-tune POG2 Pedagogy on Fireworks AI")
    parser.add_argument("--dataset", type=str, default="pog2_pedagogy_verified.jsonl", help="Verified training corpus")
    parser.add_argument("--api-key", type=str, required=True, help="Fireworks API Key")
    args = parser.parse_args()

    fc.api_key = args.api_key

    # 1. Convert to Fireworks chat format
    input_path = Path(args.dataset)
    fireworks_path = input_path.with_name(f"{input_path.stem}_fireworks.jsonl")

    with open(input_path, "r", encoding='utf-8') as f_in, \
         open(fireworks_path, "w", encoding='utf-8') as f_out:
        for line in f_in:
            entry = json.loads(line)
            messages = [
                {"role": "system", "content": "POG2 Pedagogy Engine. 27 limbs. Verified Jagex API data only."},
                {"role": "user", "content": f"{entry['instruction']}\n\nInput:\n{entry['input']}"},
                {"role": "assistant", "content": entry['output']}
            ]
            f_out.write(json.dumps({"messages": messages}) + "\n")

    print(f"Converted dataset to Fireworks format: {fireworks_path}")

    # 2. Upload dataset
    dataset_id = fc.datasets.create(
        file=str(fireworks_path),
        name="pog2-pedagogy-bestiary-v1",
        description="229k cache entities + Jagex Bestiary API primary source"
    ).id
    print(f"Dataset uploaded. ID: {dataset_id}")

    # 3. Launch fine-tuning job
    job = fc.fine_tuning.create(
        model="accounts/fireworks/models/llama-v3p1-8b-instruct",
        dataset=dataset_id,
        hyperparameters={
            "learning_rate": 5e-5,
            "epochs": 3,
            "lora_r": 32,
            "lora_alpha": 64,
            "lora_dropout": 0.05,
            "warmup_ratio": 0.03,
        }
    )
    print(f"Fine-tuning job launched. ID: {job.id}")

    # 4. Poll for completion
    while job.status not in ["COMPLETED", "FAILED"]:
        time.sleep(60)
        job = fc.fine_tuning.get(job.id)
        print(f"Status: {job.status}")

    if job.status == "COMPLETED":
        print(f"Fine-tuning complete! Deployed model ID: {job.model_id}")
    else:
        print("Fine-tuning job failed.")

if __name__ == "__main__":
    main()
