import { useState } from 'react';
import { useNavigate } from "react-router-dom"
import axios from "axios"
import vault from "../assets/lock.png"
import config from "../config"

function Home() {
    const [vaultId, setVaultId] = useState(''); // Fixed: vaultId instead of email
    const [vaultPassword, setVaultPassword] = useState(''); // Fixed: vaultPassword instead of masterPassword
    const [vaultSignup, setVaultSignup] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    const navigate = useNavigate();

    const handleCreateVault = async () => {
        try {
            const response = await axios.post(`${config.apiUrl}/vaultSignup`, {
                vaultId,
                vaultPassword
            });
            
            if (response.data.message === "Signup successful") {
                navigate("/vault");
            }
        } catch (error) {
            console.error("Signup failed:", error.response?.data?.message);
            alert(error.response?.data?.message || "Signup failed");
        }
    };

    const handleLoginVault = async () => {
        try {
            const response = await axios.post(`${config.apiUrl}/vaultLogin`, { // Fixed: axios.post
                vaultId,
                vaultPassword
            });
            
            if (response.data.message === "Login successful") {
                navigate("/vault");
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message);
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            {!vaultSignup ? (
                <div className="w-full max-w-md bg-white rounded-xl p-8">
                    <div className="flex justify-center mb-4">
                        <img src={vault} className='h-10 w-10' alt="Vault" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Secure Vault</h1>

                    <div className="space-y-4">
                        <button
                            onClick={() => setVaultSignup(true)}
                            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white p-3 rounded-lg font-semibold cursor-pointer"
                        >
                            Create Vault Account
                        </button>

                        <button
                            onClick={() => {
                                setVaultSignup(true);
                                setIsLogin(true);
                            }}
                            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white p-3 rounded-lg font-semibold cursor-pointer"
                        >
                            Login to Vault
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md bg-white rounded-xl p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        {isLogin ? "Login to Vault" : "Create Vault"}
                    </h1>

                    <div className="space-y-4">
                        <input
                            value={vaultId} // Fixed: vaultId
                            onChange={(e) => setVaultId(e.target.value)} // Fixed: setVaultId
                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                            placeholder="Vault ID"
                        />

                        <input
                            value={vaultPassword} // Fixed: vaultPassword
                            onChange={(e) => setVaultPassword(e.target.value)} // Fixed: setVaultPassword
                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg"
                            placeholder="Master Password"
                            type="password"
                        />

                        <button
                            onClick={()=>handleCreateVault()}
                            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white p-3 rounded-lg font-semibold cursor-pointer"
                        >
                            Create Vault 
                        </button>

                        <button
                            onClick={()=>handleLoginVault()}
                            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white p-3 rounded-lg font-semibold cursor-pointer"
                        >
                            Unlock Vault
                        </button>

                        <button
                            onClick={() => setVaultSignup(false)}
                            className="w-full bg-gray-500 text-white p-3 rounded-lg font-semibold cursor-pointer"
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;