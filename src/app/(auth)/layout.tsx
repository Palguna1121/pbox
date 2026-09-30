export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
