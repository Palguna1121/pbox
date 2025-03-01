import StickerForm from "../_components/StickerForm";

export default function CreateStickerPage() {
  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Sticker</h1>
        <p className="text-gray-500">Add a new sticker to your catalog</p>
      </div>

      <StickerForm />
    </div>
  );
}
