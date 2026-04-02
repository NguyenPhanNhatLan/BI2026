export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export const handleSupabaseSingleError = (error, context) => {
  if (error.code === "PGRST116") return null;
  throw new Error(`[${context}] ${error.message}`);
};