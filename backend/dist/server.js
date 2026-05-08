"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const migrations_1 = require("./migrations");
const api_1 = __importDefault(require("./routes/api"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const superadmin_routes_1 = __importDefault(require("./routes/superadmin.routes"));
const master_routes_1 = __importDefault(require("./routes/master.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const frontendUrl = process.env.FRONTEND_URL || '';
        const allowed = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003',
            frontendUrl,
        ].filter(Boolean);
        if (!origin || allowed.includes(origin) || (frontendUrl && origin.endsWith('.vercel.app'))) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Routes
app.use('/api', auth_routes_1.default);
app.use('/api', superadmin_routes_1.default);
app.use('/api', api_1.default);
app.use('/api', master_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Start server
async function start() {
    try {
        await (0, database_1.connectDB)();
        await (0, migrations_1.runMigrations)();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map