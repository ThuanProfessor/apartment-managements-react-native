import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Surface, Text, Title, Card, Avatar, useTheme, IconButton } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const theme = useTheme();

  const quickActions = [
    { title: 'Hóa Đơn', icon: 'credit-card-outline', color: '#4CAF50', route: 'Bill' },
    { title: 'Phản Ánh', icon: 'message-badge-outline', color: '#F44336', route: 'Complaints' },
    { title: 'Tủ Đồ', icon: 'locker-multiple', color: '#2196F3', route: 'Locker' },
    { title: 'Khảo Sát', icon: 'clipboard-text-outline', color: '#FF9800', route: 'Surveys' },
    { title: 'Thẻ thân nhân', icon: 'car-outline', color: '#9C27B0', route: 'RelativeCardRequest' },
    { title: 'Chat', icon: 'chat-outline', color: '#00BCD4', route: 'Chat' }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* */}
      <Surface style={styles.headerCard} elevation={2}>
        <View style={styles.welcomeSection}>
          <Avatar.Icon size={60} icon="account-circle" style={{ backgroundColor: theme.colors.primary }} />
          <View style={styles.welcomeText}>
            <Title>Xin chào, {user?.username || 'Cư dân'}!</Title>
            <Text>Chúc bạn một ngày tốt lành</Text>
          </View>
        </View>
      </Surface>

      {/* Truy cập nhanh */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Thao tác nhanh</Title>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <Card
              key={index}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.route)}
            >
              <Card.Content style={styles.actionContent}>
                <IconButton
                  icon={action.icon}
                  size={32}
                  iconColor={action.color}
                  style={styles.actionIcon}
                />
                <Text style={styles.actionTitle}>{action.title}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {/* Hoạt động gần đây */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Hoạt động gần đây</Title>
        <Card style={styles.activityCard}>
          <Card.Content>
            <View style={styles.activity}>
              <Avatar.Icon size={40} icon="cash" style={{ backgroundColor: '#4CAF50' }} />
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>Thanh toán tiền điện tháng 5</Text>
                <Text style={styles.activityTime}>2 giờ trước</Text>
              </View>
              <Text style={[styles.activityAmount, { color: '#4CAF50' }]}>500,000 đ</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Thông báo */}
      <Card style={styles.notificationCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#1976D2" />
            <Title style={styles.cardTitle}>Thông báo</Title>
          </View>
          <Text style={styles.emptyText}>Không có thông báo mới</Text>
        </Card.Content>
      </Card>

      {/*  */}
      <View style={[styles.section, styles.lastSection]}>
        <Title style={styles.sectionTitle}>Thông báo</Title>
        <Card style={styles.announcementCard}>
          <Card.Content>
            <Text style={styles.announcementTitle}>Bảo trì hệ thống nước</Text>
            <Text style={styles.announcementTime}>Hôm nay, 14:00 - 17:00</Text>
            <Text style={styles.announcementDesc}>
              Kính gửi quý cư dân, chúng tôi sẽ tiến hành bảo trì hệ thống nước trong khu vực...
            </Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    marginLeft: 16,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  lastSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
  },
  actionContent: {
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  activityCard: {
    borderRadius: 12,
    marginBottom: 8,
  },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDetails: {
    flex: 1,
    marginLeft: 16,
  },
  activityTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#757575',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  announcementCard: {
    borderRadius: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  announcementTime: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  announcementDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HomeScreen;
