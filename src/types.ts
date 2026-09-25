export type VehicleType = 'car' | 'bike';
export type ServiceCategory = 'passenger' | 'parcel';

export interface VehicleInfo {
  model: string;
  year: string;
  color: string;
  plateNumber?: string;
  ac?: boolean;
  heater?: boolean;
}

export interface Ride {
  id: number;
  type: VehicleType;
  serviceCategory?: ServiceCategory; // 'passenger' or 'parcel' delivery
  parcelDescription?: string;         // e.g. "Documents, Laptop bag, or small parcel"
  driver: string;
  driverPhone?: string;
  gender: 'male';
  rating: number;
  reviews: number;
  verified: boolean;
  from: string;
  to: string;
  time: string;
  seats: number;                       // For bike: strictly 1 seat or 1 parcel slot
  basePrice: number;
  price: number;
  km: number;
  vehicle: string;
  plateNumber?: string;                // Registration plate number (e.g. KHI-7890)
  modelYear?: string;
  color?: string;
  ac?: boolean;
  heater?: boolean;
  prefs: string[];
  avatar: string;
  route: string;
  via: string[];
  coordinates?: {
    from: [number, number];
    to: [number, number];
  };
  status?: 'active' | 'in_progress' | 'completed';
  
  // New Enhanced Features (inDrive, Yango, Bykea)
  intercity?: boolean;                  // Intercity carpool vs daily city commute
  luggageAllowance?: string;           // e.g. "🧳 1 Suitcase per seat"
  pickupHotspot?: string;              // Recommended safe meeting point (e.g. NIPA Flyover Bus Stop)
  spareHelmetProvided?: boolean;       // Bykea flag for bike pillion extra helmet
  receiverName?: string;               // For express parcel delivery
  receiverPhone?: string;              // For express parcel delivery
  deliveryPin?: string;                // 4-digit parcel confirmation code
  codAmount?: number;                  // Cash on delivery amount
  paymentMethodsAccepted?: string[];   // ['Cash', 'JazzCash', 'EasyPaisa', 'Bank Transfer']
  startPin?: string;                   // Yango style 4-digit passenger trip start code
  driverEmail?: string;
  bookedPassengers?: string[];
  
  // Production Trust, Safety & Corridor attributes
  cnicVerified?: boolean;              // Government NADRA CNIC verified driver
  licenseVerified?: boolean;           // Driving license verified by PathShare
  ladiesOnly?: boolean;                // Women-only carpool route
  corridor?: string;                   // Key Karachi Express Corridor (e.g. 'IBA/NED', 'Chundrigar')
}

export interface RideRequest {
  id: number;
  rideId?: number;
  name: string;
  phone?: string;
  avatar: string;
  rating: number;
  verified: boolean;
  seatsWanted: number;
  pickup: string;
  rideLabel: string;
  timeAgo: string;
  gender?: 'male';
  status: 'pending' | 'accepted' | 'declined';
  farePerSeat?: number;
  counterOfferFare?: number;
  negotiationStatus?: 'pending' | 'accepted' | 'declined' | 'countered';
  driverCounterFare?: number;
  pickupNote?: string;
  otp?: string;
}

export interface ChatMessage {
  id: number;
  sender: 'driver' | 'user' | 'system';
  text: string;
  timestamp: string;
  mapData?: {
    fromLocation: string;
    toLocation: string;
    waypoints?: string[];
    pickupHotspot?: string;
    fare?: number;
    pin?: string;
    vehicle?: string;
    plateNumber?: string;
  };
}

export interface ChatThread {
  id: number;
  participantName: string;
  participantAvatar: string;
  rating: number;
  verified: boolean;
  lastMessage: string;
  timeAgo: string;
  unreadCount: number;
  from?: string;
  to?: string;
  route?: string;
  vehicle?: string;
  plateNumber?: string;
  pickupHotspot?: string;
  fare?: number;
  startPin?: string;
  messages: ChatMessage[];
}

export interface UserReview {
  id: number;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  date: string;
  comment: string;
  role: 'driver' | 'passenger';
}

export interface TripHistoryItem {
  id: string | number;
  date: string;
  from: string;
  to: string;
  driverName: string;
  vehicle: string;
  vehicleType: 'car' | 'bike';
  seats: number;
  totalCost: number;
  paymentMethod: string;
  status: 'completed' | 'cancelled';
  role: 'passenger' | 'driver';
}

export type PaymentMethodType = 'easypaisa' | 'jazzcash' | 'card';

export interface UserPaymentMethod {
  id: string;
  type: PaymentMethodType;
  title: string;
  accountNumberOrMaskedCard: string;
  isDefault: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
  officeCardImageUrl?: string;
  officeCardStatus: 'verified' | 'pending' | 'unverified';
  companyName: string;
  officeLocation: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  paymentMethods: UserPaymentMethod[];
  reviews: UserReview[];
  tripHistory: TripHistoryItem[];
  // Trust, Safety & KYC fields
  cnicNumber?: string;
  cnicVerified?: boolean;
  licenseNumber?: string;
  licenseVerified?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export type FilterType = 'all' | 'car' | 'bike' | 'fare' | 'rating' | 'ladies';
export interface HotspotArrivalData {
  rideId: number;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  driverPhone?: string;
  vehicle: string;
  plateNumber: string;
  color?: string;
  pickupHotspot: string;
  startPin?: string;
  price: number;
  timestamp: string;
  departureSecondsRemaining: number; // starts at 180 (3 minutes)
  status: 'coming' | 'arrived' | 'rider_acknowledged' | 'boarded' | 'departed';
  riderNote?: string;
}

export type ScreenId = 'login' | 'home' | 'search' | 'post' | 'detail' | 'messages' | 'chat' | 'requests' | 'profile' | 'admin' | 'legal';

