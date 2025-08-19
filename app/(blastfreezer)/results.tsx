import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { calculateBlastFreezerLoad } from '@/utils/blastFreezerCalculations';

export default function BlastFreezerResultsScreen() {
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
      const roomData = await AsyncStorage.getItem('blastFreezerRoomData');
      const conditionsData = await AsyncStorage.getItem('blastFreezerConditionsData');
      const constructionData = await AsyncStorage.getItem('blastFreezerConstructionData');
      const productData = await AsyncStorage.getItem('blastFreezerProductData');
      const usageData = await AsyncStorage.getItem('blastFreezerUsageData');

      const room = roomData ? JSON.parse(roomData) : { 
        length: '5.0', breadth: '5.0', height: '3.5', doorWidth: '2.1', doorHeight: '2.1'
      };
      
      const conditions = conditionsData ? JSON.parse(conditionsData) : { 
        ambientTemp: '43', roomTemp: '-35', batchHours: '8', operatingHours: '24'
      };
      
      const construction = constructionData ? JSON.parse(constructionData) : {
        insulationType: 'PUF', wallThickness: 150, ceilingThickness: 150, 
        floorThickness: 150, internalFloorThickness: '150'
      };
      
      const product = productData ? JSON.parse(productData) : { 
        productType: 'Chicken', capacityRequired: '2000', incomingTemp: '-5', outgoingTemp: '-30',
        storageCapacity: '4', numberOfPeople: '2', workingHours: '4',
        lightLoad: '0.1', fanMotorRating: '0.37'
      };

      const usage = usageData ? JSON.parse(usageData) : {
        peripheralHeatersQty: '1', peripheralHeatersCapacity: '1.5',
        doorHeatersQty: '1', doorHeatersCapacity: '0.27',
        trayHeatersQty: '1', trayHeatersCapacity: '2.2',
        drainHeatersQty: '1', drainHeatersCapacity: '0.04'
      };

      // Merge all data
      const roomWithConstruction = { ...room, ...construction };
      const productWithUsage = { ...product, ...usage };

      const calculatedResults = calculateBlastFreezerLoad(roomWithConstruction, conditions, productWithUsage);
      setResults(calculatedResults);
      setLoading(false);
    } catch (error) {
      console.error('Error calculating blast freezer results:', error);
      setLoading(false);
    }
  };

  if (loading || !results) {
    return (
      <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={styles.container}>
        <Header title="Blast Freezer Results" step={5} totalSteps={5} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={styles.container}>
      <Header title="Blast Freezer Results" step={5} totalSteps={5} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainResultCard}>
          <Text style={styles.mainResultTitle}>❄️ BLAST FREEZER LOAD CALCULATION</Text>
          <Text style={styles.mainResultValue}>{results.loadSummary.finalLoadTR.toFixed(2)} TR</Text>
          <Text style={styles.mainResultSubtitle}>Power: {results.loadSummary.finalLoadKW.toFixed(2)} kW</Text>
          <Text style={styles.mainResultSubtitle}>Daily Energy: {results.dailyEnergyConsumption.toFixed(1)} kWh</Text>
          <Text style={styles.mainResultSubtitle}>Heat Removal: {results.totalBTU.toFixed(0)} BTU/hr</Text>
          <Text style={styles.mainResultSubtitle}>Safety Factor: {results.loadSummary.safetyPercentage.toFixed(0)}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 TRANSMISSION LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Surface</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Area(m²)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>U-factor</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>ΔT</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>TR</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Walls</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.wall.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.construction.uFactors.walls.toFixed(3)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.walls.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.wallsTR.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Ceiling</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.ceiling.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.construction.uFactors.ceiling.toFixed(3)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.ceiling.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.ceilingTR.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Floor</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.floor.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.construction.uFactors.floor.toFixed(3)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.floor.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.floorTR.toFixed(3)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>TOTAL TRANSMISSION</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.transmission.total.toFixed(2)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.transmission.totalTR.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥩 PRODUCT LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>TR</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Sensible Heat (Above Frzg)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.sensibleAboveKJ.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.sensibleAbove.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Latent Heat (Freezing)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.latentKJ.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.latent.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Sensible Heat (Below Frzg)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.sensibleBelowKJ.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.sensibleBelow.toFixed(3)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>TOTAL PRODUCT LOAD</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{(results.breakdown.product.sensibleAboveKJ + results.breakdown.product.latentKJ + results.breakdown.product.sensibleBelowKJ).toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.product.total.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💨 AIR CHANGE LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Value</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>TR</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Air change rate</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.airChange.airChangeRate} changes/hr</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Enthalpy difference</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.airChange.enthalpyDiff} kJ/kg</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>Air change load</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{results.breakdown.airChange.totalKJDay.toFixed(0)} kJ/day</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.airChange.loadTR.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ INTERNAL LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>TR</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Occupancy Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.occupancyKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.occupancy.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Lighting Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.lightingKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.lighting.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Equipment Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.equipmentKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.equipment.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Peripheral Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.peripheralHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.peripheralHeaters.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Door Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.doorHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.doorHeaters.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Tray Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.trayHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.trayHeaters.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Drain Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.drainHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.drainHeaters.toFixed(3)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>TOTAL INTERNAL</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{(results.breakdown.internal.occupancyKJDay + results.breakdown.internal.lightingKJDay + results.breakdown.internal.equipmentKJDay + results.breakdown.internal.peripheralHeatersKJDay + results.breakdown.internal.doorHeatersKJDay + results.breakdown.internal.trayHeatersKJDay + results.breakdown.internal.drainHeatersKJDay).toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.internal.total.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 FINAL SUMMARY</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Type</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>kW</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>TR</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Transmission Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.transmission.total.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.totalTR.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Product Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.breakdown.product.total * 3.517).toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.total.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Air Change Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.airChange.loadKW.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.airChange.loadTR.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Internal Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.breakdown.internal.total * 3.517).toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.total.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Total Calculated</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.loadSummary.totalCalculatedKW.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.totalCalculatedTR.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Safety Factor (5%)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.loadSummary.safetyFactorKW.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.safetyFactorTR.toFixed(3)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.finalRow]}>
              <Text style={[styles.tableCellFinal, { flex: 3 }]}>FINAL CAPACITY REQUIRED</Text>
              <Text style={[styles.tableCellFinal, { flex: 2 }]}>{results.loadSummary.finalLoadKW.toFixed(2)}</Text>
              <Text style={[styles.tableCellFinal, { flex: 1 }]}>{results.loadSummary.finalLoadTR.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Blast Freezer Specifications Summary</Text>
            <Text style={styles.infoText}>• Dimensions: {results.dimensions.length}m × {results.dimensions.breadth}m × {results.dimensions.height}m</Text>
            <Text style={styles.infoText}>• Door size: {results.doorDimensions.width}m × {results.doorDimensions.height}m</Text>
            <Text style={styles.infoText}>• Room volume: {results.volume.toFixed(1)} m³</Text>
            <Text style={styles.infoText}>• Temperature difference: {results.temperatureDifference.toFixed(1)}°C</Text>
            <Text style={styles.infoText}>• Batch time: {results.batchHours} hours</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Construction Details</Text>
            <Text style={styles.infoText}>• Insulation: {results.construction.type}</Text>
            <Text style={styles.infoText}>• Wall thickness: {results.construction.wallThickness}mm</Text>
            <Text style={styles.infoText}>• Ceiling thickness: {results.construction.ceilingThickness}mm</Text>
            <Text style={styles.infoText}>• Floor thickness: {results.construction.floorThickness}mm</Text>
            <Text style={styles.infoText}>• Internal floor: {results.construction.internalFloorThickness}mm</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Product Information</Text>
            <Text style={styles.infoText}>• Product: {results.productInfo.type}</Text>
            <Text style={styles.infoText}>• Batch capacity: {results.productInfo.mass} kg</Text>
            <Text style={styles.infoText}>• Temperature range: {results.productInfo.incomingTemp}°C → {results.productInfo.outgoingTemp}°C</Text>
            <Text style={styles.infoText}>• Storage density: {results.storageCapacity.density} kg/m³</Text>
            <Text style={styles.infoText}>• Storage utilization: {results.storageCapacity.utilization.toFixed(1)}%</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Equipment Summary</Text>
            <Text style={styles.infoText}>• Total heater load: {results.equipmentSummary.totalHeaterLoad.toFixed(2)} kW</Text>
            <Text style={styles.infoText}>• Fan motor load: {results.equipmentSummary.totalFanLoad} kW</Text>
            <Text style={styles.infoText}>• Lighting load: {results.equipmentSummary.totalLightingLoad} kW</Text>
            <Text style={styles.infoText}>• People load: {results.equipmentSummary.totalPeopleLoad.toFixed(3)} kW</Text>
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
    backgroundColor: '#991B1B',
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
    color: '#FCA5A5',
    marginBottom: 8,
  },
  mainResultSubtitle: {
    fontSize: 14,
    color: '#FEE2E2',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#991B1B',
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
    borderBottomColor: '#DC2626',
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
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
    borderTopColor: '#DC2626',
    backgroundColor: '#FEF2F2',
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
    color: '#991B1B',
    fontWeight: '600',
    textAlign: 'center',
  },
  tableCellFinal: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '700',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 4,
  },
});