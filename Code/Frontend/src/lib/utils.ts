import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a file size in bytes into a human-readable string.
 * @param byteSize - The size in bytes to be formatted.
 * @returns A string representing the formatted file size.
 */
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

/**
 * Reads the content of a file from a given path and returns it as a File object.
 * @param filePath - The path to the file to be read.
 * @returns A Promise that resolves to a File object containing the file content.
 */
export async function readFileContent(filePath: string): Promise<File> {
  const response = await fetch(filePath);
  const blob = await response.blob();
  return new File([blob], filePath.split('/').pop() || 'file.txt', { type: blob.type });
}

/**
 * Counts the number of lines in a given file.
 * @param file - The file to count lines in.
 * @returns A Promise that resolves to the number of lines in the file.
 */
export async function countFileLines(file: File) : Promise<number> {
  const content = await file.text();
  return content.split(/\r\n|\r|\n/).length;
}

/**
 * Reads the content of a file and returns it as a string.
 * @param file - The file to read.
 * @returns A Promise that resolves to the content of the file as a string.
 */
export async function getFileContent (file: File) : Promise<string> {
  return await file.text();
}