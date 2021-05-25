import React from "react";
import { Provider } from "react-redux";
import "./assets/scss/index.scss";
import "./mixins/dayjs";
import "./mixins/prismjs";
import "./mixins/validate";
import store from "./store";
import AppContainer from "./AppContainer";



function App() {
  return (
    <Provider store={store}>
      <AppContainer />
    </Provider>
  );
}

export default App;
