import React, { useState } from "react";
import { weatherAgent } from "../lib/mastra/agents/weather";
import { useAgent } from "../clima/clima";

export default function AgenteUI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  const handleMessage = (message: string) => {
    setMessages((prev) => [...prev, { role: "assistente", content: message }]);
    setLoading(false);
  };

  const { sendMessage } = useAgent({
    agent: weatherAgent,
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
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Pergunte sobre o clima em qualquer cidade
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.role === "usuário" ? "bg-blue-500 ml-auto" : "bg-gray-900"
            } max-w-[80%] whitespace-pre-line`}
          >
            <p className="text-sm text-white  font-semibold">{msg.role}</p>
            <p className="text-sm text-white">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="bg-gray-900 text-white p-3 rounded-lg">
            Pensando...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre o clima em uma cidade..."
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
