import { SkelPage, SkelLine, SkelBlock, SkelRows } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkelPage>
      <div className="mb-7 flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <SkelLine w={96} h={10} className="mb-3" />
          <SkelLine w={230} h={32} />
          <SkelLine w={330} h={13} className="mt-3" />
        </div>
        <SkelBlock h={96} className="hidden w-[190px] shrink-0 sm:block" />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkelBlock key={i} h={92} />
        ))}
      </div>
      <SkelBlock h={62} className="mb-6" />

      <div className="mb-6 grid gap-2.5 sm:grid-cols-2">
        <SkelBlock h={80} />
        <SkelBlock h={80} />
      </div>

      <SkelLine w={84} h={16} className="mb-3" />
      <SkelRows count={3} />
    </SkelPage>
  );
}
