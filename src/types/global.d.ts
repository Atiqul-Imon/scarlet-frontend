// Global type declarations for the Scarlet e-commerce frontend

declare global {
  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_BASE: string;
      NEXT_PUBLIC_SITE_URL: string;
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
      NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string;
      NEXT_PUBLIC_SENTRY_DSN?: string;
      NEXT_PUBLIC_APP_ENV: 'development' | 'staging' | 'production';
    }
  }

  // Window object extensions
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    Stripe?: any;
    fbq?: {
      (command: 'init', pixelId: string, config?: Record<string, any>): void;
      (command: 'track', eventName: string, eventData?: Record<string, any>): void;
      (command: 'trackSingle', pixelId: string, eventName: string, eventData?: Record<string, any>): void;
      (command: 'trackCustom', eventName: string, eventData?: Record<string, any>): void;
      queue?: any[];
      loaded?: boolean;
      version?: string;
    };
    gtm?: any;
    _fbq?: any;
  }

  // Custom CSS properties
  declare module 'csstype' {
    interface Properties {
      '--color-primary'?: string;
      '--color-secondary'?: string;
      '--color-accent'?: string;
      '--font-family-primary'?: string;
      '--font-family-secondary'?: string;
      '--border-radius-base'?: string;
      '--shadow-base'?: string;
    }
  }
}

// Module declarations for assets
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}

// Third-party library augmentations
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Allow data attributes
    [key: `data-${string}`]: any;
  }
}

// Utility types for better TypeScript experience
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// React component type helpers
export type ComponentWithChildren<P = {}> = React.FC<P & { children: React.ReactNode }>;

export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

export type ElementRef<T> = T extends React.RefObject<infer U> ? U : never;

// API response helpers
export type ApiEndpoint<TRequest = void, TResponse = unknown> = TRequest extends void
  ? () => Promise<TResponse>
  : (request: TRequest) => Promise<TResponse>;

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpStatusCode = 
  | 200 | 201 | 204 // Success
  | 400 | 401 | 403 | 404 | 409 | 422 // Client errors
  | 500 | 502 | 503 | 504; // Server errors

// Form and validation helpers
export type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
};

export type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
};

export type ValidationRule<T = any> = (value: T) => string | undefined;

export type ValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

// Event handler types
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T = any> = (data: T) => Promise<void> | void;
export type ClickHandler = (event: React.MouseEvent) => void;
export type KeyboardHandler = (event: React.KeyboardEvent) => void;

// Brand types for better type safety
export type Brand<T, U> = T & { readonly __brand: U };

export type ProductId = Brand<string, 'ProductId'>;
export type UserId = Brand<string, 'UserId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type CartId = Brand<string, 'CartId'>;
export type CategoryId = Brand<string, 'CategoryId'>;

// Temporal types
export type Timestamp = Brand<string, 'Timestamp'>; // ISO 8601 string
export type DateOnly = Brand<string, 'DateOnly'>; // YYYY-MM-DD format

// Currency and pricing
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';
export type Price = Brand<number, 'Price'>; // Always in cents/smallest unit

// URL and slug types
export type Slug = Brand<string, 'Slug'>;
export type Url = Brand<string, 'Url'>;
export type Email = Brand<string, 'Email'>;

// Color and styling
export type HexColor = Brand<string, 'HexColor'>; // #RRGGBB format
export type CSSClass = Brand<string, 'CSSClass'>;

// File and media types
export type FileSize = Brand<number, 'FileSize'>; // In bytes
export type MimeType = Brand<string, 'MimeType'>;
export type ImageUrl = Brand<string, 'ImageUrl'>;

// Search and filtering
export type SearchQuery = Brand<string, 'SearchQuery'>;
export type SortDirection = 'asc' | 'desc';

// Pagination
export type PageNumber = Brand<number, 'PageNumber'>;
export type PageSize = Brand<number, 'PageSize'>;

export {};

// Export empty object to make this a module
// This ensures TypeScript treats this file as a module rather than a script
