import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
<React.StrictMode> <GoogleOAuthProvider clientId="365441385368-l2fjv2moa5possf3d7vdv6ubkk90alj0.apps.googleusercontent.com"> <App /> </GoogleOAuthProvider>
</React.StrictMode>
);
