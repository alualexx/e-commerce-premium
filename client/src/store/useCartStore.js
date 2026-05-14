import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: (() => { 
    try { 
      const data = localStorage.getItem('cart-storage'); 
      if (!data) return [];
      const parsed = JSON.parse(data);
      return parsed?.state?.items || [];
    } catch (e) { 
      console.error('Error parsing cart from localStorage:', e);
      return []; 
    } 
  })(),

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
          shippingPrice: product.shippingPrice || 0,
          image: product.images?.[0] || '',
          stock: product.stock,
          slug: product.slug,
          quantity: Math.min(quantity, product.stock),
        }];
      }
      localStorage.setItem('cart-storage', JSON.stringify({ state: { items: newItems } }));
      return { items: newItems };
    });
  },

  removeItem: (productId) => {
    set(state => {
      const newItems = state.items.filter(item => item._id !== productId);
      localStorage.setItem('cart-storage', JSON.stringify({ state: { items: newItems } }));
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
      localStorage.setItem('cart-storage', JSON.stringify({ state: { items: newItems } }));
      return { items: newItems };
    });
  },

  clearCart: () => {
    localStorage.removeItem('cart-storage');
    set({ items: [] });
  },
}));

export default useCartStore;
