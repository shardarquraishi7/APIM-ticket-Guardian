# Fixed-Point Inference for DEP Questionnaires

This document explains how to use the fixed-point inference system to automatically fill in answers for DEP questionnaires based on a small set of anchor questions.

## Overview

The DEP (Data Ethics Process) questionnaire contains over 200 questions across 13 clusters. Rather than manually answering all questions, our system uses a fixed-point inference algorithm to:

1. Collect answers for a small set of "anchor" questions (typically 7-10 questions)
2. Use these anchor answers to infer answers for all remaining questions
3. Apply confidence scores to each inferred answer
4. Generate a fully completed DEP Excel file

## Available Scripts

### 1. Run Fixed-Point Inference Over All Clusters

The `run-fixed-point-inference-all-clusters.ts` script runs the inference algorithm over all clusters in a DEP file.

```bash
# Run with default sample file
ts-node src/scripts/run-fixed-point-inference-all-clusters.ts

# Run with a specific DEP file
ts-node src/scripts/run-fixed-point-inference-all-clusters.ts path/to/your/DEP.xlsx
```

This script:
- Takes a DEP file path as input
- Uses predefined anchor answers (which you can customize in the script)
- Runs the inference algorithm to predict answers for all questions
- Saves the updated file with a suffix `_autofill_all_clusters.xlsx`
- Provides detailed statistics on the inference results

### 2. Test DEP Autofill

The `test-dep-autofill.ts` script provides a more detailed testing framework for the inference algorithm.

```bash
# Run with default sample file
ts-node src/scripts/test-dep-autofill.ts

# Run with a specific DEP file
ts-node src/scripts/test-dep-autofill.ts path/to/your/DEP.xlsx
```

This script:
- Takes a DEP file path as input
- Uses a predefined set of anchor answers
- Runs the inference algorithm
- Provides detailed metrics on confidence levels and section coverage
- Saves the updated file with a suffix `_test_autofill.xlsx`

## Key Anchor Questions

The inference system relies on answers to these key anchor questions:

1. **2.6**: Is personal information in scope?
2. **2.7**: Is PHI in scope?
3. **13.1**: Third-party vendors
4. **9.1**: Credit-card/payment data
5. **7.1**: AI/ML usage
6. **7.3**: Generative AI usage
7. **10.2**: Quebec privacy law (regulatory regimes)
8. **4.5**: Information about minors
9. **7.15**: TELUS Generative AI Toolkit usage
10. **1.1**: Project description

## Inference Rules

The inference system uses a combination of:

1. **Direct inference**: If question A has answer X, then question B must have answer Y
2. **Cascading inference**: Chains of inference rules that propagate through related questions
3. **Default answers**: Fallback answers for questions that cannot be inferred

## Confidence Levels

Each inferred answer has an associated confidence level:

- **1.0**: User-provided anchor answers
- **0.9**: Direct "Not Applicable" inferences
- **0.7**: Regular inferred answers from cascading rules
- **0.6**: Merged multi-select answers
- **0.2**: Default answers
- **0.1**: Skipped anchors

## Customizing Anchor Answers

To customize the anchor answers used for inference, edit the `anchorAnswers` array in the script:

```typescript
const anchorAnswers: [string, string][] = [
  ['2.6', 'Yes'],
  ['2.7', 'No'],
  // Add or modify other anchor answers as needed
];
```

## Troubleshooting

If you encounter issues:

1. Check that the question IDs in your anchor answers match exactly with the IDs in the Excel file
2. Verify that the DEP file is in the expected format
3. Check the logs for any error messages
4. Ensure all dependencies are installed (`npm install`)

## Further Development

To extend the inference system:

1. Add new inference rules in `src/ai/prompts/inference-rules.ts`
2. Add new default answers in `src/data/default-answers.ts`
3. Modify the confidence calculation in `src/services/xlsx/question-service.ts`
