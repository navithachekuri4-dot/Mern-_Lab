const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'customers.json');

// Initialize database file if it doesn't exist
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);
    const initialData = [
      {
        id: 'cust_' + Math.random().toString(36).substring(2, 9),
        name: 'Sarah Chen',
        email: 'sarah.chen@shopkart.io',
        phone: '+1 (555) 234-5678',
        passwordHash: defaultPasswordHash,
        tier: 'Gold Member',
        createdAt: '2024-01-15T08:30:00.000Z',
        ordersCount: 14,
        savedAddressesCount: 2
      }
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

initDB();

function getCustomers() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function saveCustomers(customers) {
  fs.writeFileSync(DB_FILE, JSON.stringify(customers, null, 2), 'utf-8');
}

const db = {
  findByEmail(email) {
    if (!email) return null;
    const customers = getCustomers();
    return customers.find(c => c.email.toLowerCase() === email.trim().toLowerCase()) || null;
  },

  findById(id) {
    if (!id) return null;
    const customers = getCustomers();
    return customers.find(c => c.id === id) || null;
  },

  create({ name, email, phone, passwordHash }) {
    const customers = getCustomers();
    const newCustomer = {
      id: 'cust_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      passwordHash,
      tier: 'Standard Member',
      createdAt: new Date().toISOString(),
      ordersCount: 0,
      savedAddressesCount: 1
    };
    customers.push(newCustomer);
    saveCustomers(customers);
    return newCustomer;
  },

  updatePassword(id, newPasswordHash) {
    const customers = getCustomers();
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    customers[index].passwordHash = newPasswordHash;
    customers[index].updatedAt = new Date().toISOString();
    saveCustomers(customers);
    return customers[index];
  }
};

module.exports = db;
