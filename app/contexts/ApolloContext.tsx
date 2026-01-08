import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ApolloProvider } from "@apollo/client/react";
import {
  createContext,
  use,
  useEffect,
  useMemo,
  type FC,
  type PropsWithChildren,
} from "react";
import { useUserContext } from "./UserContext";

interface ApolloContextProps {
  token?: string;
  apolloClient?: ApolloClient;
}

export const ApolloContext = createContext<ApolloContextProps>({});

const httpLink = new HttpLink({
  uri: "https://api.start.gg/gql/alpha",
});

export const ApolloContextProvider: FC<
  PropsWithChildren & { token?: string }
> = ({ children, token }) => {
  const authLink = useMemo(
    () =>
      new SetContextLink(({ headers }) => {
        // get the authentication token from local storage if it exists
        // return the headers to the context so httpLink can read them
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
          },
        };
      }),
    [token],
  );

  const client = useMemo(
    () =>
      new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
        ssrMode: true,
      }),
    [authLink],
  );

  const { setUser, user } = useUserContext();

  useEffect(() => {
    if (!token && user?.id) {
      setUser?.(undefined);
    }
  }, [token, setUser, user]);

  return (
    <ApolloProvider client={client}>
      <ApolloContext value={{ apolloClient: client }}>{children}</ApolloContext>
    </ApolloProvider>
  );
};

export const useApolloContext = () => use(ApolloContext);
