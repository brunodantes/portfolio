import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CodeBackdrop from "@/components/CodeBackdrop";
import CursorHalo from "@/components/CursorHalo";
import SmoothScroll from "@/components/SmoothScroll";

/** Site atual (HUD 2D e as prévias da primeira rodada em /conceitos). */
export default function ClassicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <CodeBackdrop />
      <CursorHalo />
      <SmoothScroll />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
