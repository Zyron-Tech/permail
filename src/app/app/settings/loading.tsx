import { SkelPage, SkelLine, SkelBlock } from "@/components/skeleton";

export default function Loading() {
  return (
    <SkelPage>
      <SkelLine w={70} h={10} className="mb-3" />
      <SkelLine w={170} h={32} className="mb-7" />
      <SkelBlock h={190} className="mb-4" />
      <SkelBlock h={210} />
    </SkelPage>
  );
}
