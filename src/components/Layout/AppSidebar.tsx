
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
    <Sidebar 
      className="border-none shadow-2xl" 
      collapsible="icon"
      variant="floating"
    >
      <SidebarHeader className="border-b border-goat-gray-700/50 p-6 group-data-[collapsible=icon]:p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="w-10 h-10 bg-gradient-goat rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-xl font-bold text-white">GOAT CRM</h2>
            <p className="text-xs text-goat-gray-400">Sistema de Gestão</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6 group-data-[collapsible=icon]:px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-goat-gray-400 uppercase text-xs font-semibold tracking-wide mb-6 group-data-[collapsible=icon]:hidden px-3">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 ${
                        isActive 
                          ? 'bg-gradient-to-r from-goat-purple to-purple-600 text-white shadow-lg shadow-goat-purple/25' 
                          : 'text-goat-gray-300 hover:bg-goat-gray-800/50 hover:text-white'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-4 w-full group-data-[collapsible=icon]:justify-center">
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-goat-gray-400 group-hover:text-white'}`} />
                        <span className={`font-medium group-data-[collapsible=icon]:hidden ${isActive ? 'text-white' : 'text-goat-gray-300 group-hover:text-white'}`}>
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

      <SidebarFooter className="border-t border-goat-gray-700/50 p-4 group-data-[collapsible=icon]:p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sair"
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium group-data-[collapsible=icon]:hidden">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
