import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CodeQuiz from "./pages/CodeQuiz";
import BugHunter from "./pages/BugHunter";
import OutputMaster from "./pages/OutputMaster";
import MissingCode from "./pages/MissingCode";
import Leaderboard from "./pages/Leaderboard";
import PlayerProfile from "./pages/PlayerProfile";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/games/quiz" element={<CodeQuiz />} />

        <Route path="/games/bug-hunter" element={<BugHunter />} />

        <Route
  path="/games/output-master"
  element={<OutputMaster />}
/>
<Route
  path="/games/missing-code"
  element={<MissingCode />}
/>
<Route path="/leaderboard" element={<Leaderboard />} />
<Route path="/profile" element={<PlayerProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;