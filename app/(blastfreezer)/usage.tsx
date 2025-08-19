import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BLAST_FREEZER_DEFAULTS } from '@/constants/blastFreezerData';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';

export default function BlastFreezerUsageScreen() {
  const [usage, setUsage] = useState({
    // Heater specifications
    peripheralHeatersQty: BLAST_FREEZER_DEFAULTS.peripheralHeatersQty.toString(),
    peripheralHeatersCapacity: BLAST_FREEZER_DEFAULTS.peripheralHeatersCapacity.toString(),
    doorHeatersQty: BLAST_FREEZER_DEFAULTS.doorHeatersQty.toString(),
    doorHeatersCapacity: BLAST_FREEZER_DEFAULTS.doorHeatersCapacity.toString(),
    trayHeatersQty: BLAST_FREEZER_DEFAULTS.trayHeatersQty.toString(),
    trayHeatersCapacity: BLAST_FREEZER_DEFAULTS.trayHeatersCapacity.toString(),
    drainHeatersQty: BLAST_FREEZER_DEFAULTS.drainHeatersQty.toString(),
    drainHeatersCapacity: BLAST_FREEZER_DEFAULTS.drainHeatersCapacity.toString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  // Save data immediately when any input changes
  const handleInputChange = (key: keyof typeof usage, value: string) => {
    const newUsage = { ...usage, [key]: value };
    setUsage(newUsage);
    // Save immediately
    AsyncStorage.setItem('blastFreezerUsageData', JSON.stringify(newUsage)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('blastFreezerUsageData');
      if (saved) {
        setUsage(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading blast freezer usage data:', error);
    }
  };

  const totalPeripheralLoad = parseFloat(usage.peripheralHeatersQty) * parseFloat(usage.peripheralHeatersCapacity);
  const totalDoorLoad = parseFloat(usage.doorHeatersQty) * parseFloat(usage.doorHeatersCapacity);
  const totalTrayLoad = parseFloat(usage.trayHeatersQty) * parseFloat(usage.trayHeatersCapacity);
  const totalDrainLoad = parseFloat(usage.drainHeatersQty) * parseFloat(usage.drainHeatersCapacity);
  const totalHeaterLoad = totalPeripheralLoad + totalDoorLoad + totalTrayLoad + totalDrainLoad;

  return (
    <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={styles.container}>
      <Header title="Usage & Equipment" step={5} totalSteps={5} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peripheral Heaters</Text>
          
          <InputCard 
            label="Peripheral Heaters Quantity" 
            unit="nos" 
            value={usage.peripheralHeatersQty} 
            onChangeText={(value) => handleInputChange('peripheralHeatersQty', value)} 
          />
          
          <InputCard 
            label="Peripheral Heater Capacity" 
            unit="kW" 
            value={usage.peripheralHeatersCapacity} 
            onChangeText={(value) => handleInputChange('peripheralHeatersCapacity', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Door Heaters</Text>
          
          <InputCard 
            label="Door Heaters Quantity" 
            unit="nos" 
            value={usage.doorHeatersQty} 
            onChangeText={(value) => handleInputChange('doorHeatersQty', value)} 
          />
          
          <InputCard 
            label="Door Heater Capacity" 
            unit="kW" 
            value={usage.doorHeatersCapacity} 
            onChangeText={(value) => handleInputChange('doorHeatersCapacity', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tray Heaters</Text>
          
          <InputCard 
            label="Tray Heaters Quantity" 
            unit="nos" 
            value={usage.trayHeatersQty} 
            onChangeText={(value) => handleInputChange('trayHeatersQty', value)} 
          />
          
          <InputCard 
            label="Tray Heater Capacity" 
            unit="kW" 
            value={usage.trayHeatersCapacity} 
            onChangeText={(value) => handleInputChange('trayHeatersCapacity', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drain Heaters</Text>
          
          <InputCard 
            label="Drain Heaters Quantity" 
            unit="nos" 
            value={usage.drainHeatersQty} 
            onChangeText={(value) => handleInputChange('drainHeatersQty', value)} 
          />
          
          <InputCard 
            label="Drain Heater Capacity" 
            unit="kW" 
            value={usage.drainHeatersCapacity} 
            onChangeText={(value) => handleInputChange('drainHeatersCapacity', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Heater Load Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Peripheral Heaters:</Text>
              <Text style={styles.summaryValue}>{totalPeripheralLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Door Heaters:</Text>
              <Text style={styles.summaryValue}>{totalDoorLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tray Heaters:</Text>
              <Text style={styles.summaryValue}>{totalTrayLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Drain Heaters:</Text>
              <Text style={styles.summaryValue}>{totalDrainLoad.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>Total Heater Load:</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>{totalHeaterLoad.toFixed(2)} kW</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Blast Freezer Heater Guidelines</Text>
          <Text style={styles.infoText}>• Peripheral heaters: Prevent ice formation around room perimeter</Text>
          <Text style={styles.infoText}>• Door heaters: Essential for proper door sealing in extreme cold</Text>
          <Text style={styles.infoText}>• Tray heaters: Prevent product sticking to trays/shelves</Text>
          <Text style={styles.infoText}>• Drain heaters: Keep drainage systems functional</Text>
          <Text style={styles.infoText}>• Total heater load typically 3-8 kW for industrial units</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#DC2626',
    marginTop: 8,
    paddingTop: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    color: '#991B1B',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
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