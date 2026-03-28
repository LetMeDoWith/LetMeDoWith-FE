import React from 'react';
import { ScrollView } from 'react-native';

import { FeedNagList, SuccessTaskImageList } from 'components/Feed';

const Feed = () => {
  return (
    <ScrollView>
      <FeedNagList />
      <SuccessTaskImageList />
    </ScrollView>
  );
};

export { Feed };
