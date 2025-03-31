import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
import { useState, useRef } from "react";
import { formatFileSize } from "@/lib/utils";
import { toast } from "sonner";
import { Example, Tab } from "@/lib/types/types";
import { parseUploadedExample } from "@/lib/services/upload-parser";

interface AddExampleModalProps {
  setExamples: React.Dispatch<React.SetStateAction<Example[]>>;
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  setActiveTabId?: (id: string) => void;
  onClose?: () => void;
}

export default function AddExampleModal({
  setExamples,
  setTabs,
  setActiveTabId,
  onClose,
}: AddExampleModalProps) {
  const [sdfFile, setSdfFile] = useState<File | null>(null);
  const [verilogFile, setVerilogFile] = useState<File | null>(null);
  const [originalVerilogFile, setOriginalVerilogFile] = useState<File | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sdfInputRef = useRef<HTMLInputElement>(null);
  const verilogInputRef = useRef<HTMLInputElement>(null);
  const originalVerilogInputRef = useRef<HTMLInputElement>(null);

  const handleSdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSdfFile(e.target.files[0]);
    }
  };

  const handleVerilogUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVerilogFile(e.target.files[0]);
    }
  };

  const handleOriginalVerilogUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setOriginalVerilogFile(e.target.files[0]);
    }
  };

  const handleCreateExample = async () => {
    if (!sdfFile || !verilogFile || !originalVerilogFile) {
      toast.error("Please upload all required files");
      return;
    }

    setIsLoading(true);

    try {
      // Use the new parser function to parse the uploaded files
      const example = await parseUploadedExample(
        originalVerilogFile,
        verilogFile,
        sdfFile
      );

      // Add the example to the examples array
      setExamples((prevExamples) => {
        const newExamples = [...prevExamples, example];

        // Store in sessionStorage for persistence
        try {
          sessionStorage.setItem(
            "customExamples",
            JSON.stringify(
              newExamples.map((ex) => ({
                ...ex,
                originalVerilogFile: {
                  name: ex.originalVerilogFile.name,
                  size: ex.originalVerilogFile.size,
                  type: ex.originalVerilogFile.type,
                },
                postSynthesisVerilogFile: {
                  name: ex.postSynthesisVerilogFile.name,
                  size: ex.postSynthesisVerilogFile.size,
                  type: ex.postSynthesisVerilogFile.type,
                },
                postSynthesisSdfFile: {
                  name: ex.postSynthesisSdfFile.name,
                  size: ex.postSynthesisSdfFile.size,
                  type: ex.postSynthesisSdfFile.type,
                },
              }))
            )
          );
        } catch (error) {
          console.error("Failed to store examples in sessionStorage:", error);
        }

        return newExamples;
      });

      // Create a new tab for this example
      const newTab: Tab = {
        id: example.originalVerilogFileInformation.name,
        name: example.originalVerilogFileInformation.name,
        example: example,
      };

      setTabs((prevTabs) => [...prevTabs, newTab]);

      // Set the new tab as active
      if (setActiveTabId) {
        setActiveTabId(newTab.id);
      }

      // Close the modal
      setOpen(false);
      if (onClose) onClose();

      // Show success message
      toast.success(
        `Example "${example.originalVerilogFileInformation.name}" created successfully`
      );

      // Reset form
      setSdfFile(null);
      setVerilogFile(null);
      setOriginalVerilogFile(null);
    } catch (error) {
      toast.error(
        `Failed to create example: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="px-4 py-2 rounded-md">Import</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Add example</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* SDF File Upload */}
            <div
              className="border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100"
              onClick={() => sdfInputRef.current?.click()}
            >
              <input
                type="file"
                ref={sdfInputRef}
                onChange={handleSdfUpload}
                accept=".sdf"
                className="hidden"
              />
              {sdfFile ? (
                <>
                  <FileText className="h-6 w-6 mb-2" />
                  <p className="text-sm font-medium truncate w-full">
                    {sdfFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(sdfFile.size)}
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 mb-2" />
                  <p className="text-sm font-medium">Drop .sdf file here</p>
                </>
              )}
            </div>

            {/* Verilog File Upload */}
            <div
              className="border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100"
              onClick={() => verilogInputRef.current?.click()}
            >
              <input
                type="file"
                ref={verilogInputRef}
                onChange={handleVerilogUpload}
                accept=".v"
                className="hidden"
              />
              {verilogFile ? (
                <>
                  <FileText className="h-6 w-6 mb-2" />
                  <p className="text-sm font-medium truncate w-full">
                    {verilogFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(verilogFile.size)}
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 mb-2" />
                  <p className="text-sm font-medium">Drop .v file here</p>
                </>
              )}
            </div>
          </div>

          {/* Original Verilog File Upload */}
          <div
            className="border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100"
            onClick={() => originalVerilogInputRef.current?.click()}
          >
            <input
              type="file"
              ref={originalVerilogInputRef}
              onChange={handleOriginalVerilogUpload}
              accept=".v"
              className="hidden"
            />
            {originalVerilogFile ? (
              <>
                <FileText className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium truncate w-full">
                  {originalVerilogFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(originalVerilogFile.size)}
                </p>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium">
                  Drop original .v file here
                </p>
              </>
            )}
          </div>

          <Button
            className="w-full"
            disabled={
              !sdfFile || !verilogFile || !originalVerilogFile || isLoading
            }
            onClick={handleCreateExample}
          >
            {isLoading ? "Processing..." : "Create example"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
