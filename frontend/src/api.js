const BASE_URL = "https://ecommerce-backend-busm.onrender.com/api";

export const API = {
  getProducts: () =>
    fetch(`${BASE_URL}/products`)
      .then(res => res.json())
      .catch(err => {
        console.error("Get Products Error:", err);
      }),

  addProduct: (data) =>
    fetch(`${BASE_URL}/products/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .catch(err => {
        console.error("Add Product Error:", err);
      }),

  updateProduct: (id, data) =>
    fetch(`${BASE_URL}/products/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .catch(err => {
        console.error("Update Product Error:", err);
      })
};