import express from 'express';
import { fetchGitHubData } from '../services/githubService.js';
import { generateProfileAnalysis } from '../services/aiService.js';

const router = express.Router();

router.post('/analyze/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Fetch GitHub data
    const githubData = await fetchGitHubData(username);
    
    // Get the streaming response from OpenAI
    const stream = await generateProfileAnalysis(githubData);
    
    let buffer = '';  // Accumulate characters

for await (const chunk of stream) {
  buffer += chunk;  // Add chunk to the buffer

  // Check if we have a complete JSON message (assuming it's a stringified JSON)
  try {
    const parsedChunk = JSON.parse(buffer);
    if (parsedChunk.choices && Array.isArray(parsedChunk.choices) && parsedChunk.choices.length > 0) {
      const content = parsedChunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
      buffer = '';  // Reset the buffer after processing
    }
  } catch (error) {
    // If the buffer isn't a valid JSON yet, we just continue accumulating
    // Log the partial content for debugging
    console.log('Partial buffer:', buffer);
  }
}
       

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the profile' });
  }
});

export default router;