const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');

const users = [
  {
    name: 'Admin User',
    email: 'admin@store.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Abebe Kebede',
    email: 'abebe@example.com',
    password: 'customer123',
    role: 'customer',
    addresses: [{
      fullName: 'Abebe Kebede',
      phone: '+251911234567',
      street: 'Bole Road, near Edna Mall',
      city: 'Addis Ababa',
      state: 'Addis Ababa',
      country: 'Ethiopia',
      isDefault: true
    }]
  },
  {
    name: 'Sara Tesfaye',
    email: 'sara@example.com',
    password: 'customer123',
    role: 'customer'
  }
];

const products = [
  // Electronics
  {
    name: 'Samsung Galaxy S24 Ultra',
    price: 62999,
    compareAtPrice: 69999,
    description: 'Experience the pinnacle of mobile innovation with the Samsung Galaxy S24 Ultra. Featuring a stunning 6.8" Dynamic AMOLED display, powerful Snapdragon 8 Gen 3 processor, 200MP camera system, and built-in S Pen for ultimate productivity.',
    category: 'Electronics',
    subcategory: 'Phones',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600'],
    stock: 25,
    rating: 4.8,
    numReviews: 124,
    featured: true,
    brand: 'Samsung',
    tags: ['smartphone', '5G', 'flagship']
  },
  {
    name: 'MacBook Pro 16" M3 Max',
    price: 189999,
    compareAtPrice: 199999,
    description: 'The most powerful MacBook Pro ever. With the M3 Max chip, up to 128GB unified memory, stunning Liquid Retina XDR display, and all-day battery life. Perfect for developers, designers, and creators.',
    category: 'Electronics',
    subcategory: 'Laptops',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
    stock: 10,
    rating: 4.9,
    numReviews: 89,
    featured: true,
    brand: 'Apple',
    tags: ['laptop', 'professional', 'M3']
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    price: 14999,
    compareAtPrice: 18999,
    description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones. Up to 30 hours of battery life.',
    category: 'Electronics',
    subcategory: 'Audio',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
    stock: 50,
    rating: 4.7,
    numReviews: 256,
    featured: true,
    brand: 'Sony',
    tags: ['headphones', 'wireless', 'noise-cancelling']
  },
  {
    name: 'iPad Air M2',
    price: 45999,
    compareAtPrice: 0,
    description: 'Supercharged by M2. 11-inch Liquid Retina display with P3 wide color. 12MP front and back cameras. Works with Apple Pencil and Magic Keyboard.',
    category: 'Electronics',
    subcategory: 'Tablets',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'],
    stock: 30,
    rating: 4.6,
    numReviews: 67,
    featured: false,
    brand: 'Apple',
    tags: ['tablet', 'M2', 'creative']
  },
  // Clothing
  {
    name: 'Ethiopian Traditional Habesha Kemis',
    price: 4500,
    compareAtPrice: 5500,
    description: 'Beautiful handmade Ethiopian traditional dress (Habesha Kemis) with intricate tilf (embroidery) patterns. Made from high-quality cotton fabric. Perfect for holidays and cultural celebrations.',
    category: 'Clothing',
    subcategory: 'Traditional',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'],
    stock: 20,
    rating: 4.9,
    numReviews: 45,
    featured: true,
    brand: 'Habesha Designs',
    tags: ['traditional', 'handmade', 'cultural']
  },
  {
    name: 'Premium Leather Jacket',
    price: 8999,
    compareAtPrice: 12999,
    description: 'Genuine leather jacket with a modern slim fit. Features multiple pockets, YKK zippers, and soft quilted lining. Available in black and brown.',
    category: 'Clothing',
    subcategory: 'Outerwear',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'],
    stock: 15,
    rating: 4.5,
    numReviews: 34,
    featured: false,
    brand: 'Urban Style',
    tags: ['leather', 'jacket', 'premium']
  },
  {
    name: 'Nike Air Max 270',
    price: 7999,
    compareAtPrice: 9499,
    description: 'The Nike Air Max 270 delivers visible cushioning under every step. Updated for modern comfort, it nods to the original 1991 Air Max 180 with its exaggerated tongue top and heritage tongue logo.',
    category: 'Clothing',
    subcategory: 'Shoes',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
    stock: 40,
    rating: 4.6,
    numReviews: 198,
    featured: true,
    brand: 'Nike',
    tags: ['sneakers', 'running', 'casual']
  },
  {
    name: 'Classic Denim Jeans',
    price: 3499,
    compareAtPrice: 0,
    description: 'Premium stretch denim jeans with a classic straight fit. Comfortable all-day wear with reinforced stitching. Available in dark wash, medium wash, and light wash.',
    category: 'Clothing',
    subcategory: 'Pants',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'],
    stock: 60,
    rating: 4.3,
    numReviews: 87,
    featured: false,
    brand: 'Denim Co',
    tags: ['denim', 'casual', 'classic']
  },
  // Home & Kitchen
  {
    name: 'Ethiopian Jebena Coffee Set',
    price: 2999,
    compareAtPrice: 3999,
    description: 'Traditional Ethiopian clay Jebena (coffee pot) set with 6 sini (cups) and rekebot (stand). Handcrafted by skilled artisans. Perfect for authentic Ethiopian coffee ceremony.',
    category: 'Home & Kitchen',
    subcategory: 'Coffee',
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'],
    stock: 35,
    rating: 4.8,
    numReviews: 76,
    featured: true,
    brand: 'Artisan Ethiopia',
    tags: ['coffee', 'traditional', 'handmade']
  },
  {
    name: 'Smart Air Fryer 5.5L',
    price: 5999,
    compareAtPrice: 7499,
    description: 'Digital air fryer with 8 preset cooking programs. Cook healthier meals with up to 85% less fat. Large 5.5L capacity perfect for families. Dishwasher-safe basket.',
    category: 'Home & Kitchen',
    subcategory: 'Appliances',
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=600'],
    stock: 25,
    rating: 4.4,
    numReviews: 112,
    featured: false,
    brand: 'HomeTech',
    tags: ['cooking', 'healthy', 'smart']
  },
  {
    name: 'Luxury Bedding Set - King',
    price: 6999,
    compareAtPrice: 9999,
    description: '1000 thread count Egyptian cotton bedding set. Includes duvet cover, fitted sheet, flat sheet, and 4 pillowcases. Silky smooth finish. Available in white, grey, and navy.',
    category: 'Home & Kitchen',
    subcategory: 'Bedroom',
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'],
    stock: 18,
    rating: 4.7,
    numReviews: 43,
    featured: false,
    brand: 'Sleep Luxury',
    tags: ['bedding', 'cotton', 'luxury']
  },
  // Sports
  {
    name: 'Professional Running Shoes',
    price: 6499,
    compareAtPrice: 8999,
    description: 'Lightweight marathon running shoes with carbon fiber plate. Responsive ZoomX foam provides incredible energy return. Worn by Ethiopian Olympic champions.',
    category: 'Sports',
    subcategory: 'Running',
    images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600'],
    stock: 30,
    rating: 4.8,
    numReviews: 156,
    featured: true,
    brand: 'RunPro',
    tags: ['running', 'marathon', 'lightweight']
  },
  {
    name: 'Yoga Mat Premium 6mm',
    price: 1999,
    compareAtPrice: 2499,
    description: 'Eco-friendly TPE yoga mat with alignment lines. Non-slip surface on both sides. 6mm thick for joint protection. Includes carrying strap.',
    category: 'Sports',
    subcategory: 'Yoga',
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'],
    stock: 45,
    rating: 4.5,
    numReviews: 89,
    featured: false,
    brand: 'ZenFit',
    tags: ['yoga', 'fitness', 'eco-friendly']
  },
  {
    name: 'Adjustable Dumbbell Set 24kg',
    price: 12999,
    compareAtPrice: 15999,
    description: 'Space-saving adjustable dumbbells from 2.5kg to 24kg. Quick-change weight system. Perfect for home gym. Includes storage tray.',
    category: 'Sports',
    subcategory: 'Gym',
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'],
    stock: 12,
    rating: 4.6,
    numReviews: 67,
    featured: false,
    brand: 'IronFlex',
    tags: ['gym', 'weights', 'home-gym']
  },
  // Books
  {
    name: 'The Athlete\'s Way - Training Guide',
    price: 899,
    compareAtPrice: 1299,
    description: 'Comprehensive training guide covering marathon preparation, nutrition, recovery, and mental toughness. Written by Ethiopian athletics coaches with insights from world champions.',
    category: 'Books',
    subcategory: 'Sports',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'],
    stock: 100,
    rating: 4.4,
    numReviews: 34,
    featured: false,
    brand: 'Publisher One',
    tags: ['sports', 'training', 'marathon']
  },
  {
    name: 'Modern Web Development 2026',
    price: 1499,
    compareAtPrice: 0,
    description: 'Master React, Node.js, and MongoDB with this comprehensive guide. Covers latest frameworks, best practices, and real-world project development. Includes online code samples.',
    category: 'Books',
    subcategory: 'Technology',
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600'],
    stock: 75,
    rating: 4.7,
    numReviews: 52,
    featured: false,
    brand: 'TechPress',
    tags: ['programming', 'web-dev', 'javascript']
  },
  // Beauty
  {
    name: 'Natural Shea Butter Collection',
    price: 1799,
    compareAtPrice: 2299,
    description: 'Pure unrefined shea butter skincare set from Ethiopian highlands. Includes body butter, lip balm, and hand cream. 100% organic and chemical-free.',
    category: 'Beauty',
    subcategory: 'Skincare',
    images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600'],
    stock: 40,
    rating: 4.6,
    numReviews: 89,
    featured: false,
    brand: 'Ethio Natural',
    tags: ['organic', 'skincare', 'natural']
  },
  {
    name: 'Professional Hair Care Bundle',
    price: 3499,
    compareAtPrice: 4999,
    description: 'Complete hair care system with sulfate-free shampoo, deep conditioner, leave-in treatment, and argan oil serum. Designed for all hair types.',
    category: 'Beauty',
    subcategory: 'Hair Care',
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600'],
    stock: 30,
    rating: 4.5,
    numReviews: 56,
    featured: false,
    brand: 'GlowPro',
    tags: ['hair', 'organic', 'professional']
  },
  {
    name: 'Smart Watch Pro X',
    price: 11999,
    compareAtPrice: 14999,
    description: 'Advanced fitness smartwatch with GPS, heart rate monitor, SpO2 sensor, sleep tracking, and 7-day battery life. Water resistant to 50m. Compatible with iOS and Android.',
    category: 'Electronics',
    subcategory: 'Wearables',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
    stock: 35,
    rating: 4.5,
    numReviews: 143,
    featured: true,
    brand: 'TechWear',
    tags: ['smartwatch', 'fitness', 'GPS']
  },
  {
    name: 'Wireless Bluetooth Speaker',
    price: 3999,
    compareAtPrice: 5499,
    description: '360° immersive sound with deep bass. IPX7 waterproof rating. 24-hour battery life. Built-in microphone for hands-free calls. Perfect for outdoor adventures.',
    category: 'Electronics',
    subcategory: 'Audio',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'],
    stock: 55,
    rating: 4.4,
    numReviews: 178,
    featured: false,
    brand: 'SoundMax',
    tags: ['speaker', 'bluetooth', 'waterproof']
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords manually
    console.log('Hashing passwords...');
    const hashedUsers = await Promise.all(users.map(async (u) => {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      return { ...u, password: hashedPassword };
    }));

    // Seed users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Seed products
    // We need to generate slugs manually for insertMany
    const hashedProducts = products.map(p => ({
      ...p,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7)
    }));
    const createdProducts = await Product.insertMany(hashedProducts);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('\n📧 Login Credentials:');
    console.log('Admin: admin@store.com / admin123');
    console.log('Customer: abebe@example.com / customer123');
    console.log('Customer: sara@example.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedDB();
