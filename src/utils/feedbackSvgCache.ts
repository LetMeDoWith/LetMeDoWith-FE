/*
 * 잔소리 템플릿 SVG 이모지의 세션 인메모리 캐시.
 * SvgXml 렌더 시 매번 fetch하지 않도록 URL별 XML을 캐시하고, 템플릿 목록 로드 시 프리로드로 미리 워밍한다.
 * (앱 재시작 시 초기화됨)
 */
const svgXmlCache = new Map<string, string>();

const isSvgUri = (uri?: string | null): uri is string => !!uri && uri.split('?')[0].toLowerCase().endsWith('.svg');

const getCachedSvgXml = (uri: string) => svgXmlCache.get(uri) ?? null;

/*
 * SVG XML을 받아 캐시에 저장하고 반환한다. 이미 캐시에 있으면 fetch 없이 캐시값을 반환한다.
 */
const fetchAndCacheSvgXml = async (uri: string): Promise<string | null> => {
  const cached = svgXmlCache.get(uri);
  if (cached) {
    return cached;
  }

  try {
    const text = await fetch(uri).then(response => response.text());
    svgXmlCache.set(uri, text);
    return text;
  } catch {
    return null;
  }
};

/*
 * 여러 이모지 URL 중 아직 캐시에 없는 SVG만 미리 fetch해 캐시를 워밍한다(첫 렌더 지연 제거).
 */
const preloadFeedbackSvgs = (uris: (string | null | undefined)[]) => {
  uris.forEach(uri => {
    if (isSvgUri(uri) && !svgXmlCache.has(uri)) {
      fetchAndCacheSvgXml(uri);
    }
  });
};

export { isSvgUri, getCachedSvgXml, fetchAndCacheSvgXml, preloadFeedbackSvgs };
