import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { calculateColdRoomLoad } from '@/utils/coldRoomCalculations';

export default function ColdRoomResultsScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Recalculate whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      calculateResults();
    }, [])
  );

  // Also set up a listener for storage changes
  useEffect(() => {
    const interval = setInterval(() => {
      calculateResults();
    }, 1000); // Check for changes every second

    return () => clearInterval(interval);
  }, []);

  const calculateResults = async () => {
    try {
      const roomData = await AsyncStorage.getItem('coldRoomData');
      const conditionsData = await AsyncStorage.getItem('coldRoomConditionsData');
      const constructionData = await AsyncStorage.getItem('coldRoomConstructionData');
      const productData = await AsyncStorage.getItem('coldRoomProductData');

      const room = roomData ? JSON.parse(roomData) : { 
        length: '6.0', width: '4.0', height: '3.0', doorWidth: '1.2', doorHeight: '2.1',
        doorOpenings: '30', insulationType: 'PUF', insulationThickness: 100 
      };
      
      const conditions = conditionsData ? JSON.parse(conditionsData) : { 
        externalTemp: '35', internalTemp: '4', operatingHours: '24', pullDownTime: '8' 
      };
      
      const construction = constructionData ? JSON.parse(constructionData) : {
        insulationType: 'PUF', insulationThickness: 100
      };
      
      const product = productData ? JSON.parse(productData) : { 
        productType: 'General Food Items', dailyLoad: '3000', incomingTemp: '25', outgoingTemp: '4',
        storageType: 'Palletized', numberOfPeople: '3', workingHours: '8',
        lightingWattage: '300', equipmentLoad: '750' 
      };

      // Merge construction data with room data
      const roomWithConstruction = { ...room, ...construction };

      const calculatedResults = calculateColdRoomLoad(roomWithConstruction, conditions, product);
      setResults(calculatedResults);
      setLoading(false);
    } catch (error) {
      console.error('Error calculating cold room results:', error);
      setLoading(false);
    }
  };

  if (loading || !results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Cold Room Results" step={5} totalSteps={5} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Cold Room Results" step={5} totalSteps={5} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainResultCard}>
          <Text style={styles.mainResultTitle}>🌡 COLD ROOM LOAD CALCULATION</Text>
          <Text style={styles.mainResultValue}>{results.finalLoad.toFixed(2)} kW</Text>
          <Text style={styles.mainResultSubtitle}>Refrigeration: {results.totalTR.toFixed(2)} TR</Text>
          <Text style={styles.mainResultSubtitle}>Daily Energy: {(results.finalLoad * 24).toFixed(1)} kWh</Text>
          <Text style={styles.mainResultSubtitle}>Heat Removal: {results.totalBTU.toFixed(0)} BTU/hr</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 SUMMARY</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Cooling Capacity:</Text>
              <Text style={styles.summaryValue}>{results.finalLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Refrigeration Capacity:</Text>
              <Text style={styles.summaryValue}>{results.totalTR.toFixed(2)} TR</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Daily Energy Consumption:</Text>
              <Text style={styles.summaryValue}>{(results.finalLoad * 24).toFixed(1)} kWh</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 DETAILED BREAKDOWN</Text>
          
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>TRANSMISSION LOADS</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Walls:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.walls.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Ceiling:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.ceiling.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Floor:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.floor.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Subtotal:</Text>
              <Text style={styles.subtotalValue}>{results.breakdown.transmission.total.toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>PRODUCT LOADS</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Sensible Heat:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.product.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>└─ Respiration:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.respiration.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Subtotal:</Text>
              <Text style={styles.subtotalValue}>{(results.breakdown.product + results.breakdown.respiration).toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>AIR & INFILTRATION</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Air Change Load:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.airChange.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Door Opening:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.doorOpening.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Subtotal:</Text>
              <Text style={styles.subtotalValue}>{(results.breakdown.airChange + results.breakdown.doorOpening).toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>INTERNAL LOADS</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Occupancy:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.miscellaneous.occupancy.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Lighting:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.miscellaneous.lighting.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Equipment:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.miscellaneous.equipment.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Subtotal:</Text>
              <Text style={styles.subtotalValue}>{results.breakdown.miscellaneous.total.toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>HEATER LOADS</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Peripheral Heaters:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.heaters.peripheral.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Tray Heaters:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.heaters.tray.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Subtotal:</Text>
              <Text style={styles.subtotalValue}>{results.breakdown.heaters.total.toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.finalCard}>
            <Text style={styles.finalTitle}>FINAL CALCULATION</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Total Calculated:</Text>
              <Text style={styles.breakdownValue}>{results.totalBeforeSafety.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Safety Factor (10%):</Text>
              <Text style={styles.breakdownValue}>+{results.safetyFactorLoad.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.finalRow]}>
              <Text style={styles.finalLabel}>└─ REQUIRED CAPACITY:</Text>
              <Text style={styles.finalValue}>{results.finalLoad.toFixed(2)} kW</Text>
            </View>
          </View>

          <View style={styles.conversionsCard}>
            <Text style={styles.conversionsTitle}>CONVERSIONS</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Refrigeration:</Text>
              <Text style={styles.breakdownValue}>{results.totalTR.toFixed(2)} TR</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>└─ Heat Removal:</Text>
              <Text style={styles.breakdownValue}>{results.totalBTU.toFixed(0)} BTU/hr</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Cold Room Specifications Summary</Text>
            <Text style={styles.infoText}>• Dimensions: {results.dimensions.length}m × {results.dimensions.width}m × {results.dimensions.height}m</Text>
            <Text style={styles.infoText}>• Door size: {results.doorDimensions.width}m × {results.doorDimensions.height}m</Text>
            <Text style={styles.infoText}>• Room volume: {results.volume.toFixed(1)} m³</Text>
            <Text style={styles.infoText}>• Temperature difference: {results.temperatureDifference.toFixed(1)}°C</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Construction Details</Text>
            <Text style={styles.infoText}>• Insulation: {results.construction.type}</Text>
            <Text style={styles.infoText}>• Thickness: {results.construction.thickness}mm</Text>
            <Text style={styles.infoText}>• U-Factor: {results.construction.uFactor.toFixed(3)} W/m²K</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Product Information</Text>
            <Text style={styles.infoText}>• Product: {results.productInfo.type}</Text>
            <Text style={styles.infoText}>• Daily load: {results.productInfo.mass} kg</Text>
            <Text style={styles.infoText}>• Temperature range: {results.productInfo.incomingTemp}°C → {results.productInfo.outgoingTemp}°C</Text>
            <Text style={styles.infoText}>• Storage type: {results.storageCapacity.storageType}</Text>
            <Text style={styles.infoText}>• Pull-down time: {results.pullDownTime} hours</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  mainResultCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainResultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainResultValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#60A5FA',
    marginBottom: 8,
  },
  mainResultSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  subtotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
    paddingTop: 12,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
    fontFamily: 'monospace',
  },
  breakdownValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  subtotalValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
  },
  finalCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginBottom: 12,
  },
  finalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  finalRow: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    marginTop: 8,
    paddingTop: 12,
  },
  finalLabel: {
    fontSize: 15,
    color: '#1E3A8A',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  finalValue: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '700',
  },
  conversionsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  conversionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 4,
  },
});