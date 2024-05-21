import "./App.css";
import { FrontPage } from "./pages/FrontPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";

const query_client = new QueryClient();

function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={query_client}>
        <FrontPage />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
