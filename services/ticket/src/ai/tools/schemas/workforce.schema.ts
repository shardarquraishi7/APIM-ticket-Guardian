import { z } from 'zod';

export const workforceSchema = z.object({
  fields: z.object({
    project: z.object({
      key: z.string(),
    }),
    summary: z.string().default(''),
    description: z.string().default(''),
    issuetype: z.object({
      name: z.literal('Task'),
    }),
  }),
});

export type WorkforceSchema = z.infer<typeof workforceSchema>;

export const workforceFormSchema = z.object({
  submitter: z.string(),
  email: z.string(),
  description: z.string(),
  typeOfRequest: z.enum(['New Feature', 'Enhancement', 'General Inquiries']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  category: z.enum(['Single Sign On (SSO) with SAML', 'LDAP', 'Access Now', 'Security', 'Other']),
  DEP: z.string(),
  businessImpact: z.string(),
  WBSCode: z.string(),
  additionalInfo: z.string().optional(),
  summary: z.string(),
});

export type WorkforceFormSchema = z.infer<typeof workforceFormSchema>;
