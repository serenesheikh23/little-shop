// server/db.js
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('shop.db');

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

// ===== SCHEMA =====
// Create all tables if they don't exist (safe to re-run)
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    emoji TEXT,
    description TEXT,
    stock INTEGER NOT NULL DEFAULT 10,
    category_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id),
    UNIQUE(user_id, product_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS wishlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_id) REFERENCES products(id),
    UNIQUE(user_id, product_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT,
    customer_email TEXT,
    customer_address TEXT,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS stock_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    notified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id),
    UNIQUE(product_id, email)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER,
    username TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

// ===== SEED DATA =====
// Only seed if tables are completely empty

const catCount = db.prepare('SELECT count(*) as count FROM categories').get();
if (catCount.count === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
  const categories = ["bags", "home", "clothing", "office", "electronics", "sports"];
  const catIds = categories.map(name => {
    insertCat.run(name);
    return db.prepare('SELECT id FROM categories WHERE name = ?').get(name).id;
  });
  const catMap = {};
  categories.forEach((name, i) => { catMap[name] = catIds[i]; });

  const insertProd = db.prepare(`
    INSERT INTO products (name, price, image, emoji, description, stock, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const products = [
    ["Canvas Tote", 28, "https://picsum.photos/seed/tote1/400", "👜", "Sturdy cotton canvas, fits a 15\" laptop.", 15, catMap.bags],
    ["Ceramic Mug", 16, "https://picsum.photos/seed/mug1/400", "☕", "Hand-glazed stoneware, 12oz. Dishwasher safe.", 30, catMap.home],
    ["Wool Scarf", 34, "https://picsum.photos/seed/scarf1/400", "🧣", "Merino wool, one size fits all.", 20, catMap.clothing],
    ["Desk Lamp", 45, "https://picsum.photos/seed/lamp1/400", "💡", "Adjustable arm, warm LED bulb included.", 12, catMap.home],
    ["Notebook", 12, "https://picsum.photos/seed/note1/400", "📓", "Dot grid, 160 pages, elastic closure.", 50, catMap.office],
    ["Plant Pot", 22, "https://picsum.photos/seed/plant1/400", "🪴", "Terracotta, drainage hole, 6in diameter.", 25, catMap.home],
    ["Backpack", 65, "https://picsum.photos/seed/backpack1/400", "🎒", "Waterproof nylon, padded laptop sleeve, multiple compartments.", 10, catMap.bags],
    ["Wireless Mouse", 32, "https://picsum.photos/seed/mouse1/400", "🖱️", "Ergonomic design, rechargeable, silent clicks.", 18, catMap.electronics],
    ["Yoga Mat", 25, "https://picsum.photos/seed/yoga1/400", "🧘", "Non-slip surface, 6mm thick, includes carry strap.", 22, catMap.sports],
    ["T-Shirt", 20, "https://picsum.photos/seed/tshirt1/400", "👕", "100% organic cotton, pre-shrunk, available in 5 colors.", 40, catMap.clothing],
  ];
  const insertMany = db.transaction((items) => {
    for (const item of items) insertProd.run(...item);
  });
  insertMany(products);
}

const userCount = db.prepare('SELECT count(*) as count FROM users').get();
if (userCount.count === 0) {
  const hash = bcrypt.hashSync('password', 10);
  db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)').run('admin', 'admin@shop.local', hash, 'admin');
  db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)').run('demo', 'demo@shop.local', hash, 'user');
  console.log("✅ Seed users created: admin/password (admin), demo/password (user)");
}

console.log("✅ Database ready!");
module.exports = db;