import { SkelPage, SkelHeader, SkelLine, SkelBlock } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkelPage>
      <SkelHeader wide />
      <div className="mb-8 flex flex-wrap gap-2">
        {[92, 120, 104, 86].map((w, i) => (
          <SkelLine key={i} w={w} h={32} radius="full" />
        ))}
      </div>
      {[0, 1, 2].map((section) => (
        <div key={section} className="mb-10">
          <SkelLine w={210} h={22} className="mb-4" />
          {["96%", "88%", "92%"].map((w, i) => (
            <SkelLine key={i} w={w} h={12} className="mb-2.5" />
          ))}
          <SkelBlock h={70} className="mt-5" />
        </div>
      ))}
    </SkelPage>
  );
}
