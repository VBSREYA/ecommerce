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
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  updateOrder: async (id, data) => {
    return fetch(`${BASE_URL}/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }
};
