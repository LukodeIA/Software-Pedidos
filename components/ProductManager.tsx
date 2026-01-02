import React, { useEffect, useState, useRef } from 'react';
import { Product } from '../types';
import { fetchProducts, createProduct, deleteProduct, updateProduct, uploadProductImage } from '../services/dataService';
import { generateProductDescription } from '../services/geminiService';
import { Trash2, Sparkles, Plus, Loader2, Edit, Upload, X } from 'lucide-react';

export const ProductManager: React.FC = () => {
  const [productos, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const initialFormState = { name: '', description: '', price: '', category: 'Main', image_url: '' };
  const [formData, setFormData] = useState(initialFormState);

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleGenerateDescription = async () => {
    if (!formData.name) return;
    setGeneratingAI(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setGeneratingAI(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploadingImage(true);

    const url = await uploadProductImage(file);
    if (url) {
      setFormData(prev => ({ ...prev, image_url: url }));
    } else {
      alert('Error: No se pudo subir la imagen. Verifica que el Bucket "Productos" sea Público en Supabase y tenga las políticas de acceso correctas.');
    }
    setUploadingImage(false);
  };

  const handleEditClick = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || ''
    });
    setEditingId(product.id);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        active: true
      };

      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await createProduct(productData);
      }

      handleCancel(); // Reset form
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      loadProducts();
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Gestión de Productos</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </button>
        )}
      </div>

      {isEditing && (
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm relative">
          <button onClick={handleCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-base font-semibold text-gray-800 mb-4">
            {editingId ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-orange-500 focus:ring-orange-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
                <input required type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-orange-500 focus:ring-orange-500" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-orange-500 focus:ring-orange-500" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option>Principal</option>
                <option>Hamburguesas</option>
                <option>Pizza</option>
                <option>Ensaladas</option>
                <option>Acompañamientos</option>
                <option>Bebidas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
              <div className="flex items-center space-x-4">
                {formData.image_url && (
                  <img src={formData.image_url} alt="Vista previa" className="h-16 w-16 object-cover rounded-md border border-gray-200" />
                )}
                <label className="cursor-pointer flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {uploadingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex justify-between">
                <span>Descripción</span>
                <button type="button" onClick={handleGenerateDescription} className="text-orange-600 text-xs flex items-center hover:underline disabled:opacity-50" disabled={generatingAI || !formData.name}>
                  {generatingAI ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                  Generar con IA
                </button>
              </label>
              <textarea required rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-orange-500 focus:ring-orange-500" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" disabled={loading || uploadingImage} className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50">
                {loading ? 'Guardando...' : (editingId ? 'Actualizar Producto' : 'Crear Producto')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {product.image_url ? (
                        <img className="h-10 w-10 rounded-full object-cover" src={product.image_url} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <span className="text-xs">Sin Foto</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-900 mr-4" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900" title="Eliminar">
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