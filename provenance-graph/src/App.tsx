import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProcessView from './views/ProcessView';
import TimelineView from './views/TimelineView';
import { GraphProvider } from './context/GraphContext';

const App = () => {
  return (
    <GraphProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ProcessView />} />
          <Route path="/timeline/:processId" element={<TimelineView />} />
        </Routes>
      </Router>
    </GraphProvider>
  );
};

export default App;
