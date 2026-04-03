import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import StudentsPage from "@/pages/students";
import AttendancePage from "@/pages/attendance";
import VisitorsPage from "@/pages/visitors";
import TimetablePage from "@/pages/timetable";
import SubjectsPage from "@/pages/subjects";
import ClassesPage from "@/pages/classes-page";
import FeedbacksPage from "@/pages/feedbacks";
import FeedbackCategoriesPage from "@/pages/feedback-categories";
import AnnouncementsPage from "@/pages/announcements";
import MessagesPage from "@/pages/messages-page";
import EventsPage from "@/pages/events";
import AssetsPage from "@/pages/assets";
import AssetCategoriesPage from "@/pages/asset-categories";
import MaintenancePage from "@/pages/maintenance";
import SettingsPage from "@/pages/settings";
import UserManagementPage from "@/pages/user-management";
import SubscriptionPage from "@/pages/subscription";

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/students" component={StudentsPage} />
      <Route path="/attendance" component={AttendancePage} />
      <Route path="/visitors" component={VisitorsPage} />
      <Route path="/timetable" component={TimetablePage} />
      <Route path="/subjects" component={SubjectsPage} />
      <Route path="/classes" component={ClassesPage} />
      <Route path="/feedbacks" component={FeedbacksPage} />
      <Route path="/feedback-categories" component={FeedbackCategoriesPage} />
      <Route path="/announcements" component={AnnouncementsPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/assets" component={AssetsPage} />
      <Route path="/asset-categories" component={AssetCategoriesPage} />
      <Route path="/maintenance" component={MaintenancePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/users" component={UserManagementPage} />
      <Route path="/subscription" component={SubscriptionPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
