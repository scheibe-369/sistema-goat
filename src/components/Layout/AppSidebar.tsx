import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, Kanban, FileText, DollarSign, MessageSquare, Users, LogOut, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Kanban", url: "/leads", icon: Kanban },
  { title: "Contratos", url: "/contracts", icon: FileText },
  { title: "Financeiro", url: "/financial", icon: DollarSign },
  { title: "Conversas", url: "/conversations", icon: MessageSquare },
  { title: "Clientes", url: "/clients", icon: Users },
];

export function AppSidebar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (state: string) => {
    setIsExpanded(state === "offcanvas");
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative">
      <style jsx>{`
        [data-sidebar="sidebar"] {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        [data-sidebar="sidebar"][data-state="expanded"] {
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 16px !important;
          margin: 8px !important;
        }
        /* Remover estilo amarelo dos tooltips */
        [data-tooltip] {
          background-color: transparent !important;
          color: white !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>

      <Sidebar
        className="!border-none !bg-transparent !backdrop-blur-none !shadow-none"
        collapsible="icon"
        variant="floating"
        onToggle={(state) => handleToggle(state)}
      >
        <SidebarHeader className="p-0 border-none bg-transparent" />

        <SidebarContent className="px-0 py-0 border-none bg-transparent backdrop-blur-none group-data-[collapsible=icon]:py-4">
          <SidebarGroup className="p-0 bg-transparent">
            <SidebarGroupLabel className="hidden group-data-[collapsible=offcanvas]:block px-4 py-2 text-white/60 font-medium">
              Módulos
            </SidebarGroupLabel>

            <SidebarGroupContent className="bg-transparent">
              <SidebarMenu className="space-y-4 flex flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=offcanvas]:items-start group-data-[collapsible=offcanvas]:px-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title} className="w-fit group-data-[collapsible=offcanvas]:w-full">
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`flex items-center transition-all duration-300 shadow-lg hover:shadow-xl border-none
                          group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:rounded-full
                          group-data-[collapsible=offcanvas]:justify-start group-data-[collapsible=offcanvas]:w-full group-data-[collapsible=offcanvas]:h-11 group-data-[collapsible=offcanvas]:rounded-lg group-data-[collapsible=offcanvas]:px-3
                          ${
                            isActive
                              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/25"
                              : "bg-black/90 text-white hover:bg-purple-600/20 hover:text-white group-data-[collapsible=icon]:hover:scale-105"
                          }`}
                      >
                        <Link to={item.url} className="flex items-center justify-center w-full h-full group-data-[collapsible=offcanvas]:justify-start">
                          <item.icon className="w-5 h-5 text-white group-data-[collapsible=offcanvas]:mr-3 flex-shrink-0" />
                          <span className="font-medium group-data-[collapsible=icon]:hidden group-data-[collapsible=offcanvas]:block text-white">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-0 border-none bg-transparent group-data-[collapsible=icon]:py-4">
          <SidebarMenu className="space-y-4 flex flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=offcanvas]:items-start group-data-[collapsible=offcanvas]:px-2">

            {/* Botão de Expandir/Reduzir */}
            <SidebarMenuItem className="w-fit group-data-[collapsible=offcanvas]:w-full">
              <SidebarMenuButton
                tooltip={isExpanded ? "Reduzir" : "Expandir"}
                onClick={toggleSidebar}
                className={`flex items-center transition-all duration-300 shadow-lg hover:shadow-xl border-none bg-black/90 text-white hover:bg-purple-600/20 hover:text-white
                  group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:hover:scale-105
                  group-data-[collapsible=offcanvas]:justify-start group-data-[collapsible=offcanvas]:w-full group-data-[collapsible=offcanvas]:h-11 group-data-[collapsible=offcanvas]:rounded-lg group-data-[collapsible=offcanvas]:px-3`}
              >
                <Menu className="w-5 h-5 text-white group-data-[collapsible=offcanvas]:mr-3 flex-shrink-0" />
                <span className="font-medium group-data-[collapsible=icon]:hidden group-data-[collapsible=offcanvas]:block text-white">
                  Reduzir
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Botão de Sair */}
            <SidebarMenuItem className="w-fit group-data-[collapsible=offcanvas]:w-full">
              <SidebarMenuButton
                tooltip="Sair"
                className={`flex items-center transition-all duration-300 shadow-lg hover:shadow-xl border-none bg-red-600/90 text-white hover:bg-red-700
                  group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:hover:scale-105
                  group-data-[collapsible=offcanvas]:justify-start group-data-[collapsible=offcanvas]:w-full group-data-[collapsible=offcanvas]:h-11 group-data-[collapsible=offcanvas]:rounded-lg group-data-[collapsible=offcanvas]:px-3`}
              >
                <LogOut className="w-5 h-5 text-white group-data-[collapsible=offcanvas]:mr-3 flex-shrink-0" />
                <span className="font-medium group-data-[collapsible=icon]:hidden group-data-[collapsible=offcanvas]:block text-white">
                  Sair
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
