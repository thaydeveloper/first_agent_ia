"use client";

import React, { useState, useEffect } from "react";
import { useAgent } from "../clima/clima";
import { llmAgent } from "../lib/mastra/agents/llm-agent";
import {
  SunIcon,
  MoonIcon,
  CloudIcon,
  SparklesIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { weatherAgent } from "../lib/mastra/agents/weather";
import { listModels, checkLLMService } from "../app/api/llms/llm.service";

interface Model {
  name: string;
  size: number;
  modified: string;
}

export default function AgenteUI() {
  // Estados
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<"weather" | "llm">("llm");
  const [darkMode, setDarkMode] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [serviceStatus, setServiceStatus] = useState<
    "online" | "offline" | "checking"
  >("checking");

  // Efeitos
  useEffect(() => {
    const initializeLLM = async () => {
      try {
        // Verificar status do serviço
        const status = await checkLLMService();
        setServiceStatus(status.status);

        if (status.status === "online") {
          // Carregar lista de modelos
          const response = await listModels();
          if (response.success && response.models) {
            setModels(response.models);
            if (response.models.length > 0) {
              setSelectedModel(response.models[0].name);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar LLM:", error);
        setServiceStatus("offline");
      } finally {
        setLoadingModels(false);
      }
    };

    initializeLLM();
  }, []);

  // Efeito para tema escuro
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      document.body.style.backgroundColor = "#111827";
    } else {
      document.body.classList.remove("dark");
      document.body.style.backgroundColor = "#f9fafb";
    }
  }, [darkMode]);

  // Handlers
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

    setMessages((prev) => [...prev, { role: "usuário", content: input }]);
    setLoading(true);
    await sendMessage(input);
    setInput("");
  };

  return (
    <div
      className={`flex flex-col h-screen max-w-4xl mx-auto p-4 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 mb-4 pb-2 mt-40 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="flex items-center justify-between">
          <h1
            className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}
          >
            {selectedAgent === "llm" ? "Assistente IA" : "Clima Assistant"}
          </h1>

          <div className="flex items-center space-x-2">
            {/* Seletor de Modelos */}
            {selectedAgent === "llm" && (
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className={`appearance-none px-4 py-2 pr-8 rounded-lg ${
                    darkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-100 text-gray-900 border-gray-300"
                  } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  disabled={serviceStatus !== "online" || loadingModels}
                >
                  {loadingModels ? (
                    <option>Carregando modelos...</option>
                  ) : (
                    models.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4" />
              </div>
            )}

            {/* Status do Serviço */}
            <div
              className={`px-2 py-1 rounded-md text-sm ${
                serviceStatus === "online"
                  ? "bg-green-100 text-green-800"
                  : serviceStatus === "offline"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {serviceStatus === "online"
                ? "Online"
                : serviceStatus === "offline"
                  ? "Offline"
                  : "Verificando..."}
            </div>

            {/* Seletor de Agente */}
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedAgent("llm")}
                className={`flex items-center gap-1 px-4 py-2 ${
                  selectedAgent === "llm"
                    ? darkMode
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-500 text-white"
                    : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                }`}
              >
                <SparklesIcon className="w-4 h-4" /> IA
              </button>
              <button
                onClick={() => setSelectedAgent("weather")}
                className={`flex items-center gap-1 px-4 py-2 ${
                  selectedAgent === "weather"
                    ? darkMode
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-500 text-white"
                    : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                }`}
              >
                <CloudIcon className="w-4 h-4" /> Clima
              </button>
            </div>

            {/* Toggle Theme */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? "bg-gray-700 text-yellow-300" : "bg-gray-200 text-gray-700"}`}
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 overflow-y-auto mb-4 space-y-3 ${darkMode ? "bg-gray-800" : "bg-gray-50"} p-4 rounded-lg`}
      >
        {messages.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center h-full text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            {selectedAgent === "llm" ? (
              <>
                <SparklesIcon className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">Seu assistente de IA</p>
                <p className="max-w-md mt-2 text-sm">
                  Faça perguntas, obtenha respostas ou peça ajuda
                </p>
              </>
            ) : (
              <>
                <CloudIcon className="w-12 h-12 mb-3" />
                <p className="text-lg font-medium">Assistente de clima</p>
                <p className="max-w-md mt-2 text-sm">
                  Pergunte sobre o clima em qualquer cidade
                </p>
              </>
            )}
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              msg.role === "usuário"
                ? darkMode
                  ? "bg-indigo-900 ml-auto"
                  : "bg-indigo-100 ml-auto"
                : darkMode
                  ? "bg-gray-700"
                  : "bg-white border border-gray-200"
            } max-w-[85%]`}
          >
            <div className="flex items-center mb-2">
              <span
                className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                {msg.role === "usuário" ? "Você" : "Assistente"}
              </span>
            </div>
            <p
              className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-800"}`}
            >
              {msg.content}
            </p>
          </div>
        ))}

        {loading && (
          <div
            className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-white border border-gray-200"}`}
          >
            <div className="flex items-center space-x-2">
              <div className="animate-pulse h-2 w-2 bg-indigo-500 rounded-full" />
              <div
                className="animate-pulse h-2 w-2 bg-indigo-500 rounded-full"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="animate-pulse h-2 w-2 bg-indigo-500 rounded-full"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
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
          className={`flex-1 p-3 rounded-lg border ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-gray-50 border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-3 rounded-lg ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          } text-white font-medium transition-colors`}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
