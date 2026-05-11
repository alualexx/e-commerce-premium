import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart')) || [],

  // Computed selectors — call as functions: store.totalPrice()
  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  shippingPrice: () => {
    const sub = get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return sub > 5000 ? 0 : 150;
  },
  taxPrice: () => {
    const sub = get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return Math.round(sub * 0.15 * 100) / 100;
  },
  grandTotal: () => {
    const sub = get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const ship = sub > 5000 ? 0 : 150;
    const tax = Math.round(sub * 0.15 * 100) / 100;
    return sub + ship + tax;
  },

  addItem: (product, quantity = 1) => {
    set(state => {
      const existingIndex = state.items.findIndex(item => item._id === product._id);
      let newItems;
      if (existingIndex > -1) {
        newItems = state.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        newItems = [...state.items, {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          stock: product.stock,
          slug: product.slug,
          quantity: Math.min(quantity, product.stock),
        }];
      }
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  removeItem: (productId) => {
    set(state => {
      const newItems = state.items.filter(item => item._id !== productId);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  updateQuantity: (productId, quantity) => {
    set(state => {
      const newItems = state.items.map(item =>
        item._id === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
          : item
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    set({ items: [] });
  },
}));

export default useCartStore;
