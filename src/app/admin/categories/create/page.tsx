import CategoryForm from "../_components/CategoryForm";

export default function CreateCategoryPage() {
  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Category</h1>
        <p className="text-gray-500">Add a new category for your frames</p>
      </div>

      <div className="max-w-xl">
        <CategoryForm />
      </div>
    </div>
  );
}
