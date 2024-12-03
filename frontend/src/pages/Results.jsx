/* eslint-disable no-unused-vars */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TaskBar from '../components/TaskBar';
import { useState, /*useEffect*/ } from "react";
import "../styles/Results.css"



const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, query, options } = location.state || {};
  
  const [visibleDescriptions, setVisibleDescriptions] = useState(
    result["result"].reduce((acc, currResult, index) => {
      acc[index] = false;
      return acc;
    }, {})
  )

  const toggleDescriptionVisibility = (index) => {
    setVisibleDescriptions((prevState) => ({
      ...prevState, 
      [index] : !prevState[index],
    }));
  };


  return (
    <div>
      <TaskBar/>
      <div className='results'>
        {result["result"].map(([name, similarity_score, desc], index) => (
              <div key={index} className="individualResult">
                <button className="courseDropdownMenu" onClick={() => toggleDescriptionVisibility(index)}>



                  {visibleDescriptions[index] ? '▲' : '▼'} &nbsp; {name}

                  {visibleDescriptions[index] && <div className='IndividualResultDescription'>
                  <div className='container'>
                    <div className='Description'>{desc}</div>
                    <div className='Extraneous'>Extra Info</div>
                  </div>
                

                </div>}


                </button>
                
              </div>
            ))}
      </div>
    </div>
  )
};

export default Results;