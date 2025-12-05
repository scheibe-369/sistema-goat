import { useState } from "react";
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
import {
  Home,
  Filter,
  FileText,
  DollarSign,
  MessageSquare,
  Users,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Funil", url: "/leads", icon: Filter },
  { title: "Contratos", url: "/contracts", icon: FileText },
  { title: "Financeiro", url: "/financial", icon: DollarSign },
  { title: "Conversas", url: "/conversations", icon: MessageSquare },
  { title: "Clientes", url: "/clients", icon: Users },
];

export function AppSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false); // 👈 controla retrátil

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* 🔥 Zona de hover na borda esquerda */}
      <div
        className="fixed inset-y-0 left-0 w-4 z-40"
        onMouseEnter={() => setOpen(true)}
      />

      {/* Wrapper do sidebar (ele que fica entrando/saindo da tela) */}
      <div
        className={`fixed top-4 left-4 z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-[120%]"
        }`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <style>{`
          [data-sidebar="sidebar"] {
            /* AGORA não precisa mais ser fixed, o wrapper já é fixed */
            position: static !important;
            border-radius: 16px !important;
            background-color: #080808 !important;
            padding-top: 12px !important;
            padding-bottom: 12px !important;
            padding-left: 12px !important; 
            padding-right: 12px !important;
            width: auto !important;
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }

          [data-sidebar="sidebar"] a:focus,
          [data-sidebar="sidebar"] a:focus-visible {
            outline: none !important;
            box-shadow: none !important;
          }
          
          [data-sidebar="sidebar"] a {
            border-radius: 9999px !important;
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
                          className={`flex items-center justify-center transition-colors duration-300 border border-transparent
                            w-12 h-12 rounded-full
                            ${
                              isActive
                                ? "bg-gradient-to-r from-goat-purple to-goat-purple text-white"
                                : "bg-black/90 text-white hover:bg-goat-purple/20 hover:text-white"
                            }`}
                        >
                          <Link
                            to={item.url}
                            className="flex items-center justify-center w-full h-full"
                          >
                            <item.icon className="w-5 h-5" />
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
                  onClick={handleLogout}
                  tooltip="Sair"
                  className={`flex items-center justify-center transition-colors duration-300 border border-transparent bg-red-600/90 text-white hover:bg-red-700
                    w-12 h-12 rounded-full cursor-pointer`}
                >
                  <LogOut className="w-5 h-5 text-white" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  );
}
