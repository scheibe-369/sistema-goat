import { AppSidebar } from "./AppSidebar";

interface CRMLayoutProps {
  children: React.ReactNode;
}

export function CRMLayout({ children }: CRMLayoutProps) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="flex min-h-screen w-full relative z-10">
        <AppSidebar />

        {/* ✅ min-w-0 aqui é CRÍTICO */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* ✅ min-w-0 aqui também ajuda */}
          <main className="flex-1 min-w-0 w-full py-6 overflow-y-auto overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto w-full pl-4 lg:pl-6 pr-6 lg:pr-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
