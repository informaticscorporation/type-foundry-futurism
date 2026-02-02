//import component
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
//css
import "./App.css";
//component
import PrivateRoute from "./Component/PrivateRoute";
//Pages
import Home from "./Page/Home";
import Register from "./Page/Register";
import Login from "./Page/Login";
import Rents from "./Page/Rents";
import Rent from "./Page/Rent";
import Pagamento from "./Page/Pagamento";
import UserArea from "./Page/UserArea";
import Dashboard from "./Page/Dashboard";
import Pronotation from "./Page/Prenotation";
import Checkout from "./Page/Checkout";

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>

          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/rents" element={<Rents />} />
          <Route path="/rents/:id" element={<Rent />} />

          {/* ✅ Private routes wrapper */}
          <Route element={<PrivateRoute isAuth={true} />}>
            <Route path="/prenotation/:id" element={<Pronotation />} />
            <Route path="/pagamento" element={<Pagamento/>} />
            <Route path="/pagamento/successo" element={<Pagamento />} />
            <Route path="/userarea" element={<UserArea />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<h1>404</h1>} />

        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
