// github.ts
import { Octokit } from "@octokit/rest";

// 1. Конфигурация и типы ==============================================
type GitHubRepository = Awaited<ReturnType<typeof octokit.repos.listForUser>>["data"][0];
type RepositoryLanguages = Awaited<ReturnType<typeof octokit.repos.listLanguages>>["data"];

const API_CONFIG = {
  defaults: {
    perPage: 10,
    sort: "updated" as const,
  },
  errors: {
    tokenMissing: "GitHub token not configured",
    base: "GitHub API request failed",
  },
} as const;

// 2. Инициализация Octokit ============================================
const getOctokitInstance = () => {
  if (!process.env.GITHUB_TOKEN) throw new Error(API_CONFIG.errors.tokenMissing);
  
  return new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: "GitHubResumeGenerator/1.0.0",
    throttle: { enabled: true },
  });
};

const octokit = getOctokitInstance();

// 3. Базовый обработчик запросов ======================================
async function handleGitHubRequest<T>(
  operation: string,
  request: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    console.debug(`GitHub API: Starting ${operation}`);
    const result = await request();
    console.debug(`GitHub API: Completed ${operation}`);
    return result;
  } catch (error) {
    console.error(`GitHub API Error [${context}]:`, error);
    throw new Error(
      `${API_CONFIG.errors.base} - ${context}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// 4. Сервисные функции ================================================
export async function fetchUserRepositories(username: string): Promise<GitHubRepository[]> {
  return handleGitHubRequest(
    "fetchUserRepositories",
    () => octokit.repos.listForUser({
      username,
      sort: API_CONFIG.defaults.sort,
      per_page: API_CONFIG.defaults.perPage,
    }).then(({ data }) => data),
    `User: ${username}`
  );
}

export async function fetchRepositoryLanguages(
  username: string,
  repo: string
): Promise<RepositoryLanguages> {
  return handleGitHubRequest(
    "fetchRepositoryLanguages",
    () => octokit.repos.listLanguages({
      owner: username,
      repo,
    }).then(({ data }) => data),
    `Repo: ${username}/${repo}`
  );
}