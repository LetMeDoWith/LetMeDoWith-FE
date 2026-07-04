import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import dayjs from 'dayjs';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { TaskSuccess } from 'components/common/icons/TaskSuccess';
import { EtcDots } from 'components/common/icons/EtcDots';
import { theme } from 'styles/theme';
import type { RootStackParamList, TaskModeType } from 'types/shared';
import { BottomSheet } from 'components/common/BottomSheet';
import { TaskEdit } from 'components/common/icons/TaskEdit';
import { RoutineEdit } from 'components/common/icons/RoutineEdit';
import { TaskDelete } from 'components/common/icons/TaskDelete';
import type { TaskStatusEnumType } from 'types/task/scheme/enum';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';
import { TaskWait } from 'components/common/icons/TaskWait';
import { Thunder } from 'components/common/icons/Thunder';
import { TaskFail } from 'components/common/icons/TaskFail';
import { UploadImage } from 'components/common/icons/UploadImage';
import { isNil } from 'utils/index';
import { useUpdateTodoTaskStatus } from 'hooks/queries/task/useUpdateTodoTaskStatus';
import { useFetchTodoTask } from 'hooks/queries/task/useFetchTodoTask';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';
import { useUpdateTask } from 'hooks/queries/task/useUpdateTask';
import { useDialog } from 'components/common/Dialog/Provider';
import { Camera } from 'components/common/icons/Camera';
import { Gallery } from 'components/common/icons/Gallery';
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
  successImageUrls?: string[] | null;
  feedBackCount?: number | null;
}

const Item = ({
  id,
  mode,
  title,
  status,
  taskCategoryName,
  startTime,
  year,
  month,
  selectedDate,
  successImageUrls,
  feedBackCount,
}: Props) => {
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { showDialog, hideDialog } = useDialog();
  const taskManagementBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const isTodoMode = mode === 'TODO';
  const [localStatus, setLocalStatus] = useState(status);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  const { data: todoTaskData } = useFetchTodoTask({ todoTaskId: id }, { enabled: mode === 'TODO' && id !== -1 });
  const { data: dowithTaskData } = useFetchDowithTask({ dowithTaskId: id }, { enabled: !isTodoMode && id !== -1 });

  const [showUploadImageBottomSheet, setShowUploadImageBottomSheet] = useState(false);

  const data = id && mode ? todoTaskData ?? dowithTaskData : null;
  const isRoutineTask = !isNil(data?.routineCondition);

  // 현재 시간이 업데이트 하려는 Task가 두윗이고, 시작 시간으로부터 1시간을 초과했을 경우
  const isInvalidUpdateDowithTask =
    !isTodoMode && dayjs(`${data?.date} ${data?.startTime}`).add(1, 'hour').isBefore(dayjs());
  const isFailed = localStatus === TASK_STATUS_ENUM.enum.FAIL;

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
    // 카메라/갤러리 선택
    if (showUploadImageBottomSheet) {
      return [`${(220 / SCREEN_HEIGHT) * 100}%`];
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

  const renderTaskStatusIcon = (mode: TaskModeType, status: TaskStatusEnumType) => {
    switch (status) {
      case TASK_STATUS_ENUM.enum.WAIT:
        if (!isTodoMode) {
          return <UploadImage />;
        }

        return <TaskWait mode={mode} />;

      case TASK_STATUS_ENUM.enum.SUCCESS:
        return <TaskSuccess mode={mode} />;

      case TASK_STATUS_ENUM.enum.FAIL:
        return <TaskFail />;

      default:
        return null;
    }
  };

  const handleUploadImage = (type: 'CAMERA' | 'GALLERY') => async () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.7 as const,
    };

    try {
      // 카메라 촬영 또는 갤러리에서 선택
      const result = type === 'CAMERA' ? await launchCamera(options) : await launchImageLibrary(options);

      // 사용자가 취소한 경우
      if (result.didCancel) {
        console.log(`사용자가 ${type === 'CAMERA' ? '카메라' : '갤러리'} 접근 권한을 취소했습니다`);
        return;
      }

      // 권한 거부 또는 에러 처리
      if (result.errorCode) {
        console.error(`[${type === 'CAMERA' ? '카메라' : '갤러리'} 에러]:`, result.errorCode, result.errorMessage);
        // 권한 거부 에러인 경우만 다이얼로그 표시
        const isPermissionDenied =
          result.errorCode === 'permission' ||
          result.errorCode === 'camera_unavailable' ||
          result.errorCode === 'others';

        if (isPermissionDenied) {
          showDialog({
            title: `${type === 'CAMERA' ? '카메라' : '갤러리'} 접근 권한 필요`,
            content: `${
              type === 'CAMERA' ? '카메라 ' : '갤러리'
            } 접근 권한을 허용해야 해요!\n기기 설정에서 권한을 변경할 수 있어요`,
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
        if (type === 'CAMERA' && !isAos && result.errorCode === 'camera_unavailable') {
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
      console.error(`이미지 ${type === 'CAMERA' ? '촬영' : '선택'} 중 에러 발생:`, e);
    }

    taskManagementBottomSheetModalRef.current?.dismiss();
  };

  const renderBottomSheetContent = () => {
    return showUploadImageBottomSheet ? (
      <>
        <Pressable style={styles.modalContentRow} onPress={handleUploadImage('GALLERY')}>
          <Gallery />
          <Text style={styles.modalContentText}>라이브러리에서 선택</Text>
        </Pressable>
        <Pressable style={styles.modalContentRow} onPress={handleUploadImage('CAMERA')}>
          <Camera />
          <Text style={styles.modalContentText}>사진 찍기</Text>
        </Pressable>
      </>
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
          {renderTaskStatusIcon(mode, localStatus)}
          <View style={styles.leftContent}>
            <Text style={[styles.title, isFailed && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}>{title}</Text>
            {(startTime || taskCategoryName) && (
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
              <Pressable onPress={() => setImageModalVisible(true)}>
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
                style={styles.feedbackChip}
                onPress={() => {
                  if (successImageUrls) {
                    navigate('CHEER_COLLECTION', { dowithTaskId: id, successImageUrl: successImageUrls[0] });
                  } else {
                    navigate('RECEIVED_FEEDBACK', { dowithTaskId: id, title, status: localStatus });
                  }
                }}
              >
                <Thunder width={16} height={16} fill={theme.COLORS.PRIMARY.RED_60} />
                <Text style={styles.feedbackChipText}>{feedBackCount}</Text>
              </Pressable>
            )}
            <Pressable onPress={handleBottomSheet} disabled={isInvalidUpdateDowithTask || isFailed}>
              <EtcDots disabled={isInvalidUpdateDowithTask || isFailed} />
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
      {successImageUrls && (
        <Modal
          visible={imageModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <Pressable style={styles.imageModalOverlay} onPress={() => setImageModalVisible(false)}>
            <FastImage
              source={{ uri: successImageUrls[0] }}
              style={styles.imageModalImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          </Pressable>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rightContainer: {
    alignItems: 'flex-start',
  },
  leftContent: {
    gap: 4,
  },
  rightContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  title: theme.TYPOGRAPHY.BODY_2,
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
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalImage: {
    width: '100%',
    height: '80%',
  },
});

export { Item };
