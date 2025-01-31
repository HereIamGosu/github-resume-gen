// github.ts
import { Octokit } from "@octokit/rest";

// 1. Конфигурация и типы ==============================================

type GitHubRepository = Awaited<ReturnType<typeof octokit.repos.listForUser>>["data"][0];
type RepositoryLanguages = Awaited<ReturnType<typeof octokit.repos.listLanguages>>["data"];

const API_CONFIG = {
  defaults: {
    perPage: 10,
    sort: "updated" as const, // Сортировка по обновлению
  },
  errors: {
    tokenMissing: "GitHub token not configured", // Ошибка при отсутствии токена
    base: "GitHub API request failed", // Общая ошибка запроса
  },
} as const;

// 2. Инициализация Octokit ============================================

/**
 * Функция для создания экземпляра Octokit.
 * @returns Экземпляр Octokit с авторизацией через токен.
 * @throws Ошибка, если токен не настроен в переменных окружения.
 */
const getOctokitInstance = (): Octokit => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(API_CONFIG.errors.tokenMissing);
  }

  return new Octokit({
    auth: token,
    userAgent: "GitHubResumeGenerator/1.0.0", // Уникальный идентификатор приложения
    throttle: { enabled: true }, // Включение режима ограничения запросов
  });
};

const octokit = getOctokitInstance();

// 3. Базовый обработчик запросов ======================================

/**
 * Обработчик запроса для получения репозиториев пользователя на GitHub.
 * @param username Имя пользователя на GitHub.
 * @returns Список репозиториев пользователя.
 */
async function getRepositoriesForUser(username: string) {
  try {
    const response = await octokit.repos.listForUser({
      username,
      per_page: API_CONFIG.defaults.perPage,
      sort: API_CONFIG.defaults.sort,
    });
    return response.data;
  } catch (error) {
    console.error(API_CONFIG.errors.base, error);
    throw new Error(API_CONFIG.errors.base);
  }
}

/**
 * Обработчик запроса для получения языков программирования, используемых в репозиториях.
 * @param username Имя пользователя на GitHub.
 * @returns Объект с языками программирования, используемыми в репозиториях.
 */
async function getRepositoryLanguages(username: string) {
  try {
    const repositories = await getRepositoriesForUser(username);
    const languages: RepositoryLanguages = {};

    for (const repo of repositories) {
      const repoLanguages = await octokit.repos.listLanguages({
        owner: username,
        repo: repo.name,
      });
      Object.assign(languages, repoLanguages.data);
    }

    return languages;
  } catch (error) {
    console.error(API_CONFIG.errors.base, error);
    throw new Error(API_CONFIG.errors.base);
  }
}

export { getRepositoriesForUser, getRepositoryLanguages };
