import { AnimatedContent } from '@/components/animated-content';


export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex overflow-auto">
      <AnimatedContent>{children}</AnimatedContent>
    </div>
  );
}
