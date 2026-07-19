import { useEffect, useState } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { SvgXml } from 'react-native-svg';

import { fetchAndCacheSvgXml, getCachedSvgXml, isSvgUri } from 'utils/feedbackSvgCache';

/*
 * 잔소리 템플릿 이모지 렌더러.
 * FastImage는 SVG를 렌더하지 못하므로, URL이 .svg면 SvgXml로, 그 외(png 등)는 FastImage로 그린다.
 * 이모지는 정사각형이라 size 하나로 width/height를 지정한다.
 */
interface FeedbackSvgProps {
  uri: string;
  size: number;
}

const FeedbackSvg = ({ uri, size }: FeedbackSvgProps) => {
  // 캐시에 있으면 초기값으로 즉시 렌더(깜빡임 없음), 없으면 fetch 후 표시
  const [xml, setXml] = useState<string | null>(() => getCachedSvgXml(uri));

  useEffect(() => {
    let cancelled = false;
    fetchAndCacheSvgXml(uri).then(text => {
      if (!cancelled && text) {
        setXml(text);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [uri]);

  // 로드 전엔 같은 크기의 자리표시자로 레이아웃 흔들림 방지
  if (!xml) {
    return <View style={{ width: size, height: size }} />;
  }

  return <SvgXml xml={xml} width={size} height={size} />;
};

interface Props {
  uri: string;
  size: number;
}

const FeedbackEmoji = ({ uri, size }: Props) =>
  isSvgUri(uri) ? (
    <FeedbackSvg uri={uri} size={size} />
  ) : (
    <FastImage source={{ uri }} style={{ width: size, height: size }} />
  );

export { FeedbackEmoji, FeedbackSvg, isSvgUri };
