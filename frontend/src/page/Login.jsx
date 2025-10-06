import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import wall from "../assets/loginBI.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${config.apiUrl}/Login`, {
        email,
        password,
      }, {
        withCredentials: true,
      });
      const user = res.data.user;
      const token = res.data.token;
      localStorage.setItem("user-info", JSON.stringify(user));
      localStorage.setItem("token", token)
      navigate("/vault")
    } catch (err) {
      console.error(err);
      setError("Login Failed! Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <img
        src={wall}
        alt="Background"
        className="absolute w-full h-full object-cover opacity-100"
      />

      {/* Navigation Bar */}
      <nav className="w-full bg-white p-4 flex justify-end relative z-10">
        <div className="flex flex-wrap items-center justify-end gap-2 md:gap-6">
          <button
            className="text-black font-bold text-sm md:text-base"
            onClick={() => navigate("")}
          >
            About
          </button>
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white py-1 px-2 md:py-2 md:px-4 rounded font-medium text-sm md:text-base transition cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </button>
          <button
            className="bg-white hover:bg-gray-500 text-pink-500 border border-black py-1 px-2 md:py-2 md:px-4 rounded font-medium text-sm md:text-base transition cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </div>
      </nav>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center lg:justify-start p-4 relative z-10">
        <div className="w-full max-w-md lg:ml-60 bg-white bg-opacity-90 p-6 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Login</h2>
            <p className="text-pink-600 mt-2">Welcome back</p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              className="w-full border border-black rounded p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="w-full border border-black rounded p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex justify-center pt-4 gap-4">
              <button
                className="w-60 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded font-medium transition cursor-pointer"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <button
                className="text-pink-500 hover:text-cyan-800 font-medium cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;