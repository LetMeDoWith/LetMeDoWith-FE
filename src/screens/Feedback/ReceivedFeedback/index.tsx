import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReceivedFeedbackContent } from 'components/Feedback/ReceivedFeedbackContent';
import { ReceivedFeedbackEmpty } from 'components/Feedback/ReceivedFeedbackEmpty';
import { TaskInfoHeader } from 'components/Feedback/TaskInfoHeader';
import { useFetchDowithTaskFeedbackAggregates } from 'hooks/queries/feedback/useFetchDowithTaskFeedbackAggregates';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';
import { useDowithCertification } from 'hooks/shared/useDowithCertification';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';
import { theme } from 'styles/theme';
import type { RootStackScreenProps } from 'types/shared';

const CERTIFY_BUTTON_HEIGHT = 52;
const CERTIFY_BAR_TOP_SPACE = 12;
const CERTIFY_BAR_BOTTOM_SPACE = 20;
/* 세이프에어리어를 뺀 하단 고정 버튼 영역의 높이. 목록 끝 여백을 여기에 맞춰야 마지막 항목이 버튼에 가려지지 않는다 */
const CERTIFY_BAR_VERTICAL_SPACE = CERTIFY_BAR_TOP_SPACE + CERTIFY_BUTTON_HEIGHT + CERTIFY_BAR_BOTTOM_SPACE;

const ReceivedFeedback = ({ navigation, route }: RootStackScreenProps<'RECEIVED_FEEDBACK'>) => {
  // 딥링크로 진입하면 dowithTaskId가 문자열로 전달될 수 있어 숫자로 보정
  const dowithTaskId = Number(route.params.dowithTaskId);
  const { bottom } = useSafeAreaInsets();

  // 상태칩/제목은 상세 조회로 채운다 (Item 진입 시에는 캐시된 값이 즉시 사용됨)
  const { data: dowithTask } = useFetchDowithTask({ dowithTaskId });
  /* 목록 쪽과 같은 쿼리라 추가 요청 없이 캐시를 읽는다 */
  const { data: aggregates } = useFetchDowithTaskFeedbackAggregates(dowithTaskId);
  const { certify } = useDowithCertification(dowithTaskId);

  // 인증 완료(성공) 태스크로 딥링크 진입한 경우 응원 모아보기 화면으로 대체 이동
  useEffect(() => {
    const successImageUrl = dowithTask?.successImageUrls?.[0];
    if (successImageUrl) {
      navigation.replace('CHEER_COLLECTION', { dowithTaskId, successImageUrl });
    }
  }, [dowithTask, dowithTaskId, navigation]);

  const title = dowithTask?.title ?? '';
  const status = dowithTask?.status ?? TASK_STATUS_ENUM.enum.WAIT;

  /*
   * 인증 전에만 인증을 유도한다. 실패한 태스크는 더 이상 인증할 수 없다.
   * 받은 잡도리가 없으면 목록 자리에 유도 화면이 들어가므로, 하단 고정 버튼은 잡도리가 있을 때만 띄운다.
   *
   * 두 응답이 모두 도착하기 전에는 아무것도 띄우지 않는다. 기본값(WAIT·잡도리 없음)으로 판단하면
   * 실패한 태스크나 잡도리가 있는 태스크에서도 유도 화면이 잠깐 스쳤다가 사라진다.
   */
  const isLoaded = Boolean(dowithTask) && Boolean(aggregates);
  const canCertify = isLoaded && status === TASK_STATUS_ENUM.enum.WAIT;
  const hasFeedback = (aggregates?.length ?? 0) > 0;

  const showCertifyBar = canCertify && hasFeedback;
  /* 하단 고정 버튼이 뜨는 만큼 목록 끝에도 같은 높이를 비워야, 스크롤 끝의 마지막 항목이 버튼에 가려지지 않는다 */
  const certifyBarHeight = CERTIFY_BAR_VERTICAL_SPACE + bottom;

  return (
    <View style={styles.container}>
      <ReceivedFeedbackContent
        dowithTaskId={dowithTaskId}
        headerComponent={<TaskInfoHeader title={title} status={status} />}
        emptyComponent={canCertify && !hasFeedback ? <ReceivedFeedbackEmpty onCertify={certify} /> : undefined}
        contentContainerStyle={[styles.listContent, showCertifyBar && { paddingBottom: certifyBarHeight }]}
      />
      {showCertifyBar && (
        <View style={[styles.certifyButtonWrap, { paddingBottom: bottom + CERTIFY_BAR_BOTTOM_SPACE }]}>
          <Pressable style={styles.certifyButton} onPress={certify}>
            <Text style={styles.certifyButtonText}>바로 인증하기</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  certifyButtonWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: CERTIFY_BAR_TOP_SPACE,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  certifyButton: {
    height: CERTIFY_BUTTON_HEIGHT,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLORS.PRIMARY.RED_60,
  },
  certifyButtonText: {
    ...theme.TYPOGRAPHY.BODY_1,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { ReceivedFeedback };
