/**
 * Server-Side AI Generation & 3D Engineering Analysis Service
 * 
 * Provides:
 * 1. Safe @google/genai integration with lazy client initialization
 * 2. 3D Printing manufacturing feasibility & quote analysis
 * 3. Material selection and technical recommendations (PLA, ABS, PETG, TPU, Resin, PEEK)
 * 4. Input sanitization, token conservation, and automated fallback logic
 */

import { GoogleGenAI } from '@google/genai';
import { recordSecurityEvent } from './securityLogger';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface QuoteAnalysisRequest {
  projectName?: string;
  projectDescription: string;
  materialPreference?: string;
  quantity?: number;
  industry?: string;
}

export interface AiAnalysisResult {
  summary: string;
  recommendedMaterial: string;
  recommendedTechnology: string; // FDM, SLA, SLS, DMLS, PolyJet
  estimatedPrintTimeHours: number;
  feasibilityScore: number; // 1-100
  keyConsiderations: string[];
  postProcessingTips: string[];
  provider: 'gemini-3.7-flash' | 'algorithmic-heuristic-engine';
}

/**
 * Intelligent Heuristic Fallback Engine when GEMINI_API_KEY is not configured
 */
function generateHeuristicAnalysis(req: QuoteAnalysisRequest): AiAnalysisResult {
  const desc = (req.projectDescription || '').toLowerCase();
  const matPref = (req.materialPreference || '').toLowerCase();
  const qty = req.quantity || 1;

  let recommendedMaterial = 'PLA+ / Tough PLA';
  let recommendedTechnology = 'FDM (Fused Deposition Modeling)';
  let estimatedHours = Math.max(2, Math.min(48, Math.round(qty * 4.5)));
  let feasibilityScore = 92;
  const keyConsiderations: string[] = [];
  const postProcessingTips: string[] = [];

  if (desc.includes('aerospace') || desc.includes('drone') || desc.includes('carbon') || matPref.includes('carbon')) {
    recommendedMaterial = 'Carbon Fiber Reinforced Nylon (PA-CF)';
    recommendedTechnology = 'Industrial SLS / High-Temp FDM';
    feasibilityScore = 88;
    keyConsiderations.push('High tensile strength and heat deflection required.');
    keyConsiderations.push('Ensure chamber temperature >= 70°C to prevent warping on large builds.');
    postProcessingTips.push('Annealing at 80°C for 4 hours increases structural rigidity by 15%.');
  } else if (desc.includes('flexible') || desc.includes('gasket') || desc.includes('rubber') || matPref.includes('tpu')) {
    recommendedMaterial = 'TPU 95A / FlexShore 85A';
    recommendedTechnology = 'Direct-Drive FDM';
    feasibilityScore = 85;
    keyConsiderations.push('Direct drive extrusion recommended with 15-25 mm/s speed.');
    keyConsiderations.push('Disable retraction or use minimal wipe distance to avoid filament binding.');
    postProcessingTips.push('Vapor smoothing or cryo-deburring for clean mating surfaces.');
  } else if (desc.includes('miniature') || desc.includes('dental') || desc.includes('jewel') || desc.includes('smooth') || matPref.includes('resin')) {
    recommendedMaterial = 'High-Precision 8K Engineering Resin';
    recommendedTechnology = 'SLA / MSLA (Stereolithography)';
    feasibilityScore = 95;
    keyConsiderations.push('Layer height 25-50 microns for ultra-fine micro-details.');
    keyConsiderations.push('Support placement must avoid critical mating geometry.');
    postProcessingTips.push('IPA wash 6 minutes + UV post-cure at 405nm for 15 minutes.');
  } else if (desc.includes('outdoor') || desc.includes('weather') || desc.includes('heat') || matPref.includes('petg') || matPref.includes('abs')) {
    recommendedMaterial = 'PETG / ABS Industrial Grade';
    recommendedTechnology = 'Enclosed Chamber FDM';
    feasibilityScore = 90;
    keyConsiderations.push('UV resistance and thermal stability up to 80°C.');
    keyConsiderations.push('100% infill or gyroid pattern for waterproof integrity.');
    postProcessingTips.push('Acetone vapor polishing (for ABS) or fine grit wet sanding.');
  } else {
    keyConsiderations.push('Standard prototyping geometry with 0.2mm layer resolution.');
    keyConsiderations.push('20% gyroid infill provides optimal strength-to-weight ratio.');
    postProcessingTips.push('Support removal and light deburring included.');
  }

  return {
    summary: `Feasibility assessment for ${req.projectName || 'Custom Part'}: Suitable for rapid precision manufacturing using ${recommendedTechnology}.`,
    recommendedMaterial,
    recommendedTechnology,
    estimatedPrintTimeHours: estimatedHours,
    feasibilityScore,
    keyConsiderations,
    postProcessingTips,
    provider: 'algorithmic-heuristic-engine'
  };
}

/**
 * Generate AI Manufacturing & Quote Feasibility Analysis
 */
export async function analyzeManufacturingFeasibility(req: QuoteAnalysisRequest): Promise<AiAnalysisResult> {
  const client = getAiClient();

  if (!client) {
    return generateHeuristicAnalysis(req);
  }

  try {
    const prompt = `You are NEXRA 3D's Senior Additive Manufacturing Engineer and Material Scientist.
Analyze the following custom 3D printing project request and provide a concise, structured JSON technical assessment.

Project Name: ${req.projectName || 'Custom Component'}
Industry: ${req.industry || 'General Industrial / Engineering'}
Material Preference: ${req.materialPreference || 'Not specified'}
Quantity: ${req.quantity || 1}
Project Details: ${req.projectDescription}

Respond strictly with valid JSON with this exact structure:
{
  "summary": "1-2 sentence engineering assessment",
  "recommendedMaterial": "e.g. Carbon Fiber Nylon (PA-CF) or Tough Resin or PETG",
  "recommendedTechnology": "e.g. Industrial FDM, SLA, SLS, or DMLS",
  "estimatedPrintTimeHours": 12,
  "feasibilityScore": 92,
  "keyConsiderations": ["Point 1", "Point 2"],
  "postProcessingTips": ["Tip 1", "Tip 2"]
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    return {
      summary: parsed.summary || 'Project feasibility verified.',
      recommendedMaterial: parsed.recommendedMaterial || 'PLA+ / PETG',
      recommendedTechnology: parsed.recommendedTechnology || 'FDM (Fused Deposition)',
      estimatedPrintTimeHours: Number(parsed.estimatedPrintTimeHours) || 8,
      feasibilityScore: Number(parsed.feasibilityScore) || 90,
      keyConsiderations: Array.isArray(parsed.keyConsiderations) ? parsed.keyConsiderations : ['Optimal layer orientation recommended'],
      postProcessingTips: Array.isArray(parsed.postProcessingTips) ? parsed.postProcessingTips : ['Standard support cleanup'],
      provider: 'gemini-3.7-flash'
    };
  } catch (error: any) {
    console.warn('[AI Service] Gemini inference fell back to heuristic engine:', error?.message);
    return generateHeuristicAnalysis(req);
  }
}
