import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPlus } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { RiChatHistoryLine } from "react-icons/ri";
import styled from 'styled-components'

const YourProjects =() => {

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
  height: 150px;
  width: 200px;
  padding: 10px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  border-radius:50px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
   border: 4px solid transparent;
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

.project-container:hover::before {
  background: linear-gradient(
    135deg,
    rgba(255, 0, 150, 0.4),
    rgba(0, 204, 255, 0.4)
  );
}

.project-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
}



.question-title {
  background: linear-gradient(45deg, #ff9a9e, #fad0c4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.question-point {
  color: #fff; /* Optional: You can set the text color of bullet points if desired */
}

.button {
  font-weight: bold;
  border: none;
  outline:none;
  margin:10px 10px;
  padding: 25px; /* Make it equal width and height for circular shape */
  border-radius: 50%; /* This makes the button circular */
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
  margin: 50px;
  max-width: 400px;
  color: #333;
  font-family: 'Arial', sans-serif;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
   border: 8px solid transparent;
}

.project-container:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
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
}
`


  const location = useLocation();
  const history = useNavigate();

  // Access the user from the location state
  const { user } = location.state || {};

  // Handle the Edit Questions button click
  const handleEditQuestions = (projectId, email, name, agent_id, llm_id) => {
    // Navigate to the Edit Questions page with the project ID
    history(`/edit-questions/${projectId}`, { state: { projectId, email, name,agent_id, llm_id} });
  };

  const createInterview = (email)=>{
    history("/create-interview", {state: {email}})
  }

  const handleCallHistory =(agent_id)=>{
    console.log(agent_id)
    history("/call-history", {state: {agent_id}})


  }

  return (
    <Styles>
    <div className="body">
      <div className='question-container'><h1 className='question-title'>Your Projects</h1>
      <button className='button' onClick={()=> createInterview(user.email)}><FaPlus size={20} /></button>
       </div>
      {user.projects && user.projects.length > 0 ? (
        <ul className='projects-wrapper'>
          {user.projects.map((project) => (
            <li key={project._id} className='project-container'>
              <h2 className='project-name'>{project.projectName.toUpperCase()}</h2>
              <p className='project-id'>Agent Id {project.agentId}</p>
              <button className='button' onClick={() => handleEditQuestions(project._id, user.email, project.projectName,project.agentId, project.llm_id)}>
                 <FaEdit size={25}/>
              </button>
              <button className='button' onClick={() => handleCallHistory(project.agentId)}>
                 <RiChatHistoryLine  size={25}/>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects found for this user.</p>
      )}
    </div>
    </Styles>
  );
}

export default YourProjects;
