import { CalendarX2, Clock } from "lucide-react";
import { usePublicSchedule } from "../publicData";

export function Schedule() {
  const schedule = usePublicSchedule();

  return (
    <section id="schedule" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Clock className="w-10 h-10 text-pulso-red" />
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Encontrá tu <span className="text-pulso-red">horario</span>
          </h2>
        </div>
        <p className="text-center text-muted-foreground mb-12 text-lg">Cada clase te cambia algo. Vos elegís qué.</p>

        <div className="max-w-2xl mx-auto bg-card rounded-2xl overflow-hidden border border-pulso-line shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
          {schedule.length ? (
            <>
              {/* Header */}
              <div className="grid grid-cols-2 bg-pulso-red text-[#16040A] font-extrabold">
                <div className="p-4 text-center">Día</div>
                <div className="p-4 text-center border-l border-pulso-red-deep/30">Horario</div>
              </div>

              {/* Rows */}
              {schedule.map((row, index) => (
                <div
                  key={row.id}
                  className={`grid grid-cols-2 ${index !== schedule.length - 1 ? "border-b border-pulso-line" : ""} ${index % 2 === 0 ? "bg-card" : "bg-card/50"}`}
                >
                  <div className="p-4 text-foreground font-semibold text-center">{row.day}</div>
                  <div className="p-4 text-muted-foreground text-center border-l border-pulso-line">
                    {row.start} - {row.end}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <CalendarX2 className="w-12 h-12 text-pulso-red" />
              <p className="text-xl font-bold text-foreground">Aún no hay horarios disponibles</p>
              <p className="text-muted-foreground max-w-md">
                Estamos armando la grilla de clases. Muy pronto vas a poder elegir el día y horario que mejor te quede.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
