export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream/20">
      <div className="space-y-6 text-center">
        {/* Animated logo mark */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-brand-gold/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-brand-gold/40 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-brand-gold/60 animate-pulse" />
        </div>
        <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-brand-gold animate-pulse">
          Kridha Luxe
        </p>
      </div>
    </div>
  );
}
