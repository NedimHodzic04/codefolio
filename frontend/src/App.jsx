import { Routes, Route, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/ui/Navbar";
import Dashboard from "./pages/Dashboard";
import PortfolioPage from "./pages/PortfolioPage";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const location = useLocation();
  
  // Hide navbar on portfolio pages (any route that matches /:username pattern)
  // Show navbar on: /, /login, /dashboard
  const showNavbar = location.pathname === "/" || 
                     location.pathname === "/login" || 
                     location.pathname === "/dashboard";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/:username" element={<PortfolioPage />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
