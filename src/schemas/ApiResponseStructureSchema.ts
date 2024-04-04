/* eslint-disable @typescript-eslint/no-explicit-any */
import Joi from "joi";
import { apiConfig } from "../configs/ApiConfig";

function validateCode(code: string): boolean {
  if (code.length === 0) {
    return false;
  }

  const pattern = /^[A-Z_]+$/;

  if (!pattern.test(code)) {
    return false;
  }

  return true;
}

const validateUuid = (uuid: string) => {
  const pattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return pattern.test(uuid);
};

const messageSchema = Joi.object({
  code: Joi.string()
    .custom(
      (
        value: string,
        helpers: { message: (arg0: { custom: string }) => any },
      ) => {
        if (!validateCode(value)) {
          return helpers.message({ custom: "Invalid message code" });
        }
        return value;
      },
    )
    .required(),
  message: Joi.string().required(),
});

const requestIdSchema = Joi.string()
  .custom(
    (
      value: string,
      helpers: { message: (arg0: { custom: string }) => any },
    ) => {
      const valueSplit = value.split(".");
      const projectName = valueSplit[0];
      const idName = valueSplit[1];
      const id = valueSplit[2];

      if (
        !validateUuid(id) ||
        projectName !== apiConfig.projectName ||
        idName !== "requestId"
      ) {
        return helpers.message({ custom: "Invalid request id" });
      }

      return value;
    },
  )
  .required();

const traceIdSchema = Joi.string()
  .custom(
    (
      value: string,
      helpers: { message: (arg0: { custom: string }) => any },
    ) => {
      const valueSplit = value.split(".");
      const projectName = valueSplit[0];
      const idName = valueSplit[1];
      const id = valueSplit[2];

      if (
        !validateUuid(id) ||
        projectName !== apiConfig.projectName ||
        idName !== "traceId"
      ) {
        return helpers.message({ custom: "Invalid trace id" });
      }

      return value;
    },
  )
  .optional();

const paginationSchema = Joi.object({
  totalItems: Joi.number().required(),
  currentPage: Joi.number().required(),
  itemsPerPage: Joi.number().required(),
  totalPages: Joi.number().required(),
});

const resultSchema = Joi.object({
  data: Joi.any().required(),
  success: Joi.boolean().required(),
  errorMessage: Joi.string().optional(),
});

export const apiResponseSchema = Joi.object({
  status: Joi.string().valid("error", "success", "partial").required(),
  message: messageSchema.required(),
  data: Joi.any(),
  requestId: requestIdSchema,
  traceId: traceIdSchema,
  timestamp: Joi.string().isoDate().required(),
  warnings: messageSchema.optional(),
  version: Joi.string().required(),
  pagination: paginationSchema.optional(),
  metadata: Joi.object().optional(),
  result: Joi.array().optional(),
})
  .when(".status", {
    is: "error",
    then: Joi.object({
      traceId: Joi.string()
        .guid({ version: "uuidv4", separator: "-" })
        .required(),
    }),
  })
  .when(".status", {
    is: "partial",
    then: Joi.object({
      result: Joi.array().items(resultSchema).required(),
    }),
  });
