// route.ts
import { NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"
import { generateProjectDescription } from "../../../utils/codestral"

// 1. Типы и интерфейсы ==============================================
type GitHubRepository = Awaited<ReturnType<typeof octokit.repos.listForUser>>['data'][0]

interface RepositoryDetails {
  languages: Record<string, number>
  readme: string | null
}

interface ProjectDescription {
  name: string
  description: string
  htmlUrl?: string
}

interface ErrorResponse {
  error: string
  details?: string
}

// 2. Конфигурация и константы =======================================
const CACHE_TTL = 1000 * 60 * 5
const MAX_REPOS = 10
const DEFAULT_TECH = 'Not specified'
const DEFAULT_DESCRIPTION = 'No description provided'
const README_EXCERPT_LINES = 3

// 3. Инициализация Octokit ==========================================
const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'GitHubResumeGenerator/1.0.0'
})

// 4. Кэширование с TTL ==============================================
const repositoryCache = new Map<string, { data: RepositoryDetails; timestamp: number }>()

// 5. Вспомогательные функции ========================================
const getCachedRepository = (key: string) => {
  const cached = repositoryCache.get(key)
  return cached && Date.now() - cached.timestamp < CACHE_TTL ? cached.data : null
}

const normalizeUsername = (username: unknown): string => {
  if (typeof username !== 'string' || !username.trim()) {
    throw new Error('Invalid username format')
  }
  return username.trim()
}

const handleApiError = (error: unknown, context: string): ErrorResponse => {
  const message = error instanceof Error ? error.message : 'Unknown error'
  console.error(`[${context}]`, message)
  return { error: `Failed to ${context}`, details: message }
}

// 6. Основные сервисные функции =====================================
const fetchUserRepositories = async (username: string): Promise<GitHubRepository[]> => {
  try {
    const { data } = await octokit.repos.listForUser({ username, sort: 'updated', per_page: MAX_REPOS })
    return data
  } catch (error) {
    throw new Error(`Repository fetch failed: ${(error as Error).message}`)
  }
}

const getRepositoryContent = async <T>(callback: () => Promise<T>) => {
  try {
    return await callback()
  } catch (error) {
    if ((error as { status?: number }).status !== 404) {
      console.error('Unexpected error:', error)
    }
    return null
  }
}

const fetchRepositoryDetails = async (username: string, repoName: string): Promise<RepositoryDetails> => {
  const cacheKey = `${username}/${repoName}`
  const cachedData = getCachedRepository(cacheKey)
  if (cachedData) return cachedData

  const [languagesResponse, readmeResponse] = await Promise.all([
    getRepositoryContent(() => octokit.repos.listLanguages({ owner: username, repo: repoName })),
    getRepositoryContent(() => octokit.repos.getReadme({ owner: username, repo: repoName })),
  ])

  const details: RepositoryDetails = {
    languages: languagesResponse?.data || {},
    readme: readmeResponse?.data 
      ? Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8')
      : null
  }

  repositoryCache.set(cacheKey, { data: details, timestamp: Date.now() })
  return details
}

// 7. Генерация контента =============================================
const formatSection = (title: string, content: string) => 
  content ? `## ${title}\n${content}\n` : ''

const buildProjectDescription = async (
  project: GitHubRepository,
  details: RepositoryDetails
): Promise<ProjectDescription> => {
  const technologies = Object.keys(details.languages).join(', ') || DEFAULT_TECH
  const readmeExcerpt = details.readme 
    ? details.readme.split('\n')
      .slice(0, README_EXCERPT_LINES)
      .join(' ')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 500)
    : DEFAULT_DESCRIPTION

  // Основное изменение: используем AI-описание как основное
  let aiDescription = DEFAULT_DESCRIPTION
  try {
    const aiResponse = await generateProjectDescription({
      name: project.name,
      technologies: Object.keys(details.languages),
      structure: readmeExcerpt
    })
    
    if (aiResponse) aiDescription = aiResponse
  } catch (error) {
    console.error('AI generation failed, using fallback:', error)
    aiDescription = project.description || DEFAULT_DESCRIPTION
  }

  const descriptionSections = [
    formatSection('Описание', aiDescription), // Используем AI-описание здесь
    formatSection('Технологии', technologies),
    formatSection('Детали реализации', readmeExcerpt) // Переименовали раздел
  ].filter(Boolean).join('\n')

  return {
    name: project.name,
    description: descriptionSections,
    htmlUrl: project.html_url
  }
}

// 8. Основной обработчик ============================================
export async function POST(req: Request) {
  try {
    const { username } = await req.json()
    const normalizedUsername = normalizeUsername(username)
    
    const repositories = await fetchUserRepositories(normalizedUsername)
    if (!repositories.length) {
      return NextResponse.json({ error: 'No public repositories found' }, { status: 404 })
    }

    const skillsMap = repositories.reduce((acc, repo) => {
      Object.keys(repo.language ? { [repo.language]: 1 } : {}).forEach(lang => 
        acc.set(lang, (acc.get(lang) || 0) + 1)
      )
      return acc
    }, new Map<string, number>())

    const projects = await Promise.all(
      repositories.map(async repo => {
        const details = await fetchRepositoryDetails(normalizedUsername, repo.name)
        Object.keys(details.languages).forEach(lang => {
          skillsMap.set(lang, (skillsMap.get(lang) || 0) + 1)
        })
        return await buildProjectDescription(repo, details)
      })
    )

    const totalRepos = repositories.length
    const skills = Array.from(skillsMap, ([skill, count]) => ({
      skill,
      percentage: Math.round((count / totalRepos) * 100)
    })).reduce((acc, { skill, percentage }) => ({ ...acc, [skill]: percentage }), {})

    return NextResponse.json({ skills, projects })

  } catch (error) {
    const { error: message, details } = handleApiError(error, 'generate resume')
    return NextResponse.json({ error: message, ...(details && { details }) }, { status: 500 })
  }
}