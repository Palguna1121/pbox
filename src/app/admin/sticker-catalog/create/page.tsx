import StickerForm from "../_components/StickerForm";

export default function CreateStickerPage() {
  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Tambah stiker</h1>
        <p className="text-muted-foreground">Tambahkan stiker baru ke katalog.</p>
      </div>

      <StickerForm />
    </div>
  );
}
