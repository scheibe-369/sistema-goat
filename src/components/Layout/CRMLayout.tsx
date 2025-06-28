
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface CRMLayoutProps {
  children: React.ReactNode;
}

export function CRMLayout({ children }: CRMLayoutProps) {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#080808' }}>
      <SidebarProvider defaultOpen={false} open={false}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden" style={{ backgroundColor: '#080808' }}>
              <div className="w-full max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
