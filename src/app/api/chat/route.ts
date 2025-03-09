// src/app/api/llm/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Chamada para o Ollama rodando localmente
    const response = await fetch("http://192.168.2.103:3000/llm/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "ollama3.1",
        prompt: message, // Use prompt em vez de messages
        stream: false,
      }),
    });
    console.log("Response from Ollama:", response);

    if (!response.ok) {
      console.error(
        "Erro na resposta do Ollama:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.error("Corpo do erro:", errorText);
      throw new Error(
        `Erro na API do Ollama: ${response.statusText} - ${errorText}`
      );
    }

    console.log("Resposta recebida do Ollama com sucesso");
    const data = await response.json();
    console.log("Dados recebidos:", data);

    return NextResponse.json({
      response: data?.response || "Sem resposta do modelo",
    });
  } catch (error) {
    console.error("Erro detalhado ao processar mensagem com Ollama:", error);
    return NextResponse.json(
      {
        error: `Erro ao processar: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
