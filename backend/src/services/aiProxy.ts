import axios from 'axios'; import { getCachedResponse, setCachedResponse } from './cache';
export const streamAIResponse = async (messages: { role: string; content: string }[], userRole: string = 'free', onChunk: (text: string) => void, onDone: () => void, onError: (err: any) => void) => {
  const cacheKey = JSON.stringify(messages); const cached = await getCachedResponse(cacheKey);
  if (cached) { for (let i = 0; i < cached.length; i += 5) { onChunk(cached.slice(i, i + 5)); await new Promise(r => setTimeout(r, 10)); } onDone(); return; }
  const hfToken = process.env.HF_API_TOKEN; if (!hfToken) { onError(new Error("No HF token")); return; }
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  try {
    const response = await axios.post('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', { inputs: prompt, parameters: { max_new_tokens: 500, return_full_text: false } }, { headers: { Authorization: `Bearer ${hfToken}` } });
    const text = response.data[0]?.generated_text || '';
    for (let i = 0; i < text.length; i += 3) { onChunk(text.slice(i, i + 3)); await new Promise(r => setTimeout(r, 15)); }
    setCachedResponse(cacheKey, text); onDone();
  } catch (err) { onError(err); }
};
