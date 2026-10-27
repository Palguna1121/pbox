import FrameForm from "../_components/FrameForm";

export default function CreateFramePage() {
  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Tambah frame</h1>
        <p className="text-muted-foreground">Tambahkan frame baru ke katalog.</p>
      </div>

      <FrameForm />
    </div>
  );
}
