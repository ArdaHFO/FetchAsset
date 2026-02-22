/**
 * Groq Client — singleton wrapper around the Groq SDK.
 * Server-side only. Never import in 'use client' components.
 */
import Groq from 'groq-sdk'

let _groq: Groq | undefined

export function getGroqClient(): Groq {
  if (_groq) return _groq
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables.')
  }
  _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _groq
}

/** Primary model — Llama 3.3 70B Versatile */
export const LLAMA_MODEL = 'llama-3.3-70b-versatile'
