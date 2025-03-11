import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ModelsPage from "./pages/ModelsPage";
import EnginesPage from "./pages/EnginesPage"; 
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { CartProvider } from "./CartContext";
import Categories from "./components/Categories";
import CheckoutPage from "./pages/CheckoutPage";
import AdminDashboard from './pages/AdminDashboard';
import { UserProvider } from './UserContext';

function App() {
  return (
    <UserProvider>
    <CartProvider>
      <Router>
        <div className="wrapper">
          <Header />
          <Categories />
          <Routes>
            {/* Главная страница с марками */}
            <Route path="/" element={<HomePage />} />
            {/* Страница с моделями */}
            <Route path="/brand/:brand" element={<ModelsPage />} />
            {/* Страница с двигателями */}
            <Route path="/brand/:brand/model/:model" element={<EnginesPage />} />
            {/* Страница с товарами */}
            <Route path="/brand/:brand/model/:model/engine/:engineId" element={<ProductsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </CartProvider>
    </UserProvider>
  );
}

export default App;
