import { User } from "firebase/auth";
import React from "react";

export const AuthContext = React.createContext<User | null>(null);