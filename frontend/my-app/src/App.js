// src/App.js
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./register";
import Login from "./login";
import Dashboard from "./dashboard";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/register">Register</Link> | 
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
