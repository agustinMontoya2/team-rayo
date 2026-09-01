import { Check, MessageCircle, PackageX } from "lucide-react";
import { formatMoney } from "../../admin/domain/format";
import { usePublicPlans } from "../publicData";
import { SectionHeading } from "./SectionHeading";
import { openWhatsApp } from '../links';

export function Plans() {
  const plans = usePublicPlans();

  return (
    <section id="plans" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading>
          Elegí tu <span className="text-pulso-indigo">plan</span>
        </SectionHeading>
        <p className="text-center text-muted-foreground mb-16 text-lg">
          Dos opciones pensadas para diferentes objetivos
        </p>

        {plans.length ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={
                  plan.featured
                    ? "bg-gradient-to-br from-pulso-indigo/10 to-pulso-red/10 rounded-2xl p-8 border-2 border-pulso-indigo relative overflow-hidden shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]"
                    : "bg-card rounded-2xl p-8 border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)] hover:shadow-[0_16px_40px_-18px_rgba(0,0,0,.65)] transition-all"
                }
              >
                <div className="mb-6">
                  <h3 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-5xl font-extrabold tracking-tight ${plan.featured ? 'text-pulso-indigo' : 'text-pulso-red'}`}>
                      {formatMoney(plan.price)}
                    </span>
                    <span className="text-muted-foreground">/ mes</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.benefits.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-pulso-indigo mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => openWhatsApp()}
                  className={
                    plan.featured
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
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-3 p-12 text-center bg-card rounded-2xl border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
            <PackageX className="w-12 h-12 text-pulso-indigo" />
            <p className="text-xl font-bold text-foreground">Aún no hay planes disponibles</p>
            <p className="text-muted-foreground max-w-md">
              Estamos preparando las opciones de entrenamiento. Muy pronto vas a poder elegir el plan que mejor se adapte a vos.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}