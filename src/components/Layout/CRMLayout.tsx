
import { AppSidebar } from "./AppSidebar";

interface CRMLayoutProps {
  children: React.ReactNode;
}

export function CRMLayout({ children }: CRMLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080808' }}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 w-full px-6 lg:px-10 py-6 overflow-auto" style={{ backgroundColor: '#080808' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
