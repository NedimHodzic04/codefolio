import { useState } from "react";
import { toast } from "sonner";

/**
 * Custom hook for optimistic UI updates with automatic rollback on error
 * @param {*} initialData - Initial data state
 * @returns {Object} - { data, updateOptimistically }
 */
export const useOptimistic = (initialData) => {
  const [data, setData] = useState(initialData);
  const [previousData, setPreviousData] = useState(initialData);

  /**
   * Perform an optimistic update
   * @param {Function} optimisticUpdate - Function that returns the optimistic data
   * @param {Function} apiCall - Async function that performs the actual API call
   * @param {Object} options - Optional configuration
   * @returns {Promise} - Resolves with API response or rejects with error
   */
  const updateOptimistically = async (optimisticUpdate, apiCall, options = {}) => {
    const {
      successMessage,
      errorMessage = "Operation failed",
      onSuccess,
      onError,
    } = options;

    // Store current data for rollback
    setPreviousData(data);

    // Apply optimistic update immediately
    const optimisticData = optimisticUpdate(data);
    setData(optimisticData);

    try {
      // Perform the actual API call
      const result = await apiCall();

      // Update with real data from API
      if (result) {
        setData(result);
      }

      // Show success message if provided
      if (successMessage) {
        toast.success(successMessage);
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      // Rollback to previous data on error
      setData(previousData);

      // Show error message
      const message = error.message || errorMessage;
      toast.error(message);

      // Call error callback if provided
      if (onError) {
        onError(error);
      }

      throw error;
    }
  };

  return {
    data,
    setData,
    updateOptimistically,
  };
};
