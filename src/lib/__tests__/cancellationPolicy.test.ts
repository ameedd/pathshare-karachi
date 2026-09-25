import { describe, it, expect } from 'vitest';
import { calculateCancellationFee } from '../cancellationPolicy';

describe('PathShare Cancellation Policy', () => {
  it('gives 100% refund for passenger cancellation > 60 mins before departure', () => {
    const res = calculateCancellationFee({
      fareAmountRs: 300,
      departureTime: '08:30',
      minutesUntilDeparture: 75,
      cancelledBy: 'passenger'
    });

    expect(res.allowed).toBe(true);
    expect(res.refundPercentage).toBe(100);
    expect(res.penaltyFeeRs).toBe(0);
    expect(res.reasonCategory).toBe('free_early');
  });

  it('charges 25% fee for cancellation between 20 and 59 mins', () => {
    const res = calculateCancellationFee({
      fareAmountRs: 400,
      departureTime: '08:30',
      minutesUntilDeparture: 30,
      cancelledBy: 'passenger'
    });

    expect(res.allowed).toBe(true);
    expect(res.refundPercentage).toBe(75);
    expect(res.penaltyFeeRs).toBe(100);
    expect(res.driverCompensationRs).toBe(100);
  });

  it('charges 70% late fee if passenger cancels after driver arrived at hotspot', () => {
    const res = calculateCancellationFee({
      fareAmountRs: 300,
      departureTime: '08:30',
      minutesUntilDeparture: 2,
      cancelledBy: 'passenger',
      driverArrivedAtHotspot: true
    });

    expect(res.refundPercentage).toBe(30);
    expect(res.penaltyFeeRs).toBe(210);
    expect(res.driverCompensationRs).toBe(210);
  });

  it('gives full refund to passengers if driver cancels', () => {
    const res = calculateCancellationFee({
      fareAmountRs: 250,
      departureTime: '09:00',
      minutesUntilDeparture: 45,
      cancelledBy: 'driver'
    });

    expect(res.refundPercentage).toBe(100);
    expect(res.driverCompensationRs).toBe(0);
  });
});
