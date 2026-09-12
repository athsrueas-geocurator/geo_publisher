import { z } from "zod";

export const evidenceStrengthSchema = z.enum([
  "strong-causal",
  "promising-causal-quasi",
  "mixed-conditional",
  "limited-descriptive",
  "not-outcome-intervention"
]);

export const researchDesignSchema = z.enum([
  "RCT",
  "Lottery",
  "Regression discontinuity",
  "Difference-in-differences",
  "Event study",
  "Matched comparison",
  "Meta-analysis",
  "Systematic review",
  "Descriptive"
]);

export const continuumSchema = z.object({
  leftPole: z.string(),
  rightPole: z.string(),
  position: z.number().min(0).max(100),
  uncertaintyLow: z.number().min(0).max(100),
  uncertaintyHigh: z.number().min(0).max(100),
  confidence: z.enum(["high", "medium", "low"]),
  explanation: z.string()
});

export const sourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.string(),
  year: z.string(),
  method: researchDesignSchema,
  outcomeTags: z.array(z.string()),
  evidenceStrength: evidenceStrengthSchema,
  finding: z.string(),
  caveat: z.string(),
  url: z.string().url()
});

export const dichotomySchema = z.object({
  slug: z.string(),
  title: z.string(),
  dek: z.string(),
  topic: z.string(),
  philosophicalDisagreement: z.string(),
  continuum: continuumSchema,
  evidenceStrength: evidenceStrengthSchema,
  whatEvidenceSuggests: z.string(),
  betterQuestion: z.string(),
  commonMisreadings: z.array(z.string()),
  whatWouldChangeOurMind: z.string(),
  keyInitiativeSlugs: z.array(z.string()),
  sourceIds: z.array(z.string()),
  landingPriority: z.number()
});

export const initiativeSchema = z.object({
  slug: z.string(),
  id: z.number(),
  name: z.string(),
  years: z.string(),
  category: z.string(),
  theoryOfAction: z.string(),
  inputVariablesChanged: z.string(),
  targetPopulation: z.string(),
  evaluationDesigns: z.string(),
  methodTags: z.array(researchDesignSchema),
  evidenceStrength: evidenceStrengthSchema,
  outputsMeasured: z.string(),
  normalizationIssues: z.string(),
  oneLineFinding: z.string(),
  sourceIds: z.array(z.string()),
  tags: z.string(),
  relatedDichotomySlugs: z.array(z.string())
});

export const methodSchema = z.object({
  section: z.string(),
  item: z.string(),
  definition: z.string(),
  urls: z.array(z.string())
});

export const glossarySchema = z.object({
  term: z.string(),
  definition: z.string(),
  section: z.string()
});

export const landingCardSchema = z.object({
  claim: z.string(),
  caveat: z.string(),
  dichotomySlug: z.string(),
  sourceIds: z.array(z.string()),
  evidenceStrength: evidenceStrengthSchema
});

export type EvidenceStrength = z.infer<typeof evidenceStrengthSchema>;
export type ResearchDesign = z.infer<typeof researchDesignSchema>;
export type ContinuumPosition = z.infer<typeof continuumSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Dichotomy = z.infer<typeof dichotomySchema>;
export type Initiative = z.infer<typeof initiativeSchema>;
export type Method = z.infer<typeof methodSchema>;
export type GlossaryEntry = z.infer<typeof glossarySchema>;
export type LandingCard = z.infer<typeof landingCardSchema>;
