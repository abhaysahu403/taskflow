import { createContext, useContext, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(() => {
try {
return JSON.parse(localStorage.getItem("user"));
} catch {
return null;
}
});

const [loading, setLoading] = useState(false);

const login = async (email, password) => {
const { data } = await api.post("/login", {
email,
password,
});

```
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

setUser(data.user);

return data;
```

};

const register = async (name, email, password) => {
const { data } = await api.post("/login/register", {
name,
email,
password,
});

```
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

setUser(data.user);

return data;
```

};

const googleLogin = async (credential) => {
const { data } = await api.post("/auth/google", {
credential,
});

```
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

setUser(data.user);

return data;
```

};

const logout = () => {
localStorage.removeItem("token");
localStorage.removeItem("user");

```
setUser(null);
```

};

return (
<AuthContext.Provider
value={{
user,
loading,
login,
register,
googleLogin,
logout,
}}
>
{children}
</AuthContext.Provider>
);
};

export const useAuth = () => useContext(AuthContext);
