import { normalizeWorkspaceId } from "@/lib/api/workspace-id";
import z from "@/lib/zod";
import {
  booleanQuerySchema,
  getPaginationQuerySchema,
  uploadedImageSchema,
} from "./misc";
import { parseUrlSchemaAllowEmpty } from "./utils";

export const RegisteredDomainSchema = z.object({
  id: z.string().describe("The ID of the registered domain record."),
  createdAt: z.date().describe("The date the domain was created."),
  expiresAt: z.date().describe("The date the domain expires."),
});

export const DomainSchema = z.object({
  id: z.string().describe("The unique identifier of the domain."),
  slug: z
    .string()
    .describe("The domain name.")
    .openapi({ example: "acme.com" }),
  verified: z
    .boolean()
    .default(false)
    .describe("Whether the domain is verified."),
  primary: z
    .boolean()
    .default(false)
    .describe("Whether the domain is the primary domain for the workspace."),
  archived: z
    .boolean()
    .describe("Whether the domain is archived.")
    .default(false),
  placeholder: z
    .string()
    .nullable()
    .describe(
      "Provide context to your teammates in the link creation modal by showing them an example of a link to be shortened.",
    )
    .openapi({ example: "https://dub.co/help/article/what-is-dub" }),
  expiredUrl: z
    .string()
    .nullable()
    .describe(
      "The URL to redirect to when a link under this domain has expired.",
    )
    .openapi({ example: "https://acme.com/expired" }),
  notFoundUrl: z
    .string()
    .nullable()
    .describe(
      "The URL to redirect to when a link under this domain doesn't exist.",
    )
    .openapi({ example: "https://acme.com/not-found" }),
  assetLinks: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "assetLinks.json configuration file (for deep link support on Android).",
    ),
  appleAppSiteAssociation: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "apple-app-site-association configuration file (for deep link support on iOS).",
    ),

  logo: z.string().nullable().describe("The logo of the domain."),
  createdAt: z.date().describe("The date the domain was created."),
  updatedAt: z.date().describe("The date the domain was last updated."),
  registeredDomain: RegisteredDomainSchema.nullable().describe(
    "The registered domain record.",
  ),
});

export const DOMAINS_MAX_PAGE_SIZE = 50;

export const getDomainsQuerySchema = z
  .object({
    archived: booleanQuerySchema
      .optional()
      .default("false")
      .describe(
        "Whether to include archived domains in the response. Defaults to `false` if not provided.",
      ),
    search: z
      .string()
      .optional()
      .describe("The search term to filter the domains by."),
  })
  .merge(getPaginationQuerySchema({ pageSize: DOMAINS_MAX_PAGE_SIZE }));

export const getDomainsQuerySchemaExtended = getDomainsQuerySchema.merge(
  z.object({
    // only Dub UI uses the following query parameters
    includeLink: booleanQuerySchema.default("false"),
  }),
);

export const getDomainsCountQuerySchema = getDomainsQuerySchema.omit({
  page: true,
});

export const getDefaultDomainsQuerySchema = getDomainsQuerySchema.pick({
  search: true,
});

export const createDomainBodySchema = z.object({
  slug: z
    .string({ required_error: "slug is required" })
    .min(1, "slug cannot be empty.")
    .max(190, "slug cannot be longer than 190 characters.")
    .trim()
    .describe("Name of the domain.")
    .openapi({ example: "acme.com" }),
  expiredUrl: parseUrlSchemaAllowEmpty({ trim: true })
    .nullish()
    .transform((v) => v || null)
    .describe(
      "Redirect users to a specific URL when any link under this domain has expired.",
    )
    .openapi({ example: "https://acme.com/expired" }),
  notFoundUrl: parseUrlSchemaAllowEmpty({ trim: true })
    .nullish()
    .transform((v) => v || null)
    .describe(
      "Redirect users to a specific URL when a link under this domain doesn't exist.",
    )
    .openapi({ example: "https://acme.com/not-found" }),
  archived: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Whether to archive this domain. `false` will unarchive a previously archived domain.",
    )
    .openapi({ example: false }),
  placeholder: parseUrlSchemaAllowEmpty({ maxLength: 100, trim: true })
    .nullish()
    .transform((v) => v || null)
    .describe(
      "Provide context to your teammates in the link creation modal by showing them an example of a link to be shortened.",
    )
    .openapi({ example: "https://dub.co/help/article/what-is-dub" }),
  logo: uploadedImageSchema.nullish().describe("The logo of the domain."),
  assetLinks: z
    .string()
    .nullish()
    .describe(
      "assetLinks.json configuration file (for deep link support on Android).",
    ),
  appleAppSiteAssociation: z
    .string()
    .nullish()
    .describe(
      "apple-app-site-association configuration file (for deep link support on iOS).",
    ),
});

export const updateDomainBodySchema = createDomainBodySchema.partial();

export const transferDomainBodySchema = z.object({
  newWorkspaceId: z
    .string({ required_error: "New workspace ID is required." })
    .min(1, "New workspace ID cannot be empty.")
    .transform((v) => normalizeWorkspaceId(v))
    .describe("The ID of the new workspace to transfer the domain to."),
});

export const registerDomainSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain to register is required.")
    .endsWith(".link")
    .transform((domain) => domain.toLowerCase())
    .describe("The domain to claim. We only support .link domains for now.")
    .openapi({ example: "acme.link" }),
});

export const searchDomainSchema = z.object({
  domains: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : v.split(",")))
    .transform((domains) =>
      domains
        .map((domain) => domain.toLowerCase())
        .filter((domain) => domain.endsWith(".link")),
    )
    .describe("The domains to search. We only support .link domains for now.")
    .openapi({
      param: {
        style: "form",
        explode: false,
      },
      anyOf: [
        {
          type: "string",
        },
        {
          type: "array",
          items: {
            type: "string",
          },
        },
      ],
    }),
});

export const DomainStatusSchema = z.object({
  domain: z.string().describe("The domain name."),
  available: z.boolean().describe("Whether the domain is available."),
  price: z.string().nullable().describe("The price description."),
  premium: z
    .boolean()
    .nullable()
    .describe("Whether the domain is a premium domain."),
});

export const RegisterDomainSchema = z.object({
  domain: z.string().describe("The domain name."),
  status: z.string().describe("The status of the domain registration."),
  expiration: z
    .number()
    .describe(
      "The expiration timestamp of the domain (Unix timestamp in milliseconds).",
    )
    .nullable(),
});
