import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import { Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";

function App() {
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
