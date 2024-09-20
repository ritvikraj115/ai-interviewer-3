import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styled from 'styled-components';

const Styles = styled.section`
  .body{
    margin: auto;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    overflow: auto;
    background: linear-gradient(315deg, rgba(101,0,94,1) 3%, rgba(60,132,206,1) 38%, rgba(48,238,226,1) 68%, rgba(255,25,25,1) 98%);
    animation: gradient 15s ease infinite;
    background-size: 400% 400%;
    background-attachment: fixed;
    height:100vh
}

@keyframes gradient {
    0% {
        background-position: 0% 0%;
    }
    50% {
        background-position: 100% 100%;
    }
    100% {
        background-position: 0% 0%;
    }
}

.wave {
    background: rgb(255 255 255 / 25%);
    border-radius: 1000% 1000% 0 0;
    position: fixed;
    width: 200%;
    height: 12em;
    animation: wave 10s -3s linear infinite;
    transform: translate3d(0, 0, 0);
    opacity: 0.8;
    bottom: 0;
    left: 0;
    z-index: -1;
}

.wave:nth-of-type(2) {
    bottom: -1.25em;
    animation: wave 18s linear reverse infinite;
    opacity: 0.8;
}

.wave:nth-of-type(3) {
    bottom: -2.5em;
    animation: wave 20s -1s reverse infinite;
    opacity: 0.9;
}

@keyframes wave {
    2% {
        transform: translateX(1);
    }

    25% {
        transform: translateX(-25%);
    }

    50% {
        transform: translateX(-50%);
    }

    75% {
        transform: translateX(-25%);
    }

    100% {
        transform: translateX(1);
    }
}
.question-container {
 background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7),
    rgba(50, 50, 50, 0.5)
  ); /* Transparent background gradient
  backdrop-filter: blur(5px); /* Adds a glass-like blur effect */
  margin:20px auto;
  margin-bottom: 100px;
  height: 50px;
  width: 900px;
  padding: 10px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  border-radius:50px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
   border: 4px solid transparent;
   color:white;
}


.question-container2 {
 background: linear-gradient(
    135deg,
    rgba(100, 100, 100, 0.2),
    rgba(50, 50, 50, 0.2)
  ); /* Transparent background gradient
  backdrop-filter: blur(5px); /* Adds a glass-like blur effect */
  margin:20px auto;
  margin-bottom: 100px;
  height: 400px;
  width: 1400px;
  padding: 20px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  border-radius:50px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
   border: 4px solid transparent;
   color:white;
}


.project-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px; /* Match border radius of container */
  border: 4px solid transparent;
  background: linear-gradient(
    135deg,
    rgba(255, 0, 150, 0.3),
    rgba(0, 204, 255, 0.3)
  );
  z-index: -1;
  transition: background 0.3s ease;
}




.question-title {
  background: linear-gradient(45deg, #ff9a9e, #fad0c4);
  -webkit-background-clip: text;
  background-clip: text;
}

.question-point {
  color: #fff; /* Optional: You can set the text color of bullet points if desired */
}

.button {
  border: 4px solid transparent;
  font-weight: bold;
  margin:10px 5px;
  padding: 5px 10px; /* Make it equal width and height for circular shape */
  border-radius: 10%; /* This makes the button circular */
  color: #333;
  background: linear-gradient(135deg, #ff9a9e, #fad0c4); /* Adding a gradient background for a more attractive look */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); /* Softer shadow for a more attractive feel */
  transition: transform 0.2s ease, box-shadow 0.2s ease; /* Add transition for hover effects */
}

.button:hover {
  cursor: pointer;
  transform: scale(1.1); /* Slightly enlarge the button on hover */
  box-shadow: 0 7px 25px rgba(0, 0, 0, 0.4); /* Increase shadow on hover for a 'lifted' effect */
}

.projects-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
  margin: 50px 50px;
}
  
.project-container {
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  padding: 40px;
  margin: 50px auto;
  color: #333;
  font-family: 'Arial', sans-serif;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-wrap:wrap;
  justify-content: center;
  align-items: center;
   border: 8px solid transparent;
   width:700px;
}
   


.project-details {
  margin-bottom: 20px;
}

.project-name {
  font-size: 1.5rem;
  margin: 0;
}

.project-id {
  font-size: 0.9rem;
  color: #666;
}

.project-actions {
  display: flex;
  gap: 10px;
}
  .input-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px;
}

.input {
    width: 100vh;
    max-width: 1200px; /* Adjust the max-width as needed */
    padding: 10px 15px;
    margin: 15px auto;
    border: 2px solid #ddd;
    border-radius: 25px; /* Rounded corners */
    font-size: 16px;
    color: white;
    background: black;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: border-color 0.3s, box-shadow 0.3s;
}

.input:focus {
    height: 5.5em;
    border-color: #007bff; /* Change border color on focus */
    box-shadow: 0 0 8px rgba(0, 123, 255, 0.5); /* Add a glow effect on focus */
    outline: none; /* Remove default outline */
}

.input::placeholder {
    color: #aaa; /* Placeholder text color */
}

`

// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend);

const GetInsights = () => {
  const location = useLocation();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch insights using useEffect
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const calls = location.state.call; 
    
        const response = await axios.post(`http://localhost:5000/get-insights`, { calls });
        // Set the classification insights from the response
        setInsights(response.data.classification);
      } catch (err) {
        setError('Failed to fetch insights');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights(); // Fetch insights when component mounts
  }, []);

  // Helper function to parse insights and prepare chart data
  const parseInsights = (insights) => {
    const questions = [];
    const lines = insights.split('\n').filter(line => line.trim() !== '');

    let currentQuestion = null;
    lines.forEach(line => {
        console.log(line)
      if (line.startsWith("Q")) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        const title = line.split(': ')[1];
        currentQuestion = { title, categories: [], points :[] };
        console.log(currentQuestion)
      }
      else if(line.startsWith("*")){
        if(currentQuestion){
          if(currentQuestion.points){
            currentQuestion.points.push(line);


          }
        }

      }
       else{
        if(currentQuestion){
        const [category, percentage] = line.split('(');
        if(category && percentage){
        currentQuestion.categories.push({
          label: category.trim().replace('-', '').trim(),
          value: parseFloat(percentage.replace('%', '').replace(')', ''))
        })};
        console.log(currentQuestion)
      }}
    });

    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  // Render loading, error, or insights
  return (
    <Styles>
    <div className='body'>
      <div className='question-container'><h1 className='question-title'>Get Insights</h1></div>

      {loading && <p>Loading insights...This may take some time</p>}
      {error && <p>{error}</p>}

      {insights && (
        <div className='projects-wrapper'>
          {/* Display insights graphically */}
          {parseInsights(insights).map((question, index) => {
            const data = {
              labels: question.categories.map(cat => cat.label),
              datasets: [
                {
                  data: question.categories.map(cat => cat.value),
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                }
              ]
            };

            return (
              <div key={index} className='project-container'>
                <h3>{question.title}</h3>
                <Pie data={data} width={150} height={150} />
                <ul>
                {question.points.map((point, idx) => (
                  <li style={{fontSize:'30px', fontWeight:'bold',color:'red'}} key={idx}> {point.split("*")[1]}</li>
                ))}
              </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </Styles>
  );
};


export default GetInsights;
