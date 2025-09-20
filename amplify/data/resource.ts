import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== DOCTOR DIRECTORY SYSTEM ==============================================
This section creates the data models for a doctor directory system in a building.
It includes Doctor, Office, and Specialty models with relationships between them.
The authorization rule allows public API key access for directory operations.
=========================================================================*/
const schema = a.schema({
  Doctor: a
    .model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      title: a.string(), // Dr., Prof., etc.
      email: a.email(),
      phone: a.phone(),
      officeId: a.id(),
      specialtyId: a.id(),
      isAvailable: a.boolean().default(true),
      biography: a.string(),
      profileImage: a.url(),
      office: a.belongsTo("Office", "officeId"),
      specialty: a.belongsTo("Specialty", "specialtyId"),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  
  Office: a
    .model({
      roomNumber: a.string().required(),
      floor: a.integer().required(),
      building: a.string().required(),
      description: a.string(),
      capacity: a.integer(),
      amenities: a.string().array(), // e.g., ["wheelchair accessible", "waiting room"]
      doctors: a.hasMany("Doctor", "officeId"),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  
  Specialty: a
    .model({
      name: a.string().required(),
      description: a.string(),
      department: a.string(),
      doctors: a.hasMany("Doctor", "specialtyId"),
    })
    .authorization((allow) => [allow.publicApiKey()]),
    
  DirectoryQuery: a
    .model({
      query: a.string().required(),
      searchType: a.enum(["doctor", "specialty", "office", "general"]),
      results: a.json(), // Store AI agent results
      timestamp: a.timestamp(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== AI AGENT INTEGRATION ================================================
The doctor directory system includes an AI agent that can:
1. Search for doctors by name, specialty, or availability
2. Find office locations and room numbers
3. Provide information about medical specialties
4. Answer general questions about the building directory
=========================================================================*/
