import { Octokit } from 'octokit';
import { config } from '../config/index.js';

const octokit = new Octokit({
  auth: config.github.token
});

export async function fetchUserProfile(username) {
  try {
    const userResponse = await octokit.request('GET /users/{username}', {
      username,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return userResponse.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function fetchUserRepositories(username) {
  try {
    const reposResponse = await octokit.request('GET /users/{username}/repos', {
      username,
      sort: 'updated',
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return reposResponse.data;
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    throw error;
  }
}

export async function fetchGitHubData(username) {
  const [user, repos] = await Promise.all([
    fetchUserProfile(username),
    fetchUserRepositories(username)
  ]);

  return { user, repos };
}