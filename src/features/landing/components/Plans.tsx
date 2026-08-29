import { Check, MessageCircle } from "lucide-react";
import { useStore, fmtMoney } from "../../admin/store";

export function Plans() {
  const { store } = useStore();

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hola! Me interesa saber más sobre Team Rayo");
    window.open(`https://wa.me/5491157234518?text=${message}`, "_blank");
  };

  const planes = [...store.planes].sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'recreativo' ? -1 : 1));

  return (
    <section id="plans" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-foreground mb-4 tracking-tight">
          Elegí tu <span className="text-pulso-indigo">plan</span>
        </h2>
        <p className="text-center text-muted-foreground mb-16 text-lg">
          Dos opciones pensadas para diferentes objetivos
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={
                plan.destacado
                  ? "bg-gradient-to-br from-pulso-indigo/10 to-pulso-red/10 rounded-2xl p-8 border-2 border-pulso-indigo relative overflow-hidden shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]"
                  : "bg-card rounded-2xl p-8 border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)] hover:shadow-[0_16px_40px_-18px_rgba(0,0,0,.65)] transition-all"
              }
            >
              <div className="mb-6">
                <h3 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">{plan.nombre}</h3>
                <p className="text-muted-foreground">{plan.descripcion}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-5xl font-extrabold tracking-tight ${plan.destacado ? 'text-pulso-indigo' : 'text-pulso-red'}`}>
                    {fmtMoney(plan.precio)}
                  </span>
                  <span className="text-muted-foreground">/ mes</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.beneficios.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-pulso-indigo mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleWhatsAppClick}
                className={
                  plan.destacado
                    ? "w-full flex items-center justify-center gap-2 bg-pulso-indigo text-foreground px-6 py-3 rounded-xl font-bold hover:bg-pulso-indigo/80 transition-colors min-h-[44px]"
                    : "w-full flex items-center justify-center gap-2 bg-pulso-red text-[#16040A] px-6 py-3 rounded-xl font-bold hover:bg-foreground hover:text-background transition-colors min-h-[44px]"
                }
              >
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}