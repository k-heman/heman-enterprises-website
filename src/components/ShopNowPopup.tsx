import React, { useState } from 'react';
import { X, User, Phone, MapPin, Package, Send, AlertCircle } from 'lucide-react';
import { addOrder } from '../services/db';
import type { Product } from '../services/db';
import { useAuth } from '../context/AuthContext';

interface ShopNowPopupProps {
  product: Product;
  onClose: () => void;
}

const ShopNowPopup: React.FC<ShopNowPopupProps> = ({ product, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    village: '',
    mandal: '',
    district: 'Peddapalli', // Default based on business context
    state: 'Telangana',
    pincode: '',
    quantity: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
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

      // 1. Store in Database
      await addOrder(orderData as any);

      // 2. Redirect to WhatsApp
      const phoneNumber = "919014627762";
      const message = `Hi Mr. John, \n I am ${formData.fullName}, I want to order ${formData.quantity}, ${product.name}\n Accept my order and share the aviablity and total price.`;

      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');

      onClose();
    } catch (error) {
      console.error("Order submission failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="card w-full max-w-lg relative bg-white shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="bg-primary p-6 text-white flex-between">
          <div className="flex items-center gap-3">
            <Package size={24} />
            <div>
              <h3 className="text-xl font-bold">Shop Now</h3>
              <p className="text-xs opacity-80 uppercase tracking-widest">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="form-label flex items-center gap-2"><User size={16} /> Full Name</label>
              <input
                type="text"
                className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.fullName}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="form-label flex items-center gap-2"><Phone size={16} /> Mobile Number</label>
              <input
                type="tel"
                maxLength={10}
                className={`form-input ${errors.mobile ? 'border-red-500' : ''}`}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                placeholder="10-digit number"
              />
              {errors.mobile && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.mobile}</p>}
            </div>

            {/* Quantity */}
            <div>
              <label className="form-label flex items-center gap-2"><Package size={16} /> Quantity</label>
              <input
                type="number"
                min="1"
                className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
              {errors.quantity && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.quantity}</p>}
            </div>

            <div className="md:col-span-2 divider bg-gray-100 h-[1px] my-2"></div>
            <p className="md:col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} /> Delivery Address
            </p>

            {/* Village */}
            <div>
              <label className="form-label">Village</label>
              <input
                type="text"
                className={`form-input ${errors.village ? 'border-red-500' : ''}`}
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="Village name"
              />
            </div>

            {/* Mandal */}
            <div>
              <label className="form-label">Mandal</label>
              <input
                type="text"
                className={`form-input ${errors.mandal ? 'border-red-500' : ''}`}
                value={formData.mandal}
                onChange={(e) => setFormData({ ...formData, mandal: e.target.value })}
                placeholder="Mandal name"
              />
            </div>

            {/* District */}
            <div>
              <label className="form-label">District</label>
              <input
                type="text"
                className="form-input bg-gray-50 mb-2"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </div>

            {/* State */}
            <div>
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input bg-gray-50 mb-2"
                value={formData.state}
                readOnly
              />
            </div>

            {/* PIN Code */}
            <div className="md:col-span-2">
              <label className="form-label">PIN Code</label>
              <input
                type="text"
                maxLength={6}
                className={`form-input ${errors.pincode ? 'border-red-500' : ''}`}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                placeholder="6-digit pincode"
              />
              {errors.pincode && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.pincode}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full mt-8 py-4 text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">Processing...</span>
            ) : (
              <>Submit Order <Send size={20} /></>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .form-label { font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.4rem; display: block; }
        .form-input { 
          width: 100%; 
          padding: 0.8rem 1rem; 
          border: 1px solid #E2E8F0; 
          border-radius: 0.75rem; 
          outline: none; 
          transition: all 0.2s;
          font-size: 0.95rem;
        }
        .form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1); }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ShopNowPopup;
