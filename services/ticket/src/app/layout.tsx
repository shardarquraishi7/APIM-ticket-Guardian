import { Toaster } from 'sonner';
import { StatusErrorIcon } from '@/components/icons/status-error';
import { StatusInfoIcon } from '@/components/icons/status-info';
import { StatusSuccessIcon } from '@/components/icons/status-success';
import { StatusWarningIcon } from '@/components/icons/status-warning';
import '../global.css';

export const metadata = {
  title: 'API Ticketing Support',
  description: 'API Ticketing Support',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          theme="system"
          duration={3000}
          icons={{
            success: <StatusSuccessIcon />,
            error: <StatusErrorIcon />,
            warning: <StatusWarningIcon />,
            info: <StatusInfoIcon />,
          }}
          toastOptions={{
            classNames: {
              toast: 'bg-white dark:bg-gray-900! border border-gray-100 dark:border-gray-800!',
              title: 'font-medium text-gray-950 dark:text-white',
              description: 'text-gray-950 dark:text-gray-400',
              closeButton: 'bg-gray-100 dark:bg-gray-900! text-gray-600 dark:text-gray-400',
            },
          }}
        />
      </body>
    </html>
  );
}
