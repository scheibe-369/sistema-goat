import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, Kanban, FileText, DollarSign, MessageSquare, Users, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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

  return (
    <div className="relative">
      <style jsx>{`
        [data-sidebar="sidebar"] {
          position: fixed !important;
          top: 16px;
          left: 16px;
          border-radius: 16px !important;
          background-color: #070707 !important; /* Cor exata do fundo */
          padding-top: 12px !important;
          padding-bottom: 12px !important;
          width: auto !important;
          border: none !important;
          box-shadow: none !important; /* Remove qualquer sombra extra */
          backdrop-filter: none !important; /* Sem blur */
        }
      `}</style>

      <Sidebar
        className="!border-none !bg-transparent !backdrop-blur-none !shadow-none"
        variant="floating"
        collapsible="icon"
      >
        <SidebarHeader className="p-0 border-none bg-transparent" />

        <SidebarContent className="px-0 py-0 border-none bg-transparent backdrop-blur-none py-4">
          <SidebarGroup className="p-0 bg-transparent">
            <SidebarGroupContent className="bg-transparent">
              <SidebarMenu className="space-y-4 flex flex-col items-center">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title} className="w-fit">
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border-none
                          w-12 h-12 rounded-full hover:scale-105
                          ${
                            isActive
                              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/25"
                              : "bg-black/90 text-white hover:bg-purple-600/20 hover:text-white"
                          }`}
                      >
                        <Link to={item.url} className="flex items-center justify-center w-full h-full">
                          <item.icon className="w-5 h-5 text-white" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-0 border-none bg-transparent py-4">
          <SidebarMenu className="space-y-4 flex flex-col items-center">
            <SidebarMenuItem className="w-fit">
              <SidebarMenuButton
                tooltip="Sair"
                className={`flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border-none bg-red-600/90 text-white hover:bg-red-700
                  w-12 h-12 rounded-full hover:scale-105`}
              >
                <LogOut className="w-5 h-5 text-white" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
