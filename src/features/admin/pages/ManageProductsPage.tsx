import { useState } from 'react';
import { PackagePlus, PlusCircle } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeading } from '@/components/ui/PageHeading';
import { useDeleteProduct, useProducts, useSaveProduct, type Product } from '@/features/products';
import { getErrorMessage } from '@/lib/httpClient';
import { AdminProductsTable } from '../components/AdminProductsTable';
import { ProductForm } from '../components/ProductForm';

/** `null` = form closed, `'new'` = creating, Product = editing that product. */
type EditorState = null | 'new' | Product;

export default function ManageProductsPage() {
  const productsQuery = useProducts();
  const saveProduct = useSaveProduct();
  const deleteProduct = useDeleteProduct();

  const [editor, setEditor] = useState<EditorState>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const openEditor = (next: EditorState) => {
    saveProduct.reset();
    setStatusMessage('');
    setEditor(next);
  };

  const editingProduct = editor !== null && editor !== 'new' ? editor : undefined;

  const renderTable = () => {
    if (productsQuery.isPending) return <LoadingState label="Loading products…" />;
    if (productsQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(productsQuery.error)}
          onRetry={() => productsQuery.refetch()}
        />
      );
    }
    if (productsQuery.data.length === 0) {
      return (
        <EmptyState
          icon={<PackagePlus size={28} aria-hidden />}
          title="No products yet. Add your first one."
        />
      );
    }
    return (
      <AdminProductsTable
        products={productsQuery.data}
        onEdit={(product) => {
          openEditor(product);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDelete={setProductToDelete}
      />
    );
  };

  return (
    <div className="container pt-8 sm:pt-10">
      <PageHeading>Manage products</PageHeading>

      {statusMessage && (
        <Alert variant="success" className="mb-6">
          {statusMessage}
        </Alert>
      )}
      {deleteProduct.isError && (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(deleteProduct.error, 'Failed to delete product.')}
        </Alert>
      )}

      {editor === null ? (
        <div className="mb-8 flex justify-end">
          <Button onClick={() => openEditor('new')} icon={<PlusCircle size={18} aria-hidden />}>
            Add product
          </Button>
        </div>
      ) : (
        <Card className="mb-10">
          <ProductForm
            // Remount per product so the form resets its defaults.
            key={editingProduct?._id ?? 'new'}
            product={editingProduct}
            isSaving={saveProduct.isPending}
            submitError={saveProduct.isError ? getErrorMessage(saveProduct.error) : undefined}
            onCancel={() => setEditor(null)}
            onSubmit={(input) =>
              saveProduct.mutate(
                { product: editingProduct, input },
                {
                  onSuccess: () => {
                    setEditor(null);
                    setStatusMessage(editingProduct ? 'Product updated.' : 'Product added.');
                  },
                },
              )
            }
          />
        </Card>
      )}

      <h2 className="mb-4 text-lg font-semibold text-ink">All products</h2>
      {renderTable()}

      <ConfirmDialog
        isOpen={productToDelete !== null}
        title="Delete product?"
        description={`"${productToDelete?.name ?? ''}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isConfirming={deleteProduct.isPending}
        onCancel={() => setProductToDelete(null)}
        onConfirm={() => {
          if (!productToDelete) return;
          setStatusMessage('');
          deleteProduct.mutate(productToDelete._id, {
            onSuccess: () => setStatusMessage('Product deleted.'),
            onSettled: () => setProductToDelete(null),
          });
        }}
      />
    </div>
  );
}
