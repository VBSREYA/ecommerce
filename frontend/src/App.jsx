import { auth } from "./firebase";
import { API } from "./api";
import React, { useState, useEffect, useMemo } from "react";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
// --- INITIAL MOCK DATA ---
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Botanical Sticker Sheets",
    price: 250,
    discount: 10,
    category: "Stickers",
    stock: 45,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1589209590623-1f1906969248?auto=format&fit=crop&q=80&w=800",
    description: "Delicate washi-paper stickers featuring pressed-flower aesthetics. Perfect for journaling and scrapbooking."
  },
  {
    id: 2,
    name: "Cat Paw Erasers",
    price: 150,
    discount: 0,
    category: "Writing",
    stock: 5,
    badge: "Top Rated",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
    description: "Retractable erasers in the shape of cute cat paws. High-quality rubber that leaves no residue."
  },
  {
    id: 3,
    name: "Linen Hardcover Journal",
    price: 850,
    discount: 5,
    category: "Paper",
    stock: 12,
    badge: "New Arrival",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=800",
    description: "Premium 120gsm lay-flat notebook with linen texture. Acid-free paper suitable for fountain pens."
  }
];

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

useEffect(() => {
  fetch("https://ecommerce-backend-busm.onrender.com/api/products")
    .then(res => res.json())
    .then(data => {
      console.log("Products from DB:", data);
      setProducts(data);
    });
}, []);
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
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);

    if (currentUser) {
      // 🔥 LOAD CART FROM DATABASE
      const res = await fetch(`https://ecommerce-backend-busm.onrender.com/api/cart/${currentUser.email}`);
      const data = await res.json();

      // ⚠️ IMPORTANT: attach quantity + product info later
      setCart(data);
    }
  });

  return () => unsubscribe();
}, []);
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

const handleSaveProduct = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const productData = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    image: formData.get("image"),
  };

  try {
    if (editingProduct) {
      // ✅ UPDATE PRODUCT
      await fetch(`https://ecommerce-backend-busm.onrender.com/api/products/update/${editingProduct.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
      });

      showToast("Product Updated ✅");

    } else {
      // ✅ ADD PRODUCT
   await fetch("https://ecommerce-backend-busm.onrender.com/api/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
      });

      showToast("Product Added ✅");
    }

    // 🔄 REFRESH PRODUCTS
   const res = await fetch("https://ecommerce-backend-busm.onrender.com/api/products");
    const data = await res.json();
    setProducts(data);

  } catch (err) {
    console.error(err);
    showToast("Error saving product ❌");
  }

  setIsEditorOpen(false);
};

  const addToCart = async (product) => {
  if (!user) return showToast("Please login first");

  try {
    // ✅ SAVE TO BACKEND
    await fetch("https://ecommerce-backend-busm.onrender.com/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_email: user.email,
        product_id: product.id,
        quantity: 1
      })
    });

    // ✅ UPDATE UI
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    showToast("Added to Bag");

  } catch (err) {
    console.error(err);
    showToast("Error adding to cart");
  }
};

  const handleCheckout = () => {
    const orderId = "TER-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const today = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(today.getDate() + 10);
    
    const newOrder = {
      id: orderId,
      items: [...cart],
      total: cartTotal,
      status: "Processing",
      date: today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      deliveryDate: deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      deliveryTimestamp: deliveryDate.getTime(),
      timestamp: Date.now()
    };
    
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

  const handleTrack = (e) => {
    e?.preventDefault();
    const order = orders.find(o => o.id.toUpperCase() === trackId.toUpperCase());
    if (order) {
      setFoundOrder(order);
    } else {
      setFoundOrder(null);
      showToast("Order ID Not Found");
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
                  <DrawerItem key={item.id} item={item} type="wishlist" onRemove={() => setWishlist(prev => prev.filter(i => i.id !== item.id))} onMoveToCart={() => addToCart(item)} />
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
               <img src={detailsProduct.image} className="w-full h-full object-cover" />
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

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-[#D4A373] rounded-xl flex items-center justify-center text-white text-2xl font-serif shadow-lg">
            T
          </div>
        </div>

        <h2 className="text-4xl font-serif italic mb-4 text-[#2D2A26]">
          Welcome to Terra
        </h2>

        <p className="text-gray-400 text-sm mb-10">
          Continue with your Google account
        </p>

        {/* Google Button */}
        <button
          onClick={onGoogleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white border border-gray-200 py-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all font-semibold"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            className="w-5 h-5"
          />
          <span className="text-sm tracking-wide">Continue with Google</span>
        </button>

        <p className="mt-8 text-[10px] text-gray-300 uppercase tracking-widest">
          Secure Authentication via Firebase
        </p>
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
  const daysRemaining = foundOrder ? Math.max(0, Math.ceil((foundOrder.deliveryTimestamp - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

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

      {foundOrder ? (
        <div className="animate-fade-in space-y-12">
          <div className="bg-[#D4A373] text-white p-8 rounded-[2rem] shadow-xl shadow-[#D4A373]/20 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl"><Icons.Calendar /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Guaranteed Arrival</p>
                <p className="text-2xl font-serif">{foundOrder.deliveryDate}</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              {foundOrder.status === 'Delivered' ? (
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-4 py-2 rounded-full">Shipment Delivered</p>
              ) : (
                <>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Time Remaining</p>
                  <p className="text-3xl font-serif">{daysRemaining} Days</p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Order ID</span>
              <h3 className="text-3xl font-serif italic">{foundOrder.id}</h3>
            </div>
            <div className="text-left md:text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Current Phase</span>
              <p className="font-bold text-[#D4A373] uppercase text-sm tracking-widest">{foundOrder.status}</p>
            </div>
          </div>

          <div className="relative pt-10 pb-20 px-4">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2"></div>
             <div 
               className="absolute top-1/2 left-0 h-0.5 bg-[#D4A373] -translate-y-1/2 transition-all duration-1000" 
               style={{ width: `${(ORDER_STATUSES.indexOf(foundOrder.status) / (ORDER_STATUSES.length - 1)) * 100}%` }}
             ></div>

             <div className="relative flex justify-between">
                {ORDER_STATUSES.map((status, idx) => {
                  const isActive = ORDER_STATUSES.indexOf(foundOrder.status) >= idx;
                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 border-4 border-white ${isActive ? 'bg-[#D4A373] shadow-lg shadow-[#D4A373]/30 scale-125' : 'bg-gray-100'}`}>
                        {isActive ? <span className="text-white text-[10px]"><Icons.Check /></span> : null}
                      </div>
                      <span className={`mt-6 text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-[#2D2A26]' : 'text-gray-300'}`}>{status}</span>
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="bg-gray-50/50 rounded-[2rem] p-10 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-4">Order Manifest</h4>
            {foundOrder.items.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <img src={item.image} className="w-12 h-14 object-cover rounded-lg shadow-sm" />
                  <span className="font-serif text-lg">{item.name} <span className="text-gray-400 font-sans text-sm ml-2">×{item.quantity}</span></span>
                </div>
                <span className="font-bold text-[#D4A373]">₹{(item.discount > 0 ? Math.round(item.price * (1 - item.discount / 100)) : item.price) * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Total Valuation</span>
               <span className="text-2xl font-serif">₹{foundOrder.total}</span>
            </div>
          </div>
        </div>
      ) : trackId && (
        <div className="text-center py-20 text-gray-300 italic">Order not found.</div>
      )}
    </div>
  );
}

function UserView({ products, categoryFilter, setCategoryFilter, onToggleWishlist, onAddToCart, wishlist, onShowDetails }) {
  const filtered = products.filter(p => categoryFilter === "All" || p.category === categoryFilter);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
        <div className="max-w-2xl">
          <h2 className="text-6xl md:text-8xl font-serif leading-[0.85] tracking-tighter mb-8 italic text-[#2D2A26]">Artisanal <br/><span className="text-[#D4A373] not-italic">Archives</span></h2>
          <p className="text-lg md:text-xl text-gray-400 font-light max-w-lg leading-relaxed">Guaranteed delivery within 10 days of purchase.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${categoryFilter === cat ? "bg-[#2D2A26] text-white border-[#2D2A26] shadow-lg" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24">
        {filtered.map(p => (
          <ProductCard 
            key={p.id} 
            product={p} 
            isLiked={wishlist.some(w => w.id === p.id)} 
            onToggleWishlist={() => onToggleWishlist(p)}
            onAddToCart={() => onAddToCart(p)}
            onShowDetails={() => onShowDetails(p)}
          />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, isLiked, onToggleWishlist, onAddToCart, onShowDetails }) {
  const finalPrice = product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price;

  return (
    <div className="group">
      <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 relative mb-8 shadow-sm hover:shadow-2xl transition-all duration-700">
        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        
        <button onClick={onToggleWishlist} className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${isLiked ? 'bg-white shadow-xl' : 'bg-white/40 text-white hover:bg-white hover:text-red-500'}`}>
          <Icons.Heart filled={isLiked} />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full tracking-[0.2em]">Sold Out</span>
          </div>
        )}

        <div className="absolute inset-x-6 bottom-6 opacity-0 group-hover:opacity-100 transition-all translate-y-6 group-hover:translate-y-0">
          <button disabled={product.stock === 0} onClick={onAddToCart} className="w-full bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#D4A373] transition-colors disabled:bg-gray-400 shadow-xl">
             Reserve Item
          </button>
        </div>
      </div>
      <div className="text-center px-4">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 block mb-3">{product.category}</span>
        <h3 className="font-serif text-2xl mb-2 group-hover:text-[#D4A373] transition-colors cursor-pointer" onClick={onShowDetails}>{product.name}</h3>
        <div className="flex justify-center gap-2 items-center">
           <span className="text-lg font-bold text-[#D4A373]">₹{finalPrice}</span>
           {product.discount > 0 && <span className="text-xs text-gray-300 line-through">₹{product.price}</span>}
        </div>
      </div>
    </div>
  );
}

function DrawerItem({ item, type, onRemove, onUpdateQty, onMoveToCart }) {
  const price = item.discount > 0 ? Math.round(item.price * (1 - item.discount / 100)) : item.price;
  
  return (
    <div className="flex gap-6 group animate-fade-in border-b border-gray-50 pb-6">
      <div className="relative shrink-0">
        <img src={item.image} className="w-20 h-24 object-cover rounded-[1.5rem] shadow-sm" />
        <button onClick={onRemove} className="absolute -top-2 -left-2 w-6 h-6 bg-white text-gray-300 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500">
          <Icons.X />
        </button>
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h4 className="font-serif text-lg leading-tight mb-1">{item.name}</h4>
          <p className="text-[#D4A373] font-bold text-sm">₹{price}</p>
        </div>
        
        {type === 'cart' ? (
          <div className="flex items-center bg-gray-100 rounded-xl px-2 py-0.5 w-fit">
            <button onClick={() => onUpdateQty(-1)} className="p-1 hover:text-[#D4A373] transition-colors"><Icons.Minus /></button>
            <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
            <button onClick={() => onUpdateQty(1)} className="p-1 hover:text-[#D4A373] transition-colors"><Icons.Plus /></button>
          </div>
        ) : (
          <button onClick={onMoveToCart} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 flex items-center gap-2 hover:text-[#D4A373] transition-colors">
            <Icons.Plus /> Bag This
          </button>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ products, setProducts, orders, setOrders, onAdd, onEdit, onLogout }) {
  const [tab, setTab] = useState("inventory"); 
  const [query, setQuery] = useState("");

  const filteredItems = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  const filteredOrders = orders.filter(o => o.id.toLowerCase().includes(query.toLowerCase()));

  const stats = useMemo(() => {
    const lowStock = products.filter(p => p.stock < 10).length;
    const pendingOrders = orders.filter(o => o.status !== "Delivered").length;
    return { lowStock, pendingOrders };
  }, [products, orders]);

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div>
          <h2 className="text-6xl font-serif italic text-[#8B5E3C]">Boutique Admin</h2>
          <div className="flex gap-4 mt-6">
            <div className={`px-6 py-4 rounded-3xl shadow-sm border ${stats.lowStock > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Low Stock</p>
               <p className={`text-xl font-serif ${stats.lowStock > 0 ? 'text-red-500' : 'text-gray-900'}`}>{stats.lowStock}</p>
            </div>
            <div className="bg-white border border-gray-100 px-6 py-4 rounded-3xl shadow-sm">
               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Orders</p>
               <p className="text-xl font-serif">{stats.pendingOrders}</p>
            </div>
            <button onClick={onLogout} className="px-6 py-4 rounded-3xl border border-red-100 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50">Logout</button>
          </div>
        </div>
        <div className="flex flex-col items-center gap-6">
          <div className="flex bg-gray-100 p-1 rounded-2xl w-full">
            <button onClick={() => setTab("inventory")} className={`flex-1 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === "inventory" ? "bg-white shadow-sm text-[#D4A373]" : "text-gray-400"}`}>Inventory</button>
            <button onClick={() => setTab("orders")} className={`flex-1 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === "orders" ? "bg-white shadow-sm text-[#D4A373]" : "text-gray-400"}`}>Orders</button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <input placeholder="Filter..." className="bg-white border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:border-[#D4A373] w-full shadow-sm" value={query} onChange={(e) => setQuery(e.target.value)} />
            {tab === "inventory" && <button onClick={onAdd} className="w-full sm:w-auto bg-[#D4A373] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">New</button>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 overflow-x-auto shadow-sm">
        {tab === "inventory" ? (
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Item</th>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Stock</th>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map(p => (
                <tr key={p.id}>
                  <td className="px-10 py-8 flex items-center gap-6">
                    <img src={p.image} className="w-16 h-20 object-cover rounded-xl" />
                    <div><h4 className="font-serif text-xl">{p.name}</h4><p className="text-xs text-gray-400 italic">₹{p.price}</p></div>
                  </td>
                  <td className="px-10 py-8 text-center"><span className="bg-gray-50 px-4 py-2 rounded-lg font-bold text-[11px]">{p.stock}</span></td>
                  <td className="px-10 py-8 text-right"><button onClick={() => onEdit(p)} className="p-3 bg-gray-50 rounded-xl hover:text-[#D4A373]"><Icons.Edit /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Reference</th>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Promise</th>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map(o => (
                <tr key={o.id}>
                  <td className="px-10 py-8"><h4 className="font-serif text-lg">{o.id}</h4></td>
                  <td className="px-10 py-8 text-sm text-[#8B5E3C] font-bold">{o.deliveryDate}</td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-2 rounded-lg font-bold text-[11px] uppercase tracking-widest bg-[#D4A373]/10 text-[#D4A373]">{o.status}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <select value={o.status} onChange={(e) => setOrders(orders.map(order => order.id === o.id ? { ...order, status: e.target.value } : order))} className="bg-gray-100 p-3 rounded-xl text-[10px] font-black uppercase">
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}