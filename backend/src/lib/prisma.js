// src/lib/prisma.js
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();


// 1. Create the connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Create the adapter
const adapter = new PrismaPg(pool);


// 3. Pass the adapter to the client (This fixes the initialization error!)
const prisma = new PrismaClient({ adapter });

module.exports = prisma;