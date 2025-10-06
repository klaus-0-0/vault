import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Signup from "./page/Signup"
import Login from "./page/Login"
import Home from "./page/Home"
import Vault from "./page/Vault"
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vault" element={<Vault />} />
      </Routes>
    </Router>
  )
}

export default App
