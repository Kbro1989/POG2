import type { AICapability } from '../../core/models.js';

export const CloudflareModelRegistry: Record<string, AICapability> = {
    'cf_pipecat_aismart_turn_v2': {
        id: 'cf_pipecat_aismart_turn_v2',
        name: '@cf/pipecat-ai/smart-turn-v2',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/pipecat-ai/smart-turn-v2',
        description: 'An open source, community-driven, native audio turn detection model in 2nd version',
        passthroughEnabled: true
    },
    'cf_openaigpt_oss_120b': {
        id: 'cf_openaigpt_oss_120b',
        name: '@cf/openai/gpt-oss-120b',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/openai/gpt-oss-120b',
        description: 'OpenAI',
        passthroughEnabled: true
    },
    'cf_qwenqwen15_05b_chat': {
        id: 'cf_qwenqwen15_05b_chat',
        name: '@cf/qwen/qwen1.5-0.5b-chat',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/qwen/qwen1.5-0.5b-chat',
        description: 'Qwen1.5 is the improved version of Qwen, the large language model series developed by Alibaba Cloud.',
        passthroughEnabled: true
    },
    'cf_baaibge_m3': {
        id: 'cf_baaibge_m3',
        name: '@cf/baai/bge-m3',
        serviceType: 'CLOUDFLARE',
        taskType: 'EMBEDDING',
        modelId: '@cf/baai/bge-m3',
        description: 'Multi-Functionality, Multi-Linguality, and Multi-Granularity embeddings model.',
        passthroughEnabled: true
    },
    'cf_huggingfacedistilbert_sst_2_int8': {
        id: 'cf_huggingfacedistilbert_sst_2_int8',
        name: '@cf/huggingface/distilbert-sst-2-int8',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/huggingface/distilbert-sst-2-int8',
        description: 'Distilled BERT model that was finetuned on SST-2 for sentiment classification',
        passthroughEnabled: true
    },
    'cf_googlegemma_2b_it_lora': {
        id: 'cf_googlegemma_2b_it_lora',
        name: '@cf/google/gemma-2b-it-lora',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/google/gemma-2b-it-lora',
        description: 'This is a Gemma-2B base model that Cloudflare dedicates for inference with LoRA adapters. Gemma is a...',
        passthroughEnabled: true
    },
    'cf_hf_nexusflowstarling_lm_7b_beta': {
        id: 'cf_hf_nexusflowstarling_lm_7b_beta',
        name: '@hf/nexusflow/starling-lm-7b-beta',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@hf/nexusflow/starling-lm-7b-beta',
        description: 'We introduce Starling-LM-7B-beta, an open large language model (LLM) trained by Reinforcement Learni...',
        passthroughEnabled: true
    },
    'cf_black_forest_labsflux_2_klein_9b': {
        id: 'cf_black_forest_labsflux_2_klein_9b',
        name: '@cf/black-forest-labs/flux-2-klein-9b',
        serviceType: 'CLOUDFLARE',
        taskType: 'IMAGE',
        modelId: '@cf/black-forest-labs/flux-2-klein-9b',
        description: 'FLUX.2 [klein] 9B is a 9 billion parameter model that can generate images from text descriptions and...',
        passthroughEnabled: true
    },
    'cf_metallama_3_8b_instruct': {
        id: 'cf_metallama_3_8b_instruct',
        name: '@cf/meta/llama-3-8b-instruct',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/meta/llama-3-8b-instruct',
        description: 'Generation over generation, Meta Llama 3 demonstrates state-of-the-art performance on a wide range o...',
        passthroughEnabled: true
    },
    'cf_metallama_32_3b_instruct': {
        id: 'cf_metallama_32_3b_instruct',
        name: '@cf/meta/llama-3.2-3b-instruct',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/meta/llama-3.2-3b-instruct',
        description: 'The Llama 3.2 instruction-tuned text only models are optimized for multilingual dialogue use cases, ...',
        passthroughEnabled: true
    },
    'cf_hf_theblokeneural_chat_7b_v3_1_awq': {
        id: 'cf_hf_theblokeneural_chat_7b_v3_1_awq',
        name: '@hf/thebloke/neural-chat-7b-v3-1-awq',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@hf/thebloke/neural-chat-7b-v3-1-awq',
        description: 'This model is a fine-tuned 7B parameter LLM on the Intel Gaudi 2 processor from the mistralai/Mistra...',
        passthroughEnabled: true
    },
    'cf_metallama_guard_3_8b': {
        id: 'cf_metallama_guard_3_8b',
        name: '@cf/meta/llama-guard-3-8b',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/meta/llama-guard-3-8b',
        description: 'Llama Guard 3 is a Llama-3.1-8B pretrained model, fine-tuned for content safety classification. Simi...',
        passthroughEnabled: true
    },
    'cf_qwenqwen3_embedding_06b': {
        id: 'cf_qwenqwen3_embedding_06b',
        name: '@cf/qwen/qwen3-embedding-0.6b',
        serviceType: 'CLOUDFLARE',
        taskType: 'EMBEDDING',
        modelId: '@cf/qwen/qwen3-embedding-0.6b',
        description: 'The Qwen3 Embedding model series is the latest proprietary model of the Qwen family, specifically de...',
        passthroughEnabled: true
    },
    'cf_metallama_2_7b_chat_fp16': {
        id: 'cf_metallama_2_7b_chat_fp16',
        name: '@cf/meta/llama-2-7b-chat-fp16',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/meta/llama-2-7b-chat-fp16',
        description: 'Full precision (fp16) generative text model with 7 billion parameters from Meta',
        passthroughEnabled: true
    },
    'cf_mistralmistral_7b_instruct_v01': {
        id: 'cf_mistralmistral_7b_instruct_v01',
        name: '@cf/mistral/mistral-7b-instruct-v0.1',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/mistral/mistral-7b-instruct-v0.1',
        description: 'Instruct fine-tuned version of the Mistral-7b generative text model with 7 billion parameters',
        passthroughEnabled: true
    },
    'cf_myshell_aimelotts': {
        id: 'cf_myshell_aimelotts',
        name: '@cf/myshell-ai/melotts',
        serviceType: 'CLOUDFLARE',
        taskType: 'AUDIO',
        modelId: '@cf/myshell-ai/melotts',
        description: 'MeloTTS is a high-quality multi-lingual text-to-speech library by MyShell.ai.',
        passthroughEnabled: true
    },
    'cf_mistralmistral_7b_instruct_v02_lora': {
        id: 'cf_mistralmistral_7b_instruct_v02_lora',
        name: '@cf/mistral/mistral-7b-instruct-v0.2-lora',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/mistral/mistral-7b-instruct-v0.2-lora',
        description: 'The Mistral-7B-Instruct-v0.2 Large Language Model (LLM) is an instruct fine-tuned version of the Mis...',
        passthroughEnabled: true
    },
    'cf_deepgramaura_2_es': {
        id: 'cf_deepgramaura_2_es',
        name: '@cf/deepgram/aura-2-es',
        serviceType: 'CLOUDFLARE',
        taskType: 'AUDIO',
        modelId: '@cf/deepgram/aura-2-es',
        description: 'Aura-2 is a context-aware text-to-speech (TTS) model that applies natural pacing, expressiveness, an...',
        passthroughEnabled: true
    },
    'cf_openaiwhisper': {
        id: 'cf_openaiwhisper',
        name: '@cf/openai/whisper',
        serviceType: 'CLOUDFLARE',
        taskType: 'AUDIO',
        modelId: '@cf/openai/whisper',
        description: 'Whisper is a general-purpose speech recognition model. It is trained on a large dataset of diverse a...',
        passthroughEnabled: true
    },
    'cf_tinyllamatinyllama_11b_chat_v10': {
        id: 'cf_tinyllamatinyllama_11b_chat_v10',
        name: '@cf/tinyllama/tinyllama-1.1b-chat-v1.0',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/tinyllama/tinyllama-1.1b-chat-v1.0',
        description: 'The TinyLlama project aims to pretrain a 1.1B Llama model on 3 trillion tokens. This is the chat mod...',
        passthroughEnabled: true
    },
    'cf_pfnetplamo_embedding_1b': {
        id: 'cf_pfnetplamo_embedding_1b',
        name: '@cf/pfnet/plamo-embedding-1b',
        serviceType: 'CLOUDFLARE',
        taskType: 'EMBEDDING',
        modelId: '@cf/pfnet/plamo-embedding-1b',
        description: 'PLaMo-Embedding-1B is a Japanese text embedding model developed by Preferred Networks, Inc.',
        passthroughEnabled: true
    },
    'cf_hf_mistralmistral_7b_instruct_v02': {
        id: 'cf_hf_mistralmistral_7b_instruct_v02',
        name: '@hf/mistral/mistral-7b-instruct-v0.2',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@hf/mistral/mistral-7b-instruct-v0.2',
        description: 'The Mistral-7B-Instruct-v0.2 Large Language Model (LLM) is an instruct fine-tuned version of the Mis...',
        passthroughEnabled: true
    },
    'cf_fblgituna_cybertron_7b_v2_bf16': {
        id: 'cf_fblgituna_cybertron_7b_v2_bf16',
        name: '@cf/fblgit/una-cybertron-7b-v2-bf16',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/fblgit/una-cybertron-7b-v2-bf16',
        description: 'Cybertron 7B v2 is a 7B MistralAI based model, best on it\'s series. It was trained with SFT, DPO and...',
        passthroughEnabled: true
    },
    'cf_llava_hfllava_15_7b_hf': {
        id: 'cf_llava_hfllava_15_7b_hf',
        name: '@cf/llava-hf/llava-1.5-7b-hf',
        serviceType: 'CLOUDFLARE',
        taskType: 'IMAGE',
        modelId: '@cf/llava-hf/llava-1.5-7b-hf',
        description: 'LLaVA is an open-source chatbot trained by fine-tuning LLaMA/Vicuna on GPT-generated multimodal inst...',
        passthroughEnabled: true
    },
    'cf_deepseek_aideepseek_r1_distill_qwen_32b': {
        id: 'cf_deepseek_aideepseek_r1_distill_qwen_32b',
        name: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
        serviceType: 'CLOUDFLARE',
        taskType: 'TEXT',
        modelId: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
        description: 'DeepSeek-R1-Distill-Qwen-32B is a model distilled from DeepSeek-R1 based on Qwen2.5. It outperforms ...',
        passthroughEnabled: true
    },
    'cf_runwaymlstable_diffusion_v1_5_inpainting': {
        id: 'cf_runwaymlstable_diffusion_v1_5_inpainting',
        name: '@cf/runwayml/stable-diffusion-v1-5-inpainting',
        serviceType: 'CLOUDFLARE',
        taskType: 'IMAGE',
        modelId: '@cf/runwayml/stable-diffusion-v1-5-inpainting',
        description: 'Stable Diffusion Inpainting is a latent text-to-image diffusion model capable of generating photo-re...',
        passthroughEnabled: true
    }
};

