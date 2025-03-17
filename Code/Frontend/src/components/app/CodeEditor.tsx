import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import Editor from "@monaco-editor/react";
import { getTheme } from "../theme-provider";
import { sampleCodes } from "@/data/sample-codes";
import { Example, Tab } from "@/lib/types";

export default function CodeEditor({
  activeTabId,
  examples,
  tabs,
}: {
  activeTabId: string;
  examples: Example[];
  tabs: Tab[];
}) {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Update code content when the active tab changes
  useEffect(() => {
    if (!activeTabId) {
      // Default to first code if no tab is selected
      setCode(sampleCodes[0] || "");
      return;
    }

    // Find the index of the active tab
    const tabIndex = tabs.findIndex((tab) => tab.id === activeTabId);

    // If the tab exists and there's corresponding code, set it
    if (tabIndex !== -1 && tabIndex < sampleCodes.length) {
      setCode(sampleCodes[tabIndex]);
    } else {
      // If no match found, default to first code sample
      setCode(sampleCodes[0] || "");
    }
  }, [activeTabId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    console.log(examples);
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
