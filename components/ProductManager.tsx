import React, { useEffect, useState, useRef } from 'react';
import { Product } from '../types';
import { fetchProducts, createProduct, deleteProduct, updateProduct } from '../services/dataService';
import { Trash2, Plus, Loader2, Edit2, Upload, X } from 'lucide-react';

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: 'Main',
    image_url: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  useEffect(() => { loadProducts(); }, []);

  // Handle Image Upload (Convert to Base64 for Mock/Simple usage)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: 'Main', image_url: '' });
    setEditingId(null);
    setIsFormOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEditing = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || ''
    });
    setEditingId(product.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productPayload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: formData.image_url,
        active: true
      };

      if (editingId) {
        // Update existing
        await updateProduct(editingId, productPayload);
      } else {
        // Create new
        await createProduct(productPayload);
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      loadProducts();
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Product Management</h2>
        <button 
          onClick={() => {
            if (isFormOpen) resetForm();
            else setIsFormOpen(true);
          }} 
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isFormOpen 
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isFormOpen ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isFormOpen ? 'Cancel' : 'New Product'}
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="mb-4 pb-2 border-b border-gray-200">
            <h3 className="text-md font-bold text-gray-800">
              {editingId ? 'Edit Product' : 'Create New Product'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input required type="text" className="mt-1 block w-full bg-white text-gray-900 rounded-md border-gray-300 shadow-sm p-2 border focus:ring-orange-500 focus:border-orange-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input required type="number" step="0.01" className="block w-full bg-white text-gray-900 rounded-md border-gray-300 pl-7 p-2 border focus:ring-orange-500 focus:border-orange-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select className="mt-1 block w-full bg-white text-gray-900 rounded-md border-gray-300 shadow-sm p-2 border focus:ring-orange-500 focus:border-orange-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option>Main</option>
                      <option>Burgers</option>
                      <option>Pizza</option>
                      <option>Salads</option>
                      <option>Sides</option>
                      <option>Drinks</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea required rows={3} className="block w-full bg-white text-gray-900 rounded-md border-gray-300 shadow-sm p-2 border focus:ring-orange-500 focus:border-orange-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>

              {/* Right Column: Image */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors relative bg-white">
                  <div className="space-y-1 text-center">
                    {formData.image_url ? (
                      <div className="relative group">
                         <img src={formData.image_url} alt="Preview" className="mx-auto h-48 object-contain rounded-md" />
                         <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <p className="text-white font-medium">Click below to change</p>
                         </div>
                      </div>
                    ) : (
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    
                    <div className="flex text-sm text-gray-600 justify-center mt-4">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                        <span>{formData.image_url ? 'Change Image' : 'Upload a file'}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>
                    {!formData.image_url && <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>}
                  </div>
                </div>
                {formData.image_url && (
                   <div className="flex justify-end">
                      <button type="button" onClick={() => {
                        setFormData(prev => ({ ...prev, image_url: '' }));
                        if(fileInputRef.current) fileInputRef.current.value = '';
                      }} className="text-xs text-red-600 hover:text-red-800">Remove Image</button>
                   </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 gap-3">
              <button type="button" onClick={resetForm} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                     <img src={product.image_url || `https://picsum.photos/seed/${product.id}/100`} alt="" className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => startEditing(product)} 
                      className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 hover:bg-indigo-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)} 
                      className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
           <div className="text-center py-10 text-gray-500">
              No products found. Click "New Product" to add one.
           </div>
        )}
      </div>
    </div>
  );
};