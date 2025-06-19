
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
      className="border-none shadow-none bg-transparent backdrop-blur-none" 
      collapsible="icon"
      variant="floating"
    >
      <SidebarHeader className="p-0 border-none">
        <div className="flex items-center justify-center mb-4">
        </div>
      </SidebarHeader>

      <SidebarContent className="px-0 py-0 border-none bg-transparent">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="hidden">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className={`group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/25' 
                          : 'bg-black/80 text-white hover:bg-purple-600/20 hover:text-white border border-white/10'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center justify-center w-full h-full group-data-[collapsible=icon]:justify-center">
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-white'}`} />
                        <span className={`font-medium ml-4 group-data-[collapsible=icon]:hidden ${isActive ? 'text-white' : 'text-white'}`}>
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

      <SidebarFooter className="p-0 border-none bg-transparent">
        <SidebarMenu className="space-y-4">
          <SidebarMenuItem>
            <SidebarTrigger className="flex items-center justify-center w-12 h-12 rounded-2xl bg-black/80 text-white hover:bg-purple-600/20 hover:text-white border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12" />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Sair"
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600/90 text-white hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:h-12"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium ml-4 group-data-[collapsible=icon]:hidden">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
