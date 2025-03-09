// src/lib/mastra/agents/llm-agent.ts
import { AgentInterface } from "../../../clima/clima";

export const llmAgent: AgentInterface = {
  async process(input: string) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Falha ao comunicar com o LLM local");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Erro no llmAgent:", error);
      return "Desculpe, não consegui processar sua solicitação no momento.";
    }
  },
};
