import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import Editor from "@monaco-editor/react";
import { getTheme } from "../theme-provider";
import { sampleCodes } from "@/data/sample-codes";
import { Example, Tab } from "@/lib/types";
import { getFileContent } from "@/lib/utils";

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

  // Get theme once at component top level to ensure consistent hook order
  const editorTheme = `vs-${getTheme()}`;

  // Update code content when the active tab changes
  useEffect(() => {
    const fetchCode = async () => {
      if (!activeTabId || activeTabId === "") {
        // Default to first code if no tab is selected
        setCode("");
        return;
      }

      // Find the index of the active tab
      const tabIndex = tabs.findIndex((tab) => tab.id === activeTabId);

      // If the tab exists and there's corresponding code, set it
      if (tabIndex !== -1 && tabIndex < examples.length) {
        setCode(await getFileContent(examples[tabIndex].originalVerilogFile));
      } else {
        // If no match found, default to first code sample
        setCode(sampleCodes[0] || "");
      }
    };

    fetchCode();
  }, [activeTabId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    console.log(examples);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-screen h-[88vh] relative">
      <div className="absolute top-2 right-6 z-50">
        <Button onClick={handleCopy} size="sm">
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      {activeTabId === "" && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-lg text-gray-500 dark:text-gray-400">
          <p>Select a tab to view the code</p>
        </div>
      )}
      {activeTabId !== "" && (
        <Editor
          defaultLanguage="verilog"
          value={code}
          onChange={(value) => value !== undefined && setCode(value)}
          theme={editorTheme}
          options={{ fontSize: 14, minimap: { enabled: false } }}
        />
      )}
    </div>
  );
}
