import { Pencil, Trash2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import type { Product } from '@/features/products';
import { formatCurrency } from '@/utils/formatCurrency';

type AdminProductsTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const headerCell = 'px-4 py-2.5 text-left text-xs font-medium text-graphite';

export function AdminProductsTable({ products, onEdit, onDelete }: AdminProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[720px] divide-y divide-line text-sm">
        <thead className="bg-mist">
          <tr>
            <th scope="col" className={headerCell}>
              <span className="sr-only">Image</span>
            </th>
            <th scope="col" className={headerCell}>
              Name
            </th>
            <th scope="col" className={headerCell}>
              Category
            </th>
            <th scope="col" className={headerCell}>
              Price
            </th>
            <th scope="col" className={headerCell}>
              Stock
            </th>
            <th scope="col" className={`${headerCell} text-right`}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-mist/60">
              <td className="px-4 py-2">
                <ImageWithFallback
                  src={product.imageUrl}
                  alt=""
                  className="h-12 w-12 rounded-md object-cover"
                />
              </td>
              <td className="px-4 py-2 font-medium text-ink">{product.name}</td>
              <td className="px-4 py-2 text-graphite">{product.category}</td>
              <td className="whitespace-nowrap px-4 py-2">{formatCurrency(product.price)}</td>
              <td
                className={`px-4 py-2 ${product.countInStock === 0 ? 'font-semibold text-red-600' : ''}`}
              >
                {product.countInStock === 0 ? 'Out of stock' : product.countInStock}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="rounded-full p-2 text-ink hover:bg-brand-50"
                  aria-label={`Edit ${product.name}`}
                >
                  <Pencil size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className="rounded-full p-2 text-red-600 hover:bg-red-50"
                  aria-label={`Delete ${product.name}`}
                >
                  <Trash2 size={18} aria-hidden />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
