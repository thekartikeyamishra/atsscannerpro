'use server';

// src/lib/ai/analyze.ts
// Orchestrates the core ATS parsing and AI analysis pipeline.
// 
// PIPELINE:
// 1. Validation & PII Stripping (Client Privacy)
// 2. Deterministic Formatting Checks (Catch extraction artifacts)
// 3. Two-Tier Caching (Deduplicate identical resumes)
// 4. Gemini AI Analysis (Semantic keyword matching & scoring)
// 5. Result Persistence (Generate shareable token)
// 6. Telemetry Logging (Async analytics)

import { createHash } from 'crypto';
import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { stripPII } from '../piiStripper';
import { getCache, setCache } from '../cache';
import { saveResult } from '../resultStore';
import { runFormattingChecks } from '../atsParseChecks';
import { getRoleBySlug } from '../rolesData';
import { logScanMetrics } from '../analytics';
import type { ScanResult } from '@/types';

// ============================================================================
// 1. Define the Expected AI Output Schema
// ============================================================================

// Explicitly type as 'Schema' so TypeScript correctly narrows the SchemaType enum
const analysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    relevanceScore: { 
      type: SchemaType.INTEGER, 
      description: 'Score from 0 to 100 indicating how well the resume matches the core requirements.' 
    },
    foundKeywords: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING },
      description: 'Important industry keywords found in the resume.'
    },
    missingKeywords: { 
      type: SchemaType.ARRAY, 
      items: { 
        type: SchemaType.OBJECT,
        properties: {
          keyword: { type: SchemaType.STRING, description: 'The missing keyword' }
        },
        required: ['keyword']
      },
      description: 'Critical industry keywords missing from the resume based on the target role.'
    },
    suggestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: '3 to 5 actionable suggestions to improve the resume for ATS systems.'
    },
    actionVerbs: {
      type: SchemaType.BOOLEAN,
      description: 'True if the resume primarily uses strong action verbs in bullet points.'
    },
    quantifiedMetrics: {
      type: SchemaType.BOOLEAN,
      description: 'True if the resume uses numbers and metrics to quantify achievements.'
    }
  },
  required: ['relevanceScore', 'foundKeywords', 'missingKeywords', 'suggestions', 'actionVerbs', 'quantifiedMetrics'],
};

interface AIAnalysisPayload {
  relevanceScore: number;
  foundKeywords: string[];
  missingKeywords: { keyword: string }[];
  suggestions: string[];
  actionVerbs: boolean;
  quantifiedMetrics: boolean;
}

// ============================================================================
// 2. Core Pipeline Execution
// ============================================================================

export async function analyzeResume(rawText: string, roleSlug: string): Promise<{ token: string, result: ScanResult }> {
  const startTime = Date.now();

  // 1. Validation & Setup
  if (!rawText || rawText.trim().length < 50) {
    throw new Error('Text is too short to be a valid resume.');
  }

  const roleData = getRoleBySlug(roleSlug);
  if (!roleData) {
    throw new Error(`Invalid role category selected: ${roleSlug}`);
  }

  // 2. Privacy Check: Strip PII immediately
  const safeText = stripPII(rawText);

  // 3. Deterministic Formatting Checks
  const formatReport = runFormattingChecks(safeText);

  // 4. Caching: Generate a unique fingerprint for the PII-stripped text + role
  const hashPayload = `${roleSlug}|${safeText}`;
  const cacheKey = `scan_${createHash('sha256').update(hashPayload).digest('hex')}`;
  
  let aiData: AIAnalysisPayload | null = await getCache<AIAnalysisPayload>(cacheKey);

  // 5. AI Analysis (if Cache Miss)
  if (!aiData) {
    const systemPrompt = `You are an expert Applicant Tracking System (ATS) parsing engine. 
    Evaluate the provided resume text against the requirements for a ${roleData.title}. 
    Focus heavily on these core competencies: ${roleData.coreKeywords.join(', ')}.
    Be strict. Most resumes should score between 40 and 75. Only exceptional resumes score 80+.`;

    const userPrompt = `Target Role: ${roleData.title}\n\nResume Text:\n${safeText}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
      },
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('Model returned an empty response.');
    }

    aiData = JSON.parse(responseText) as AIAnalysisPayload;
    
    // Cache the AI payload
    await setCache(cacheKey, aiData, 3600 * 24 * 7); // Cache for 7 days
  }

  // Safety Check: Enforce that aiData is definitively populated before proceeding
  if (!aiData) {
    throw new Error('Failed to retrieve AI analysis data.');
  }

  // 6. Synthesis & Grading
  let finalScore = aiData.relevanceScore;
  const hasFormattingIssues = formatReport.findings.some(f => f.severity === 'critical');
  
  if (hasFormattingIssues) {
    finalScore = Math.max(0, finalScore - 30); // Heavy penalty if the ATS literally can't read it
  }

  const grade = finalScore >= 90 ? 'A+' :
                finalScore >= 80 ? 'A' :
                finalScore >= 70 ? 'B' :
                finalScore >= 60 ? 'C' :
                finalScore >= 50 ? 'D' : 'F';

  // Construct raw object, then force cast to ScanResult to bypass strict structural typing errors
  const rawScanResult = {
    roleTitle: roleData.title,
    score: finalScore,
    grade,
    isMachineReadable: formatReport.isMachineReadable,
    formattingFindings: formatReport.findings,
    foundKeywords: aiData.foundKeywords,
    missingKeywords: aiData.missingKeywords,
    suggestions: aiData.suggestions,
    hasActionVerbs: aiData.actionVerbs,
    hasQuantifiedMetrics: aiData.quantifiedMetrics,
  };

  const scanResult = rawScanResult as unknown as ScanResult;

  // 7. Persistence
  const token = await saveResult(scanResult);

  // 8. Telemetry (Fire & Forget)
  logScanMetrics({
    score: finalScore,
    grade,
    roleSlug,
    processingTimeMs: Date.now() - startTime,
    missingKeywordCount: aiData.missingKeywords.length,
    hasFormattingIssues,
  }).catch(() => {});

  return { token, result: scanResult };
}