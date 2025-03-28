import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa"
  },
  loader: { 
    marginTop: 10 
  },
  header: { 
    backgroundColor: "#28a745",
    padding: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  headerTop: { 
    flexDirection: "row", 
    alignItems: "center",
    marginBottom: 15
  },
  profileImage: { 
    width: 55, 
    height: 55, 
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: "#fff" 
  },
  userInfo: { 
    marginLeft: 15, 
    flex: 1 
  },
  welcomeText: { 
    color: "#e9ecef",
    fontSize: 14,
    marginBottom: 3
  },
  userName: { 
    color: "#fff", 
    fontSize: 20, 
    fontWeight: "bold",
    letterSpacing: 0.5
  },
  balanceContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 15
  },
  balanceBlock: { 
    flex: 1,
    alignItems: "center" 
  },
  balanceLabel: { 
    color: "#e9ecef",
    fontSize: 13,
    marginBottom: 5
  },
  balanceAmount: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 18,
    letterSpacing: 0.5
  },
  budgetContainer: { 
    marginTop: 15, 
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 10
  },
  budgetText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "500" 
  },
  settingsButton: {
    padding: 5,
  },
  chartContainer: {
    marginTop: 25,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  chartTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#2d3436", 
    marginBottom: 15 
  },
  chart: { 
    borderRadius: 16,
    marginTop: 10
  },
  filterContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginTop: 20, 
    marginBottom: 15,
    paddingHorizontal: 10
  },
  filterButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 18, 
    borderRadius: 25, 
    backgroundColor: "#f1f3f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  activeFilter: { 
    backgroundColor: "#28a745",
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  filterText: { 
    color: "#495057", 
    fontWeight: "600",
    fontSize: 13
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "600",
  },
  transactionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 20,
    alignItems: "center"
  },
  transactionTitle: { 
    fontSize: 20, 
    fontWeight: "bold",
    color: "#2d3436"
  },
  showMoreText: { 
    color: "#28a745",
    fontWeight: "600"
  },
  emptyText: { 
    textAlign: "center", 
    color: "#868e96", 
    marginTop: 15,
    fontSize: 15
  },
  transactionItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 18,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3
  },
  transactionInfo: { 
    flex: 1, 
    marginLeft: 12 
  },
  transactionCategory: { 
    fontWeight: "bold",
    fontSize: 16,
    color: "#2d3436",
    marginBottom: 4
  },
  transactionDate: { 
    color: "#868e96",
    fontSize: 13
  },
  transactionAmount: { 
    fontWeight: "bold",
    fontSize: 16
  },
  incomeColor: { 
    color: "#2ecc71" 
  },
  expenseColor: { 
    color: "#e74c3c" 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: "center", 
    backgroundColor: "rgba(0,0,0,0.6)" 
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20, 
    color: "#2d3436",
    textAlign: "center"
  },
  sectionTitle: { 
    fontSize: 17, 
    fontWeight: "600", 
    marginBottom: 12, 
    color: "#2d3436" 
  },
  editContainer: { 
    paddingBottom: 15 
  },
  inputGroup: { 
    marginBottom: 18 
  },
  inputLabel: { 
    fontSize: 15, 
    fontWeight: "500", 
    color: "#495057", 
    marginBottom: 8 
  },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
    color: "#495057"
  },
  itemCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  itemField: { 
    marginBottom: 12 
  },
  itemLabel: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#495057", 
    marginBottom: 6 
  },
  itemInput: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#495057"
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  itemText: { 
    fontSize: 15, 
    color: "#495057" 
  },
  modalTotal: { 
    fontWeight: "bold", 
    fontSize: 18, 
    marginTop: 20, 
    color: "#2d3436",
    textAlign: "right"
  },
  noItemsText: { 
    fontSize: 15, 
    color: "#868e96", 
    textAlign: "center",
    marginVertical: 20
  },
  modalButtons: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 25 
  },
  saveButton: { 
    backgroundColor: "#28a745", 
    paddingVertical: 14, 
    paddingHorizontal: 25, 
    borderRadius: 12, 
    flex: 1, 
    marginRight: 8,
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  cancelButton: { 
    backgroundColor: "#6c757d", 
    paddingVertical: 14, 
    paddingHorizontal: 25, 
    borderRadius: 12, 
    flex: 1, 
    marginLeft: 8 
  },
  editButton: { 
    backgroundColor: "#007bff", 
    paddingVertical: 14, 
    paddingHorizontal: 25, 
    borderRadius: 12, 
    flex: 1, 
    marginRight: 8,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  deleteButton: { 
    backgroundColor: "#dc3545", 
    paddingVertical: 14, 
    paddingHorizontal: 25, 
    borderRadius: 12, 
    flex: 1, 
    marginHorizontal: 8 
  },
  closeButton: { 
    backgroundColor: "#28a745", 
    paddingVertical: 14, 
    paddingHorizontal: 25, 
    borderRadius: 12, 
    flex: 1, 
    marginLeft: 8,
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  addItemButton: {
    backgroundColor: "#17a2b8",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#17a2b8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  removeItemButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16, 
    textAlign: "center" 
  },
  closeButtonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16 
  },
  closeModalButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    margin: 20,
    shadowColor: "#dc3545",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  closeModalText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16
  },
  loadingMore: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  transactionListContainer: {
    flex: 1,
    minHeight: 400,
    maxHeight: 600,
    marginBottom: 20
  },
  chartSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  totalBlock: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  legendContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#7F7F7F',
  },
  legendCategory: {
    fontSize: 14,
    color: '#333',
  },
  legendAmount: {
    fontSize: 12,
    marginTop: 2,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});
