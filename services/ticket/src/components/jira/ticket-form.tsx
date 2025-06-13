'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { WorkforceFormSchema, workforceFormSchema } from '@/ai/tools/schemas/workforce.schema';
import { Button } from '../button';
import { Input } from '../forms/input';
import { Label } from '../forms/label';
import { Select } from '../forms/select';
import { Textarea } from '../forms/textarea';

export function JiraTicketForm({ projectKey, initialData }: any) {
  const {
    handleSubmit,
    register,
    control,
    formState: { isSubmitting },
  } = useForm<WorkforceFormSchema>({
    defaultValues: initialData,
    resolver: zodResolver(workforceFormSchema),
  });

  async function onSubmit(data: WorkforceFormSchema) {
    try {
      const response = await fetch('/api/jira/create-issue', {
        method: 'POST',
        body: JSON.stringify({
          projectKey,
          submitter: initialData.submitter,
          summary: data.summary,
          email: data.email,
          typeOfRequest: data.typeOfRequest,
          category: data.category,
          description: data.description,
          priority: data.priority,
          businessImpact: data.businessImpact,
          DEP: data.DEP,
          WBSCode: data.WBSCode,
          additionalInfo: data.additionalInfo,
        }),
      });

      if (!response.ok) {
        console.error('error', response);
      }
    } catch (error) {
      console.error('error', error);
    }
  }

  return (
    <div className="rounded-lg px-6 pt-2 pb-6 bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl"
        data-testid="jira-ticket-form"
      >
        <Input type="hidden" {...register('submitter')} />
        <div className="col-span-2">
          <Label htmlFor="summary">Summary</Label>
          <Input
            {...register('summary')}
            placeholder="Summary"
            className="form-input w-full"
            data-testid="summary-input"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input {...register('email')} placeholder="Email" data-testid="email-input" />
        </div>
        <div>
          <Label htmlFor="typeOfRequest">Type of Request</Label>
          <Controller
            control={control}
            name="typeOfRequest"
            render={({ field }) => (
              <Select
                {...field}
                id="typeOfRequest"
                value={field.value}
                onChange={field.onChange}
                data-testid="type-of-request-select"
                options={[
                  { value: 'New Feature', label: 'New Feature' },
                  { value: 'Enhancement', label: 'Enhancement' },
                  { value: 'General Inquiries', label: 'General Inquiries' },
                ]}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                {...field}
                id="category"
                value={field.value}
                onChange={field.onChange}
                data-testid="category-select"
                options={[
                  {
                    value: 'Single Sign On (SSO) with SAML',
                    label: 'Single Sign On (SSO) with SAML',
                  },
                  { value: 'LDAP', label: 'LDAP' },
                  { value: 'Access Now', label: 'Access Now' },
                  { value: 'Security', label: 'Security' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            )}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            {...register('description')}
            placeholder="Description"
            data-testid="description-textarea"
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select
                {...field}
                id="priority"
                value={field.value}
                onChange={field.onChange}
                data-testid="priority-select"
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                  { value: 'Critical', label: 'Critical' },
                ]}
              />
            )}
          />
        </div>
        <div>
          <Label htmlFor="businessImpact">Business Impact</Label>
          <Input
            {...register('businessImpact')}
            placeholder="Business Impact"
            data-testid="business-impact-input"
          />
        </div>
        <div>
          <Label htmlFor="DEP">DEP</Label>
          <Input {...register('DEP')} placeholder="DEP" data-testid="dep-input" />
        </div>

        <div>
          <Label htmlFor="WBSCode">WBS Code</Label>
          <Input {...register('WBSCode')} placeholder="WBS Code" data-testid="wbs-code-input" />
        </div>
        <div className="col-span-2">
          <Label htmlFor="additionalInfo">Additional Info</Label>
          <Textarea
            {...register('additionalInfo')}
            placeholder="Additional Info"
            data-testid="additional-info-textarea"
          />
        </div>
        <div className="col-span-2 col-start-1">
          <Button type="submit" disabled={isSubmitting} data-testid="submit-button">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
