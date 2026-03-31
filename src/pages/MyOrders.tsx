import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrdersByUserId, updateOrder } from '../services/db';
import type { Order } from '../services/db';
import { Package, Clock, ShoppingBag, Calendar, XCircle } from 'lucide-react';

const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelReason, setShowCancelReason] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      if (user) {
        const data = await getOrdersByUserId(user.id);
        const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(sorted);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (id: string) => {
    if (showCancelReason === id) {
      setShowCancelReason(null);
      setCancelReason('');
    } else {
      setShowCancelReason(id);
    }
  };

  const submitCancellation = async (order: Order) => {
    if (!cancelReason.trim()) {
      alert("Please enter a required reason for cancellation before submitting.");
      return;
    }

    setCancellingId(order.id);
    try {
      // Update DB status
      await updateOrder(order.id, {
        status: 'cancelled',
        cancelReason: cancelReason,
        cancelledBy: 'user'
      });

      // Update local state
      setOrders(prev => prev.map(o =>
        o.id === order.id ? { ...o, status: 'cancelled', cancelReason: cancelReason, cancelledBy: 'user' } : o
      ));

      // WhatsApp Message logic
      const phoneNumber = "919014627762";
      const userName = user?.name || user?.username || "Customer";
      const message = `Hello, \n I am ${userName}, I am cancelling my order of the product ${order.productName}. \n Reason of cancelling: ${cancelReason}`;

      // Clean up states
      setShowCancelReason(null);
      setCancelReason('');

      // Open WhatsApp
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');

    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  // Pure CSS Color Mapping for Status
  const getStatusStyle = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'confirmed': return { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' };
      case 'accepted':
      case 'available': return { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' };
      case 'not available': return { bg: '#fff1f2', text: '#e11d48', border: '#ffe4e6' };
      case 'shipping': return { bg: '#faf5ff', text: '#9333ea', border: '#f3e8ff' };
      case 'ready for delivery': return { bg: '#eef2ff', text: '#4f46e5', border: '#e0e7ff' };
      case 'delivered': return { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' };
      case 'cancelled': return { bg: '#fef2f2', text: '#dc2626', border: '#fee2e2' };
      default: return { bg: '#fff7ed', text: '#ea580c', border: '#ffedd5' }; // Pending
    }
  };

  const getDeliveryStatusStyle = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'available': return { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' };
      case 'shipping': return { bg: '#faf5ff', text: '#9333ea', border: '#f3e8ff' };
      case 'delivered': return { bg: '#f0fdf4', text: '#16a34a', border: '#dcfce7' };
      case 'not available': return { bg: '#fff1f2', text: '#e11d48', border: '#ffe4e6' };
      case 'ready for delivery': return { bg: '#eef2ff', text: '#4f46e5', border: '#e0e7ff' };
      default: return { bg: '#f8fafc', text: '#64748b', border: '#f1f5f9' }; // Processing
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="container-max">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            <ShoppingBag size={36} color="#1e3a8a" /> My Orders
          </h1>
          <p className="page-subtitle">Detailed history and tracking of your purchase requests.</p>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="empty-state">
            <Package size={72} color="#cbd5e1" className="empty-icon" />
            <h2>No orders yet</h2>
            <p>Your purchase history is empty. Start browsing our premium collection to place your first order.</p>
            <button onClick={() => window.location.href = '/products'} className="browse-btn">
              Browse Products
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">

                <div className="card-main-row">
                  {/* Column 1: Product */}
                  <div className="col-product">
                    <div className="img-box">
                      <img
                        src={order.productImage || '/logo.png'}
                        alt={order.productName}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                      />
                    </div>
                    <div className="product-text">
                      <h3>{order.productName || 'Unknown Product'}</h3>
                      <div className="order-date">
                        <Clock size={16} />
                        <span>Ordered on {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown Date'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Status */}
                  <div className="col-status">
                    {order.status === 'cancelled' ? (
                      <div className="cancelled-alert">
                        <XCircle size={32} />
                        <div>
                          <h4>Order Cancelled</h4>
                          <p>No further action needed</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="status-block">
                          <label>Order Status</label>
                          <div
                            className="badge"
                            style={{
                              backgroundColor: getStatusStyle(order.status).bg,
                              color: getStatusStyle(order.status).text,
                              borderColor: getStatusStyle(order.status).border
                            }}
                          >
                            <span style={{ textTransform: 'capitalize' }}>
                              {order.status === 'available' ? 'Accepted' : (order.status || 'Pending')}
                            </span>
                          </div>
                        </div>

                        <div className="status-block">
                          <label>Delivery Info</label>
                          <div className="delivery-stack">
                            <div
                              className="badge-small"
                              style={{
                                backgroundColor: getDeliveryStatusStyle(order.deliveryStatus).bg,
                                color: getDeliveryStatusStyle(order.deliveryStatus).text,
                                borderColor: getDeliveryStatusStyle(order.deliveryStatus).border
                              }}
                            >
                              <span style={{ textTransform: 'capitalize' }}>{order.deliveryStatus || 'Processing'}</span>
                            </div>

                            {order.deliveryDate && order.deliveryStatus !== 'not available' && (
                              <div className="expected-date">
                                <Calendar size={15} color="#1e3a8a" />
                                <span>Delivery Date: {new Date(order.deliveryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Column 3: Action */}
                  <div className="col-action">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className={`btn-cancel-trigger ${showCancelReason === order.id ? 'active' : ''}`}
                      >
                        <XCircle size={24} />
                        <span>{showCancelReason === order.id ? 'Close' : 'Cancel Order'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Cancel Reason Section (Hidden by default) */}
                {showCancelReason === order.id && (
                  <div className="cancel-reason-section">
                    <label>Reason for cancelling the order <span style={{ color: 'red' }}>*</span></label>
                    <textarea
                      placeholder="Please tell us why you are cancelling (Required)..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                      required
                    />
                    <button
                      onClick={() => submitCancellation(order)}
                      disabled={cancellingId === order.id || !cancelReason.trim()}
                      className="btn-submit-cancel"
                    >
                      {cancellingId === order.id ? 'Processing...' : 'Submit'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PURE CSS STYLES */}
      <style>{`
        .my-orders-page {
          background-color: #f8fafc;
          min-height: 100vh;
          padding: 4rem 1.5rem;
          font-family: system-ui, -apple-system, sans-serif;
          color: #1e293b;
        }

        .container-max {
          max-width: 1000px;
          margin: 0 auto;
        }

        .loading-container {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #64748b;
        }

        /* Header */
        .page-header {
          margin-bottom: 3rem;
          text-align: left;
        }
        .page-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: #1e3a8a;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 0 0 0.5rem 0;
        }
        .page-subtitle {
          font-size: 1.1rem;
          color: #64748b;
          margin: 0;
        }

        /* Empty State */
        .empty-state {
          background: white;
          border-radius: 2rem;
          padding: 5rem 2rem;
          text-align: center;
          border: 2px dashed #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .empty-state h2 { font-size: 1.8rem; margin: 0; color: #475569; }
        .empty-state p { max-width: 400px; color: #94a3b8; line-height: 1.6; margin-bottom: 1.5rem; }
        .browse-btn {
          background-color: #1e3a8a;
          color: white;
          padding: 1rem 2.5rem;
          border-radius: 1rem;
          border: none;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .browse-btn:hover { background-color: #1e40af; }

        /* Order Cards */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .order-card {
          background: white;
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .order-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.08);
        }

        /* Card Desktop Layout */
        .card-main-row {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        /* Column 1: Product */
        .col-product {
          flex: 2;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .img-box {
          width: 110px;
          height: 110px;
          background: #f8fafc;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .img-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .product-text h3 {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          color: #0f172a;
        }
        .order-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 600;
        }

        /* Column 2: Status */
        .col-status {
          flex: 1.5;
          display: flex;
          gap: 2rem;
        }
        .status-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .status-block label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          font-weight: 800;
          color: #94a3b8;
        }
        .badge {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 700;
          font-size: 0.95rem;
          border: 1.5px solid;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          width: max-content;
        }
        .delivery-stack {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .badge-small {
          padding: 0.3rem 0.8rem;
          border-radius: 0.5rem;
          font-weight: 700;
          font-size: 0.8rem;
          border: 1px solid;
          width: max-content;
        }
        .expected-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          background: #f8fafc;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          width: max-content;
        }

        /* Cancelled Alert Box */
        .cancelled-alert {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          color: #dc2626;
          width: 100%;
        }
        .cancelled-alert h4 { margin: 0; font-weight: 800; font-size: 1.1rem; }
        .cancelled-alert p { margin: 0; font-size: 0.8rem; opacity: 0.8; font-weight: 600; text-transform: uppercase; }

        /* Column 3: Action */
        .col-action {
          flex: 0.5;
          display: flex;
          justify-content: flex-end;
          border-left: 1px solid #f1f5f9;
          padding-left: 1.5rem;
        }
        .btn-cancel-trigger {
          background: white;
          color: #ef4444;
          border: 1.5px solid #fee2e2;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .btn-cancel-trigger:hover, .btn-cancel-trigger.active {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        /* Cancel Reason Form */
        .cancel-reason-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px dashed #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        .cancel-reason-section label {
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #475569;
          letter-spacing: 0.05em;
        }
        .cancel-reason-section textarea {
          width: 100%;
          padding: 1rem;
          border-radius: 1rem;
          border: 2px solid #e2e8f0;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }
        .cancel-reason-section textarea:focus {
          border-color: #ef4444;
        }
        .btn-submit-cancel {
          background: #ef4444;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 1rem;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          width: fit-content;
          align-self: flex-start;
          transition: background 0.2s;
        }
        .btn-submit-cancel:hover { background: #dc2626; }
        .btn-submit-cancel:disabled { background: #fca5a5; cursor: not-allowed; }

        /* Mobile Responsiveness */
        @media (max-width: 900px) {
          .col-status {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .my-orders-page {
            padding: 2rem 1rem;
          }
          .page-header { text-align: center; }
          .page-title { justify-content: center; font-size: 1.8rem; }
          .card-main-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .col-product, .col-status, .col-action {
            width: 100%;
          }
          .col-status {
            flex-direction: row;
            justify-content: space-between;
          }
          .col-action {
            border-left: none;
            padding-left: 0;
            border-top: 1px solid #f1f5f9;
            padding-top: 1.5rem;
            justify-content: stretch;
          }
          .btn-cancel-trigger {
            width: 100%;
            flex-direction: row;
            justify-content: center;
          }
          .btn-submit-cancel {
            width: 100%;
            align-self: stretch;
          }
        }

        @media (max-width: 480px) {
          .col-status {
            flex-direction: column;
          }
          .img-box {
            width: 80px;
            height: 80px;
          }
          .product-text h3 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;