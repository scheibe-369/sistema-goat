
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
  SidebarTrigger,
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
      className="border-none shadow-2xl bg-goat-gray-900/95 backdrop-blur-xl" 
      collapsible="icon"
      variant="floating"
    >
      <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-4 border-none">
        <div className="flex items-center justify-center gap-3 mb-6 group-data-[collapsible=icon]:mb-4">
          <SidebarTrigger className="text-goat-gray-400 hover:text-white hover:bg-goat-gray-800 rounded-lg p-2 transition-all duration-200" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-0 group-data-[collapsible=icon]:px-2 border-none">
        <SidebarGroup>
          <SidebarGroupLabel className="text-goat-gray-400 uppercase text-xs font-semibold tracking-wide mb-4 group-data-[collapsible=icon]:hidden px-3">
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
                      className={`group relative flex items-center justify-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3 ${
                        isActive 
                          ? 'bg-gradient-to-r from-goat-purple to-purple-600 text-white shadow-lg shadow-goat-purple/25' 
                          : 'text-goat-gray-300 hover:bg-goat-gray-800/50 hover:text-white'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center justify-center gap-4 w-full group-data-[collapsible=icon]:justify-center">
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

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-3 border-none">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sair"
              className="flex items-center justify-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-3"
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
