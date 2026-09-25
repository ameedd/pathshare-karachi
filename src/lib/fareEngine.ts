// Centralized Standardized Fare & Route Cost Sharing Engine for PathShare
// Easily tweakable constants for future petrol/fuel rate changes in PKR.

export const FARE_CONFIG = {
  PETROL_PRICE_PER_LITER: 280, // PKR per Liter
  CAR_AVG_KM_PER_LITER: 12,    // 12 km per liter average for city commute
  BIKE_AVG_KM_PER_LITER: 35,   // 35 km per liter average for motorbike

  // Base Flagdown & Service Fees
  CAR_BASE_FARE: 100, // PKR
  BIKE_BASE_FARE: 50,  // PKR

  // Rate per KM fuel share
  CAR_RATE_PER_KM: 25, // PKR/km
  BIKE_RATE_PER_KM: 12, // PKR/km

  PEAK_HOUR_MULTIPLIER: 1.15, // 15% peak hour surge between 5 PM - 8 PM
};

export interface CalculatedFare {
  km: number;
  baseFare: number;
  fuelShare: number;
  totalPerSeat: number;
  isPeakHour: boolean;
  vehicleType: 'car' | 'bike';
}

/**
 * Calculates standardized, non-commercial cost-share fare per seat based on distance & vehicle type.
 */
export function calculateStandardFare(
  km: number,
  vehicleType: 'car' | 'bike' = 'car',
  isPeakHour: boolean = false
): CalculatedFare {
  const baseFare = vehicleType === 'car' ? FARE_CONFIG.CAR_BASE_FARE : FARE_CONFIG.BIKE_BASE_FARE;
  const ratePerKm = vehicleType === 'car' ? FARE_CONFIG.CAR_RATE_PER_KM : FARE_CONFIG.BIKE_RATE_PER_KM;

  let rawTotal = baseFare + (km * ratePerKm);

  if (isPeakHour) {
    rawTotal *= FARE_CONFIG.PEAK_HOUR_MULTIPLIER;
  }

  // Round to nearest 10 PKR for clean cash/digital wallet payments
  const totalPerSeat = Math.round(rawTotal / 10) * 10;

  return {
    km,
    baseFare,
    fuelShare: totalPerSeat - baseFare,
    totalPerSeat: Math.max(totalPerSeat, baseFare),
    isPeakHour,
    vehicleType
  };
}
