## On demand revalidation

`on-demand-revalidate` is an internal module that helps trigger the revalidation of specific pages in your WASK application. It is typically used in conjunction with server-side rendering (SSR) or static site generation (SSG) to refresh the data on selected pages without requiring a full rebuild of the entire site. This extension is applied via the deploy extensions.

For detailed instructions on usage, see [Next.js On-Demand Revalidation](https://nextjs.org/docs/pages/building-your-application/data-fetching/incremental-static-regeneration#using-on-demand-revalidation)

# Triggered manually through a GitHub Action workflow.

After deploying an app, users have the capability to manually initiate the on-demand revalidation workflow, allowing them to revalidate specific pages as needed. To do this, follow these steps:

1. Select Pages to Revalidate: Specify which pages you want to revalidate. For example, if you want to revalidate the page at `/blog/1`, include this page's URL in the input.

2. Provide App URL: Enter the URL where your app has been deployed. This is crucial for the workflow to access the deployed application.

By following these steps, you can trigger the on-demand revalidation workflow, ensuring that specific pages are revalidated as per your requirements.
