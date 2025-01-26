import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.CODESTRAL_API_KEY,
})

const codestral = new OpenAIApi(configuration)

export async function analyzeCode(code: string) {
  try {
    console.log("Analyzing code with Codestral")
    const response = await codestral.createCompletion({
      model: "codestral-latest",
      prompt: `Analyze the following code and provide a summary of the technologies used and the main functionality:\n\n${code}`,
      max_tokens: 150,
    })
    const analysis = response.data.choices[0].text?.trim()
    console.log("Code analysis completed")
    return analysis
  } catch (error) {
    console.error("Error analyzing code:", error)
    throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : String(error)}`)
  }
}

