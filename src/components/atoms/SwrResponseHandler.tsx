import React from "react";
import Box from "@mui/material/Box";
import Loader from "@/components/atoms/Loader";
import { SWRResponse } from "swr";


const shouldRenderSWRResponseHandler = (query: SWRResponse<any, any>) =>
  (query.isValidating && !query.data) || query.error || !query.data;

type SWRResponseHandlerProps = {
  query: SWRResponse<any, any>;
  errorMessage: JSX.Element;
};

const SWRResponseHandler = ({
  query,
  errorMessage,
}: SWRResponseHandlerProps) => {
  if (query.isValidating && !query.data) {
    return <Loader m={2} />;
  }

  if (query.error) {
    if (errorMessage) {
      return errorMessage;
    }

    return (
      <Box>
        Encountered unexpected error. Refresh the page or try again later.
        <Box>Details: {query.error.message}</Box>
      </Box>
    );
  }

  if (!query.data) {
    return <Box>Nothing to display</Box>;
  }

  // Should not happen if used with shouldRenderSWRResponseHandler
  return <Box>Encountered unexpected error. Refresh the page or try again later.</Box>;
};

export { shouldRenderSWRResponseHandler };
export default SWRResponseHandler;
