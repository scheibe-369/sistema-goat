import { AppSidebar } from "./AppSidebar";

interface CRMLayoutProps {
  children: React.ReactNode;
}

export function CRMLayout({ children }: CRMLayoutProps) {
  return (
    <div className="min-h-screen bg-[#121212] relative overflow-hidden">
      {/* Global SVG Filter for Liquid Glass Effect */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
        <defs>
          <filter id="liquid-glass-filter">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.008"
              numOctaves="2"
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                dur="80s"
                values="0.008;0.012;0.008"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="12"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

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
