import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();

  const menuItems = [
    {
      title: 'Payments',
      icon: 'cash',
      description: 'View and make payments',
      onPress: () => navigation.navigate('Payments'),
    },
    {
      title: 'Parking',
      icon: 'car',
      description: 'Manage parking registrations',
      onPress: () => navigation.navigate('Parking'),
    },
    {
      title: 'Locker',
      icon: 'locker',
      description: 'Check your locker items',
      onPress: () => navigation.navigate('Locker'),
    },
    {
      title: 'Complaints',
      icon: 'message-alert',
      description: 'Submit complaints or feedback',
      onPress: () => navigation.navigate('Complaints'),
    },
    {
      title: 'Surveys',
      icon: 'clipboard-text',
      description: 'Participate in surveys',
      onPress: () => navigation.navigate('Surveys'),
    },
    {
      title: 'Chat',
      icon: 'chat',
      description: 'Chat with management',
      onPress: () => navigation.navigate('Chat'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title>Welcome, {user?.username}!</Title>
          <Paragraph>What would you like to do today?</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <Card
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Card.Content style={styles.menuContent}>
              <MaterialCommunityIcons
                name={item.icon}
                size={32}
                color={theme.colors.primary}
              />
              <Title style={styles.menuTitle}>{item.title}</Title>
              <Paragraph style={styles.menuDescription}>
                {item.description}
              </Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeCard: {
    margin: 16,
    elevation: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    marginBottom: 16,
  },
  menuContent: {
    alignItems: 'center',
    padding: 16,
  },
  menuTitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  menuDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default HomeScreen;
