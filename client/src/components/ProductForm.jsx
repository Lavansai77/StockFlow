import { useEffect, useState } from "react";
import { X } from "lucide-react";

const emptyForm = {
  name: "",
  sku: "",
  description: "",
  quantityOnHand: "0",
  costPrice: "",
  sellingPrice: "",
  lowStockThreshold: "",
};

export default function ProductForm({
  product,
  onClose,
  onSave,
  saving,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  const isEditing = Boolean(product);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        description: product.description || "",
        quantityOnHand: String(product.quantityOnHand ?? 0),
        costPrice: product.costPrice ?? "",
        sellingPrice: product.sellingPrice ?? "",
        lowStockThreshold: product.lowStockThreshold ?? "",
      });
    } else {
      setFormData(emptyForm);
    }
  }, [product]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (
      formData.quantityOnHand.trim() === "" ||
      !Number.isInteger(Number(formData.quantityOnHand)) ||
      Number(formData.quantityOnHand) < 0
    ) {
      setError("Quantity must be a non-negative whole number.");
      return;
    }

    const optionalNumber = (value) =>
      value === "" || value === null ? null : Number(value);

    const data = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim() || null,
      quantityOnHand: Number(formData.quantityOnHand),
      costPrice: optionalNumber(formData.costPrice),
      sellingPrice: optionalNumber(formData.sellingPrice),
      lowStockThreshold: optionalNumber(formData.lowStockThreshold),
    };

    for (const field of ["costPrice", "sellingPrice"]) {
      if (
        data[field] !== null &&
        (!Number.isFinite(data[field]) ||
          data[field] < 0 ||
          data[field] > 9999999999.99 ||
          !Number.isInteger(Math.round(data[field] * 100)))
      ) {
        setError("Prices must be valid non-negative amounts.");
        return;
      }
    }

    if (
      data.lowStockThreshold !== null &&
      (!Number.isInteger(data.lowStockThreshold) ||
        data.lowStockThreshold < 0)
    ) {
      setError("Low-stock threshold must be a non-negative whole number.");
      return;
    }

    try {
      setError("");
      await onSave(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save product. Please try again."
      );
    }
  };

  return (
    <div
      className="product-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
      >
        <div className="product-modal-header">
          <div>
            <h2 id="product-form-title">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <p>
              {isEditing
                ? "Update your inventory product details."
                : "Enter the details of your new product."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="product-icon-button"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="product-modal-body">
            {error && (
              <div className="product-error" role="alert">
                {error}
              </div>
            )}

            <div className="product-form-grid">
              <div className="product-field">
                <label htmlFor="product-name">Product Name *</label>
                <input
                  id="product-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dell Inspiron 15"
                  maxLength={150}
                  required
                />
              </div>

              <div className="product-field">
                <label htmlFor="product-sku">SKU *</label>
                <input
                  id="product-sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. DELL-001"
                  maxLength={100}
                  required
                />
              </div>

              <div className="product-field product-field-full">
                <label htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional product description"
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div className="product-field">
                <label htmlFor="product-quantity">Quantity on Hand *</label>
                <input
                  id="product-quantity"
                  type="number"
                  name="quantityOnHand"
                  value={formData.quantityOnHand}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div className="product-field">
                <label htmlFor="product-threshold">
                  Low Stock Threshold
                </label>
                <input
                  id="product-threshold"
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="Use organization default"
                />
              </div>

              <div className="product-field">
                <label htmlFor="product-cost">Cost Price (₹)</label>
                <input
                  id="product-cost"
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="product-field">
                <label htmlFor="product-selling">Selling Price (₹)</label>
                <input
                  id="product-selling"
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="product-modal-footer">
            <button
              type="button"
              className="product-secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="product-primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}