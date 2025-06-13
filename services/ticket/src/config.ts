export const JIRA = {
  baseUrl: process.env.JIRA_BASE_URL,
  workforceIdentity: {
    projectKey: process.env.WORKFORCE_IDENTITY_JIRA_PROJECT_KEY,
    email: process.env.WORKFORCE_IDENTITY_JIRA_EMAIL,
    apiToken: process.env.WORKFORCE_IDENTITY_JIRA_API_TOKEN,
    issueTypeId: '16692', // Task
  },
};
