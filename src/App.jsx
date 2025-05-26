import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import StartScreen from "./pages/StartScreen";
import ChatScreen from "./pages/ChatScreen";
import BackgroundMusic from "./components/BackgroundMusic";

export default function App() {
  const location = useLocation();

  return (
    <>
      <BackgroundMusic />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/start" element={<StartScreen />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
