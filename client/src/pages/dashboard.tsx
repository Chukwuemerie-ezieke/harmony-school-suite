import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { GraduationCap, Users, MessageSquare, Package, Megaphone, CalendarDays, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery<any>({ queryKey: ["/api/dashboard"] });

  const cards = [
    { label: "Students", value: stats?.studentCount, icon: GraduationCap, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950", path: "/students" },
    { label: "Teachers", value: stats?.teacherCount, icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950", path: "/users" },
    { label: "Pending Feedback", value: stats?.feedbackCount, icon: MessageSquare, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950", path: "/feedbacks" },
    { label: "Assets", value: stats?.assetCount, icon: Package, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950", path: "/assets" },
    { label: "Announcements", value: stats?.announcementCount, icon: Megaphone, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950", path: "/announcements" },
    { label: "Events", value: stats?.eventCount, icon: CalendarDays, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950", path: "/events" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-dashboard-title">Welcome, {user?.fullName}</h1>
          <p className="text-sm text-muted-foreground">{user?.school?.name} — {user?.school?.subscriptionPlan} plan</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.label} href={card.path}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid={`card-${card.label.toLowerCase().replace(/\s/g, "-")}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{card.label}</p>
                          <p className="text-2xl font-bold mt-1">{card.value ?? 0}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Mark Attendance", path: "/attendance" },
                { label: "Add New Student", path: "/students" },
                { label: "View Timetable", path: "/timetable" },
                { label: "Post Announcement", path: "/announcements" },
                { label: "Register Asset", path: "/assets" },
              ].map((a) => (
                <Link key={a.path} href={a.path}>
                  <div className="px-3 py-2 rounded-md hover:bg-accent cursor-pointer text-sm transition-colors" data-testid={`quick-${a.label.toLowerCase().replace(/\s/g, "-")}`}>
                    {a.label} →
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Modules</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "EduTrack", desc: "Student tracking & attendance", path: "/students" },
                { label: "TimeGrid", desc: "Timetable management", path: "/timetable" },
                { label: "VoicelessBox", desc: "Anonymous feedback system", path: "/feedbacks" },
                { label: "Parents Connect", desc: "Communication portal", path: "/announcements" },
                { label: "Asset Register", desc: "Inventory management", path: "/assets" },
              ].map((m) => (
                <Link key={m.path} href={m.path}>
                  <div className="px-3 py-2 rounded-md hover:bg-accent cursor-pointer transition-colors" data-testid={`module-${m.label.toLowerCase().replace(/\s/g, "-")}`}>
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
