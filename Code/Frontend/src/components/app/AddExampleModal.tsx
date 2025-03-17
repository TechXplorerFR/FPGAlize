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

export default function AddExampleModal() {
  const [sdfFile, setSdfFile] = useState<File | null>(null);
  const [verilogFile, setVerilogFile] = useState<File | null>(null);
  const [originalVerilogFile, setOriginalVerilogFile] = useState<File | null>(null);

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

  const handleOriginalVerilogUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOriginalVerilogFile(e.target.files[0]);
    }
  };

  return (
    <Dialog>
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
                <p className="text-sm font-medium">Drop original .v file here</p>
              </>
            )}
          </div>
          
          <Button className="w-full" disabled={!sdfFile || !verilogFile || !originalVerilogFile}>
            Create example
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
