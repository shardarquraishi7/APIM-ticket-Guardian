# DEP UI Improvements

This document describes the improvements made to the DEP questionnaire UI to enhance the user experience.

## Changes Made

1. **Enhanced Question Display**
   - Questions now display with proper formatting and visual hierarchy
   - Context/explanation information is shown in a highlighted box
   - Options are displayed as a bulleted list for better readability
   - Cluster information is displayed in a subtle background

2. **Component Updates**
   - Updated `dep-question-message.tsx` to properly parse and display the `fullPrompt` prop
   - Added styling to differentiate between question text, context, and options
   - Improved visual hierarchy with proper headings and spacing

3. **API Updates**
   - Modified `analyze` and `answer` APIs to include context information with each question
   - Context is pulled from the `explanation` field in the questions.ts file

## Testing the UI

A test script has been created to help visualize how questions will be displayed in the UI:

```bash
npx tsx src/scripts/test-dep-ui.ts
```

This script:
1. Generates sample prompts for all anchor questions
2. Creates a JSON file with these prompts at `src/sample-data/ui-tests/sample-prompts.json`
3. Creates an HTML test file at `src/sample-data/ui-tests/test-ui.html`

Open the HTML file in your browser to see how the questions will be displayed in the UI. You can navigate through all the anchor questions to see how each one is formatted.

## Implementation Details

### Question Format

Each question now follows this format:

```
Question X.Y: [Question text]

[Context/Explanation box]

[Cluster information if available]

[Options list if available]
```

### Component Logic

The `dep-question-message.tsx` component now:

1. Checks if a `fullPrompt` prop is provided
2. If yes, it parses the prompt to extract:
   - The question text
   - Context/explanation information
   - Cluster information
   - Available options
3. Displays each section with appropriate styling
4. Falls back to simple ReactMarkdown rendering if no fullPrompt is provided

## Future Improvements

Potential future improvements could include:

1. Adding tooltips for additional help text
2. Implementing keyboard shortcuts for option selection
3. Adding progress indicators for multi-step questionnaires
4. Implementing a collapsible view for context information
