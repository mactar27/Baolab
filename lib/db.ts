import mysql from "mysql2"
import fs from "fs"
import path from "path"
import { kv } from "@vercel/kv"
import { type Product, initialProducts } from "./products"

// Types for Orders
export type OrderItem = {
  id?: number
  order_id?: string
  product_id: string
  product_name: string
  quantity: number
  price: number
}

export type Order = {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  total_price: number
  status: string
  created_at?: string | Date
  items?: OrderItem[]
}

// Connection pool configuration
const dbHost = process.env.DB_HOST || "localhost"
const sslConfig = !["localhost", "127.0.0.1"].includes(dbHost)
  ? { rejectUnauthorized: true }
  : undefined

const pool = mysql.createPool({
  host: dbHost,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "baolab_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig,
}).promise()

export default pool

// Fallback JSON / Vercel KV DB Helpers
const fallbackFilePath = path.join(process.cwd(), "lib/data/db-fallback.json")

async function readFallback(): Promise<{ products: Product[]; orders: Order[]; settings?: Record<string, string> }> {
  // 1. Try Vercel KV if configured (zero-config database fallback on Vercel)
  if (process.env.KV_REST_API_URL) {
    try {
      const data = await kv.get<{ products: Product[]; orders: Order[]; settings?: Record<string, string> }>("baolab_db")
      if (data) {
        if (!data.settings) data.settings = {}
        return data
      }
    } catch (e) {
      console.error("Error reading from Vercel KV:", e)
    }
  }

  // 2. Fall back to local JSON file
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const raw = fs.readFileSync(fallbackFilePath, "utf8")
      const parsed = JSON.parse(raw)
      if (!parsed.settings) parsed.settings = {}
      return parsed
    }
  } catch (e) {
    console.error("Error reading fallback JSON file:", e)
  }
  return { products: initialProducts, orders: [], settings: {} }
}

async function writeFallback(data: { products: Product[]; orders: Order[]; settings?: Record<string, string> }) {
  // 1. Try Vercel KV if configured
  if (process.env.KV_REST_API_URL) {
    try {
      await kv.set("baolab_db", data)
    } catch (e) {
      console.error("Error writing to Vercel KV:", e)
    }
  }

  // 2. Write to local JSON file (might fail on Vercel read-only system, which is caught gracefully)
  try {
    const dir = path.dirname(fallbackFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(fallbackFilePath, JSON.stringify(data, null, 2), "utf8")
  } catch (e) {
    // Gracefully catch read-only filesystem error on serverless hosting
  }
}

// Initialize tables if MySQL is connected
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        \`key\` VARCHAR(100) PRIMARY KEY,
        \`value\` TEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        platform VARCHAR(50) NOT NULL,
        price INT NOT NULL,
        oldPrice INT NULL,
        image VARCHAR(255) NOT NULL,
        badge VARCHAR(50) NULL,
        specs JSON NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_address TEXT NOT NULL,
        total_price INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'En attente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(100) NOT NULL,
        product_id VARCHAR(100) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price INT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log("MySQL Database tables verified/initialized successfully.")
  } catch (err) {
    console.error("Database initialization error detail:", err)
    console.warn("Could not initialize MySQL database tables (MySQL may be offline). Using fallback JSON database.")
  }
}
initializeDatabase()

// --- PRODUCTS CRUD ---

/**
 * Retrieves all products from the database or the local JSON fallback.
 */
export async function getProductsFromDb(): Promise<Product[]> {
  try {
    const [rows] = await pool.query("SELECT * FROM products")
    const dbProducts = rows as any[]

    if (dbProducts.length === 0) {
      console.log("TiDB products table is empty. Seeding with default products...")
      for (const product of initialProducts) {
        await pool.query(
          `INSERT INTO products (id, name, brand, category, platform, price, oldPrice, image, badge, specs)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.id,
            product.name,
            product.brand,
            product.category,
            product.platform,
            product.price,
            product.oldPrice || null,
            product.image,
            product.badge || null,
            JSON.stringify(product.specs),
          ]
        )
      }
      return initialProducts
    }

    return dbProducts.map((row) => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      category: row.category,
      platform: row.platform,
      price: Number(row.price),
      oldPrice: row.oldPrice ? Number(row.oldPrice) : undefined,
      image: row.image,
      badge: row.badge || undefined,
      specs: typeof row.specs === "string" ? JSON.parse(row.specs) : row.specs,
    }))
  } catch (error) {
    console.error("Database fetch products error detail:", error)
    console.warn("MySQL database is not reachable. Falling back to static or local JSON products.")
    return (await readFallback()).products
  }
}

/**
 * Adds a new product to the database (and saves to fallback).
 */
export async function addProduct(product: Product): Promise<boolean> {
  // Update fallback anyway
  const fallback = await readFallback()
  fallback.products.push(product)
  await writeFallback(fallback)

  try {
    await pool.query(
      `INSERT INTO products (id, name, brand, category, platform, price, oldPrice, image, badge, specs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.name,
        product.brand,
        product.category,
        product.platform,
        product.price,
        product.oldPrice || null,
        product.image,
        product.badge || null,
        JSON.stringify(product.specs),
      ]
    )
    return true
  } catch (error) {
    console.warn("Failed to write to MySQL database. Saved to local fallback JSON.", error)
    return true
  }
}

/**
 * Updates an existing product (and saves to fallback).
 */
export async function updateProduct(id: string, product: Omit<Product, "id">): Promise<boolean> {
  const fallback = await readFallback()
  const idx = fallback.products.findIndex((p) => p.id === id)
  if (idx !== -1) {
    fallback.products[idx] = { ...product, id }
    await writeFallback(fallback)
  }

  try {
    await pool.query(
      `UPDATE products 
       SET name = ?, brand = ?, category = ?, platform = ?, price = ?, oldPrice = ?, image = ?, badge = ?, specs = ?
       WHERE id = ?`,
      [
        product.name,
        product.brand,
        product.category,
        product.platform,
        product.price,
        product.oldPrice || null,
        product.image,
        product.badge || null,
        JSON.stringify(product.specs),
        id,
      ]
    )
    return true
  } catch (error) {
    console.warn("Failed to update in MySQL database. Saved to local fallback JSON.", error)
    return true
  }
}

/**
 * Deletes a product by ID (and saves to fallback).
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const fallback = await readFallback()
  fallback.products = fallback.products.filter((p) => p.id !== id)
  await writeFallback(fallback)

  try {
    await pool.query("DELETE FROM products WHERE id = ?", [id])
    return true
  } catch (error) {
    console.warn("Failed to delete from MySQL database. Removed from local fallback JSON.", error)
    return true
  }
}

// --- ORDERS MANAGEMENT ---

/**
 * Creates a new customer order.
 */
export async function createOrder(
  order: Omit<Order, "created_at" | "items">,
  items: OrderItem[]
): Promise<boolean> {
  // Update fallback
  const fallback = await readFallback()
  const newOrder: Order = {
    ...order,
    status: order.status || "En attente",
    created_at: new Date(),
    items: items,
  }
  fallback.orders.unshift(newOrder)
  await writeFallback(fallback)

  try {
    // Insert order metadata
    await pool.query(
      `INSERT INTO orders (id, customer_name, customer_phone, customer_address, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.customer_name,
        order.customer_phone,
        order.customer_address,
        order.total_price,
        order.status || "En attente",
      ]
    )

    // Insert order items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [order.id, item.product_id, item.product_name, item.quantity, item.price]
      )
    }
    return true
  } catch (error) {
    console.warn("Failed to create order in MySQL. Saved to local fallback JSON.", error)
    return true
  }
}

/**
 * Retrieves all orders with their items.
 */
export async function getOrders(): Promise<Order[]> {
  try {
    const [orderRows] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC")
    const dbOrders = orderRows as any[]

    const orders: Order[] = []
    for (const dbOrder of dbOrders) {
      const [itemRows] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [dbOrder.id])
      const dbItems = itemRows as any[]

      orders.push({
        id: dbOrder.id,
        customer_name: dbOrder.customer_name,
        customer_phone: dbOrder.customer_phone,
        customer_address: dbOrder.customer_address,
        total_price: Number(dbOrder.total_price),
        status: dbOrder.status,
        created_at: dbOrder.created_at,
        items: dbItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      })
    }

    // Merge with local fallback orders (to prevent loss of local test orders)
    const fallbackOrders = (await readFallback()).orders
    for (const fo of fallbackOrders) {
      if (!orders.some((o) => o.id === fo.id)) {
        orders.push(fo)
      }
    }

    return orders
  } catch (error) {
    console.warn("MySQL database is not reachable. Falling back to local JSON orders.")
    return (await readFallback()).orders
  }
}

/**
 * Updates the status of an order.
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  const fallback = await readFallback()
  const idx = fallback.orders.findIndex((o) => o.id === orderId)
  if (idx !== -1) {
    fallback.orders[idx].status = status
    await writeFallback(fallback)
  }

  try {
    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId])
    return true
  } catch (error) {
    console.warn("Failed to update order status in MySQL. Saved to local fallback JSON.", error)
    return true
  }
}

/**
 * Retrieves a configuration setting value by key.
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const [rows] = await pool.query("SELECT `value` FROM site_settings WHERE `key` = ?", [key])
    const dbRows = rows as any[]
    if (dbRows.length > 0) {
      return dbRows[0].value
    }
  } catch (error) {
    console.warn("MySQL settings fetch error. Falling back to local JSON.", error)
  }

  // Fallback
  const fallback = await readFallback()
  return fallback.settings?.[key] || null
}

/**
 * Sets/saves a configuration setting value.
 */
export async function setSetting(key: string, value: string): Promise<boolean> {
  // Update fallback
  const fallback = await readFallback()
  if (!fallback.settings) fallback.settings = {}
  fallback.settings[key] = value
  await writeFallback(fallback)

  try {
    await pool.query(
      "INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?",
      [key, value, value]
    )
    return true
  } catch (error) {
    console.warn("Failed to save site setting to MySQL. Saved to fallback JSON.", error)
    return true
  }
}
