import { toast } from "sonner";

export const useToast = () => {
  const showSuccess = (message) => {
    toast.success(message);
  };

  const showError = (message) => {
    toast.error(message);
  };

  const showLoading = (message) => {
    return toast.loading(message);
  };

  const dismissToast = (toastId) => {
    toast.dismiss(toastId);
  };

  const showPromise = (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || "Loading...",
      success: messages.success || "Success!",
      error: messages.error || "Something went wrong",
    });
  };

  return {
    showSuccess,
    showError,
    showLoading,
    dismissToast,
    showPromise,
  };
};
