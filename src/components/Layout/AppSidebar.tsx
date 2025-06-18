
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
import { Home, Kanban, FileText, DollarSign, MessageSquare, Users, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Kanban de Leads",
    url: "/leads",
    icon: Kanban,
  },
  {
    title: "Contratos",
    url: "/contracts",
    icon: FileText,
  },
  {
    title: "Financeiro",
    url: "/financial",
    icon: DollarSign,
  },
  {
    title: "Conversas",
    url: "/conversations",
    icon: MessageSquare,
  },
  {
    title: "Clientes",
    url: "/clients",
    icon: Users,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-goat-gray-700">
      <SidebarHeader className="border-b border-goat-gray-700 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-goat rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">GOAT CRM</h2>
            <p className="text-xs text-goat-gray-400">Sistema de Gestão</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-goat-gray-400 uppercase text-xs font-semibold tracking-wide mb-4">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-white hover:bg-goat-purple/20 ${
                        isActive 
                          ? 'bg-goat-purple/30 text-white border border-goat-purple/50' 
                          : 'hover:bg-goat-gray-800'
                      }`}
                    >
                      <Link to={item.url}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-goat-gray-700 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-red-400 hover:bg-red-900/20">
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
