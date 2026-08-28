/*
 * 프로필 이미지 fallback 분기 테스트
 *
 * FastImage는 SVG를 source로 받지 못하므로, URL이 없을 때는 FastImage 대신
 * DefaultProfile(SVG)을 렌더해야 한다.
 */

import { describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('react-native-fast-image', () => 'FastImage');

jest.mock('components/common/icons/DefaultProfile', () => ({
  DefaultProfile: 'DefaultProfile',
  /* rx 환산에 쓰이므로 실제 값과 동일하게 유지한다 */
  DEFAULT_PROFILE_VIEW_BOX_SIZE: 107,
}));

import { ProfileImage } from 'components/common/ProfileImage';

const findByType = (tree: renderer.ReactTestRenderer, type: string) => tree.root.findAllByType(type as never);

describe('ProfileImage', () => {
  it('uri가 있으면 FastImage를 렌더한다', () => {
    const tree = renderer.create(<ProfileImage uri="https://example.com/a.png" size={40} />);

    expect(findByType(tree, 'FastImage')).toHaveLength(1);
    expect(findByType(tree, 'DefaultProfile')).toHaveLength(0);
  });

  it('uri가 null이면 기본 프로필을 렌더한다', () => {
    const tree = renderer.create(<ProfileImage uri={null} size={40} />);

    expect(findByType(tree, 'DefaultProfile')).toHaveLength(1);
    expect(findByType(tree, 'FastImage')).toHaveLength(0);
  });

  it('uri가 빈 문자열이어도 기본 프로필을 렌더한다', () => {
    const tree = renderer.create(<ProfileImage uri="" size={40} />);

    expect(findByType(tree, 'DefaultProfile')).toHaveLength(1);
  });

  it('uri가 undefined여도 기본 프로필을 렌더한다', () => {
    const tree = renderer.create(<ProfileImage size={40} />);

    expect(findByType(tree, 'DefaultProfile')).toHaveLength(1);
  });

  it('기본 프로필에 size를 width·height로 전달한다', () => {
    const tree = renderer.create(<ProfileImage uri={null} size={107} />);
    const [defaultProfile] = findByType(tree, 'DefaultProfile');

    expect(defaultProfile.props.width).toBe(107);
    expect(defaultProfile.props.height).toBe(107);
  });

  /*
   * 사진(FastImage)과 모서리를 맞추기 위해 호출부 borderRadius를 viewBox(107) 단위로 환산한다.
   * 환산값이 절반(53.5)을 넘으면 원이므로 그 이상 커지지 않아야 한다.
   */
  it('호출부 borderRadius를 viewBox 단위로 환산해 rx로 넘긴다', () => {
    /* Mypage/Profile: 107px에 borderRadius 35 → 그대로 35 */
    const tree = renderer.create(<ProfileImage uri={null} size={107} style={{ borderRadius: 35 }} />);
    const [defaultProfile] = findByType(tree, 'DefaultProfile');

    expect(defaultProfile.props.rx).toBe(35);
  });

  it('원형 스타일이면 rx를 절반(53.5)으로 제한한다', () => {
    /* SentComment: 40px에 borderRadius 40 → 환산 107이지만 원이 되는 53.5로 잘린다 */
    const tree = renderer.create(<ProfileImage uri={null} size={40} style={{ borderRadius: 40 }} />);
    const [defaultProfile] = findByType(tree, 'DefaultProfile');

    expect(defaultProfile.props.rx).toBe(53.5);
  });

  it('borderRadius가 없으면 각진 모서리(rx=0)로 렌더한다', () => {
    const tree = renderer.create(<ProfileImage uri={null} size={40} />);
    const [defaultProfile] = findByType(tree, 'DefaultProfile');

    expect(defaultProfile.props.rx).toBe(0);
  });
});
