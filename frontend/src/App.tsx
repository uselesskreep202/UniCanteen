import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import StaffPage from "./pages/StaffPage";
import AdminPage from "./pages/AdminPage";
import { useAuthStore } from "./store/authStore";
import { getMe } from "./api/auth";

function App() {
  const { token, setAuth, user } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      getMe().then((r) => setAuth(r.data, token)).catch(() => {});
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={token ? <OrdersPage /> : <Navigate to="/login" />} />
          <Route path="/staff" element={token ? <StaffPage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={token ? <AdminPage /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
