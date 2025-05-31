// styles/paymentManualStyles.js
import { StyleSheet } from 'react-native';

const paymentStyles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff5f8',
    alignItems: 'center',
    flexGrow: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#222',
  },
  phone: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  amountBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 12,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 14,
    color: '#333',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e53935",
  },
  noteBox: {
    backgroundColor: "#fffbea",
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffd54f",
  },
  noteLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  copyBtn: {
    fontSize: 20,
    marginLeft: 8,
  },
  warning: {
    fontSize: 12,
    color: "#c62828",
    marginTop: 6,
  },
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    elevation: 3,
    marginBottom: 24,
  },
  qrImage: {
    width: 260,
    height: 260,
    borderRadius: 12,
  },
  chooseButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 16,
  },
  chooseButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  previewImage: {
    width: 220,
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  sendButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default paymentStyles;
