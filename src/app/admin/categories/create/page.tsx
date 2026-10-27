import CategoryForm from "../_components/CategoryForm";

export default function CreateCategoryPage() {
  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Tambah kategori</h1>
        <p className="text-muted-foreground">Kategori mengelompokkan frame dan stiker.</p>
      </div>

      <div className="max-w-xl">
        <CategoryForm />
      </div>
    </div>
  );
}
