// server/reset_db.js
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('shop.db');

// 1. Nuke everything to guarantee a fresh start
db.exec(`DROP TABLE IF EXISTS products`);
db.exec(`DROP TABLE IF EXISTS categories`);
db.exec(`DROP TABLE IF EXISTS users`);

// 2. Recreate tables
db.exec(`
  CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);

db.exec(`
  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    emoji TEXT,
    description TEXT,
    category_id INTEGER,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  )
`);

db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )
`);

// 3. Seed Categories
const insertCat = db.prepare('INSERT INTO categories (name) VALUES (?)');
const categories = ["bags", "home", "clothing", "office"];
const catIds = categories.map(name => {
  insertCat.run(name);
  return db.prepare('SELECT id FROM categories WHERE name = ?').get(name).id;
});
const catMap = { "bags": catIds[0], "home": catIds[1], "clothing": catIds[2], "office": catIds[3] };

// 4. Seed Products (with guaranteed images)
const insertProd = db.prepare(`
  INSERT INTO products (name, price, image, emoji, description, category_id) 
  VALUES (?, ?, ?, ?, ?, ?)
`);
const products = [
  ["Canvas Tote", 28, "https://picsum.photos/seed/tote1/400", "👜", "Sturdy cotton canvas, fits a 15\" laptop.", catMap.bags],
  ["Ceramic Mug", 16, "https://picsum.photos/seed/mug1/400", "☕", "Hand-glazed stoneware, 12oz.", catMap.home],
  ["Wool Scarf", 34, "https://picsum.photos/seed/scarf1/400", "🧣", "Merino wool, one size.", catMap.clothing],
  ["Desk Lamp", 45, "https://picsum.photos/seed/lamp1/400", "💡", "Adjustable arm, warm LED bulb included.", catMap.home],
  ["Notebook", 12, "https://picsum.photos/seed/note1/400", "📓", "Dot grid, 160 pages, elastic closure.", catMap.office],
  ["Plant Pot", 22, "https://picsum.photos/seed/plant1/400", "🪴", "Terracotta, drainage hole, 6in diameter.", catMap.home]
];
const insertMany = db.transaction((items) => {
  for (const item of items) insertProd.run(...item);
});
insertMany(products);

// 5. Seed Admin User (username: admin, password: password)
const hash = bcrypt.hashSync('password', 10);
db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);

console.log("✅ DATABASE FULLY RESET. Users, Categories, and Products seeded successfully!");
console.log("   Username: admin");
console.log("   Password: password");