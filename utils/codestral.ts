// codestral.ts

import OpenAI from "openai";

// 1. Конфигурация и типы ==============================================

const CODESTRAL_CONFIG = {
  model: "codestral-latest",
  maxTokens: 200, // Увеличено для более детализированных описаний
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

// Типы данных для метаданных проекта ===================================

export type ProjectMetadata = {
  name: string;
  technologies: string[];
  structure: string;
};

type AnalysisResult = string | undefined;

// 2. Инициализация API клиента ========================================

const initializeCodestral = (): OpenAI => {
  const apiKey = process.env.CODESTRAL_API_KEY;

  if (!apiKey) {
    throw new Error(CODESTRAL_CONFIG.errors.missingKey);
  }

  const openAIClient = new OpenAI({
    apiKey: apiKey,
  });

  return openAIClient;
};

// 3. Функция для генерации описания проекта ==========================

const generateProjectDescription = async (project: ProjectMetadata): Promise<AnalysisResult> => {
  try {
    const openAIClient = initializeCodestral();
    const prompt = CODESTRAL_CONFIG.promptTemplate
      .replace("{NAME}", project.name)
      .replace("{TECH}", project.technologies.join(", "))
      .replace("{STRUCTURE}", project.structure);

    const response = await openAIClient.completions.create({
      model: CODESTRAL_CONFIG.model,
      prompt: prompt,
      max_tokens: CODESTRAL_CONFIG.maxTokens,  // Заменили maxTokens на max_tokens
    });

    return response.choices[0]?.text?.trim();
  } catch (error) {
    console.error(CODESTRAL_CONFIG.errors.base, error);
    return undefined;
  }
};


export default generateProjectDescription;
