import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

// OpenAI API Configuration
const openaiConfig = {
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  }
};

/**
 * Chat with the AI Assistant
 * @param messages Array of messages in the conversation history
 * @param systemPrompt Optional system prompt to guide the assistant
 * @returns AI response message
 */
export const chatWithAssistant = async (
  messages: { role: string; content: string }[],
  systemPrompt?: string
) => {
  try {
    // Add system prompt if provided
    const fullMessages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const response = await axios.post(
      '/chat/completions',
      {
        model: 'gpt-4-turbo',  // Can be adjusted based on needs
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 1000
      },
      openaiConfig
    );

    return response.data.choices[0].message;
  } catch (error: any) {
    console.error('Error in AI chat:', error.response?.data || error.message);
    throw new Error('Failed to get response from AI assistant');
  }
};

/**
 * Transcribe audio file using Whisper API
 * @param audioBuffer Audio file buffer
 * @param fileExt File extension (mp3, wav, etc.)
 * @returns Transcription text
 */
export const transcribeAudio = async (
  audioBuffer: Buffer,
  fileExt: string
) => {
  try {
    // Save buffer to temp file
    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.${fileExt}`);
    await writeFileAsync(tempFilePath, audioBuffer);

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFilePath));
    formData.append('model', 'whisper-1');
    formData.append('language', 'auto');  // Auto detect language

    // Make API request
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        }
      }
    );

    // Clean up temp file
    await unlinkAsync(tempFilePath);

    return response.data.text;
  } catch (error: any) {
    console.error('Error in transcription:', error.response?.data || error.message);
    throw new Error('Failed to transcribe audio');
  }
};

/**
 * Moderate content using OpenAI's moderation API
 * @param content Text to moderate
 * @returns Moderation results and flags
 */
export const moderateContent = async (content: string) => {
  try {
    const response = await axios.post(
      '/moderations',
      {
        input: content
      },
      openaiConfig
    );

    const result = response.data.results[0];
    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
      safe: !result.flagged
    };
  } catch (error: any) {
    console.error('Error in content moderation:', error.response?.data || error.message);
    throw new Error('Failed to moderate content');
  }
};

/**
 * Moderate image content using OpenAI's Vision model or image moderation
 * @param imageUrl URL of the image to moderate
 * @returns Moderation results including safety assessment
 */
export const moderateImageContent = async (imageUrl: string) => {
  try {
    // Option 1: Using GPT-4 Vision to detect inappropriate content
    const response = await axios.post(
      '/chat/completions',
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a content moderation assistant. Evaluate this image and determine if it contains inappropriate content such as: nudity, violence, gore, hateful symbols, or other unsafe material. Respond with a JSON object only.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Is this image safe and appropriate?' },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300
      },
      openaiConfig
    );

    // Parse the response and extract moderation assessment
    const result = JSON.parse(response.data.choices[0].message.content);

    return {
      safe: result.safe || false,
      categories: result.categories || {},
      reason: result.reason || '',
      // Ensure we return a standardized format even if the model's response structure varies
      flagged: !result.safe
    };
  } catch (error: any) {
    console.error('Error in image moderation:', error.response?.data || error.message);
    // If the API call fails, we return a safety error by default
    return {
      safe: false,
      flagged: true,
      categories: { error: true },
      reason: 'Failed to moderate image content due to API error'
    };
  }
};

/**
 * Translate text using AI
 * @param text Text to translate
 * @param targetLanguage Target language code (e.g., 'fr', 'es')
 * @returns Translated text
 */
export const translateText = async (text: string, targetLanguage: string) => {
  try {
    const response = await chatWithAssistant([
      {
        role: 'user',
        content: `Translate the following text to ${targetLanguage}:\n\n${text}`
      }
    ]);

    return response.content;
  } catch (error) {
    console.error('Error in translation:', error);
    throw new Error('Failed to translate text');
  }
};

/**
 * Summarize conversation
 * @param messages Array of messages to summarize
 * @returns Summary text
 */
export const summarizeConversation = async (messages: { sender: string; content: string }[]) => {
  try {
    // Format messages for the AI
    const formattedMessages = messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n');

    const response = await chatWithAssistant([
      {
        role: 'user',
        content: `Summarize the following conversation. Keep the summary concise but include all important points:\n\n${formattedMessages}`
      }
    ]);

    return response.content;
  } catch (error) {
    console.error('Error in conversation summarization:', error);
    throw new Error('Failed to summarize conversation');
  }
};

/**
 * Generate automatic response suggestions
 * @param messageHistory Recent message history
 * @returns Array of suggested responses
 */
export const generateResponseSuggestions = async (messageHistory: string[]) => {
  try {
    const response = await chatWithAssistant([
      {
        role: 'user',
        content: `Based on the following conversation, suggest 3 short, natural responses:\n\n${messageHistory.join('\n')}`
      }
    ]);

    // Parse the response to extract suggestions
    // Assuming the model returns numbered or bulleted list
    const suggestions = response.content
      .split(/\n/)
      .filter(line => line.trim().match(/^[\d\-\*\•]\.?\s+/))
      .map(line => line.replace(/^[\d\-\*\•]\.?\s+/, '').trim())
      .slice(0, 3);

    return suggestions.length > 0 ? suggestions : response.content.split('\n').slice(0, 3);
  } catch (error) {
    console.error('Error generating response suggestions:', error);
    return ['👍', 'Thanks!', 'I understand'];
  }
};
