import { GoogleGenAI } from '@google/genai';

export interface AIInvestigationExplanation {
  explanation: string;
  is_ai_generated: boolean;
  model_used?: string;
  source_evidence: string[];
  recommended_steps: string[];
}

export class FixoraAIService {
  private ai: GoogleGenAI | null = null;
  private isEnabled: boolean = false;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        this.ai = new GoogleGenAI();
        this.isEnabled = true;
      } catch (err) {
        console.warn('[Fixora AI] Could not initialize Gemini client, defaulting to deterministic engine.');
        this.isEnabled = false;
      }
    }
  }

  isAIConfigured(): boolean {
    return this.isEnabled;
  }

  async explainClusterEvidence(
    clusterTitle: string,
    category: string,
    column: string,
    issueCount: number,
    evidenceSummary: string,
    sampleValues: any[]
  ): Promise<AIInvestigationExplanation> {
    if (this.isEnabled && this.ai) {
      try {
        const prompt = `You are Fixora's AI Data Reliability Investigator.
Provide a concise, evidence-grounded explanation for a data quality defect cluster.
Do not hallucinate facts. Rely ONLY on the observed parameters below:

- Cluster Title: ${clusterTitle}
- Category: ${category}
- Column Name: ${column}
- Defect Count: ${issueCount}
- Observed Evidence: ${evidenceSummary}
- Sample Values (Redacted): ${JSON.stringify(sampleValues.slice(0, 3))}

Return a strictly formatted JSON object with:
{
  "explanation": "Concise 2-sentence summary of why this occurs and technical implication",
  "recommended_steps": ["step 1", "step 2"]
}`;

        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text?.trim() || '{}';
        const parsed = JSON.parse(text);

        return {
          explanation: parsed.explanation || evidenceSummary,
          is_ai_generated: true,
          model_used: 'gemini-2.5-flash',
          source_evidence: [evidenceSummary],
          recommended_steps: parsed.recommended_steps || [
            'Preview proposed normalization diff in Repair Lab.',
            'Confirm absence of collateral impact in Blast Radius graph.',
            'Promote approved fix to immutable derived dataset version.'
          ]
        };
      } catch (err) {
        console.warn('[Fixora AI] Fallback to deterministic explanation:', err);
      }
    }

    return {
      explanation: `Deterministic Analysis: Observed ${issueCount} occurrences in column '${column}' exhibiting ${category.replace('_', ' ')}. Root-cause heuristic correlates this with multi-system ingest variance or missing input validation at registration.`,
      is_ai_generated: false,
      source_evidence: [evidenceSummary],
      recommended_steps: [
        'Review cell-level changes in Counterfactual Repair Lab.',
        'Simulate impact on downstream departmental metrics in Blast Radius tab.',
        'Approve repair to generate an immutable dataset version.'
      ]
    };
  }
}

export const fixoraAIService = new FixoraAIService();
