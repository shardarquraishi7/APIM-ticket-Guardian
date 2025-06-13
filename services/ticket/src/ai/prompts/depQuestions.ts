// depQuestions.ts
// This file contains the question bank and option bank for the DEP questionnaire
// Generated from DEP.xlsx

export const questionBank: Record<string, string> = {
  "1.1": "Please describe the scope and objectives of this initiative.",
  "1.2": "Who is the sponsoring Director for this project?",
  "1.3": "What is the expected launch date for this initiative?",
  "1.5": "Please provide a brief description of the data flow for this initiative.",
  "1.6": "What business unit is responsible for this initiative?",
  "2.2": "What type of initiative is this?",
  "2.6": "Does this initiative involve the collection, use, or disclosure of personal information?",
  "2.7": "Does this initiative involve the collection, use, or disclosure of personal health information?",
  "2.8": "Please describe what personal information is being collected, used, or disclosed.",
  "2.9": "Does this initiative involve the collection, use, or disclosure of customer data?",
  "2.10": "Does this initiative involve the collection, use, or disclosure of employee data?",
  "5.1": "What type of personal health information is being collected?",
  "5.2": "What is the purpose for collecting personal health information?",
  "5.3": "Has consent been obtained for the collection, use, or disclosure of personal health information?",
  "6.1": "What type of employee data is being collected?",
  "6.2": "What is the purpose for collecting employee data?",
  "13.1": "What is the name of the third party?",
  "13.2": "What services does the third party provide?",
  "13.3": "Where is the third party located?",
  "13.4": "Where will the data be stored?",
  "13.5": "Has a security assessment been completed for this third party?",
  "13.6": "Has a privacy assessment been completed for this third party?",
  "13.7": "Is there a contract in place with this third party?",
  "13.8": "Does the contract include data protection clauses?",
  "13.9": "Does the contract include security requirements?",
  "13.10": "Does the contract include privacy requirements?",
  "13.11": "Does the contract include audit rights?",
  "13.12": "Does the contract include breach notification requirements?",
  "13.13": "Does the contract include data retention and destruction requirements?",
  "13.14": "Does the contract include subcontractor requirements?"
};

export const optionBank: Record<string, string[]> = {
  "2.2": [
    "New system or application",
    "Enhancement to existing system or application",
    "Integration with a third party",
    "Data migration",
    "Other"
  ],
  "2.6": ["Yes", "No", "Not sure"],
  "2.7": ["Yes", "No", "Not sure"],
  "2.9": ["Yes", "No", "Not sure"],
  "2.10": ["Yes", "No", "Not sure"],
  "5.1": [
    "Medical records",
    "Prescription information",
    "Lab results",
    "Health history",
    "Other"
  ],
  "5.3": ["Yes", "No", "Not applicable"],
  "6.1": [
    "Contact information",
    "Employment history",
    "Performance information",
    "Compensation information",
    "Other"
  ],
  "13.3": [
    "Canada",
    "United States",
    "European Union",
    "Asia Pacific",
    "Other"
  ],
  "13.4": [
    "Canada",
    "United States",
    "European Union",
    "Asia Pacific",
    "Other"
  ],
  "13.5": ["Yes", "No", "In progress", "Not applicable"],
  "13.6": ["Yes", "No", "In progress", "Not applicable"],
  "13.7": ["Yes", "No", "In progress", "Not applicable"],
  "13.8": ["Yes", "No", "Not applicable"],
  "13.9": ["Yes", "No", "Not applicable"],
  "13.10": ["Yes", "No", "Not applicable"],
  "13.11": ["Yes", "No", "Not applicable"],
  "13.12": ["Yes", "No", "Not applicable"],
  "13.13": ["Yes", "No", "Not applicable"],
  "13.14": ["Yes", "No", "Not applicable"]
};
