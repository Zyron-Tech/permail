import { SkelPage, SkelLine, SkelBlock } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkelPage>
      <SkelLine w={110} h={10} className="mb-4" />
      <SkelLine w={280} h={30} className="mb-7" />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <SkelLine w={70} h={10} className="mb-4" />
          <SkelLine h={40} radius={10} className="mb-5" />
          <SkelLine w={70} h={10} className="mb-4" />
          <SkelBlock h={240} />
        </div>
        <div className="card p-5">
          <SkelLine w={86} h={10} className="mb-4" />
          <SkelLine w="65%" h={16} className="mb-4" />
          {["92%", "85%", "70%", "88%", "54%"].map((w, i) => (
            <SkelLine key={i} w={w} h={11} className="mb-2.5" />
          ))}
        </div>
      </div>
    </SkelPage>
  );
}
