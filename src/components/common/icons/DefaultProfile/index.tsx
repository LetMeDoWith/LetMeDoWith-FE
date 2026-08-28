import React from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect, SvgProps } from 'react-native-svg';

import { theme } from 'styles/theme';

/* 원본 SVG 좌표계. rx도 이 단위로 받는다(화면 px이 아님) */
const VIEW_BOX_SIZE = 107;

/*
 * 프로필 이미지를 등록하지 않은 사용자에게 보여주는 기본 프로필.
 *
 * 몸통 path가 도형 밖으로 넘어가므로 잘라내야 하는데, mask 대신 ClipPath를 쓴다.
 * react-native-svg의 Mask는 안드로이드에서 오프스크린 비트맵으로 래스터화돼
 * 크게 렌더할수록 뭉개진다(iOS는 정상). ClipPath는 네이티브 클립이라 선명도가 유지된다.
 */
const DefaultProfile = ({
  width = VIEW_BOX_SIZE,
  height = VIEW_BOX_SIZE,
  fill = theme.COLORS.GRAY_SCALE.GRAY_96,
  backgroundFill = '#EAEAEC',
  rx = 44,
}: Pick<SvgProps, 'width' | 'height'> & {
  fill?: string;
  backgroundFill?: string;
  /* 모서리 반경(viewBox 107 기준). 절반(53.5)이면 원이 된다. */
  rx?: number;
}) => (
  <Svg width={width} height={height} viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`} fill="none">
    <Defs>
      <ClipPath id="defaultProfileClip">
        <Rect width={VIEW_BOX_SIZE} height={VIEW_BOX_SIZE} rx={rx} />
      </ClipPath>
    </Defs>
    <G clipPath="url(#defaultProfileClip)">
      {/* 모서리는 ClipPath가 만든다. 배경까지 rx를 주면 같은 곡선이 두 번 안티에일리어싱되면서
          안드로이드에서 경계가 어긋나 바탕이 비친다. */}
      <Rect width={VIEW_BOX_SIZE} height={VIEW_BOX_SIZE} fill={backgroundFill} />
      <Circle cx="54.0078" cy="48" r="20" fill={fill} />
      <Path
        d="M24 98C24 84.1929 35.1929 73 49 73H59C72.8071 73 84 84.1929 84 98C84 111.807 72.8071 123 59 123H49C35.1929 123 24 111.807 24 98Z"
        fill={fill}
      />
    </G>
  </Svg>
);

export { DefaultProfile, VIEW_BOX_SIZE as DEFAULT_PROFILE_VIEW_BOX_SIZE };
