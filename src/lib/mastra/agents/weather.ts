import { AgentInterface } from "../../../clima/clima";

export const weatherAgent: AgentInterface = {
  async process(input: string) {
    try {
      // Extrai uma possível cidade da mensagem
      const cityMatch = input.match(
        /(?:tempo|clima|temperatura|previsão)\s+(?:em|para|na|no)\s+([a-zA-ZÀ-ÿ\s]+)(?:\?|\.|\s|$)/i
      );
      const cityName = cityMatch ? cityMatch[1].trim() : null;

      if (!cityName) {
        return "Por favor, pergunte sobre o clima em uma cidade específica. Por exemplo: 'Como está o clima em São Paulo?'";
      }

      // Usa a API Route em vez da função direta
      const response = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: cityName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Falha ao obter dados do clima");
      }

      const weatherData = await response.json();

      return `
Clima atual em ${weatherData.location}:
🌡️ Temperatura: ${weatherData.temperature}°C
🌡️ Sensação térmica: ${weatherData.feelsLike}°C
💧 Umidade: ${weatherData.humidity}%
💨 Velocidade do vento: ${weatherData.windSpeed} km/h
🌬️ Rajadas de vento: ${weatherData.windGust} km/h
🌤️ Condições: ${weatherData.conditions}
      `;
    } catch (error) {
      console.error("Error in weatherAgent:", error);
      return `Desculpe, não foi possível obter informações sobre o clima no momento. Erro: ${error instanceof Error ? error.message : "Desconhecido"}`;
    }
  },
};
