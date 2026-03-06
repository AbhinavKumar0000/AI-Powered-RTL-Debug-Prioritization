"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ListTree,
  BarChart2,
  Cpu,
  Activity,
  Settings,
  Menu,
  ChevronLeft
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log-explorer", label: "Logs", icon: ListTree },
  { href: "/playground", label: "Models", icon: Cpu },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className="bg-[#0B0F14] border-r border-[#1E2632] flex flex-col min-h-screen relative z-30"
    >
      {/* Header / Logo */}
      <div className="h-[64px] flex items-center justify-between px-5 border-b border-[#1E2632] shrink-0">
        <div className={clsx("flex items-center gap-3 overflow-hidden", collapsed ? "justify-center w-full" : "")}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none" className="shrink-0">
              <rect x="12" y="12" width="40" height="40" rx="6" stroke="#4F8CFF" strokeWidth="2.5" />
              <path d="M24 32h16M32 24v16" stroke="#E6EDF3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-[14px] font-semibold text-[#E6EDF3] tracking-tight whitespace-nowrap">
              INT16 Priority
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx("text-[#9DA7B3] hover:text-[#E6EDF3] transition-colors p-[5px] rounded border border-transparent hover:border-[#1E2632] hover:bg-[#161C24]", collapsed ? "hidden" : "block")}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {collapsed && (
        <div className="flex justify-center mt-3 border-b border-[#1E2632] pb-3 px-2">
          <button
            onClick={() => setCollapsed(false)}
            className="text-[#9DA7B3] hover:text-[#E6EDF3] w-full flex justify-center py-[5px] transition-colors rounded hover:bg-[#161C24]"
          >
            <Menu size={16} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider px-2 mb-4">Workspace</p>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={clsx(
                "relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group overflow-hidden",
                isActive
                  ? "text-[#4F8CFF] bg-[rgba(79,140,255,0.08)]"
                  : "text-[#9DA7B3] hover:bg-[#161C24] hover:text-[#E6EDF3]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#4F8CFF] rounded-r-full"
                />
              )}
              <Icon size={16} className={clsx("shrink-0 relative z-10", isActive ? "text-[#4F8CFF]" : "text-[#9DA7B3]")} />
              {!collapsed && (
                <span className="whitespace-nowrap relative z-10">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Team Footer */}
      <div className={clsx("p-4 border-t border-[#272B36] shrink-0", !collapsed && "overflow-y-auto custom-scrollbar max-h-[300px]")}>
        {collapsed ? (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F8CFF] to-[#22C55E] shrink-0 flex items-center justify-center border-2 border-[#1C1F2A]" title="Development Team">
              <Activity size={14} className="text-[#0F1115]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1 px-1">Development Team</span>

            {/* Abhinav */}
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 flex items-center justify-center text-[#4F8CFF] font-bold text-[11px] shrink-0">AK</div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#E6E8EF] group-hover:text-white transition-colors">Abhinav Kumar</span>
                <span className="text-[10px] font-medium text-[#6B7280]">AI & Backend Engineering</span>
              </div>
            </div>

            {/* Nishant */}
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[#EAB308]/10 border border-[#EAB308]/20 flex items-center justify-center text-[#EAB308] font-bold text-[11px] shrink-0">NA</div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#E6E8EF] group-hover:text-white transition-colors">Nishant Aryan</span>
                <span className="text-[10px] font-medium text-[#6B7280]">Frontend Development</span>
              </div>
            </div>

            {/* Harsh */}
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] font-bold text-[11px] shrink-0">HM</div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#E6E8EF] group-hover:text-white transition-colors">Harsh Kumar Mishra</span>
                <span className="text-[10px] font-medium text-[#6B7280]">Systems Architecture</span>
              </div>
            </div>

            {/* Ayush */}
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] font-bold text-[11px] shrink-0">AG</div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#E6E8EF] group-hover:text-white transition-colors">Ayush Gupta</span>
                <span className="text-[10px] font-medium text-[#6B7280]">Data Pipeline Design</span>
              </div>
            </div>

            {/* Aditya */}
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-[#EC4899]/10 border border-[#EC4899]/20 flex items-center justify-center text-[#EC4899] font-bold text-[11px] shrink-0">AV</div>
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-[#E6E8EF] group-hover:text-white transition-colors">Aditya Verma</span>
                <span className="text-[10px] font-medium text-[#6B7280]">Verification Strategy</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
