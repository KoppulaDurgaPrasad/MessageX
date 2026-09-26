import { Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/Landing/LandingPage";
import Footer from "./components/Footer/Footer.jsx";
import Profile from "./Pages/Profile/Profile";
import Chat from "./Pages/Chat/Chat";
import Status from "./Pages/Status/Status.jsx";
import Calls from "./Pages/Calls/Calls";
import Groups from "./Pages/Groups/Groups";
import "./App.css";

function Home() {
  return (
    <>
      <LandingPage />
      <Footer />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/status" element={<Status />} />
      <Route path="/calls" element={<Calls />} />
      <Route path="/groups" element={<Groups />} />
    </Routes>
  );
}

export default App;
