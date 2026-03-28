import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, Package, Send, AlertCircle, ArrowLeft, Info, CheckCircle } from 'lucide-react';
import { addOrder, getProductById } from '../services/db';
import type { Product } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../components/ProductCard';

const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initialize state from sessionStorage OR default values
  interface CheckoutFormData {
    fullName: string;
    mobile: string;
    village: string;
    mandal: string;
    district: string;
    state: string;
    pincode: string;
    quantity: number;
  }

  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    const savedData = sessionStorage.getItem(`checkoutFormData_${id}`);
    return savedData ? JSON.parse(savedData) : {
      fullName: user?.username || '',
      mobile: '',
      village: '',
      mandal: '',
      district: '',
      state: '',
      pincode: '',
      quantity: 1
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Save to sessionStorage whenever user types
  useEffect(() => {
    sessionStorage.setItem(`checkoutFormData_${id}`, JSON.stringify(formData));
  }, [formData, id]);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(data => {
        if (!data) throw new Error('Product not found');
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Ensure user data populates if loaded later
  useEffect(() => {
    if (user && !formData.fullName) {
      setFormData(prev => ({ ...prev, fullName: user.username || '' }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Enter a valid 10-digit mobile number";
    if (!formData.village.trim()) newErrors.village = "Village is required";
    if (!formData.mandal.trim()) newErrors.mandal = "Mandal is required";
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Enter a valid 6-digit pincode";
    if (formData.quantity < 1) newErrors.quantity = "Quantity must be at least 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !validate()) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        productId: product.id,
        productName: product.name,
        productImage: product.image || (product.images && product.images[0]) || '',
        fullName: formData.fullName,
        mobile: formData.mobile,
        address: {
          village: formData.village,
          mandal: formData.mandal,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
        },
        quantity: formData.quantity,
        userId: user?.id,
      };

      await addOrder(orderData as any);

      // Clear storage after successful order
      sessionStorage.removeItem(`checkoutFormData_${id}`);

      // Automated WhatsApp message
      const whatsappNumber = "919959916507";
      const priceText = (!product.pricingType || product.pricingType === 'standard') ? formatCurrency(product.price) : "Contact for Price";
      const message = `Hii, \n I am ${formData.fullName}, i want to buy ${product.name} which was ${priceText}. \n Confirm my order and share more details about delivery.`;

      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

      navigate('/my-orders');
    } catch (error) {
      console.error("Order submission failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="checkout-loading">Loading Checkout...</div>;
  if (!product) return <div className="checkout-loading">Product Not Found</div>;

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        <Link to={`/products/${id}`} className="back-link">
          <ArrowLeft size={18} /> Back to Product
        </Link>

        <div className="checkout-grid">

          {/* Column 1: Order Summary */}
          <div className="checkout-col-summary">
            <div className="summary-card">
              <div className="summary-header">
                <Package size={20} className="icon-blue" />
                <h2>Order Summary</h2>
              </div>

              <div className="product-details-layout">
                <div className="product-image-box">
                  <img
                    src={product.image || (product.images && product.images[0]) || 'https://via.placeholder.com/300'}
                    alt={product.name}
                  />
                </div>
                <div className="product-info-text">
                  <h3>{product.name}</h3>
                  <p className="price-text">
                    {(!product.pricingType || product.pricingType === 'standard') ? formatCurrency(product.price) : 'Contact for Price'}
                  </p>
                  {product.promises?.delivery && (
                    <div className="delivery-badge">
                      <CheckCircle size={14} /> Delivery Available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Form */}
          <div className="checkout-col-form">
            <div className="form-card">
              <h1 className="form-title">Enter Order Details</h1>

              <form onSubmit={handleSubmit} className="order-form">

                {/* Full Name & Mobile */}
                <div className="form-row">
                  <div className="form-group full-width">
                    <label><User size={16} /> Full Name <span className="req">*</span></label>
                    <input
                      type="text"
                      name="fullName"
                      className={errors.fullName ? 'input-error' : ''}
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                    {errors.fullName && <p className="error-text"><AlertCircle size={12} /> {errors.fullName}</p>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label><Phone size={16} /> Mobile Number <span className="req">*</span></label>
                    <input
                      type="tel"
                      name="mobile"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      title="10-digit mobile number required"
                      className={errors.mobile ? 'input-error' : ''}
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                      placeholder="10-digit number"
                      required
                    />
                    {errors.mobile && <p className="error-text"><AlertCircle size={12} /> {errors.mobile}</p>}
                  </div>

                  <div className="form-group">
                    <label><Package size={16} /> Quantity <span className="req">*</span></label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      className={errors.quantity ? 'input-error' : ''}
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                    {errors.quantity && <p className="error-text"><AlertCircle size={12} /> {errors.quantity}</p>}
                  </div>
                </div>

                {/* Divider */}
                <div className="section-divider">
                  <div className="line"></div>
                  <span className="divider-text"><MapPin size={14} /> Delivery Address</span>
                  <div className="line"></div>
                </div>

                {/* Address Fields */}
                <div className="form-group full-width">
                  <label>Village <span className="req">*</span></label>
                  <input
                    type="text"
                    name="village"
                    className={errors.village ? 'input-error' : ''}
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Village name"
                    required
                  />
                  {errors.village && <p className="error-text"><AlertCircle size={12} /> {errors.village}</p>}
                </div>

                <div className="form-group full-width">
                  <label>Mandal <span className="req">*</span></label>
                  <input
                    type="text"
                    name="mandal"
                    className={errors.mandal ? 'input-error' : ''}
                    value={formData.mandal}
                    onChange={handleChange}
                    placeholder="Mandal name"
                    required
                  />
                  {errors.mandal && <p className="error-text"><AlertCircle size={12} /> {errors.mandal}</p>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>District</label>
                    <input
                      type="text"
                      name="district"
                      className="input-disabled"
                      value={formData.district}
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>PIN Code <span className="req">*</span></label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      title="6-digit PIN code required"
                      className={errors.pincode ? 'input-error' : ''}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                      placeholder="6-digit pincode"
                      required
                    />
                    {errors.pincode && <p className="error-text"><AlertCircle size={12} /> {errors.pincode}</p>}
                  </div>
                </div>

                {/* Submit Area */}
                <div className="submit-area">
                  <a
                    href="/delivery"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="delivery-link"
                  >
                    <Info size={16} /> View Delivery Instructions
                  </a>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-submit"
                  >
                    {isSubmitting ? "Processing..." : <>Confirm your Order <Send size={20} /></>}
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>

      {/* PURE CSS STYLES */}
      <style>{`
        .checkout-page {
          background-color: #f8fafc;
          min-height: 100vh;
          padding: 3rem 1.5rem;
          font-family: system-ui, -apple-system, sans-serif;
          color: #1e293b;
        }

        .checkout-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60vh;
          font-size: 1.5rem;
          color: #64748b;
          font-weight: 600;
        }

        .checkout-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* Back Link */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #1e3a8a;
          text-decoration: none;
          font-weight: 700;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }
        .back-link:hover { color: #1e40af; text-decoration: underline; }

        /* Grid Layout */
        .checkout-grid {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }
        .checkout-col-summary { flex: 1; min-width: 300px; }
        .checkout-col-form { flex: 2; }

        /* Summary Card */
        .summary-card {
          background: white;
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          position: sticky;
          top: 6rem;
        }
        .summary-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .summary-header h2 { font-size: 1.25rem; font-weight: 800; margin: 0; color: #0f172a; }
        .icon-blue { color: #2563eb; }

        .product-details-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .product-image-box {
          width: 100%;
          aspect-ratio: 1;
          background: #f8fafc;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-image-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .product-info-text h3 { font-size: 1.2rem; font-weight: 800; margin: 0 0 0.5rem 0; line-height: 1.3; }
        .price-text { font-size: 1.5rem; font-weight: 900; color: #1e3a8a; margin: 0 0 1rem 0; }
        .delivery-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #f0fdf4;
          color: #16a34a;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
        }

        /* Form Card */
        .form-card {
          background: white;
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border: 1px solid #f1f5f9;
        }
        .form-title {
          font-size: 1.8rem;
          font-weight: 900;
          margin: 0 0 2rem 0;
          padding-left: 1rem;
          border-left: 5px solid #1e3a8a;
          color: #0f172a;
        }

        .order-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-row {
          display: flex;
          gap: 1.5rem;
        }
        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .full-width { width: 100%; flex: unset; }
        
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #475569;
        }
        .req { color: #ef4444; }

        .form-group input {
          padding: 1rem 1.25rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 1rem;
          font-size: 1rem;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
          background: #fcfdfe;
        }
        .form-group input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
          background: white;
        }
        .form-group input.input-error { border-color: #ef4444; background: #fef2f2; }
        .form-group input.input-disabled { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
        
        .error-text {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #ef4444;
          font-size: 0.75rem;
          font-weight: 600;
          margin: 0;
        }

        /* Divider */
        .section-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1rem 0;
        }
        .line { flex: 1; height: 1px; background: #e2e8f0; }
        .divider-text {
          font-size: 0.75rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Submit Area */
        .submit-area {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }
        .delivery-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #eff6ff;
          color: #2563eb;
          text-decoration: none;
          padding: 0.75rem;
          border-radius: 1rem;
          font-size: 0.9rem;
          font-weight: 700;
          transition: all 0.2s;
        }
        .delivery-link:hover { background: #dbeafe; color: #1d4ed8; text-decoration: underline; }

        .btn-submit {
          background: #1e3a8a;
          color: white;
          border: none;
          padding: 1.25rem;
          border-radius: 1.5rem;
          font-size: 1.2rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 10px 20px -5px rgba(30, 58, 138, 0.3);
        }
        .btn-submit:hover { background: #1e40af; transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(30, 58, 138, 0.4); }
        .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Responsive Mobile Layout */
        @media (max-width: 1024px) {
          .checkout-grid { flex-direction: column; }
          .checkout-col-summary, .checkout-col-form { width: 100%; }
          .summary-card { position: static; margin-bottom: 2rem; }
          .product-details-layout { flex-direction: row; align-items: center; }
          .product-image-box { width: 120px; height: 120px; flex-shrink: 0; }
        }

        @media (max-width: 640px) {
          .checkout-page { padding: 1.5rem 1rem; }
          .form-card { padding: 1.5rem; border-radius: 1.5rem; }
          .form-title { font-size: 1.5rem; margin-bottom: 1.5rem; }
          .form-row { flex-direction: column; gap: 1.5rem; }
          .product-details-layout { flex-direction: column; align-items: flex-start; }
          .product-image-box { width: 100%; aspect-ratio: 16/9; height: auto; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;