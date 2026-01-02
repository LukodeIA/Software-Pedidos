import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { fetchProducts, createProduct, deleteProduct } from '../services/dataService';
import { generateProductDescription } from '../services/geminiService';
import { Trash2, Sparkles, Plus, Loader2 } from 'lucide-react';

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Form State
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: 'Main' });

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleGenerateDescription = async () => {
    if (!newProduct.name) return;
    setGeneratingAI(true);
    const desc = await generateProductDescription(newProduct.name, newProduct.category);
    setNewProduct(prev => ({ ...prev, description: desc }));
    setGeneratingAI(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        active: true
      });
      setIsCreating(false);
      setNewProduct({ name: '', description: '', price: '', category: 'Main' });
      await loadProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure?')) {
      await deleteProduct(id);
      loadProducts();
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Product Management</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)} 
          className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? 'Cancel' : 'New Product'}
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input required type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              </div>
            </div>
            
             <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                  <option>Main</option>
                  <option>Burgers</option>
                  <option>Pizza</option>
                  <option>Salads</option>
                  <option>Sides</option>
                  <option>Drinks</option>
                </select>
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex justify-between">
                <span>Description</span>
                <button type="button" onClick={handleGenerateDescription} className="text-orange-600 text-xs flex items-center hover:underline disabled:opacity-50" disabled={generatingAI || !newProduct.name}>
                  {generatingAI ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Sparkles className="w-3 h-3 mr-1" />}
                  Generate with AI
                </button>
              </label>
              <textarea required rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};