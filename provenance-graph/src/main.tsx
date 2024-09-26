import { StrictMode } from "react";
import "./index.css";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import TimelineView from "./views/TimelineView.tsx";
import ProcessView from "./views/ProcessView.tsx";
import App from "./App.tsx";

// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <>
//       <Route path="/" element={<ProcessView />} />
//       <Route path="/timeline/:processId" element={<TimelineView />} />
//     </>
//   )
// );

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App/>
  </StrictMode>
);
