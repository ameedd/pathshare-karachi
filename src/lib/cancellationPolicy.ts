/**
 * PathShare Fair Cancellation Policy & Penalty Calculation Engine
 * Designed for Karachi Commuters & University/Corporate Carpoolers
 */

export interface CancellationResult {
  allowed: boolean;
  refundPercentage: number;
  penaltyFeeRs: number;
  reasonCategory: 'free_early' | 'moderate_window' | 'late_penalty' | 'driver_noshow' | 'emergency';
  message: string;
  driverCompensationRs: number;
}

export interface CancellationInput {
  fareAmountRs: number;
  departureTime: string; // HH:MM or ISO timestamp or minutes before departure
  minutesUntilDeparture: number;
  cancelledBy: 'passenger' | 'driver';
  reason?: string;
  driverArrivedAtHotspot?: boolean;
}

/**
 * Calculates fair refund and compensation based on PathShare Community Rules
 */
export function calculateCancellationFee(input: CancellationInput): CancellationResult {
  const { fareAmountRs, minutesUntilDeparture, cancelledBy, driverArrivedAtHotspot } = input;

  // Case 1: Driver cancels
  if (cancelledBy === 'driver') {
    if (minutesUntilDeparture < 30) {
      return {
        allowed: true,
        refundPercentage: 100,
        penaltyFeeRs: Math.min(150, Math.round(fareAmountRs * 0.3)),
        reasonCategory: 'late_penalty',
        message: 'Driver cancelled within 30 minutes of departure. 100% passenger refund plus Rs. 50 PathShare wallet bonus.',
        driverCompensationRs: 0
      };
    }
    return {
      allowed: true,
      refundPercentage: 100,
      penaltyFeeRs: 0,
      reasonCategory: 'free_early',
      message: 'Driver cancelled with ample advance notice. 100% full refund to all riders.',
      driverCompensationRs: 0
    };
  }

  // Case 2: Passenger cancels after driver arrived at Hotspot (3-minute rule active)
  if (driverArrivedAtHotspot) {
    const penalty = Math.round(fareAmountRs * 0.7);
    return {
      allowed: true,
      refundPercentage: 30,
      penaltyFeeRs: penalty,
      reasonCategory: 'late_penalty',
      message: 'Cancellation after driver arrived at designated Hotspot incurs a 70% late fee to compensate driver fuel.',
      driverCompensationRs: penalty
    };
  }

  // Case 3: Passenger cancels > 60 mins before departure
  if (minutesUntilDeparture >= 60) {
    return {
      allowed: true,
      refundPercentage: 100,
      penaltyFeeRs: 0,
      reasonCategory: 'free_early',
      message: 'Free cancellation. Full 100% refund credited back to your payment method.',
      driverCompensationRs: 0
    };
  }

  // Case 4: Passenger cancels between 20 and 59 mins before departure
  if (minutesUntilDeparture >= 20 && minutesUntilDeparture < 60) {
    const penalty = Math.min(100, Math.round(fareAmountRs * 0.25));
    return {
      allowed: true,
      refundPercentage: 75,
      penaltyFeeRs: penalty,
      reasonCategory: 'moderate_window',
      message: 'Cancellation within 1 hour incurs a minor 25% seat reservation fee to protect carpool routes.',
      driverCompensationRs: penalty
    };
  }

  // Case 5: Late cancellation (< 20 mins)
  const penalty = Math.round(fareAmountRs * 0.5);
  return {
    allowed: true,
    refundPercentage: 50,
    penaltyFeeRs: penalty,
    reasonCategory: 'late_penalty',
    message: 'Late cancellation (< 20 mins) incurs a 50% fair fuel compensation for the driver.',
    driverCompensationRs: penalty
  };
}
