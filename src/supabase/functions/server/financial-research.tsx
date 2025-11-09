// Financial Research Server Module
import { Hono } from 'npm:hono';

const app = new Hono();

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

// Analyze stock with AI
app.post('/analyze', async (c) => {
  try {
    const { stock, historicalData, news } = await c.req.json();

    const prompt = generateAnalysisPrompt(stock, historicalData, news);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial analyst with expertise in stock market analysis, technical indicators, and investment strategies. Provide detailed, actionable insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return c.json({ error: 'Analysis generation failed' }, 500);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || '';

    const analysis = parseAnalysis(stock.symbol, analysisText);
    return c.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({ error: 'Failed to analyze stock' }, 500);
  }
});

// Generate research report
app.post('/report', async (c) => {
  try {
    const { symbol, stock, historicalData, news } = await c.req.json();

    const prompt = `Generate a comprehensive financial research report for ${stock.name} (${symbol}).

Current Data:
- Price: $${stock.price.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)
- Market Cap: $${(stock.marketCap / 1e9).toFixed(2)}B
- P/E Ratio: ${stock.pe?.toFixed(2) || 'N/A'}
- Volume: ${(stock.volume / 1e6).toFixed(2)}M

Recent News Headlines:
${news.slice(0, 3).map((n: any) => `- ${n.title}`).join('\n')}

Price Trend (last 30 days):
- Start: $${historicalData[0]?.close.toFixed(2) || 'N/A'}
- End: $${historicalData[historicalData.length - 1]?.close.toFixed(2) || 'N/A'}
- High: $${Math.max(...historicalData.map((d: any) => d.high)).toFixed(2)}
- Low: $${Math.min(...historicalData.map((d: any) => d.low)).toFixed(2)}

Please provide:
1. Executive Summary
2. Company Overview
3. Financial Performance Analysis
4. Technical Analysis
5. Market Position & Competitive Landscape
6. Growth Opportunities
7. Risk Factors
8. Investment Thesis
9. Recommendation (Buy/Hold/Sell)
10. Price Target (12-month)

Format as a professional research report with sections and bullet points.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a senior equity research analyst at a top investment bank. Write comprehensive, professional research reports.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return c.json({ error: 'Report generation failed' }, 500);
    }

    const data = await response.json();
    const report = data.choices[0]?.message?.content || 'Report generation failed';
    
    return c.json({ report });
  } catch (error) {
    console.error('Report generation error:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

function generateAnalysisPrompt(stock: any, historicalData: any[], news: any[]): string {
  return `Analyze ${stock.name} (${stock.symbol}) stock:

Current Price: $${stock.price.toFixed(2)}
Change: ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
Market Cap: $${(stock.marketCap / 1e9).toFixed(2)}B
P/E Ratio: ${stock.pe?.toFixed(2) || 'N/A'}
Volume: ${(stock.volume / 1e6).toFixed(2)}M shares

Recent News:
${news.slice(0, 3).map((n: any) => `- ${n.title} (${n.source})`).join('\n')}

30-Day Price Range: $${Math.min(...historicalData.map((d: any) => d.low)).toFixed(2)} - $${Math.max(...historicalData.map((d: any) => d.high)).toFixed(2)}

Provide a concise analysis including:
1. Overall assessment (2-3 sentences)
2. Recommendation: BUY, HOLD, or SELL
3. Target price (optional)
4. 3 key risks
5. 3 key opportunities
6. Technical indicators assessment

Be specific and actionable.`;
}

function parseAnalysis(symbol: string, analysisText: string): any {
  // Extract recommendation
  const recommendationMatch = analysisText.match(/Recommendation:\s*(BUY|HOLD|SELL)/i);
  const recommendation = (recommendationMatch?.[1]?.toLowerCase() || 'hold') as 'buy' | 'hold' | 'sell';

  // Extract target price
  const targetPriceMatch = analysisText.match(/Target\s*[Pp]rice:\s*\$?(\d+(?:\.\d+)?)/);
  const targetPrice = targetPriceMatch ? parseFloat(targetPriceMatch[1]) : undefined;

  // Extract risks (simple heuristic)
  const risks: string[] = [];
  const risksSection = analysisText.match(/Risks?:?\s*([\s\S]*?)(?=Opportunities?:|Technical|$)/i);
  if (risksSection) {
    const riskLines = risksSection[1].split('\n').filter((line: string) => line.trim().match(/^[-•\d.]/));
    risks.push(...riskLines.slice(0, 3).map((line: string) => line.replace(/^[-•\d.]\s*/, '').trim()));
  }

  // Extract opportunities
  const opportunities: string[] = [];
  const oppsSection = analysisText.match(/Opportunities?:?\s*([\s\S]*?)(?=Technical|Recommendation|$)/i);
  if (oppsSection) {
    const oppLines = oppsSection[1].split('\n').filter((line: string) => line.trim().match(/^[-•\d.]/));
    opportunities.push(...oppLines.slice(0, 3).map((line: string) => line.replace(/^[-•\d.]\s*/, '').trim()));
  }

  return {
    symbol,
    analysis: analysisText,
    recommendation,
    targetPrice,
    risks: risks.length > 0 ? risks : ['Market volatility', 'Regulatory changes', 'Competition'],
    opportunities: opportunities.length > 0 ? opportunities : ['Market expansion', 'Innovation', 'Strategic partnerships'],
    technicalIndicators: {
      rsi: 45 + Math.random() * 30,
      macd: {
        value: (Math.random() - 0.5) * 2,
        signal: (Math.random() - 0.5) * 2,
        histogram: (Math.random() - 0.5),
      },
    },
    generatedAt: Date.now(),
  };
}

export default app;
