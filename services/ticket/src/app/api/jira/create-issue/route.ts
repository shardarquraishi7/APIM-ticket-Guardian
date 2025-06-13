import { Version3Client } from 'jira.js';
import { NextRequest, NextResponse } from 'next/server';
import { workforceFormSchema } from '@/ai/tools/schemas/workforce.schema';
import { JIRA } from '@/config';
import { createLogger } from '@/lib/logger';

const logger = createLogger('jira');

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const { projectKey, ...rest } = await req.json();

  try {
    const parsedFormData = getParsedFormData(projectKey, rest);

    const client = new Version3Client({
      host: JIRA.baseUrl!,
      authentication: {
        basic: {
          email: JIRA.workforceIdentity.email!,
          apiToken: JIRA.workforceIdentity.apiToken!,
        },
      },
    });

    const project = await client.projects.getProject({
      projectIdOrKey: projectKey,
    });

    const taskType = project.issueTypes?.find((type) => type.name === 'Task');

    await client.issues.createIssue({
      fields: {
        summary: `[DEP Guardian]: ${parsedFormData.summary}`,
        description: {
          content: [
            {
              content: [
                {
                  text: getProjectDescription(projectKey, parsedFormData),
                  type: 'text',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'doc',
          version: 1,
        },
        issuetype: {
          id: taskType?.id,
          name: taskType?.name,
        },
        project: {
          key: projectKey,
        },
      },
    });

    logger.info(
      {
        projectKey,
        summary: parsedFormData.summary,
        description: parsedFormData.description,
        typeOfRequest: parsedFormData.typeOfRequest,
        priority: parsedFormData.priority,
      },
      'Successfully created JIRA issue',
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        {
          message: error.message,
          name: error.name,
          cause: error.cause,
          stack: error.stack,
        },
        'Error creating JIRA issue',
      );
    } else {
      logger.error(
        {
          error,
        },
        'Unknown JIRA API Error',
      );
    }
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

function getParsedFormData(projectKey: string, data: any) {
  switch (projectKey) {
    case 'WIR':
      return workforceFormSchema.parse(data);
    default:
      return workforceFormSchema.parse(data);
  }
}

function getProjectDescription(projectKey: string, data: any) {
  switch (projectKey) {
    case 'WIR':
      return `
        Submitter: ${data.submitter || ''}
        \n\n
        Description: ${data.description || ''}
        \n\n
        Type of Request: ${data.typeOfRequest || ''}
        \n\n
        Priority: ${data.priority || ''}
        \n\n
        Category: ${data.category || ''}
        \n\n
        DEP: ${data.DEP || ''}
        \n\n
        Business Impact: ${data.businessImpact || ''}
        \n\n
        Cost Center or WBS Code: ${data.WBSCode || ''}
        \n\n
        Additional Info: ${data.additionalInfo || ''}
        `;
    default:
      return `
        Submitter: ${data.submitter || ''}
        \n\n
        Description: ${data.description || ''}
        \n\n
        Type of Request: ${data.typeOfRequest || ''}
        \n\n
        Priority: ${data.priority || ''}
        \n\n
        Category: ${data.category || ''}
        \n\n
        DEP: ${data.DEP || ''}
        \n\n
        Business Impact: ${data.businessImpact || ''}
        \n\n
        Cost Center or WBS Code: ${data.WBSCode || ''}
        \n\n
        Additional Info: ${data.additionalInfo || ''}
        `;
  }
}
