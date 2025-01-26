import { Octokit } from "@octokit/rest"

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export async function fetchUserRepositories(username: string) {
  try {
    console.log("Fetching repositories for user:", username)
    const { data } = await octokit.repos.listForUser({
      username,
      sort: "updated",
      per_page: 10,
    })
    console.log("Fetched repositories:", data.length)
    return data
  } catch (error) {
    console.error("Error fetching repositories:", error)
    throw new Error(`Failed to fetch repositories: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function fetchRepositoryLanguages(username: string, repo: string) {
  try {
    console.log("Fetching languages for repository:", repo)
    const { data } = await octokit.repos.listLanguages({
      owner: username,
      repo,
    })
    console.log("Fetched languages:", Object.keys(data).length)
    return data
  } catch (error) {
    console.error("Error fetching languages:", error)
    throw new Error(`Failed to fetch languages: ${error instanceof Error ? error.message : String(error)}`)
  }
}

