import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import Editor from "@monaco-editor/react";
import { getTheme } from "../theme-provider";
import { Example, Tab } from "@/lib/types/types";
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
        // Default to empty content if no tab is selected
        setCode("");
        return;
      }

      // Find the tab object by its ID
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      if (!activeTab) {
        setCode("");
        return;
      }

      // Find the example that matches this tab name
      const matchingExample = examples.find(
        example => example.originalVerilogFileInformation.name === activeTab.name
      );

      if (matchingExample) {
        setCode(await getFileContent(matchingExample.originalVerilogFile) || "");
      } else {
        // If no match found, use empty content
        setCode("");
      }
    };

    fetchCode();
  }, [activeTabId, tabs, examples]); // Include tabs and examples in dependencies

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
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
