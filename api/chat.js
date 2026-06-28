export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        system: `You are AI Travel Planner - a multi-agent system with 4 specialized agents:
🎯 Orchestrator - Coordinates the team
🔍 Researcher - Finds facts about destinations
📋 Planner - Creates detailed itineraries
✍️ Writer - Polishes recommendations

Be helpful, specific, and personalized. Include budgets, timelines, and practical tips.`,
        messages: [{ role: 'user', content: message }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Claude API error' });
    }

    return res.status(200).json({
      message: data.content[0].text
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
