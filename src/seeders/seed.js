const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, User, Category, Product, Cart, Wishlist } = require('../models');

// Helper to generate product image URLs with different services
const img = (text, w = 400, h = 400, bg = '2874f0', fg = 'ffffff') => {
  return `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}`;
};

const categories = [
  {
    name: 'Mobiles',
    slug: 'mobiles',
    image_url: 'https://cdn-icons-png.flaticon.com/128/0/191.png',
    icon_url: 'https://cdn-icons-png.flaticon.com/128/0/191.png',
    description: 'Latest smartphones from top brands',
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    image_url: 'https://cdn-icons-png.flaticon.com/128/3659/3659899.png',
    icon_url: 'https://cdn-icons-png.flaticon.com/128/3659/3659899.png',
    description: 'TVs, Laptops, Cameras and more',
  },
  {
    name: 'Fashion - Men',
    slug: 'fashion-men',
    image_url: 'https://cdn-icons-png.flaticon.com/128/2589/2589175.png',
    icon_url: 'https://cdn-icons-png.flaticon.com/128/2589/2589175.png',
    description: 'Clothing, footwear, watches for men',
  },
  {
    name: 'Fashion - Women',
    slug: 'fashion-women',
    image_url: 'https://cdn-icons-png.flaticon.com/128/2503/2503508.png',
    icon_url: 'https://cdn-icons-png.flaticon.com/128/2503/2503508.png',
    description: 'Sarees, kurtas, accessories for women',
  },
  {
    name: 'Home & Furniture',
    slug: 'home-furniture',
    image_url: 'https://cdn-icons-png.flaticon.com/128/3079/3079165.png',
    icon_url: 'https://cdn-icons-png.flaticon.com/128/3079/3079165.png',
    description: 'Furniture, decor, kitchen essentials',
  },
  {
    name: 'Appliances',
    slug: 'appliances',
    image_url: 'https://cdn-icons-png.flaticon.com/128/2553/2553629.png',
    icon_url: 'https://cdn-icons-png.flaticon.com/128/2553/2553629.png',
    description: 'ACs, Refrigerators, Washing Machines',
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty',
    image_url: 'https://cdn-icons-png.flaticon.com/128/1940/1940922.png',
    icon_url: 'https://cdn-icons-png.flaticon.com/128/1940/1940922.png',
    description: 'Skincare, perfumes, grooming',
  },
  {
    name: 'Toys & Baby',
    slug: 'toys-baby',
    image_url: 'https://cdn-icons-png.flaticon.com/128/3082/3082054.png',
    icon_url: 'https://cdn-icons-png.flaticon.com/128/3082/3082054.png',
    description: 'Toys, baby care, games',
  },
];

const products = [
  // ─── MOBILES ─────────────────────
  {
    name: 'Apple iPhone 15 (Blue, 128 GB)',
    description: 'Experience the new iPhone 15 with Dynamic Island, 48MP camera, and USB-C. Features A16 Bionic chip, Super Retina XDR display, and all-day battery life.',
    price: 69999, mrp: 79900, stock: 25, category_id: 1,
    images: [img('iPhone+15', 400, 400, '1a1a2e', 'e0e0e0'), img('iPhone+15\\nBack', 400, 400, '16213e', 'e0e0e0')],
    specifications: { "Processor": "A16 Bionic", "RAM": "6 GB", "Storage": "128 GB", "Display": "6.1 inch Super Retina XDR", "Camera": "48MP + 12MP", "Battery": "3877 mAh", "OS": "iOS 17" },
    rating: 4.6, review_count: 15234, brand: 'Apple', is_featured: true, discount_percent: 12, tags: ['premium', 'bestseller'],
  },
  {
    name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)',
    description: 'Galaxy AI is here. Samsung Galaxy S24 Ultra features a stunning 6.8" QHD+ Dynamic AMOLED display, Snapdragon 8 Gen 3 processor, and 200MP camera.',
    price: 129999, mrp: 134999, stock: 15, category_id: 1,
    images: [img('Galaxy+S24\\nUltra', 400, 400, '1d1d2b', 'c0c0c0')],
    specifications: { "Processor": "Snapdragon 8 Gen 3", "RAM": "12 GB", "Storage": "256 GB", "Display": "6.8 inch QHD+", "Camera": "200MP + 50MP + 12MP + 10MP", "Battery": "5000 mAh", "OS": "Android 14" },
    rating: 4.5, review_count: 8923, brand: 'Samsung', is_featured: true, discount_percent: 4, tags: ['premium', 'flagship'],
  },
  {
    name: 'OnePlus 12 (Flowy Emerald, 256 GB)',
    description: 'The OnePlus 12 features Snapdragon 8 Gen 3, Hasselblad Camera, 100W SUPERVOOC charging, and a stunning 2K 120Hz ProXDR Display.',
    price: 64999, mrp: 69999, stock: 30, category_id: 1,
    images: [img('OnePlus+12', 400, 400, '004d40', 'ffffff')],
    specifications: { "Processor": "Snapdragon 8 Gen 3", "RAM": "12 GB", "Storage": "256 GB", "Display": "6.82 inch 2K ProXDR", "Camera": "50MP + 64MP + 48MP", "Battery": "5400 mAh", "OS": "OxygenOS 14" },
    rating: 4.4, review_count: 12456, brand: 'OnePlus', is_featured: true, discount_percent: 7, tags: ['bestseller'],
  },
  {
    name: 'Google Pixel 8 (Obsidian, 128 GB)',
    description: 'Meet Pixel 8. The helpful phone engineered by Google. Tensor G3 chip, best photo quality, and 7 years of OS updates.',
    price: 52999, mrp: 59999, stock: 20, category_id: 1,
    images: [img('Pixel+8', 400, 400, '1a237e', 'ffffff')],
    specifications: { "Processor": "Google Tensor G3", "RAM": "8 GB", "Storage": "128 GB", "Display": "6.2 inch OLED 120Hz", "Camera": "50MP + 12MP", "Battery": "4575 mAh", "OS": "Android 14" },
    rating: 4.3, review_count: 6789, brand: 'Google', is_featured: false, discount_percent: 12, tags: ['camera-phone'],
  },
  {
    name: 'Realme Narzo 70 Pro 5G (Glass Green, 128 GB)',
    description: 'Realme Narzo 70 Pro with MediaTek Dimensity 7050, 120Hz AMOLED, 50MP Sony Camera, and 67W SUPERVOOC Charge.',
    price: 16999, mrp: 21999, stock: 50, category_id: 1,
    images: [img('Narzo+70\\nPro', 400, 400, '1b5e20', 'ffffff')],
    specifications: { "Processor": "MediaTek Dimensity 7050", "RAM": "8 GB", "Storage": "128 GB", "Display": "6.67 inch AMOLED 120Hz", "Camera": "50MP Sony + 2MP", "Battery": "5000 mAh", "OS": "realme UI 5.0" },
    rating: 4.2, review_count: 23456, brand: 'Realme', is_featured: false, discount_percent: 23, tags: ['budget', 'value-for-money'],
  },
  {
    name: 'POCO X6 Pro 5G (Nebula Green, 256 GB)',
    description: 'POCO X6 Pro 5G with Dimensity 8300-Ultra, 64MP camera, 67W turbo charging, and 6.67" 120Hz Flow AMOLED display.',
    price: 21999, mrp: 27999, stock: 35, category_id: 1,
    images: [img('POCO+X6\\nPro', 400, 400, '263238', 'ffeb3b')],
    specifications: { "Processor": "Dimensity 8300-Ultra", "RAM": "8 GB", "Storage": "256 GB", "Display": "6.67 inch AMOLED 120Hz", "Camera": "64MP + 8MP + 2MP", "Battery": "5000 mAh", "OS": "MIUI 14" },
    rating: 4.1, review_count: 18234, brand: 'POCO', is_featured: false, discount_percent: 21, tags: ['budget', 'gaming'],
  },
  {
    name: 'Redmi Note 13 Pro+ 5G (Fusion Purple, 256 GB)',
    description: 'Redmi Note 13 Pro+ 5G with 200MP camera, MediaTek Dimensity 7200, 6.67" 120Hz curved AMOLED, and 120W HyperCharge.',
    price: 29999, mrp: 34999, stock: 40, category_id: 1,
    images: [img('Redmi+Note\\n13+Pro+', 400, 400, '4a148c', 'ffffff')],
    specifications: { "Processor": "Dimensity 7200-Ultra", "RAM": "12 GB", "Storage": "256 GB", "Display": "6.67 inch Curved AMOLED", "Camera": "200MP + 8MP + 2MP", "Battery": "5000 mAh", "OS": "Android 14" },
    rating: 4.3, review_count: 34567, brand: 'Redmi', is_featured: true, discount_percent: 14, tags: ['bestseller', 'camera-phone'],
  },

  // ─── ELECTRONICS ─────────────────
  {
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation with two processors, 30-hour battery life, crystal clear hands-free calling.',
    price: 26990, mrp: 34990, stock: 20, category_id: 2,
    images: [img('Sony\\nWH-1000XM5', 400, 400, '212121', 'e0e0e0')],
    specifications: { "Type": "Over-Ear", "Connectivity": "Bluetooth 5.2", "Driver": "30mm", "Battery": "30 Hours", "ANC": "Industry Leading", "Weight": "250g" },
    rating: 4.5, review_count: 4567, brand: 'Sony', is_featured: true, discount_percent: 23, tags: ['premium', 'audio'],
  },
  {
    name: 'JBL Charge 5 Portable Bluetooth Speaker',
    description: 'JBL Charge 5 delivers bold JBL Original Pro Sound with deepest bass. IP67 waterproof, 20 hours playtime, built-in powerbank.',
    price: 12999, mrp: 18999, stock: 30, category_id: 2,
    images: [img('JBL\\nCharge+5', 400, 400, 'b71c1c', 'ffffff')],
    specifications: { "Power": "40W", "Bluetooth": "5.1", "Battery": "20 Hours", "IP Rating": "IP67", "Weight": "960g", "Powerbank": "Yes" },
    rating: 4.4, review_count: 8901, brand: 'JBL', is_featured: true, discount_percent: 32, tags: ['portable', 'audio'],
  },
  {
    name: 'Samsung 55 inch Crystal 4K Neo UHD Smart TV',
    description: 'Crystal Processor 4K, HDR 10+, Crystal Display, Smart TV with Tizen OS, built-in Alexa, Samsung Gaming Hub.',
    price: 42999, mrp: 64900, stock: 10, category_id: 2,
    images: [img('Samsung\\n55"+4K+TV', 400, 400, '0d47a1', 'ffffff')],
    specifications: { "Screen": "55 inches", "Resolution": "4K UHD", "Panel": "LED", "Smart TV": "Tizen OS", "HDR": "HDR 10+", "Sound": "20W" },
    rating: 4.3, review_count: 5678, brand: 'Samsung', is_featured: true, discount_percent: 34, tags: ['deal', 'entertainment'],
  },
  {
    name: 'Apple iPad (10th Gen) WiFi 64GB',
    description: 'Stunning 10.9-inch Liquid Retina display, A14 Bionic chip, 12MP camera, USB-C connector, and all-day battery life.',
    price: 33999, mrp: 39900, stock: 15, category_id: 2,
    images: [img('iPad\\n10th+Gen', 400, 400, '37474f', 'ffffff')],
    specifications: { "Processor": "A14 Bionic", "Storage": "64 GB", "Display": "10.9 inch Retina", "Camera": "12MP", "Battery": "10 Hours", "OS": "iPadOS 17" },
    rating: 4.6, review_count: 7890, brand: 'Apple', is_featured: true, discount_percent: 15, tags: ['premium', 'tablet'],
  },
  {
    name: 'boAt Airdopes 141 Bluetooth Earbuds',
    description: 'boAt Airdopes 141 with 42H playtime, ENx Technology, BEAST Mode, IPX4 Water Resistant.',
    price: 1099, mrp: 4490, stock: 100, category_id: 2,
    images: [img('boAt\\nAirdopes+141', 400, 400, '1a1a1a', '00e676')],
    specifications: { "Type": "TWS", "Bluetooth": "5.1", "Battery": "42 Hours", "Driver": "8mm", "IP Rating": "IPX4", "Weight": "4g/bud" },
    rating: 4.1, review_count: 456789, brand: 'boAt', is_featured: false, discount_percent: 76, tags: ['budget', 'bestseller'],
  },
  {
    name: 'HP Pavilion 15 Laptop (12th Gen Intel Core i5)',
    description: 'HP Pavilion 15 with 12th Gen Intel Core i5-1235U, 16GB RAM, 512GB SSD, 15.6" FHD IPS, Windows 11.',
    price: 54990, mrp: 72444, stock: 12, category_id: 2,
    images: [img('HP+Pavilion\\n15+Laptop', 400, 400, '37474f', 'b3e5fc')],
    specifications: { "CPU": "Core i5-1235U 12th Gen", "RAM": "16 GB DDR4", "Storage": "512 GB SSD", "Display": "15.6 inch FHD", "GPU": "Intel Iris Xe", "OS": "Windows 11" },
    rating: 4.2, review_count: 3456, brand: 'HP', is_featured: false, discount_percent: 24, tags: ['laptop', 'work'],
  },

  // ─── FASHION MEN ─────────────────
  {
    name: 'Allen Solly Men Slim Fit Casual Shirt',
    description: 'Allen Solly Men Blue Slim Fit Printed Casual Shirt. Premium cotton, perfect for everyday wear.',
    price: 879, mrp: 1999, stock: 60, category_id: 3,
    images: [img('Allen+Solly\\nShirt', 400, 400, '1565c0', 'ffffff')],
    specifications: { "Fabric": "Cotton", "Fit": "Slim Fit", "Sleeve": "Full Sleeve", "Pattern": "Printed", "Occasion": "Casual" },
    rating: 4.0, review_count: 12345, brand: 'Allen Solly', is_featured: false, discount_percent: 56, tags: ['fashion', 'casual'],
  },
  {
    name: "Levi's Men 511 Slim Fit Jeans",
    description: "Levi's 511 Slim Fit Jeans in Dark Blue. Slim fit through hip and thigh with just the right amount of stretch.",
    price: 1979, mrp: 3599, stock: 45, category_id: 3,
    images: [img("Levi's+511\\nJeans", 400, 400, '1a237e', 'e3f2fd')],
    specifications: { "Fabric": "Cotton Blend", "Fit": "Slim (511)", "Rise": "Mid Rise", "Wash": "Dark Wash", "Pockets": "5" },
    rating: 4.2, review_count: 8765, brand: "Levi's", is_featured: true, discount_percent: 45, tags: ['fashion', 'denim'],
  },
  {
    name: 'Nike Air Max 270 Running Shoes',
    description: "Nike Air Max 270 features Nike's biggest heel Air unit yet for a super-soft ride. Breathable mesh upper.",
    price: 8995, mrp: 13995, stock: 25, category_id: 3,
    images: [img('Nike+Air\\nMax+270', 400, 400, 'e65100', 'ffffff')],
    specifications: { "Upper": "Mesh + Synthetic", "Sole": "Rubber", "Cushioning": "Air Max 270", "Occasion": "Sports", "Weight": "310g" },
    rating: 4.4, review_count: 5432, brand: 'Nike', is_featured: true, discount_percent: 36, tags: ['footwear', 'sports'],
  },
  {
    name: 'Fossil Neutra Chronograph Men Watch',
    description: 'Fossil Neutra Chronograph with minimalist dial, genuine leather strap. Water resistant to 50m.',
    price: 7996, mrp: 13995, stock: 20, category_id: 3,
    images: [img('Fossil\\nWatch', 400, 400, '3e2723', 'ffab91')],
    specifications: { "Movement": "Quartz Chronograph", "Case": "44mm", "Band": "Leather", "Water Resistance": "50m", "Glass": "Mineral Crystal" },
    rating: 4.3, review_count: 3456, brand: 'Fossil', is_featured: false, discount_percent: 43, tags: ['watch', 'accessory'],
  },
  {
    name: 'U.S. POLO ASSN. Men Polo T-Shirt',
    description: 'U.S. Polo Assn. classic polo t-shirt with embroidered logo, regular fit, premium cotton.',
    price: 899, mrp: 1799, stock: 75, category_id: 3,
    images: [img('US+Polo\\nT-Shirt', 400, 400, '0d47a1', 'ffffff')],
    specifications: { "Fabric": "100% Cotton", "Fit": "Regular", "Sleeve": "Half Sleeve", "Collar": "Polo", "Pattern": "Solid" },
    rating: 4.1, review_count: 15678, brand: 'U.S. Polo', is_featured: false, discount_percent: 50, tags: ['fashion', 'bestseller'],
  },
  {
    name: 'Puma Men RS-X Sneakers',
    description: 'Retro-inspired Puma RS-X with bold design, RS cushioning technology, chunky silhouette for all-day comfort.',
    price: 5999, mrp: 9999, stock: 30, category_id: 3,
    images: [img('Puma\\nRS-X', 400, 400, '212121', '64dd17')],
    specifications: { "Upper": "Mesh + Leather", "Sole": "Rubber", "Cushioning": "RS Technology", "Style": "Retro", "Weight": "340g" },
    rating: 4.2, review_count: 6789, brand: 'Puma', is_featured: false, discount_percent: 40, tags: ['footwear', 'sneakers'],
  },

  // ─── FASHION WOMEN ───────────────
  {
    name: 'Anubhutee Women Floral Printed Kurta Set',
    description: 'Beautiful floral printed kurta with palazzo set. Pure cotton, ideal for daily wear and festivals.',
    price: 899, mrp: 2999, stock: 55, category_id: 4,
    images: [img('Floral\\nKurta+Set', 400, 400, 'ad1457', 'ffffff')],
    specifications: { "Fabric": "Pure Cotton", "Set": "Kurta + Palazzo", "Sleeve": "3/4 Sleeve", "Pattern": "Floral", "Occasion": "Casual/Festive" },
    rating: 4.1, review_count: 23456, brand: 'Anubhutee', is_featured: false, discount_percent: 70, tags: ['ethnic', 'bestseller'],
  },
  {
    name: "Lavie Women's Handbag",
    description: 'Lavie premium handbag with spacious compartment, stylish design. Perfect for work and casual outings.',
    price: 1499, mrp: 3050, stock: 35, category_id: 4,
    images: [img('Lavie\\nHandbag', 400, 400, '4a148c', 'e1bee7')],
    specifications: { "Material": "Faux Leather", "Type": "Handbag", "Compartments": "3 Main + 2 Zip", "Closure": "Zip", "Occasion": "Casual/Formal" },
    rating: 4.0, review_count: 8765, brand: 'Lavie', is_featured: false, discount_percent: 51, tags: ['accessories', 'bag'],
  },
  {
    name: 'Kalini Women Embroidered Silk Saree',
    description: 'Elegant embroidered silk blend saree with unstitched blouse piece. Perfect for weddings and special occasions.',
    price: 599, mrp: 2199, stock: 40, category_id: 4,
    images: [img('Silk\\nSaree', 400, 400, 'c62828', 'ffcdd2')],
    specifications: { "Fabric": "Silk Blend", "Blouse": "Unstitched", "Pattern": "Embroidered", "Length": "5.5m + 0.8m", "Occasion": "Wedding/Party" },
    rating: 3.9, review_count: 34567, brand: 'Kalini', is_featured: true, discount_percent: 73, tags: ['ethnic', 'wedding'],
  },
  {
    name: 'BIBA Women Printed A-Line Dress',
    description: 'BIBA printed A-line dress in vibrant colors. Flared fit, round neck, short sleeves. Perfect for brunches.',
    price: 1199, mrp: 2499, stock: 30, category_id: 4,
    images: [img('BIBA\\nDress', 400, 400, 'e91e63', 'ffffff')],
    specifications: { "Fabric": "Cotton", "Fit": "A-Line", "Neck": "Round", "Sleeve": "Short", "Pattern": "Printed" },
    rating: 4.2, review_count: 5678, brand: 'BIBA', is_featured: false, discount_percent: 52, tags: ['fashion', 'western'],
  },
  {
    name: 'Fastrack Ruffles Women Watch',
    description: 'Fastrack Ruffles analog watch for women with rose gold case, leather strap, elegant design.',
    price: 1595, mrp: 2795, stock: 25, category_id: 4,
    images: [img('Fastrack\\nWatch', 400, 400, 'ff6f00', 'fff8e1')],
    specifications: { "Movement": "Quartz", "Case": "30mm", "Band": "Leather", "Water Resist": "30m", "Glass": "Mineral" },
    rating: 4.0, review_count: 4321, brand: 'Fastrack', is_featured: false, discount_percent: 43, tags: ['watch', 'accessory'],
  },

  // ─── HOME & FURNITURE ────────────
  {
    name: 'Wakefit Orthopaedic Memory Foam Mattress (Queen)',
    description: 'Wakefit Orthopaedic Memory Foam Mattress with 6 inch thickness for optimal spinal alignment and pressure relief.',
    price: 8999, mrp: 18450, stock: 15, category_id: 5,
    images: [img('Wakefit\\nMattress', 400, 400, '00695c', 'ffffff')],
    specifications: { "Size": "Queen 78x60 inches", "Thickness": "6 inches", "Material": "Memory Foam", "Firmness": "Medium", "Warranty": "10 Years" },
    rating: 4.3, review_count: 56789, brand: 'Wakefit', is_featured: true, discount_percent: 51, tags: ['home', 'bestseller'],
  },
  {
    name: 'IKEA KALLAX Shelf Unit (White)',
    description: 'Versatile shelf unit that can be used as a room divider, bookshelf, or TV unit. Clean lines and smooth surface.',
    price: 7990, mrp: 9990, stock: 10, category_id: 5,
    images: [img('IKEA\\nKALLAX', 400, 400, 'eceff1', '37474f')],
    specifications: { "Material": "Engineered Wood", "Dimensions": "77x147x39 cm", "Compartments": "8", "Color": "White", "Assembly": "DIY" },
    rating: 4.1, review_count: 2345, brand: 'IKEA', is_featured: false, discount_percent: 20, tags: ['furniture', 'storage'],
  },
  {
    name: 'Bombay Dyeing 100% Cotton Bedsheet (King)',
    description: 'Bombay Dyeing premium cotton bedsheet with 2 pillow covers. Soft, breathable fabric with vibrant prints.',
    price: 699, mrp: 1499, stock: 45, category_id: 5,
    images: [img('Bombay+Dyeing\\nBedsheet', 400, 400, '1565c0', 'bbdefb')],
    specifications: { "Fabric": "100% Cotton", "Size": "King 274x274 cm", "Pillows": "2 Included", "Thread Count": "144", "Pattern": "Printed" },
    rating: 4.0, review_count: 67890, brand: 'Bombay Dyeing', is_featured: false, discount_percent: 53, tags: ['home', 'bestseller'],
  },
  {
    name: 'Curtain Story Blackout Curtains (Set of 2)',
    description: 'Premium blackout curtains that block 95% of sunlight and reduce noise. Perfect for bedrooms.',
    price: 599, mrp: 1499, stock: 50, category_id: 5,
    images: [img('Blackout\\nCurtains', 400, 400, '263238', 'b0bec5')],
    specifications: { "Material": "Polyester", "Size": "7ft x 4ft Each", "Set": "2 Curtains", "Blackout": "95%", "Header": "Eyelet" },
    rating: 4.0, review_count: 12345, brand: 'Curtain Story', is_featured: false, discount_percent: 60, tags: ['home', 'decor'],
  },
  {
    name: 'Solimo Engineered Wood Study Table',
    description: 'Compact study table with bookshelf. Perfect for small spaces, home office, and students.',
    price: 3499, mrp: 7999, stock: 20, category_id: 5,
    images: [img('Solimo\\nStudy+Table', 400, 400, '4e342e', 'efebe9')],
    specifications: { "Material": "Engineered Wood", "Size": "90x50x75 cm", "Shelves": "4", "Color": "Walnut", "Capacity": "50 kg" },
    rating: 3.9, review_count: 5678, brand: 'Solimo', is_featured: false, discount_percent: 56, tags: ['furniture', 'study'],
  },

  // ─── APPLIANCES ──────────────────
  {
    name: 'LG 1.5 Ton 5 Star AI Dual Inverter Split AC',
    description: 'LG AI Dual Inverter Split AC with 5 Star Rating, 4-way swing, HD filter with anti-virus protection.',
    price: 39990, mrp: 61990, stock: 10, category_id: 6,
    images: [img('LG+Split\\nAC+1.5T', 400, 400, 'e0e0e0', '424242')],
    specifications: { "Capacity": "1.5 Ton", "Stars": "5 Star", "Type": "Split Inverter", "Refrigerant": "R32", "Noise": "26 dB", "Warranty": "10Y Compressor" },
    rating: 4.4, review_count: 8901, brand: 'LG', is_featured: true, discount_percent: 35, tags: ['appliance', 'summer'],
  },
  {
    name: 'Samsung 253L Frost Free Double Door Refrigerator',
    description: 'Samsung 253L Double Door Refrigerator with Digital Inverter, Convertible 5-in-1, All-around Cooling.',
    price: 24490, mrp: 33490, stock: 12, category_id: 6,
    images: [img('Samsung\\nFridge+253L', 400, 400, 'cfd8dc', '37474f')],
    specifications: { "Capacity": "253L", "Type": "Double Door", "Stars": "3 Star", "Tech": "Digital Inverter", "Cooling": "All-around", "Warranty": "20Y Compressor" },
    rating: 4.3, review_count: 11234, brand: 'Samsung', is_featured: true, discount_percent: 27, tags: ['appliance', 'essential'],
  },
  {
    name: 'IFB 7 Kg 5 Star Front Load Washing Machine',
    description: 'IFB 7 kg fully automatic front load washing machine with aqua energie water softener, 3D wash system.',
    price: 28490, mrp: 38090, stock: 8, category_id: 6,
    images: [img('IFB\\nWashing+7kg', 400, 400, 'e8eaf6', '283593')],
    specifications: { "Capacity": "7 Kg", "Type": "Front Load", "Stars": "5 Star", "Programs": "15", "RPM": "1200", "Warranty": "4Y" },
    rating: 4.2, review_count: 6789, brand: 'IFB', is_featured: false, discount_percent: 25, tags: ['appliance'],
  },
  {
    name: 'Bajaj Majesty Oven Toaster Grill (OTG) 16L',
    description: 'Bajaj OTG with 16L capacity, temperature control up to 250°C, auto shut-off timer, multiple cooking modes.',
    price: 2799, mrp: 5020, stock: 30, category_id: 6,
    images: [img('Bajaj\\nOTG+16L', 400, 400, 'bf360c', 'fff3e0')],
    specifications: { "Capacity": "16L", "Wattage": "1200W", "Temp": "Up to 250°C", "Timer": "60 min", "Functions": "Bake, Toast, Grill" },
    rating: 4.0, review_count: 23456, brand: 'Bajaj', is_featured: false, discount_percent: 44, tags: ['kitchen', 'cooking'],
  },

  // ─── BEAUTY ──────────────────────
  {
    name: 'Maybelline New York Fit Me Foundation',
    description: 'Maybelline Fit Me Matte + Poreless Liquid Foundation. Lightweight, breathable formula.',
    price: 399, mrp: 599, stock: 80, category_id: 7,
    images: [img('Maybelline\\nFoundation', 400, 400, 'f8bbd0', '880e4f')],
    specifications: { "Type": "Liquid Foundation", "Finish": "Matte", "Coverage": "Medium-Full", "Volume": "30 ml", "Skin Type": "Normal-Oily" },
    rating: 4.1, review_count: 34567, brand: 'Maybelline', is_featured: false, discount_percent: 33, tags: ['makeup', 'bestseller'],
  },
  {
    name: 'Nivea Men All-in-One Charcoal Face Wash',
    description: 'Nivea Men face wash with active charcoal and 10x Vitamin C for deep cleansing and oil control.',
    price: 192, mrp: 275, stock: 100, category_id: 7,
    images: [img('Nivea\\nFace+Wash', 400, 400, '0d47a1', 'bbdefb')],
    specifications: { "Type": "Face Wash", "Key": "Charcoal + Vitamin C", "Volume": "100 ml", "Skin": "Oily", "For": "Men" },
    rating: 4.2, review_count: 45678, brand: 'Nivea', is_featured: false, discount_percent: 30, tags: ['grooming', 'skincare'],
  },
  {
    name: 'Park Avenue Voyage Perfume (100ml)',
    description: 'Park Avenue Voyage Eau De Parfum for men. Fresh, woody fragrance with top notes of bergamot and mint.',
    price: 449, mrp: 699, stock: 40, category_id: 7,
    images: [img('Park+Avenue\\nPerfume', 400, 400, '1b5e20', 'c8e6c9')],
    specifications: { "Type": "Eau De Parfum", "Volume": "100 ml", "Family": "Fresh Woody", "Longevity": "6-8 Hours" },
    rating: 4.0, review_count: 12345, brand: 'Park Avenue', is_featured: false, discount_percent: 36, tags: ['perfume'],
  },
  {
    name: 'Philips OneBlade Hybrid Trimmer & Shaver',
    description: 'Philips OneBlade that can trim, edge, and shave any length of hair. Unique OneBlade technology.',
    price: 1799, mrp: 2795, stock: 35, category_id: 7,
    images: [img('Philips\\nOneBlade', 400, 400, '1a237e', '90caf9')],
    specifications: { "Type": "Trimmer + Shaver", "Blade": "OneBlade", "Battery": "60 min", "Wet/Dry": "Yes", "Weight": "97g" },
    rating: 4.3, review_count: 67890, brand: 'Philips', is_featured: true, discount_percent: 36, tags: ['grooming', 'bestseller'],
  },

  // ─── TOYS & BABY ─────────────────
  {
    name: 'LEGO Classic Creative Bricks (484 Pieces)',
    description: 'LEGO Classic Creative Bricks set with 484 pieces in 35 colors. Windows, doors, eyes, and wheels included.',
    price: 2399, mrp: 3499, stock: 25, category_id: 8,
    images: [img('LEGO\\n484+Pieces', 400, 400, 'f9a825', 'd32f2f')],
    specifications: { "Pieces": "484", "Colors": "35+", "Age": "4-99 Years", "Material": "ABS Plastic", "Theme": "Classic" },
    rating: 4.6, review_count: 3456, brand: 'LEGO', is_featured: true, discount_percent: 31, tags: ['toy', 'creative'],
  },
  {
    name: 'Funskool Monopoly Board Game',
    description: 'Classic Monopoly board game. Buy, sell, and trade properties. Fun for the whole family.',
    price: 699, mrp: 1299, stock: 30, category_id: 8,
    images: [img('Monopoly\\nBoard+Game', 400, 400, '1b5e20', 'c8e6c9')],
    specifications: { "Players": "2-8", "Age": "8+", "Time": "60-180 min", "Theme": "Real Estate" },
    rating: 4.3, review_count: 5678, brand: 'Funskool', is_featured: false, discount_percent: 46, tags: ['board-game', 'family'],
  },
  {
    name: 'Pampers All-Round Protection Pants (L, 64 Count)',
    description: 'Pampers baby-dry pants with 360° cottony softness, up to 12 hours of dryness, Aloe Vera protection.',
    price: 999, mrp: 1599, stock: 50, category_id: 8,
    images: [img('Pampers\\n64+Count', 400, 400, '00838f', 'e0f7fa')],
    specifications: { "Size": "Large 9-14 kg", "Count": "64", "Type": "Pant Style", "Absorbency": "12 Hours", "Special": "Aloe Vera" },
    rating: 4.4, review_count: 89012, brand: 'Pampers', is_featured: false, discount_percent: 38, tags: ['baby', 'bestseller'],
  },
  {
    name: 'Hot Wheels 10 Car Pack (Styles May Vary)',
    description: 'Hot Wheels 10-car gift pack with authentic detailing for car lovers of all ages. Collect and race!',
    price: 849, mrp: 1299, stock: 35, category_id: 8,
    images: [img('Hot+Wheels\\n10+Cars', 400, 400, 'e65100', 'fff3e0')],
    specifications: { "Cars": "10 Pieces", "Scale": "1:64", "Material": "Die-cast Metal", "Age": "3+", "Theme": "Assorted" },
    rating: 4.2, review_count: 3456, brand: 'Hot Wheels', is_featured: false, discount_percent: 35, tags: ['toy', 'cars'],
  },
  {
    name: 'Fisher-Price Laugh & Learn Smart Phone',
    description: 'Fisher-Price toy phone that teaches colors, numbers, greetings through songs, phrases, and lights.',
    price: 499, mrp: 999, stock: 40, category_id: 8,
    images: [img('Fisher-Price\\nSmart+Phone', 400, 400, '7b1fa2', 'e1bee7')],
    specifications: { "Age": "6-36 Months", "Battery": "2 AAA Included", "Features": "Songs, Lights", "Learning": "Colors, Numbers", "Material": "BPA-Free" },
    rating: 4.1, review_count: 5678, brand: 'Fisher-Price', is_featured: false, discount_percent: 50, tags: ['baby', 'learning'],
  },
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    await sequelize.sync({ force: true });
    console.log('✅ Tables created.\n');

    // Default user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const defaultUser = await User.create({
      name: 'John Doe', email: 'john@example.com', password: hashedPassword,
      phone: '9876543210', address: 'H.No. 1-12-159/A/11, Street No. 5, Tarnaka, Secunderabad',
      super_coins: 150, plus_tier: 'silver', total_orders: 12, auth_provider: 'local',
    });
    console.log(`✅ Default user created: ${defaultUser.email} / password123`);

    await Cart.create({ user_id: defaultUser.id });
    await Wishlist.create({ user_id: defaultUser.id });
    console.log('✅ Cart and wishlist created.\n');

    const createdCategories = await Category.bulkCreate(categories);
    console.log(`✅ ${createdCategories.length} categories created.`);

    const createdProducts = await Product.bulkCreate(products);
    console.log(`✅ ${createdProducts.length} products created.\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('───────────────────────────────────────');
    console.log('Default login: john@example.com / password123');
    console.log('───────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
