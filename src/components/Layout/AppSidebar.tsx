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
      className="!border-none !bg-transparent !backdrop-blur-none !shadow-none" 
      collapsible="icon"
      variant="floating"
    >
      <SidebarHeader className="!p-0 !border-none !bg-transparent" />

      <SidebarContent className="!px-0 !py-6 !border-none !bg-transparent !backdrop-blur-none">
        <SidebarGroup className="!p-0 !bg-transparent !border-none">
          <SidebarGroupLabel className="hidden">
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent className="!bg-transparent !border-none">
            <SidebarMenu className="!space-y-6 flex flex-col items-center">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="w-fit">
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className={`!flex !items-center !justify-center !w-14 !h-14 !rounded-full !transition-all !duration-300 !shadow-lg hover:!shadow-xl !border-none !p-0 ${
                        isActive 
                          ? '!bg-gradient-to-r !from-purple-600 !to-purple-700 !text-white !shadow-purple-500/25 hover:!shadow-purple-500/40' 
                          : '!bg-black/80 !text-white hover:!bg-purple-600/20 hover:!text-white hover:!scale-110'
                      }`}
                    >
                      <Link to={item.url} className="flex items-center justify-center w-full h-full">
                        <item.icon className="w-6 h-6 text-white" />
                        <span className="font-medium ml-4 group-data-[collapsible=icon]:hidden text-white">
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

      <SidebarFooter className="!p-0 !border-none !bg-transparent">
        <SidebarMenu className="!space-y-6 flex flex-col items-center">
          <SidebarMenuItem className="w-fit">
            <SidebarTrigger className="!flex !items-center !justify-center !w-14 !h-14 !rounded-full !bg-black/80 !text-white hover:!bg-purple-600/20 hover:!text-white !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border-none hover:!scale-110" />
          </SidebarMenuItem>
          <SidebarMenuItem className="w-fit">
            <SidebarMenuButton 
              tooltip="Sair"
              className="!flex !items-center !justify-center !w-14 !h-14 !rounded-full !bg-red-600/90 !text-white hover:!bg-red-700 !transition-all !duration-300 !shadow-lg hover:!shadow-xl !border-none hover:!scale-110 !p-0"
            >
              <LogOut className="w-6 h-6 text-white" />
              <span className="font-medium ml-4 group-data-[collapsible=icon]:hidden text-white">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}