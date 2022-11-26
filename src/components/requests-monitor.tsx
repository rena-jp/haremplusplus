import { ReactNode, useEffect, useState } from 'react';
import { GameAPI, RequestEvent } from '../api/GameAPI';

export interface RequestsMonitorProps {
  gameAPI: GameAPI;
  children?(requests: number): ReactNode;
  error?(error: boolean): ReactNode;
}

export const RequestsMonitor: React.FC<RequestsMonitorProps> = ({
  gameAPI,
  children,
  error
}) => {
  // Number of requests in queue
  const [requests, setRequests] = useState(0);
  // Did an error occur recently?
  const [isError, setError] = useState(false);
  // Last time an error occurred
  const [lastError, setLastError] = useState(0);
  // When did the request queue start? Reset to 0 when the queue is empty
  const [queueStart, setQueueStart] = useState(0);
  // Whether to show a busy indicator for requests
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    const requestListener = (event: RequestEvent) => {
      setRequests((previousRequests) => {
        const newRequestCount = event.pendingRequests;
        if (previousRequests === 0 && newRequestCount > 0) {
          setQueueStart(Date.now());
        } else if (newRequestCount === 0 && previousRequests > 0) {
          setQueueStart(0);
        }
        return newRequestCount;
      });
      if (event.success === false) {
        setError(true);
        setLastError(Date.now());
      }
    };
    gameAPI.addRequestListener(requestListener);
    return () => gameAPI.removeRequestListener(requestListener);
  }, []);

  // Show a busy indicator after 500 of non-stop request activity
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (queueStart > 0 && Date.now() > queueStart + 500) {
        setShowRequests(true);
      } else {
        setShowRequests(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [queueStart]);

  // Reset error state after 30s
  useEffect(() => {
    const timeout = setTimeout(() => {
      setError(false);
    }, 30 * 1000);
    return () => clearTimeout(timeout);
  }, [lastError]);

  return (
    <>
      {children !== undefined && showRequests ? children(requests) : null}
      {error && isError ? error(isError) : null}
    </>
  );
};
