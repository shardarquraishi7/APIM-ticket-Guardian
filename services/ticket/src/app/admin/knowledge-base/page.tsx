import { KnowledgeBaseStatus } from '@/components/knowledge-base-status';

export const metadata = {
  title: 'Knowledge Base Management - DEP Guardian',
  description: 'Manage the DEP Guardian knowledge base',
};

export default function KnowledgeBasePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Knowledge Base Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <KnowledgeBaseStatus className="h-full" />
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">Knowledge Base Structure</h3>
          
          <div className="flex flex-col gap-4">
            <div className="text-sm">
              <p className="font-medium">DEP Process</p>
              <p className="text-gray-500">
                Information about the DEP process, including the overall workflow, 
                questionnaire, and key steps.
              </p>
            </div>
            
            <div className="text-sm">
              <p className="font-medium">Risk Assessment</p>
              <p className="text-gray-500">
                Information about risk assessment, including frameworks, common risks, 
                and mitigation strategies.
              </p>
            </div>
            
            <div className="text-sm">
              <p className="font-medium">Roles</p>
              <p className="text-gray-500">
                Information about the roles involved in the DEP process, including 
                Data Stewards, Directors, DEP Deputies, and Team Members.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">How to Update the Knowledge Base</h3>
        
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>
            <strong>Add PDF Documents:</strong> Place PDF files in the 
            <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded">src/knowledge-base/pdfs</code> 
            directory.
          </li>
          <li>
            <strong>Process PDFs:</strong> Run 
            <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded">npm run kb:process</code> 
            to extract text from PDFs and create markdown files.
          </li>
          <li>
            <strong>Sync Knowledge Base:</strong> Click the "Sync Knowledge Base" button above 
            or run <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded">npm run kb:sync</code> 
            to update the vector database.
          </li>
          <li>
            <strong>Verify:</strong> Test the AI assistant by asking questions about the DEP 
            process to ensure the knowledge base is working correctly.
          </li>
        </ol>
        
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm">
          <p>
            <strong>Note:</strong> The knowledge base is used by the AI assistant to provide 
            accurate information about the DEP process. It's important to keep it up to date 
            with the latest documentation.
          </p>
        </div>
      </div>
    </div>
  );
}
