import { SkelPage, SkelLine, SkelBlock } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkelPage>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SkelLine w={82} h={10} className="mb-3" />
          <SkelLine w={190} h={32} />
        </div>
        <SkelLine w={128} h={44} radius={8} />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkelBlock key={i} h={132} />
        ))}
      </div>
    </SkelPage>
  );
}
