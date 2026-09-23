import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

export default function MainLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      {!isLandingPage && <Footer />}
    </>
  );
}
