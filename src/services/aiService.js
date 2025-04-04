import { config } from '../config/index.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(config.google.apiKey); // Replace with your Google API Key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateProfileAnalysis(githubData) {
  const userInfo = githubData.user;
  const repos = githubData.repos;

  const prompt = `Analyze this GitHub profile and provide a short, friendly summary with a chill score (0-100):
User: ${userInfo.login}
Name: ${userInfo.name}
Bio: ${userInfo.bio}
Public Repos: ${userInfo.public_repos}
Followers: ${userInfo.followers}
Following: ${userInfo.following}
Top Repositories: ${repos.slice(0, 5).map(repo => 
  `${repo.name} (Stars: ${repo.stargazers_count}, Forks: ${repo.forks_count})`
).join(', ')}

Focus only on:
1. Key strengths
2. Areas for improvement
3. Overall impression

The summary should be **150-200 words**, concise, and engaging. Use a friendly tone with emojis to keep it fun! 🚀🌟🎉. End with a "Chill Score" (0-100).`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}