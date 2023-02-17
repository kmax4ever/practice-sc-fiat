import { useMediaQuery } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import { observer } from "mobx-react";
import React, { lazy, Suspense, useEffect } from "react";
import { Route, Router } from "react-router";
import Trade from "./pages/Trade";

const App = React.memo(() => {
  return (
    <>
      <Trade />
    </>
  );
});

export default App;
