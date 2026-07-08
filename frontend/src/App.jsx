// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Home     from "./pages/Home";
import ChatRoom from "./pages/ChatRoom";

function JoinRedirect() {
  const { roomId } = useParams();
  return <Navigate to={`/?join=${roomId}`} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/room/:roomId" element={<ChatRoom />} />
          <Route path="/join/:roomId" element={<JoinRedirect />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
