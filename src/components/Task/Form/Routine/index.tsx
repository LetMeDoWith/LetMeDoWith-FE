import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import type { StackScreenProps } from '@react-navigation/stack';

import { RoutineFields } from 'components/Task/Form/Routine/RoutineFields';
import { useRoutineForm } from 'components/Task/Form/Routine/useRoutineForm';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';
import { useFetchTodoTask } from 'hooks/queries/task/useFetchTodoTask';
import { useUpdateTaskRoutine } from 'hooks/queries/task/useUpdateTaskRoutine';
import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import type { TaskFormStackParamList } from 'types/shared';
import type { taskFormSchemeType } from 'types/task/scheme/api';

/*
 * 저장 버튼은 ScrollView 위에 absolute로 떠 있다.
 * 버튼이 콘텐츠를 가리지 않도록 스크롤 하단 패딩을 버튼 높이·위치에서 파생시킨다.
 * 하단 여백은 앱의 다른 하단 버튼들과 같은 관례를 따른다(iOS는 홈 인디케이터 높이 + 24).
 */
const SAVE_BUTTON_HEIGHT = 64;
const SAVE_BUTTON_BOTTOM = isAos ? 24 : getBottomSpace() + 24;
const SAVE_BUTTON_CONTENT_GAP = 16;
const SCROLL_BOTTOM_PADDING = SAVE_BUTTON_HEIGHT + SAVE_BUTTON_BOTTOM + SAVE_BUTTON_CONTENT_GAP;

/*
 * 루틴 수정 화면.
 *
 * 저장 버튼이 폼을 그대로 제출하므로, 고른 값을 즉시 폼에 반영한다(mirrorToForm).
 * 등록 시트에서 쓰는 버전은 SheetContent에 따로 있다.
 */
const RoutineForm = ({ route }: StackScreenProps<TaskFormStackParamList, 'ROUTINE'>) => {
  const id = route?.params?.id || -1;
  const mode = route?.params?.mode || 'TODO';
  const isTodoMode = mode === 'TODO';

  const { setValue, watch, handleSubmit, formState } = useFormContext<taskFormSchemeType>();
  const routine = useRoutineForm({ mirrorToForm: true, setValue, watch });
  const { getIsValidRoutineCondition, initRoutineCondition } = routine;

  const { data: todoTaskData } = useFetchTodoTask({ todoTaskId: id }, { enabled: isTodoMode && id !== -1 });
  const { data: dowithTaskData } = useFetchDowithTask({ dowithTaskId: id }, { enabled: !isTodoMode && id !== -1 });
  const { mutate: updateTaskRoutine, isPending: isUpdateTaskRoutineLoading } = useUpdateTaskRoutine({ mode, id });

  const data = id !== -1 ? todoTaskData ?? dowithTaskData : null;
  const isFieldChanged = Object.keys(formState.dirtyFields).length > 0;
  const isButtonDisabled = !isFieldChanged || !getIsValidRoutineCondition() || isUpdateTaskRoutineLoading;

  const onSubmit = ({ routineCondition }: taskFormSchemeType) => {
    if (!routineCondition.startDate || !routineCondition.endDate || !routineCondition.cycle) {
      console.error('일부 루틴 정보가 유효하지 않습니다.');
      return;
    }

    updateTaskRoutine({
      startDate: routineCondition.startDate,
      endDate: routineCondition.endDate,
      cycle: routineCondition.cycle,
      pattern: routineCondition.pattern,
      isExcludeHolidays: routineCondition.isExcludeHolidays,
    });
  };

  useEffect(() => {
    initRoutineCondition(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <RoutineFields routine={routine} contentContainerStyle={styles.scrollContent} />
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, !isButtonDisabled && styles.buttonEnabled]}
          disabled={isButtonDisabled}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>저장하기</Text>
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: SCROLL_BOTTOM_PADDING,
  },
  /*
   * 버튼이 ScrollView 위에 떠 있어, 바운스 스크롤 시 버튼 주변(좌우 여백·아래 공간)으로
   * 컨텐츠가 비친다. 화면 폭 전체를 덮는 흰 배경 컨테이너로 가린다.
   */
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: SAVE_BUTTON_BOTTOM,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: SAVE_BUTTON_HEIGHT,
    backgroundColor: theme.COLORS.PRIMARY.RED_92,
  },
  buttonEnabled: {
    backgroundColor: theme.COLORS.PRIMARY.RED_60,
  },
  buttonText: {
    ...theme.TYPOGRAPHY.TITLE_2,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { RoutineForm };
