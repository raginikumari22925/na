import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { calculateEnhancedFreezerLoad } from '@/utils/enhancedFreezerCalculations';

export default function ResultsScreen() {
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
      const roomData = await AsyncStorage.getItem('roomData');
      const conditionsData = await AsyncStorage.getItem('conditionsData');
      const productData = await AsyncStorage.getItem('productData');

      const room = roomData ? JSON.parse(roomData) : { 
        length: '4.0', width: '3.0', height: '2.5', doorWidth: '1.0', doorHeight: '2.0',
        doorOpenings: '15', insulationType: 'PUF', insulationThickness: 150,
        internalFloorThickness: '150', numberOfFloors: '1'
      };
      const conditions = conditionsData ? JSON.parse(conditionsData) : { 
        externalTemp: '35', internalTemp: '-18', operatingHours: '24', pullDownTime: '10',
        roomHumidity: '85', airFlowPerFan: '2000', steamHumidifierLoad: '0'
      };
      const product = productData ? JSON.parse(productData) : { 
        productType: 'General Food Items', dailyLoad: '1000', incomingTemp: '25', outgoingTemp: '-18',
        storageType: 'Boxed', numberOfPeople: '2', workingHours: '4',
        lightingWattage: '150', equipmentLoad: '300', fanMotorRating: '0.37',
        numberOfFans: '6', fanOperatingHours: '24', doorHeatersLoad: '0.24',
        trayHeatersLoad: '2.0', peripheralHeatersLoad: '0'
      };

      const calculatedResults = calculateEnhancedFreezerLoad(room, conditions, product);
      setResults(calculatedResults);
      setLoading(false);
    } catch (error) {
      console.error('Error calculating results:', error);
      setLoading(false);
    }
  };

  if (loading || !results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Calculation Results" showBack={true} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Calculation Results" showBack={true} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainResultCard}>
          <Text style={styles.mainResultTitle}>🌡 FREEZER LOAD CALCULATION</Text>
          <Text style={styles.mainResultValue}>{results.loadSummary.finalLoad.toFixed(2)} kW</Text>
          <Text style={styles.mainResultSubtitle}>Refrigeration: {results.totalTR.toFixed(2)} TR</Text>
          <Text style={styles.mainResultSubtitle}>Daily Energy: {(results.loadSummary.finalLoad * 24).toFixed(1)} kWh</Text>
          <Text style={styles.mainResultSubtitle}>Heat Removal: {results.totalBTU.toFixed(0)} BTU/hr</Text>
          <Text style={styles.mainResultSubtitle}>SHR: {results.loadSummary.SHR.toFixed(3)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 TRANSMISSION LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Surface</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Area(m²)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>U-factor</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>ΔT</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Walls</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.wall.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.construction.uFactor.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{results.breakdown.transmission.wallsKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.walls.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Ceiling</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.ceiling.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.construction.uFactor.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{results.breakdown.transmission.ceilingKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.ceiling.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Floor</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.floor.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.construction.uFactor.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{results.breakdown.transmission.floorKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.floor.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>TOTAL TRANSMISSION</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1.5 }]}>{(results.breakdown.transmission.wallsKJDay + results.breakdown.transmission.ceilingKJDay + results.breakdown.transmission.floorKJDay).toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.transmission.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥩 PRODUCT LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Sensible Heat (Above Frzg)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.sensibleAboveKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.sensibleAbove.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Latent Heat (Freezing)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.latentKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.latent.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Sensible Heat (Below Frzg)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.sensibleBelowKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.sensibleBelow.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>TOTAL PRODUCT LOAD</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{(results.breakdown.product.sensibleAboveKJDay + results.breakdown.product.latentKJDay + results.breakdown.product.sensibleBelowKJDay).toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.product.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💨 AIR CHANGE & INFILTRATION</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Value</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Air flow rate</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.airChange.airFlowLperS.toFixed(1)} L/S</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Enthalpy difference</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.airChange.enthalpyDiff} kJ/L</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>Air infiltration load</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{results.breakdown.airChange.airFlowKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.airChange.load.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚪 DOOR OPENING LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Door Infiltration</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.doorOpening.infiltrationKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.doorOpening.infiltration.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Door Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>-</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.doorOpening.heaters.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>TOTAL DOOR LOAD</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{results.breakdown.doorOpening.infiltrationKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.doorOpening.total.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>• Door clear opening: {results.breakdown.doorOpening.doorClearOpening.toFixed(2)} m²</Text>
            <Text style={styles.infoText}>• Door heaters: {results.breakdown.doorOpening.doorClearOpening > 1.8 ? 'Required' : 'Not required'} (threshold: 1.8 m²)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ INTERNAL LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Occupancy Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.occupancyKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.occupancy.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Lighting Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.lightingKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.lighting.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Fan Motor Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.fanMotorKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.fanMotor.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Door Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.doorHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.doorHeaters.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Tray Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.trayHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.trayHeaters.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Steam Humidifiers</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.steamHumidifiersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.steamHumidifiers.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>TOTAL INTERNAL</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{(results.breakdown.internal.occupancyKJDay + results.breakdown.internal.lightingKJDay + results.breakdown.internal.fanMotorKJDay + results.breakdown.internal.doorHeatersKJDay + results.breakdown.internal.trayHeatersKJDay + results.breakdown.internal.steamHumidifiersKJDay).toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.internal.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 FINAL SUMMARY</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Type</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Total Sensible Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.loadSummary.totalSensible * 24 * 3600 / 1000).toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.totalSensible.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Total Latent Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.loadSummary.totalLatent * 24 * 3600 / 1000).toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.totalLatent.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>SHR (Sensible Heat Ratio)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.loadSummary.SHR.toFixed(3)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Total Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.loadSummary.totalBeforeSafety * 24 * 3600 / 1000).toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.totalBeforeSafety.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Safety Factor (10%)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.loadSummary.safetyFactor * 24 * 3600 / 1000).toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.safetyFactor.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.finalRow]}>
              <Text style={[styles.tableCellFinal, { flex: 3 }]}>FINAL CAPACITY REQUIRED</Text>
              <Text style={[styles.tableCellFinal, { flex: 2 }]}>{(results.loadSummary.finalLoad * 24 * 3600 / 1000).toFixed(0)}</Text>
              <Text style={[styles.tableCellFinal, { flex: 1 }]}>{results.loadSummary.finalLoad.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Required Air Circulation</Text>
            <Text style={styles.infoText}>• Total Air Flow: {results.conditions.totalAirFlow.toFixed(0)} CFM</Text>
            <Text style={styles.infoText}>• Air Flow per Fan: {results.conditions.airFlowPerFan.toFixed(0)} CFM</Text>
            <Text style={styles.infoText}>• Number of Fans: {results.breakdown.internal.fanMotor / parseFloat(results.productData?.fanMotorRating || '0.37')} units</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Storage Capacity</Text>
            <Text style={styles.infoText}>• Maximum Capacity: {results.storageCapacity.maximum.toFixed(0)} kg</Text>
            <Text style={styles.infoText}>• Current Utilization: {results.storageCapacity.utilization.toFixed(1)}%</Text>
            <Text style={styles.infoText}>• Storage Type: {results.storageCapacity.storageType}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Construction Details</Text>
            <Text style={styles.infoText}>• Insulation: {results.construction.type}</Text>
            <Text style={styles.infoText}>• Wall Thickness: {results.construction.thickness}mm</Text>
            <Text style={styles.infoText}>• Floor Thickness: {results.construction.floorThickness}mm</Text>
            <Text style={styles.infoText}>• U-Factor: {results.construction.uFactor.toFixed(3)} W/m²K</Text>
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
  tableCard: {
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
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
    paddingTop: 8,
  },
  finalRow: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
    marginTop: 8,
    paddingTop: 12,
    borderRadius: 8,
  },
  tableCell: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  tableCellBold: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '600',
    textAlign: 'center',
  },
  tableCellFinal: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '700',
    textAlign: 'center',
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