// codestral.ts
import OpenAI from "openai";

// 1. Конфигурация и типы ==============================================
const CODESTRAL_CONFIG = {
  model: "codestral-latest",
  maxTokens: 200, // Увеличено для более детальных описаний
  promptTemplate: `Generate professional project description in Russian using this information:
Name: {NAME}
Technologies: {TECH}
Project Structure: {STRUCTURE}

Description should be 2-3 sentences highlighting:
- Основное назначение проекта
- Ключевые технологии и их применение
- Особенности архитектуры
- Любые уникальные характеристики`,
  errors: {
    missingKey: "CODESTRAL_API_KEY environment variable not set",
    base: "Description generation failed",
  },
} as const;

export type ProjectMetadata = {
  name: string
  technologies: string[]
  structure: string
};

type AnalysisResult = string | undefined;

// 2. Инициализация API клиента ========================================
const initializeCodestral = () => {
  if (!process.env.CODESTRAL_API_KEY) {
    throw new Error(CODESTRAL_CONFIG.errors.missingKey);
  }

  return new OpenAI({
    apiKey: process.env.CODESTRAL_API_KEY,
  });
};

const codestral = initializeCodestral();

// 3. Базовый обработчик запросов ======================================
async function handleAnalysisRequest(metadata: ProjectMetadata): Promise<AnalysisResult> {
  try {
    const prompt = CODESTRAL_CONFIG.promptTemplate
      .replace("{NAME}", metadata.name)
      .replace("{TECH}", metadata.technologies.join(", "))
      .replace("{STRUCTURE}", metadata.structure);

    const response = await codestral.chat.completions.create({
      model: CODESTRAL_CONFIG.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: CODESTRAL_CONFIG.maxTokens,
    });

    return response.choices[0]?.message?.content?.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Description generation error:", errorMessage);
    throw new Error(`${CODESTRAL_CONFIG.errors.base}: ${errorMessage}`);
  }
}

// 4. Публичный API ====================================================
export async function generateProjectDescription(
  metadata: ProjectMetadata
): Promise<string | undefined> {
  try {
    console.log("Generating project description for:", metadata.name);
    const result = await handleAnalysisRequest(metadata);
    console.log("Description generation successful");
    return result;
  } catch (error) {
    console.error("Description generation pipeline failed");
    throw error;
  }
}