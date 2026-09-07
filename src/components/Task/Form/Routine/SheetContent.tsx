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
  /* 확인 버튼을 눌러도 되는 상태인지 시트에 알린다 */
  onCanConfirmChange?: (canConfirm: boolean) => void;
}

/*
 * 바텀시트에서 쓰는 루틴 설정.
 *
 * 고른 값은 확인을 눌러야 폼에 반영된다(수정 화면과 달리 즉시 반영하지 않는다).
 * 확인·닫기는 시트가 자기 버튼으로 처리하므로 ref로 노출한다.
 */
const RoutineSheetContent = forwardRef<RoutineSheetContentRef, Props>(
  ({ taskMode = null, setValue, watch, closeBottomSheet = () => {}, onCanConfirmChange }, ref) => {
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
      setValue('routineCondition', buildRoutineCondition());
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

    /*
     * 루틴은 선택 사항이라 아무것도 안 고른 상태로도 확인할 수 있다(미설정으로 넘어간다).
     * 하나라도 골랐다면 기간·반복 패턴을 제대로 채웠을 때만 확인할 수 있다.
     */
    useEffect(() => {
      onCanConfirmChange?.(!hasAnySelection || getIsValidRoutineCondition());
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasAnySelection, selectedEndDate, selectedPrimaryCategory, selectedWeeklyDaySet, selectedMonthlyDaySet]);

    useImperativeHandle(ref, () => ({ handleSubmit, handleCloseButton, handleReset: resetSelection }));

    return <RoutineFields routine={routine} />;
  },
);

export { RoutineSheetContent };
export type { RoutineSheetContentRef };
