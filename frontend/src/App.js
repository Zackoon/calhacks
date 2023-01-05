import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import LikedSongs from "./components/LikedSongs";
import NavBar from "./components/NavBar";

function App() {
  return (
    <Router>
    <NavBar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path = "/liked" element = {<LikedSongs/>} />
      </Routes>
    </Router>
  );
}

export default App;
