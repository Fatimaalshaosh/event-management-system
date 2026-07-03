import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { palette } from "@/theme";
import { isAuthenticated } from "@/lib/storage";
// Login + NotFound stay eager: Login is the entry screen (no load flash) and
// NotFound is tiny. Every other page is code-split into its own chunk.
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { PageContextProvider } from "@/ai/page-context";

const Dashboard = lazy(() => import("@/pages/dashboard"));
const Events = lazy(() => import("@/pages/events"));
const EventsEdit = lazy(() => import("@/pages/events-edit"));
const EventDetail = lazy(() => import("@/pages/event-detail"));
const Visits = lazy(() => import("@/pages/visits"));
const Approvals = lazy(() => import("@/pages/approvals"));
const Vips = lazy(() => import("@/pages/vips"));
const Invitations = lazy(() => import("@/pages/invitations"));
const Calendar = lazy(() => import("@/pages/calendar"));
const Reports = lazy(() => import("@/pages/reports"));
const Settings = lazy(() => import("@/pages/settings"));
const FamilyTree = lazy(() => import("@/pages/family-tree"));
const Fleet = lazy(() => import("@/pages/fleet"));
const Contacts = lazy(() => import("@/pages/contacts"));
const CreateOfficialEvent = lazy(() => import("@/pages/create-official-event"));
const PublicRsvp = lazy(() => import("@/pages/public-rsvp"));

const queryClient = new QueryClient();

/** Full-bleed fallback painted in the app background so lazy chunks never flash white. */
function PageFallback() {
  return <div style={{ minHeight: "100vh", background: palette.floralWhite }} />;
}

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, []);

  if (!isAuthenticated()) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/rsvp/:token" component={PublicRsvp} />
      <Route path="/" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/events" component={() => <PrivateRoute component={Events} />} />
      {/* /events/new now opens the Executive Event Creation experience (legacy
          EventsNew form is deprecated; EventForm is still used for editing). */}
      <Route path="/events/new" component={() => <PrivateRoute component={CreateOfficialEvent} />} />
      <Route path="/events/:id/edit" component={() => <PrivateRoute component={EventsEdit} />} />
      <Route path="/events/:id" component={() => <PrivateRoute component={EventDetail} />} />
      <Route path="/visits" component={() => <PrivateRoute component={Visits} />} />
      <Route path="/approvals" component={() => <PrivateRoute component={Approvals} />} />
      <Route path="/vips" component={() => <PrivateRoute component={Vips} />} />
      <Route path="/invitations" component={() => <PrivateRoute component={Invitations} />} />
      <Route path="/calendar" component={() => <PrivateRoute component={Calendar} />} />
      <Route path="/reports" component={() => <PrivateRoute component={Reports} />} />
      <Route path="/settings" component={() => <PrivateRoute component={Settings} />} />
      <Route path="/family-tree" component={() => <PrivateRoute component={FamilyTree} />} />
      <Route path="/fleet" component={() => <PrivateRoute component={Fleet} />} />
      <Route path="/contacts" component={() => <PrivateRoute component={Contacts} />} />
      <Route path="/create-official-event" component={() => <PrivateRoute component={CreateOfficialEvent} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PageContextProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Suspense fallback={<PageFallback />}>
              <Router />
            </Suspense>
          </WouterRouter>
          <Toaster />
        </PageContextProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
