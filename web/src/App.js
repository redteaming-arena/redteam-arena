import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Home from "./pages/Home";
import ChatbotSharedPage from "./pages/ChatSharedPage";
import History from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";
import Terms from "./pages/Terms";

const Error404 = () => {
  return <>404</>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />}>
          <Route path=":session_id" element={<History />} />
        </Route>
        <Route path="/share/:session_id" element={<ChatbotSharedPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
};

export default App;
