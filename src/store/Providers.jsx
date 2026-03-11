"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import LoaderOverlay from "@/components/LoaderOverlay";
import Toaster from "@/components/Toaster";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {children}
      <LoaderOverlay />
      <Toaster />
    </Provider>
  );
}


