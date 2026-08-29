import React from 'react';
import { StyleProp, StyleSheet, View } from 'react-native';
import FastImage, { ImageStyle } from 'react-native-fast-image';

import { DefaultProfile, DEFAULT_PROFILE_VIEW_BOX_SIZE } from 'components/common/icons/DefaultProfile';

interface Props {
  /* 서버가 내려주는 프로필 이미지 URL. 미등록 사용자는 null이거나 빈 문자열이다. */
  uri?: string | null;
  /* 기본 프로필(SVG) 렌더 크기. FastImage는 SVG를 받지 못해 조건부로 갈아끼우므로 별도로 받는다. */
  size: number;
  /* 기존 호출부의 FastImage 스타일(모서리·여백 등)을 그대로 유지하기 위한 패스스루 */
  style?: StyleProp<ImageStyle>;
}

/*
 * 프로필 이미지를 등록하지 않은 사용자에게 기본 프로필을 보여준다.
 * fallback 판단을 이 컴포넌트 한 곳에 모아 호출부마다 분기를 복제하지 않는다.
 */
const ProfileImage = ({ uri, size, style }: Props) => {
  if (!uri) {
    const flattenedStyle = StyleSheet.flatten(style);
    /*
     * 사진과 모서리·테두리를 맞추기 위해 호출부 스타일 값을 그대로 가져다 쓴다.
     * SVG 자체는 테두리를 그릴 수 없어 감싸는 View에 옮기고, SVG는 테두리 안쪽 크기로 그린다.
     */
    const borderRadius = flattenedStyle?.borderRadius ?? 0;
    const borderWidth = flattenedStyle?.borderWidth ?? 0;
    const innerSize = size - borderWidth * 2;
    /* 스타일은 화면 px 단위이므로 SVG viewBox 단위로 환산하고, 절반을 넘으면 원이 되도록 자른다. */
    const rx = Math.min((borderRadius * DEFAULT_PROFILE_VIEW_BOX_SIZE) / innerSize, DEFAULT_PROFILE_VIEW_BOX_SIZE / 2);

    return (
      <View
        style={[
          styles.defaultWrapper,
          { width: size, height: size, borderRadius, borderWidth, borderColor: flattenedStyle?.borderColor },
        ]}
      >
        <DefaultProfile width={innerSize} height={innerSize} rx={rx} />
      </View>
    );
  }

  return <FastImage style={style} source={{ uri }} />;
};

const styles = StyleSheet.create({
  defaultWrapper: {
    overflow: 'hidden',
  },
});

export { ProfileImage };
