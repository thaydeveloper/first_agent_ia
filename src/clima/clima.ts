import { useState } from "react";

// Interface de agente
export interface AgentInterface {
  process: (input: string) => Promise<string>;
}

// Interface do hook
export interface UseAgentReturn {
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

// Hook useAgent
export function useAgent({
  agent,
  onMessage,
}: {
  agent: AgentInterface;
  onMessage: (message: string) => void;
}): UseAgentReturn {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const response = await agent.process(message);
      onMessage(response);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      onMessage("Desculpe, ocorreu um erro ao processar sua mensagem.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
  };
}
