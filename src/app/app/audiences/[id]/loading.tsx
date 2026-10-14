import { SkelPage, SkelLine } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkelPage>
      <SkelLine w={100} h={10} className="mb-4" />
      <SkelLine w={240} h={30} className="mb-7" />

      <div className="card overflow-hidden">
        <div className="flex gap-4 border-b border-line px-4 py-3">
          {[70, 96, 84, 60].map((w, i) => (
            <SkelLine key={i} w={w} h={10} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="flex gap-4 border-b border-line px-4 py-3.5 last:border-0">
            {[120, 82, 104, 68].map((w, i) => (
              <SkelLine key={i} w={w - ((row * 7) % 22)} h={12} />
            ))}
          </div>
        ))}
      </div>
    </SkelPage>
  );
}
