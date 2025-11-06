"use client";

interface LandingOverlayProps {
  onCTAClick: () => void;
}

export function LandingOverlay({ onCTAClick }: LandingOverlayProps) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center">
      {/* Main content container - bigger hero section */}
      <div className="text-center space-y-10 max-w-4xl mx-auto px-8">
        {/* Assitech branded headline - bigger */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight font-lora">
            Assitech
          </h1>

          {/* Italian subheader explaining AI Bot scope */}
          <div className="space-y-3">
            <p className="text-2xl md:text-3xl lg:text-4xl text-white/95 font-medium font-lora">
              Energia Solare Intelligente
            </p>
            <p className="text-lg md:text-xl lg:text-2xl text-white/85 font-light font-lora max-w-3xl mx-auto leading-relaxed">
              Il nostro AI Bot ti aiuta a ottenere preventivi personalizzati per
              pannelli solari, calcolando la potenza ideale e i costi per la tua
              casa o azienda
            </p>
          </div>
        </div>

        {/* CTA Button - smaller */}
        <div className="pt-6">
          <button
            onClick={onCTAClick}
            className="group relative overflow-hidden bg-white/10 hover:bg-white/20
                       backdrop-blur-sm border border-white/30 rounded-lg px-6 py-3
                       text-white font-semibold text-base transition-all duration-300
                       hover:scale-105 hover:shadow-lg font-lora"
          >
            <span className="relative z-10">Scopri la nostra AI</span>
            <div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </button>
        </div>

        {/* Optional subtitle for additional context */}
        <div className="pt-4">
          <p className="text-sm md:text-base text-white/60 font-medium tracking-wide uppercase font-lora">
            Preventivi gratuiti • Installazione professionale • Risparmio
            garantito
          </p>
        </div>
      </div>
    </div>
  );
}
