import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import ProductForm from "../components/ProductForm";
import { getDashboardStats } from "../api/dashboard";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products";

import "../styles/Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [defaultThreshold, setDefaultThreshold] = useState(5);

  const loadProducts = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const [productsData, dashboardData] = await Promise.all([
      getProducts(),
      getDashboardStats(),
    ]);

    setProducts(productsData);

    setDefaultThreshold(
      dashboardData.organization.defaultLowStockThreshold
    );
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to load products. Please try again."
    );
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term)
    );
  }, [products, search]);

  const getStockStatus = (product) => {
    if (product.quantityOnHand === 0) {
      return {
        label: "Out of Stock",
        className: "stock-out",
      };
    }

    // Temporary fallback: 5 matches the default in our Prisma schema.
    // We'll fetch the actual organization threshold in Stage 8.
    const threshold =
  product.lowStockThreshold ?? defaultThreshold;

    if (product.quantityOnHand <= threshold) {
      return {
        label: "Low Stock",
        className: "stock-low",
      };
    }

    return {
      label: "In Stock",
      className: "stock-in",
    };
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setShowForm(true);
    setSuccess("");
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    setSuccess("");
  };

  const handleSave = async (data) => {
    setSaving(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        setSuccess("Product updated successfully.");
      } else {
        await createProduct(data);
        setSuccess("Product added successfully.");
      }

      setShowForm(false);
      setEditingProduct(null);

      await loadProducts();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(product.id);
      setError("");
      setSuccess("");

      await deleteProduct(product.id);

      setSuccess(`"${product.name}" deleted successfully.`);

      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return "—";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(price));
  };

  return (
    <div className="products-page">
      <div className="products-heading">
        <div>
          <span className="dashboard-eyebrow">INVENTORY</span>
          <h1>Products</h1>
          <p>Manage and organize your inventory in one place.</p>
        </div>

        <button
          type="button"
          className="product-primary-button"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {error && (
        <div className="product-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="product-success" role="status">
          {success}
        </div>
      )}

      <section className="products-panel">
        <div className="products-toolbar">
          <div className="products-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
          </div>

          <div className="products-count">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <div className="products-empty">
            <p>Loading your inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="products-empty">
            <div className="dashboard-empty-icon">
              {search ? <Search size={32} /> : <Package size={32} />}
            </div>

            <h3>
              {search ? "No matching products" : "No products yet"}
            </h3>

            <p>
              {search
                ? "Try searching with a different product name or SKU."
                : "Add your first product to start managing inventory."}
            </p>

            {!search && (
              <button
                type="button"
                className="product-primary-button"
                onClick={openCreateForm}
              >
                <Plus size={18} />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>QUANTITY</th>
                  <th>SELLING PRICE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="product-name-cell">
                          <div className="product-table-icon">
                            <Package size={19} />
                          </div>

                          <div>
                            <strong>{product.name}</strong>
                            <span>
                              {product.description || "No description"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="product-sku">{product.sku}</span>
                      </td>

                      <td>
                        <strong>{product.quantityOnHand}</strong>
                      </td>

                      <td>{formatPrice(product.sellingPrice)}</td>

                      <td>
                        <span
                          className={`stock-badge ${status.className}`}
                        >
                          {status.label === "Low Stock" && (
                            <AlertTriangle size={13} />
                          )}
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <div className="product-actions">
                          <button
                            type="button"
                            className="product-icon-button"
                            title="Edit product"
                            aria-label={`Edit ${product.name}`}
                            onClick={() => openEditForm(product)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="product-icon-button product-delete-button"
                            title="Delete product"
                            aria-label={`Delete ${product.name}`}
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <ProductForm
          product={editingProduct}
          saving={saving}
          onClose={() => {
            if (!saving) {
              setShowForm(false);
              setEditingProduct(null);
            }
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}