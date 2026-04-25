import { ScrollView } from 'react-native';

import { FeedNagList, FeedNagEmpty, SuccessTaskImageList } from 'components/Feed';
import { useFetchFeedbackAvailableDowithTasks } from 'hooks/queries/task/useFetchFeedbackAvailableDowithTasks';

const Feed = () => {
  const { data } = useFetchFeedbackAvailableDowithTasks();
  const hasNagTasks = (data?.dowithTasks.length ?? 0) > 0;

  return (
    <ScrollView>
      {hasNagTasks ? (
        <>
          <FeedNagList />
          <SuccessTaskImageList />
        </>
      ) : (
        <FeedNagEmpty />
      )}
    </ScrollView>
  );
};

export { Feed };
