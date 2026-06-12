import { Clock } from "lucide-react";

export function Schedule() {
  const schedule = [
    { day: "Lunes", horario: "19:00 - 21:00" },
    { day: "Miércoles", horario: "20:00 - 21:00" },
    { day: "Jueves", horario: "19:00 - 21:00" },
    { day: "Viernes", horario: "19:00 - 21:00" },
  ];

  return (
    <section id="schedule" className="py-20 bg-[#111318]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Clock className="w-10 h-10 text-[#22288A]" />
          <h2 className="text-4xl md:text-5xl font-bold text-[#F2F2F2]">
            Encontrá tu <span className="text-[#22288A]">horario</span>
          </h2>
        </div>
        <p className="text-center text-gray-400 mb-12 text-lg">Cada clase te cambia algo. Vos elegís qué.</p>

        <div className="max-w-2xl mx-auto bg-[#1a1d26] rounded-2xl overflow-hidden border border-[#22288A]/30">
          {/* Header */}
          <div className="grid grid-cols-2 bg-[#22288A] text-[#F2F2F2] font-bold">
            <div className="p-4 text-center">Día</div>
            <div className="p-4 text-center border-l border-[#1a2070]">Horario</div>
          </div>

          {/* Rows */}
          {schedule.map((row, index) => (
            <div
              key={row.day}
              className={`grid grid-cols-2 ${index !== schedule.length - 1 ? "border-b border-[#22288A]/20" : ""} ${index % 2 === 0 ? "bg-[#1a1d26]" : "bg-[#1e2130]"}`}
            >
              <div className="p-4 text-[#F2F2F2] font-semibold text-center">{row.day}</div>
              <div className="p-4 text-gray-300 text-center border-l border-[#22288A]/20">{row.horario}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
