export default function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-4 py-9 bg-neutral-400 h-[141px]">
      {children}
    </div>
  );
}
