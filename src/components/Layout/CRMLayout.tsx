import { AppSidebar } from "./AppSidebar";

interface CRMLayoutProps {
  children: React.ReactNode;
}

export function CRMLayout({ children }: CRMLayoutProps) {
  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        {/* ✅ min-w-0 aqui é CRÍTICO */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* ✅ min-w-0 aqui também ajuda */}
          <main className="flex-1 min-w-0 w-full px-6 lg:px-10 py-6 overflow-y-auto overflow-x-hidden bg-[#080808]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
