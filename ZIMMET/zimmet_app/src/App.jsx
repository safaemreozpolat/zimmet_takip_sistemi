import { BrowserRouter, Routes, Route } from "react-router-dom";
import Devices from "./pages/Devices";
import Personnel from "./pages/Personnel";
import Assignments from "./pages/Assignments";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<Dashboard />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/personnel" element={<Personnel />} />
        <Route path="/assignments" element={<Assignments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

