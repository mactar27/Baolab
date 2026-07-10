const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    console.log("Loading environment variables from .env.local...");
    const content = fs.readFileSync(envPath, "utf8");
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, ""); // strip quotes
        process.env[key] = value;
      }
    });
  } else {
    console.warn(".env.local file not found. Using default environment variables.");
  }
}

loadEnv();

const dbHost = process.env.DB_HOST || "localhost";
const sslConfig = !["localhost", "127.0.0.1"].includes(dbHost)
  ? { rejectUnauthorized: true }
  : undefined;

const dbConfig = {
  host: dbHost,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "baolab_db",
  ssl: sslConfig,
};

const initialProducts = [
  // Smartphones - Apple
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro 256 Go",
    brand: "Apple",
    category: "smartphones",
    platform: "apple",
    price: 749000,
    oldPrice: 799000,
    image: "/products/iphone-pro.png",
    badge: "Promo",
    specs: ["Écran 6,1\" Super Retina", "Puce A17 Pro", "Triple caméra 48 Mpx"],
  },
  {
    id: "iphone-14",
    name: "iPhone 14 128 Go",
    brand: "Apple",
    category: "smartphones",
    platform: "apple",
    price: 519000,
    oldPrice: null,
    image: "/products/iphone-pro.png",
    badge: null,
    specs: ["Écran 6,1\" OLED", "Puce A15 Bionic", "Double caméra 12 Mpx"],
  },
  // Smartphones - Android
  {
    id: "galaxy-s24",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "smartphones",
    platform: "android",
    price: 699000,
    oldPrice: null,
    image: "/products/android-phone.png",
    badge: "Nouveau",
    specs: ["Écran 6,8\" AMOLED 120 Hz", "Snapdragon 8 Gen 3", "Caméra 200 Mpx"],
  },
  {
    id: "pixel-8",
    name: "Google Pixel 8",
    brand: "Google",
    category: "smartphones",
    platform: "android",
    price: 429000,
    oldPrice: null,
    image: "/products/android-phone.png",
    badge: null,
    specs: ["Écran 6,2\" OLED", "Puce Google Tensor G3", "IA photo avancée"],
  },
  {
    id: "xiaomi-13",
    name: "Xiaomi 13T Pro",
    brand: "Xiaomi",
    category: "smartphones",
    platform: "android",
    price: 359000,
    oldPrice: null,
    image: "/products/android-phone.png",
    badge: null,
    specs: ["Écran 6,7\" 144 Hz", "Charge rapide 120 W", "Caméra Leica"],
  },
  // Ordinateurs - Apple
  {
    id: "macbook-air-m3",
    name: "MacBook Air 13\" M3",
    brand: "Apple",
    category: "ordinateurs",
    platform: "apple",
    price: 899000,
    oldPrice: null,
    image: "/products/macbook.png",
    badge: "Best-seller",
    specs: ["Puce Apple M3", "16 Go RAM / 512 Go SSD", "Autonomie 18 h"],
  },
  {
    id: "macbook-pro-14",
    name: "MacBook Pro 14\" M3 Pro",
    brand: "Apple",
    category: "ordinateurs",
    platform: "apple",
    price: 1499000,
    oldPrice: null,
    image: "/products/macbook.png",
    badge: null,
    specs: ["Puce M3 Pro", "18 Go RAM / 1 To SSD", "Écran Liquid Retina XDR"],
  },
  // Ordinateurs - Windows
  {
    id: "dell-xps-13",
    name: "Dell XPS 13",
    brand: "Dell",
    category: "ordinateurs",
    platform: "windows",
    price: 749000,
    oldPrice: 820000,
    image: "/products/windows-laptop.png",
    badge: "Promo",
    specs: ["Intel Core i7", "16 Go RAM / 512 Go SSD", "Écran 13,4\" InfinityEdge"],
  },
  {
    id: "hp-spectre",
    name: "HP Spectre x360",
    brand: "HP",
    category: "ordinateurs",
    platform: "windows",
    price: 689000,
    oldPrice: null,
    image: "/products/windows-laptop.png",
    badge: null,
    specs: ["Intel Core i7", "16 Go RAM / 1 To SSD", "Écran tactile convertible"],
  },
  {
    id: "lenovo-thinkpad",
    name: "Lenovo ThinkPad X1",
    brand: "Lenovo",
    category: "ordinateurs",
    platform: "windows",
    price: 799000,
    oldPrice: null,
    image: "/products/windows-laptop.png",
    badge: null,
    specs: ["Intel Core i7 vPro", "16 Go RAM / 512 Go SSD", "Clavier professionnel"],
  },
  // Tablettes
  {
    id: "ipad-air",
    name: "iPad Air 11\" M2",
    brand: "Apple",
    category: "tablettes",
    platform: "apple",
    price: 469000,
    oldPrice: null,
    image: "/products/tablet.png",
    badge: null,
    specs: ["Puce Apple M2", "128 Go", "Compatible Apple Pencil Pro"],
  },
  {
    id: "galaxy-tab-s9",
    name: "Samsung Galaxy Tab S9",
    brand: "Samsung",
    category: "tablettes",
    platform: "android",
    price: 399000,
    oldPrice: null,
    image: "/products/tablet.png",
    badge: null,
    specs: ["Écran 11\" AMOLED", "S Pen inclus", "8 Go RAM / 128 Go"],
  },
  // Accessoires
  {
    id: "airpods-pro",
    name: "AirPods Pro 2",
    brand: "Apple",
    category: "accessoires",
    platform: "apple",
    price: 159000,
    oldPrice: null,
    image: "/products/earbuds.png",
    badge: "Populaire",
    specs: ["Réduction de bruit active", "Boîtier USB-C", "Audio spatial"],
  },
  {
    id: "casque-sans-fil",
    name: "Casque sans fil ANC",
    brand: "Sony",
    category: "accessoires",
    platform: "universel",
    price: 189000,
    oldPrice: null,
    image: "/products/headphones.png",
    badge: null,
    specs: ["Réduction de bruit", "Autonomie 30 h", "Bluetooth multipoint"],
  },
  {
    id: "clavier-sans-fil",
    name: "Clavier mécanique sans fil",
    brand: "Logitech",
    category: "accessoires",
    platform: "universel",
    price: 65000,
    oldPrice: null,
    image: "/products/keyboard.png",
    badge: null,
    specs: ["Bluetooth & USB-C", "Rétroéclairé", "Compatible Mac/Windows"],
  },
  {
    id: "souris-ergonomique",
    name: "Souris ergonomique sans fil",
    brand: "Logitech",
    category: "accessoires",
    platform: "universel",
    price: 39000,
    oldPrice: null,
    image: "/products/mouse.png",
    badge: null,
    specs: ["Capteur haute précision", "Silencieuse", "Autonomie 70 jours"],
  },
  {
    id: "chargeur-usbc",
    name: "Chargeur rapide USB-C 65 W",
    brand: "Anker",
    category: "accessoires",
    platform: "universel",
    price: 29000,
    oldPrice: null,
    image: "/products/charger.png",
    badge: null,
    specs: ["Charge rapide GaN", "Câble tressé inclus", "Compatible tous appareils"],
  },
  {
    id: "montre-connectee",
    name: "Montre connectée GPS",
    brand: "Samsung",
    category: "accessoires",
    platform: "android",
    price: 145000,
    oldPrice: null,
    image: "/products/smartwatch.png",
    badge: null,
    specs: ["Suivi santé & sport", "GPS intégré", "Étanche 5 ATM"],
  },
  // Location
  {
    id: "pack-seminaire-laptops",
    name: "Pack Séminaire - 5x Laptops Windows",
    brand: "HP",
    category: "location",
    platform: "windows",
    price: 150000,
    oldPrice: null,
    image: "/products/windows-laptop.png",
    badge: "Populaire",
    specs: ["5x PC portables Core i5", "8 Go RAM / 256 Go SSD", "Installation & configuration incluses"],
  },
  {
    id: "macbook-pro-location",
    name: "MacBook Pro 14\" M3 Pro (Location)",
    brand: "Apple",
    category: "location",
    platform: "apple",
    price: 45000,
    oldPrice: null,
    image: "/products/macbook.png",
    badge: "Premium",
    specs: ["Puce Apple M3 Pro", "18 Go RAM / 512 Go SSD", "Idéal pour création & vidéo"],
  },
];

async function main() {
  console.log("Connecting to MySQL server database database database...");
  console.log(`Host: ${dbConfig.host}`);
  console.log(`Database: ${dbConfig.database}`);

  let connection;
  try {
    // Connect without database first to ensure the database exists
    const adminConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: sslConfig,
    });

    console.log(`Creating database ${dbConfig.database} if not exists...`);
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await adminConnection.end();

    // Re-connect to the specific database
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected successfully. Creating table...");

    // Create table with JSON column support
    await connection.query(`
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
    `);
    console.log("Table 'products' verified/created.");

    // Seed products
    console.log("Seeding products...");
    for (const prod of initialProducts) {
      const [existing] = await connection.query("SELECT id FROM products WHERE id = ?", [prod.id]);

      const specsStr = JSON.stringify(prod.specs);

      if (existing.length > 0) {
        console.log(`Product "${prod.name}" already exists. Updating details...`);
        await connection.query(
          `UPDATE products 
           SET name = ?, brand = ?, category = ?, platform = ?, price = ?, oldPrice = ?, image = ?, badge = ?, specs = ? 
           WHERE id = ?`,
          [prod.name, prod.brand, prod.category, prod.platform, prod.price, prod.oldPrice, prod.image, prod.badge, specsStr, prod.id]
        );
      } else {
        console.log(`Inserting product "${prod.name}"...`);
        await connection.query(
          `INSERT INTO products (id, name, brand, category, platform, price, oldPrice, image, badge, specs) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [prod.id, prod.name, prod.brand, prod.category, prod.platform, prod.price, prod.oldPrice, prod.image, prod.badge, specsStr]
        );
      }
    }

    console.log("\nDatabase seeding completed successfully! 🎉");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed.");
    }
  }
}

main();
