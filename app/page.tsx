"use client";

import { WebGLShader } from "@/components/ui/web-gl-shader";
import { LandingOverlay } from "@/components/ui/landing-overlay";

export default function Home() {
  const handleCTAClick = () => {
    console.log("CTA button clicked");
  };

  return (
    <main className="relative min-h-screen">
      <WebGLShader />
      <LandingOverlay onCTAClick={handleCTAClick} />
    </main>
  );
}
