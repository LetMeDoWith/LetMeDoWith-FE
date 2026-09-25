import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Dimensions, Keyboard, Pressable, StyleSheet, Text, type TextInput, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FormProvider, useForm } from 'react-hook-form';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import dayjs from 'dayjs';

import { BottomSheet } from 'components/common/BottomSheet';
import { Reset } from 'components/common/icons/Reset';
import { RoutineSheetContent, type RoutineSheetContentRef } from 'components/Task/Form/Routine/SheetContent';
import { CategoryStep } from 'components/Task/Register/CategoryStep';
import { DateStep } from 'components/Task/Register/DateStep';
import { MainStep, ModeHeader } from 'components/Task/Register/MainStep';
import { TimeStep } from 'components/Task/Register/TimeStep';
import { useAddDowithTask } from 'hooks/queries/task/useAddDowithTask';
import { useAddTodoTask } from 'hooks/queries/task/useAddTodoTask';
import { useFetchDowithTaskSamples } from 'hooks/queries/task/useFetchDowithTaskSamples';
import { useFetchTaskCategoryList } from 'hooks/queries/task/useFetchTaskCategoryList';
import { useDialog } from 'components/common/Dialog/Provider';
import { showSnackbar, SNACKBAR_TYPE } from 'stores/snackbarStore';
import { getNextMinuteBoundary } from 'utils/date';
import { theme } from 'styles/theme';
import { isNil } from 'utils/index';
import type { TaskModeType } from 'types/shared';
import type { addTaskRequestSchemeType, taskFormSchemeType } from 'types/task/scheme/api';

const REGISTER_BLOCKED_DIALOG = {
  type: 'ALERT' as const,
  title: '⚠️ 도리 등록 불가',
  content: '다른 도리러들에게 잡도리를 받으려면\n다가올 날에 등록해 주세요!',
  alertButtonText: '확인',
};

const TIME_MINUTE_INTERVAL = 5;

type Step = 'MAIN' | 'DATE' | 'TIME' | 'CATEGORY' | 'ROUTINE';

/* 메인 스텝 콘텐츠 위아래로 시트가 추가로 차지하는 높이(핸들 바 + 모드 헤더 + 아래 여백) */
const MAIN_SHEET_CHROME_HEIGHT = 86;
/* 실측 전 첫 렌더에 쓰는 값. 실제 높이와 비슷해야 열릴 때 높이가 튀지 않는다. */
const MAIN_CONTENT_ESTIMATED_HEIGHT = 101;
const TOAST_GAP_ABOVE_SHEET = 20;
/* 헤더 위에 있는 핸들 바 영역 높이(BottomSheet의 handleContainer: 8 + 4 + 16) */
const HANDLE_BLOCK_HEIGHT = 28;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/*
 * 확인 버튼이 있는 스텝에서 콘텐츠 위아래로 시트가 더 차지하는 높이.
 * BottomSheet의 스타일에서 온 값이다 — 핸들 28 + 제목 줄 28 + 확인 버튼 48 + 컨테이너 아래 여백 41.
 */
const STEP_CHROME_HEIGHT = 145;
const STEP_DESCRIPTION_HEIGHT = 24;
/* 시트가 화면을 넘지 않게 하는 상한. 여기 걸리는 스텝(달력·루틴)만 스크롤된다. */
const STEP_MAX_HEIGHT_RATIO = 0.9;

/*
 * 스텝마다 제목·확인 버튼 유무가 다르다. 한 곳에 모아 두고 step으로만 고른다.
 * snapPoint는 콘텐츠를 재기 전 첫 프레임에만 쓰는 기본값이고, 실제 높이는 실측으로 정해진다.
 */
const STEP_CONFIG: Record<Step, { title: string; snapPoint: string; hasConfirm: boolean }> = {
  MAIN: { title: '', snapPoint: '', hasConfirm: false },
  DATE: { title: '날짜 선택', snapPoint: '72%', hasConfirm: true },
  TIME: { title: '시간 설정', snapPoint: '52%', hasConfirm: true },
  CATEGORY: { title: '카테고리', snapPoint: '60%', hasConfirm: true },
  ROUTINE: { title: '루틴 등록하기', snapPoint: '90%', hasConfirm: true },
};

const STEP_SLIDE_DISTANCE = 24;
const STEP_EXIT_DURATION = 120;
const STEP_ENTER_DURATION = 200;

interface Props {
  date: string;
}

const EMPTY_ROUTINE = {
  startDate: null,
  endDate: null,
  cycle: null,
  pattern: [],
  isExcludeHolidays: false,
};

/*
 * 투두·도리 등록 시트.
 *
 * 스텝이 바뀌어도 시트는 그대로 두고 컨텐츠만 교체한다. 스텝마다 모달을 따로 띄우면
 * 시트가 통째로 닫혔다 열려 시안의 "이어지는" 느낌이 나지 않는다.
 * 수정은 기존 스택 화면(TASK_FORM)이 계속 담당한다.
 */
const TaskRegisterSheet = forwardRef<BottomSheetModalMethods, Props>(({ date }, ref) => {
  const innerRef = useRef<BottomSheetModalMethods>(null);
  const routineFormRef = useRef<RoutineSheetContentRef>(null);
  const headerRef = useRef<View>(null);
  const titleInputRef = useRef<TextInput>(null);
  const { showDialog, hideDialog } = useDialog();

  const [step, setStep] = useState<Step>('MAIN');
  const [taskMode, setTaskMode] = useState<TaskModeType>('DOWITH');

  /* 스텝 안에서 고른 값은 확인을 눌러야 폼에 반영된다(취소하고 나가면 원래 값 유지) */
  const [draftDate, setDraftDate] = useState(date);
  const [draftTime, setDraftTime] = useState<Date>(dayjs().toDate());
  /* 오늘 등록하는 도리일 때만 채워지는 최소 선택 시각(다음 5분 경계) */
  const [timeMinimum, setTimeMinimum] = useState<Date | undefined>(undefined);
  const [draftCategoryId, setDraftCategoryId] = useState<number | null>(null);
  const [mainContentHeight, setMainContentHeight] = useState(MAIN_CONTENT_ESTIMATED_HEIGHT);
  /* 루틴은 미설정이거나 제대로 채웠을 때만 확인할 수 있다. 판단은 루틴 폼이 알려준다. */
  const [canConfirmRoutine, setCanConfirmRoutine] = useState(true);
  /* 확인 스텝의 콘텐츠 실측 높이. 시트를 콘텐츠에 맞춰야 초기화 위아래 여백이 같아진다. */
  const [stepContentHeight, setStepContentHeight] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  /* 시트를 닫을 때 올려 다음에 열 때 다른 placeholder가 나오게 한다(닫힌 동안 바꿔야 깜빡이지 않는다) */
  const [placeholderSeed, setPlaceholderSeed] = useState(0);

  const methods = useForm<taskFormSchemeType>({
    defaultValues: {
      title: '',
      taskCategoryId: null,
      date,
      startTime: null,
      routineCondition: EMPTY_ROUTINE,
    },
  });
  const { watch, setValue, reset, getValues } = methods;

  const formDate = watch('date');
  const startTime = watch('startTime');
  const taskCategoryId = watch('taskCategoryId');
  const routineCondition = watch('routineCondition');

  const { data: taskCategoryList } = useFetchTaskCategoryList();
  const { data: dowithTaskSamples } = useFetchDowithTaskSamples();

  const closeSheet = useCallback(() => innerRef.current?.dismiss(), []);
  const { mutate: addTodoTaskMutate, isPending: isAddTodoPending } = useAddTodoTask({ onSuccess: closeSheet });
  const { mutate: addDowithTaskMutate, isPending: isAddDowithPending } = useAddDowithTask({ onSuccess: closeSheet });

  /*
   * 도리 모드일 때만 서버 샘플을 제목 placeholder로 쓴다.
   * 모드가 바뀌거나 시트를 닫을 때만 새로 고르고, 입력하는 동안에는 문구가 바뀌지 않게 한다.
   * 의존성에 배열 자체를 넣으면 매 렌더마다 참조가 바뀌어 문구가 계속 흔들린다.
   */
  const titlePlaceholder = useMemo(() => {
    if (taskMode !== 'DOWITH' || !dowithTaskSamples?.length) {
      return 'ex) 밥 만들어 먹기';
    }

    return dowithTaskSamples[Math.floor(Math.random() * dowithTaskSamples.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskMode, dowithTaskSamples?.length, placeholderSeed]);

  const categoryName = taskCategoryList?.find(({ id }) => id === taskCategoryId)?.title;
  const hasRoutine = !isNil(routineCondition?.cycle);
  const isDowithOnToday = taskMode === 'DOWITH' && dayjs(formDate).isSame(dayjs(), 'day');

  const slideX = useSharedValue(0);
  const fade = useSharedValue(1);
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateX: slideX.value }],
  }));

  const focusTitleInput = useCallback(() => titleInputRef.current?.focus(), []);

  const commitStep = useCallback(
    (next: Step, isForward: boolean) => {
      // 이전 스텝의 높이가 남아 있으면 새 스텝이 잠깐 엉뚱한 높이로 열린다
      setStepContentHeight(0);
      setStep(next);

      /*
       * 메인 밖 스텝에는 입력이 없다. 키보드가 남아 있으면 콘텐츠를 가린다.
       * 스텝을 바꾼 "뒤에" 내려야 keyboardBlurBehavior(restore)가 새 스텝의 높이로 한 번에 복귀한다
       * — 먼저 내리면 메인 높이로 줄었다가 다시 커지는 움직임이 보인다.
       */
      if (next !== 'MAIN') {
        Keyboard.dismiss();
      }
      slideX.value = isForward ? STEP_SLIDE_DISTANCE : -STEP_SLIDE_DISTANCE;
      slideX.value = withTiming(0, { duration: STEP_ENTER_DURATION, easing: Easing.out(Easing.cubic) });
      fade.value = withTiming(1, { duration: STEP_ENTER_DURATION }, finished => {
        /*
         * 전환이 끝난 뒤에 포커스를 잡는다. 안드로이드는 애니메이션 중에 마운트된 뷰의
         * autoFocus 요청을 흘릴 때가 있어 마운트에만 기댈 수 없다.
         */
        if (finished && next === 'MAIN') {
          runOnJS(focusTitleInput)();
        }
      });
    },
    [fade, slideX, focusTitleInput],
  );

  /*
   * 바로 갈아끼우면 화면이 한 번 비어 깜빡인다.
   * 지금 내용을 반대 방향으로 밀며 지운 뒤에 교체하고, 새 내용이 들어오게 한다.
   */
  const goToStep = useCallback(
    (next: Step) => {
      const isForward = next !== 'MAIN';

      slideX.value = withTiming(isForward ? -STEP_SLIDE_DISTANCE : STEP_SLIDE_DISTANCE, {
        duration: STEP_EXIT_DURATION,
        easing: Easing.in(Easing.cubic),
      });
      fade.value = withTiming(0, { duration: STEP_EXIT_DURATION }, finished => {
        if (finished) {
          runOnJS(commitStep)(next, isForward);
        }
      });
    },
    [commitStep, fade, slideX],
  );

  const openStep = useCallback(
    (next: Step) => () => {
      if (next === 'DATE') {
        setDraftDate(formDate);
      }

      if (next === 'TIME') {
        /*
         * 최소값·초기값을 모두 "다음 5분 경계"로 맞춘다. raw 현재시각을 쓰면
         * 피커가 비경계 값으로 스냅되며 지난 시각이 저장된다.
         */
        const boundary = getNextMinuteBoundary(TIME_MINUTE_INTERVAL);
        const minimum = isDowithOnToday ? boundary : undefined;
        const saved = startTime ? dayjs(`${formDate} ${startTime}`).toDate() : null;

        setTimeMinimum(minimum);
        setDraftTime(minimum && (!saved || dayjs(saved).isBefore(minimum)) ? boundary : saved ?? boundary);
      }

      if (next === 'CATEGORY') {
        setDraftCategoryId(taskCategoryId ?? null);
      }

      goToStep(next);
    },
    [formDate, startTime, taskCategoryId, goToStep],
  );

  const handleModeChange = useCallback(
    (mode: TaskModeType) => {
      if (mode === 'DOWITH' && dayjs(formDate).isBefore(dayjs(), 'day')) {
        showDialog({ ...REGISTER_BLOCKED_DIALOG, handleAlertButton: hideDialog });
        return;
      }

      setTaskMode(mode);
    },
    [formDate, showDialog, hideDialog],
  );

  const handleSubmit = useCallback(() => {
    const values = getValues();

    if (taskMode === 'DOWITH' && !values.startTime) {
      /*
       * 시트 높이를 계산으로 맞추면 핸들·헤더·세이프에어리어가 얽혀 계속 어긋난다.
       * 최상단 헤더의 화면상 Y를 직접 재서 시트 윗변을 구하고, 그 위 20에 토스트를 놓는다.
       */
      headerRef.current?.measureInWindow((_x, y) => {
        const sheetTopY = y - HANDLE_BLOCK_HEIGHT;
        showSnackbar('도리는 시작 시간 설정이 필수예요!', {
          type: SNACKBAR_TYPE.ERROR,
          bottomOffset: SCREEN_HEIGHT - sheetTopY + TOAST_GAP_ABOVE_SHEET,
        });
      });
      return;
    }

    /*
     * 루틴은 startDate·endDate·cycle이 모두 있어야 실제 설정으로 본다.
     * 시트를 열었다 닫기만 하면 startDate만 채워지므로 미설정으로 간주해 null로 보낸다.
     */
    const hasRoutineCondition =
      !isNil(values.routineCondition?.startDate) &&
      !isNil(values.routineCondition?.endDate) &&
      !isNil(values.routineCondition?.cycle);

    const payload = {
      ...values,
      ...(!hasRoutineCondition && { routineCondition: null }),
    } as addTaskRequestSchemeType;

    if (taskMode === 'TODO') {
      addTodoTaskMutate(payload);
      return;
    }

    if (dayjs(`${values.date} ${values.startTime}`).isBefore(dayjs())) {
      showDialog({ ...REGISTER_BLOCKED_DIALOG, handleAlertButton: hideDialog });
      return;
    }

    addDowithTaskMutate(payload);
  }, [getValues, taskMode, addTodoTaskMutate, addDowithTaskMutate, showDialog, hideDialog]);

  const handleConfirm = useCallback(() => {
    if (step === 'DATE') {
      setValue('date', draftDate, { shouldDirty: true });
    }

    if (step === 'TIME') {
      setValue('startTime', dayjs(draftTime).format('HH:mm') + ':00', { shouldDirty: true });
    }

    if (step === 'CATEGORY') {
      setValue('taskCategoryId', draftCategoryId, { shouldDirty: true });
    }

    if (step === 'ROUTINE') {
      // handleSubmit이 값을 반영한 뒤 closeBottomSheet(=메인으로 복귀)까지 호출한다
      routineFormRef.current?.handleSubmit();
      return;
    }

    goToStep('MAIN');
  }, [step, draftDate, draftTime, draftCategoryId, setValue, goToStep]);

  /* 스텝의 초기화. 해당 항목만 비운다. */
  const handleReset = useCallback(() => {
    if (step === 'DATE') {
      setDraftDate(date);
    }

    if (step === 'TIME') {
      setDraftTime(dayjs().toDate());
    }

    if (step === 'CATEGORY') {
      setDraftCategoryId(null);
    }

    if (step === 'ROUTINE') {
      // 루틴은 선택 상태를 폼 컴포넌트가 들고 있어 ref로 비운다
      routineFormRef.current?.handleReset();
    }
  }, [step, date]);

  /* 닫기는 어느 스텝에서든 시트 자체를 닫는다(메인으로 돌아가는 건 각 스텝의 확인이 맡는다) */
  const handleClose = useCallback(() => {
    closeSheet();
  }, [closeSheet]);

  /* 시트를 닫으면 다음에 열 때 깨끗한 상태로 시작한다 */
  const handleDismiss = useCallback(() => {
    setStep('MAIN');
    setTaskMode('DOWITH');
    setPlaceholderSeed(prev => prev + 1);
    reset({ title: '', taskCategoryId: null, date, startTime: null, routineCondition: EMPTY_ROUTINE });
  }, [reset, date]);

  /* 시트를 처음 열었을 때도 메인이므로 같은 방식으로 포커스를 잡는다 */
  useEffect(() => {
    if (isSheetOpen && step === 'MAIN') {
      focusTitleInput();
    }
    // 스텝 전환은 애니메이션 완료 콜백이 맡는다. 여기서는 시트가 열리는 순간만 본다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSheetOpen]);

  // 홈에서 다른 날짜를 고르고 열면 그 날짜로 맞춘다
  useEffect(() => {
    setValue('date', date);
  }, [date, setValue]);

  useImperativeHandle(ref, () => innerRef.current!);

  const config = STEP_CONFIG[step];
  /*
   * 콘텐츠 실측 높이로 시트를 잡는다. 시트가 콘텐츠보다 크면 초기화 아래에 빈 공간이 생겨
   * 위아래 여백이 달라 보인다. 콘텐츠가 상한보다 길면 상한에서 멈추고 스크롤한다.
   */
  const snapPoints = useMemo(() => {
    if (step === 'MAIN') {
      return [mainContentHeight + MAIN_SHEET_CHROME_HEIGHT];
    }

    const maxHeight = SCREEN_HEIGHT * STEP_MAX_HEIGHT_RATIO;
    const chrome = STEP_CHROME_HEIGHT + (step === 'TIME' ? STEP_DESCRIPTION_HEIGHT : 0);
    /*
     * 루틴만 콘텐츠 실측을 쓰지 않는다. 루틴 폼의 뿌리는 flex: 1 ScrollView라 고유 높이가 없어,
     * 높이가 정해지지 않은 부모 안에서 재면 0에 가깝게 나온다. 그 값으로 시트를 맞추면 절반만 열린다.
     * 어차피 상한(90%)까지 차는 내용이므로 지정 높이로 연다.
     */
    const canUseMeasuredHeight = step !== 'ROUTINE' && stepContentHeight > 0;
    // 아직 재기 전(0)에는 스텝별 기본값으로 열고, 실측되면 콘텐츠에 맞춘다
    const desired = canUseMeasuredHeight
      ? stepContentHeight + chrome
      : (SCREEN_HEIGHT * parseFloat(config.snapPoint)) / 100;

    return [Math.min(desired, maxHeight)];
  }, [step, mainContentHeight, stepContentHeight, config.snapPoint]);

  /*
   * 스텝이 바뀌면 새 높이로 다시 스냅시킨다.
   * 키보드를 한 번도 띄우지 않고 스텝을 여는 경우(= restore가 관여하지 않는 경로)를 위한 보정이다.
   */
  useEffect(() => {
    if (!isSheetOpen || step === 'MAIN') {
      return;
    }

    innerRef.current?.snapToIndex(0);
  }, [isSheetOpen, step, snapPoints]);

  const isSubmitting = isAddTodoPending || isAddDowithPending;

  const isConfirmDisabled =
    (step === 'TIME' && !!timeMinimum && dayjs(draftTime).isBefore(timeMinimum)) ||
    (step === 'ROUTINE' && !canConfirmRoutine);

  const renderStepContent = () => {
    switch (step) {
      case 'DATE':
        return (
          <DateStep
            selectedDate={draftDate}
            onSelect={setDraftDate}
            minDate={taskMode === 'DOWITH' ? dayjs().format('YYYY-MM-DD') : undefined}
          />
        );

      case 'TIME':
        return (
          <TimeStep
            value={draftTime}
            onChange={setDraftTime}
            minimumDate={timeMinimum}
            minuteInterval={TIME_MINUTE_INTERVAL}
          />
        );

      case 'CATEGORY':
        return <CategoryStep selectedId={draftCategoryId} onSelect={setDraftCategoryId} />;

      case 'ROUTINE':
        return (
          <RoutineSheetContent
            ref={routineFormRef}
            taskMode={taskMode}
            closeBottomSheet={() => goToStep('MAIN')}
            setValue={setValue}
            watch={watch}
            /* 루틴은 선택 사항이라 아무것도 안 고른 상태로도 확인할 수 있다 */
            onValidityChange={({ hasAnySelection, isValid }) => setCanConfirmRoutine(!hasAnySelection || isValid)}
          />
        );

      default:
        return (
          <MainStep
            onMeasure={setMainContentHeight}
            inputRef={titleInputRef}
            taskMode={taskMode}
            control={methods.control}
            titlePlaceholder={titlePlaceholder}
            date={formDate}
            startTime={startTime}
            categoryName={categoryName}
            hasRoutine={hasRoutine}
            onPressDate={openStep('DATE')}
            onPressTime={openStep('TIME')}
            onPressCategory={openStep('CATEGORY')}
            onPressRoutine={openStep('ROUTINE')}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
    }
  };

  return (
    <FormProvider {...methods}>
      <BottomSheet
        ref={innerRef}
        title={config.title}
        snapPoints={snapPoints}
        headerComponent={
          step === 'MAIN' ? (
            <ModeHeader
              containerRef={headerRef}
              taskMode={taskMode}
              onChangeMode={handleModeChange}
              onClose={handleClose}
            />
          ) : undefined
        }
        description={step === 'TIME' ? '시작 후 한 시간 내로 인증 해야해요.' : ''}
        /* 메인은 확인 버튼이 없어 시안대로 아래 여백을 24로 좁힌다 */
        contentBottomInset={step === 'MAIN' ? 24 : undefined}
        /* 루틴은 입력 도중 실수로 닫히면 작성 내용을 잃으므로 닫기 버튼으로만 닫는다 */
        enablePanDownToClose={step !== 'ROUTINE'}
        /* 달력의 가로 스와이프가 시트 팬 제스처와 충돌하지 않게 한다 */
        enableContentPanningGesture={step !== 'DATE' && step !== 'ROUTINE'}
        keyboardBehavior="interactive"
        /*
         * 키보드가 내려가면 원래 스냅 위치로 되돌린다. 기본값(none)이면 키보드에 밀려 올라간
         * 임시 위치가 남아, 다음 스텝의 snapPoints를 무시하고 그 높이에 갇힌다.
         */
        keyboardBlurBehavior="restore"
        /*
         * KeyboardProvider가 edge-to-edge를 켜서 창이 리사이즈되지 않으므로, 시트를 gorhom이 직접 올리는
         * adjustPan이어야 안드로이드에서 키보드에 덮이지 않는다.
         * adjustResize로 두면 창이 줄어드는 순간 gorhom v4가 시트 위치를 새 컨테이너 기준 "닫힘"으로
         * 판정해(시트 높이 < 키보드 높이일 때) 시트가 스스로 닫힌다.
         */
        androidKeyboardInputMode="adjustPan"
        buttonConfig={
          config.hasConfirm ? { title: '확인', isDisabled: isConfirmDisabled, variant: 'OUTLINED' } : undefined
        }
        handleCloseButton={handleClose}
        handleButtonSubmit={handleConfirm}
        onChange={setIsSheetOpen}
        onDismiss={handleDismiss}
      >
        <Animated.View
          style={contentAnimatedStyle}
          onLayout={({ nativeEvent }) => setStepContentHeight(nativeEvent.layout.height)}
        >
          {renderStepContent()}
          {config.hasConfirm && (
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Reset />
              <Text style={styles.resetButtonText}>초기화</Text>
            </Pressable>
          )}
        </Animated.View>
      </BottomSheet>
    </FormProvider>
  );
});

const styles = StyleSheet.create({
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginVertical: 32,
  },
  resetButtonText: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
});

export { TaskRegisterSheet };
