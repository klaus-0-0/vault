import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { VaultCrypto } from "../components/crypto"
import axios from "axios"
import vault from "../assets/vault.png"
import account from "../assets/accountant.png"
import signout from "../assets/exit.png"
import search from "../assets/loupe.png"
import setting from "../assets/settings.png"
import overView from "../assets/research.png"
import config from "../config"

function Vault() {
    const [activeButton, setActiveButton] = useState("overview")
    const [showSearch, setShowSearch] = useState(false);
    const [showAccount, setShowAccount] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [vaultItems, setVaultItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showPassword, setShowPassword] = useState({});
    const [masterKey, setMasterKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [newItem, setNewItem] = useState({
        title: "",
        username: "",
        password: "",
        url: "",
        notes: ""
    });

    // NEW STATES FOR PASSWORD PROMPT
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
    const [masterPasswordInput, setMasterPasswordInput] = useState("");
    const [unlockError, setUnlockError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("user-info");
        console.log(token);

        if (!token) {
            navigate("/signup");
            return;
        }
    }, []);

    useEffect(() => {
        if (masterKey && !showPasswordPrompt) {
            console.log("Master key available, loading vault items...");
            loadVaultItems();
        }
    }, [masterKey, showPasswordPrompt]);

    useEffect(() => {
        filterItems();
    }, [searchQuery, vaultItems]);

    // NEW FUNCTION TO UNLOCK VAULT
    const unlockVault = () => {
        if (!masterPasswordInput.trim()) {
            setUnlockError("Please enter your master password");
            return;
        }

        try {
            const userData = JSON.parse(localStorage.getItem("user-info"));

            if (!userData.email) {
                setUnlockError("User data not found. Please login again.");
                return;
            }

            const key = VaultCrypto.deriveKey(masterPasswordInput, userData.email);
            setMasterKey(key);
            console.log(key);

            setShowPasswordPrompt(false);
            setMasterPasswordInput(""); // Clear for security
            setUnlockError("");

            // Load vault items after unlocking
            loadVaultItems();
        } catch (error) {
            console.error("Error unlocking vault:", error);
            setUnlockError("Failed to unlock vault. Please try again.");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            unlockVault();
        }
    };

    // const initializeMasterKey = (email) => {
    //     // This function is no longer needed as we ask for password every time
    // };

    const loadVaultItems = async () => {
        if (!masterKey) {
            console.error("Master key not available");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${config.apiUrl}/vault/items`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const encryptedItems = response.data;

            // Decrypt all items
            const decryptedItems = encryptedItems.map(item => ({
                id: item.id,
                ...VaultCrypto.decryptVaultItem(item.encryptedData, masterKey)
            }));

            setVaultItems(decryptedItems);
        } catch (error) {
            console.error("Error loading vault items:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("Session expired. Please login again.");
                handleSignOut();
            }
        } finally {
            setLoading(false);
        }
    };

    const saveVaultItem = async () => {
        if (!newItem.title || !newItem.username || !newItem.password) {
            alert("Please fill in required fields (Title, Username, Password)");
            return;
        }

        if (!masterKey) {
            alert("Encryption key not available. Please try again.");
            return;
        }

        try {
            setLoading(true);
            // Encrypt the vault item
            const encryptedData = VaultCrypto.encryptVaultItem(newItem, masterKey);
            console.log("enc = ", encryptedData);

            const token = localStorage.getItem("token");

            const response = await axios.post(`${config.apiUrl}/vault/items`,
                { encryptedData },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.status === 201) {
                // Reset form and reload items
                setNewItem({ title: "", username: "", password: "", url: "", notes: "" });
                setShowAccount(false);
                setActiveButton("overview");
                await loadVaultItems();
                alert("Account saved successfully!");
            }
        } catch (error) {
            console.error("Error saving vault item:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("Session expired. Please login again.");
                // handleSignOut();
            } else {
                alert("Failed to save account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteVaultItem = async (id) => {
        if (!confirm("Are you sure you want to delete this account?")) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.delete(`${config.apiUrl}/vault/items/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                await loadVaultItems();
                alert("Account deleted successfully!");
            }
        } catch (error) {
            console.error("Error deleting vault item:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert("Session expired. Please login again.");
            } else {
                alert("Failed to delete account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const filterItems = () => {
        if (!searchQuery.trim()) {
            setFilteredItems(vaultItems);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = vaultItems.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.username.toLowerCase().includes(query) ||
            (item.url && item.url.toLowerCase().includes(query)) ||
            (item.notes && item.notes.toLowerCase().includes(query))
        );
        setFilteredItems(filtered);
    };

    const generatePassword = () => {
        try {
            const generatedPassword = VaultCrypto.generatePassword({
                length: 16,
                numbers: true,
                symbols: true,
                uppercase: true,
                lowercase: true,
                excludeSimilar: true
            });

            setNewItem(prev => ({ ...prev, password: generatedPassword }));
        } catch (error) {
            console.error("Error generating password:", error);
            alert("Failed to generate password");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy to clipboard:", err);
        });
    };

    const handleSignOut = () => {
        localStorage.removeItem("user-info");
        localStorage.removeItem("token");
        navigate("/signup");
    };

    const lockVault = () => {
        setMasterKey("");
        setShowPasswordPrompt(true);
        setVaultItems([]);
        setMasterPasswordInput("");
    };

    const displayItems = searchQuery ? filteredItems : vaultItems;

    return (
        <div className="min-h-screen bg-cyan-100">
            {/* MASTER PASSWORD PROMPT - SHOWS FIRST */}
            {showPasswordPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-4 shadow-lg">
                        <div className="text-center mb-6">
                            <img src={vault} className="w-20 h-20 mx-auto mb-4" alt="Vault" />
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Unlock Your Vault</h2>
                            <p className="text-gray-600">Enter your master password to access your secure passwords</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="password"
                                value={masterPasswordInput}
                                onChange={(e) => {
                                    setMasterPasswordInput(e.target.value);
                                    setUnlockError("");
                                }}
                                onKeyPress={handleKeyPress}
                                className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg"
                                placeholder="Enter master password"
                                autoFocus
                            />

                            {unlockError && (
                                <p className="text-red-500 text-sm text-center">{unlockError}</p>
                            )}

                            <div className="flex gap-5">
                                <button
                                    onClick={unlockVault}
                                    className="w-30 bg-cyan-500 text-white p-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors cursor-pointer"
                                >
                                    Unlock Vault
                                </button>

                                <button
                                    onClick={handleSignOut}
                                    className="w-30 bg-gray-500 text-white p-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors cursor-pointer"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN VAULT CONTENT - SHOWS AFTER UNLOCKING */}
            {!showPasswordPrompt && (
                <>
                    <div className="sticky top-0 z-50 bg-cyan-300 p-1 flex justify-between items-center">
                        <div className="flex items-center gap-8">
                            <img src={vault} className="w-14 h-14" alt="Vault" />
                            <h1 className="text-4xl font-bold text-gray-800">Vault</h1>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={lockVault}
                                className="flex items-center gap-2 text-gray-700 px-4 py-2 rounded hover:bg-cyan-400 transition-colors font-bold cursor-pointer"
                            >
                                <img src={signout} className="w-6 h-6" alt="Lock" />
                                Lock Vault
                            </button>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 text-gray-700 px-4 py-2 rounded hover:bg-cyan-400 transition-colors font-bold cursor-pointer"
                            >
                                <img src={signout} className="w-6 h-6" alt="Sign Out" />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    <div className="p-4 flex gap-4 items-center flex-wrap">
                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeButton === "overview" ? "bg-cyan-600 text-white" : "bg-cyan-100 text-black hover:bg-cyan-200"}`}
                            onClick={() => {
                                setActiveButton("overview");
                                setShowSearch(false);
                                setShowAccount(false);
                            }}
                        >
                            <img src={overView} className="w-6 h-6" alt="Overview" />
                            Overview
                        </button>
                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeButton === "account" ? "bg-cyan-600 text-white" : "bg-cyan-100 text-black hover:bg-cyan-200"}`}
                            onClick={() => {
                                setActiveButton("account");
                                setShowSearch(false);
                                setShowAccount(true);
                            }}
                        >
                            <img src={account} className="w-6 h-6" alt="Create Account" />
                            Create Account
                        </button>
                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeButton === "search" ? "bg-cyan-600 text-white" : "bg-cyan-100 text-black hover:bg-cyan-200"}`}
                            onClick={() => {
                                setActiveButton("search")
                                setShowSearch(true)
                                setShowAccount(false)
                            }}
                        >
                            <img src={search} className="w-6 h-6" alt="Search" />
                            Search
                        </button>
                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${activeButton === "setting" ? "bg-cyan-600 text-white" : "bg-cyan-100 text-black hover:bg-cyan-200"}`}
                            onClick={() => {
                                setActiveButton("setting")
                                setShowSearch(false)
                                setShowAccount(false)
                            }}
                        >
                            <img src={setting} className="w-6 h-6" alt="Settings" />
                            Settings
                        </button>
                    </div>

                    {/* Search Input */}
                    {showSearch && (
                        <div className="p-4 flex flex-col items-center justify-center gap-5">
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full max-w-md p-3 bg-white border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Search accounts by title, username, URL, or notes..."
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayItems.map((item) => (
                                    <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-cyan-200">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                                        <p className="text-gray-600 mb-1"><strong>Username:</strong> {item.username}</p>

                                        <div className="flex items-center gap-2 mb-1">
                                            <strong>Password:</strong>
                                            <input
                                                type={showPassword[item.id] ? "text" : "password"}
                                                value={item.password}
                                                readOnly
                                                className="flex-1 bg-gray-100 px-2 py-1 rounded border text-sm"
                                            />
                                            <button
                                                onClick={() => setShowPassword(prev => ({
                                                    ...prev,
                                                    [item.id]: !prev[item.id]
                                                }))}
                                                className="text-cyan-600 hover:text-cyan-800 text-sm px-2 py-1 border rounded"
                                            >
                                                {showPassword[item.id] ? "Hide" : "Show"}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(item.password)}
                                                className="text-cyan-600 hover:text-cyan-800 text-sm px-2 py-1 border rounded"
                                            >
                                                Copy
                                            </button>
                                        </div>

                                        {item.url ? (
                                            <p className="text-gray-600 mb-1">
                                                <strong>URL:</strong>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline ml-1 break-all">
                                                    {item.url}
                                                </a>
                                            </p>
                                        ) : (
                                            <p className="text-gray-600 mb-1">
                                                <strong>URL:</strong>
                                                <span className="text-gray-400 ml-1 text-1xl">Not provided</span>
                                            </p>
                                        )}

                                        {item.notes ? (
                                            <p className="text-gray-600 mb-4">
                                                <strong>Notes:</strong> {item.notes ? item.notes : "d "}
                                            </p>
                                        ) : (
                                            <p className="text-gray-600 mb-1">
                                                <strong>Notes:</strong>
                                                <span className="text-gray-400 ml-1 text-1xl">Not provided</span>
                                            </p>
                                        )
                                        }

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => deleteVaultItem(item.id)}
                                                className="flex-1 bg-gray-700 text-white py-1 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                                                disabled={loading}
                                            >
                                                {loading ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center p-4">
                            <div className="bg-cyan-500 text-white px-6 py-3 rounded-lg">
                                Loading...
                            </div>
                        </div>
                    )}

                    {/* Overview - Shows vault items */}
                    {activeButton === "overview" && !loading && (
                        <div className="p-8">
                            <h1 className="text-5xl font-bold text-gray-600 mb-6">Your Accounts ({displayItems.length})</h1>

                            {displayItems.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                                    <p className="text-gray-600 text-lg">No accounts saved yet. Click "Create Account" to add your first account.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {displayItems.map((item) => (
                                        <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-cyan-200">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                                            <p className="text-gray-600 mb-1"><strong>Username:</strong> {item.username}</p>

                                            <div className="flex items-center gap-2 mb-1">
                                                <strong>Password:</strong>
                                                <input
                                                    type={showPassword[item.id] ? "text" : "password"}
                                                    value={item.password}
                                                    readOnly
                                                    className="flex-1 bg-gray-100 px-2 py-1 rounded border text-sm"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(prev => ({
                                                        ...prev,
                                                        [item.id]: !prev[item.id]
                                                    }))}
                                                    className="text-cyan-600 hover:text-cyan-800 text-sm px-2 py-1 border rounded"
                                                >
                                                    {showPassword[item.id] ? "Hide" : "Show"}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(item.password)}
                                                    className="text-cyan-600 hover:text-cyan-800 text-sm px-2 py-1 border rounded"
                                                >
                                                    Copy
                                                </button>
                                            </div>

                                            {item.url ? (
                                                <p className="text-gray-600 mb-1">
                                                    <strong>URL:</strong>
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline ml-1 break-all">
                                                        {item.url}
                                                    </a>
                                                </p>
                                            ) : (
                                                <p className="text-gray-600 mb-1">
                                                    <strong>URL:</strong>
                                                    <span className="text-gray-400 ml-1 text-1xl">Not provided</span>
                                                </p>
                                            )}

                                            {item.notes ? (
                                                <p className="text-gray-600 mb-4">
                                                    <strong>Notes:</strong> {item.notes ? item.notes : "d "}
                                                </p>
                                            ) : (
                                                <p className="text-gray-600 mb-1">
                                                    <strong>Notes:</strong>
                                                    <span className="text-gray-400 ml-1 text-1xl">Not provided</span>
                                                </p>
                                            )
                                            }

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => deleteVaultItem(item.id)}
                                                    className="flex-1 bg-gray-700 text-white py-1 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                                                    disabled={loading}
                                                >
                                                    {loading ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Account Form */}
                    {showAccount && (
                        <div className="flex justify-center p-8">
                            <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-4 shadow-lg">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Account</h2>

                                <input
                                    value={newItem.title}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="Account Title *"
                                />
                                <input
                                    value={newItem.username}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, username: e.target.value }))}
                                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="Email/Username *"
                                />

                                <div className="flex gap-2">
                                    <input
                                        value={newItem.password}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, password: e.target.value }))}
                                        className="flex-1 p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="Password *"
                                        type="text"
                                    />
                                    <button
                                        onClick={generatePassword}
                                        className="bg-cyan-500 text-white px-4 rounded-lg hover:bg-cyan-600 transition-colors"
                                        type="button"
                                    >
                                        Generate
                                    </button>
                                </div>

                                <input
                                    value={newItem.url}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="URL (optional)"
                                />
                                <textarea
                                    value={newItem.notes}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="Notes (optional)"
                                    rows="3"
                                />

                                <button
                                    onClick={saveVaultItem}
                                    className="w-full bg-cyan-500 text-white p-3 rounded-lg font-semibold hover:bg-cyan-600 transition-colors disabled:bg-gray-400"
                                >
                                    {loading ? "Saving..." : "Save Account"}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Vault;