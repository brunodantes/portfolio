import SmoothScroll from "@/components/SmoothScroll";

/** Mundos 3D (rodada 2 de conceitos): cada um é uma página inteira, sem o cabeçalho do site atual. */
export default function WorldsLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SmoothScroll />
      {children}
    </>
  );
}
