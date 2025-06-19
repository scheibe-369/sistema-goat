
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Kanban, FileText, DollarSign, MessageSquare, Users, LogOut, Bell, Search, Settings } from "lucide-react";
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
        {/* Logo and Toggle */}
        <div className="flex items-center justify-center gap-3 mb-6 group-data-[collapsible=icon]:mb-4">
          <SidebarTrigger className="text-goat-gray-400 hover:text-white hover:bg-goat-gray-800 rounded-lg p-2 transition-all duration-200" />
          <div className="w-10 h-10 bg-gradient-goat rounded-xl flex items-center justify-center shadow-lg group-data-[collapsible=icon]:mx-auto">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-xl font-bold text-white">GOAT CRM</h2>
            <p className="text-xs text-goat-gray-400">Sistema de Gestão</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 group-data-[collapsible=icon]:hidden">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goat-gray-500" />
          <Input 
            placeholder="Buscar clientes, leads..." 
            className="pl-12 pr-4 py-2 w-full bg-goat-gray-800/50 border-goat-gray-600/50 text-white placeholder:text-goat-gray-500 rounded-xl focus:border-goat-purple focus:ring-1 focus:ring-goat-purple/50 transition-all duration-200"
          />
        </div>

        {/* User Profile - Collapsed State */}
        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2 mb-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-goat rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-goat-gray-900"></div>
          </div>
        </div>

        {/* User Profile - Expanded State */}
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-3 p-4 bg-goat-gray-800/30 rounded-xl mb-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-goat rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">A</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-goat-gray-900"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Administrador</p>
              <p className="text-xs text-goat-gray-400">admin@goat.com</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2 mb-4 group-data-[collapsible=icon]:flex-col">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-goat-gray-400 hover:text-white hover:bg-goat-gray-800 rounded-xl transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-goat-gray-900"></div>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-goat-gray-400 hover:text-white hover:bg-goat-gray-800 rounded-xl transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </Button>
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
