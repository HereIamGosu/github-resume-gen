import { NextResponse } from "next/server"
import { Octokit } from "@octokit/rest"

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

async function fetchUserRepositories(username: string) {
  try {
    const { data } = await octokit.repos.listForUser({
      username,
      sort: "updated",
      per_page: 10,
    })
    return data
  } catch (error) {
    console.error("Error fetching repositories:", error)
    throw new Error(`Failed to fetch repositories: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function fetchRepositoryDetails(username: string, repo: string) {
  try {
    const [languages, readme] = await Promise.all([
      octokit.repos.listLanguages({ owner: username, repo }),
      octokit.repos.getReadme({ owner: username, repo }).catch(() => null),
    ])

    return {
      languages: languages.data,
      readme: readme ? Buffer.from(readme.data.content, "base64").toString("utf-8") : null,
    }
  } catch (error) {
    console.error(`Error fetching details for ${repo}:`, error)
    return { languages: {}, readme: null }
  }
}

function generateProjectDescription(project: any, details: { languages: any; readme: string | null }) {
  const technologies = Object.keys(details.languages).join(", ")
  const description = project.description || "No description provided"
  const readmeExcerpt = details.readme
    ? details.readme.split("\n").slice(0, 3).join("\n").trim()
    : "No README available"

  return `${project.name}: ${description}. Technologies used: ${technologies}. Key features: ${readmeExcerpt}`
}

export async function POST(req: Request) {
  try {
    const { username } = await req.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const repositories = await fetchUserRepositories(username)

    if (repositories.length === 0) {
      return NextResponse.json({ error: "No public repositories found for this user" }, { status: 404 })
    }

    const skillsData: Record<string, number> = {}
    const projectDescriptions: { name: string; description: string }[] = []

    for (const repo of repositories) {
      const details = await fetchRepositoryDetails(username, repo.name)

      Object.keys(details.languages).forEach((lang) => {
        skillsData[lang] = (skillsData[lang] || 0) + 1
      })

      const description = generateProjectDescription(repo, details)
      projectDescriptions.push({
        name: repo.name,
        description: description,
      })
    }

    // Normalize skills data
    const totalRepos = repositories.length
    Object.keys(skillsData).forEach((skill) => {
      skillsData[skill] = Math.round((skillsData[skill] / totalRepos) * 100)
    })

    return NextResponse.json({
      skills: skillsData,
      projects: projectDescriptions,
    })
  } catch (error) {
    console.error("Error generating resume:", error)
    return NextResponse.json(
      {
        error: "Failed to generate resume",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

