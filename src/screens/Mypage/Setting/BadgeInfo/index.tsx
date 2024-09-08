import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';

import { Badge } from 'components/Mypage/Badge';
import { theme } from 'styles/theme';

const mockData = Array(9)
  .fill(undefined)
  .map((_, index) => ({
    uri: 'https://media.bunjang.co.kr/images/crop/981758465_w320.jpg',
    name: `test 뱃지${index + 1}`,
  }));

const size = Dimensions.get('window').width / 3 - 48;

const BadgeInfo = () => {
  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>나의 대표 뱃지</Text>
        <Text style={styles.subTitle}>피드에 노출되는 대표 뱃지입니다.</Text>
      </View>
      <Badge uri={'https://media.bunjang.co.kr/images/crop/981758465_w320.jpg'} name={'프로 미룸러'} size={size} />

      <Divider style={styles.divider} />
      <Text>* 대표 뱃지 포함 최대 4개까지 노출할 수 있습니다.</Text>
      <FlatList
        style={{ width: '100%', marginTop: 32 }}
        data={mockData}
        renderItem={({ item: { uri, name } }) => <Badge uri={uri} name={name} size={size} />}
        keyExtractor={({ name }) => name}
        numColumns={3}
        ItemSeparatorComponent={() => <View style={{ marginTop: 32 }}></View>}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  titleWrap: {
    gap: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: theme.COLORS.DEFAULT.BLACK,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subTitle: {
    color: theme.COLORS.GRAY_SCALE.GRAY_600,
  },
  divider: {
    width: '100%',
    marginVertical: 14,
    borderWidth: 0.5,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_300,
    borderStyle: 'dashed',
  },
});

export { BadgeInfo };
