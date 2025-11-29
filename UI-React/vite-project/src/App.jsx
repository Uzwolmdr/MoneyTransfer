import { useState, useEffect } from "react"; //react hooks for state and side effects
import axios from "axios"; //axios for http requests

// Use environment variable for API URL, fallback to localhost for development
//const API = import.meta.env.VITE_API_URL || "http://localhost:5047/api/wallet";
const API = "/api/wallet";

0
// Toast notification component
// shows temporary notification(success/error/info0)
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000); //notification auto dismisses after 4 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-blue-500"; //color coded by type

    //includes a close button
    return (
        <div className={`fixed top-6 right-6 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-in flex items-center gap-3 min-w-[320px] backdrop-blur-sm`}>
            <span className="font-semibold">{message}</span>
            <button onClick={onClose} className="ml-auto text-white hover:text-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

// Contact Card Component
function ContactCard({ contact, isSelected, onClick, type }) {
    const initials = contact.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    
    return (
        <button
            onClick={onClick}
            className={`relative w-full p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                isSelected 
                    ? type === 'sender'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400 shadow-xl shadow-blue-500/30'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 shadow-xl shadow-emerald-500/30'
                    : 'bg-white/90 backdrop-blur-sm border-gray-200 hover:border-blue-300 hover:shadow-lg'
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                    isSelected 
                        ? type === 'sender'
                            ? 'bg-white/20 backdrop-blur-sm'
                            : 'bg-white/20 backdrop-blur-sm'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}>
                    {initials}
                </div>
                <div className="flex-1 text-left">
                    <div className={`font-bold text-lg mb-1 ${
                        isSelected ? 'text-white' : 'text-gray-800'
                    }`}>
                        {contact.name}
                    </div>
                    <div className={`text-sm ${
                        isSelected ? 'text-white/90' : 'text-gray-500'
                    }`}>
                        {contact.phone}
                    </div>
                </div>
                {isSelected && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        type === 'sender' ? 'bg-white/30' : 'bg-white/30'
                    }`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
        </button>
    );
}

export default function App() {
    const [contacts, setContacts] = useState([]);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [exchangeRate] = useState(1.2);
    const [convertedAmount, setConvertedAmount] = useState(0);
    const [toast, setToast] = useState(null);
    const [showSenderList, setShowSenderList] = useState(false);
    const [showReceiverList, setShowReceiverList] = useState(false);

    useEffect(() => {
        axios.get(`${API}/contacts`)
            .then(res => setContacts(res.data))
            .catch(err => {
                console.error(err);
                showToast("Failed to load contacts", "error");
            });
    }, []);

    useEffect(() => {
        if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
            setConvertedAmount((parseFloat(amount) * exchangeRate).toFixed(2));
        } else {
            setConvertedAmount(0);
        }
    }, [amount, exchangeRate]);

    const showToast = (message, type = "info") => {
        setToast({ message, type });
    };

    const sendMoney = async () => {
        if (!from || !to || !amount) {
            showToast("Please fill all fields", "error");
            return;
        }
        if (from === to) {
            showToast("Sender and receiver cannot be the same", "error");
            return;
        }
        if (parseFloat(amount) <= 0) {
            showToast("Amount must be greater than 0", "error");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API}/send`, {
                fromContactId: parseInt(from),
                toContactId: parseInt(to),
                amount: parseFloat(amount)
            });
            showToast("Money sent successfully! 🎉", "success");
            setFrom("");
            setTo("");
            setAmount("");
            setShowSenderList(false);
            setShowReceiverList(false);
        } catch (err) {
            const errorMsg = err?.response?.data?.error || err?.response?.data?.message || "Failed to send money";
            showToast(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    const getSelectedContact = (id) => {
        return contacts.find(contact => contact.id === parseInt(id));
    };

    const availableReceivers = contacts.filter(c => c.id !== parseInt(from));
    const availableSenders = contacts.filter(c => c.id !== parseInt(to));

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Beautiful Gradient Background with Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl mb-6 shadow-2xl border border-white/30">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-3 drop-shadow-2xl">
                            GME Korea Remittance
                        </h1>
                        <p className="text-white/90 text-xl font-medium">Fast, secure, and reliable remittance transfers</p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        <div className="p-8 space-y-6">
                            {/* Sender Selection */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-4 text-sm uppercase tracking-wider">
                                    From Account
                                </label>
                                {from ? (
                                    <ContactCard
                                        contact={getSelectedContact(from)}
                                        isSelected={true}
                                        onClick={() => {
                                            setFrom("");
                                            setShowSenderList(true);
                                        }}
                                        type="sender"
                                    />
                                ) : (
                                    <button
                                        onClick={() => setShowSenderList(!showSenderList)}
                                        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 text-left bg-white/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-lg">Select Sender</div>
                                                <div className="text-sm text-gray-500">Choose who is sending money</div>
                                            </div>
                                        </div>
                                    </button>
                                )}

                                {/* Sender List */}
                                {showSenderList && !from && (
                                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto p-2">
                                        {availableSenders.map(contact => (
                                            <ContactCard
                                                key={contact.id}
                                                contact={contact}
                                                isSelected={false}
                                                onClick={() => {
                                                    setFrom(contact.id.toString());
                                                    setShowSenderList(false);
                                                }}
                                                type="sender"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Arrow Separator */}
                            {(from || to) && (
                                <div className="flex justify-center my-2">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Receiver Selection */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-4 text-sm uppercase tracking-wider">
                                    Send To
                                </label>
                                {to ? (
                                    <ContactCard
                                        contact={getSelectedContact(to)}
                                        isSelected={true}
                                        onClick={() => {
                                            setTo("");
                                            setShowReceiverList(true);
                                        }}
                                        type="receiver"
                                    />
                                ) : (
                                    <button
                                        onClick={() => setShowReceiverList(!showReceiverList)}
                                        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-300 text-left bg-white/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-lg">Select Receiver</div>
                                                <div className="text-sm text-gray-500">Choose who will receive money</div>
                                            </div>
                                        </div>
                                    </button>
                                )}

                                {/* Receiver List */}
                                {showReceiverList && !to && (
                                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto p-2">
                                        {availableReceivers.map(contact => (
                                            <ContactCard
                                                key={contact.id}
                                                contact={contact}
                                                isSelected={false}
                                                onClick={() => {
                                                    setTo(contact.id.toString());
                                                    setShowReceiverList(false);
                                                }}
                                                type="receiver"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Amount Input */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <label className="block text-gray-700 font-bold mb-4 text-sm uppercase tracking-wider">
                                    Amount to Send
                                </label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-3xl font-bold">$</div>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full border-2 border-gray-200 rounded-2xl pl-16 pr-6 py-6 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200 text-4xl font-bold text-gray-800 bg-white shadow-inner"
                                    />
                                </div>

                                {/* Exchange Rate Display */}
                                {amount && !isNaN(amount) && parseFloat(amount) > 0 && (
                                    <div className="mt-4 p-5 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border-2 border-emerald-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-gray-600 font-semibold">Exchange Rate</span>
                                            <span className="font-bold text-gray-800 text-lg">1 USD = {exchangeRate} EUR</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t-2 border-emerald-200">
                                            <span className="text-gray-600 font-semibold">Receiver Gets</span>
                                            <span className="font-bold text-3xl text-emerald-600">{convertedAmount} EUR</span>
                                        </div>
                                    </div>
                                )}

                                {/* Quick Amount Buttons */}
                                <div className="mt-5">
                                    <div className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Quick Select</div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {[50, 100, 200, 500, 1000].map(quickAmount => (
                                            <button
                                                key={quickAmount}
                                                onClick={() => setAmount(quickAmount.toString())}
                                                className={`h-12 px-4 rounded-xl font-bold transition-all duration-200 ${
                                                    amount === quickAmount.toString()
                                                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                                                        : "bg-gray-100 hover:bg-blue-100 text-gray-700 hover:scale-105 border-2 border-transparent hover:border-blue-300"
                                                }`}
                                            >
                                                ${quickAmount}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={sendMoney}
                                disabled={loading || !from || !to || !amount || parseFloat(amount) <= 0}
                                className={`w-full h-16 px-6 rounded-2xl font-bold text-white text-lg transition-all duration-300 transform ${
                                    loading || !from || !to || !amount || parseFloat(amount) <= 0
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:scale-[1.02] hover:shadow-2xl active:scale-100 shadow-xl"
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing Transfer...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        <span>Send ${amount || "0.00"}</span>
                                    </div>
                                )}
                            </button>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm pt-4 border-t border-gray-200">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="font-semibold">Bank-level encryption & security</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
