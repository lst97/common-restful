/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiResponseSchema } from "../schemas/ApiResponseStructureSchema";

export function validateApiResponse(data: any) {
  const validationResult = apiResponseSchema.validate(data, {
    abortEarly: false,
  }); // Validate all fields

  if (validationResult.error) {
    throw new Error(
      validationResult.error.details
        .map((d: { message: any }) => d.message)
        .join("\n"),
    );
  }
  return data; // Return the validated data if successful
}
