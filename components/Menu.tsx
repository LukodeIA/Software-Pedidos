import React, { useEffect, useState } from 'react';
import { Product, CartItem } from '../types';
import { fetchProducts } from '../services/dataService';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../services/formatters';

interface MenuProps {
  addToCart: (product: Product) => void;
}

export const Menu: React.FC<MenuProps> = ({ addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        const cats = Array.from(new Set(data.map(p => p.category)));
        setCategories(['Todos', ...cats]);
      } catch (err: any) {
        console.error("Failed to load products:", err);
        setError(err.message || JSON.stringify(err));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = activeCategory === 'Todos'
    ? products
    : products.filter(p => p.category === activeCategory);

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Cargando menú...</div>;
  }

  if (error) {
    return (
      <div className="p-12 text-center text-red-500">
        <p>Error al cargar el menú.</p>
        <p className="text-sm text-gray-400 mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Fresco y Local
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Pide comida deliciosa directamente para tu mesa.
        </p>
      </div>

      {/* Category Filter */}
      {products.length > 0 && (
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 justify-center no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-w-3 aspect-h-2 bg-gray-200 group-hover:opacity-75 relative h-48 w-full overflow-hidden">
              <img
                src={product.image_url || `https://picsum.photos/400/300?seed=${product.id}`}
                alt={product.name}
                className="w-full h-full object-center object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                    {product.description}
                  </p>
                </div>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(product.price)}</p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No se encontraron productos en la base de datos.
        </div>
      )}
    </div>
  );
};