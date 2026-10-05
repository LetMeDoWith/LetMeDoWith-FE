import React from 'react';
import { Image, type ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

import { theme } from 'styles/theme';
import { ArrowLeft } from 'components/common/icons/ArrowIcon';
import type { ErrorVariant } from 'utils/error';

import errorNetworkImage from 'assets/images/error_network.png';
import errorDataImage from 'assets/images/error_data.png';

const CONTENT: Record<ErrorVariant, { image: ImageSourcePropType; title: string; description: string }> = {
  NETWORK: {
    image: errorNetworkImage,
    title: '인터넷 연결을 확인해주세요.',
    description: '연결이 잠시 끊겼어요.\n인터넷 연결을 확인하고 다시 시도해 주세요.',
  },
  DEFAULT: {
    image: errorDataImage,
    title: '데이터를 불러오지 못했어요.',
    description: '불러오기에 실패했어요.\n잠시 후 다시 시도해 주세요.',
  },
};

/*
 * 앱 시작 시점의 상단 안전 영역. 루트 대체 화면은 SafeAreaProvider 밖에서 그려져 훅을 쓸 수 없으므로
 * Provider 없이 읽을 수 있는 초기값을 쓴다(회전을 지원하지 않아 값이 바뀌지 않는다).
 */
const SAFE_AREA_TOP = initialWindowMetrics?.insets.top ?? 0;

interface Props {
  variant: ErrorVariant;
  onRetry: () => void;
  /* 네비게이터 헤더 없이 화면 맨 위부터 덮을 때(홈·로그인·루트 대체 화면) 노치만큼 내려 가운데를 맞춘다 */
  withSafeAreaTop?: boolean;
  /* 헤더까지 에러 화면으로 바뀌어 나갈 수단이 사라지는 화면(할 일 수정)에서만 넘긴다 — 왼쪽 위에 뒤로가기를 그린다 */
  onBack?: () => void;
}

/*
 * 화면 렌더 에러·핵심 데이터 첫 로딩 실패 시 화면 내용 자리를 대신하는 에러 화면.
 * 네비게이터 헤더·탭바를 뺀 영역의 정중앙에 놓는다.
 * 루트 대체 화면으로도 쓰이므로 Provider 컨텍스트(테마 훅·안전 영역 훅·다이얼로그)를 쓰지 않는다.
 */
const ErrorFallback = ({ variant, onRetry, withSafeAreaTop = false, onBack }: Props) => {
  const { image, title, description } = CONTENT[variant];

  return (
    <View style={[styles.container, withSafeAreaTop && { paddingTop: SAFE_AREA_TOP }]}>
      {onBack && (
        <Pressable testID="error-fallback-back" style={styles.backButton} onPress={onBack} hitSlop={8}>
          <ArrowLeft width={24} height={24} />
        </Pressable>
      )}
      <Image source={image} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Pressable testID="error-fallback-retry" style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>다시 시도하기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  /* 네비게이터 헤더의 뒤로가기(BackButton)와 같은 위치·크기 */
  backButton: {
    position: 'absolute',
    top: SAFE_AREA_TOP + 12,
    left: 16,
  },
  image: {
    width: 172,
    height: 100,
  },
  title: {
    ...theme.TYPOGRAPHY.TITLE_3,
    marginTop: 24,
    textAlign: 'center',
  },
  description: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_40,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  retryText: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.DEFAULT.BLACK,
  },
});

export { ErrorFallback };
