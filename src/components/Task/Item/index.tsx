import React, { useRef, useState } from 'react';
import { Alert, Dimensions, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { FeedBackIcon } from 'components/common/icons/FeedBackIcon';
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
  const isTodoMode = mode === 'TODO';

  const { data: todoTaskData } = useFetchTodoTask({ todoTaskId: id }, { enabled: mode === 'TODO' && id !== -1 });
  const { data: dowithTaskData } = useFetchDowithTask({ dowithTaskId: id }, { enabled: !isTodoMode && id !== -1 });

  const [showUploadImageBottomSheet, setShowUploadImageBottomSheet] = useState(false);

  const data = id && mode ? todoTaskData ?? dowithTaskData : null;
  const isRoutineTask = !isNil(data?.routineCondition);

  // 현재 시간이 업데이트 하려는 Task가 두윗이고, 시작 시간으로부터 1시간을 초과했을 경우
  const isInvalidUpdateDowithTask =
    !isTodoMode && dayjs(`${data?.date} ${data?.startTime}`).add(1, 'hour').isBefore(dayjs());
  const isDisabled = status === TASK_STATUS_ENUM.enum.FAIL;

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
    if (status === 'FAIL') {
      return;
    }

    completeTodoTaskStatusMutate({ id, status });
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
        <View style={styles.leftContainer}>
          <Pressable onPress={handleTaskStatus(mode, id, status)} disabled={isInvalidUpdateDowithTask || isDisabled}>
            {renderTaskStatusIcon(mode, status)}
          </Pressable>
          <View style={styles.leftContent}>
            <Text style={[styles.title, isDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}>{title}</Text>
            {(startTime || taskCategoryName) && (
              <View style={styles.option}>
                {startTime && (
                  <Text
                    style={[
                      styles.optionText,
                      { color: isDisabled ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_60 },
                    ]}
                  >
                    {dayjs(startTime, 'HH:mm:ss').format('HH:mm')}
                  </Text>
                )}
                {startTime && taskCategoryName && (
                  <Text
                    style={[
                      styles.optionText,
                      { color: isDisabled ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_60 },
                    ]}
                  >
                    •
                  </Text>
                )}
                {taskCategoryName && (
                  <Text
                    style={[
                      styles.optionText,
                      { color: isDisabled ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_60 },
                    ]}
                  >
                    {taskCategoryName}
                  </Text>
                )}
                {isRoutineTask && <RoutineArrow />}
              </View>
            )}
          </View>
        </View>
        <View style={styles.rightContainer}>
          <View style={styles.rightContent}>
            {successImageUrls && successImageUrls.length > 0 && (
              <Image
                borderRadius={4}
                width={24}
                height={24}
                source={{
                  uri: successImageUrls[0],
                }}
              />
            )}
            {!successImageUrls && !isNil(feedBackCount) && (
              <FeedBackIcon count={feedBackCount as number} status={status} />
            )}
            <Pressable onPress={handleBottomSheet} disabled={isInvalidUpdateDowithTask || isDisabled}>
              <EtcDots disabled={isInvalidUpdateDowithTask || isDisabled} />
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
});

export { Item };
