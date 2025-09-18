"use client";

import React, { createContext, useContext } from "react";

const EscrowContext = createContext({});

export const EscrowProvider = ({ children }: { children: React.ReactNode }) => {
  // futuro estado del escrow va acá
  return (
    <EscrowContext.Provider value={{}}>
      {children}
    </EscrowContext.Provider>
  );
};

export const useEscrow = () => useContext(EscrowContext);
