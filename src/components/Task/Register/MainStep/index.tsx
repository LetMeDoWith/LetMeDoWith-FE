import React from 'react';
import { Pressable, StyleSheet, Text, type TextInput, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Controller, useWatch, type Control } from 'react-hook-form';
import dayjs from 'dayjs';

import { Calendar } from 'components/common/icons/Calendar';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { Clock } from 'components/common/icons/Clock';
import { LayoutGrid } from 'components/common/icons/LayoutGrid';
import { RoutineArrow } from 'components/common/icons/RoutineArrow';
import { CheckCircle } from 'components/common/icons/CheckCircle';
import { theme } from 'styles/theme';
import type { TaskModeType } from 'types/shared';
import type { taskFormSchemeType } from 'types/task/scheme/api';

const TITLE_MAX_LENGTH = 20;

interface ModeHeaderProps {
  taskMode: TaskModeType;
  onChangeMode: (mode: TaskModeType) => void;
  onClose: () => void;
  /* 시트 위에 토스트를 띄우려면 시트의 화면상 위치를 알아야 해, 최상단인 이 헤더를 잰다 */
  containerRef?: React.Ref<View>;
}

/*
 * 등록 시트의 헤더. 다른 스텝은 제목이 들어가는 자리에 모드 선택이 온다.
 * 기본 헤더를 대체하므로 닫기 버튼도 여기서 그린다.
 */
const ModeHeader = ({ taskMode, onChangeMode, onClose, containerRef }: ModeHeaderProps) => {
  const isDowith = taskMode === 'DOWITH';

  return (
    /* collapsable={false}: 안드로이드에서 뷰가 합쳐지면 측정할 수 없다 */
    <View ref={containerRef} collapsable={false} style={styles.modeRow}>
      <Text style={styles.modeLabel}>모드</Text>
      <Pressable style={[styles.modePill, isDowith && styles.modePillDowith]} onPress={() => onChangeMode('DOWITH')}>
        <Text style={[styles.modePillText, isDowith && styles.modePillTextActive]}>DORI</Text>
      </Pressable>
      <Pressable style={[styles.modePill, !isDowith && styles.modePillTodo]} onPress={() => onChangeMode('TODO')}>
        <Text style={[styles.modePillText, !isDowith && styles.modePillTextActive]}>TODO</Text>
      </Pressable>
      <Pressable style={styles.closeButton} onPress={onClose}>
        <CancelIcon />
      </Pressable>
    </View>
  );
};

interface ChipProps {
  icon: React.ReactNode;
  label: string;
  isFilled: boolean;
  isRequired?: boolean;
  onPress: () => void;
}

const Chip = ({ icon, label, isFilled, isRequired, onPress }: ChipProps) => (
  <Pressable style={styles.chip} onPress={onPress}>
    {icon}
    <Text style={[styles.chipLabel, isFilled && styles.chipLabelFilled]}>{label}</Text>
    {isRequired && <Text style={styles.chipRequired}>*</Text>}
  </Pressable>
);

interface Props {
  /* 시트 높이를 콘텐츠에 맞추기 위해 실제 렌더된 높이를 올려보낸다 */
  onMeasure: (height: number) => void;
  /* 시트가 다 열린 뒤 밖에서 포커스를 잡기 위한 참조(autoFocus를 쓰지 않는 이유는 입력부 주석 참고) */
  inputRef?: React.RefObject<TextInput>;
  taskMode: TaskModeType;
  /*
   * 제목은 Controller로 연결한다. watch + setValue로 값을 왕복시키면 리렌더가 한 박자 늦어,
   * 그 사이 낡은 값이 네이티브 입력에 다시 쓰이면서 한글 조합이 확정돼 자모가 합쳐지지 않는다.
   * 시트 내용은 portal로 그려져 FormProvider 컨텍스트가 닿지 않으므로 control을 직접 받는다.
   */
  control: Control<taskFormSchemeType>;
  titlePlaceholder: string;
  date: string;
  startTime: string | null;
  categoryName?: string;
  hasRoutine: boolean;
  onPressDate: () => void;
  onPressTime: () => void;
  onPressCategory: () => void;
  onPressRoutine: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const MainStep = ({
  onMeasure,
  inputRef,
  taskMode,
  control,
  titlePlaceholder,
  date,
  startTime,
  categoryName,
  hasRoutine,
  onPressDate,
  onPressTime,
  onPressCategory,
  onPressRoutine,
  onSubmit,
  isSubmitting,
}: Props) => {
  const title = useWatch({ control, name: 'title' });
  const canSubmit = title.trim().length > 0 && !isSubmitting;
  const chipIconColor = theme.COLORS.GRAY_SCALE.GRAY_60;
  /* 확인 버튼은 밑줄과 같이 선택한 모드 색을 따른다 */
  const submitColor = taskMode === 'DOWITH' ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.GRAY_SCALE.GRAY_20;

  return (
    <View style={styles.container} onLayout={({ nativeEvent }) => onMeasure(nativeEvent.layout.height)}>
      <View style={styles.titleRow}>
        {/* 밑줄은 입력과 글자 수까지만 긋는다. 확인 버튼은 밑줄 밖에 둔다. 색은 선택한 모드를 따른다. */}
        <View style={[styles.titleField, taskMode === 'TODO' && styles.titleFieldTodo]}>
          {/* 시트가 키보드 위로 올라오려면 라이브러리가 포커스를 추적할 수 있는 입력이어야 한다 */}
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange } }) => (
              <BottomSheetTextInput
                /*
                 * 라이브러리가 ref 타입을 인스턴스가 아닌 컴포넌트 타입으로 잘못 선언해 두어 캐스팅한다.
                 * 런타임에는 RN TextInput 인스턴스가 그대로 들어온다.
                 */
                ref={inputRef as never}
                style={styles.titleInput}
                placeholder={titlePlaceholder}
                placeholderTextColor={theme.COLORS.GRAY_SCALE.GRAY_60}
                value={value}
                onChangeText={onChange}
                maxLength={TITLE_MAX_LENGTH}
                /*
                 * autoFocus는 쓰지 않는다. 시트가 열리는 애니메이션 중에 포커스 요청이 나가면
                 * 실기기에서 키보드가 뜨지 않은 채 RN 쪽만 "포커스됨"으로 남고, 그 뒤 focus()가
                 * 같은 입력이라는 이유로 무시돼 키보드가 영영 올라오지 않는다.
                 * 포커스는 시트가 다 열린 뒤 밖에서 inputRef로 잡는다.
                 */
              />
            )}
          />
          <Text style={styles.counter}>
            {title.length}/{TITLE_MAX_LENGTH}
          </Text>
        </View>
        <Pressable disabled={!canSubmit} onPress={onSubmit}>
          <CheckCircle width={32} height={32} fill={canSubmit ? submitColor : theme.COLORS.GRAY_SCALE.GRAY_80} />
        </Pressable>
      </View>
      <View style={styles.chipRow}>
        <Chip
          icon={<Calendar width={16} height={16} />}
          label={dayjs(date).format('YYYY.MM.DD')}
          isFilled
          onPress={onPressDate}
        />
        <Chip
          icon={<Clock width={16} height={16} fill={chipIconColor} />}
          label={startTime ? dayjs(startTime, 'HH:mm:ss').format('HH:mm') : '시간'}
          isFilled={!!startTime}
          isRequired={taskMode === 'DOWITH'}
          onPress={onPressTime}
        />
        <Chip
          icon={<LayoutGrid width={16} height={16} />}
          label={categoryName ?? '카테고리'}
          isFilled={!!categoryName}
          onPress={onPressCategory}
        />
        <Chip
          icon={<RoutineArrow />}
          label={hasRoutine ? '등록 완료' : '루틴'}
          isFilled={hasRoutine}
          onPress={onPressRoutine}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeLabel: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_10,
  },
  modePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  modePillDowith: {
    backgroundColor: theme.COLORS.PRIMARY.RED_60,
    borderColor: theme.COLORS.PRIMARY.RED_60,
  },
  modePillTodo: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_20,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  modePillText: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  modePillTextActive: {
    color: theme.COLORS.DEFAULT.WHITE,
  },
  closeButton: {
    marginLeft: 'auto',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: theme.COLORS.PRIMARY.RED_60,
    paddingBottom: 8,
  },
  titleFieldTodo: {
    borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  titleInput: {
    ...theme.TYPOGRAPHY.BODY_1,
    flex: 1,
    /*
     * 한 줄 TextInput은 lineHeight를 따르지 않고 들어 있는 글자의 폰트에 맞춰 높이가 1~2px씩 바뀐다
     * (플레이스홀더 ↔ 한글 대체 폰트). 그러면 실측 높이 → 시트 snapPoints가 입력 중에 바뀌고,
     * gorhom v4는 키보드가 떠 있을 때 snapPoints가 바뀌면 키보드 오프셋을 잃어 시트가 키보드 밑으로 내려간다.
     * 높이를 고정해 입력 내용과 무관하게 한다.
     */
    height: theme.TYPOGRAPHY.BODY_1.lineHeight,
    padding: 0,
  },
  counter: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_80,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipLabel: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
  },
  chipLabelFilled: {
    color: theme.COLORS.GRAY_SCALE.GRAY_10,
  },
  chipRequired: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.PRIMARY.RED_60,
    marginLeft: -2,
  },
});

export { MainStep, ModeHeader };
