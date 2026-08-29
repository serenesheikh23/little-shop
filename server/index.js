// server/index.js — Full E-Commerce Backend API
const express = require('express');
const cors = require('cors');
const db = require('./db');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});
const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));

// ===== AUTH MIDDLEWARE =====

// Authenticate — any logged-in user (optional: pass `adminOnly: true`)
function authenticate(adminOnly = false) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
      req.user = decoded;
      if (adminOnly && decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

// ===== AUTH ENDPOINTS =====

app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) return res.status(400).json({ error: 'Username already exists' });

    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
    stmt.run(username, email || null, hash, 'user');

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authenticate(), (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/api/auth/profile', authenticate(), (req, res) => {
  try {
    const { email } = req.body;
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, req.user.id);
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== PRODUCT ENDPOINTS =====

// List products — with pagination, search, category filter, sort
app.get('/api/products', (req, res) => {
  try {
    const { search, category, page = 1, limit = 20, sort = 'newest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = [];
    let params = [];

    if (search) {
      where.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category && category !== 'all') {
      where.push('c.name = ?');
      params.push(category);
    }
    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = db.prepare(`SELECT count(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`).get(...params);
    const total = countResult.total;

    // Sorting options
    let orderBy = 'p.created_at DESC';
    if (sort === 'price_low') orderBy = 'p.price ASC';
    else if (sort === 'price_high') orderBy = 'p.price DESC';
    else if (sort === 'name') orderBy = 'p.name ASC';

    const products = db.prepare(`
      SELECT p.*, c.name as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({ products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search suggestions (autocomplete)
app.get('/api/search/suggestions', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const products = db.prepare(`
      SELECT p.id, p.name, p.price, p.emoji, c.name as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.name LIKE ?
      ORDER BY CASE WHEN p.name LIKE ? THEN 0 ELSE 1 END, p.name
      LIMIT 6
    `).all(`%${q}%`, `${q}%`);

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Product get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get related products (same category, excluding current)
app.get('/api/products/:id/related', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const product = db.prepare('SELECT category_id FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let related;
    if (product.category_id) {
      // Same category first
      related = db.prepare(`
        SELECT p.*, c.name as category
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ? AND p.id != ?
        ORDER BY RANDOM()
        LIMIT ?
      `).all(product.category_id, req.params.id, limit);
    } else {
      related = [];
    }

    // If not enough, fill with random other products
    if (related.length < limit) {
      const need = limit - related.length;
      const excludeIds = [parseInt(req.params.id), ...related.map(r => r.id)];
      const placeholders = excludeIds.map(() => '?').join(',');
      const fillers = db.prepare(`
        SELECT p.*, c.name as category
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id NOT IN (${placeholders})
        ORDER BY RANDOM()
        LIMIT ?
      `).all(...excludeIds, need);
      related = [...related, ...fillers];
    }

    res.json(related);
  } catch (err) {
    console.error('Related products error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product (admin only)
app.post('/api/products', authenticate(true), upload.single('image'), (req, res) => {
  try {
    const { name, price, emoji, description, stock, category_id } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const finalCategoryId = category_id === '' || category_id === 'null' ? null : category_id;
    const stmt = db.prepare(`
      INSERT INTO products (name, price, image, emoji, description, stock, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, parseFloat(price), image, emoji || null, description || null, parseInt(stock) || 10, finalCategoryId);
    const newProduct = db.prepare(`
      SELECT p.*, c.name as category
      FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?
    `).get(info.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Product create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product (admin only)
app.put('/api/products/:id', authenticate(true), upload.single('image'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, price, emoji, description, stock, category_id, existingImage } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : (existingImage || existing.image);
    const finalCategoryId = category_id === '' || category_id === 'null' ? null : category_id;

    db.prepare(`
      UPDATE products SET name = ?, price = ?, image = ?, emoji = ?, description = ?, stock = ?, category_id = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      parseFloat(price) || existing.price,
      image,
      emoji || existing.emoji,
      description || existing.description,
      parseInt(stock) ?? existing.stock,
      finalCategoryId,
      req.params.id
    );
    const updated = db.prepare(`
      SELECT p.*, c.name as category
      FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?
    `).get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', authenticate(true), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    db.prepare('DELETE FROM cart WHERE product_id = ?').run(req.params.id);
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Product delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== CATEGORY ENDPOINTS =====

app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/categories', authenticate(true), (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const info = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    res.status(201).json(db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid));
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return res.status(400).json({ error: 'Category already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/categories/:id', authenticate(true), (req, res) => {
  try {
    const { name } = req.body;
    db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, req.params.id);
    res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/categories/:id', authenticate(true), (req, res) => {
  try {
    db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(req.params.id);
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== CART ENDPOINTS =====

// Get user's cart
app.get('/api/cart', authenticate(), (req, res) => {
  try {
    const items = db.prepare(`
      SELECT c.id, c.quantity, c.product_id,
             p.name, p.price, p.image, p.emoji, p.stock, p.description
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.id
    `).all(req.user.id);
    res.json(items);
  } catch (err) {
    console.error('Cart get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to cart
app.post('/api/cart', authenticate(), (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Product ID is required' });

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = db.prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
    if (existing) {
      const newQty = existing.quantity + parseInt(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({ error: `Only ${product.stock} items available in stock` });
      }
      db.prepare('UPDATE cart SET quantity = ? WHERE id = ?').run(newQty, existing.id);
    } else {
      db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, product_id, parseInt(quantity));
    }
    res.json({ success: true, message: 'Item added to cart' });
  } catch (err) {
    console.error('Cart add error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item quantity
app.put('/api/cart/:id', authenticate(), (req, res) => {
  try {
    const { quantity } = req.body;
    const item = db.prepare('SELECT * FROM cart WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    if (quantity <= 0) {
      db.prepare('DELETE FROM cart WHERE id = ?').run(req.params.id);
      return res.json({ success: true, message: 'Item removed from cart' });
    }
    db.prepare('UPDATE cart SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Cart update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
app.delete('/api/cart/:id', authenticate(), (req, res) => {
  try {
    db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear cart
app.delete('/api/cart', authenticate(), (req, res) => {
  try {
    db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== ORDER ENDPOINTS =====

// Create order (checkout)
app.post('/api/orders', authenticate(), (req, res) => {
  try {
    const { customer_name, customer_email, customer_address } = req.body;
    if (!customer_name || !customer_email || !customer_address) {
      return res.status(400).json({ error: 'Name, email, and address are required' });
    }

    // Get cart items
    const cartItems = db.prepare(`
      SELECT c.quantity, c.product_id, p.name, p.price, p.stock
      FROM cart c JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `).all(req.user.id);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({
          error: `Insufficient stock for "${item.name}". Available: ${item.stock}, requested: ${item.quantity}`
        });
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order and order items in a transaction
    const createOrder = db.transaction(() => {
      const orderInfo = db.prepare(`
        INSERT INTO orders (user_id, customer_name, customer_email, customer_address, total, status)
        VALUES (?, ?, ?, ?, ?, 'confirmed')
      `).run(req.user.id, customer_name, customer_email, customer_address, total);

      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const item of cartItems) {
        insertItem.run(orderInfo.lastInsertRowid, item.product_id, item.name, item.price, item.quantity);
        // Decrease stock
        db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
      }

      // Clear cart
      db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);

      return orderInfo.lastInsertRowid;
    });

    const orderId = createOrder();

    const order = db.prepare(`
      SELECT * FROM orders WHERE id = ?
    `).get(orderId);

    const orderItems = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).all(orderId);

    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    console.error('Order create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's orders
app.get('/api/orders', authenticate(), (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    const ordersWithItems = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });
    res.json(ordersWithItems);
  } catch (err) {
    console.error('Orders list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order
app.get('/api/orders/:id', authenticate(), (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== ADMIN ORDER ENDPOINTS =====

// List all orders (admin)
app.get('/api/admin/orders', authenticate(true), (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, u.username
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all();

    const ordersWithItems = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });
    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (admin)
app.put('/api/admin/orders/:id', authenticate(true), (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== STATS (admin dashboard) =====
app.get('/api/admin/stats', authenticate(true), (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT count(*) as count FROM products').get().count;
    const totalOrders = db.prepare('SELECT count(*) as count FROM orders').get().count;
    const totalUsers = db.prepare('SELECT count(*) as count FROM users').get().count;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE status != ?').get('cancelled').sum;
    const lowStock = db.prepare('SELECT count(*) as count FROM products WHERE stock < 5').get().count;
    res.json({ totalProducts, totalOrders, totalUsers, totalRevenue, lowStock });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== WISHLIST ENDPOINTS =====

// Get user's wishlist
app.get('/api/wishlist', authenticate(), (req, res) => {
  try {
    const items = db.prepare(`
      SELECT w.id, w.product_id, w.created_at,
             p.name, p.price, p.image, p.emoji, p.stock, p.description, p.category_id,
             c.name as category
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `).all(req.user.id);
    res.json(items);
  } catch (err) {
    console.error('Wishlist get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add product to wishlist
app.post('/api/wishlist/:productId', authenticate(), (req, res) => {
  try {
    const { productId } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = db.prepare('SELECT * FROM wishlists WHERE user_id = ? AND product_id = ?').get(req.user.id, productId);
    if (existing) return res.status(400).json({ error: 'Product already in wishlist' });

    db.prepare('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)').run(req.user.id, productId);
    res.status(201).json({ success: true, message: 'Added to wishlist' });
  } catch (err) {
    console.error('Wishlist add error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove product from wishlist
app.delete('/api/wishlist/:productId', authenticate(), (req, res) => {
  try {
    db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    console.error('Wishlist delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== STOCK NOTIFICATION ENDPOINTS =====

// Subscribe to stock notification (when out of stock)
app.post('/api/products/:id/notify-me', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock > 0) {
      return res.status(400).json({ error: 'Product is already in stock' });
    }

    try {
      db.prepare('INSERT INTO stock_notifications (product_id, email) VALUES (?, ?)').run(req.params.id, email);
      res.status(201).json({ success: true, message: 'You will be notified when this product is back in stock' });
    } catch (err) {
      if (err.message?.includes('UNIQUE')) {
        return res.status(400).json({ error: 'This email is already subscribed for this product' });
      }
      throw err;
    }
  } catch (err) {
    console.error('Stock notify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== REVIEW ENDPOINTS =====

// Get reviews for a product (with average rating)
app.get('/api/products/:id/reviews', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT id, user_id, username, rating, comment, created_at
      FROM reviews WHERE product_id = ? ORDER BY created_at DESC
    `).all(req.params.id);

    const stats = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as average
      FROM reviews WHERE product_id = ?
    `).get(req.params.id);

    // Rating distribution
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      const row = db.prepare(`
        SELECT COUNT(*) as count FROM reviews WHERE product_id = ? AND rating = ?
      `).get(req.params.id, i);
      distribution[i] = row.count;
    }

    res.json({
      reviews,
      summary: {
        count: stats.count,
        average: parseFloat(stats.average.toFixed(1)),
        distribution
      }
    });
  } catch (err) {
    console.error('Reviews get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a review (requires auth)
app.post('/api/products/:id/reviews', authenticate(), (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Check if user already reviewed this product
    const existing = db.prepare('SELECT * FROM reviews WHERE product_id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const info = db.prepare(`
      INSERT INTO reviews (product_id, user_id, username, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.id, req.user.id, req.user.username, rating, comment || null);

    const review = db.prepare(`
      SELECT id, user_id, username, rating, comment, created_at
      FROM reviews WHERE id = ?
    `).get(info.lastInsertRowid);

    res.status(201).json(review);
  } catch (err) {
    console.error('Review create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => console.log(`✅ E-Commerce API running on http://localhost:${PORT}`));