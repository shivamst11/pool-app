const apiCallWrapper = async <T>(
  fn: () => Promise<T>,
  supressError = false
) => {
  try {
    return await fn();
  } catch (error) {
    if (!supressError) {
      console.error('API Call Error: ', error);
      throw error;
    }
    return null; // Or return default value or null as needed.
  }
};

export default apiCallWrapper;
