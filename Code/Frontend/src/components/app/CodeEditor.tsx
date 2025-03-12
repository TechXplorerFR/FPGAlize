import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import Editor from "@monaco-editor/react";
import { getTheme } from "../theme-provider";

export default function CodeEditor() {
  const [code, setCode] = useState(
    `module ctr (input up_down, clk, rstn, output reg [2:0] out);
    always @ (posedge clk)
        if (!rstn)
            out<= 0;
        else begin
            if (up_down)
                out <= out+1;
            else
                out <= out-1;
        end
    endmodule`
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-screen h-screen relative">
      <div className="absolute top-2 right-6 z-50">
        <Button onClick={handleCopy} size="sm">
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <Editor
        defaultLanguage="verilog"
        value={code}
        onChange={(value) => value !== undefined && setCode(value)}
        theme={`vs-${getTheme()}`}
        options={{ fontSize: 14, minimap: { enabled: false } }}
      />
    </div>
  );
}
