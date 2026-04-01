import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav, SideNav } from "@/components/BottomNav";
import { HealthDataProvider } from "@/contexts/HealthDataContext";
import Dashboard from "./pages/Dashboard";
import Symptoms from "./pages/Symptoms";
import Medications from "./pages/Medications";
import Timeline from "./pages/Timeline";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <HealthDataProvider>
          <div className="flex min-h-screen">
            <SideNav />
            <main className="flex-1 md:ml-56">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/symptoms" element={<Symptoms />} />
                <Route path="/medications" element={<Medications />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <BottomNav />
          </div>
        </HealthDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
