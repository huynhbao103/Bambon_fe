import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  chartContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    margin: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  totalBlock: {
    alignItems: 'center',
    padding: 8,
    minWidth: 100,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginVertical: 4,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginLeft: 8,
    marginBottom: 8,
  },
  chartCard: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 12,
    elevation: 1,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f1f3f5',
  },
  activeFilter: {
    backgroundColor: '#4263eb',
  },
  filterText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  scrollContainer: {
    paddingHorizontal: 8,
  },
  noDataText: {
    textAlign: 'center',
    color: '#6c757d',
    marginVertical: 20,
    fontSize: 16,
  },
  balancePositive: {
    color: '#2ecc71',
  },
  balanceNegative: {
    color: '#e74c3c',
  },
});