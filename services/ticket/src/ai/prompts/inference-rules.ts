import { AnswerMap } from '@/types';
import { SKIPPED_ANSWER } from '@/constants';

/**
 * Comprehensive inference rules for DEP questionnaire
 * Based on the anchor questions and their dependencies
 */

// PI in scope (Q2.6) inference rules
export function inferFromPIScope(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if the anchor question was skipped
  if (answers["2.6"] === SKIPPED_ANSWER) {
    return result;
  }
  
  if (answers["2.6"] === "No") {
    // If PI is not in scope, all privacy questions are Not Applicable
    for (let i = 1; i <= 20; i++) {
      result[`4.${i}`] = "Not Applicable";
    }
    
    // If PI is not in scope, all PHI questions are Not Applicable
    for (let i = 1; i <= 24; i++) {
      result[`5.${i}`] = "Not Applicable";
    }
  } else if (answers["2.6"] === "Yes") {
    // If PI is in scope, set specific answers for privacy questions
    result["4.1"] = "Yes";
    result["4.2"] = "Directly from the individual";
    result["4.3"] = "Yes, express consent will be obtained";
    result["4.4"] = "Electronically (via application/website)";
    result["4.5"] = "No";
    result["4.6"] = "Not Applicable";
    result["4.7"] = "No";
    result["4.8"] = "By contract (vendor agreement)";
    
    // Set Yes for remaining privacy questions
    for (let i = 9; i <= 20; i++) {
      result[`4.${i}`] = "Yes";
    }
  }
  
  return result;
}

// PHI in scope (Q2.7) inference rules
export function inferFromPHIScope(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if the anchor question was skipped
  if (answers["2.7"] === SKIPPED_ANSWER) {
    return result;
  }
  
  if (answers["2.7"] === "No") {
    // If PHI is not in scope, all PHI questions are Not Applicable
    for (let i = 1; i <= 24; i++) {
      result[`5.${i}`] = "Not Applicable";
    }
    
    // If PHI is not in scope, HIPAA questions are Not Applicable
    for (let i = 3; i <= 7; i++) {
      result[`12.${i}`] = "Not Applicable";
    }
  } else if (answers["2.7"] === "Yes") {
    // If PHI is in scope, set specific answers for PHI questions
    for (let i = 1; i <= 5; i++) {
      result[`5.${i}`] = "Yes";
    }
    
    result["5.6"] = "Yes";
    
    for (let i = 7; i <= 17; i++) {
      result[`5.${i}`] = "Yes";
    }
    
    result["5.18"] = "Electronically (via application/website)";
    result["5.19"] = "No";
    result["5.20"] = "Not Applicable";
    
    for (let i = 21; i <= 24; i++) {
      result[`5.${i}`] = "Yes";
    }
    
    // If PHI is in scope, HIPAA questions are Yes
    for (let i = 3; i <= 7; i++) {
      result[`12.${i}`] = "Yes";
    }
  }
  
  return result;
}

// Volume & Sensitivity inference rules
export function inferFromVolumeAndSensitivity(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if either anchor question was skipped
  if (answers["2.27"] === SKIPPED_ANSWER || answers["2.9"] === SKIPPED_ANSWER) {
    return result;
  }
  
  // If volume is Large OR classification is Restricted
  if (answers["2.27"] === "Large" || answers["2.9"] === "Restricted") {
    // Set strict retention policy
    for (let i = 1; i <= 5; i++) {
      result[`3.${i}`] = "Strict retention policy";
    }
    
    // Set high controls
    for (let i = 1; i <= 10; i++) {
      result[`8.${i}`] = "High controls (Tier 1)";
    }
    
    // Raise consistency warning if PHI=No but classification=Restricted
    if (answers["2.7"] === "No" && answers["2.9"] === "Restricted") {
      // This would be handled in the UI, but we can log it here
      console.warn("Consistency warning: PHI is No but classification is Restricted");
    }
  }
  
  return result;
}

// Third-Party Involvement inference rules
export function inferFromThirdParty(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if the anchor question was skipped
  if (answers["13.1"] === SKIPPED_ANSWER) {
    return result;
  }
  
  if (answers["13.1"] === "No third parties") {
    // If no third parties, all third-party questions are Not Applicable
    for (let i = 3; i <= 14; i++) {
      result[`13.${i}`] = "Not Applicable";
    }
  } else if (answers["13.1"] === "Yes, one third party" || answers["13.1"] === "Yes, multiple third parties") {
    // If third parties are involved, set specific answers
    // Note: 13.3 would be the vendor type, which we can't infer
    result["13.5"] = "Yes";
    result["13.6"] = "Yes";
    result["13.7"] = "Yes";
    result["13.9"] = "In progress";
    result["13.10"] = "Yes";
    result["13.11"] = "Compliant";
    result["13.12"] = "Yes";
    result["13.13"] = "Yes";
    result["13.14"] = "Yes";
  }
  
  return result;
}

// AI/ML Usage inference rules
export function inferFromAIML(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if the anchor question was skipped
  if (answers["7.1"] === SKIPPED_ANSWER) {
    return result;
  }
  
  if (answers["7.1"] === "No") {
    // If no AI/ML, all AI/ML questions are Not Applicable
    for (let i = 2; i <= 22; i++) {
      result[`7.${i}`] = "Not Applicable";
    }
  } else if (answers["7.1"] === "Yes") {
    // If AI/ML is used, set specific answers
    result["7.2"] = "Predictive analytics (machine learning)";
    // 7.3 is a separate anchor question for GenAI
    result["7.4"] = "Automate manual processes; Improve decision-making accuracy";
    result["7.5"] = "No";
    result["7.6"] = "Humans review outcomes periodically";
    result["7.7"] = "Minimal inconvenience";
    result["7.8"] = "6–12 months (annual retraining)";
    result["7.9"] = "No direct influence, just informative";
    
    for (let i = 10; i <= 14; i++) {
      result[`7.${i}`] = "Not Applicable";
    }
  }
  
  return result;
}

// Generative AI inference rules
export function inferFromGenAI(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if the anchor question was skipped
  if (answers["7.3"] === SKIPPED_ANSWER) {
    return result;
  }
  
  if (answers["7.3"] === "No") {
    // If no GenAI, all GenAI questions are Not Applicable
    for (let i = 15; i <= 22; i++) {
      result[`7.${i}`] = "Not Applicable";
    }
  } else if (answers["7.3"] === "Yes") {
    // If GenAI is used, set all GenAI questions to Yes
    for (let i = 15; i <= 22; i++) {
      result[`7.${i}`] = "Yes";
    }
  }
  
  return result;
}

// Credit-Card Data inference rules
export function inferFromCreditCard(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if the anchor question was skipped
  if (answers["9.1"] === SKIPPED_ANSWER) {
    return result;
  }
  
  if (answers["9.1"] === "Not applicable / No credit card data involved") {
    // If no credit card data, all credit card questions are Not Applicable
    for (let i = 3; i <= 17; i++) {
      result[`9.${i}`] = "Not Applicable";
    }
  } else if (answers["9.1"] === "TELUS internal payment system (Avalon/EPS)") {
    // If using Avalon/EPS, all credit card questions are Not Applicable
    for (let i = 3; i <= 17; i++) {
      result[`9.${i}`] = "Not Applicable";
    }
  } else {
    // If using third-party service provider
    result["9.3"] = "Yes";
    result["9.7"] = "Level 1 PCI compliant";
    result["9.8"] = "Yes (provided in Q2.1)";
    
    // Standard PCI defaults
    for (let i = 10; i <= 13; i++) {
      result[`9.${i}`] = "Standard PCI defaults";
    }
    
    result["9.17"] = "Yes (provided in Q2.1)";
  }
  
  return result;
}

// Quebec Jurisdiction inference rules
export function inferFromQuebec(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if either anchor question was skipped
  if (answers["2.26"] === SKIPPED_ANSWER || answers["2.35"] === SKIPPED_ANSWER) {
    return result;
  }
  
  // Check if Quebec is selected (this might be in a multi-select field)
  const isQuebecSelected = 
    (typeof answers["2.26"] === "string" && answers["2.26"].includes("Quebec")) ||
    (typeof answers["2.35"] === "string" && answers["2.35"].includes("Quebec")) ||
    (Array.isArray(answers["2.26"]) && answers["2.26"].some(a => a.includes("Quebec"))) ||
    (Array.isArray(answers["2.35"]) && answers["2.35"].some(a => a.includes("Quebec")));
  
  if (isQuebecSelected) {
    // If Quebec is selected, set Quebec questions to Yes
    for (let i = 2; i <= 6; i++) {
      result[`10.${i}`] = "Yes";
    }
  } else {
    // If Quebec is not selected, set Quebec questions to Not Applicable
    for (let i = 2; i <= 6; i++) {
      result[`10.${i}`] = "Not Applicable";
    }
  }
  
  return result;
}

// GDPR/International inference rules
export function inferFromGDPR(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if the anchor question was skipped
  if (answers["SECTION_REGIMES"] === SKIPPED_ANSWER) {
    return result;
  }
  
  // Check if any EU/international data is selected
  const isEUSelected = 
    (typeof answers["SECTION_REGIMES"] === "string" && 
      (answers["SECTION_REGIMES"].includes("EU") || answers["SECTION_REGIMES"].includes("GDPR"))) ||
    (Array.isArray(answers["SECTION_REGIMES"]) && 
      answers["SECTION_REGIMES"].some(a => a.includes("EU") || a.includes("GDPR")));
  
  if (isEUSelected) {
    // If EU/international data is selected, set GDPR questions to Yes
    for (let i = 2; i <= 12; i++) {
      result[`11.${i}`] = "Yes";
    }
  } else {
    // If no EU/international data, set GDPR questions to Not Applicable
    for (let i = 2; i <= 12; i++) {
      result[`11.${i}`] = "Not Applicable";
    }
  }
  
  return result;
}

// HIPAA Applicability inference rules
export function inferFromHIPAA(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if the anchor question was skipped
  if (answers["12.2"] === SKIPPED_ANSWER) {
    return result;
  }
  
  // Check if U.S. health LOB is selected
  const isUSHealthSelected = 
    (typeof answers["12.2"] === "string" && answers["12.2"].includes("U.S. health")) ||
    (Array.isArray(answers["12.2"]) && answers["12.2"].some(a => a.includes("U.S. health")));
  
  if (isUSHealthSelected) {
    // If U.S. health LOB is selected, set HIPAA questions to Yes
    for (let i = 3; i <= 7; i++) {
      result[`12.${i}`] = "Yes";
    }
  } else {
    // If no U.S. health LOB, set HIPAA questions to Not Applicable
    for (let i = 3; i <= 7; i++) {
      result[`12.${i}`] = "Not Applicable";
    }
  }
  
  return result;
}

// Attachments & Prior Responses inference rules
export function inferFromAttachments(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Skip if the anchor question was skipped
  if (answers["2.1"] === SKIPPED_ANSWER) {
    return result;
  }
  
  // Check if Q2.1 has a diagram attached
  const hasDiagram = 
    (typeof answers["2.1"] === "string" && answers["2.1"].includes("diagram")) ||
    (Array.isArray(answers["2.1"]) && answers["2.1"].some(a => a.includes("diagram")));
  
  if (hasDiagram) {
    // If diagram is attached, set related questions
    result["9.8"] = "Yes (provided in Q2.1)";
    result["9.17"] = "Yes (provided in Q2.1)";
  }
  
  return result;
}

// Vendor Contract inference rules
export function inferFromVendorContract(answers: AnswerMap): AnswerMap {
  const result: AnswerMap = {};
  
  // Check if vendor contract is in progress
  const isContractInProgress = 
    (typeof answers["13.9"] === "string" && answers["13.9"].includes("progress"));
  
  if (isContractInProgress) {
    // If vendor contract is in progress, set contract-related question
    result["4.8"] = "By contract (vendor agreement)";
  }
  
  return result;
}

/**
 * Apply all inference rules to the given answers
 * @param answers - The current answers
 * @returns The updated answers with inferred values
 */
export function applyAllInferenceRules(answers: AnswerMap): AnswerMap {
  let result: AnswerMap = { ...answers };
  
  // Apply each inference rule function
  const inferenceRules = [
    inferFromPIScope,
    inferFromPHIScope,
    inferFromVolumeAndSensitivity,
    inferFromThirdParty,
    inferFromAIML,
    inferFromGenAI,
    inferFromCreditCard,
    inferFromQuebec,
    inferFromGDPR,
    inferFromHIPAA,
    inferFromAttachments,
    inferFromVendorContract
  ];
  
  // Apply each rule and merge the results
  for (const rule of inferenceRules) {
    const ruleResults = rule(result);
    result = { ...result, ...ruleResults };
  }
  
  return result;
}
