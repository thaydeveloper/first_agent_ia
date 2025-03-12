import axios from "axios";

interface QueryResponse {
  success: boolean;
  response?: string;
  error?: string;
  model?: string;
  processingTimeMs?: number;
}

const llmApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_LLM_API_URL || "http://localhost:11434",
  timeout: 30000,
});

export const listModels = async () => {
  try {
    const response = await llmApi.get("/api/tags");
    console.log("Response from Ollama:", response);

    if (response.data && response.data.models) {
      return {
        success: true,
        models: response.data.models.map((model: any) => ({
          name: model.name,
          size: model.size,
          modified: model.modified_at,
        })),
      };
    }
    return {
      success: false,
      error: "Formato de resposta inesperado",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const queryModel = async (
  model: string,
  prompt: string,
  options = {}
): Promise<QueryResponse> => {
  const startTime = Date.now();

  try {
    const response = await llmApi.post("/api/generate", {
      model,
      prompt,
      options: {
        temperature: 0.7,
        num_predict: 1000,
        ...options,
      },
    });

    return {
      success: true,
      response: response.data.response,
      model,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
      model,
    };
  }
};

export const checkLLMService = async () => {
  try {
    await llmApi.get("/api/tags");
    return {
      status: "online" as const,
      message: "Serviço Ollama está disponível",
    };
  } catch (error: any) {
    return {
      status: "offline" as const,
      message: `Serviço Ollama está indisponível: ${error.message}`,
      error: error.response?.data || error.message,
    };
  }
};
