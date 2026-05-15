import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, GraduationCap, ClipboardCheck, UserCheck,
  Calendar, BookOpen, School, MessageSquare, FolderOpen,
  Megaphone, Mail, CalendarDays, Package, Layers, Wrench,
  Settings, Users, CreditCard, ChevronDown, LogOut, Moon, Sun,
  Menu, ClipboardList, Compass, FileText, BookOpenCheck, ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

const navGroups = [
  { label: "", items: [{ label: "Dashboard", path: "/", icon: LayoutDashboard }] },
  {
    label: "EduTrack", items: [
      { label: "Students", path: "/students", icon: GraduationCap },
      { label: "Attendance", path: "/attendance", icon: ClipboardCheck },
      { label: "Visitors Log", path: "/visitors", icon: UserCheck },
    ]
  },
  {
    label: "TimeGrid", items: [
      { label: "Timetable", path: "/timetable", icon: Calendar },
      { label: "Subjects", path: "/subjects", icon: BookOpen },
      { label: "Classes", path: "/classes", icon: School },
    ]
  },
  {
    label: "VoicelessBox", items: [
      { label: "All Feedback", path: "/feedbacks", icon: MessageSquare },
      { label: "Categories", path: "/feedback-categories", icon: FolderOpen },
    ]
  },
  {
    label: "Parents Connect", items: [
      { label: "Announcements", path: "/announcements", icon: Megaphone },
      { label: "Messages", path: "/messages", icon: Mail },
      { label: "Events", path: "/events", icon: CalendarDays },
    ]
  },
  {
    label: "Asset Register", items: [
      { label: "All Assets", path: "/assets", icon: Package },
      { label: "Categories", path: "/asset-categories", icon: Layers },
      { label: "Maintenance", path: "/maintenance", icon: Wrench },
    ]
  },
  {
    label: "More Modules", items: [
      { label: "EduPlanner", path: "https://chukwuemerie-ezieke.github.io/eduplanner/", icon: ClipboardList, external: true },
      { label: "Career Guidance", path: "https://harmony-career-guidance.vercel.app", icon: Compass, external: true },
      { label: "Student Records", path: "#", icon: FileText, soon: true },
      { label: "Harmony CBT", path: "#", icon: GraduationCap, soon: true },
      { label: "ExamPrep", path: "#", icon: BookOpenCheck, soon: true },
    ]
  },
  {
    label: "Settings", items: [
      { label: "School Profile", path: "/settings", icon: Settings },
      { label: "User Management", path: "/users", icon: Users },
      { label: "Subscription", path: "/subscription", icon: CreditCard },
    ]
  },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
    if (prefersDark) document.documentElement.classList.add("dark");
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  if (collapsed) {
    return (
      <div className="w-14 flex-shrink-0 bg-[hsl(183,70%,12%)] flex flex-col items-center py-3 gap-2">
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-white/70 hover:text-white hover:bg-white/10" data-testid="sidebar-toggle">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0 bg-[hsl(183,70%,12%)] flex flex-col h-full">
      <div className="p-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">Harmony Suite</p>
          <p className="text-xs text-white/50 truncate">{user?.school?.name || "School"}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-white/50 hover:text-white hover:bg-white/10 h-7 w-7" data-testid="sidebar-collapse">
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        {navGroups.map((group) => {
          if (!group.label) {
            return group.items.map((item) => {
              const Icon = item.icon;
              const active = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md cursor-pointer text-sm transition-colors ${active ? "bg-white/15 text-white font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"}`} data-testid={`nav-${item.label.toLowerCase()}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            });
          }

          const isOpen = openGroups[group.label] !== false;
          const hasActive = group.items.some(i => location === i.path);

          return (
            <Collapsible key={group.label} open={isOpen || hasActive} onOpenChange={() => toggleGroup(group.label)}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between px-4 py-2 mx-2 text-xs font-semibold text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/60 mt-3">
                  <span>{group.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isOpen || hasActive ? "" : "-rotate-90"}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {group.items.map((item: any) => {
                  const Icon = item.icon;
                  const active = location === item.path;
                  if (item.external) {
                    return (
                      <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-3 px-4 py-1.5 mx-2 rounded-md cursor-pointer text-sm transition-colors text-white/70 hover:bg-white/10 hover:text-white" data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </div>
                      </a>
                    );
                  }
                  if (item.soon) {
                    return (
                      <div key={item.label} className="flex items-center gap-3 px-4 py-1.5 mx-2 rounded-md text-sm text-white/40 cursor-not-allowed" data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <span className="text-[10px] uppercase tracking-wider">Soon</span>
                      </div>
                    );
                  }
                  return (
                    <Link key={item.path} href={item.path}>
                      <div className={`flex items-center gap-3 px-4 py-1.5 mx-2 rounded-md cursor-pointer text-sm transition-colors ${active ? "bg-white/15 text-white font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"}`} data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </ScrollArea>

      <div className="border-t border-white/10 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleDark} className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8" data-testid="theme-toggle">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-white/40 truncate">{user?.role?.replace("_", " ")}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8" data-testid="logout-btn">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
