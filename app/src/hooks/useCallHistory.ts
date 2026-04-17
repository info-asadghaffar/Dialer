import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyService } from '../services/historyService';
import { Call } from '../types/call.types';
import { useMemo } from 'react';

type FilterType = 'all' | 'missed' | 'incoming' | 'outgoing';

/**
 * Custom hook to manage call history with caching and optimistic updates.
 */
export const useCallHistory = (filter: FilterType = 'all', searchQuery: string = '') => {
  const queryClient = useQueryClient();

  // 1. Fetch data
  const { data: calls = [], isLoading, error, refetch } = useQuery({
    queryKey: ['callHistory', filter, searchQuery],
    queryFn: () => historyService.getCallHistory(filter, searchQuery),
    staleTime: 30000,
  });

  // 2. Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: (id: string) => historyService.deleteCall(id),
    onMutate: async (id) => {
      // Snapshot previous state
      await queryClient.cancelQueries({ queryKey: ['callHistory'] });
      const previousCalls = queryClient.getQueryData<Call[]>(['callHistory', filter, searchQuery]);

      // Optimistically remove from cache
      if (previousCalls) {
        queryClient.setQueryData<Call[]>(
          ['callHistory', filter, searchQuery], 
          previousCalls.filter(c => c.id !== id)
        );
      }
      return { previousCalls };
    },
    onError: (err, id, context) => {
      if (context?.previousCalls) {
        queryClient.setQueryData(['callHistory', filter, searchQuery], context.previousCalls);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['callHistory'] });
    },
  });

  // 3. Grouping logic
  const groupedCalls = useMemo(() => {
    // Basic sorting by date (desc)
    const sorted = [...calls].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const sections: { title: string; data: Call[] }[] = [];
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    sorted.forEach(call => {
      const callDate = new Date(call.createdAt).toDateString();
      let title = '';

      if (callDate === today) title = 'TODAY';
      else if (callDate === yesterday) title = 'YESTERDAY';
      else title = new Date(call.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit' }).toUpperCase();

      const existingSection = sections.find(s => s.title === title);
      if (existingSection) {
        existingSection.data.push(call);
      } else {
        sections.push({ title, data: [call] });
      }
    });

    return sections;
  }, [calls]);

  // 4. Summary counts
  const totalMissed = useMemo(() => {
    return calls.filter(c => c.status === 'no-answer' || c.status === 'busy').length;
  }, [calls]);

  return {
    calls,
    isLoading,
    error,
    refetch,
    groupedCalls,
    totalMissed,
    deleteCall: deleteMutation.mutateAsync,
  };
};
