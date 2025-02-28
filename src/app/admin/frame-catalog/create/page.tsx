import FrameForm from "../_components/FrameForm";

export default function CreateFramePage() {
  return (
    <div className="container mx-auto py-10 px-5 lg:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Frame</h1>
        <p className="text-gray-500">Add a new frame to your catalog</p>
      </div>

      <FrameForm />
    </div>
  );
}
