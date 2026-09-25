import { useState, useEffect, useMemo } from 'react';
import { Ride, FilterType } from '../types';
import { initialRides } from '../data/mockData';
import { subscribeToRides, publishRideToDb } from '../lib/firebase';
import { logger } from '../lib/logger';

export function useRidesData() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');

  useEffect(() => {
    logger.info('useRidesData', 'Subscribing to real-time rides from Firestore');
    const unsubscribe = subscribeToRides((firestoreRides) => {
      setRides(firestoreRides || []);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredRides = useMemo(() => {
    return rides.filter((ride) => {
      // 1. Vehicle Type Filter
      if (activeFilter === 'car' && ride.type !== 'car') return false;
      if (activeFilter === 'bike' && ride.type !== 'bike') return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRoute =
          ride.from.toLowerCase().includes(q) ||
          ride.to.toLowerCase().includes(q) ||
          ride.route.toLowerCase().includes(q) ||
          ride.driver.toLowerCase().includes(q) ||
          ride.vehicle.toLowerCase().includes(q) ||
          (ride.pickupHotspot && ride.pickupHotspot.toLowerCase().includes(q)) ||
          ride.via.some((v) => v.toLowerCase().includes(q));

        if (!matchesRoute) return false;
      }

      // 3. Destination Filter
      if (destinationFilter.trim()) {
        const dest = destinationFilter.toLowerCase();
        const matchesDest =
          ride.to.toLowerCase().includes(dest) ||
          ride.route.toLowerCase().includes(dest) ||
          ride.via.some((v) => v.toLowerCase().includes(dest));
        if (!matchesDest) return false;
      }

      return true;
    });
  }, [rides, activeFilter, searchQuery, destinationFilter]);

  const addRide = async (newRide: Ride) => {
    try {
      setRides((prev) => [newRide, ...prev]);
      await publishRideToDb(newRide);
      logger.info('useRidesData', 'Successfully published new ride', newRide.id);
    } catch (err) {
      logger.error('useRidesData', 'Failed to publish ride to Firestore', err);
    }
  };

  return {
    rides,
    filteredRides,
    loading,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    destinationFilter,
    setDestinationFilter,
    addRide,
    setRides
  };
}
