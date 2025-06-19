import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loginpage from './components/loginpage';
import Adminpanel from './components/adminpanel';
import Uservotepage from './components/uservotepage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Loginpage />} />
        <Route path="/admin" element={<Adminpanel />} />
        <Route path="/vote" element={<Uservotepage />} />
      </Routes>
    </Router>
  );
}

export default App;
