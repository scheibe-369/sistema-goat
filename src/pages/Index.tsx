import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  MessageSquare, 
  FileText, 
  CircleDollarSign,
  Bot,
  LogOut
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const MENU_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    description: 'Métricas gerais e saúde financeira',
    icon: LayoutDashboard,
    color: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
    delay: 0.1
  },
  {
    path: '/clients',
    label: 'Clientes',
    description: 'Gestão da base de clientes',
    icon: Users,
    color: 'from-green-500/20 to-green-600/5',
    iconColor: 'text-green-400',
    borderColor: 'border-green-500/20',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]',
    delay: 0.2
  },
  {
    path: '/leads',
    label: 'Pipeline',
    description: 'Kanban e CRM de Vendas',
    icon: KanbanSquare,
    color: 'from-orange-500/20 to-orange-600/5',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/20',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]',
    delay: 0.3
  },
  {
    path: '/conversations',
    label: 'Conversas',
    description: 'Atendimentos do WhatsApp',
    icon: MessageSquare,
    color: 'from-teal-500/20 to-teal-600/5',
    iconColor: 'text-teal-400',
    borderColor: 'border-teal-500/20',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(20,184,166,0.3)]',
    delay: 0.4
  },
  {
    path: '/contracts',
    label: 'Contratos',
    description: 'Gerenciamento de assinaturas',
    icon: FileText,
    color: 'from-red-500/20 to-red-600/5',
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/20',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]',
    delay: 0.5
  },
  {
    path: '/financial',
    label: 'Financeiro',
    description: 'Receitas, despesas e fluxo',
    icon: CircleDollarSign,
    color: 'from-yellow-500/20 to-yellow-600/5',
    iconColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/20',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]',
    delay: 0.6
  },
  {
    path: '/sdr-agent',
    label: 'S.D.R Agent',
    description: 'IA de prospecção e vendas',
    icon: Bot,
    color: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    glowColor: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    delay: 0.7
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Mostrar loading limpo enquanto verifica
  if (isLoading || (!isLoading && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-goat-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-goat-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userName = 'Helio Monteiro';

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background Animado Aurora */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full flex justify-between items-center mb-16"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                <span className="text-white font-bold text-lg">G</span>
             </div>
             <span className="text-white font-semibold text-xl tracking-tight">GOAT CRM</span>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08] transition-all hover:border-white/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </motion.div>

        {/* Welcome Section */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-white/70 text-sm font-medium mb-2 backdrop-blur-md"
          >
            Seu espaço de trabalho inteligente
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 tracking-tight"
          >
            {greeting}, <span className="capitalize">{userName}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Selecione um módulo abaixo para iniciar suas atividades ou explorar o fluxo operacional do CRM.
          </motion.p>
        </div>

        {/* Grid de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {MENU_ITEMS.map((item) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: item.delay }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className={`group relative cursor-pointer bg-white/[0.02] backdrop-blur-xl border border-white/5 hover:${item.borderColor} rounded-2xl p-6 transition-all duration-300 ${item.glowColor}`}
            >
              {/* Efeito de destaque interno no Hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${item.color} rounded-2xl transition-all duration-500 pointer-events-none`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-14 h-14 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-7 h-7 ${item.iconColor}`} strokeWidth={1.5} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">
                  {item.label}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed flex-grow group-hover:text-white/60 transition-colors">
                  {item.description}
                </p>

                <div className="mt-6 flex items-center text-xs font-semibold uppercase tracking-wider text-white/30 group-hover:text-white/70 transition-colors">
                  Acessar Módulo
                  <motion.span
                    className="ml-2"
                    initial={{ x: 0, opacity: 0 }}
                    whileHover={{ x: 4, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    →
                  </motion.span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 text-center"
        >
           <p className="text-white/20 text-xs font-medium tracking-widest uppercase">
             Powered by Growth Hub AI Ecosystem
           </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
