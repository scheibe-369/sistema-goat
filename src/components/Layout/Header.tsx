
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="border-b border-goat-gray-700 bg-goat-gray-900/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:text-goat-purple" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goat-gray-400" />
            <Input 
              placeholder="Buscar clientes, leads..." 
              className="pl-10 w-80 bg-goat-gray-800 border-goat-gray-600 text-white placeholder:text-goat-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-goat-gray-400 hover:text-white">
            <Bell className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-goat rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">Administrador</p>
              <p className="text-goat-gray-400">admin@goat.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
