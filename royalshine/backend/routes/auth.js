// backend/routes/auth.js

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');

// The DB connection and SECRET_KEY are expected to be attached via middleware in server.js
// We define transporter locally if it's not passed, but use the DB/SECRET from req.

// --- Nodemailer transporter (Needs to be defined if not attached globally) ---
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, 
    secure: true,
    auth: {
        user: "maniselvisrini@gmail.com",
        pass: "tpnmvoxklvjmedlp", 
    },
});

// Note: Register/Login routes are now primarily in server.js, but kept here for fallback/completeness.
// Assuming your system uses the routes defined in server.js for actual auth.

// 💥 THE DELETION ROUTE - Synchronized to use 'users' table
router.delete("/users/:id", async (req, res) => {
    const db = req.db; // Get promise-based connection
    const SECRET_KEY = req.SECRET_KEY; // Get secret key

    const userId = req.params.id;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    let connection;
    try {
        // --- 1. JWT Verification ---
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.id != userId) {
            return res.status(403).json({ success: false, message: "Unauthorized: Can only delete your own account" });
        }
    } catch (err) {
        console.error("❌ Token verification failed:", err.message);
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    // --- 2. Database Transaction ---
    try {
        connection = await db.getConnection(); 
        await connection.beginTransaction();

        // Fetch user details from 'users' table (SYNCHRONIZED)
        const [userDetails] = await connection.query(
            "SELECT fullname, email FROM users WHERE id = ?",
            [userId]
        );

        if (userDetails.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { fullname, email } = userDetails[0];

        // --- 3. CASCADING DELETION ---
        // The order is crucial: order_items -> orders -> cart/wishlist -> users
        await connection.query(
            "DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)",
            [userId]
        );
        await connection.query("DELETE FROM orders WHERE user_id = ?", [userId]);
        await connection.query("DELETE FROM cart WHERE user_id = ?", [userId]);
        await connection.query("DELETE FROM wishlist WHERE user_id = ?", [userId]);

        // Delete from the main users table
        const [result] = await connection.query(
            "DELETE FROM users WHERE id = ?",
            [userId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "User not found or already deleted" });
        }

        await connection.commit();
        console.log(`✅ User ${userId} and related records deleted permanently`);

        // --- 4. Send Deletion Confirmation Email ---
        const deleteEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #b8860b; text-align: center;">Account Deletion Confirmed 💎</h2>
                <p>Dear ${fullname},</p>
                <p>Your account and all associated data have been permanently deleted from our system.</p>
                <p>Best regards,<br>The Royal Shine Jewels Team</p>
            </div>
        `;
        
        try {
            await transporter.sendMail({
                from: '"Royal Shine Jewels" <maniselvisrini@gmail.com>',
                to: email,
                subject: "Account Deletion Confirmation - Royal Shine Jewels",
                html: deleteEmailHtml,
            });
            console.log("✅ Deletion confirmation email sent to:", email);
        } catch (mailErr) {
            console.error("❌ Error sending deletion email:", mailErr);
        }

        res.json({
            success: true,
            message: "Account and related data deleted successfully",
        });

    } catch (err) {
        if (connection) await connection.rollback();
        
        // This log is crucial for final debugging
        console.error("❌ FATAL DB/TRANSACTION ERROR (ROLLBACK EXECUTED):", err.message, err.sql);
        
        let errorMessage = "Server error while deleting account. Please try again later.";
        
        if (err.code === 'ER_NO_SUCH_TABLE') {
             errorMessage = "Database error: A table in the deletion list is missing. Check your schema!";
        } 
        
        res.status(500).json({ success: false, message: errorMessage });
    } finally {
        if (connection) connection.release();
    }
});

// Google OAuth Login Route
router.post('/google-login', async (req, res) => {
    const db = req.db;
    const SECRET_KEY = req.SECRET_KEY;
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ success: false, message: 'Credential is required' });
    }

    try {
        const client = new OAuth2Client("214862082349-v26rc2j9l4k2lc5ciosmadk8feps8a29.apps.googleusercontent.com");
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: "214862082349-v26rc2j9l4k2lc5ciosmadk8feps8a29.apps.googleusercontent.com",
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name: fullname } = payload;

        let connection;
        try {
            connection = await db.getConnection();

            // Check if user exists
            const [existingUser] = await connection.query(
                'SELECT id, fullname, email FROM users WHERE google_id = ? OR email = ?',
                [googleId, email]
            );

            let user;
            if (existingUser.length > 0) {
                user = existingUser[0];
                // Update Google ID if not set
                if (!user.google_id) {
                    await connection.query(
                        'UPDATE users SET google_id = ? WHERE id = ?',
                        [googleId, user.id]
                    );
                }
            } else {
                // Create new user
                const [result] = await connection.query(
                    'INSERT INTO users (fullname, email, google_id, created_at) VALUES (?, ?, ?, NOW())',
                    [fullname, email, googleId]
                );
                user = { id: result.insertId, fullname, email };
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                SECRET_KEY,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                token,
                userId: user.id,
                user,
                message: 'Google login successful'
            });

        } catch (dbErr) {
            console.error('Database error:', dbErr);
            res.status(500).json({ success: false, message: 'Database error' });
        } finally {
            if (connection) connection.release();
        }

    } catch (err) {
        console.error('Google OAuth error:', err);
        res.status(401).json({ success: false, message: 'Invalid Google credential' });
    }
});

module.exports = router;
