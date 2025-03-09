import React, { useState } from "react";
import { useAgent } from "../clima/clima";
import { weatherAgent } from "../lib/mastra/agents/weather";
import { llmAgent } from "../lib/mastra/agents/llm-agent";

export default function AgenteUI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<"weather" | "llm">("llm");

  const handleMessage = (message: string) => {
    setMessages((prev) => [...prev, { role: "assistente", content: message }]);
    setLoading(false);
  };

  const { sendMessage } = useAgent({
    agent: selectedAgent === "weather" ? weatherAgent : llmAgent,
    onMessage: handleMessage,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Adiciona mensagem do usuário
    setMessages((prev) => [...prev, { role: "usuário", content: input }]);

    // Marca como carregando
    setLoading(true);

    // Envia para o agente
    await sendMessage(input);

    // Limpa o input
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <div className="flex justify-center space-x-4 mb-3">
          <button
            className={`px-4 py-2 rounded ${
              selectedAgent === "llm" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedAgent("llm")}
          >
            LLM (Ollama)
          </button>
          <button
            className={`px-4 py-2 rounded ${
              selectedAgent === "weather"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setSelectedAgent("weather")}
          >
            Clima
          </button>
        </div>
        <p className="text-center text-sm text-gray-500">
          {selectedAgent === "llm"
            ? "Conversando com Ollama LLM local"
            : "Assistente de clima - pergunte sobre o clima em uma cidade"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {selectedAgent === "llm"
              ? "Converse com o LLM local"
              : "Pergunte sobre o clima em qualquer cidade"}
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.role === "usuário" ? "bg-blue-100 ml-auto" : "bg-gray-100"
            } max-w-[80%] whitespace-pre-line`}
          >
            <p className="text-sm font-semibold">{msg.role}</p>
            <p>{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-sm font-semibold">assistente</p>
            <p>
              {selectedAgent === "llm"
                ? "Processando..."
                : "Buscando informações do clima..."}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            selectedAgent === "llm"
              ? "Digite sua mensagem..."
              : "Pergunte sobre o clima em uma cidade..."
          }
          className="flex-1 p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
