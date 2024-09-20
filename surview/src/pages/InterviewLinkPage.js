import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdDelete } from "react-icons/md";
import { FaArrowDown } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";
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
  width: 320px;
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
  color: red;
  font-weight: bold;
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
  gap: 10px;
  justify-content: center;
  margin: 10px auto;
}
  
.project-container {
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  padding: 40px;
  margin: 50px auto;
  max-width: 1200px;
  color: #333;
  font-family: 'Arial', sans-serif;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
   border: 8px solid transparent;
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

function InterviewLinkPage() {
  const location = useLocation();
  const navigate= useNavigate();
  const [prompt, setPrompt] = useState('');
  const formattedQuestions = location.state.questions
  .map((question, index) => {
    // Only map questions at even indexes
    if (index % 1 === 0) {
      return { questionText: question.questionText || question };
    }
    return null; // Return null for odd indexes to filter them out later
  })
  .filter(question => question !== null); // Remove null values
  console.log(formattedQuestions)
  const [questions, setQuestions] = useState(formattedQuestions);
  console.log(questions);


  const moveUp = (index) => {
    if (index === 0) return; // Can't move the first question up
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    setQuestions(newQuestions);
  };


   // Function to handle moving a question down
   const moveDown = (index) => {
    if (index === questions.length - 1) return; // Can't move the last question down
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    setQuestions(newQuestions);
  };

  // Function to handle input change for each question
  const handleQuestionChange = (index, newValue) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].questionText = newValue;
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '' }]);
  };

  const handleDeleteQuestion = useCallback((index) => {
    // Create a new array excluding the item at the specified index
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions); // Update state with the new array
    console.log(updatedQuestions); // Optional: for debugging
  }, [questions]); // Dependency array to ensure useCallback is updated with the latest questions

  const createLLM=(async()=>{
    const response=await axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-llm`, {
      questions,
      prompt,
      projectName: location.state.projectName
    });
    console.log(response.data.agent_id);
    console.log(questions)
    const response1= await axios.post(`${process.env.REACT_APP_BACKEND_URL}/user/${location.state.email}/projects`,{
      projectName: location.state.projectName,
      agentId: response.data.agent_id,
      questions: questions,
      llm_id:response.data.llm_id

    })
    const agent=response.data.agent_id
    const handleNavigateToShowLink = (agentId) => {
      navigate('/show-link', { state: { agentId} });
    };
    handleNavigateToShowLink(agent);
  
    

  })
  return (
    <Styles>
    <div className='body'>
      <div className='question-container'><h3 className='question-title'>Customize your questions below:</h3></div>
      <div className='project-container'>
      {questions.map((question, index) => (
        <div key={index}>
          <label className='question-title'>Question {index + 1}:</label>
          <div style={{display:'flex'}}>
          <textarea className='input'
            type="text"
            value={question.questionText}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
          />
           <button className='button' onClick={()=>handleDeleteQuestion(index)}><MdDelete size={30} style={{color:'black'}}/></button>
           <button className='button' onClick={()=>moveUp(index)}><FaArrowUp size={25} style={{color:'black'}}/></button>
           <button className='button' onClick={()=>moveDown(index)}><FaArrowDown size={25} style={{color:'black'}}/></button>
        </div>
        </div>
      ))}
       <textarea
            className='input'
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Any specific prompt you would like for the agent to keep in mind'
          />
       <button className='button' onClick={handleAddQuestion}>Add Question</button>
      <button className='button' onClick={createLLM}>CREATE AGENT</button>
      </div>
     
    </div>
    </Styles>
  );
}



export default InterviewLinkPage;

