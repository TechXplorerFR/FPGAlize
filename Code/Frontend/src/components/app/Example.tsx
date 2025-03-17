import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

function Example({
  name,
  lineCount,
  fileSize,
  isHighlighted,
  index,
}: {
  name: string;
  lineCount: number;
  fileSize: number;
  isHighlighted?: boolean;
  index: number;
}) {
  return (
    <>
    <Button
      onClick={() => {
        console.log(index, isHighlighted);
      }}
      className="flex w-full h-auto rounded-none text-left justify-start py-2 bg-white dark:bg-neutral-800 text-black hover:bg-neutral-200 dark:hover:bg-neutral-700 dark:text-white hover:cursor-pointer"
    >
      <div className="p-2 space-y-1">
        <p className="font-bold">{name}</p>
        <p className="font-thin">{formatFileSize(fileSize)} - {lineCount} lines</p>
      </div>
    </Button>
    <Separator className="dark:bg-neutral-800"/>
    </>
  );
}

export default Example;
