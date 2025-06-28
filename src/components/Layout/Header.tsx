
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Settings, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="border-b border-goat-gray-700/30 bg-goat-gray-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <SidebarTrigger className="text-goat-gray-400 hover:text-white hover:bg-goat-gray-800 rounded-lg p-2 transition-all duration-200" />
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-goat-gray-500" />
            <Input 
              placeholder="Buscar clientes, leads..." 
              className="pl-12 pr-4 py-2 w-96 bg-goat-gray-800/50 border-goat-gray-600/50 text-white placeholder:text-goat-gray-500 rounded-xl focus:border-goat-purple focus:ring-1 focus:ring-goat-purple/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="default"
            className="relative text-goat-gray-400 hover:text-white hover:bg-goat-gray-800 rounded-xl transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-goat-gray-900"></div>
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="default"
            className="text-goat-gray-400 hover:text-white hover:bg-goat-gray-800 rounded-xl transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-goat-gray-700">
            <div className="text-right">
              <p className="text-sm font-medium text-white">Administrador</p>
              <p className="text-xs text-goat-gray-400">admin@goat.com</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-goat rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">A</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-goat-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
