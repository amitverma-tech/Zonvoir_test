import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/app.css";

ReactDOM.createRoot(document.getElementById("app")).render(
    <>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={2000} />
    </>
);
