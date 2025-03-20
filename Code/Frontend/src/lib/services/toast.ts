import { toast } from "sonner";

/**
 * Toast utility to display notifications across the application
 */
export const toastMessage = {
  /**
   * Display a success toast notification
   * @param message The message to display
   */
  success: (message: string) => {
    toast.success(message);
  },
  
  /**
   * Display an error toast notification
   * @param message The message to display
   */
  error: (message: string) => {
    toast.error(message);
  },
  
  /**
   * Display an info toast notification
   * @param message The message to display
   */
  info: (message: string) => {
    toast.info(message);
  },
  
  /**
   * Display a warning toast notification
   * @param message The message to display
   */
  warning: (message: string) => {
    toast.warning(message);
  },
  
  /**
   * Display a custom toast notification
   * @param message The message to display
   * @param options Additional options for the toast
   */
  custom: (message: string, options?: any) => {
    toast(message, options);
  }
};
