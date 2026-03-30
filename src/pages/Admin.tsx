import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Edit, Trash2, Box, Layers, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { getProducts, getCategories, addProduct, updateProduct, deleteProduct as dbDeleteProduct, addCategory, deleteCategory as dbDeleteCategory } from '../services/db';
import type { Product, Category } from '../services/db';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // State for forms
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    description: '',
    image: '',
    images: [],
    inStock: true,
    stock: '',
    specifications: '',
    pricingType: 'standard',
    actualPrice: 0,
    discountedPrice: 0
  });
  const [catName, setCatName] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = () => {
    getProducts().then(setProducts);
    getCategories().then(setCategories);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const currentImages = formData.images || [];

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      });

      const newUrls = await Promise.all(uploadPromises);
      const updatedImages = [...currentImages, ...newUrls];

      setFormData(prev => ({
        ...prev,
        images: updatedImages,
        image: prev.image || updatedImages[0]
      }));
    } catch (err: any) {
      console.error("Detailed Upload Error:", err);
      let errorMsg = "Failed to upload images.";
      if (err.message?.includes('CORS') || err.code === 'storage/unauthorized') {
        errorMsg += " This is likely a Firebase CORS or Permission issue. Please check your Firebase Storage rules."
      } else {
        errorMsg += " Please check your internet connection."
      }
      alert(errorMsg);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => {
      const updatedImages = (prev.images || []).filter((_, index) => index !== indexToRemove);
      return {
        ...prev,
        images: updatedImages,
        image: prev.image === (prev.images || [])[indexToRemove]
          ? (updatedImages.length > 0 ? updatedImages[0] : '')
          : prev.image
      };
    });
  };

  const addExternalUrl = () => {
    if (!tempUrl.trim()) return;
    const currentImages = formData.images || [];
    setFormData(prev => ({
      ...prev,
      images: [...currentImages, tempUrl.trim()],
      image: prev.image || tempUrl.trim() // Set primary if empty
    }));
    setTempUrl('');
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;

    try {
      console.log("Submitting Product. isEditing:", isEditing, "ID:", formData.id);
      if (isEditing && formData.id) {
        const { id, ...dataToSave } = formData;
        await updateProduct(id!, dataToSave);
        console.log("Update successful");
      } else {
        const { id, ...dataToSave } = formData;
        await addProduct(dataToSave as Omit<Product, 'id'>);
        console.log("Add successful");
      }

      fetchData();
      setFormData({ name: '', category: '', price: 0, description: '', image: '', images: [], inStock: true, stock: '', specifications: '', actualPrice: 0, discountedPrice: 0 });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving product", err);
      alert("Failed to save product. Please try again.");
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dbDeleteProduct(id);
        fetchData();
      } catch (err) {
        console.error("Error deleting product", err);
        alert("Failed to delete product.");
      }
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory(catName).then(() => {
      fetchData();
      setCatName('');
    });
  };

  const deleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dbDeleteCategory(id).then(fetchData);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="section container animate-fade-in" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      <div className="flex-between mb-8" style={{ marginBottom: '2rem' }}>
        <h1 className="heading-lg flex-center" style={{ gap: '1rem' }}><Box size={32} /> Admin Dashboard</h1>
      </div>

      <div className="flex mb-8" style={{ gap: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('products')} className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}><Box size={20} /> Manage Products</button>
        <button onClick={() => setActiveTab('categories')} className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}><Layers size={20} /> Manage Categories</button>
      </div>

      {activeTab === 'products' && (
        <div className="flex flex-col animate-fade-in" style={{ gap: '2rem' }}>
          {/* Product List Table (TOP) */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Image</th>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '0.5rem 1rem' }}>Price</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Stock</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found. Add one below!</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem' }}>
                        <img
                          src={p.image || (p.images && p.images[0]) || '/logo.png'}
                          alt={p.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.25rem', background: '#f1f5f9' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                        />
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 500, minWidth: '200px' }}>{p.name}</td>
                      <td style={{ padding: '0.5rem 1rem' }}>
                        <div>₹{p.price}</div>
                        {p.pricingType && p.pricingType !== 'standard' && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                            {p.pricingType}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}><span className="badge">{p.category}</span></td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          className="badge"
                          style={{ background: p.inStock ? 'var(--color-success)' : '#EF4444', color: 'white', border: 'none' }}
                        >
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="btn" style={{ padding: '0.5rem', color: '#3B82F6', background: 'transparent' }} onClick={() => { setIsEditing(true); setFormData(p); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}><Edit size={20} /></button>
                        <button className="btn" style={{ padding: '0.5rem', color: '#EF4444', background: 'transparent' }} onClick={() => deleteProduct(p.id)}><Trash2 size={20} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Product Form (BOTTOM) */}
          <div className="card glass" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <h3 className="heading-md mb-4" style={{ marginBottom: '1.5rem' }}>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleProductSubmit}>
              <input type="hidden" value={formData.id || ''} />
              <div className="input-group">
                <label className="label">Name</label>
                <input type="text" className="input" value={formData.name || ''} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-1 sm-grid-cols-2" style={{ gap: '1.5rem', display: 'grid' }}>
                <div className="input-group">
                  <label className="label">Category</label>
                  <select className="input" value={formData.category || ''} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="label">Price (₹) <span style={{fontSize: '0.7rem', opacity: 0.7}}>(Main Display Price)</span></label>
                  <input type="number" className="input" value={formData.price || 0} onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))} required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm-grid-cols-2" style={{ gap: '1.5rem', display: 'grid', marginTop: '1rem' }}>
                <div className="input-group">
                  <label className="label">Actual Price (₹) <span style={{fontSize: '0.7rem', opacity: 0.7}}>(Strike-through)</span></label>
                  <input type="number" className="input" value={formData.actualPrice || 0} onChange={e => setFormData(prev => ({ ...prev, actualPrice: Number(e.target.value) }))} />
                </div>
                <div className="input-group">
                  <label className="label">Discounted Price (₹) <span style={{fontSize: '0.7rem', opacity: 0.7}}>(Selling Price)</span></label>
                  <input type="number" className="input" value={formData.discountedPrice || 0} onChange={e => setFormData(prev => ({ ...prev, discountedPrice: Number(e.target.value) }))} />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Stock Information (Optional - e.g. "Only 2 left")</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.stock || ''} 
                  onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))} 
                  placeholder="e.g. only one left in the stock"
                />
              </div>

              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="label">Pricing Visibility on Website</label>
                <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <label className="flex-center" style={{ gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="pricingType" 
                      checked={!formData.pricingType || formData.pricingType === 'standard'} 
                      onChange={() => setFormData(prev => ({ ...prev, pricingType: 'standard' }))}
                    />
                    <span>Standard (Show Price)</span>
                  </label>
                  <label className="flex-center" style={{ gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="pricingType" 
                      checked={formData.pricingType === 'wholesale'} 
                      onChange={() => setFormData(prev => ({ ...prev, pricingType: 'wholesale' }))}
                    />
                    <span>Wholesale Price</span>
                  </label>
                  <label className="flex-center" style={{ gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="pricingType" 
                      checked={formData.pricingType === 'contact'} 
                      onChange={() => setFormData(prev => ({ ...prev, pricingType: 'contact' }))}
                    />
                    <span>Contact for Price</span>
                  </label>
                </div>
              </div>

              <div className="input-group">
                <label className="label">Upload Images (Instant Upload)</label>
                <div className="flex-col" style={{ gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="input"
                      style={{ padding: '0.5rem', opacity: uploading ? 0.6 : 1 }}
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    {uploading && (
                      <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        <Loader2 className="animate-spin" size={18} /> Uploading...
                      </div>
                    )}
                  </div>

                  {/* Uploaded Thumbnails Preview */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="flex" style={{ gap: '0.5rem', flexWrap: 'wrap', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
                      {formData.images.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                          <img src={url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#EF4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-muted text-sm mt-1" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Select one or more images. They will upload immediately.</p>
              </div>

              <div className="input-group">
                <label className="label">Product Availability</label>
                <div className="flex" style={{ gap: '1rem' }}>
                  <button
                    type="button"
                    className={`btn ${formData.inStock ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFormData(prev => ({ ...prev, inStock: true }))}
                    style={{ flex: 1, gap: '0.4rem', padding: '0.6rem' }}
                  >
                    <Check size={18} /> In Stock
                  </button>
                  <button
                    type="button"
                    className={`btn ${!formData.inStock ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, gap: '0.4rem', padding: '0.6rem', ...(!formData.inStock ? { background: '#EF4444', borderColor: '#EF4444' } : { color: '#EF4444', borderColor: '#EF4444' }) }}
                    onClick={() => setFormData(prev => ({ ...prev, inStock: false }))}
                  >
                    <AlertCircle size={18} /> Out of Stock
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="label">Image URL (Manual Link)</label>
                <div className="flex" style={{ gap: '0.5rem' }}>
                  <input
                    type="url"
                    className="input"
                    placeholder="Paste image URL here..."
                    value={tempUrl}
                    onChange={e => setTempUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExternalUrl(); } }}
                  />
                  <button
                    type="button"
                    onClick={addExternalUrl}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                    title="Add Image URL"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Primary Image (Selected URL will also be added to gallery):</p>
                <input
                  type="url"
                  className="input"
                  style={{ marginTop: '0.25rem' }}
                  value={formData.image || ''}
                  onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="Main featured image URL"
                />
              </div>

              <div className="input-group">
                <label className="label">Specifications (Rich Text)</label>
                <div className="card" style={{ background: 'white' }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.specifications || ''}
                    onChange={val => setFormData(prev => ({ ...prev, specifications: val }))}
                    placeholder="Enter detailed specifications (Dimensions, Weight, Material...)"
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label className="label">Rich Description</label>
                <div className="card" style={{ background: 'white' }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.description || ''}
                    onChange={val => setFormData(prev => ({ ...prev, description: val }))}
                    placeholder="Describe the product in detail..."
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '2rem' }}>
                <label className="label">Product Promises (Trust Badges)</label>
                <div className="grid grid-cols-1 sm-grid-cols-2 lg-grid-cols-3 gap-4" style={{ display: 'grid', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={formData.promises?.genuine !== false} 
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        promises: { ...(prev.promises || { genuine: true, delivery: true, warranty: true }), genuine: e.target.checked } 
                      }))}
                    />
                    <span className="text-sm font-semibold text-gray-700">Genuine Product</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={formData.promises?.delivery !== false} 
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        promises: { ...(prev.promises || { genuine: true, delivery: true, warranty: true }), delivery: e.target.checked } 
                      }))}
                    />
                    <span className="text-sm font-semibold text-gray-700">Delivery Available</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={formData.promises?.warranty !== false} 
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        promises: { ...(prev.promises || { genuine: true, delivery: true, warranty: true }), warranty: e.target.checked } 
                      }))}
                    />
                    <span className="text-sm font-semibold text-gray-700">Warranty Support</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={!!formData.promises?.steel} 
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        promises: { ...(prev.promises || { genuine: true, delivery: true, warranty: true }), steel: e.target.checked } 
                      }))}
                    />
                    <span className="text-sm font-semibold text-gray-700">Stainless Steel</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={!!formData.promises?.guaranty} 
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        promises: { ...(prev.promises || { genuine: true, delivery: true, warranty: true }), guaranty: e.target.checked } 
                      }))}
                    />
                    <span className="text-sm font-semibold text-gray-700">Guaranty Support</span>
                  </label>
                </div>
              </div>

              <div className="flex" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary flex-center" disabled={uploading} style={{ flexGrow: 1, gap: '0.5rem', padding: '1rem' }}>
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
                  {uploading ? 'Processing...' : (isEditing ? 'Update Product Details' : 'Add New Product')}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    disabled={uploading} 
                    onClick={() => { 
                      setIsEditing(false); 
                      setFormData({ name: '', category: '', price: 0, description: '', image: '', images: [], inStock: true, stock: '', specifications: '', pricingType: 'standard', actualPrice: 0, discountedPrice: 0, promises: { genuine: true, delivery: true, warranty: true } }); 
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md-grid-cols-2" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', display: 'grid' }}>
          {/* Category Form */}
          <div className="card glass" style={{ padding: '2rem' }}>
            <h3 className="heading-md mb-4" style={{ marginBottom: '1.5rem' }}>Add New Category</h3>
            <form onSubmit={handleCategorySubmit}>
              <div className="input-group">
                <label className="label">Category Name</label>
                <input type="text" className="input" value={catName} onChange={e => setCatName(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><PlusCircle size={20} /> Add Category</button>
            </form>
          </div>

          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>ID</th>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>{c.id}</td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button className="btn" style={{ padding: '0.5rem', color: '#EF4444', background: 'transparent' }} onClick={() => deleteCategory(c.id)}><Trash2 size={20} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
