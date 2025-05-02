import { Request } from 'express';

export interface JwtPayload {
    iss: string;               // Issuer
    exp: number;               // Expiration time
    iat: number;               // Issued at
    aud: string;               // Audience
    scope: string;             // Scopes
    jti: string;               // JWT ID
    sub: string;               // Subject (User ID)
    name: string;              // User name
    business_id: string;       // Business ID (note the underscore)
    Permission: string[];      // Array of permission strings
    Module: string;            // Module identifier
    oi_prst: string;           // OAuth provider
    oi_au_id: string;          // OAuth authorization ID
    client_id: string;         // Client ID
    oi_tkn_id: string;         // OAuth token ID
    [key: string]: any;        // Additional properties
  }

  export interface AuthenticatedRequest extends Request {
    user: JwtPayload;
  }