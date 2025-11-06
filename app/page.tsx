"use client";
// Solar Panel Quotation Chatbot - Main Page
// This page features the WebGL shader from 21st.dev as the primary landing experience
// with a minimal overlay containing Assitech branding and CTA

import { useState } from "react";
import { WebGLShader } from "@/components/ui/web-gl-shader";
import { LandingOverlay } from "@/components/ui/landing-overlay";
import { LoginDialog } from "@/components/LoginDialog";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleCTAClick = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <main className="relative min-h-screen">
      <WebGLShader />
      <LandingOverlay onCTAClick={handleCTAClick} />

      <LoginDialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </main>
  );
}
