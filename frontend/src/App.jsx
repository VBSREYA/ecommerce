import { auth } from "./firebase";
import React, { useState, useEffect, useMemo } from "react";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from "firebase/auth";

// --- API DEFINITION ---
const BASE_URL = "https://ecommercebackend-4c8o.onrender.com";

export const API = {
  // PRODUCTS
  getProducts: async () => {
    const res = await fetch(`${BASE_URL}/products`);
    return res.json();
  },
  addProduct: async (data) => {
    return fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  deleteProduct: async (id) => {
    return fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
  },
  // ORDERS
  getOrders: async () => {
    const res = await fetch(`${BASE_URL}/orders`);
    return res.json();
  },
  addOrder: async (data) => {
    return fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  updateOrder: async (id, data) => {
    return fetch(`${BASE_URL}/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
};

// --- CONSTANTS ---
const CATEGORIES = ["All", "Stickers", "Writing", "Paper", "Gifting", "Limited Edition"];
const ORDER_STATUSES = ["Processing", "Packed", "Shipped", "Delivered"];
const ADMIN_PASSKEY = "TERRA2024";

const Icons = {
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>,
  Minus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>,
  Cart: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>,
  X: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>,
  Heart: ({ filled }) => (
    <svg className={`w-6 h-6 transition-colors ${filled ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-current'}`} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
    </svg>
  ),
  Admin: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>,
  Store: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
  Lock: () => <svg className="w-12 h-12 mb-4 text-[#D4A373]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>,
  Truck: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("user"); 
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [detailsProduct, setDetailsProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [trackId, setTrackId] = useState("");
  const [foundOrder, setFoundOrder] = useState(null);
  const provider = new GoogleAuthProvider();

  // --- DATA FETCHING ---
  const fetchProducts = async () => {
    try {
      const data = await API.getProducts();
      const fixed = Array.isArray(data) ? data.map(p => ({
        id: p._id || p.id,
        name: p.title || p.name, // Ensure compatibility with backend field names
        price: Number(p.price) || 0,
        image: p.image || "https://images.unsplash.com/photo-1589209590623-1f1906969248?auto=format&fit=crop&q=80&w=800",
        description: p.description || "No description provided.",
        category: p.category || "General",
        stock: Number(p.stock) || 10,
        discount: Number(p.discount) || 0,
        badge: p.badge || null
      })) : [];
      setProducts(fixed);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Keeping API call as requested, adapted to new base URL
        try {
          const res = await fetch(`${BASE_URL}/cart/${currentUser.email}`);
          if (res.ok) {
            const data = await res.json();
            setCart(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.log("Cart fetch fallback to local state", err);
          // Fails gracefully if endpoint doesn't exist yet on new backend
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // --- AUTH ---
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      showToast("Welcome to Terra ✨");
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    showToast("Logged out");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdminAuth = (e) => {
    e.preventDefault();
    const key = new FormData(e.target).get("passkey");
    if (key === ADMIN_PASSKEY) {
      setIsAdminAuth(true);
      showToast("Access Granted");
    } else {
      showToast("Invalid Credentials");
    }
  };

  // --- PRODUCT MANAGEMENT ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const productData = {
      title: formData.get("name"), // Assuming backend expects 'title' instead of 'name'
      description: formData.get("description"),
      price: Number(formData.get("price")),
      image: formData.get("image"),
      category: formData.get("category"),
      stock: Number(formData.get("stock")),
      discount: Number(formData.get("discount"))
    };

    try {
      if (editingProduct) {
        // Using standard PUT request to BASE URL since API object lacks updateProduct
        await fetch(`${BASE_URL}/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData)
        });
        showToast("Product Updated ✅");
      } else {
        await API.addProduct(productData);
        showToast("Product Added ✅");
      }
      
      await fetchProducts(); // Refresh
    } catch (err) {
      console.error(err);
      showToast("Error saving product ❌");
    }

    setIsEditorOpen(false);
  };

  // --- CART & WISHLIST ---
  const addToCart = async (product) => {
    if (!user) return showToast("Please login first");

    try {
      // Keeping fetch structure for backend cart, adapting to new BASE_URL
      await fetch(`${BASE_URL}/cart/add`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_email: user.email,
    product_id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1
  })
      }).catch(err => console.log("Backend cart ignored: ", err));

      const addToCart = async (product) => {
  if (!user) return showToast("Please login first");

  try {
    await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_email: user.email,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      })
    });

    // 🔥 IMPORTANT: re-fetch cart from backend
    const res = await fetch(`${BASE_URL}/cart/${user.email}`);
    const data = await res.json();

    setCart(data);

    showToast("Added to Bag");
  } catch (err) {
    console.error(err);
    showToast("Error adding to cart");
  }
};

      showToast("Added to Bag");
    } catch (err) {
      console.error(err);
      showToast("Error adding to cart");
    }
  };

  const handleCheckout = async () => {
    const orderId = "TER-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const today = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(today.getDate() + 10);
    
    const newOrder = {
      orderId: orderId,
      user_email: user?.email || "guest",
      items: cart,
      total: cartTotal,
      status: "Processing",
      date: today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      deliveryDate: deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      deliveryTimestamp: deliveryDate.getTime(),
      timestamp: Date.now()
    };
    
    try {
      // Push order to new API
      await API.addOrder(newOrder);

      setProducts(prev => prev.map(p => {
        const cartItem = cart.find(ci => ci.id === p.id);
        return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.quantity) } : p;
      }));

      setOrders([newOrder, ...orders]);
      setCart([]);
      setActiveDrawer(null);
      setTrackId(orderId);
      setFoundOrder(newOrder);
      setView("tracking");
      showToast(`Order Placed: Delivered by ${newOrder.deliveryDate}`);
    } catch (err) {
      console.error("Checkout Failed:", err);
      showToast("Error placing order.");
    }
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const isLiked = prev.find(p => p.id === product.id);
      if (isLiked) {
        showToast("Removed from Wishlist");
        return prev.filter(p => p.id !== product.id);
      }
      showToast("Saved to Favorites");
      return [...prev, product];
    });
  };

  const handleTrack = async (e) => {
    e?.preventDefault();
    try {
      const ordersData = await API.getOrders();
      const validOrders = Array.isArray(ordersData) ? ordersData : orders;
      const order = validOrders.find(o => (o.orderId || o.id).toUpperCase() === trackId.toUpperCase());
      
      if (order) {
        setFoundOrder(order);
      } else {
        setFoundOrder(null);
        showToast("Order ID Not Found");
      }
    } catch (err) {
      console.error(err);
      showToast("Tracking Service Unavailable");
    }
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => {
    const price = item.discount > 0 ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
    return sum + (price * item.quantity);
  }, 0), [cart]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2A26] font-sans selection:bg-[#D4A373]/30 overflow-x-hidden">
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-[#2D2A26] text-white px-8 py-4 rounded-2xl shadow-2xl animate-fade-in-up text-[10px] font-black uppercase tracking-widest">
          {toast}
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-24">
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setView("user"); setFoundOrder(null); }}>
            <div className="w-10 h-10 bg-[#D4A373] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#D4A373]/20 font-serif text-xl group-hover:rotate-6 transition-transform">T</div>
            <h1 className="text-2xl font-serif tracking-tighter text-[#D4A373] hidden sm:block">Terra</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-100">
              <button onClick={() => { setView("user"); setFoundOrder(null); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === "user" ? "bg-white shadow-sm text-[#D4A373]" : "text-gray-400"}`}>
                <Icons.Store /> <span className="hidden lg:inline">Boutique</span>
              </button>
              <button onClick={() => setView("tracking")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === "tracking" ? "bg-white shadow-sm text-[#D4A373]" : "text-gray-400"}`}>
                <Icons.Truck /> <span className="hidden lg:inline">Track</span>
              </button>
              <button onClick={() => setView("admin")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === "admin" ? "bg-white shadow-sm text-[#D4A373]" : "text-gray-400"}`}>
                <Icons.Admin /> <span className="hidden lg:inline">Admin</span>
              </button>
            </div>

            {view !== "admin" && (
              <div className="flex gap-2">
                <NavButton icon={<Icons.Heart filled={wishlist.length > 0} />} count={wishlist.length} onClick={() => setActiveDrawer('wishlist')} />
                <NavButton icon={<Icons.Cart />} count={cart.reduce((a, b) => a + b.quantity, 0)} onClick={() => setActiveDrawer('cart')} />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Slide-out Drawers */}
      {activeDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setActiveDrawer(null)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-left p-12 flex flex-col">
            <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-6">
              <h2 className="text-4xl font-serif italic">{activeDrawer === 'cart' ? 'The Bag' : 'The Wishlist'}</h2>
              <button onClick={() => setActiveDrawer(null)} className="p-2 hover:rotate-90 transition-transform"><Icons.X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
              {activeDrawer === 'cart' ? (
                cart.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-300 italic mb-6">No curations yet.</p>
                    <button onClick={() => setActiveDrawer(null)} className="text-[10px] font-black uppercase tracking-widest text-[#D4A373] underline underline-offset-8">Explore Storefront</button>
                  </div>
                ) :
                cart.map(item => (
                  <DrawerItem key={item.id} item={item} type="cart" onRemove={() => setCart(prev => prev.filter(i => i.id !== item.id))} onUpdateQty={(amt) => {
                    setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity + amt) } : i).filter(i => i.quantity > 0));
                  }} />
                ))
              ) : (
                wishlist.length === 0 ? <p className="text-center py-20 text-gray-300 italic">No saved pieces.</p> :
                wishlist.map(item => (
                  <DrawerItem key={item.id} item={item} type="wishlist" onRemove={() => setWishlist(prev => prev.filter(i => i.id !== item.id))} onMoveToCart={() => { addToCart(item); setWishlist(prev => prev.filter(i => i.id !== item.id)); }} />
                ))
              )}
            </div>

            {activeDrawer === 'cart' && cart.length > 0 && (
              <div className="mt-auto border-t border-gray-100 pt-10">
                <div className="bg-[#D4A373]/10 p-4 rounded-2xl mb-6 flex items-start gap-3">
                  <div className="mt-1 text-[#D4A373]"><Icons.Calendar /></div>
                  <p className="text-[10px] font-bold text-[#8B5E3C] leading-relaxed">
                    GUARANTEED DELIVERY:<br/>
                    Within 10 days of placing your order.
                  </p>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Total Value</span>
                  <span className="text-3xl font-serif">₹{cartTotal}</span>
                </div>
                <button onClick={handleCheckout} className="w-full bg-[#2D2A26] text-white py-5 rounded-[2rem] font-bold hover:bg-black transition-all shadow-xl text-lg">Checkout</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="pt-40 pb-20 max-w-7xl mx-auto px-6">
        {!user ? (
          <AuthUI onGoogleLogin={handleGoogleLogin} />
        ) : view === "user" ? (
          <UserView 
            products={products} 
            categoryFilter={categoryFilter} 
            setCategoryFilter={setCategoryFilter} 
            onToggleWishlist={toggleWishlist} 
            onAddToCart={addToCart} 
            wishlist={wishlist} 
            onShowDetails={setDetailsProduct} 
          />
        ) : view === "tracking" ? (
          <TrackingView 
            trackId={trackId} 
            setTrackId={setTrackId} 
            foundOrder={foundOrder} 
            onTrack={handleTrack} 
          />
        ) : (
          !isAdminAuth ? (
            <AdminLogin onLogin={handleAdminAuth} adminPasskey={ADMIN_PASSKEY} />
          ) : (
            <AdminDashboard 
              products={products} 
              setProducts={setProducts} 
              orders={orders}
              setOrders={setOrders}
              onAdd={() => { setEditingProduct(null); setIsEditorOpen(true); }} 
              onEdit={(p) => { setEditingProduct(p); setIsEditorOpen(true); }} 
              onLogout={() => setIsAdminAuth(false)} 
            />
          )
        )}
      </main>

      {/* Product Detail Modal */}
      {detailsProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDetailsProduct(null)}></div>
          <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-[80vh]">
            <div className="md:w-1/2 h-64 md:h-full relative overflow-hidden bg-gray-50">
               <img src={detailsProduct.image} className="w-full h-full object-cover" alt={detailsProduct.name} />
               {detailsProduct.badge && <span className="absolute top-8 left-8 px-4 py-1.5 bg-[#D4A373] text-white text-[9px] font-black uppercase tracking-widest rounded-full">{detailsProduct.badge}</span>}
            </div>
            <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                   <h2 className="text-4xl font-serif italic text-[#2D2A26]">{detailsProduct.name}</h2>
                   <button onClick={() => setDetailsProduct(null)} className="p-2 hover:rotate-90 transition-transform"><Icons.X /></button>
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-2xl font-bold text-[#D4A373]">₹{detailsProduct.discount > 0 ? Math.round(detailsProduct.price * (1 - detailsProduct.discount / 100)) : detailsProduct.price}</span>
                  {detailsProduct.discount > 0 && <span className="text-gray-300 line-through">₹{detailsProduct.price}</span>}
                </div>
                <p className="text-gray-500 leading-relaxed font-light mb-10">{detailsProduct.description}</p>
                
                <div className="flex items-center gap-2 mb-8 text-[#8B5E3C] bg-[#D4A373]/5 p-4 rounded-xl">
                  <Icons.Calendar />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ships immediately • Arrives in 10 days</span>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-300 pb-2 border-b border-gray-50"><span>Collection</span> <span>{detailsProduct.category}</span></div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-300 pb-2 border-b border-gray-50"><span>Stock</span> <span className={detailsProduct.stock < 5 ? 'text-red-400' : 'text-green-500'}>{detailsProduct.stock} units</span></div>
                </div>
              </div>
              <div className="flex gap-4">
                <button disabled={detailsProduct.stock === 0} onClick={() => { addToCart(detailsProduct); setDetailsProduct(null); }} className="flex-1 bg-[#2D2A26] text-white py-5 rounded-2xl font-bold hover:bg-black transition-all disabled:bg-gray-300">Add to Bag</button>
                <button onClick={() => { toggleWishlist(detailsProduct); setDetailsProduct(null); }} className="p-5 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                  <Icons.Heart filled={wishlist.some(w => w.id === detailsProduct.id)} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 md:p-16 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsEditorOpen(false)} className="absolute top-12 right-12 text-gray-300 hover:text-black"><Icons.X /></button>
            <h3 className="text-4xl font-serif italic mb-10">Boutique Entry</h3>
            <form onSubmit={handleSaveProduct} className="grid grid-cols-2 gap-6">
              <FormField label="Designation" name="name" defaultValue={editingProduct?.name} />
              <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-1">
                <FormField label="Valuation (₹)" name="price" type="number" defaultValue={editingProduct?.price} />
                <FormField label="Discount (%)" name="discount" type="number" defaultValue={editingProduct?.discount} />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Category</label>
                <select name="category" defaultValue={editingProduct?.category} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-1 ring-[#D4A373]/30">
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <FormField label="Inventory Count" name="stock" type="number" defaultValue={editingProduct?.stock} />
              <FormField label="Asset URL" name="image" defaultValue={editingProduct?.image} />
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Narration</label>
                <textarea name="description" defaultValue={editingProduct?.description} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none min-h-[100px]"></textarea>
              </div>
              <button className="col-span-2 bg-[#D4A373] text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#D4A373]/20 hover:bg-[#c49262] transition-all">Synchronize Vault</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
function AuthUI({ onGoogleLogin }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in px-4">
      <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-gray-100 shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-[#D4A373] rounded-xl flex items-center justify-center text-white text-2xl font-serif shadow-lg">T</div>
        </div>
        <h2 className="text-4xl font-serif italic mb-4 text-[#2D2A26]">Welcome to Terra</h2>
        <p className="text-gray-400 text-sm mb-10">Continue with your Google account</p>
        <button
          onClick={onGoogleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white border border-gray-200 py-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all font-semibold"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google Logo"/>
          <span className="text-sm tracking-wide">Continue with Google</span>
        </button>
        <p className="mt-8 text-[10px] text-gray-300 uppercase tracking-widest">Secure Authentication via Firebase</p>
      </div>
    </div>
  );
}

function NavButton({ icon, count, onClick }) {
  return (
    <button onClick={onClick} className="relative p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
      <div className="group-hover:scale-110 transition-transform">{icon}</div>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A373] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
          {count}
        </span>
      )}
    </button>
  );
}

function FormField({ label, name, type = "text", defaultValue }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</label>
      <input required name={name} type={type} defaultValue={defaultValue} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-1 ring-[#D4A373]/30" />
    </div>
  );
}

function AdminLogin({ onLogin, adminPasskey }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center animate-fade-in px-4">
      <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-gray-100 shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center"><Icons.Lock /></div>
        <h2 className="text-4xl font-serif italic mb-4">Restricted Access</h2>
        <p className="text-gray-400 text-sm mb-2 leading-relaxed">Admin management portal.</p>
        <p className="text-[10px] font-black text-[#D4A373] uppercase tracking-widest mb-10 bg-[#D4A373]/10 py-2 rounded-full inline-block px-6 border border-[#D4A373]/20">
          Passkey: {adminPasskey}
        </p>
        <form onSubmit={onLogin} className="space-y-4">
          <input autoFocus type="password" name="passkey" placeholder="Enter Passkey" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none text-center focus:border-[#D4A373] transition-all tracking-widest" />
          <button className="w-full bg-[#2D2A26] text-white py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">Authorize Access</button>
        </form>
      </div>
    </div>
  );
}

function TrackingView({ trackId, setTrackId, foundOrder, onTrack }) {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in min-h-[60vh]">
      <div className="text-center mb-16">
        <h2 className="text-6xl font-serif italic mb-6 text-[#2D2A26]">Concierge Tracking</h2>
        <p className="text-gray-400 font-light text-lg">Follow the journey of your curated pieces.</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm mb-12">
        <form onSubmit={onTrack} className="flex flex-col sm:flex-row gap-4">
          <input 
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            placeholder="Order ID (TER-XXXXXX)" 
            className="flex-1 bg-gray-50 border border-gray-100 p-5 rounded-2xl outline-none focus:ring-1 ring-[#D4A373]/30 tracking-widest font-mono text-center uppercase"
          />
          <button className="bg-[#2D2A26] text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">Locate Shipment</button>
        </form>
      </div>

      {foundOrder && (
        <div className="animate-fade-in space-y-12">
          <div className="bg-[#D4A373] text-white p-8 rounded-[2rem] shadow-xl shadow-[#D4A373]/20 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl"><Icons.Calendar /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Guaranteed Arrival</p>
                <p className="text-2xl font-serif">{foundOrder.deliveryDate}</p>
              </div>
            </div>
            <div className="px-6 py-2 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest border border-white/30">
              Status: {foundOrder.status}
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-serif italic mb-6">Order Contents</h3>
            <div className="space-y-4">
              {foundOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt={item.name} />
                    <div>
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserView({ products, categoryFilter, setCategoryFilter, onToggleWishlist, onAddToCart, wishlist, onShowDetails }) {
  const filtered = categoryFilter === "All" ? products : products.filter(p => p.category === categoryFilter);
  
  return (
    <div className="animate-fade-in">
      <div className="flex gap-4 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)} className={`px-6 py-3 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === c ? 'bg-[#2D2A26] text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map(p => (
          <div key={p.id} className="group cursor-pointer" onClick={() => onShowDetails(p)}>
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-gray-50 mb-4">
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.name} />
              {p.badge && <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-[#D4A373] text-[8px] font-black uppercase tracking-widest rounded-full">{p.badge}</span>}
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleWishlist(p); }} 
                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
              >
                <Icons.Heart filled={wishlist.some(w => w.id === p.id)} />
              </button>
            </div>
            <div>
              <h3 className="font-serif text-lg mb-1">{p.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-[#D4A373] font-bold">₹{p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(p); }} 
                  className="text-[9px] font-black uppercase tracking-widest hover:text-[#D4A373] transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DrawerItem({ item, type, onRemove, onUpdateQty, onMoveToCart }) {
  return (
    <div className="flex gap-4 items-center bg-gray-50/50 border border-gray-100 p-4 rounded-3xl">
      <img src={item.image} className="w-20 h-20 object-cover rounded-2xl" alt={item.name} />
      <div className="flex-1">
        <h4 className="text-sm font-bold text-[#2D2A26] mb-1 leading-tight">{item.name}</h4>
        <p className="text-[#D4A373] text-xs font-bold mb-3">₹{item.price}</p>
        {type === 'cart' && (
          <div className="flex items-center gap-3">
            <button onClick={() => onUpdateQty(-1)} className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50"><Icons.Minus /></button>
            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
            <button onClick={() => onUpdateQty(1)} className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50"><Icons.Plus /></button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={onRemove} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"><Icons.Trash /></button>
        {type === 'wishlist' && (
          <button onClick={onMoveToCart} className="p-3 bg-[#D4A373] rounded-xl text-white hover:bg-[#b0845a] transition-all shadow-sm shadow-[#D4A373]/20"><Icons.Cart /></button>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ products, setProducts, orders, setOrders, onAdd, onEdit, onLogout }) {
  const [tab, setTab] = useState("products");

  useEffect(() => {
    if (tab === "orders") {
      API.getOrders().then(data => {
        setOrders(Array.isArray(data) ? data : []);
      }).catch(console.error);
    }
  }, [tab]);

  const handleDelete = async (id) => {
    try {
      await API.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await API.updateOrder(id, { status });
      setOrders(orders.map(o => o.id === id || o._id === id ? { ...o, status } : o));
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-serif italic text-[#2D2A26]">Administration</h2>
        <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline">Revoke Access</button>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => setTab("products")} className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'products' ? 'bg-[#2D2A26] text-white shadow-xl' : 'bg-white border border-gray-100 text-gray-400'}`}>Inventory</button>
        <button onClick={() => setTab("orders")} className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'orders' ? 'bg-[#2D2A26] text-white shadow-xl' : 'bg-white border border-gray-100 text-gray-400'}`}>Orders</button>
      </div>

      {tab === "products" && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-serif italic">Vault Contents</h3>
            <button onClick={onAdd} className="bg-[#D4A373] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#b0845a] transition-colors"><Icons.Plus /> New Piece</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                  <th className="p-4">Piece</th>
                  <th className="p-4">Collection</th>
                  <th className="p-4">Valuation</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt={p.name} />
                      <span className="font-bold text-sm">{p.name}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{p.category}</td>
                    <td className="p-4 text-sm font-bold text-[#D4A373]">₹{p.price}</td>
                    <td className="p-4 text-sm"><span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>{p.stock}</span></td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => onEdit(p)} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-blue-500"><Icons.Edit /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500"><Icons.Trash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8">
          <h3 className="text-2xl font-serif italic mb-8">Active Shipments</h3>
          <div className="space-y-4">
            {orders.length === 0 ? <p className="text-gray-400 italic">No orders found.</p> : orders.map(o => (
              <div key={o.id || o._id || o.orderId} className="border border-gray-100 rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{o.orderId || o.id || o._id}</p>
                  <p className="font-serif text-lg">{o.date}</p>
                  <p className="text-sm text-gray-500">{o.items?.length || 0} items • ₹{o.total}</p>
                </div>
                <div className="flex items-center gap-4">
                  <select 
                    value={o.status} 
                    onChange={(e) => handleUpdateOrderStatus(o.id || o._id, e.target.value)}
                    className="p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-xs font-bold text-[#D4A373] uppercase tracking-widest"
                  >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
