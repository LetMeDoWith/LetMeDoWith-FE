import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import dayjs from 'dayjs';
import { launchCamera } from 'react-native-image-picker';

import { EtcDots } from 'components/common/icons/EtcDots';
import { theme } from 'styles/theme';
import type { RootStackParamList, TaskModeType } from 'types/shared';
import { BottomSheet } from 'components/common/BottomSheet';
import { TaskEdit } from 'components/common/icons/TaskEdit';
import { RoutineEdit } from 'components/common/icons/RoutineEdit';
import { TaskDelete } from 'components/common/icons/TaskDelete';
import type { TaskStatusEnumType } from 'types/task/scheme/enum';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';
import { Thunder } from 'components/common/icons/Thunder';
import { TaskCheckedCircle } from 'components/common/icons/TaskCheckedCircle';
import { TaskEmptyCircle } from 'components/common/icons/TaskEmptyCircle';
import { CHECK_DARK } from 'components/common/icons/DoubleCalendarCheck';
import { isNil } from 'utils/index';
import type { Rect } from 'utils/onboarding';
import { useUpdateTodoTaskStatus } from 'hooks/queries/task/useUpdateTodoTaskStatus';
import { useUpdateTask } from 'hooks/queries/task/useUpdateTask';
import { useDialog } from 'components/common/Dialog/Provider';
import { Camera } from 'components/common/icons/Camera';
import { RoutineArrow } from 'components/common/icons/RoutineArrow';
import { useUploadDowithTaskSuccessImageList } from 'hooks/queries/task/useFetchUploadTaskSuccessImageUrlList';
import { isAos } from 'utils/device';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  id: number;
  mode: TaskModeType;
  title: string;
  status: TaskStatusEnumType;
  taskCategoryName: string | null;
  startTime: string | null;
  year: number;
  month: number;
  selectedDate: string;
  isRoutine: boolean;
  successImageUrls?: string[] | null;
  feedBackCount?: number | null;
  /*
   * 첫 두윗 온보딩이 가리킬 두 요소의 화면 좌표를 올려보낸다.
   * 온보딩이 필요 없으면 넘기지 않으며, 그때는 측정도 일어나지 않는다.
   */
  onMeasureOnboardingTargets?: (targets: { status: Rect; thunder: Rect }) => void;
}

const Item = memo(function Item({
  id,
  mode,
  title,
  status,
  taskCategoryName,
  startTime,
  year,
  month,
  selectedDate,
  isRoutine: isRoutineTask,
  successImageUrls,
  feedBackCount,
  onMeasureOnboardingTargets,
}: Props) {
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { showDialog, hideDialog } = useDialog();
  const taskManagementBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isTodoMode = mode === 'TODO';
  const [localStatus, setLocalStatus] = useState(status);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  const [showUploadImageBottomSheet, setShowUploadImageBottomSheet] = useState(false);

  // 두윗이고, 시작 시간으로부터 1시간을 초과했을 경우 (list의 selectedDate=task 날짜, startTime은 prop이라 상세 조회 불필요)
  const isInvalidUpdateDowithTask =
    !isTodoMode && dayjs(`${selectedDate} ${startTime}`).add(1, 'hour').isBefore(dayjs());
  const isFailed = localStatus === TASK_STATUS_ENUM.enum.FAIL;

  // 인증 완료(성공)한 두윗은 수정/삭제(관리 메뉴) 불가
  const isDowithSuccess = !isTodoMode && localStatus === TASK_STATUS_ENUM.enum.SUCCESS;
  const isManageDisabled = isInvalidUpdateDowithTask || isFailed || isDowithSuccess;

  const { mutate: uploadDowithTaskSuccessImageUrlListMutate } = useUploadDowithTaskSuccessImageList(id);
  const { mutate: completeTodoTaskStatusMutate } = useUpdateTodoTaskStatus({ year, month });
  const { mutate: deleteTaskMutate } = useUpdateTask({
    type: 'DELETE',
    id,
    mode: isTodoMode ? 'TODO' : 'DOWITH',
    year,
    month,
  });

  const getBottomSheetTitle = () => {
    if (showUploadImageBottomSheet) {
      return '시작 인증하기';
    }

    if (isTodoMode) {
      return 'TO DO 관리하기';
    }

    return 'DO WITH 관리하기';
  };

  const getSnapPoints = () => {
    // 사진 찍기 한 항목만 노출
    if (showUploadImageBottomSheet) {
      return [`${(180 / SCREEN_HEIGHT) * 100}%`];
    }

    // 루틴 아닌 task 설정 선택
    if (!isRoutineTask) {
      return [`${(200 / SCREEN_HEIGHT) * 100}%`];
    }

    // 루틴 task 설정 선택
    return [`${(240 / SCREEN_HEIGHT) * 100}%`];
  };

  const handleBottomSheet = () => {
    setShowUploadImageBottomSheet(false);
    taskManagementBottomSheetModalRef.current?.present();
  };

  const statusIconRef = useRef<View>(null);
  const thunderChipRef = useRef<View>(null);

  /*
   * 두 요소를 함께 재서 한 번에 올려보낸다. measureInWindow는 콜백이라
   * 둘 다 도착했을 때만 호출되도록 모아서 전달한다.
   */
  const measureOnboardingTargets = useCallback(() => {
    if (!onMeasureOnboardingTargets) {
      return;
    }

    statusIconRef.current?.measureInWindow((x, y, width, height) => {
      const status = { x, y, width, height };
      thunderChipRef.current?.measureInWindow((tx, ty, tw, th) => {
        onMeasureOnboardingTargets({ status, thunder: { x: tx, y: ty, width: tw, height: th } });
      });
    });
  }, [onMeasureOnboardingTargets]);

  /*
   * 상태 아이콘은 채운 원(완료)과 빈 원(그 외) 두 모양뿐이고 색으로 모드·상태를 나타낸다.
   * 투두에는 실패가 없다(성공/대기 API만 있다).
   */
  const renderTaskStatusIcon = (mode: TaskModeType, status: TaskStatusEnumType) => {
    const modeColor = mode === 'TODO' ? CHECK_DARK : theme.COLORS.PRIMARY.RED_60;

    switch (status) {
      case TASK_STATUS_ENUM.enum.SUCCESS:
        return <TaskCheckedCircle fill={modeColor} />;

      case TASK_STATUS_ENUM.enum.WAIT:
        return <TaskEmptyCircle fill={modeColor} />;

      case TASK_STATUS_ENUM.enum.FAIL:
        return <TaskEmptyCircle fill={theme.COLORS.GRAY_SCALE.GRAY_70} />;

      default:
        return null;
    }
  };

  /* 두윗 인증은 즉석 촬영만 허용한다(갤러리 선택 불가) */
  const handleUploadImage = async () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.7 as const,
      /*
       * 라이브러리 기본값이 'pageSheet'라 iOS에서 카메라가 카드형 모달로 열리고
       * 상단에 뒤 화면이 비친다. 전체 화면으로 띄운다. (Android는 시스템 카메라
       * 앱을 인텐트로 실행하므로 이 옵션의 영향을 받지 않는다)
       */
      presentationStyle: 'fullScreen' as const,
    };

    try {
      const result = await launchCamera(options);

      // 사용자가 취소한 경우
      if (result.didCancel) {
        console.log('사용자가 카메라 접근 권한을 취소했습니다');
        return;
      }

      // 권한 거부 또는 에러 처리
      if (result.errorCode) {
        console.error('[카메라 에러]:', result.errorCode, result.errorMessage);
        // 권한 거부 에러인 경우만 다이얼로그 표시
        const isPermissionDenied =
          result.errorCode === 'permission' ||
          result.errorCode === 'camera_unavailable' ||
          result.errorCode === 'others';

        if (isPermissionDenied) {
          showDialog({
            title: '카메라 접근 권한 필요',
            content: '카메라 접근 권한을 허용해야 해요!\n기기 설정에서 권한을 변경할 수 있어요',
            leftButtonText: '취소',
            rightButtonText: '설정 바로가기',
            handleLeftButton: () => hideDialog,
            handleRightButton: () => {
              Linking.openSettings();
              hideDialog();
            },
          });
        }

        // iOS 시뮬레이터에서 카메라 사용 시 에러 처리
        if (!isAos && result.errorCode === 'camera_unavailable') {
          Alert.alert(
            '카메라 사용 불가',
            'iOS 시뮬레이터에서는 카메라를 사용할 수 없습니다.\n실제 기기에서 테스트해주세요.',
            [{ text: '확인' }],
          );
        }
        return;
      }

      // 이미지 선택 성공
      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'photo.jpg';

        const photoFile = {
          uri: asset.uri || '',
          width: asset.width || 0,
          height: asset.height || 0,
          isRawPhoto: false,
          orientation: 'portrait' as const,
          isMirrored: false,
        };

        uploadDowithTaskSuccessImageUrlListMutate({
          imageFileNames: [fileName],
          photo: photoFile,
        });
      }
    } catch (e) {
      console.error('이미지 촬영 중 에러 발생:', e);
    }

    taskManagementBottomSheetModalRef.current?.dismiss();
  };

  const renderBottomSheetContent = () => {
    return showUploadImageBottomSheet ? (
      <Pressable style={styles.modalContentRow} onPress={handleUploadImage}>
        <Camera />
        <Text style={styles.modalContentText}>사진 찍기</Text>
      </Pressable>
    ) : (
      <>
        <Pressable style={styles.modalContentRow} onPress={handleTask({ type: 'EDIT', isRoutineTask })}>
          <TaskEdit />
          <Text style={styles.modalContentText}>할 일 수정하기</Text>
        </Pressable>
        {isRoutineTask ? (
          <Pressable style={styles.modalContentRow} onPress={handleTask({ type: 'EDIT_ROUTINE', isRoutineTask })}>
            <RoutineEdit />
            <Text style={styles.modalContentText}>루틴 수정하기</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.modalContentRow} onPress={handleTask({ type: 'DELETE', isRoutineTask })}>
          <TaskDelete />
          <Text style={styles.modalContentText}>삭제하기</Text>
        </Pressable>
      </>
    );
  };

  const handleTaskStatus = (mode: TaskModeType, id: number, status: TaskStatusEnumType) => () => {
    // 성공 인증하지 않은 두윗 Task이면 이미지 업로드 바텀시트 노출
    if (mode === 'DOWITH') {
      if (status === 'SUCCESS') {
        return;
      }

      setShowUploadImageBottomSheet(true);
      taskManagementBottomSheetModalRef.current?.present();
      return;
    }
    setShowUploadImageBottomSheet(false);

    // 투두 Task 상태가 실패면 무시
    if (localStatus === 'FAIL') {
      return;
    }

    const prevStatus = localStatus;
    setLocalStatus(localStatus === 'WAIT' ? 'SUCCESS' : 'WAIT');
    completeTodoTaskStatusMutate({ id, status: localStatus }, { onError: () => setLocalStatus(prevStatus) });
  };

  const handleTask =
    ({ type, isRoutineTask }: { type: 'EDIT' | 'EDIT_ROUTINE' | 'DELETE'; isRoutineTask: boolean }) =>
    () => {
      // 할일 수정하기 버튼을 눌렀을 때
      if (type === 'EDIT') {
        navigate('TASK_FORM', { date: selectedDate, id, mode, screen: 'COMMON', isRoutineTask });
      }

      // 루틴 수정하기 버튼을 눌렀을 때
      if (type === 'EDIT_ROUTINE') {
        navigate('TASK_FORM', { date: selectedDate, id, mode, screen: 'ROUTINE' });
      }

      // 삭제하기 버튼을 눌렀을 때
      if (type === 'DELETE') {
        if (isInvalidUpdateDowithTask) {
          showDialog({
            type: 'ALERT',
            title: '두윗모드 삭제 불가',
            content: '시작 시간이 지난 두윗모드는\n삭제할 수 없어요.',
            handleAlertButton: hideDialog,
          });
        } else {
          showDialog({
            title: `${isRoutineTask ? '루틴 ' : ''}${isTodoMode ? '투두' : '두윗'} 삭제하기`,
            content: `${isRoutineTask ? '루틴으로 ' : ''}등록한 ${isTodoMode ? '투두를' : '두윗을'} ${
              isRoutineTask ? '\n모두 ' : ''
            }삭제하시겠어요?`,
            leftButtonText: `${isRoutineTask ? '모두 삭제하기' : '취소'}`,
            rightButtonText: `${isRoutineTask ? '이번만 삭제하기' : '삭제'}`,
            handleLeftButton: () => {
              deleteTaskMutate({ payload: undefined, withRoutineTask: true });
              hideDialog();
            },
            handleRightButton: () => {
              deleteTaskMutate({ payload: undefined, withRoutineTask: false });
              hideDialog();
            },
          });
        }
      }
      taskManagementBottomSheetModalRef.current?.dismiss();
    };

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={styles.leftContainer}
          onPress={handleTaskStatus(mode, id, localStatus)}
          disabled={isInvalidUpdateDowithTask || isFailed}
        >
          <View
            ref={statusIconRef}
            collapsable={false}
            onLayout={measureOnboardingTargets}
            style={styles.statusIconWrap}
          >
            {renderTaskStatusIcon(mode, localStatus)}
          </View>
          <View style={styles.leftContent}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.title, isFailed && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}
            >
              {title}
            </Text>
            {/* 루틴 아이콘도 이 줄에 있으므로, 시간·카테고리가 없어도 루틴이면 줄을 렌더한다 */}
            {(startTime || taskCategoryName || isRoutineTask) && (
              <View style={styles.option}>
                {startTime && (
                  <Text
                    style={[
                      styles.optionText,
                      { color: isFailed ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_60 },
                    ]}
                  >
                    {dayjs(startTime, 'HH:mm:ss').format('HH:mm')}
                  </Text>
                )}
                {startTime && taskCategoryName && (
                  <Text
                    style={[
                      styles.optionText,
                      { color: isFailed ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_60 },
                    ]}
                  >
                    •
                  </Text>
                )}
                {taskCategoryName && (
                  <Text
                    style={[
                      styles.optionText,
                      { color: isFailed ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_60 },
                    ]}
                  >
                    {taskCategoryName}
                  </Text>
                )}
                {isRoutineTask && <RoutineArrow />}
              </View>
            )}
          </View>
        </Pressable>
        <View style={styles.rightContainer}>
          <View style={styles.rightContent}>
            {successImageUrls && successImageUrls.length > 0 && (
              <Pressable
                hitSlop={8}
                onPress={() => navigate('CHEER_COLLECTION', { dowithTaskId: id, successImageUrl: successImageUrls[0] })}
              >
                <FastImage
                  style={{ width: 24, height: 24, borderRadius: 4 }}
                  source={{
                    uri: successImageUrls[0],
                  }}
                />
              </Pressable>
            )}
            {!isNil(feedBackCount) && (
              <Pressable
                ref={thunderChipRef}
                collapsable={false}
                onLayout={measureOnboardingTargets}
                style={styles.feedbackChip}
                hitSlop={8}
                onPress={() => {
                  if (successImageUrls) {
                    navigate('CHEER_COLLECTION', { dowithTaskId: id, successImageUrl: successImageUrls[0] });
                  } else {
                    navigate('RECEIVED_FEEDBACK', { dowithTaskId: id });
                  }
                }}
              >
                <Thunder width={16} height={16} fill={theme.COLORS.PRIMARY.RED_60} />
                <Text style={styles.feedbackChipText}>{feedBackCount}</Text>
              </Pressable>
            )}
            <Pressable hitSlop={8} onPress={handleBottomSheet} disabled={isManageDisabled}>
              <EtcDots disabled={isManageDisabled} />
            </Pressable>
          </View>
        </View>
      </View>
      <BottomSheet
        ref={taskManagementBottomSheetModalRef}
        title={getBottomSheetTitle()}
        description={showUploadImageBottomSheet ? '사진을 올리면 잔소리 알림이 중지돼요.' : ''}
        snapPoints={getSnapPoints()}
      >
        <View style={styles.modalContainer}>{renderBottomSheetContent()}</View>
      </BottomSheet>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  /*
   * 온보딩 측정을 위해 감싼 래퍼. leftContainer가 stretch라 기본값으로 두면
   * 행 높이만큼 늘어나 하이라이트 구멍이 세로로 길쭉해진다.
   */
  statusIconWrap: {
    alignSelf: 'flex-start',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    // 긴 제목이 오른쪽 인증 사진·관리(⋯) 영역에 닿지 않도록 간격 확보
    marginRight: 12,
  },
  rightContainer: {
    alignItems: 'flex-start',
  },
  leftContent: {
    // 제목 폭을 제한해 numberOfLines 말줄임(ellipsis)이 동작하도록 flex로 남는 폭만 차지
    flex: 1,
    gap: 4,
  },
  rightContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  title: theme.TYPOGRAPHY.TITLE_3,
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionText: theme.TYPOGRAPHY.CAPTION1_BASIC,
  modalContainer: {
    paddingVertical: 24,
    gap: 20,
  },
  modalContentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalContentText: theme.TYPOGRAPHY.BODY_1,
  feedbackChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  feedbackChipText: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
  },
});

export { Item };
