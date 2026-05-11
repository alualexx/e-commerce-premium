const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guestEmail: {
    type: String,
    default: ''
  },
  guestPhone: {
    type: String,
    default: ''
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: 'Ethiopia' }
  },
  paymentMethod: {
    type: String,
    enum: ['telebirr', 'cbe_birr', 'amole', 'cash_on_delivery'],
    required: true
  },
  paymentResult: {
    transactionId: String,
    status: String,
    paidAt: Date,
    phoneNumber: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  statusHistory: [statusHistorySchema],
  deliveryPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deliveredAt: {
    type: Date
  },
  feedback: feedbackSchema
}, {
  timestamps: true
});

// Auto-generate tracking number before saving
orderSchema.pre('save', async function() {
  if (!this.trackingNumber) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ALX-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Add timestamp suffix for uniqueness
    code += '-' + Date.now().toString(36).slice(-3).toUpperCase();
    this.trackingNumber = code;
  }

  // Add initial status to history if new order
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: 'pending',
      timestamp: new Date(),
      note: 'Order placed'
    });
  }
});

// Index for fast tracking lookups

orderSchema.index({ deliveryPerson: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
