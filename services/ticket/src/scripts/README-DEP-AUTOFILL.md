# DEP Autofill System

This directory contains scripts for automatically filling out DEP (Data Enablement Plan) questionnaires using a fixed-point inference system.

## Overview

The DEP Autofill system uses a small set of "anchor questions" to predict answers for all 200+ questions in the DEP questionnaire. This approach significantly reduces the time required to complete a DEP, while ensuring consistency across all answers.

## Key Components

1. **Anchor Questions**: A carefully selected set of 7 key questions that drive the inference process.
2. **Inference Rules**: A set of rules that determine how answers to anchor questions affect other questions.
3. **Fixed-Point Algorithm**: An algorithm that repeatedly applies inference rules until no more changes occur.
4. **Default Answers**: Fallback answers for questions that cannot be inferred from anchor questions.

## Scripts

### 1. `run-fixed-point-inference.ts`

An interactive script that guides users through answering the 7 anchor questions, then uses those answers to predict answers for all remaining questions.

**Usage:**
```bash
npx tsx src/scripts/run-fixed-point-inference.ts [path/to/DEP.xlsx]
```

If no file path is provided, the script will use the default file at `src/sample-data/DEP.xlsx`.

**Features:**
- Interactive command-line interface
- Provides context for each anchor question
- Handles multiple-choice options
- Creates a new Excel file with all predicted answers
- Reports confidence levels and section coverage

### 2. `test-dep-autofill.ts`

A non-interactive script that uses predefined answers for anchor questions to test the inference system.

**Usage:**
```bash
npx tsx src/scripts/test-dep-autofill.ts [path/to/DEP.xlsx]
```

**Features:**
- Uses hardcoded answers for anchor questions
- Useful for testing the inference system
- Creates a new Excel file with "_test_autofill" suffix

## Anchor Questions

The system uses the following anchor questions:

1. **2.6**: Is personal information in scope?
   - Determines if Privacy & Consent sections need to be filled out

2. **2.7**: Is Personal Health Information in scope?
   - Determines if PHI-specific section and HIPAA section need to be filled out

3. **13.1**: Are third parties in scope?
   - Determines if vendor-related questions need to be filled out

4. **9.1**: How is credit card data being stored/processed/transmitted?
   - Determines if PCI section needs to be filled out

5. **7.1**: Are you building or leveraging any AI agents?
   - Determines if AI/ML section needs to be filled out

6. **7.3**: Does this initiative use Generative AI?
   - Determines if GenAI sub-questions need to be filled out

7. **SECTION_REGIMES**: Which regulatory regimes apply?
   - Determines which jurisdictional sections (Quebec, GDPR, HIPAA) must be filled out

## Inference Process

1. User answers the 7 anchor questions
2. The system applies inference rules to predict answers for related questions
3. The system applies default answers for any remaining unanswered questions
4. The system writes all answers to a new Excel file

## Confidence Levels

The system assigns confidence levels to each predicted answer:

- **High confidence (>=0.7)**: Directly inferred from anchor questions
- **Medium confidence (0.4-0.7)**: Inferred from other inferred answers
- **Low confidence (<0.4)**: Weakly inferred or using default answers
- **No confidence (0)**: Using fallback default answers

## Future Improvements

- Add support for partial DEP completion (starting with some questions already answered)
- Improve inference rules based on expert feedback
- Add a web interface for easier interaction
- Support for exporting results in different formats
