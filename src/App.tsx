import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { WebsiteProvider } from "./components/website-context";
import { SiteLayout } from "./layouts/SiteLayout";
import { BlogPage } from "./pages/BlogPage";
import { CarPage } from "./pages/CarPage";
import { ContactPage } from "./pages/ContactPage";
import { ServicePage } from "./pages/ServicePage";
import { EnquirePage } from "./pages/EnquirePage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PostPage } from "./pages/PostPage";
import { AdminGate } from "./pages/admin/AdminGate";
import { AdminHome } from "./pages/admin/AdminHome";
import { AdminShell } from "./pages/admin/AdminShell";
import { AgentFormPage } from "./pages/admin/AgentFormPage";
import { AgentsPage } from "./pages/admin/AgentsPage";
import { WebsiteEditor } from "./pages/admin/WebsiteEditor";
import { WebsitePage } from "./pages/admin/WebsitePage";

function AgentShortcut() {
  const { pageIdentifier } = useParams();
  return <Navigate to={`/admin/agents/${pageIdentifier}`} replace />;
}

export function App() {
  return (
    <WebsiteProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="agent/:agentIdentifier" element={<HomePage />} />
            <Route path="car-details" element={<CarPage />} />
            <Route path="order" element={<EnquirePage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<PostPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="service-center" element={<ServicePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="admin" element={<AdminGate />}>
            <Route element={<AdminShell />}>
              <Route index element={<AdminHome />} />
              <Route path="website" element={<WebsitePage />} />
              <Route path="website/notes/:slug" element={<WebsiteEditor />} />
              <Route path="website/:section" element={<WebsiteEditor />} />
              <Route path="agents" element={<AgentsPage />} />
              <Route path="agents/new" element={<AgentFormPage />} />
              <Route path="agents/:pageIdentifier" element={<AgentFormPage />} />
            </Route>
            <Route path="new" element={<Navigate to="/admin/agents/new" replace />} />
            <Route path=":pageIdentifier" element={<AgentShortcut />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WebsiteProvider>
  );
}
