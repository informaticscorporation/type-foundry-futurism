import React from "react";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

// "isAuth" sarà un boolean che controlla se l'utente è loggato

export default function PrivateRoute({isAuth }) {
  return isAuth ? <Outlet /> : <Navigate to="/login" />
}
