import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './views/Dashboard';
import SetupSession from './views/SetupSession';
import LiveMeeting from './views/LiveMeeting';
import CommentTracker from './views/CommentTracker';
import AttendanceCounter from './views/AttendanceCounter';
import MeetingReport from './views/MeetingReport';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/setup" element={<SetupSession />} />
        <Route path="/live" element={<LiveMeeting />} />
        <Route path="/comment" element={<CommentTracker />} />
        <Route path="/attendance" element={<AttendanceCounter />} />
        <Route path="/report" element={<MeetingReport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;