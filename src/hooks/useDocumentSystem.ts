import { useState, useEffect, useMemo } from 'react';
import { Driver, Vehicle, Notification, DashboardStats, FilterOptions } from '../types';
import { mockDrivers, mockVehicles, mockNotifications, mockDashboardStats } from '../data/mockData';
import { getDocumentStatus } from '../utils/documentHelpers';

export const useDocumentSystem = () => {
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(mockDashboardStats);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Calculate real-time dashboard stats
  const calculatedStats = useMemo(() => {
    const allDocuments = [
      ...drivers.flatMap(d => d.documents),
      ...vehicles.flatMap(v => v.documents)
    ];

    const validCount = allDocuments.filter(doc => doc.status === 'valid').length;
    const expiringSoonCount = allDocuments.filter(doc => doc.status === 'expiring_soon').length;
    const expiredCount = allDocuments.filter(doc => doc.status === 'expired').length;
    const pendingNotificationsCount = notifications.filter(n => n.status === 'pending').length;

    return {
      totalDrivers: drivers.length,
      totalVehicles: vehicles.length,
      validDocuments: validCount,
      expiringSoon: expiringSoonCount,
      expiredDocuments: expiredCount,
      pendingNotifications: pendingNotificationsCount
    };
  }, [drivers, vehicles, notifications]);

  // Update document status on load
  useEffect(() => {
    const updateDocumentStatuses = () => {
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => ({
          ...driver,
          documents: driver.documents.map(doc => ({
            ...doc,
            status: getDocumentStatus(doc.expiryDate)
          }))
        }))
      );

      setVehicles(prevVehicles =>
        prevVehicles.map(vehicle => ({
          ...vehicle,
          documents: vehicle.documents.map(doc => ({
            ...doc,
            status: getDocumentStatus(doc.expiryDate)
          }))
        }))
      );
    };

    updateDocumentStatuses();
    setDashboardStats(calculatedStats);
  }, [calculatedStats]);

  const addDriver = async (driverData: Omit<Driver, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const newDriver: Driver = {
        ...driverData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        documents: driverData.documents.map(doc => ({
          ...doc,
          driverId: Date.now().toString()
        }))
      };
      setDrivers(prev => [...prev, newDriver]);
      return newDriver;
    } finally {
      setLoading(false);
    }
  };

  const updateDriver = async (id: string, driverData: Partial<Driver>) => {
    setLoading(true);
    try {
      setDrivers(prev => 
        prev.map(driver => 
          driver.id === id ? { 
            ...driver, 
            ...driverData,
            documents: driverData.documents ? driverData.documents.map(doc => ({
              ...doc,
              driverId: id
            })) : driver.documents
          } : driver
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteDriver = async (id: string) => {
    setLoading(true);
    try {
      setDrivers(prev => prev.filter(driver => driver.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        documents: vehicleData.documents || []
      };
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    setLoading(true);
    try {
      setVehicles(prev => 
        prev.map(vehicle => 
          vehicle.id === id ? { 
            ...vehicle, 
            ...vehicleData,
            documents: vehicleData.documents ? vehicleData.documents.map(doc => ({
              ...doc,
              vehicleId: id
            })) : vehicle.documents
          } : vehicle
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    setLoading(true);
    try {
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (notificationId: string) => {
    setLoading(true);
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { 
                ...notification, 
                status: 'sent' as const, 
                sentAt: new Date().toISOString() 
              }
            : notification
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    drivers,
    vehicles,
    notifications,
    dashboardStats: calculatedStats,
    loading,
    filters,
    setFilters,
    addDriver,
    updateDriver,
    deleteDriver,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    sendNotification
  };
};