// File: libs/prisma.js
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'development') {
  if (!global.prisma) {
    global.prisma = new PrismaClient(); 
  }
  prisma = global.prisma;
} else {
  prisma = new PrismaClient();
}

module.exports = prisma;
