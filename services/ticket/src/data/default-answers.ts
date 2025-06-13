/**
 * Default answers for all DEP questionnaire questions
 * These values are used as fallbacks when neither user input nor inference rules provide an answer
 * 
 * Organized by clusters (1-13) as specified in the DEP PDF
 */

export const defaultAnswers: Record<string, string> = {
  // Cluster 1 – Project Overview
  "1.1": "No", // Project sponsor identified?
  "1.2": "Not Applicable", // Executive summary provided?
  "1.3": "No", // Existing data flows mapped?
  "1.4": "Not Applicable", // Business units defined?
  "1.5": "No", // Security classification defined?
  "1.6": "No",
  "1.7": "Not Applicable",
  "1.8": "No",
  "1.9": "Not Applicable",
  "1.10": "No",
  "1.11": "Not Applicable",
  "1.12": "No",
  "1.13": "Not Applicable",
  "1.14": "No",
  "1.15": "Not Applicable",

  // Cluster 2 – Data Scope (non-anchor IDs)
  "2.1": "No", // Data-flow diagram attached?
  "2.2": "No", // Any AI/ML usage?
  "2.3": "No", // International/EU data in scope?
  "2.4": "No", // Quebec personal data in scope?
  "2.5": "No", // U.S. health data in scope?
  // 2.6 is an anchor question (PI in scope)
  // 2.7 is an anchor question (PHI in scope)
  "2.8": "Not Applicable", // Volume of data estimated?
  "2.9": "Not Applicable", // Data sensitivity/classification?
  "2.10": "No", // Other data categories
  "2.11": "No",
  "2.12": "No",
  "2.13": "No",
  "2.14": "No",
  "2.15": "No",
  "2.16": "No",
  "2.17": "No",
  "2.18": "No",
  "2.19": "No",
  "2.20": "No",
  "2.21": "No",
  "2.22": "No",
  "2.23": "No",
  "2.24": "No",
  "2.25": "No",
  // 2.26 is related to Quebec jurisdiction
  // 2.27 is related to data volume
  "2.28": "No", // Other regulatory flags
  "2.29": "No",
  "2.30": "No",

  // Cluster 3 – Retention
  "3.1": "Standard retention policy", // Choose retention policy
  "3.2": "3", // Retention period in years
  "3.3": "Secure deletion", // Disposition method
  "3.4": "Yes", // Does retention apply to backups?
  "3.5": "Not Applicable", // Backup retention period
  "3.6": "Not Applicable", // Other retention details
  "3.7": "Not Applicable",
  "3.8": "Not Applicable",
  "3.9": "Not Applicable",
  "3.10": "Not Applicable",
  "3.11": "Not Applicable",
  "3.12": "Not Applicable",

  // Cluster 4 – Privacy & Consent (only valid if Q2.6 PI=Yes)
  // If PI = "No", all should be "Not Applicable"
  // If PI = "Yes", use the specified defaults
  "4.1": "Yes", // Consent required?
  "4.2": "Directly from the individual", // Source of personal data
  "4.3": "Yes, express consent will be obtained", // Consent type
  "4.4": "Electronically (via application/website)", // Mechanism for consent
  "4.5": "No", // Consent retention?
  "4.6": "Not Applicable", // Any sensitive personal data?
  "4.7": "No", // Parental consent required?
  "4.8": "By contract (vendor agreement)", // Consent obtained by contract?
  "4.9": "Yes", // Remaining privacy questions
  "4.10": "Yes",
  "4.11": "Yes",
  "4.12": "Yes",
  "4.13": "Yes",
  "4.14": "Yes",
  "4.15": "Yes",
  "4.16": "Yes",
  "4.17": "Yes",
  "4.18": "Yes",
  "4.19": "Yes",
  "4.20": "Yes",

  // Cluster 5 – PHI (only valid if Q2.7 PHI=Yes)
  // If PHI = "No", all should be "Not Applicable"
  // If PHI = "Yes", use the specified defaults
  "5.1": "Yes", // Health data type
  "5.2": "Yes", // Health data category
  "5.3": "Yes", // Health data storage location
  "5.4": "Yes", // Health data retention
  "5.5": "Yes", // Health data sharing?
  "5.6": "Yes", // Health data encryption?
  "5.7": "Yes", // De-identification strategy?
  "5.8": "Yes", // International trans-border data?
  "5.9": "Yes", // Security safeguards?
  "5.10": "Yes", // Privacy impact assessment done?
  "5.11": "Yes", // Privacy officer assigned?
  "5.12": "Yes", // Incident response plan?
  "5.13": "Electronically (via application/website)", // User consent method
  "5.14": "No", // Regulatory exemption?
  "5.15": "Not Applicable", // Genetic or biometric data?
  "5.16": "Yes", // Any vulnerable populations?
  "5.17": "Yes", // Minor data?
  "5.18": "Electronically (via application/website)", // Consent mechanism
  "5.19": "No", // Parental consent for minors?
  "5.20": "Not Applicable", // Any PHI to HIPAA?
  "5.21": "Yes", // Authorized disclosures?
  "5.22": "Yes", // Privacy breach protocol?
  "5.23": "Yes", // Training requirement?
  "5.24": "Yes", // Records of disclosures?

  // Cluster 6 – Profiling & Automated Decisions
  "6.1": "No", // Profiling used?
  "6.2": "No", // Automated decisions based on profiling?
  "6.3": "Not Applicable", // Explain logic for automated decisions
  "6.4": "No", // Impact assessment done?
  "6.5": "Not Applicable", // User appeal mechanism?
  "6.6": "No", // Any user overrides?
  "6.7": "Not Applicable", // Profiling recertification period
  "6.8": "Not Applicable", // External profiling vendors?

  // Cluster 7 – AI/ML (only valid if Q7.1=Yes)
  // If Q7.1 = "No", all should be "Not Applicable"
  // If Q7.1 = "Yes", use the specified defaults
  "7.1": "Yes", // Confirm AI usage
  "7.2": "Predictive analytics (machine learning)", // Which AI/ML type?
  // 7.3 is an anchor question (Generative AI usage)
  "7.4": "Automate manual processes; Improve decision-making accuracy", // Main use case
  "7.5": "No", // Data labeling required?
  "7.6": "Humans review outcomes periodically", // Human-in-the-loop?
  "7.7": "Minimal inconvenience", // User transparency level
  "7.8": "6–12 months (annual retraining)", // Retraining frequency
  "7.9": "No direct influence, just informative", // Algorithmic bias mitigations
  "7.10": "Not Applicable", // Other ML sub-questions
  "7.11": "Not Applicable",
  "7.12": "Not Applicable",
  "7.13": "Not Applicable",
  "7.14": "Not Applicable",
  // If Q7.3 = "No", 7.15-7.22 should be "Not Applicable"
  // If Q7.3 = "Yes", 7.15-7.22 should be "Yes"
  "7.15": "Yes", // GenAI questions
  "7.16": "Yes",
  "7.17": "Yes",
  "7.18": "Yes",
  "7.19": "Yes",
  "7.20": "Yes",
  "7.21": "Yes",
  "7.22": "Yes",

  // Cluster 8 – Security Controls
  "8.1": "High controls (Tier 1)", // Access control mechanisms
  "8.2": "Yes", // Encryption in transit
  "8.3": "Yes", // Encryption at rest
  "8.4": "Yes", // Employee training on security
  "8.5": "Tier 2 controls", // Security classification of data
  "8.6": "Not Applicable", // Incident response plan
  "8.7": "Quarterly", // Vulnerability scanning frequency
  "8.8": "Annually", // Penetration testing frequency
  "8.9": "In-house key management", // Encryption key management
  "8.10": "Not Applicable", // Third-party security audits
  "8.11": "Not Applicable", // Other security details
  "8.12": "Not Applicable",
  "8.13": "Not Applicable",
  "8.14": "Not Applicable",
  "8.15": "Not Applicable",

  // Cluster 9 – PCI & Payment Data (only valid if Q9.1 not "No")
  // If Q9.1 = "No", all should be "Not Applicable"
  // If Q9.1 = "TELUS internal payment system (Avalon/EPS)", all should be "Not Applicable"
  // If Q9.1 = other value, use the specified defaults
  "9.1": "Not applicable / No credit card data involved", // Credit card processing method
  "9.2": "Yes", // External payment processor?
  "9.3": "Yes", // PCI compliance level
  "9.4": "Yes (provided in Q2.1)", // Encryption of card data
  "9.5": "Yes", // Stored card data in scope?
  "9.6": "Not Applicable", // Cardholder data environment
  "9.7": "Level 1 PCI compliant", // Who processes payments?
  "9.8": "Yes (provided in Q2.1)", // Data flow documented?
  "9.9": "Yes", // Access control for card data
  "9.10": "Standard PCI defaults", // Penetration test schedule
  "9.11": "Standard PCI defaults", // Security monitoring for PCI
  "9.12": "Standard PCI defaults", // Payment data retention?
  "9.13": "Standard PCI defaults", // Stored data encryption
  "9.14": "Not Applicable", // Other PCI details
  "9.15": "Not Applicable",
  "9.16": "Not Applicable",
  "9.17": "Yes (provided in Q2.1)", // Third-party audit?

  // Cluster 10 – Quebec Privacy Regime (only valid if Q2.26=Yes)
  // If Q2.26 = "No", all should be "Not Applicable"
  // If Q2.26 = "Yes", use the specified defaults
  "10.1": "Yes", // Quebec Law applicability
  "10.2": "Yes", // Quebec privacy officer assigned
  "10.3": "Yes", // Quebec-specific notice requirements
  "10.4": "Yes", // Quebec data retention period
  "10.5": "Yes", // Quebec breach notification timeline
  "10.6": "Yes", // Additional Quebec obligations

  // Cluster 11 – GDPR / International Regime (only valid if EU/international data is in scope)
  // If no EU/international data, all should be "Not Applicable"
  // If EU/international data is in scope, use the specified defaults
  "11.1": "Yes", // GDPR applicability
  "11.2": "Yes", // Data transfer mechanism
  "11.3": "Not Applicable", // Lead supervisory authority
  "11.4": "Yes", // Data protection officer assigned
  "11.5": "Yes", // Records of processing activities
  "11.6": "Yes", // Risk assessment done
  "11.7": "Yes", // Consent mechanism for EU data
  "11.8": "Yes", // Right to portability
  "11.9": "Yes", // Right to erasure
  "11.10": "Yes", // Data breach notification timeline
  "11.11": "Not Applicable", // Transfer impact assessment
  "11.12": "Yes", // Standard contractual clauses used

  // Cluster 12 – HIPAA (only valid if Q12.2 LOB = U.S. health)
  // If Q12.2 ≠ "Health", all should be "Not Applicable"
  // If Q12.2 = "Health", use the specified defaults
  "12.1": "Yes", // HIPAA applicability
  "12.2": "Health", // Line of business
  "12.3": "Yes", // Privacy Rule compliance
  "12.4": "Yes", // Security Rule compliance
  "12.5": "Yes", // Required business associate agreements
  "12.6": "Yes", // Incident response for HIPAA breaches
  "12.7": "Yes", // Training for HIPAA workforce

  // Cluster 13 – Third-Party Vendors (only valid if Q13.1=Yes)
  // If Q13.1 = "No", all should be "Not Applicable"
  // If Q13.1 = "Yes", use the specified defaults
  "13.1": "No third parties", // Third-party involvement (anchor)
  "13.2": "No", // Any subcontractors?
  "13.3": "Not Applicable", // Vendor type
  "13.4": "Not Applicable", // Vendor location
  "13.5": "Yes", // Due diligence completed?
  "13.6": "Yes", // Security assessments done?
  "13.7": "Yes", // Contract in progress?
  "13.8": "Not Applicable", // Any SLA defined?
  "13.9": "In progress", // Legal review status
  "13.10": "Yes", // Ongoing monitoring?
  "13.11": "Compliant", // Compliant with policies?
  "13.12": "Yes", // Liability insurance confirmed?
  "13.13": "Yes", // Data-handling agreement signed?
  "13.14": "Yes", // Performance metrics defined?

  // Special section for regulatory regimes
  "SECTION_REGIMES": "No" // Regulatory regimes (Quebec, GDPR, HIPAA)
};

/**
 * Validate that a question has a default answer
 * @param questionId - The question ID to check
 * @returns True if the question has a default answer, false otherwise
 */
export function hasDefaultAnswer(questionId: string): boolean {
  return questionId in defaultAnswers;
}

/**
 * Get the default answer for a question
 * @param questionId - The question ID to get the default answer for
 * @returns The default answer, or "Not Applicable" if not found
 */
export function getDefaultAnswer(questionId: string): string {
  if (hasDefaultAnswer(questionId)) {
    return defaultAnswers[questionId];
  }
  
  console.warn(`No default answer found for question ${questionId}, using "Not Applicable"`);
  return "Not Applicable";
}
