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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, Kanban, FileText, DollarSign, MessageSquare, Users, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Kanban de Leads", url: "/leads", icon: Kanban },
  { title: "Contratos", url: "/contracts", icon: FileText },
  { title: "Financeiro", url: "/financial", icon: DollarSign },
  { title: "Conversas", url: "/conversations", icon: MessageSquare },
  { title: "Clientes", url: "/clients", icon: Users },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar
      className="border-none bg-transparent shadow-none backdrop-blur-none"
      collapsible="icon"
      variant="floating"
    >
      <SidebarHeader className="p-0 border-none bg-transparent" />

      <SidebarContent className="p-0 border-none bg-transparent">
        <SidebarGroup className="p-0 bg-transparent">
          <SidebarGroupContent className="bg-transparent flex flex-col items-center space-y-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <SidebarMenuItem key={item.title} className="w-fit">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl border-none ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/25"
                        : "bg-black/80 text-white hover:bg-purple-600/30"
                    }`}
                  >
                    <Link to={item.url} className="flex items-center justify-center w-full h-full">
                      <item.icon className="w-5 h-5 text-white" />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0 border-none bg-transparent">
        <SidebarMenu className="space-y-4 flex flex-col items-center">
          <SidebarMenuItem className="w-fit">
            <SidebarTrigger className="flex items-center justify-center w-12 h-12 rounded-full bg-black/80 text-white hover:bg-purple-600/30 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 border-none" />
          </SidebarMenuItem>
          <SidebarMenuItem className="w-fit">
            <SidebarMenuButton
              tooltip="Sair"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl border-none"
            >
              <LogOut className="w-5 h-5 text-white" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
