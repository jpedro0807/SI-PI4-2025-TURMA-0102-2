import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Stethoscope,
  LogOut
} from 'lucide-react';

import SidebarItem from '../SideBarItem/SideBarItem.jsx';

export default function Sidebar({ activePage = 'dashboard' }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed h-full left-0 top-0 z-10 flex flex-col">
      
      <div className="p-6 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg text-white">
          <Stethoscope size={24} />
        </div>
        <div>
          <h1 className="font-bold text-gray-800 text-lg leading-tight">Health Money</h1>
          <span className="text-xs text-gray-400 font-normal">Gestão Financeira</span>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-4">
        <ul className="space-y-1">
          <SidebarItem 
            to="/"
            icon={<LayoutDashboard size={20} />} 
            text="Dashboard" 
            active={activePage === 'dashboard'} 
          />
          <SidebarItem 
            to="/pacientes"
            icon={<Users size={20} />} 
            text="Pacientes" 
            active={activePage === '/pacientes'}
          />
          <SidebarItem 
            to="/agenda"
            icon={<Calendar size={20} />} 
            text="Agenda" 
            active={activePage === 'agenda'}
          />
          <SidebarItem 
            to="/notas"
            icon={<FileText size={20} />} 
            text="Notas Fiscais" 
            active={activePage === 'notas'}
          />
          <SidebarItem 
            to="/relatorios"
            icon={<BarChart3 size={20} />} 
            text="Relatórios" 
            active={activePage === 'relatorios'}
          />
        </ul>
      </nav>

      <div className="px-4 pb-6">
        <SidebarItem 
          to="/login"
          icon={<LogOut size={20} />} 
          text="Sair" 
          active={false}
        />
      </div>
    </aside>
  );
}