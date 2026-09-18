import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';

import { RoutineFields } from 'components/Task/Form/Routine/RoutineFields';
import { useRoutineForm } from 'components/Task/Form/Routine/useRoutineForm';
import { TASK_ROUTINE_CYCLE_ENUM } from 'schemes/task/enum';
import type { TaskModeType } from 'types/shared';
import type { taskFormSchemeType } from 'types/task/scheme/api';

type RoutineSheetContentRef = {
  handleCloseButton: () => void;
  handleSubmit: () => void;
  /* 시트의 초기화 버튼이 호출한다 */
  handleReset: () => void;
};

interface Props {
  /* 모드가 바뀌면 선택 상태를 현재 폼 값으로 되돌린다 */
  taskMode?: TaskModeType | null;
  setValue: UseFormSetValue<taskFormSchemeType>;
  watch: UseFormWatch<taskFormSchemeType>;
  /* 확인/닫기 후 시트를 이전 화면으로 되돌리는 콜백 */
  closeBottomSheet?: () => void;
  /*
   * 선택 상태를 시트에 알린다. 버튼을 언제 열어줄지는 시트마다 달라 판단은 넘기지 않는다
   * (등록 시트는 미설정도 통과, 루틴 등록 시트는 완성돼야 통과).
   */
  onValidityChange?: (state: { hasAnySelection: boolean; isValid: boolean }) => void;
}

/*
 * 바텀시트에서 쓰는 루틴 설정.
 *
 * 고른 값은 확인을 눌러야 폼에 반영된다(수정 화면과 달리 즉시 반영하지 않는다).
 * 확인·닫기는 시트가 자기 버튼으로 처리하므로 ref로 노출한다.
 */
const RoutineSheetContent = forwardRef<RoutineSheetContentRef, Props>(
  ({ taskMode = null, setValue, watch, closeBottomSheet = () => {}, onValidityChange }, ref) => {
    const routine = useRoutineForm({ mirrorToForm: false, setValue, watch });
    const {
      routineCondition,
      selectedEndDate,
      selectedPrimaryCategory,
      selectedWeeklyDaySet,
      selectedMonthlyDaySet,
      isExcludeHolidays,
      hasAnySelection,
      getIsValidRoutineCondition,
      initRoutineCondition,
      buildRoutineCondition,
      resetSelection,
      setSelectedEndDate,
      setSelectedPrimaryCategory,
      setSelectedWeeklyDaySet,
      setSelectedMonthlyDaySet,
      setIsExcludeHolidays,
    } = routine;

    const handleSubmit = () => {
      /*
       * shouldDirty가 없으면 폼이 변경된 것으로 잡히지 않는다.
       * 수정 화면의 저장 버튼이 dirtyFields를 보기 때문에, 루틴만 설정하면 저장이 막힌다.
       */
      setValue('routineCondition', buildRoutineCondition(), { shouldDirty: true, shouldTouch: true });
      closeBottomSheet();
    };

    /* 확인을 누르지 않고 닫으면 폼에 남아 있는 이전 값으로 되돌린다 */
    const handleCloseButton = () => {
      // 아직 등록된 루틴이 없으면 전부 초기화
      if (routineCondition.startDate === null || routineCondition.endDate === null || routineCondition.cycle === null) {
        initRoutineCondition();
        return;
      }

      let isNeedInit = true;

      if (routineCondition.endDate !== selectedEndDate) {
        setSelectedEndDate(routineCondition.endDate);
        isNeedInit = false;
      }

      if (routineCondition.cycle !== selectedPrimaryCategory) {
        if (routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.DAILY) {
          isNeedInit = false;
        }

        if (routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY) {
          setSelectedWeeklyDaySet(new Set<number>(routineCondition.pattern));
          setSelectedMonthlyDaySet(new Set());
          isNeedInit = false;
        }

        if (routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY) {
          setSelectedMonthlyDaySet(new Set<number>(routineCondition.pattern));
          setSelectedWeeklyDaySet(new Set());
          isNeedInit = false;
        }

        setSelectedPrimaryCategory(routineCondition.cycle);
      } else {
        if (routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.DAILY) {
          isNeedInit = false;
        }

        if (
          routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.WEEKLY &&
          routineCondition.pattern !== Array.from(selectedWeeklyDaySet)
        ) {
          setSelectedWeeklyDaySet(new Set<number>(routineCondition.pattern));
          isNeedInit = false;
        }

        if (
          routineCondition.cycle === TASK_ROUTINE_CYCLE_ENUM.enum.MONTHLY &&
          routineCondition.pattern !== Array.from(selectedMonthlyDaySet)
        ) {
          setSelectedMonthlyDaySet(new Set<number>(routineCondition.pattern));
          isNeedInit = false;
        }
      }

      if (routineCondition.isExcludeHolidays !== isExcludeHolidays) {
        setIsExcludeHolidays(routineCondition.isExcludeHolidays);
        isNeedInit = false;
      }

      if (isNeedInit) {
        initRoutineCondition();
      }
    };

    useEffect(() => {
      initRoutineCondition();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskMode]);

    useEffect(() => {
      onValidityChange?.({ hasAnySelection, isValid: getIsValidRoutineCondition() });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasAnySelection, selectedEndDate, selectedPrimaryCategory, selectedWeeklyDaySet, selectedMonthlyDaySet]);

    useImperativeHandle(ref, () => ({ handleSubmit, handleCloseButton, handleReset: resetSelection }));

    return <RoutineFields routine={routine} />;
  },
);

export { RoutineSheetContent };
export type { RoutineSheetContentRef };
