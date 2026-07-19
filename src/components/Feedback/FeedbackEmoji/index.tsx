import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { fetchAndCacheSvgXml, getCachedSvgXml } from 'utils/feedbackSvgCache';

/*
 * 잔소리 템플릿 이모지 렌더러(SVG 전용 — 잔소리 이모지는 SVG로 통일).
 * URL별 SVG XML을 세션 캐시(재요청 방지)로 받아 SvgXml로 그린다. 이모지는 정사각형이라 size 하나로 width/height를 지정한다.
 */
interface Props {
  uri: string;
  size: number;
}

const FeedbackEmoji = ({ uri, size }: Props) => {
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

export { FeedbackEmoji };
