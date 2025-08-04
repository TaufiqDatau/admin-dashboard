import { AuthProvider } from "@refinedev/core";
import { API_URL, dataProvider } from "./data";

export const authCredentials = {
  email: "taufiqhdatau@gmail.com",
  password: "taufiq1234",
};

export const AuthProviders: AuthProvider = {
  login: async ({ email }) => {
    try {
      const { data } = await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          variables: { email },
          rawQuery: `
            mutation Login($email: string!){
              login(loginInput: {email: $email}){
                accessToken
              }
            }`,
        },
      });

      localStorage.setItem("access_token", data.login.accessToken);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (e) {
      const error = e as Error;

      return {
        success: false,
        error: {
          message: "message" in error ? error.message : "login failed",
          name: "name" in error ? error.name : "Invalid email or password",
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem("access_token");

    return {
      success: true,
      redirectTo: "/login",
    };
  },

  onError: async (error) => {
    if (error.statusCode === "UNAUTHENTICATED") {
      return {
        logout: true,
        ...error,
      };
    }

    return { error };
  },

  check: async () => {
    try {
      await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          rawQuery: `
          query Me {
            me {
              name
            }
          }
        `,
        },
      });

      return {
        authenticated: true,
        redirectTo: "/",
      };
    } catch (e) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  getIdentity: async () => {
    const accessToken = localStorage.getItem("access_token");

    try {
      const { data } = await dataProvider.custom<{ me: any }>({
        url: API_URL,
        method: "post",
        headers: accessToken
          ? {
              authorization: `Bearer ${accessToken}`,
            }
          : {},
        meta: {
          rawQuery: `
            query Me{
              me{
                id
                name
                email
                phone
                jobTitle
                timezone
                avatarUrl
              }
            }
          `,
        },
      });

      return data.me;
    } catch (e) {
      return undefined;
    }
  },
};
