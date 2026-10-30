// src/app/api/scan/route.ts
// Main API Route for the ATS Scanner.
// Orchestrates the entire pipeline: Rate Limiting -> Validation -> Extraction -> Security -> Format Checks -> Cache -> AI Analysis -> Storage -> Telemetry.

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";

import { extractTextFromFile } from "@/lib/fileParser";
import {
  validateFile,
  detectPromptInjection,
  sanitizeInput,
} from "@/lib/security";
import { checkRateLimit } from "@/lib/rateLimiter";
import { stripPII } from "@/lib/piiStripper";
import { runFormattingChecks } from "@/lib/atsParseChecks";
import { getCache, setCache } from "@/lib/cache";
import { saveResult } from "@/lib/resultStore";
import { logScanMetrics } from "@/lib/analytics";
import type { ScanResult } from "@/types";

// Allow Vercel/Firebase up to 60 seconds to process the AI generation
export const maxDuration = 60;

// Define the Expected AI Output Schema to enforce strict JSON structure
const analysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    relevanceScore: {
      type: SchemaType.INTEGER,
      description:
        "Score from 0 to 100 indicating how well the resume matches the job description requirements.",
    },
    foundKeywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description:
        "Important industry or job-specific keywords found in the resume.",
    },
    missingKeywords: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          keyword: {
            type: SchemaType.STRING,
            description: "The missing keyword",
          },
        },
        required: ["keyword"],
      },
      description:
        "Critical industry keywords missing from the resume based on the target job description.",
    },
    suggestions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description:
        "3 to 5 actionable suggestions to improve the resume for ATS systems.",
    },
    actionVerbs: {
      type: SchemaType.BOOLEAN,
      description:
        "True if the resume primarily uses strong action verbs in bullet points.",
    },
    quantifiedMetrics: {
      type: SchemaType.BOOLEAN,
      description:
        "True if the resume uses numbers and metrics to quantify achievements.",
    },
  },
  required: [
    "relevanceScore",
    "foundKeywords",
    "missingKeywords",
    "suggestions",
    "actionVerbs",
    "quantifiedMetrics",
  ],
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Rate Limiting Check
    // NextRequest in modern Next.js does not expose `.ip` natively. We rely on the proxy headers.
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const rateLimit = await checkRateLimit(ip);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: 60,
        },
        { status: 429 },
      );
    }

    // 2. Parse Request Data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const jobDescription = formData.get("jobDescription") as string | null;
    const role = (formData.get("role") as string) || "General Role";

    if (!file) {
      return NextResponse.json(
        { error: "No resume file uploaded." },
        { status: 400 },
      );
    }
    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: "Job description is too short or missing." },
        { status: 400 },
      );
    }

    // 3. File Validation
    const fileValidation = validateFile(file);
    if (!fileValidation.isValid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 },
      );
    }

    // 4. Extraction & Security
    const rawText = await extractTextFromFile(file);
    const sanitizedText = sanitizeInput(rawText);

    const injectionCheck = detectPromptInjection(sanitizedText);
    if (!injectionCheck.isValid) {
      return NextResponse.json(
        { error: injectionCheck.error },
        { status: 400 },
      );
    }

    // 5. PII Stripping & Deterministic Formatting Checks
    const safeText = stripPII(sanitizedText);
    const safeJd = stripPII(sanitizeInput(jobDescription));
    const formatReport = runFormattingChecks(safeText);
    const hasFormattingIssues = formatReport.findings.some(
      (f) => f.severity === "critical",
    );

    // 6. Caching (L1 + L2)
    const hashPayload = `${role}|${safeText}|${safeJd}`;
    const cacheKey = `scan_${createHash("sha256").update(hashPayload).digest("hex")}`;
    let aiData = await getCache<any>(cacheKey);

    // 7. AI Analysis (if Cache Miss)
    if (!aiData) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: `You are an expert Applicant Tracking System (ATS) parsing engine. 
        Evaluate the provided resume text against the job description requirements. 
        Be strict. Most resumes should score between 40 and 75. Only exceptional resumes score 80+.`,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
        },
      });

      const userPrompt = `Target Role: ${role}\n\nJob Description:\n${safeJd}\n\nResume Text:\n${safeText}`;
      const result = await model.generateContent(userPrompt);
      const responseText = result.response.text();

      if (!responseText) {
        throw new Error("Model returned an empty response.");
      }

      aiData = JSON.parse(responseText);
      await setCache(cacheKey, aiData, 3600 * 24 * 7); // Cache result for 7 days
    }

    // 8. Synthesis & Grading
    let finalScore = aiData.relevanceScore;
    if (hasFormattingIssues) {
      finalScore = Math.max(0, finalScore - 30); // Penalize score for critical formatting errors
    }

    const grade =
      finalScore >= 90
        ? "A+"
        : finalScore >= 80
          ? "A"
          : finalScore >= 70
            ? "B"
            : finalScore >= 60
              ? "C"
              : finalScore >= 50
                ? "D"
                : "F";

    // Construct raw object, then force cast to bypass structural typing mismatches
    const rawScanResult = {
      roleTitle: role,
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

    // 9. Persistence & Shareable Token Generation
    const token = await saveResult(scanResult);

    // 10. Async Telemetry (Fire & Forget)
    logScanMetrics({
      score: finalScore,
      grade,
      roleSlug: role.toLowerCase().replace(/\s+/g, "-"),
      processingTimeMs: Date.now() - startTime,
      missingKeywordCount: aiData.missingKeywords?.length || 0,
      hasFormattingIssues,
    }).catch(() => {});

    return NextResponse.json({ token, result: scanResult });
  } catch (error: any) {
    console.error("[API] Scan Route Error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "An unexpected error occurred while analyzing the document.",
      },
      { status: 500 },
    );
  }
}
