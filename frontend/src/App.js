import React from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <>
      <div>
        
        <button onClick={handleLoginClick}>
          Go to Login
        </button>
      </div>
    </>
  );
}

export default App;
