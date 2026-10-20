// Mock Database (Users with IDs 1, 2, 3)
const users = [
    { id: 1, name: "Karn Dumne", email: "karn1@nexorbite.com", role: "admin", phone: "9876543210" },
    { id: 2, name: "Rahul Sharma", email: "rahul1@nexorbite.com", role: "user", phone: "9123456782" },
    { id: 3, name: "Amit Verma", email: "amit1@nexorbite.com", role: "user", phone: "9988776654" },
        { id: 4, name: "Karn Dumne2", email: "karn2@nexorbite.com", role: "admin", phone: "9876543210" },
    { id: 5, name: "Rahul Sharma2", email: "rahul2@nexorbite.com", role: "user", phone: "9123456789" },
    { id: 6, name: "Amit Verma2", email: "amit2@nexorbite.com", role: "user", phone: "9988776655" },
        { id: 7, name: "Karn Dumne3", email: "karn3@nexorbite.com", role: "admin", phone: "9876543210" },
    { id: 8, name: "Rahul Sharma3", email: "rahul3@nexorbite.com", role: "user", phone: "9123456789" },
    { id: 9, name: "Amit Verma3", email: "amit3@nexorbite.com", role: "user", phone: "9988776655" }
];

// Secure Get User Handler
const getUserById = (req, res) => {
    const requestedId = parseInt(req.params.id);

    // Find user in mock DB
    const targetUser = users.find(u => u.id === requestedId);

    if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // --- IDOR / BOLA FIX / SECURITY CHECK ---
    // Check karo ki kya logged-in user khud ki profile access kar raha hai YA phir woh admin hai?
    // req.user ye verifyToken middleware se aayega
const loggedInUserId = Number(req.user.id);

const loggedInUserRole = req.user.role;

// Debugging ke liye ek baar print karake dekh le terminal mein
console.log({ loggedInUserId, requestedId, loggedInUserRole });

if (loggedInUserRole !== 'admin' && loggedInUserId !== requestedId) {
    return res.status(403).json({ 
        success: false, 
        message: "Access denied: Unauthorized to view other user's data (IDOR prevented)" 
    });
}
    // ----------------------------------------

    return res.status(200).json({
        success: true,
        data: targetUser
    });
};

module.exports = { getUserById };