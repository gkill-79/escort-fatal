import { Header } from "@/components/layouts/Header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-[96px]">
      <Header />
      {children}
    </div>
  );
}
