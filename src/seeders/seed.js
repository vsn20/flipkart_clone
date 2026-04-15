const sequelize = require('../config/database');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const SubSubcategory = require('../models/SubSubcategory');
const Brand = require('../models/Brand');
const Color = require('../models/Color');
const Product = require('../models/Product');

// ─── Real product image URLs (portrait-oriented, reliable CDN) ───
const IMG = {
  // Phones
  iphone15: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=312&h=416&fit=crop&q=80',
  iphone14: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=312&h=416&fit=crop&q=80',
  samsungS24: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=312&h=416&fit=crop&q=80',
  pixel8: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=312&h=416&fit=crop&q=80',
  oneplus: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=312&h=416&fit=crop&q=80',
  redmi: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=312&h=416&fit=crop&q=80',
  phone1: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa6?w=312&h=416&fit=crop&q=80',
  phone2: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=312&h=416&fit=crop&q=80',
  phone3: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=312&h=416&fit=crop&q=80',
  // Laptops
  laptop1: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=312&h=416&fit=crop&q=80',
  laptop2: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=312&h=416&fit=crop&q=80',
  macbook: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=312&h=416&fit=crop&q=80',
  laptop3: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=312&h=416&fit=crop&q=80',
  laptop4: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=312&h=416&fit=crop&q=80',
  // Audio
  headphone1: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=312&h=416&fit=crop&q=80',
  headphone2: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=312&h=416&fit=crop&q=80',
  headphone3: 'https://images.unsplash.com/photo-1546435770-a3e426bf59b7?w=312&h=416&fit=crop&q=80',
  speaker1: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=312&h=416&fit=crop&q=80',
  speaker2: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=312&h=416&fit=crop&q=80',
  earbuds1: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=312&h=416&fit=crop&q=80',
  earbuds2: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=312&h=416&fit=crop&q=80',
  // Tablets
  ipad: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=312&h=416&fit=crop&q=80',
  tablet: 'https://images.unsplash.com/photo-1561154464-82e9aab73b87?w=312&h=416&fit=crop&q=80',
  // TVs
  tv1: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=312&h=416&fit=crop&q=80',
  tv2: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=312&h=416&fit=crop&q=80',
  tv3: 'https://images.unsplash.com/photo-1558618666-fcd25c85f168?w=312&h=416&fit=crop&q=80',
  // Appliances
  ac: 'https://images.unsplash.com/photo-1585338107529-13afc25806f9?w=312&h=416&fit=crop&q=80',
  fridge: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=312&h=416&fit=crop&q=80',
  washer: 'https://images.unsplash.com/photo-1626806787426-621c03e0b5d2?w=312&h=416&fit=crop&q=80',
  microwave: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=312&h=416&fit=crop&q=80',
  mixer: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=312&h=416&fit=crop&q=80',
  airfryer: 'https://images.unsplash.com/photo-1648733666345-bb3e5e1ac4dd?w=312&h=416&fit=crop&q=80',
  // Men Fashion
  tshirt1: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=312&h=416&fit=crop&q=80',
  tshirt2: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=312&h=416&fit=crop&q=80',
  shirt1: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=312&h=416&fit=crop&q=80',
  shirt2: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=312&h=416&fit=crop&q=80',
  jeans1: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=312&h=416&fit=crop&q=80',
  jeans2: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=312&h=416&fit=crop&q=80',
  jacket1: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=312&h=416&fit=crop&q=80',
  blazer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=312&h=416&fit=crop&q=80',
  polo: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=312&h=416&fit=crop&q=80',
  // Men Shoes
  sneaker1: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=312&h=416&fit=crop&q=80',
  sneaker2: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=312&h=416&fit=crop&q=80',
  sneaker3: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=312&h=416&fit=crop&q=80',
  shoe1: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=312&h=416&fit=crop&q=80',
  shoe2: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=312&h=416&fit=crop&q=80',
  boots: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=312&h=416&fit=crop&q=80',
  // Women Fashion
  kurta1: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=312&h=416&fit=crop&q=80',
  kurta2: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=312&h=416&fit=crop&q=80',
  saree1: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=312&h=416&fit=crop&q=80',
  saree2: 'https://images.unsplash.com/photo-1583391733981-8b530db00438?w=312&h=416&fit=crop&q=80',
  dress1: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=312&h=416&fit=crop&q=80',
  dress2: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=312&h=416&fit=crop&q=80',
  top1: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=312&h=416&fit=crop&q=80',
  top2: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=312&h=416&fit=crop&q=80',
  lehenga: 'https://images.unsplash.com/photo-1595777457583-95e4f5a13d76?w=312&h=416&fit=crop&q=80',
  // Women Accessories
  handbag1: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=312&h=416&fit=crop&q=80',
  handbag2: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=312&h=416&fit=crop&q=80',
  heels: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=312&h=416&fit=crop&q=80',
  jewellery1: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6f5?w=312&h=416&fit=crop&q=80',
  // Watches
  watch1: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=312&h=416&fit=crop&q=80',
  watch2: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=312&h=416&fit=crop&q=80',
  watch3: 'https://images.unsplash.com/photo-1542496658-e33a6d0d56a6?w=312&h=416&fit=crop&q=80',
  smartwatch: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=312&h=416&fit=crop&q=80',
  // Beauty
  beauty1: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=312&h=416&fit=crop&q=80',
  beauty2: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=312&h=416&fit=crop&q=80',
  beauty3: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=312&h=416&fit=crop&q=80',
  perfume: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=312&h=416&fit=crop&q=80',
  skincare: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=312&h=416&fit=crop&q=80',
  // Kids & Toys
  lego: 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=312&h=416&fit=crop&q=80',
  toy1: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=312&h=416&fit=crop&q=80',
  toy2: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=312&h=416&fit=crop&q=80',
  doll: 'https://images.unsplash.com/photo-1613682988402-8aac7a152094?w=312&h=416&fit=crop&q=80',
  babycare: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=312&h=416&fit=crop&q=80',
  kidclothes: 'https://images.unsplash.com/photo-1519238263530-99bdd11ffa68?w=312&h=416&fit=crop&q=80',
  // Home & Furniture
  sofa: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=312&h=416&fit=crop&q=80',
  bed: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=312&h=416&fit=crop&q=80',
  table: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=312&h=416&fit=crop&q=80',
  lamp: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=312&h=416&fit=crop&q=80',
  curtain: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=312&h=416&fit=crop&q=80',
  decor: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=312&h=416&fit=crop&q=80',
  pillow: 'https://images.unsplash.com/photo-1592789705501-f9ae4278a9e9?w=312&h=416&fit=crop&q=80',
  cookware: 'https://images.unsplash.com/photo-1584990347449-a2d4c2c044c9?w=312&h=416&fit=crop&q=80',
  // Sports
  cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=312&h=416&fit=crop&q=80',
  football: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=312&h=416&fit=crop&q=80',
  badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=312&h=416&fit=crop&q=80',
  yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=312&h=416&fit=crop&q=80',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=312&h=416&fit=crop&q=80',
  shoes_sport: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=312&h=416&fit=crop&q=80',
  // Books
  book1: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=312&h=416&fit=crop&q=80',
  book2: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=312&h=416&fit=crop&q=80',
  book3: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=312&h=416&fit=crop&q=80',
  // Grocery
  grocery1: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=312&h=416&fit=crop&q=80',
  grocery2: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=312&h=416&fit=crop&q=80',
  coffee: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=312&h=416&fit=crop&q=80',
  sunglasses: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=312&h=416&fit=crop&q=80',
  backpack: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=312&h=416&fit=crop&q=80',
  camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=312&h=416&fit=crop&q=80',
};

async function seed() {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️  Database cleared & synced');

    // ═══ CATEGORIES ═══
    const cats = await Category.bulkCreate([
      { name: 'Electronics', slug: 'electronics', image_url: '💻' },
      { name: 'TVs & Appliances', slug: 'tvs-appliances', image_url: '📺' },
      { name: 'Men', slug: 'men', image_url: '👔' },
      { name: 'Women', slug: 'women', image_url: '👗' },
      { name: 'Baby & Kids', slug: 'baby-kids', image_url: '🧒' },
      { name: 'Home & Furniture', slug: 'home-furniture', image_url: '🏠' },
      { name: 'Sports, Books & More', slug: 'sports-books-more', image_url: '⚽' },
      { name: 'Grocery', slug: 'grocery', image_url: '🛒' },
    ]);
    const [cElec, cTV, cMen, cWomen, cKids, cHome, cSports, cGrocery] = cats;
    console.log('✅ 8 Categories');

    // ═══ SUBCATEGORIES ═══
    const subData = [
      // Electronics
      { name: 'Mobiles', slug: 'mobiles', category_id: cElec.id },
      { name: 'Mobile Accessories', slug: 'mobile-accessories', category_id: cElec.id },
      { name: 'Laptops', slug: 'laptops', category_id: cElec.id },
      { name: 'Tablets', slug: 'tablets', category_id: cElec.id },
      { name: 'Audio', slug: 'audio', category_id: cElec.id },
      { name: 'Cameras', slug: 'cameras', category_id: cElec.id },
      { name: 'Smart Wearables', slug: 'smart-wearables', category_id: cElec.id },
      // TVs & Appliances
      { name: 'Television', slug: 'television', category_id: cTV.id },
      { name: 'Washing Machine', slug: 'washing-machine', category_id: cTV.id },
      { name: 'Air Conditioners', slug: 'air-conditioners', category_id: cTV.id },
      { name: 'Refrigerators', slug: 'refrigerators', category_id: cTV.id },
      { name: 'Kitchen Appliances', slug: 'kitchen-appliances', category_id: cTV.id },
      // Men
      { name: 'Men Top Wear', slug: 'men-top-wear', category_id: cMen.id },
      { name: 'Men Bottom Wear', slug: 'men-bottom-wear', category_id: cMen.id },
      { name: 'Men Footwear', slug: 'men-footwear', category_id: cMen.id },
      { name: 'Men Watches', slug: 'men-watches', category_id: cMen.id },
      { name: 'Men Accessories', slug: 'men-accessories', category_id: cMen.id },
      // Women
      { name: 'Indian & Fusion Wear', slug: 'indian-fusion-wear', category_id: cWomen.id },
      { name: 'Western Wear', slug: 'western-wear', category_id: cWomen.id },
      { name: 'Women Footwear', slug: 'women-footwear', category_id: cWomen.id },
      { name: 'Handbags & Clutches', slug: 'handbags-clutches', category_id: cWomen.id },
      { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', category_id: cWomen.id },
      { name: 'Jewellery', slug: 'jewellery', category_id: cWomen.id },
      // Kids
      { name: 'Toys', slug: 'toys', category_id: cKids.id },
      { name: 'Baby Care', slug: 'baby-care', category_id: cKids.id },
      { name: 'Kids Clothing', slug: 'kids-clothing', category_id: cKids.id },
      // Home
      { name: 'Furniture', slug: 'furniture', category_id: cHome.id },
      { name: 'Decor', slug: 'decor', category_id: cHome.id },
      { name: 'Bedding', slug: 'bedding', category_id: cHome.id },
      { name: 'Kitchen & Dining', slug: 'kitchen-dining', category_id: cHome.id },
      // Sports
      { name: 'Sports Equipment', slug: 'sports-equipment', category_id: cSports.id },
      { name: 'Fitness', slug: 'fitness', category_id: cSports.id },
      { name: 'Books', slug: 'books', category_id: cSports.id },
      // Grocery
      { name: 'Staples', slug: 'staples', category_id: cGrocery.id },
      { name: 'Beverages', slug: 'beverages', category_id: cGrocery.id },
      { name: 'Snacks', slug: 'snacks', category_id: cGrocery.id },
    ];
    const subs = await Subcategory.bulkCreate(subData);
    console.log(`✅ ${subs.length} Subcategories`);

    // Map subs by slug
    const S = {};
    subs.forEach(s => S[s.slug] = s);

    // ═══ SUB-SUBCATEGORIES ═══
    const ssubData = [
      // Mobiles
      { name: 'Apple', slug: 'apple', subcategory_id: S['mobiles'].id },
      { name: 'Samsung', slug: 'samsung-mobiles', subcategory_id: S['mobiles'].id },
      { name: 'OnePlus', slug: 'oneplus-mobiles', subcategory_id: S['mobiles'].id },
      { name: 'Google Pixel', slug: 'google-pixel', subcategory_id: S['mobiles'].id },
      { name: 'Xiaomi', slug: 'xiaomi-mobiles', subcategory_id: S['mobiles'].id },
      { name: 'Realme', slug: 'realme-mobiles', subcategory_id: S['mobiles'].id },
      { name: 'OPPO', slug: 'oppo-mobiles', subcategory_id: S['mobiles'].id },
      { name: 'Vivo', slug: 'vivo-mobiles', subcategory_id: S['mobiles'].id },
      { name: 'Nothing', slug: 'nothing-mobiles', subcategory_id: S['mobiles'].id },
      { name: 'POCO', slug: 'poco-mobiles', subcategory_id: S['mobiles'].id },
      // Laptops
      { name: 'Gaming Laptops', slug: 'gaming-laptops', subcategory_id: S['laptops'].id },
      { name: 'Thin & Light', slug: 'thin-light', subcategory_id: S['laptops'].id },
      { name: 'Business Laptops', slug: 'business-laptops', subcategory_id: S['laptops'].id },
      // Audio
      { name: 'Headphones', slug: 'headphones', subcategory_id: S['audio'].id },
      { name: 'Earbuds', slug: 'earbuds', subcategory_id: S['audio'].id },
      { name: 'Bluetooth Speakers', slug: 'bluetooth-speakers', subcategory_id: S['audio'].id },
      // TV
      { name: 'Smart TVs', slug: 'smart-tvs', subcategory_id: S['television'].id },
      { name: '4K TVs', slug: '4k-tvs', subcategory_id: S['television'].id },
      { name: 'OLED TVs', slug: 'oled-tvs', subcategory_id: S['television'].id },
      // Kitchen
      { name: 'Mixer Grinders', slug: 'mixer-grinders', subcategory_id: S['kitchen-appliances'].id },
      { name: 'Air Fryers', slug: 'air-fryers', subcategory_id: S['kitchen-appliances'].id },
      { name: 'Microwaves', slug: 'microwaves-ss', subcategory_id: S['kitchen-appliances'].id },
      // Men Top
      { name: "Men's T-Shirts", slug: 'mens-tshirts', subcategory_id: S['men-top-wear'].id },
      { name: "Casual Shirts", slug: 'casual-shirts', subcategory_id: S['men-top-wear'].id },
      { name: "Formal Shirts", slug: 'formal-shirts', subcategory_id: S['men-top-wear'].id },
      { name: "Jackets", slug: 'jackets', subcategory_id: S['men-top-wear'].id },
      // Men Bottom
      { name: "Jeans", slug: 'mens-jeans', subcategory_id: S['men-bottom-wear'].id },
      { name: "Trousers", slug: 'mens-trousers', subcategory_id: S['men-bottom-wear'].id },
      { name: "Track Pants", slug: 'track-pants', subcategory_id: S['men-bottom-wear'].id },
      // Men footwear
      { name: "Sneakers", slug: 'sneakers', subcategory_id: S['men-footwear'].id },
      { name: "Sports Shoes", slug: 'sports-shoes', subcategory_id: S['men-footwear'].id },
      { name: "Formal Shoes", slug: 'formal-shoes', subcategory_id: S['men-footwear'].id },
      // Women Indian
      { name: "Kurtas", slug: 'kurtas', subcategory_id: S['indian-fusion-wear'].id },
      { name: "Sarees", slug: 'sarees', subcategory_id: S['indian-fusion-wear'].id },
      { name: "Lehenga Choli", slug: 'lehenga-choli', subcategory_id: S['indian-fusion-wear'].id },
      // Women Western
      { name: "Dresses", slug: 'dresses', subcategory_id: S['western-wear'].id },
      { name: "Tops", slug: 'tops', subcategory_id: S['western-wear'].id },
      { name: "Jeans (Women)", slug: 'womens-jeans', subcategory_id: S['western-wear'].id },
      // Beauty
      { name: "Skincare", slug: 'skincare', subcategory_id: S['beauty-personal-care'].id },
      { name: "Makeup", slug: 'makeup', subcategory_id: S['beauty-personal-care'].id },
      { name: "Perfumes", slug: 'perfumes', subcategory_id: S['beauty-personal-care'].id },
      // Toys
      { name: "Building Sets", slug: 'building-sets', subcategory_id: S['toys'].id },
      { name: "Action Figures", slug: 'action-figures', subcategory_id: S['toys'].id },
      { name: "Board Games", slug: 'board-games', subcategory_id: S['toys'].id },
      // Sports
      { name: "Cricket", slug: 'cricket', subcategory_id: S['sports-equipment'].id },
      { name: "Football", slug: 'football', subcategory_id: S['sports-equipment'].id },
      { name: "Badminton", slug: 'badminton', subcategory_id: S['sports-equipment'].id },
      { name: "Tennis", slug: 'tennis', subcategory_id: S['sports-equipment'].id },
      { name: "Basketball", slug: 'basketball', subcategory_id: S['sports-equipment'].id },
      // Books
      { name: "Fiction", slug: 'fiction', subcategory_id: S['books'].id },
      { name: "Self-Help", slug: 'self-help', subcategory_id: S['books'].id },
      { name: "Academic", slug: 'academic', subcategory_id: S['books'].id },
      { name: "Comics & Manga", slug: 'comics-manga', subcategory_id: S['books'].id },
      { name: "Biographies", slug: 'biographies', subcategory_id: S['books'].id },
      // ── NEW: Mobile Accessories ──
      { name: "Cases & Covers", slug: 'cases-covers', subcategory_id: S['mobile-accessories'].id },
      { name: "Screen Guards", slug: 'screen-guards', subcategory_id: S['mobile-accessories'].id },
      { name: "Power Banks", slug: 'power-banks', subcategory_id: S['mobile-accessories'].id },
      { name: "Chargers", slug: 'chargers', subcategory_id: S['mobile-accessories'].id },
      { name: "Cables", slug: 'cables', subcategory_id: S['mobile-accessories'].id },
      // ── NEW: Tablets ──
      { name: "Apple iPads", slug: 'apple-ipads', subcategory_id: S['tablets'].id },
      { name: "Samsung Tablets", slug: 'samsung-tablets', subcategory_id: S['tablets'].id },
      { name: "Budget Tablets", slug: 'budget-tablets', subcategory_id: S['tablets'].id },
      // ── NEW: Cameras ──
      { name: "DSLR", slug: 'dslr', subcategory_id: S['cameras'].id },
      { name: "Mirrorless", slug: 'mirrorless', subcategory_id: S['cameras'].id },
      { name: "Action Cameras", slug: 'action-cameras', subcategory_id: S['cameras'].id },
      { name: "Instant Cameras", slug: 'instant-cameras', subcategory_id: S['cameras'].id },
      // ── NEW: Smart Wearables ──
      { name: "Smartwatches", slug: 'smartwatches', subcategory_id: S['smart-wearables'].id },
      { name: "Fitness Bands", slug: 'fitness-bands', subcategory_id: S['smart-wearables'].id },
      { name: "Smart Rings", slug: 'smart-rings', subcategory_id: S['smart-wearables'].id },
      // ── NEW: ACs ──
      { name: "Split ACs", slug: 'split-acs', subcategory_id: S['air-conditioners'].id },
      { name: "Window ACs", slug: 'window-acs', subcategory_id: S['air-conditioners'].id },
      { name: "Portable ACs", slug: 'portable-acs', subcategory_id: S['air-conditioners'].id },
      // ── NEW: Refrigerators ──
      { name: "Single Door", slug: 'single-door-fridge', subcategory_id: S['refrigerators'].id },
      { name: "Double Door", slug: 'double-door-fridge', subcategory_id: S['refrigerators'].id },
      { name: "Side by Side", slug: 'side-by-side', subcategory_id: S['refrigerators'].id },
      // ── NEW: Washing Machine ──
      { name: "Front Load", slug: 'front-load', subcategory_id: S['washing-machine'].id },
      { name: "Top Load", slug: 'top-load', subcategory_id: S['washing-machine'].id },
      { name: "Semi Automatic", slug: 'semi-automatic', subcategory_id: S['washing-machine'].id },
      // ── NEW: Men Watches ──
      { name: "Analog Watches", slug: 'analog-watches', subcategory_id: S['men-watches'].id },
      { name: "Digital Watches", slug: 'digital-watches', subcategory_id: S['men-watches'].id },
      { name: "Chronograph", slug: 'chronograph', subcategory_id: S['men-watches'].id },
      // ── NEW: Men Accessories ──
      { name: "Sunglasses", slug: 'sunglasses', subcategory_id: S['men-accessories'].id },
      { name: "Backpacks", slug: 'backpacks', subcategory_id: S['men-accessories'].id },
      { name: "Wallets", slug: 'wallets', subcategory_id: S['men-accessories'].id },
      { name: "Belts", slug: 'belts', subcategory_id: S['men-accessories'].id },
      // ── NEW: Women Footwear ──
      { name: "Heels", slug: 'heels', subcategory_id: S['women-footwear'].id },
      { name: "Flats", slug: 'flats', subcategory_id: S['women-footwear'].id },
      { name: "Wedges", slug: 'wedges', subcategory_id: S['women-footwear'].id },
      { name: "Sports Shoes (W)", slug: 'women-sports-shoes', subcategory_id: S['women-footwear'].id },
      // ── NEW: Handbags ──
      { name: "Tote Bags", slug: 'tote-bags', subcategory_id: S['handbags-clutches'].id },
      { name: "Sling Bags", slug: 'sling-bags', subcategory_id: S['handbags-clutches'].id },
      { name: "Clutches", slug: 'clutches', subcategory_id: S['handbags-clutches'].id },
      { name: "Wallets (W)", slug: 'wallets-women', subcategory_id: S['handbags-clutches'].id },
      // ── NEW: Jewellery ──
      { name: "Necklaces", slug: 'necklaces', subcategory_id: S['jewellery'].id },
      { name: "Earrings", slug: 'earrings', subcategory_id: S['jewellery'].id },
      { name: "Bangles", slug: 'bangles', subcategory_id: S['jewellery'].id },
      { name: "Rings", slug: 'rings-jewellery', subcategory_id: S['jewellery'].id },
      // ── NEW: Baby Care ──
      { name: "Diapers", slug: 'diapers', subcategory_id: S['baby-care'].id },
      { name: "Baby Skin Care", slug: 'baby-skin-care', subcategory_id: S['baby-care'].id },
      { name: "Feeding", slug: 'feeding', subcategory_id: S['baby-care'].id },
      // ── NEW: Kids Clothing ──
      { name: "Boys Clothing", slug: 'boys-clothing', subcategory_id: S['kids-clothing'].id },
      { name: "Girls Clothing", slug: 'girls-clothing', subcategory_id: S['kids-clothing'].id },
      { name: "Kids Footwear", slug: 'kids-footwear', subcategory_id: S['kids-clothing'].id },
      // ── NEW: Furniture ──
      { name: "Sofas", slug: 'sofas', subcategory_id: S['furniture'].id },
      { name: "Beds", slug: 'beds', subcategory_id: S['furniture'].id },
      { name: "Wardrobes", slug: 'wardrobes', subcategory_id: S['furniture'].id },
      { name: "Study Tables", slug: 'study-tables', subcategory_id: S['furniture'].id },
      { name: "Shoe Racks", slug: 'shoe-racks', subcategory_id: S['furniture'].id },
      // ── NEW: Decor ──
      { name: "Wall Art", slug: 'wall-art', subcategory_id: S['decor'].id },
      { name: "Clocks", slug: 'clocks', subcategory_id: S['decor'].id },
      { name: "Lamps & Lighting", slug: 'lamps-lighting', subcategory_id: S['decor'].id },
      { name: "Curtains & Blinds", slug: 'curtains-blinds', subcategory_id: S['decor'].id },
      // ── NEW: Bedding ──
      { name: "Mattresses", slug: 'mattresses', subcategory_id: S['bedding'].id },
      { name: "Bedsheets", slug: 'bedsheets', subcategory_id: S['bedding'].id },
      { name: "Pillows", slug: 'pillows', subcategory_id: S['bedding'].id },
      { name: "Comforters", slug: 'comforters', subcategory_id: S['bedding'].id },
      // ── NEW: Kitchen Dining ──
      { name: "Cookware", slug: 'cookware', subcategory_id: S['kitchen-dining'].id },
      { name: "Pressure Cookers", slug: 'pressure-cookers', subcategory_id: S['kitchen-dining'].id },
      { name: "Dinnerware", slug: 'dinnerware', subcategory_id: S['kitchen-dining'].id },
      { name: "Water Bottles", slug: 'water-bottles', subcategory_id: S['kitchen-dining'].id },
      // ── NEW: Fitness ──
      { name: "Yoga Mats", slug: 'yoga-mats', subcategory_id: S['fitness'].id },
      { name: "Dumbbells", slug: 'dumbbells', subcategory_id: S['fitness'].id },
      { name: "Gym Equipment", slug: 'gym-equipment', subcategory_id: S['fitness'].id },
      { name: "Running Shoes", slug: 'running-shoes', subcategory_id: S['fitness'].id },
      // ── NEW: Grocery sub-subcategories ──
      { name: "Rice & Dal", slug: 'rice-dal', subcategory_id: S['staples'].id },
      { name: "Atta & Flour", slug: 'atta-flour', subcategory_id: S['staples'].id },
      { name: "Oils & Ghee", slug: 'oils-ghee', subcategory_id: S['staples'].id },
      { name: "Tea & Coffee", slug: 'tea-coffee', subcategory_id: S['beverages'].id },
      { name: "Health Drinks", slug: 'health-drinks', subcategory_id: S['beverages'].id },
      { name: "Juices", slug: 'juices', subcategory_id: S['beverages'].id },
      { name: "Biscuits", slug: 'biscuits', subcategory_id: S['snacks'].id },
      { name: "Chips & Namkeen", slug: 'chips-namkeen', subcategory_id: S['snacks'].id },
      { name: "Chocolates", slug: 'chocolates', subcategory_id: S['snacks'].id },
    ];
    const ssubs = await SubSubcategory.bulkCreate(ssubData);
    console.log(`✅ ${ssubs.length} Sub-subcategories`);
    const SS = {};
    ssubs.forEach(s => SS[s.slug] = s);

    // ═══ BRANDS ═══
    const brandData = [
      'Apple','Samsung','OnePlus','Google','Xiaomi','Realme','OPPO','Vivo','Nothing','POCO',
      'Sony','JBL','boAt','Bose','Sennheiser',
      'HP','Dell','Lenovo','ASUS','Acer',
      'Nike','Adidas','Puma','Reebok','Skechers','Woodland','Red Tape','Bata',
      'Allen Solly','Van Heusen','Peter England','US Polo','Levi\'s','Wrangler','WROGN','H&M',
      'Fossil','Titan','Fastrack','Casio','Noise','Fire-Boltt','Amazfit',
      'LG','Whirlpool','Voltas','Daikin','IFB','Bajaj','Prestige','Philips','Butterfly',
      'Lavie','Baggit','Caprese','Hidesign',
      'Lakme','Maybelline','L\'Oreal','Nivea',
      'LEGO','Funskool','Hot Wheels','Fisher-Price','Barbie','Nerf',
      'SG','Yonex','Cosco','Nivia',
      'Tata','Fortune','Nescafe','Parle',
      'Anubhutee','Kalini','Libas','Aurelia','BIBA','Ishin',
      'Bombay Dyeing','Wakefit','IKEA','Solimo',
    ].map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
    const brands = await Brand.bulkCreate(brandData);
    console.log(`✅ ${brands.length} Brands`);
    const B = {};
    brands.forEach(b => B[b.name] = b);

    // ═══ COLORS ═══
    const colorData = [
      { name: 'Black', hex_code: '#000000' }, { name: 'White', hex_code: '#FFFFFF' },
      { name: 'Blue', hex_code: '#2196F3' }, { name: 'Red', hex_code: '#F44336' },
      { name: 'Green', hex_code: '#4CAF50' }, { name: 'Gold', hex_code: '#FFD700' },
      { name: 'Silver', hex_code: '#C0C0C0' }, { name: 'Pink', hex_code: '#E91E63' },
      { name: 'Grey', hex_code: '#9E9E9E' }, { name: 'Brown', hex_code: '#795548' },
      { name: 'Yellow', hex_code: '#FFEB3B' }, { name: 'Purple', hex_code: '#9C27B0' },
    ];
    await Color.bulkCreate(colorData);
    console.log('✅ 12 Colors');

    // ═══ PRODUCTS (130+) ═══
    const products = [
      // ──────── ELECTRONICS > MOBILES (15) ────────
      { name:'Apple iPhone 15 (Blue, 128 GB)', slug:'apple-iphone-15-blue-128gb', description:'A16 Bionic Chip, 48MP Camera, Dynamic Island, USB-C', price:69999, mrp:79900, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['apple'].id, brand_id:B['Apple'].id, brand:'Apple', color:'Blue', images:[IMG.iphone15,IMG.phone1], rating:4.6, review_count:15234, discount_percent:12, is_featured:true, specifications:{Display:'6.1" Super Retina XDR',Processor:'A16 Bionic',Camera:'48MP + 12MP',Battery:'3349 mAh'} },
      { name:'Apple iPhone 14 (Midnight, 128 GB)', slug:'apple-iphone-14-midnight', description:'A15 Bionic chip, Crash Detection, 12MP camera system', price:57999, mrp:69900, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['apple'].id, brand_id:B['Apple'].id, brand:'Apple', color:'Black', images:[IMG.phone1,IMG.iphone15], rating:4.5, review_count:22341, discount_percent:17 },
      { name:'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)', slug:'samsung-galaxy-s24-ultra', description:'Snapdragon 8 Gen 3, 200MP Camera, S Pen, AI Features', price:129999, mrp:134999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['samsung-mobiles'].id, brand_id:B['Samsung'].id, brand:'Samsung', color:'Grey', images:[IMG.samsungS24,IMG.phone2], rating:4.5, review_count:8923, discount_percent:4, is_featured:true },
      { name:'Samsung Galaxy A55 5G (Awesome Iceblue, 128 GB)', slug:'samsung-galaxy-a55', description:'Exynos 1480, 50MP OIS Camera, 5000mAh', price:29999, mrp:34999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['samsung-mobiles'].id, brand_id:B['Samsung'].id, brand:'Samsung', color:'Blue', images:[IMG.phone2,IMG.samsungS24], rating:4.3, review_count:5672, discount_percent:14 },
      { name:'OnePlus 12 (Flowy Emerald, 256 GB)', slug:'oneplus-12-emerald', description:'Snapdragon 8 Gen 3, 50MP Hasselblad, 100W SUPERVOOC', price:64999, mrp:69999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['oneplus-mobiles'].id, brand_id:B['OnePlus'].id, brand:'OnePlus', color:'Green', images:[IMG.oneplus,IMG.phone3], rating:4.4, review_count:12456, discount_percent:7, is_featured:true },
      { name:'OnePlus Nord CE4 (Dark Chrome, 128 GB)', slug:'oneplus-nord-ce4', description:'Snapdragon 7 Gen 3, 50MP Sony sensor, 100W charging', price:24999, mrp:27999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['oneplus-mobiles'].id, brand_id:B['OnePlus'].id, brand:'OnePlus', color:'Black', images:[IMG.phone3,IMG.oneplus], rating:4.2, review_count:8901, discount_percent:11 },
      { name:'Google Pixel 8 (Obsidian, 128 GB)', slug:'google-pixel-8', description:'Tensor G3, 50MP camera, 7 years of updates, AI features', price:52999, mrp:59999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['google-pixel'].id, brand_id:B['Google'].id, brand:'Google', color:'Black', images:[IMG.pixel8,IMG.phone1], rating:4.3, review_count:6789, discount_percent:12 },
      { name:'Xiaomi 14 (Jade Green, 256 GB)', slug:'xiaomi-14-jade', description:'Snapdragon 8 Gen 3, Leica optics, 75W HyperCharge', price:59999, mrp:69999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['xiaomi-mobiles'].id, brand_id:B['Xiaomi'].id, brand:'Xiaomi', color:'Green', images:[IMG.redmi,IMG.phone2], rating:4.3, review_count:4532, discount_percent:14 },
      { name:'Redmi Note 13 Pro+ 5G (Fusion Purple, 256 GB)', slug:'redmi-note-13-pro-plus', description:'Dimensity 7200, 200MP camera, 120W charging', price:29999, mrp:33999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['xiaomi-mobiles'].id, brand_id:B['Xiaomi'].id, brand:'Xiaomi', color:'Purple', images:[IMG.phone3,IMG.redmi], rating:4.2, review_count:18234, discount_percent:12 },
      { name:'Realme GT 6T (Razor Green, 128 GB)', slug:'realme-gt-6t', description:'Snapdragon 7+ Gen 3, 120W charging, 120Hz display', price:22999, mrp:26999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['realme-mobiles'].id, brand_id:B['Realme'].id, brand:'Realme', color:'Green', images:[IMG.phone2,IMG.phone3], rating:4.1, review_count:7654, discount_percent:15 },
      { name:'OPPO Reno 11 Pro 5G (Pearl White, 256 GB)', slug:'oppo-reno-11-pro', description:'Dimensity 8200, 50MP telephoto, 67W SUPERVOOC', price:34999, mrp:39999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['oppo-mobiles'].id, brand_id:B['OPPO'].id, brand:'OPPO', color:'White', images:[IMG.phone1,IMG.phone2], rating:4.2, review_count:3456, discount_percent:13 },
      { name:'Vivo V30 Pro 5G (Peacock Green, 256 GB)', slug:'vivo-v30-pro', description:'Dimensity 8200, Zeiss cameras, Aura Light', price:38999, mrp:42999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['vivo-mobiles'].id, brand_id:B['Vivo'].id, brand:'Vivo', color:'Green', images:[IMG.phone3,IMG.phone1], rating:4.1, review_count:2345, discount_percent:9 },
      { name:'Nothing Phone (2a) (Black, 128 GB)', slug:'nothing-phone-2a', description:'Dimensity 7200 Pro, Glyph Interface, Nothing OS 2.5', price:23999, mrp:25999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['nothing-mobiles'].id, brand_id:B['Nothing'].id, brand:'Nothing', color:'Black', images:[IMG.phone2,IMG.phone3], rating:4.3, review_count:9876, discount_percent:8 },
      { name:'POCO X6 Pro 5G (Nebula Mango, 256 GB)', slug:'poco-x6-pro', description:'Dimensity 8300-Ultra, 64MP OIS, 67W turbo charging', price:24999, mrp:28999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['poco-mobiles'].id, brand_id:B['POCO'].id, brand:'POCO', color:'Yellow', images:[IMG.phone1,IMG.phone2], rating:4.2, review_count:11234, discount_percent:14 },
      { name:'Samsung Galaxy M34 5G (Midnight Blue, 128 GB)', slug:'samsung-galaxy-m34', description:'Exynos 1280, 50MP Triple Camera, 6000mAh', price:15999, mrp:19999, category_id:cElec.id, subcategory_id:S['mobiles'].id, sub_subcategory_id:SS['samsung-mobiles'].id, brand_id:B['Samsung'].id, brand:'Samsung', color:'Blue', images:[IMG.samsungS24,IMG.phone3], rating:4.1, review_count:24567, discount_percent:20 },

      // ──────── ELECTRONICS > AUDIO (8) ────────
      { name:'Sony WH-1000XM5 Wireless Noise Cancelling', slug:'sony-wh1000xm5', description:'Industry-leading ANC, 30hr battery, LDAC, multipoint', price:26990, mrp:34990, category_id:cElec.id, subcategory_id:S['audio'].id, sub_subcategory_id:SS['headphones'].id, brand_id:B['Sony'].id, brand:'Sony', color:'Black', images:[IMG.headphone1,IMG.headphone3], rating:4.5, review_count:4567, discount_percent:23, is_featured:true },
      { name:'JBL Tune 770NC Wireless Over-Ear Headphones', slug:'jbl-tune-770nc', description:'Adaptive ANC, 70hr battery, JBL Pure Bass', price:5999, mrp:7999, category_id:cElec.id, subcategory_id:S['audio'].id, sub_subcategory_id:SS['headphones'].id, brand_id:B['JBL'].id, brand:'JBL', color:'Blue', images:[IMG.headphone3,IMG.headphone1], rating:4.3, review_count:8765, discount_percent:25 },
      { name:'boAt Rockerz 550 Wireless Headphone', slug:'boat-rockerz-550', description:'50mm drivers, 20hr playback, Physical Noise Isolation', price:1799, mrp:3990, category_id:cElec.id, subcategory_id:S['audio'].id, sub_subcategory_id:SS['headphones'].id, brand_id:B['boAt'].id, brand:'boAt', color:'Black', images:[IMG.headphone2,IMG.headphone1], rating:4.1, review_count:45678, discount_percent:55 },
      { name:'Samsung Galaxy Buds2 Pro (Graphite)', slug:'samsung-galaxy-buds2-pro', description:'24bit Hi-Fi audio, Intelligent ANC, 360 Audio', price:11999, mrp:17999, category_id:cElec.id, subcategory_id:S['audio'].id, sub_subcategory_id:SS['earbuds'].id, brand_id:B['Samsung'].id, brand:'Samsung', color:'Black', images:[IMG.earbuds1,IMG.earbuds2], rating:4.3, review_count:5432, discount_percent:33 },
      { name:'boAt Airdopes 141 TWS Earbuds', slug:'boat-airdopes-141', description:'42H playtime, ENx tech, IWP, IPX4', price:999, mrp:2990, category_id:cElec.id, subcategory_id:S['audio'].id, sub_subcategory_id:SS['earbuds'].id, brand_id:B['boAt'].id, brand:'boAt', color:'Black', images:[IMG.earbuds2,IMG.earbuds1], rating:4.0, review_count:89012, discount_percent:67 },
      { name:'JBL Charge 5 Portable Bluetooth Speaker', slug:'jbl-charge-5', description:'IP67 waterproof, 20hr playtime, Powerbank function', price:12999, mrp:18999, category_id:cElec.id, subcategory_id:S['audio'].id, sub_subcategory_id:SS['bluetooth-speakers'].id, brand_id:B['JBL'].id, brand:'JBL', color:'Blue', images:[IMG.speaker1,IMG.speaker2], rating:4.4, review_count:8901, discount_percent:32, is_featured:true },
      { name:'Sony SRS-XB100 Portable Bluetooth Speaker', slug:'sony-srs-xb100', description:'IP67, 16hr battery, Extra Bass, hands-free calling', price:3990, mrp:5990, category_id:cElec.id, subcategory_id:S['audio'].id, sub_subcategory_id:SS['bluetooth-speakers'].id, brand_id:B['Sony'].id, brand:'Sony', color:'Black', images:[IMG.speaker2,IMG.speaker1], rating:4.2, review_count:6543, discount_percent:33 },
      { name:'boAt Stone 1200 14W Bluetooth Speaker', slug:'boat-stone-1200', description:'14W output, IPX7, TWS feature, 9hr playtime', price:2499, mrp:4990, category_id:cElec.id, subcategory_id:S['audio'].id, sub_subcategory_id:SS['bluetooth-speakers'].id, brand_id:B['boAt'].id, brand:'boAt', color:'Blue', images:[IMG.speaker1,IMG.speaker2], rating:4.1, review_count:23456, discount_percent:50 },

      // ──────── ELECTRONICS > LAPTOPS (6) ────────
      { name:'Apple MacBook Air M2 (Midnight, 8GB, 256GB)', slug:'macbook-air-m2', description:'M2 chip, 13.6" Liquid Retina, 18hr battery, MagSafe', price:99990, mrp:119900, category_id:cElec.id, subcategory_id:S['laptops'].id, sub_subcategory_id:SS['thin-light'].id, brand_id:B['Apple'].id, brand:'Apple', color:'Black', images:[IMG.macbook,IMG.laptop1], rating:4.7, review_count:4567, discount_percent:17, is_featured:true },
      { name:'HP Pavilion 15 (12th Gen i5, 16GB, 512GB SSD)', slug:'hp-pavilion-15', description:'Intel i5-1240P, 15.6" FHD IPS, Backlit KB', price:52990, mrp:65999, category_id:cElec.id, subcategory_id:S['laptops'].id, sub_subcategory_id:SS['thin-light'].id, brand_id:B['HP'].id, brand:'HP', color:'Silver', images:[IMG.laptop1,IMG.laptop2], rating:4.3, review_count:7890, discount_percent:20 },
      { name:'Dell Inspiron 15 (Ryzen 5 7530U, 8GB, 512GB)', slug:'dell-inspiron-15', description:'AMD Ryzen 5, 15.6" FHD, Carbon Black', price:42990, mrp:55999, category_id:cElec.id, subcategory_id:S['laptops'].id, sub_subcategory_id:SS['business-laptops'].id, brand_id:B['Dell'].id, brand:'Dell', color:'Black', images:[IMG.laptop2,IMG.laptop3], rating:4.2, review_count:5678, discount_percent:23 },
      { name:'Lenovo IdeaPad Slim 3 (i5, 16GB, 512GB)', slug:'lenovo-ideapad-slim3', description:'12th Gen Intel i5, 15.6" FHD, 7.5hr battery', price:44990, mrp:62990, category_id:cElec.id, subcategory_id:S['laptops'].id, sub_subcategory_id:SS['thin-light'].id, brand_id:B['Lenovo'].id, brand:'Lenovo', color:'Grey', images:[IMG.laptop3,IMG.laptop4], rating:4.2, review_count:9012, discount_percent:29 },
      { name:'ASUS ROG Strix G15 (Ryzen 7, RTX 4060, 16GB)', slug:'asus-rog-strix-g15', description:'Ryzen 7-7735HS, RTX 4060, 144Hz, 16GB DDR5', price:89990, mrp:114990, category_id:cElec.id, subcategory_id:S['laptops'].id, sub_subcategory_id:SS['gaming-laptops'].id, brand_id:B['ASUS'].id, brand:'ASUS', color:'Black', images:[IMG.laptop4,IMG.laptop1], rating:4.4, review_count:3456, discount_percent:22 },
      { name:'Acer Aspire 5 (13th Gen i5, 8GB, 512GB)', slug:'acer-aspire-5', description:'Intel i5-1335U, 15.6" FHD IPS, Fingerprint reader', price:38990, mrp:52999, category_id:cElec.id, subcategory_id:S['laptops'].id, sub_subcategory_id:SS['business-laptops'].id, brand_id:B['Acer'].id, brand:'Acer', color:'Silver', images:[IMG.laptop1,IMG.laptop3], rating:4.1, review_count:6789, discount_percent:26 },

      // ──────── ELECTRONICS > TABLETS (3) ────────
      { name:'Apple iPad (10th Gen) WiFi 64GB', slug:'apple-ipad-10th-gen', description:'A14 Bionic, 10.9" Liquid Retina, USB-C, 12MP', price:33999, mrp:39900, category_id:cElec.id, subcategory_id:S['tablets'].id, brand_id:B['Apple'].id, brand:'Apple', color:'Blue', images:[IMG.ipad,IMG.tablet], rating:4.6, review_count:7890, discount_percent:15, is_featured:true },
      { name:'Samsung Galaxy Tab S6 Lite (WiFi, 64GB)', slug:'samsung-tab-s6-lite', description:'10.4" TFT, S Pen included, Exynos 1280', price:19999, mrp:26999, category_id:cElec.id, subcategory_id:S['tablets'].id, brand_id:B['Samsung'].id, brand:'Samsung', color:'Grey', images:[IMG.tablet,IMG.ipad], rating:4.3, review_count:12345, discount_percent:26 },
      { name:'Xiaomi Pad 6 (Gravity Gray, 128GB)', slug:'xiaomi-pad-6', description:'Snapdragon 870, 11" 144Hz, quad speakers', price:24999, mrp:29999, category_id:cElec.id, subcategory_id:S['tablets'].id, brand_id:B['Xiaomi'].id, brand:'Xiaomi', color:'Grey', images:[IMG.ipad,IMG.tablet], rating:4.4, review_count:8765, discount_percent:17 },

      // ──────── ELECTRONICS > SMART WEARABLES (5) ────────
      { name:'Noise ColorFit Pro 5 Max Smartwatch', slug:'noise-colorfit-pro5-max', description:'1.96" AMOLED, BT calling, 100+ sports modes', price:3499, mrp:6999, category_id:cElec.id, subcategory_id:S['smart-wearables'].id, brand_id:B['Noise'].id, brand:'Noise', color:'Black', images:[IMG.smartwatch,IMG.watch1], rating:4.1, review_count:34567, discount_percent:50 },
      { name:'Fire-Boltt Phoenix Ultra Luxury Smartwatch', slug:'fire-boltt-phoenix', description:'1.39" HD display, BT calling, 120+ sports modes', price:1999, mrp:8999, category_id:cElec.id, subcategory_id:S['smart-wearables'].id, brand_id:B['Fire-Boltt'].id, brand:'Fire-Boltt', color:'Gold', images:[IMG.watch2,IMG.smartwatch], rating:3.9, review_count:56789, discount_percent:78 },
      { name:'Amazfit GTR 4 Smartwatch', slug:'amazfit-gtr-4', description:'1.43" AMOLED, GPS, 150+ sports, 14-day battery', price:14999, mrp:19999, category_id:cElec.id, subcategory_id:S['smart-wearables'].id, brand_id:B['Amazfit'].id, brand:'Amazfit', color:'Black', images:[IMG.smartwatch,IMG.watch3], rating:4.3, review_count:4567, discount_percent:25 },
      { name:'Fossil Neutra Gen 6 Hybrid Smartwatch', slug:'fossil-neutra-gen6', description:'E-ink display, Heart rate, SpO2, 2 weeks battery', price:14495, mrp:17995, category_id:cElec.id, subcategory_id:S['smart-wearables'].id, brand_id:B['Fossil'].id, brand:'Fossil', color:'Brown', images:[IMG.watch1,IMG.watch2], rating:4.4, review_count:2345, discount_percent:19 },
      { name:'Titan Octane Chronograph Watch', slug:'titan-octane-chrono', description:'46mm SS case, Chrono, 100m WR, mineral glass', price:6995, mrp:8495, category_id:cElec.id, subcategory_id:S['smart-wearables'].id, brand_id:B['Titan'].id, brand:'Titan', color:'Blue', images:[IMG.watch3,IMG.watch1], rating:4.5, review_count:12345, discount_percent:18 },

      // ──────── TVs & APPLIANCES > TV (5) ────────
      { name:'Samsung 55" Crystal 4K UHD Smart TV', slug:'samsung-55-crystal-4k', description:'Crystal Processor 4K, Smart Hub, HDR, PurColor', price:42999, mrp:64900, category_id:cTV.id, subcategory_id:S['television'].id, sub_subcategory_id:SS['4k-tvs'].id, brand_id:B['Samsung'].id, brand:'Samsung', color:'Black', images:[IMG.tv1,IMG.tv2], rating:4.4, review_count:10234, discount_percent:34 },
      { name:'LG 43 inch OLED Smart TV', slug:'lg-43-oled', description:'OLED evo, α9 Gen6 AI Processor, Dolby Vision IQ', price:89999, mrp:119999, category_id:cTV.id, subcategory_id:S['television'].id, sub_subcategory_id:SS['oled-tvs'].id, brand_id:B['LG'].id, brand:'LG', color:'Black', images:[IMG.tv2,IMG.tv3], rating:4.6, review_count:2345, discount_percent:25 },
      { name:'Sony Bravia 55" 4K Ultra HD Google TV', slug:'sony-bravia-55-4k', description:'X1 4K Processor, TRILUMINOS PRO, Google TV', price:59990, mrp:84990, category_id:cTV.id, subcategory_id:S['television'].id, sub_subcategory_id:SS['smart-tvs'].id, brand_id:B['Sony'].id, brand:'Sony', color:'Black', images:[IMG.tv3,IMG.tv1], rating:4.5, review_count:5678, discount_percent:29 },
      { name:'Xiaomi 43" Full HD Smart TV', slug:'xiaomi-43-smart-tv', description:'Vivid Picture Engine, 20W speakers, PatchWall', price:16999, mrp:27999, category_id:cTV.id, subcategory_id:S['television'].id, sub_subcategory_id:SS['smart-tvs'].id, brand_id:B['Xiaomi'].id, brand:'Xiaomi', color:'Black', images:[IMG.tv1,IMG.tv3], rating:4.2, review_count:34567, discount_percent:39 },
      { name:'Samsung 32" HD Ready Smart TV', slug:'samsung-32-hd', description:'Personal Computer Mode, Screen Mirroring', price:11990, mrp:18900, category_id:cTV.id, subcategory_id:S['television'].id, sub_subcategory_id:SS['smart-tvs'].id, brand_id:B['Samsung'].id, brand:'Samsung', color:'Black', images:[IMG.tv2,IMG.tv1], rating:4.1, review_count:45678, discount_percent:37 },

      // ──────── TVs & APPLIANCES > APPLIANCES (8) ────────
      { name:'LG 1.5 Ton 5 Star AI Dual Inverter Split AC', slug:'lg-1-5-ton-ac', description:'AI Convertible 6-in-1, HD Filter, Anti-allergy', price:39990, mrp:61990, category_id:cTV.id, subcategory_id:S['air-conditioners'].id, brand_id:B['LG'].id, brand:'LG', color:'White', images:[IMG.ac,IMG.fridge], rating:4.4, review_count:8901, discount_percent:35 },
      { name:'Daikin 1.5 Ton 3 Star Inverter Split AC', slug:'daikin-1-5-ton-ac', description:'PM 2.5 Filter, Coanda Airflow, Copper Condenser', price:36990, mrp:52990, category_id:cTV.id, subcategory_id:S['air-conditioners'].id, brand_id:B['Daikin'].id, brand:'Daikin', color:'White', images:[IMG.ac], rating:4.3, review_count:5678, discount_percent:30 },
      { name:'Samsung 253L Frost Free Double Door Fridge', slug:'samsung-253l-fridge', description:'Digital Inverter, Convertible 5-in-1, All-Around Cooling', price:22490, mrp:30990, category_id:cTV.id, subcategory_id:S['refrigerators'].id, brand_id:B['Samsung'].id, brand:'Samsung', color:'Silver', images:[IMG.fridge], rating:4.3, review_count:12345, discount_percent:27 },
      { name:'Whirlpool 190L Direct Cool Single Door', slug:'whirlpool-190l-fridge', description:'3 Star, Insulated Capillary, Stabilizer Free', price:11990, mrp:16500, category_id:cTV.id, subcategory_id:S['refrigerators'].id, brand_id:B['Whirlpool'].id, brand:'Whirlpool', color:'Silver', images:[IMG.fridge], rating:4.1, review_count:23456, discount_percent:27 },
      { name:'IFB 7 kg 5 Star Fully Automatic Front Load', slug:'ifb-7kg-front-load', description:'2X Power Steam, Ball Valve Technology', price:25990, mrp:33590, category_id:cTV.id, subcategory_id:S['washing-machine'].id, brand_id:B['IFB'].id, brand:'IFB', color:'White', images:[IMG.washer], rating:4.3, review_count:7890, discount_percent:23 },
      { name:'Samsung 7 kg Fully Automatic Top Load', slug:'samsung-7kg-top-load', description:'Digital Inverter Motor, Diamond Drum, Magic Dispenser', price:15990, mrp:21400, category_id:cTV.id, subcategory_id:S['washing-machine'].id, brand_id:B['Samsung'].id, brand:'Samsung', color:'Grey', images:[IMG.washer], rating:4.2, review_count:18765, discount_percent:25 },
      { name:'Philips Digital Air Fryer HD9252/70', slug:'philips-air-fryer', description:'Rapid Air, 0.8kg capacity, Touch panel, 7 presets', price:7999, mrp:11995, category_id:cTV.id, subcategory_id:S['kitchen-appliances'].id, sub_subcategory_id:SS['air-fryers'].id, brand_id:B['Philips'].id, brand:'Philips', color:'Black', images:[IMG.airfryer,IMG.mixer], rating:4.4, review_count:15678, discount_percent:33 },
      { name:'Prestige Iris 750W Mixer Grinder', slug:'prestige-iris-750w', description:'3 Stainless Steel Jars, 750W motor, 3 speed', price:3199, mrp:5195, category_id:cTV.id, subcategory_id:S['kitchen-appliances'].id, sub_subcategory_id:SS['mixer-grinders'].id, brand_id:B['Prestige'].id, brand:'Prestige', color:'White', images:[IMG.mixer,IMG.airfryer], rating:4.2, review_count:23456, discount_percent:38 },

      // ──────── MEN > TOP WEAR (10) ────────
      { name:'Allen Solly Men Slim Fit Casual Shirt', slug:'allen-solly-casual-shirt', description:'100% Cotton, Regular Fit, Spread Collar', price:999, mrp:1999, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, sub_subcategory_id:SS['casual-shirts'].id, brand_id:B['Allen Solly'].id, brand:'Allen Solly', color:'Blue', images:[IMG.shirt1,IMG.shirt2], rating:4.2, review_count:8765, discount_percent:50 },
      { name:'US Polo Assn Men Polo T-Shirt', slug:'us-polo-tshirt', description:'Cotton blend, Regular fit, Ribbed collar', price:799, mrp:1599, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, sub_subcategory_id:SS['mens-tshirts'].id, brand_id:B['US Polo'].id, brand:'US Polo', color:'White', images:[IMG.polo,IMG.tshirt1], rating:4.1, review_count:12345, discount_percent:50 },
      { name:'Peter England Men Formal Shirt', slug:'peter-england-formal', description:'Poly-Cotton, Slim Fit, Full Sleeves, Button Down', price:879, mrp:1699, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, sub_subcategory_id:SS['formal-shirts'].id, brand_id:B['Peter England'].id, brand:'Peter England', color:'White', images:[IMG.shirt2,IMG.shirt1], rating:4.0, review_count:9876, discount_percent:48 },
      { name:'Nike Dri-FIT Men Running T-Shirt', slug:'nike-dri-fit-tshirt', description:'Moisture-wicking, 100% Polyester, Regular fit', price:1495, mrp:2495, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, sub_subcategory_id:SS['mens-tshirts'].id, brand_id:B['Nike'].id, brand:'Nike', color:'Black', images:[IMG.tshirt1,IMG.tshirt2], rating:4.4, review_count:5678, discount_percent:40 },
      { name:'Adidas Originals Men Trefoil T-Shirt', slug:'adidas-trefoil-tshirt', description:'100% Cotton, Regular fit, Crew neck, Trefoil logo', price:1299, mrp:2199, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, sub_subcategory_id:SS['mens-tshirts'].id, brand_id:B['Adidas'].id, brand:'Adidas', color:'White', images:[IMG.tshirt2,IMG.tshirt1], rating:4.3, review_count:6789, discount_percent:41 },
      { name:'Puma ESS Logo Men Crew Neck T-Shirt', slug:'puma-ess-logo-tshirt', description:'Cotton jersey, Regular fit, PUMA Cat logo', price:699, mrp:1299, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, sub_subcategory_id:SS['mens-tshirts'].id, brand_id:B['Puma'].id, brand:'Puma', color:'Red', images:[IMG.tshirt1,IMG.polo], rating:4.2, review_count:34567, discount_percent:46 },
      { name:'Van Heusen Men Blazer', slug:'van-heusen-blazer', description:'Poly-Viscose, Slim Fit, Single breasted, Notch Lapel', price:3999, mrp:7999, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, sub_subcategory_id:SS['formal-shirts'].id, brand_id:B['Van Heusen'].id, brand:'Van Heusen', color:'Black', images:[IMG.blazer,IMG.shirt1], rating:4.3, review_count:3456, discount_percent:50 },
      { name:'WROGN Men Slim Fit Printed Casual Shirt', slug:'wrogn-casual-shirt', description:'100% Cotton, Slim Fit, Printed, Full Sleeves', price:849, mrp:1999, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, sub_subcategory_id:SS['casual-shirts'].id, brand_id:B['WROGN'].id, brand:'WROGN', color:'Blue', images:[IMG.shirt1,IMG.shirt2], rating:4.0, review_count:15678, discount_percent:58 },
      { name:'H&M Men Oversized T-Shirt', slug:'hm-oversized-tshirt', description:'Cotton jersey, Oversized fit, Round neck', price:599, mrp:999, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, sub_subcategory_id:SS['mens-tshirts'].id, brand_id:B['H&M'].id, brand:'H&M', color:'Black', images:[IMG.tshirt2,IMG.tshirt1], rating:4.1, review_count:23456, discount_percent:40 },
      { name:'Woodland Men Full Sleeve Jacket', slug:'woodland-jacket', description:'Polyester, Regular fit, Zip closure, 2 pockets', price:2999, mrp:5495, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, sub_subcategory_id:SS['jackets'].id, brand_id:B['Woodland'].id, brand:'Woodland', color:'Green', images:[IMG.jacket1,IMG.shirt1], rating:4.3, review_count:6789, discount_percent:45 },

      // ──────── MEN > BOTTOM WEAR (6) ────────
      { name:"Levi's 511 Slim Fit Men Jeans", slug:'levis-511-slim-jeans', description:'Slim fit through hip and thigh, sits below waist', price:2299, mrp:3999, category_id:cMen.id, subcategory_id:S['men-bottom-wear'].id, sub_subcategory_id:SS['mens-jeans'].id, brand_id:B["Levi's"].id, brand:"Levi's", color:'Blue', images:[IMG.jeans1,IMG.jeans2], rating:4.3, review_count:23456, discount_percent:43 },
      { name:'Wrangler Texas Regular Fit Jeans', slug:'wrangler-texas-jeans', description:'Straight leg, Regular fit, 5-pocket styling', price:1999, mrp:3495, category_id:cMen.id, subcategory_id:S['men-bottom-wear'].id, sub_subcategory_id:SS['mens-jeans'].id, brand_id:B['Wrangler'].id, brand:'Wrangler', color:'Blue', images:[IMG.jeans2,IMG.jeans1], rating:4.2, review_count:12345, discount_percent:43 },
      { name:'Allen Solly Men Slim Fit Trousers', slug:'allen-solly-trousers', description:'Poly-Viscose, Slim Fit, Mid-rise, Flat front', price:1199, mrp:2499, category_id:cMen.id, subcategory_id:S['men-bottom-wear'].id, sub_subcategory_id:SS['mens-trousers'].id, brand_id:B['Allen Solly'].id, brand:'Allen Solly', color:'Grey', images:[IMG.jeans1,IMG.jeans2], rating:4.1, review_count:8765, discount_percent:52 },
      { name:'US Polo Assn Men Regular Chinos', slug:'us-polo-chinos', description:'98% Cotton, Regular fit, 4 pocket, mid-rise', price:1299, mrp:2699, category_id:cMen.id, subcategory_id:S['men-bottom-wear'].id, sub_subcategory_id:SS['mens-trousers'].id, brand_id:B['US Polo'].id, brand:'US Polo', color:'Brown', images:[IMG.jeans2,IMG.jeans1], rating:4.2, review_count:7654, discount_percent:52 },
      { name:'Nike Men Track Pants', slug:'nike-track-pants', description:'Polyester, Standard fit, Elastic waist, Zip pockets', price:1795, mrp:2995, category_id:cMen.id, subcategory_id:S['men-bottom-wear'].id, sub_subcategory_id:SS['track-pants'].id, brand_id:B['Nike'].id, brand:'Nike', color:'Black', images:[IMG.jeans1], rating:4.3, review_count:5432, discount_percent:40 },
      { name:'Adidas Essentials 3-Stripes Joggers', slug:'adidas-3-stripe-joggers', description:'French terry, Regular fit, Drawcord waist', price:1999, mrp:3299, category_id:cMen.id, subcategory_id:S['men-bottom-wear'].id, sub_subcategory_id:SS['track-pants'].id, brand_id:B['Adidas'].id, brand:'Adidas', color:'Black', images:[IMG.jeans2], rating:4.3, review_count:8765, discount_percent:39 },

      // ──────── MEN > FOOTWEAR (8) ────────
      { name:'Nike Air Max 270 Men Sneakers', slug:'nike-air-max-270', description:'Air cushioning, Mesh upper, Rubber outsole', price:11997, mrp:14995, category_id:cMen.id, subcategory_id:S['men-footwear'].id, sub_subcategory_id:SS['sneakers'].id, brand_id:B['Nike'].id, brand:'Nike', color:'Black', images:[IMG.sneaker1,IMG.sneaker2], rating:4.5, review_count:6789, discount_percent:20 },
      { name:'Adidas Ultraboost 22 Running Shoes', slug:'adidas-ultraboost-22', description:'BOOST midsole, Primeknit upper, Continental rubber', price:11999, mrp:17999, category_id:cMen.id, subcategory_id:S['men-footwear'].id, sub_subcategory_id:SS['sports-shoes'].id, brand_id:B['Adidas'].id, brand:'Adidas', color:'White', images:[IMG.sneaker2,IMG.sneaker3], rating:4.5, review_count:4321, discount_percent:33, is_featured:true },
      { name:'Puma RS-X Reinvention Sneakers', slug:'puma-rsx-sneakers', description:'RS cushioning, Mesh/leather upper, Thick sole', price:5999, mrp:9999, category_id:cMen.id, subcategory_id:S['men-footwear'].id, sub_subcategory_id:SS['sneakers'].id, brand_id:B['Puma'].id, brand:'Puma', color:'White', images:[IMG.sneaker3,IMG.shoe1], rating:4.3, review_count:8765, discount_percent:40 },
      { name:'Skechers Go Walk 7 Men Walking Shoes', slug:'skechers-go-walk-7', description:'Air-Cooled Goga Mat, Ultra Go cushioning, Slip-on', price:4999, mrp:7999, category_id:cMen.id, subcategory_id:S['men-footwear'].id, sub_subcategory_id:SS['sports-shoes'].id, brand_id:B['Skechers'].id, brand:'Skechers', color:'Black', images:[IMG.shoe1,IMG.shoe2], rating:4.4, review_count:12345, discount_percent:38 },
      { name:'Woodland Men Leather Trekking Shoes', slug:'woodland-trekking-shoes', description:'Genuine leather, Rubber sole, Lace-up, Cushioned', price:3295, mrp:4895, category_id:cMen.id, subcategory_id:S['men-footwear'].id, sub_subcategory_id:SS['sports-shoes'].id, brand_id:B['Woodland'].id, brand:'Woodland', color:'Brown', images:[IMG.boots,IMG.shoe1], rating:4.3, review_count:23456, discount_percent:33 },
      { name:'Red Tape Men Casual Sneakers', slug:'red-tape-casual-sneakers', description:'Synthetic upper, Cushioned insole, Lace-up', price:1299, mrp:3699, category_id:cMen.id, subcategory_id:S['men-footwear'].id, sub_subcategory_id:SS['sneakers'].id, brand_id:B['Red Tape'].id, brand:'Red Tape', color:'White', images:[IMG.shoe2,IMG.sneaker1], rating:4.1, review_count:34567, discount_percent:65 },
      { name:'Bata Men Formal Leather Shoes', slug:'bata-formal-shoes', description:'Genuine leather, TPR sole, Lace-up, cushioned insole', price:2499, mrp:3999, category_id:cMen.id, subcategory_id:S['men-footwear'].id, sub_subcategory_id:SS['formal-shoes'].id, brand_id:B['Bata'].id, brand:'Bata', color:'Black', images:[IMG.shoe1,IMG.boots], rating:4.0, review_count:15678, discount_percent:38 },
      { name:'Reebok Classic Leather Men Sneakers', slug:'reebok-classic-leather', description:'Soft leather upper, EVA midsole, Classic design', price:4799, mrp:7999, category_id:cMen.id, subcategory_id:S['men-footwear'].id, sub_subcategory_id:SS['sneakers'].id, brand_id:B['Reebok'].id, brand:'Reebok', color:'White', images:[IMG.sneaker2,IMG.sneaker3], rating:4.3, review_count:5678, discount_percent:40 },

      // ──────── WOMEN > INDIAN & FUSION (8) ────────
      { name:'Anubhutee Floral Print Cotton Kurta Set', slug:'anubhutee-kurta-set', description:'Pure Cotton, Straight fit, 3/4 sleeves, with dupatta', price:949, mrp:2499, category_id:cWomen.id, subcategory_id:S['indian-fusion-wear'].id, sub_subcategory_id:SS['kurtas'].id, brand_id:B['Anubhutee'].id, brand:'Anubhutee', color:'Pink', images:[IMG.kurta1,IMG.kurta2], rating:4.1, review_count:23456, discount_percent:62 },
      { name:'Libas Women Embroidered Kurta with Palazzo', slug:'libas-embroidered-kurta', description:'Viscose Rayon, A-line, 3/4 sleeves, Mandarin collar', price:1149, mrp:2799, category_id:cWomen.id, subcategory_id:S['indian-fusion-wear'].id, sub_subcategory_id:SS['kurtas'].id, brand_id:B['Libas'].id, brand:'Libas', color:'Blue', images:[IMG.kurta2,IMG.kurta1], rating:4.0, review_count:18765, discount_percent:59 },
      { name:'Kalini Silk Banarasi Saree with Blouse', slug:'kalini-banarasi-saree', description:'Art Silk, Woven design, Tasselled border, with blouse', price:1299, mrp:4999, category_id:cWomen.id, subcategory_id:S['indian-fusion-wear'].id, sub_subcategory_id:SS['sarees'].id, brand_id:B['Kalini'].id, brand:'Kalini', color:'Red', images:[IMG.saree1,IMG.saree2], rating:4.2, review_count:12345, discount_percent:74 },
      { name:'Ishin Cotton Printed Saree', slug:'ishin-cotton-saree', description:'Pure Cotton, Daily wear, Printed, with blouse piece', price:599, mrp:1999, category_id:cWomen.id, subcategory_id:S['indian-fusion-wear'].id, sub_subcategory_id:SS['sarees'].id, brand_id:B['Ishin'].id, brand:'Ishin', color:'Yellow', images:[IMG.saree2,IMG.saree1], rating:3.9, review_count:34567, discount_percent:70 },
      { name:'BIBA Women Embroidered Anarkali Kurta', slug:'biba-anarkali-kurta', description:'Cotton blend, Anarkali, Full sleeves, Round neck', price:1449, mrp:2999, category_id:cWomen.id, subcategory_id:S['indian-fusion-wear'].id, sub_subcategory_id:SS['kurtas'].id, brand_id:B['BIBA'].id, brand:'BIBA', color:'Green', images:[IMG.kurta1,IMG.lehenga], rating:4.2, review_count:8765, discount_percent:52 },
      { name:'Aurelia Women Palazzo Set', slug:'aurelia-palazzo-set', description:'Rayon, Regular fit, Straight kurta with palazzo', price:1099, mrp:2499, category_id:cWomen.id, subcategory_id:S['indian-fusion-wear'].id, sub_subcategory_id:SS['kurtas'].id, brand_id:B['Aurelia'].id, brand:'Aurelia', color:'Pink', images:[IMG.kurta2,IMG.kurta1], rating:4.1, review_count:6543, discount_percent:56 },
      { name:'Designer Bridal Lehenga Choli Set', slug:'designer-bridal-lehenga', description:'Net/Silk, Semi-stitched, with dupatta, embroidered', price:2999, mrp:8999, category_id:cWomen.id, subcategory_id:S['indian-fusion-wear'].id, sub_subcategory_id:SS['lehenga-choli'].id, brand:'Ethnic', color:'Red', images:[IMG.lehenga,IMG.saree1], rating:4.0, review_count:5432, discount_percent:67 },
      { name:'Anubhutee Floral Print Straight Kurta', slug:'anubhutee-straight-kurta', description:'Pure Cotton, Regular fit, 3/4 sleeve, V-neck', price:699, mrp:1799, category_id:cWomen.id, subcategory_id:S['indian-fusion-wear'].id, sub_subcategory_id:SS['kurtas'].id, brand_id:B['Anubhutee'].id, brand:'Anubhutee', color:'White', images:[IMG.kurta1,IMG.kurta2], rating:4.0, review_count:15678, discount_percent:61 },

      // ──────── WOMEN > WESTERN WEAR (6) ────────
      { name:'H&M Women Floral Midi Dress', slug:'hm-floral-midi-dress', description:'Viscose, A-line, V-neck, Puff sleeves', price:1499, mrp:2499, category_id:cWomen.id, subcategory_id:S['western-wear'].id, sub_subcategory_id:SS['dresses'].id, brand_id:B['H&M'].id, brand:'H&M', color:'Pink', images:[IMG.dress1,IMG.dress2], rating:4.2, review_count:6543, discount_percent:40 },
      { name:'BIBA Women A-Line Dress', slug:'biba-aline-dress', description:'Cotton, Regular fit, Round neck, Short sleeves, Printed', price:1199, mrp:2499, category_id:cWomen.id, subcategory_id:S['western-wear'].id, sub_subcategory_id:SS['dresses'].id, brand_id:B['BIBA'].id, brand:'BIBA', color:'Blue', images:[IMG.dress2,IMG.dress1], rating:4.1, review_count:8765, discount_percent:52 },
      { name:'Only Women Casual Crop Top', slug:'only-casual-crop-top', description:'Cotton blend, Regular fit, Round neck, Solid', price:599, mrp:1299, category_id:cWomen.id, subcategory_id:S['western-wear'].id, sub_subcategory_id:SS['tops'].id, brand:'Only', color:'White', images:[IMG.top1,IMG.top2], rating:4.0, review_count:12345, discount_percent:54 },
      { name:'Vero Moda Women Striped Top', slug:'vero-moda-striped-top', description:'Polyester, Boxy fit, Round neck, Short sleeves', price:799, mrp:1699, category_id:cWomen.id, subcategory_id:S['western-wear'].id, sub_subcategory_id:SS['tops'].id, brand:'Vero Moda', color:'Blue', images:[IMG.top2,IMG.top1], rating:4.1, review_count:5678, discount_percent:53 },
      { name:"Levi's Women Skinny Fit Jeans", slug:'levis-women-skinny-jeans', description:'Stretchable, High rise, Skinny fit, 5-pocket', price:2299, mrp:3999, category_id:cWomen.id, subcategory_id:S['western-wear'].id, sub_subcategory_id:SS['womens-jeans'].id, brand_id:B["Levi's"].id, brand:"Levi's", color:'Blue', images:[IMG.jeans1,IMG.jeans2], rating:4.3, review_count:9876, discount_percent:43 },
      { name:'H&M Women High Waist Jeggings', slug:'hm-high-waist-jeggings', description:'Cotton blend, Skinny fit, High waist, Ankle length', price:999, mrp:1799, category_id:cWomen.id, subcategory_id:S['western-wear'].id, sub_subcategory_id:SS['womens-jeans'].id, brand_id:B['H&M'].id, brand:'H&M', color:'Black', images:[IMG.jeans2,IMG.jeans1], rating:4.0, review_count:15678, discount_percent:44 },

      // ──────── WOMEN > ACCESSORIES (8) ────────
      { name:'Lavie Women Tote Bag', slug:'lavie-tote-bag', description:'PU leather, Zip closure, 3 compartments, adjustable strap', price:1599, mrp:3690, category_id:cWomen.id, subcategory_id:S['handbags-clutches'].id, brand_id:B['Lavie'].id, brand:'Lavie', color:'Black', images:[IMG.handbag1,IMG.handbag2], rating:4.2, review_count:12345, discount_percent:57 },
      { name:'Baggit Women Sling Bag', slug:'baggit-sling-bag', description:'Synthetic, Buckle closure, Textured, Adjustable strap', price:1299, mrp:2850, category_id:cWomen.id, subcategory_id:S['handbags-clutches'].id, brand_id:B['Baggit'].id, brand:'Baggit', color:'Brown', images:[IMG.handbag2,IMG.handbag1], rating:4.1, review_count:8765, discount_percent:54 },
      { name:'Maybelline Fit Me Foundation', slug:'maybelline-fit-me-foundation', description:'Matte + Poreless, SPF 22, Natural finish', price:399, mrp:550, category_id:cWomen.id, subcategory_id:S['beauty-personal-care'].id, sub_subcategory_id:SS['makeup'].id, brand_id:B['Maybelline'].id, brand:'Maybelline', color:'Brown', images:[IMG.beauty1,IMG.beauty2], rating:4.3, review_count:45678, discount_percent:27 },
      { name:'Lakme Absolute Matte Revolution Lip Color', slug:'lakme-matte-lip-color', description:'Matte finish, Moisturizing, Long lasting', price:699, mrp:895, category_id:cWomen.id, subcategory_id:S['beauty-personal-care'].id, sub_subcategory_id:SS['makeup'].id, brand_id:B['Lakme'].id, brand:'Lakme', color:'Red', images:[IMG.beauty2,IMG.beauty3], rating:4.2, review_count:23456, discount_percent:22 },
      { name:"L'Oreal Paris Revitalift Night Cream", slug:'loreal-revitalift-night', description:'Anti-wrinkle, Firming, Pro-Retinol A, 50ml', price:749, mrp:1050, category_id:cWomen.id, subcategory_id:S['beauty-personal-care'].id, sub_subcategory_id:SS['skincare'].id, brand_id:B["L'Oreal"].id, brand:"L'Oreal", color:'White', images:[IMG.skincare,IMG.beauty1], rating:4.4, review_count:12345, discount_percent:29 },
      { name:'Fogg Scent Xtremo Perfume for Men (100ml)', slug:'fogg-scent-xtremo', description:'Eau de Parfum, Long lasting, Premium fragrance', price:449, mrp:650, category_id:cWomen.id, subcategory_id:S['beauty-personal-care'].id, sub_subcategory_id:SS['perfumes'].id, brand:'Fogg', color:'Black', images:[IMG.perfume,IMG.beauty3], rating:4.1, review_count:34567, discount_percent:31 },
      { name:'Kundan Pearl Necklace Set with Earrings', slug:'kundan-pearl-necklace-set', description:'Gold plated, Kundan stones, Pearl drops, Traditional', price:599, mrp:1999, category_id:cWomen.id, subcategory_id:S['jewellery'].id, brand:'Traditional', color:'Gold', images:[IMG.jewellery1], rating:4.0, review_count:8765, discount_percent:70 },
      { name:'Caprese Women Wallet', slug:'caprese-women-wallet', description:'PU leather, Zip around, Multi-card slots', price:799, mrp:1990, category_id:cWomen.id, subcategory_id:S['handbags-clutches'].id, brand_id:B['Caprese'].id, brand:'Caprese', color:'Pink', images:[IMG.handbag1], rating:4.1, review_count:5678, discount_percent:60 },

      // ──────── BABY & KIDS (8) ────────
      { name:'LEGO Classic Creative Bricks (484 Pieces)', slug:'lego-classic-484', description:'484 pieces, Multiple colors, Ages 4+, Creative building', price:2399, mrp:3499, category_id:cKids.id, subcategory_id:S['toys'].id, sub_subcategory_id:SS['building-sets'].id, brand_id:B['LEGO'].id, brand:'LEGO', color:'Yellow', images:[IMG.lego,IMG.toy1], rating:4.6, review_count:3456, discount_percent:31, is_featured:true },
      { name:'Hot Wheels 20 Car Pack', slug:'hot-wheels-20-car', description:'20 die-cast vehicles, 1:64 scale, Ages 3+', price:1599, mrp:2499, category_id:cKids.id, subcategory_id:S['toys'].id, sub_subcategory_id:SS['action-figures'].id, brand_id:B['Hot Wheels'].id, brand:'Hot Wheels', color:'Red', images:[IMG.toy1,IMG.toy2], rating:4.4, review_count:12345, discount_percent:36 },
      { name:'Funskool Monopoly Board Game', slug:'funskool-monopoly', description:'Classic property trading game, 2-8 players, Ages 8+', price:499, mrp:1099, category_id:cKids.id, subcategory_id:S['toys'].id, sub_subcategory_id:SS['board-games'].id, brand_id:B['Funskool'].id, brand:'Funskool', color:'White', images:[IMG.toy2,IMG.toy1], rating:4.3, review_count:8765, discount_percent:55 },
      { name:'Barbie Dreamhouse Playset', slug:'barbie-dreamhouse', description:'3 floors, 8 rooms, 70+ accessories, Lights & sounds', price:8999, mrp:13999, category_id:cKids.id, subcategory_id:S['toys'].id, sub_subcategory_id:SS['action-figures'].id, brand_id:B['Barbie'].id, brand:'Barbie', color:'Pink', images:[IMG.doll,IMG.toy1], rating:4.5, review_count:3456, discount_percent:36 },
      { name:'Nerf Elite 2.0 Eaglepoint RD-8 Blaster', slug:'nerf-elite-eaglepoint', description:'8-dart drum, Detachable scope, Tactical rail', price:1999, mrp:3499, category_id:cKids.id, subcategory_id:S['toys'].id, sub_subcategory_id:SS['action-figures'].id, brand_id:B['Nerf'].id, brand:'Nerf', color:'Blue', images:[IMG.toy1,IMG.toy2], rating:4.3, review_count:5678, discount_percent:43 },
      { name:'Fisher-Price Laugh & Learn Smart Phone', slug:'fisher-price-smart-phone', description:'Songs, phrases, numbers, Lights, Ages 6-36 months', price:799, mrp:1299, category_id:cKids.id, subcategory_id:S['baby-care'].id, brand_id:B['Fisher-Price'].id, brand:'Fisher-Price', color:'White', images:[IMG.babycare,IMG.toy1], rating:4.2, review_count:12345, discount_percent:38 },
      { name:'Pampers All-Round Protection Pants (L, 64)', slug:'pampers-pants-l-64', description:'12hr dryness, Aloe vera lotion, Anti-rash, Magic Gel', price:999, mrp:1499, category_id:cKids.id, subcategory_id:S['baby-care'].id, brand:'Pampers', color:'Green', images:[IMG.babycare], rating:4.4, review_count:56789, discount_percent:33 },
      { name:'Kids Cotton Printed T-Shirt & Shorts Set', slug:'kids-cotton-tshirt-set', description:'100% Cotton, Printed, Comfortable fit, Ages 2-8', price:399, mrp:999, category_id:cKids.id, subcategory_id:S['kids-clothing'].id, brand:'Generic', color:'Blue', images:[IMG.kidclothes], rating:4.0, review_count:23456, discount_percent:60 },

      // ──────── HOME & FURNITURE (8) ────────
      { name:'Wakefit Orthopedic Memory Foam Mattress (Queen)', slug:'wakefit-memory-foam-queen', description:'8" thick, Medium Firm, CertiPUR-US certified', price:9999, mrp:18999, category_id:cHome.id, subcategory_id:S['bedding'].id, brand_id:B['Wakefit'].id, brand:'Wakefit', color:'White', images:[IMG.bed,IMG.pillow], rating:4.3, review_count:23456, discount_percent:47 },
      { name:'Solimo 3-Seater Sofa (Engineered Wood)', slug:'solimo-3-seater-sofa', description:'Fabric upholstery, Solid wood frame, 3-seater', price:15999, mrp:29999, category_id:cHome.id, subcategory_id:S['furniture'].id, brand_id:B['Solimo'].id, brand:'Solimo', color:'Grey', images:[IMG.sofa,IMG.table], rating:4.1, review_count:5678, discount_percent:47 },
      { name:'IKEA KALLAX Shelf Unit (White)', slug:'ikea-kallax-shelf', description:'4x4 cube unit, Modular, Engineered wood', price:6999, mrp:9990, category_id:cHome.id, subcategory_id:S['furniture'].id, brand_id:B['IKEA'].id, brand:'IKEA', color:'White', images:[IMG.table,IMG.decor], rating:4.4, review_count:3456, discount_percent:30 },
      { name:'Bombay Dyeing Cotton Double Bedsheet Set', slug:'bombay-dyeing-bedsheet', description:'100% Cotton, 144 TC, with 2 pillow covers, Printed', price:599, mrp:1499, category_id:cHome.id, subcategory_id:S['bedding'].id, brand_id:B['Bombay Dyeing'].id, brand:'Bombay Dyeing', color:'Blue', images:[IMG.pillow,IMG.bed], rating:4.2, review_count:34567, discount_percent:60 },
      { name:'Solimo Blackout Curtains (Pack of 2)', slug:'solimo-blackout-curtains', description:'Polyester, 7ft, Grommets, Room darkening', price:699, mrp:1499, category_id:cHome.id, subcategory_id:S['decor'].id, brand_id:B['Solimo'].id, brand:'Solimo', color:'Grey', images:[IMG.curtain,IMG.decor], rating:4.0, review_count:15678, discount_percent:53 },
      { name:'Ceramic Decorative Vase Set (Pack of 3)', slug:'ceramic-vase-set', description:'Modern design, 3 sizes, Matte finish, Home accent', price:899, mrp:2199, category_id:cHome.id, subcategory_id:S['decor'].id, brand:'Home Craft', color:'White', images:[IMG.decor,IMG.lamp], rating:4.1, review_count:6543, discount_percent:59 },
      { name:'Bedside Table Lamp with Fabric Shade', slug:'bedside-table-lamp', description:'E27 bulb, Touch dimmer, Linen shade, Iron base', price:1299, mrp:2499, category_id:cHome.id, subcategory_id:S['decor'].id, brand:'Home Craft', color:'Brown', images:[IMG.lamp,IMG.decor], rating:4.2, review_count:8765, discount_percent:48 },
      { name:'Prestige Svachh Pressure Cooker 5L', slug:'prestige-svachh-5l', description:'Aluminium, 5 Litre, Spillage control, Gas & induction', price:2199, mrp:3195, category_id:cHome.id, subcategory_id:S['kitchen-dining'].id, brand_id:B['Prestige'].id, brand:'Prestige', color:'Silver', images:[IMG.cookware], rating:4.4, review_count:23456, discount_percent:31 },

      // ──────── SPORTS, BOOKS & MORE (10) ────────
      { name:'SG RSD Xtreme Cricket Kit Bag', slug:'sg-rsd-cricket-kit', description:'Full kit: bat, pads, gloves, helmet, bag', price:5999, mrp:8999, category_id:cSports.id, subcategory_id:S['sports-equipment'].id, sub_subcategory_id:SS['cricket'].id, brand_id:B['SG'].id, brand:'SG', color:'Blue', images:[IMG.cricket], rating:4.3, review_count:3456, discount_percent:33 },
      { name:'Yonex Nanoray 7000I Badminton Racquet', slug:'yonex-nanoray-7000i', description:'Isometric frame, Nanoscience, G4 grip, with cover', price:1190, mrp:1790, category_id:cSports.id, subcategory_id:S['sports-equipment'].id, sub_subcategory_id:SS['badminton'].id, brand_id:B['Yonex'].id, brand:'Yonex', color:'Red', images:[IMG.badminton], rating:4.4, review_count:12345, discount_percent:34 },
      { name:'Nivia Storm Football (Size 5)', slug:'nivia-storm-football', description:'Rubberized moulded, Size 5, Match ball', price:599, mrp:999, category_id:cSports.id, subcategory_id:S['sports-equipment'].id, sub_subcategory_id:SS['football'].id, brand_id:B['Nivia'].id, brand:'Nivia', color:'White', images:[IMG.football], rating:4.2, review_count:8765, discount_percent:40 },
      { name:'Nike Revolution 6 Running Shoes', slug:'nike-revolution-6', description:'Foam midsole, Breathable mesh, Rubber outsole', price:2997, mrp:3995, category_id:cSports.id, subcategory_id:S['fitness'].id, brand_id:B['Nike'].id, brand:'Nike', color:'Black', images:[IMG.shoes_sport,IMG.sneaker1], rating:4.3, review_count:15678, discount_percent:25 },
      { name:'Boldfit Yoga Mat 6mm with Carrying Strap', slug:'boldfit-yoga-mat-6mm', description:'NBR foam, Anti-slip, 6mm thick, 183x61cm', price:499, mrp:1299, category_id:cSports.id, subcategory_id:S['fitness'].id, brand:'Boldfit', color:'Purple', images:[IMG.yoga], rating:4.1, review_count:34567, discount_percent:62 },
      { name:'Kore PVC 20kg Dumbbell Set', slug:'kore-dumbell-set-20kg', description:'PVC coated, 20kg total, with rods and clamps', price:999, mrp:2599, category_id:cSports.id, subcategory_id:S['fitness'].id, brand:'Kore', color:'Black', images:[IMG.gym], rating:4.0, review_count:23456, discount_percent:62 },
      { name:'Atomic Habits by James Clear', slug:'atomic-habits', description:'Proven framework for building good habits, Paperback', price:399, mrp:699, category_id:cSports.id, subcategory_id:S['books'].id, sub_subcategory_id:SS['self-help'].id, brand:'Penguin', color:'White', images:[IMG.book1,IMG.book2], rating:4.7, review_count:89012, discount_percent:43 },
      { name:'Rich Dad Poor Dad by Robert Kiyosaki', slug:'rich-dad-poor-dad', description:'Personal finance classic, Paperback edition', price:299, mrp:499, category_id:cSports.id, subcategory_id:S['books'].id, sub_subcategory_id:SS['self-help'].id, brand:'Plata', color:'Purple', images:[IMG.book2,IMG.book3], rating:4.6, review_count:67890, discount_percent:40 },
      { name:'The Psychology of Money by Morgan Housel', slug:'psychology-of-money', description:'Timeless lessons on wealth, greed, and happiness', price:349, mrp:599, category_id:cSports.id, subcategory_id:S['books'].id, sub_subcategory_id:SS['self-help'].id, brand:'Jaico', color:'White', images:[IMG.book3,IMG.book1], rating:4.6, review_count:45678, discount_percent:42 },
      { name:'NCERT Mathematics Class 12 (Part I & II)', slug:'ncert-maths-class-12', description:'CBSE syllabus, Latest edition, Set of 2 books', price:450, mrp:550, category_id:cSports.id, subcategory_id:S['books'].id, sub_subcategory_id:SS['academic'].id, brand:'NCERT', color:'White', images:[IMG.book1], rating:4.5, review_count:12345, discount_percent:18 },

      // ──────── GROCERY (5) ────────
      { name:'Tata Sampann Unpolished Toor Dal (1kg)', slug:'tata-sampann-toor-dal', description:'Unpolished, Source of protein, No preservatives', price:165, mrp:195, category_id:cGrocery.id, subcategory_id:S['staples'].id, brand_id:B['Tata'].id, brand:'Tata', color:'Yellow', images:[IMG.grocery1], rating:4.3, review_count:23456, discount_percent:15 },
      { name:'Fortune Sunlite Refined Sunflower Oil (5L)', slug:'fortune-sunflite-5l', description:'Light & healthy, Rich in Vitamin E, FSSAI approved', price:699, mrp:905, category_id:cGrocery.id, subcategory_id:S['staples'].id, brand_id:B['Fortune'].id, brand:'Fortune', color:'Yellow', images:[IMG.grocery2], rating:4.2, review_count:34567, discount_percent:23 },
      { name:'Nescafe Classic Instant Coffee (200g)', slug:'nescafe-classic-200g', description:'100% pure coffee, Rich aroma, Smooth taste', price:449, mrp:560, category_id:cGrocery.id, subcategory_id:S['beverages'].id, brand_id:B['Nescafe'].id, brand:'Nescafe', color:'Brown', images:[IMG.coffee], rating:4.4, review_count:56789, discount_percent:20 },
      { name:'Parle-G Gold Biscuits (Pack of 16)', slug:'parle-g-gold-16', description:'Crunchy, glucose biscuits, 16 packs', price:190, mrp:240, category_id:cGrocery.id, subcategory_id:S['snacks'].id, brand_id:B['Parle'].id, brand:'Parle', color:'Yellow', images:[IMG.grocery1], rating:4.5, review_count:78901, discount_percent:21 },
      { name:'Tata Tea Gold (1kg)', slug:'tata-tea-gold-1kg', description:'15% long leaves, Rich & aromatic, Premium blend', price:499, mrp:590, category_id:cGrocery.id, subcategory_id:S['beverages'].id, brand_id:B['Tata'].id, brand:'Tata', color:'Gold', images:[IMG.grocery2,IMG.coffee], rating:4.3, review_count:45678, discount_percent:15 },

      // ──────── MEN > ACCESSORIES (4) ────────
      { name:'Ray-Ban Aviator Classic Sunglasses', slug:'rayban-aviator-classic', description:'Metal frame, Glass lens, UV400, 58mm', price:6490, mrp:8490, category_id:cMen.id, subcategory_id:S['men-accessories'].id, brand:'Ray-Ban', color:'Gold', images:[IMG.sunglasses], rating:4.5, review_count:12345, discount_percent:24 },
      { name:'Wildcraft 45L Rucksack Backpack', slug:'wildcraft-45l-rucksack', description:'45L capacity, Rain cover, Padded straps, Trekking', price:2499, mrp:4999, category_id:cMen.id, subcategory_id:S['men-accessories'].id, brand:'Wildcraft', color:'Black', images:[IMG.backpack], rating:4.3, review_count:8765, discount_percent:50 },
      { name:'Fastrack Analog Watch for Men', slug:'fastrack-analog-men', description:'Stainless steel, Leather strap, Water resistant', price:1495, mrp:2495, category_id:cMen.id, subcategory_id:S['men-watches'].id, brand_id:B['Fastrack'].id, brand:'Fastrack', color:'Brown', images:[IMG.watch2,IMG.watch3], rating:4.1, review_count:23456, discount_percent:40 },
      { name:'Casio G-Shock GA-2100 Watch', slug:'casio-gshock-ga2100', description:'Carbon Core Guard, 200m WR, World time, LED', price:8995, mrp:10995, category_id:cMen.id, subcategory_id:S['men-watches'].id, brand_id:B['Casio'].id, brand:'Casio', color:'Black', images:[IMG.watch3,IMG.watch1], rating:4.6, review_count:5678, discount_percent:18 },

      // ──────── ELECTRONICS > CAMERAS (2) ────────
      { name:'Canon EOS R50 Mirrorless Camera (Body Only)', slug:'canon-eos-r50-body', description:'24.2MP APS-C, 4K video, 15fps burst, Eye AF', price:59990, mrp:72995, category_id:cElec.id, subcategory_id:S['cameras'].id, brand:'Canon', color:'Black', images:[IMG.camera], rating:4.5, review_count:2345, discount_percent:18 },
      { name:'GoPro HERO12 Black Action Camera', slug:'gopro-hero12-black', description:'5.3K video, HyperSmooth 6.0, 1720mAh battery', price:39490, mrp:44990, category_id:cElec.id, subcategory_id:S['cameras'].id, brand:'GoPro', color:'Black', images:[IMG.camera], rating:4.4, review_count:4567, discount_percent:12 },

      // ──────── 30+ MORE PRODUCTS ────────

      // More TVs & Appliances
      { name:'Voltas 1.5 Ton 3 Star Split AC', slug:'voltas-1-5-ton-ac', description:'Multi-Stage Filtration, Turbo Cooling, Copper Coil', price:32990, mrp:47990, category_id:cTV.id, subcategory_id:S['air-conditioners'].id, brand_id:B['Voltas'].id, brand:'Voltas', color:'White', images:[IMG.ac], rating:4.2, review_count:12345, discount_percent:31 },
      { name:'Bajaj 2000W Room Heater', slug:'bajaj-2000w-heater', description:'2000W, PTF element, Adjustable thermostat', price:1899, mrp:2990, category_id:cTV.id, subcategory_id:S['kitchen-appliances'].id, brand_id:B['Bajaj'].id, brand:'Bajaj', color:'White', images:[IMG.microwave], rating:4.0, review_count:18765, discount_percent:36 },
      { name:'LG 260L Frost Free Double Door Fridge', slug:'lg-260l-fridge', description:'Smart Inverter Compressor, Multi Air Flow', price:24990, mrp:33990, category_id:cTV.id, subcategory_id:S['refrigerators'].id, brand_id:B['LG'].id, brand:'LG', color:'Silver', images:[IMG.fridge], rating:4.4, review_count:9876, discount_percent:26 },
      { name:'Butterfly Jet Elite Mixer Grinder 750W', slug:'butterfly-jet-elite', description:'750W, 3 jars, LED indicator, Overload protection', price:2499, mrp:4495, category_id:cTV.id, subcategory_id:S['kitchen-appliances'].id, brand_id:B['Butterfly'].id, brand:'Butterfly', color:'Grey', images:[IMG.mixer], rating:4.1, review_count:34567, discount_percent:44 },

      // More Women's Fashion
      { name:'Bata Women Heeled Sandals', slug:'bata-women-heels', description:'Synthetic upper, Block heel, Buckle closure', price:1299, mrp:2499, category_id:cWomen.id, subcategory_id:S['women-footwear'].id, brand_id:B['Bata'].id, brand:'Bata', color:'Black', images:[IMG.heels], rating:4.0, review_count:15678, discount_percent:48 },
      { name:'Hidesign Women Leather Tote Bag', slug:'hidesign-leather-tote', description:'Genuine leather, Zip closure, Multiple compartments', price:3999, mrp:7495, category_id:cWomen.id, subcategory_id:S['handbags-clutches'].id, brand_id:B['Hidesign'].id, brand:'Hidesign', color:'Brown', images:[IMG.handbag2,IMG.handbag1], rating:4.4, review_count:3456, discount_percent:47 },
      { name:'Nivea Soft Moisturizing Cream 200ml', slug:'nivea-soft-cream-200', description:'Vitamin E, Jojoba oil, Quick absorbing, All skin types', price:249, mrp:350, category_id:cWomen.id, subcategory_id:S['beauty-personal-care'].id, brand_id:B['Nivea'].id, brand:'Nivea', color:'Blue', images:[IMG.skincare,IMG.beauty1], rating:4.3, review_count:67890, discount_percent:29 },
      { name:'Kalini Art Silk Embroidered Kurta', slug:'kalini-art-silk-kurta', description:'Art Silk, Straight fit, Embroidered, Party wear', price:899, mrp:2999, category_id:cWomen.id, subcategory_id:S['indian-fusion-wear'].id, brand_id:B['Kalini'].id, brand:'Kalini', color:'Pink', images:[IMG.kurta1,IMG.kurta2], rating:4.1, review_count:8765, discount_percent:70 },
      { name:'Ishin Women Printed Palazzo Set', slug:'ishin-printed-palazzo', description:'Rayon, A-line kurta with palazzo, Printed', price:749, mrp:2499, category_id:cWomen.id, subcategory_id:S['indian-fusion-wear'].id, brand_id:B['Ishin'].id, brand:'Ishin', color:'Green', images:[IMG.kurta2,IMG.kurta1], rating:4.0, review_count:23456, discount_percent:70 },

      // More Men's Fashion
      { name:'UCB Men Slim Fit Chinos', slug:'ucb-slim-chinos', description:'98% Cotton, Slim fit, Mid rise, 4 pocket', price:1499, mrp:2999, category_id:cMen.id, subcategory_id:S['men-bottom-wear'].id, brand:'UCB', color:'Brown', images:[IMG.jeans1,IMG.jeans2], rating:4.2, review_count:6543, discount_percent:50 },
      { name:'Titan Raga Women Watch', slug:'titan-raga-women', description:'Gold tone, Bracelet strap, Analog, Water resistant', price:4995, mrp:6995, category_id:cMen.id, subcategory_id:S['men-watches'].id, brand_id:B['Titan'].id, brand:'Titan', color:'Gold', images:[IMG.watch1,IMG.watch2], rating:4.5, review_count:8765, discount_percent:29 },
      { name:'Peter England Men Polo T-Shirt', slug:'peter-england-polo', description:'Cotton blend, Regular fit, Polo collar, Short sleeve', price:599, mrp:1299, category_id:cMen.id, subcategory_id:S['men-top-wear'].id, brand_id:B['Peter England'].id, brand:'Peter England', color:'Green', images:[IMG.polo,IMG.tshirt1], rating:4.0, review_count:19876, discount_percent:54 },
      { name:'Nike Sportswear Club Joggers', slug:'nike-club-joggers', description:'Brushed-back fleece, Standard fit, Elastic cuffs', price:2295, mrp:3495, category_id:cMen.id, subcategory_id:S['men-bottom-wear'].id, brand_id:B['Nike'].id, brand:'Nike', color:'Grey', images:[IMG.jeans2], rating:4.3, review_count:4567, discount_percent:34 },

      // More Home & Furniture
      { name:'Wakefit Sheesham Wood Coffee Table', slug:'wakefit-coffee-table', description:'Sheesham wood, Walnut finish, 4 seater', price:5999, mrp:11999, category_id:cHome.id, subcategory_id:S['furniture'].id, brand_id:B['Wakefit'].id, brand:'Wakefit', color:'Brown', images:[IMG.table,IMG.sofa], rating:4.2, review_count:3456, discount_percent:50 },
      { name:'IKEA MALM Bed Frame (Queen)', slug:'ikea-malm-bed', description:'Engineered wood, White finish, Under-bed storage', price:14999, mrp:22990, category_id:cHome.id, subcategory_id:S['furniture'].id, brand_id:B['IKEA'].id, brand:'IKEA', color:'White', images:[IMG.bed,IMG.pillow], rating:4.3, review_count:2345, discount_percent:35 },
      { name:'Solimo Microfibre Pillow (Set of 2)', slug:'solimo-microfibre-pillow', description:'Microfibre fill, 17x27 inch, Soft, Hypoallergenic', price:499, mrp:999, category_id:cHome.id, subcategory_id:S['bedding'].id, brand_id:B['Solimo'].id, brand:'Solimo', color:'White', images:[IMG.pillow,IMG.bed], rating:4.1, review_count:45678, discount_percent:50 },
      { name:'Prestige Omega Deluxe Fry Pan 250mm', slug:'prestige-omega-frypan', description:'Non-stick, Hard anodised, Gas and induction', price:849, mrp:1495, category_id:cHome.id, subcategory_id:S['kitchen-dining'].id, brand_id:B['Prestige'].id, brand:'Prestige', color:'Black', images:[IMG.cookware], rating:4.3, review_count:12345, discount_percent:43 },

      // More Baby & Kids
      { name:'LEGO City Fire Station 60320', slug:'lego-city-fire-station', description:'540 pieces, 5 minifigures, Ages 6+', price:3999, mrp:5999, category_id:cKids.id, subcategory_id:S['toys'].id, brand_id:B['LEGO'].id, brand:'LEGO', color:'Red', images:[IMG.lego,IMG.toy2], rating:4.5, review_count:2345, discount_percent:33 },
      { name:'Fisher-Price Laugh & Learn Activity Table', slug:'fisher-price-activity', description:'Interactive table, Songs, lights, 6-36 months', price:2999, mrp:4999, category_id:cKids.id, subcategory_id:S['baby-care'].id, brand_id:B['Fisher-Price'].id, brand:'Fisher-Price', color:'Yellow', images:[IMG.babycare,IMG.toy1], rating:4.3, review_count:6789, discount_percent:40 },
      { name:'Kids Disney Frozen T-Shirt & Skirt Set', slug:'disney-frozen-set', description:'Cotton, Printed, Elsa design, Ages 3-8', price:499, mrp:1299, category_id:cKids.id, subcategory_id:S['kids-clothing'].id, brand:'Disney', color:'Blue', images:[IMG.kidclothes], rating:4.1, review_count:12345, discount_percent:62 },

      // More Grocery
      { name:'India Gate Basmati Rice Super (5kg)', slug:'india-gate-basmati-5kg', description:'Aged rice, Extra long grain, Natural aroma', price:549, mrp:740, category_id:cGrocery.id, subcategory_id:S['staples'].id, brand:'India Gate', color:'White', images:[IMG.grocery1,IMG.grocery2], rating:4.4, review_count:34567, discount_percent:26 },
      { name:'Amul Pure Ghee (1L)', slug:'amul-pure-ghee-1l', description:'Made from fresh cream, Rich aroma, Cooking grade', price:569, mrp:620, category_id:cGrocery.id, subcategory_id:S['staples'].id, brand:'Amul', color:'Yellow', images:[IMG.grocery2], rating:4.5, review_count:56789, discount_percent:8 },
      { name:'Cadbury Dairy Milk Silk (Pack of 10)', slug:'cadbury-silk-10pack', description:'Smooth chocolate, 60g each, Gift pack', price:599, mrp:800, category_id:cGrocery.id, subcategory_id:S['snacks'].id, brand:'Cadbury', color:'Purple', images:[IMG.grocery1], rating:4.6, review_count:23456, discount_percent:25 },
      { name:'Red Label Natural Care Tea (1kg)', slug:'red-label-tea-1kg', description:'5 Ayurvedic herbs, Immunity boost, Kadak taste', price:449, mrp:535, category_id:cGrocery.id, subcategory_id:S['beverages'].id, brand:'Red Label', color:'Red', images:[IMG.coffee,IMG.grocery2], rating:4.3, review_count:45678, discount_percent:16 },

      // More Electronics
      { name:'Bose QuietComfort Ultra Earbuds', slug:'bose-qc-ultra-earbuds', description:'Immersive audio, CustomTune, 6hr battery', price:24990, mrp:32900, category_id:cElec.id, subcategory_id:S['audio'].id, brand_id:B['Bose'].id, brand:'Bose', color:'Black', images:[IMG.earbuds1,IMG.earbuds2], rating:4.6, review_count:3456, discount_percent:24 },
      { name:'Sennheiser HD 450BT Wireless Headphone', slug:'sennheiser-hd-450bt', description:'Active ANC, 30hr battery, Virtual assistant', price:9990, mrp:14990, category_id:cElec.id, subcategory_id:S['audio'].id, brand_id:B['Sennheiser'].id, brand:'Sennheiser', color:'Black', images:[IMG.headphone1,IMG.headphone3], rating:4.4, review_count:5678, discount_percent:33 },
      { name:'Lenovo Tab M10 FHD Plus (3rd Gen)', slug:'lenovo-tab-m10-3rd', description:'10.61" 2K, Snapdragon 680, Quad speakers', price:14999, mrp:21999, category_id:cElec.id, subcategory_id:S['tablets'].id, brand_id:B['Lenovo'].id, brand:'Lenovo', color:'Grey', images:[IMG.tablet,IMG.ipad], rating:4.2, review_count:8765, discount_percent:32 },
      { name:'Apple Watch SE (2nd Gen, 44mm)', slug:'apple-watch-se-2nd', description:'S8 SiP, Crash Detection, Water resistant 50m', price:29900, mrp:32900, category_id:cElec.id, subcategory_id:S['smart-wearables'].id, brand_id:B['Apple'].id, brand:'Apple', color:'Black', images:[IMG.smartwatch,IMG.watch1], rating:4.5, review_count:6789, discount_percent:9, is_featured:true },

      // More Sports
      { name:'Cosco All Court Tennis Ball (Pack of 6)', slug:'cosco-tennis-balls', description:'ITF approved, All court, Yellow, Pack of 6', price:499, mrp:799, category_id:cSports.id, subcategory_id:S['sports-equipment'].id, brand_id:B['Cosco'].id, brand:'Cosco', color:'Yellow', images:[IMG.football], rating:4.2, review_count:8765, discount_percent:38 },
      { name:'Adidas Predator Club Football Boots', slug:'adidas-predator-boots', description:'Synthetic upper, Rubber outsole, Firm ground', price:3999, mrp:5999, category_id:cSports.id, subcategory_id:S['fitness'].id, brand_id:B['Adidas'].id, brand:'Adidas', color:'Black', images:[IMG.shoes_sport,IMG.sneaker2], rating:4.3, review_count:4567, discount_percent:33 },
    ];

    await Product.bulkCreate(products.map(p => ({
      ...p,
      stock: Math.floor(Math.random() * 450) + 50, // 50-500
    })));

    console.log(`✅ ${products.length} Products with real images`);
    console.log('\n🎉 Seed complete!');
    console.log(`   📦 ${products.length} products across 8 categories`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
