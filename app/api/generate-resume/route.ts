// route.ts
import { NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"

// 1. Типы и интерфейсы ==============================================
type GitHubRepository = Awaited<ReturnType<typeof octokit.repos.listForUser>>['data'][0]

interface RepositoryDetails {
  languages: Record<string, number>
  readme: string | null
}

interface ProjectDescription {
  name: string
  description: string
}

interface ErrorResponse {
  error: string
  details?: string
}

// 2. Конфигурация и константы =======================================
const CACHE_TTL = 1000 * 60 * 5 // 5 минут
const MAX_REPOS = 10
const DEFAULT_TECH = 'Not specified'
const DEFAULT_DESCRIPTION = 'No description provided'

// 3. Инициализация Octokit ==========================================
const octokit = new Octokit({ 
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'GitHubResumeGenerator/1.0.0'
})

// 4. Кэширование с TTL ==============================================
const repositoryCache = new Map<string, { data: RepositoryDetails; timestamp: number }>()

const getCachedRepository = (key: string) => {
  const cached = repositoryCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

// 5. Вспомогательные функции ========================================
const normalizeUsername = (username: unknown): string => {
  if (!username || typeof username !== 'string') {
    throw new Error('Invalid username format')
  }
  return username.trim()
}

const handleApiError = (error: unknown, context: string): ErrorResponse => {
  console.error(`[${context}] Error:`, error)
  const message = error instanceof Error ? error.message : 'Unknown error'
  return { error: `Failed to ${context}`, details: message }
}

// 6. Основные сервисные функции =====================================
async function fetchUserRepositories(username: string): Promise<GitHubRepository[]> {
  try {
    const { data } = await octokit.repos.listForUser({
      username,
      sort: 'updated',
      per_page: MAX_REPOS,
    })
    return data
  } catch (error) {
    throw new Error(`Repository fetch failed: ${(error as Error).message}`)
  }
}

async function fetchRepositoryDetails(
  username: string,
  repoName: string
): Promise<RepositoryDetails> {
  const cacheKey = `${username}/${repoName}`
  const cachedData = getCachedRepository(cacheKey)
  if (cachedData) return cachedData

  try {
    const [languagesResponse, readmeResponse] = await Promise.all([
      octokit.repos.listLanguages({ owner: username, repo: repoName }),
      octokit.repos.getReadme({ 
        owner: username, 
        repo: repoName 
      }).catch(() => null),
    ])

    const details: RepositoryDetails = {
      languages: languagesResponse.data,
      readme: readmeResponse?.data 
        ? Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8')
        : null,
    }

    repositoryCache.set(cacheKey, { data: details, timestamp: Date.now() })
    return details
  } catch (error) {
    console.error(`Failed to fetch details for ${repoName}:`, error)
    return { languages: {}, readme: null }
  }
}

// 7. Генерация контента =============================================
function generateReadmeExcerpt(readme: string | null): string {
  if (!readme) return 'No README available'
  return readme
    .split('\n')
    .slice(0, 3)
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function buildProjectDescription(
  project: GitHubRepository,
  details: RepositoryDetails
): ProjectDescription {
  const technologies = Object.keys(details.languages).join(', ') || DEFAULT_TECH
  const description = project.description?.replace(/\.$/, '') || DEFAULT_DESCRIPTION

  return {
    name: project.name,
    description: `${project.name}: ${description}. Technologies: ${technologies}. Features: ${generateReadmeExcerpt(details.readme)}`
  }
}

// 8. Основной обработчик ============================================
export async function POST(req: Request) {
  try {
    const { username } = await req.json()
    const normalizedUsername = normalizeUsername(username)
    
    const repositories = await fetchUserRepositories(normalizedUsername)
    if (repositories.length === 0) {
      return NextResponse.json(
        { error: 'No public repositories found' }, 
        { status: 404 }
      )
    }

    const skillsMap = new Map<string, number>()
    const projects = await Promise.all(
      repositories.map(async repo => {
        const details = await fetchRepositoryDetails(normalizedUsername, repo.name)
        Object.keys(details.languages).forEach(lang => {
          skillsMap.set(lang, (skillsMap.get(lang) || 0) + 1)
        })
        return buildProjectDescription(repo, details)
      })
    )

    const totalRepos = repositories.length
    const normalizedSkills = Array.from(skillsMap).map(([skill, count]) => ({
      skill,
      percentage: Math.round((count / totalRepos) * 100)
    }))

    return NextResponse.json({
      skills: Object.fromEntries(normalizedSkills.map(({ skill, percentage }) => [skill, percentage])),
      projects
    })

  } catch (error) {
    const { error: message, details } = handleApiError(error, 'generate resume')
    return NextResponse.json(
      { error: message, ...(details && { details }) },
      { status: 500 }
    )
  }
}