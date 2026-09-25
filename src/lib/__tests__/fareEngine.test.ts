import { describe, it, expect } from 'vitest';
import { calculateStandardFare, FARE_CONFIG } from '../fareEngine';

describe('PathShare Fare Calculation Engine', () => {
  it('calculates standard car fare correctly for 10km non-peak', () => {
    // base (100) + 10 * 25 = 350 PKR
    const fare = calculateStandardFare(10, 'car', false);
    expect(fare.km).toBe(10);
    expect(fare.vehicleType).toBe('car');
    expect(fare.baseFare).toBe(100);
    expect(fare.totalPerSeat).toBe(350);
  });

  it('calculates bike fare correctly for 10km non-peak', () => {
    // base (50) + 10 * 12 = 170 PKR
    const fare = calculateStandardFare(10, 'bike', false);
    expect(fare.km).toBe(10);
    expect(fare.vehicleType).toBe('bike');
    expect(fare.baseFare).toBe(50);
    expect(fare.totalPerSeat).toBe(170);
  });

  it('applies 15% peak hour surge rounded to nearest 10 PKR', () => {
    // raw = 100 + 250 = 350 * 1.15 = 402.5 -> rounded to 400 PKR
    const fare = calculateStandardFare(10, 'car', true);
    expect(fare.isPeakHour).toBe(true);
    expect(fare.totalPerSeat).toBe(400);
  });
});
