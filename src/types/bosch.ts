// Bosch eBike Smart System Cloud API response types

// --- Bike Profile API ---

export interface BoschBikesResponse {
  bikes: BoschBike[];
}

export interface BoschBike {
  id: string;
  name?: string;
  createdAt?: string;
  language?: string;
  driveUnit: BoschDriveUnit;
  remoteControl?: BoschComponent;
  batteries: BoschBattery[];
  serviceDue?: BoschServiceDue;
}

export interface BoschComponent {
  serialNumber?: string;
  partNumber?: string;
  productName?: string;
}

export interface BoschAssistMode {
  name: string;
  reachableRange?: number; // km
}

export interface BoschDriveUnit {
  serialNumber?: string;
  partNumber?: string;
  productName?: string;
  odometer: number; // in meters
  rearWheelCircumferenceUser?: number; // mm
  powerOnTime: {
    total: number; // hours
    withMotorSupport: number; // hours
  };
  maximumAssistanceSpeed: number; // km/h
  activeAssistModes: BoschAssistMode[];
  walkAssistConfiguration?: {
    isEnabled?: boolean;
    maximumSpeed: number; // km/h
  };
}

export interface BoschBattery {
  id?: string;
  serialNumber?: string;
  partNumber?: string;
  productName?: string;
  deliveredWhOverLifetime: number; // Wh
  chargeCycles: {
    total: number;
    onBike: number;
    offBike: number;
  };
}

export interface BoschServiceDue {
  odometer: number; // meters
}

// --- Activity Records API ---

export interface BoschActivitiesResponse {
  activitySummaries: BoschActivitySummary[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface BoschActivitySummary {
  id: string;
  title: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  timeZone?: string;
  durationWithoutStops: number; // seconds
  bikeId?: string;
  startOdometer?: number; // meters
  distance: number; // meters
  speed: {
    average: number; // km/h
    maximum: number; // km/h
  };
  riderPower: {
    average: number; // watts
    maximum: number; // watts
  };
  cadence: {
    average: number; // rpm
    maximum: number; // rpm
  };
  caloriesBurned: number; // kcal
  elevation: {
    gain: number; // meters
    loss: number; // meters
  };
}

// --- Activity Details API ---

export interface BoschActivityDetail {
  distance?: number; // meters
  altitude?: number; // meters
  speed?: number; // km/h
  cadence?: number; // rpm
  latitude: number;
  longitude: number;
  riderPower?: number; // watts
}

export interface BoschActivityDetailsResponse {
  activityDetails: BoschActivityDetail[];
}

// --- Auth.js type augmentation ---

declare module "next-auth" {
  interface Session {
    // accessToken is intentionally NOT here — kept server-only in JWT
    error?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }
}
