import { SkelPage, SkelLine, SkelRows } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkelPage>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SkelLine w={78} h={10} className="mb-3" />
          <SkelLine w={200} h={32} />
        </div>
        <SkelLine w={132} h={44} radius={8} />
      </div>
      <SkelRows count={5} />
    </SkelPage>
  );
}
