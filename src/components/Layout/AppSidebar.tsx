import { useState } from "react";
import { Home, Filter, FileText, DollarSign, MessageSquare, Users, LogOut } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Zona de hover na borda esquerda */}
      <div
        className="fixed inset-y-0 left-0 w-3 z-40"
        onMouseEnter={() => setOpen(true)}
      />

      {/* Barra flutuante */}
      <div
        className={`
          fixed left-4 top-4 bottom-4 z-50
          flex flex-col items-center
          bg-[#080808] rounded-3xl shadow-lg
          px-1.5 py-6
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-[180%]"}
        `}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Ícones no topo */}
        <div className="flex flex-col items-center gap-6 w-full">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                to={item.url}
                title={item.title}
                className={`
                  flex items-center justify-center
                  w-10 h-10 rounded-full
                  border border-transparent
                  transition-colors duration-300
                  ${
                    isActive
                      ? "bg-gradient-to-r from-goat-purple to-goat-purple text-white"
                      : "bg-black/90 text-white hover:bg-goat-purple/20 hover:text-white"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          })}
        </div>

        {/* Espaço flexível que empurra o botão para baixo */}
        <div className="flex-1" />

        {/* Botão de sair no rodapé da barra */}
        <button
          type="button"
          title="Sair"
          onClick={handleLogout}
          className="
            mb-2
            flex items-center justify-center
            w-10 h-10 rounded-full
            bg-red-600/90 text-white hover:bg-red-700
            border border-transparent
            transition-colors duration-300
          "
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
