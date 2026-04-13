import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import axios from "axios";
import { Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

function App() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("http://localhost:5000");
      setMessage(response.data.message);
    };
    fetchData();
  }, []);

  return (
    <>
      <h1>{message || null}</h1>
      <Routes>
        <Route path="/login" element={<LoginPage />}></Route>
      </Routes>
    </>
  );
}

export default App;
