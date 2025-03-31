import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(byteSize: number) {
  if (byteSize === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(byteSize) / Math.log(1024));

  let formattedSize = (byteSize / Math.pow(1024, i)).toFixed(2);
  formattedSize = formattedSize.endsWith(".00")
    ? formattedSize.slice(0, -3)
    : formattedSize;

  return `${formattedSize} ${sizes[i]}`;
}

export async function readFileContent(filePath: string): Promise<File> {
  const response = await fetch(filePath);
  const blob = await response.blob();
  return new File([blob], filePath.split('/').pop() || 'file.txt', { type: blob.type });
}

export async function countFileLines(file: File) : Promise<number> {
  const content = await file.text();
  return content.split(/\r\n|\r|\n/).length;
}

export async function getFileContent (file: File) : Promise<string> {
  return await file.text();
}