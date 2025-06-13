import fs from 'fs';
import path from 'path';

// Define paths
const OUTPUT_DIRECTORY = path.join(process.cwd(), 'src', 'knowledge-base');

// Sample content for each category
const SAMPLE_CONTENT = {
  'dep-process': [
    {
      title: 'DEP Process Overview',
      content: `# DEP Process Overview

The Data Enablement Plan (DEP) process is a structured approach to managing data initiatives at TELUS. It ensures that data is handled securely, ethically, and in compliance with regulations.

## Key Steps in the DEP Process

1. **Initiation**: The Data Steward initiates a DEP in OneTrust.
2. **Questionnaire Completion**: The Data Steward completes the DEP questionnaire.
3. **Risk Assessment**: Potential risks are identified and assessed.
4. **Review & Approval**: The Director reviews and approves the DEP.
5. **Implementation**: Tasks are completed to address identified risks.
6. **Closure**: The DEP is closed once all tasks are completed.

## Roles and Responsibilities

- **Data Steward**: Responsible for initiating and completing the DEP.
- **Director**: Reviews and approves the DEP.
- **DEP Deputy**: Assists the Data Steward in completing the DEP.
- **Team Member**: Provides input and completes assigned tasks.`
    },
    {
      title: 'DEP Questionnaire Guide',
      content: `# DEP Questionnaire Guide

The DEP questionnaire is a comprehensive set of questions designed to gather information about your data initiative. This guide will help you understand the purpose of each section and how to complete it effectively.

## Questionnaire Sections

1. **Project Information**: Basic details about your project, including name, description, and timeline.
2. **Data Scope**: Information about the types of data involved in your initiative.
3. **Personal Information**: Questions about personal information collection, use, and disclosure.
4. **Data Classification**: Determining the sensitivity level of your data.
5. **Third-Party Involvement**: Information about third-party vendors or partners.
6. **AI & Machine Learning**: Questions specific to AI/ML initiatives.

## Tips for Completion

- Be thorough and accurate in your responses.
- Consult with subject matter experts when needed.
- Provide detailed explanations for high-risk areas.
- Attach relevant documentation to support your answers.`
    }
  ],
  'risk-assessment': [
    {
      title: 'Risk Assessment Framework',
      content: `# Risk Assessment Framework

The DEP risk assessment framework helps identify, evaluate, and mitigate potential risks associated with data initiatives.

## Risk Assessment Process

1. **Risk Identification**: Identify potential risks across various categories (privacy, security, compliance, etc.).
2. **Inherent Risk Assessment**: Evaluate the level of risk without any controls in place.
3. **Control Identification**: Identify existing controls that mitigate the identified risks.
4. **Residual Risk Assessment**: Evaluate the level of risk after considering existing controls.
5. **Risk Response**: Determine how to address residual risks (accept, mitigate, avoid, transfer).
6. **Task Creation**: Create tasks to implement additional controls for risks that need mitigation.

## Risk Categories

- **Privacy Risks**: Risks related to personal information handling.
- **Security Risks**: Risks related to data security and protection.
- **Compliance Risks**: Risks related to regulatory compliance.
- **Operational Risks**: Risks related to business operations.
- **Reputational Risks**: Risks that could impact TELUS's reputation.`
    },
    {
      title: 'Common DEP Risks and Mitigations',
      content: `# Common DEP Risks and Mitigations

This document outlines common risks identified in DEPs and recommended mitigation strategies.

## Privacy Risks

1. **Unauthorized Access to Personal Information**
   - Mitigation: Implement access controls, encryption, and regular access reviews.

2. **Excessive Collection of Personal Information**
   - Mitigation: Apply data minimization principles, collect only what's necessary.

3. **Inadequate Consent Mechanisms**
   - Mitigation: Implement clear consent processes with opt-in/opt-out options.

## Security Risks

1. **Data Breaches**
   - Mitigation: Implement encryption, access controls, and security monitoring.

2. **Insecure Data Storage**
   - Mitigation: Use secure storage solutions with appropriate controls.

3. **Inadequate Authentication**
   - Mitigation: Implement multi-factor authentication and strong password policies.

## Compliance Risks

1. **Regulatory Non-Compliance**
   - Mitigation: Regular compliance reviews and updates to processes.

2. **Inadequate Data Retention Practices**
   - Mitigation: Implement data retention policies and automated deletion.

3. **Cross-Border Data Transfers**
   - Mitigation: Ensure appropriate agreements and controls are in place.`
    }
  ],
  'roles': [
    {
      title: 'Data Steward Role',
      content: `# Data Steward Role

The Data Steward plays a critical role in the DEP process, serving as the primary owner and driver of the assessment.

## Responsibilities

1. **Initiate DEP**: Create and launch the DEP in OneTrust.
2. **Complete Questionnaire**: Provide accurate and complete information about the data initiative.
3. **Identify Risks**: Work with SMEs to identify potential risks.
4. **Create Tasks**: Create and assign tasks to address identified risks.
5. **Monitor Implementation**: Track task completion and ensure risks are mitigated.
6. **Close DEP**: Close the DEP once all tasks are completed.

## Skills and Knowledge

- Understanding of data privacy and security principles
- Familiarity with TELUS data governance policies
- Knowledge of the business context for the data initiative
- Ability to collaborate with various stakeholders

## Best Practices

- Engage stakeholders early in the process
- Maintain clear documentation of decisions and rationale
- Regularly review and update the DEP as the initiative evolves
- Leverage SME expertise for complex questions`
    },
    {
      title: 'Director Role in DEP',
      content: `# Director Role in DEP

Directors play a crucial oversight role in the DEP process, providing approval and ensuring alignment with business objectives.

## Responsibilities

1. **Review DEP**: Review the completed DEP for accuracy and completeness.
2. **Assess Risks**: Evaluate identified risks and proposed mitigations.
3. **Approve/Reject**: Make the final decision to approve or reject the DEP.
4. **Oversee Implementation**: Ensure resources are available for risk mitigation.
5. **Accountability**: Take accountability for the data initiative's compliance.

## Decision-Making Criteria

- Alignment with business strategy and objectives
- Acceptable level of residual risk
- Adequacy of proposed controls and mitigations
- Resource availability for implementation
- Compliance with TELUS policies and regulations

## Best Practices

- Ask probing questions to ensure thorough risk assessment
- Consider both short-term and long-term implications
- Balance risk mitigation with business value
- Document rationale for approval decisions
- Follow up on implementation progress`
    }
  ]
};

/**
 * Create sample markdown files for the knowledge base
 */
async function createSampleKnowledgeBase() {
  try {
    console.log('Creating sample knowledge base content...');
    
    // Create each category directory if it doesn't exist
    for (const [category, samples] of Object.entries(SAMPLE_CONTENT)) {
      const categoryDir = path.join(OUTPUT_DIRECTORY, category);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
        console.log(`Created directory: ${category}`);
      }
      
      // Create sample files
      for (const sample of samples) {
        const fileName = `${sample.title.toLowerCase().replace(/\s+/g, '-')}.md`;
        const filePath = path.join(categoryDir, fileName);
        
        // Create markdown content with metadata
        const markdownContent = `---
source: sample-${category}
title: ${sample.title}
---

${sample.content}`;
        
        // Write the file
        fs.writeFileSync(filePath, markdownContent);
        console.log(`Created sample file: ${category}/${fileName}`);
      }
    }
    
    console.log('Successfully created sample knowledge base content');
  } catch (error) {
    console.error('Error creating sample knowledge base:', error);
  }
}

// Run the script
createSampleKnowledgeBase();
