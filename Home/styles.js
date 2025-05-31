import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  filterRow: { flexDirection: 'row', marginBottom: 12, justifyContent: 'center' },
  filterBtn: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  filterBtnActive: {
    backgroundColor: '#007AFF',
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E3',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  selectedBill: {
    borderWidth: 2,
    borderColor: '#FFD600',
  },
  row: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  info: { marginLeft: 12, flex: 1 },
  label: { fontWeight: 'bold' },
  paymentBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});

export default styles;