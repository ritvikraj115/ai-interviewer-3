const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');
const User = require('../userSchema'); // Assuming your user schema is in this folder
const Retell = require('retell-sdk');

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});
const retellClient = new Retell({
  apiKey: process.env.RETELL_AI_KEY,
});



router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if a user with the given email already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // If the user exists, return their projects and questions
      return res.status(200).json({ user });
    } else {
      // If the user does not exist, create a new user
      user = new User({ email, projects: [] }); // projects will be added later
      await user.save();
      return res.status(201).json({ user });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});



router.post('/generate-questions', async (req, res) => {
  const { projectName, projectOffering, feedbackDesired, prompt } = req.body;

  // Validate the incoming request data
  if (!projectName || !projectOffering || !feedbackDesired) {
    return res.status(400).json({
      error: 'Please provide project_name, project_offering, and desired_feedback.',
    });
  }

  try {
    // Create a completion request to OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using GPT-4 model for best quality
      messages: [
        {
          role: 'system',
          content: `

          You are an UI Reasearcher tasked with generating 6 to 10 interview questions for "${projectName}" based on "${projectOffering}" and aligned with "${feedbackDesired}". For each question, generate a probing follow-up question based on a generic or vague answer. The format should be:

          [Main question (Probing question)]

          Important Guidelines:

          Only output the questions in the above format, with no headings, introductions, explanations, or extra text.
          Do not include greetings, friendly welcomes, or any extra phrases before or after the questions.
          Do not leave any blank lines or spaces between questions. The output should be compact.
          Every main question should be followed immediately by a relevant probing question in parentheses, based on a typical general answer.
          Do not repeat the same question format; keep each question unique.
          The main question should be open-ended, and the probing question should clarify or deepen the response if needed.
          Examples:

          What are your first impressions of ${projectOffering}? (If the answer is general: What specific aspects stood out to you?)
          How would you describe your typical experience using ${projectOffering}? (If vague: Can you walk me through a recent usage example?)
          What challenges, if any, have you encountered with ${projectOffering}? (If none mentioned: Can you recall a time when it didn’t meet your expectations?)
          How does ${projectOffering} fit into your daily routine or workflow? (If unclear: Can you describe a typical use case in your day?)
          In what ways could ${projectOffering} be improved to better meet your needs? (If general: Can you suggest specific features or changes?)
          How does ${projectOffering} compare to other similar solutions you’ve used? (If general: What makes ${projectOffering} stand out or fall short?)
          What value do you feel ${projectOffering} brings to you or your work? (If unclear: Can you provide an example of when it was particularly helpful?)
          What kind of support or resources would improve your experience with ${projectOffering}? (If general: Are there specific areas where you need more assistance?)
          How do you see yourself using ${projectOffering} in the future? (If unsure: What would encourage you to continue using it?)
          Is there anything else you’d like to share about your experience with ${projectOffering}? (If general: Is there any additional feedback or thoughts you have?)
          Make sure to strictly adhere to this format without deviations.
`
        },
        {
          role: 'user',
          content: `You have to generate a set of questions for project name:${projectName} on projectOffering:${projectOffering} and expected desired feedback:${feedbackDesired}. Strictly consider the following instructions while generating questions:${prompt}`,
        },
      ],
      max_tokens: 500,  // Set the token limit high enough to generate multiple questions
      temperature: 0.7,  // Slightly creative but controlled
    });

    // Return the generated questions as a JSON response
    res.status(200).json({
      questions: completion.choices[0].message.content.trim().split('\n'),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate interview questions. Please try again later.',
    });
  }
});




router.post('/create-llm', async (req, res) => {
  const { questions, prompt, projectName } = req.body;
  // console.log(prompt)
  // console.log(questions[0].questionText)
  // Validate questions input
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of questions.' });
  }

  try {
    // Create a new LLM in Retell with the provided questions
    const llmResponse = await retellClient.llm.create({
      general_prompt: `You are conducting user interviews using the following questions provided in the format [Main question (Probing question)] Follow these instructions:
    
          1. **Ask the Main Question**: Very Very Important!!!-Start by asking the main question from the provided list. The probing question is included in parentheses next to the main question.
          2. **Evaluate the Response**: ONLY After receiving the response, determine if the answer is general or vague.
          3. **If the response is general or vague**:Then only,I repeat only and only then Ask the probing question that is provided in parentheses.
          4. **If the response is specific and clear**: Do not ask the probing question.
          5. **Adhere to Format**: Strictly Ensure that the probing questions are used exactly as provided, only when necessary.
          6. **Stricly consider the following instruction by the user before proceeding: ${prompt}
          Make sure to distinguish between the main question and the probing question, and only ask the probing question when the response to the main question requires further clarification.`,
      states: questions.map((question, index) => ({
        name: `question_${index + 1}`,
        state_prompt: `"${question.questionText.split('(')[0]}"\n(If necessary, only then ask the probing question in parentheses: "${question.questionText.split('(')[1]}" Try to switch to the probing question smoothly.).`,
        edges: index < questions.length - 1 ? [
          {
            destination_state_name: `question_${index + 2}`,
            description: "Move to the next question after receiving the user's response."
          }
        ] : [],
      })),
      starting_state: 'question_1',
      begin_message: "Hello there! I am Ryan. An AI Designed to gather feedbacks. Today I am gathering feedback on ${projectName}. This conversation will last for about 10 minutes and will include 6-10 questions. So are you ready to share your thoughts?"
    })
    
    const createdAgent = await retellClient.agent.create({
      llm_websocket_url: llmResponse.llm_websocket_url,  // Use the passed WebSocket URL from LLM creation
      voice_id: '11labs-Adrian',  // Define voice ID
      agent_name: projectName,  // Agent name
      interruption_sensitivity: 0.8,
      responsiveness:0.8,
    });
    
    res.status(200).json({
      message: 'LLM created successfully',
      agent_id: createdAgent.agent_id,
      llm_id: llmResponse.llm_id
    });
  } catch (error) {
    console.error('Error creating LLM:', error);
    res.status(500).json({ error: 'Failed to create LLM. Please try again later.' });
  }
});




 

// // Route to save interview questions to the user schema
// router.get('/user/:email/projects', async (req, res) => {
//   const { email } = req.params;

//   try {
//     const user = await User.findOne({ email }).populate('projects.questions');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     return res.status(200).json({ projects: user.projects });
//   } catch (error) {
//     return res.status(500).json({ error: 'Server error' });
//   }
// });




router.post('/user/:email/projects', async (req, res) => {
  const { email } = req.params;
  const { projectName, agentId, questions, llm_id } = req.body;
  // console.log(questions)

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newProject = {
      projectName,
      agentId:agentId,
      llm_id:llm_id,
      questions: questions,
    };
    
    user.projects.push(newProject);
    await user.save();
    
    return res.status(201).json({ message: 'Project added', project: newProject });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Server error' });
  }
});




router.put('/user/:email/projects/:projectId/questions', async (req, res) => {
  const { email, projectId } = req.params;
  const { questions, agent } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.questions = questions;
    await user.save();

    return res.status(200).json({ message: 'Questions updated', questions: project.questions });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Server error' });
  }
});





router.get('/user/:email/projects/:projectId/questions', async (req, res) => {
  const { email, projectId } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ questions: project.questions });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});


router.post('/updatellm', async (req, res) => {
  const { questions, prompt, agent_id, llm_id } = req.body;
  // Input validation
  if (!agent_id || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Please provide a valid agentId and a list of questions.' });
  }

  try {
    // Step 1: Retrieve agent details to get the LLM ID

    if (!llm_id) {
      return res.status(404).json({ error: 'LLM ID not found for this agent.' });
    }

    // Step 2: Prepare the payload for updating the LLM
    const updatePayload = {
      general_prompt: `You are conducting user interviews using the following questions provided in the format [Main question (Probing question)] Follow these instructions:
    
          1. **Ask the Main Question**: Very Very Important!!!-Start by asking the main question from the provided list. The probing question is included in parentheses next to the main question.
          2. **Evaluate the Response**: ONLY After receiving the response, determine if the answer is general or vague.
          3. **If the response is general or vague or unclear**:Then only,I repeat only and only then Ask the probing question that is provided in parentheses.
          4. **If the response is specific and clear**: Never ask the probing question.
          5. **Adhere to Format**: Strictly Ensure that the probing questions are used exactly as provided, only when necessary.
          6. 6. **Stricly consider the following instruction by the user before proceeding: ${prompt}
          Make sure to distinguish between the main question and the probing question, and only ask the probing question when the response to the main question requires further clarification.`,
      states: questions.map((question, index) => ({
        name: `question_${index + 1}`,
        state_prompt: `"${question.questionText.split('(')[0]}"\n(If necessary, only then ask the probing question in parentheses: "${question.questionText.split('(')[1]}". Switch to the probing question smoothly)`,
        edges: index < questions.length - 1 ? [
          {
            destination_state_name: `question_${index + 2}`,
            description: "Move to the next question after receiving the user's response."
          }
        ] : [],
      })),
      starting_state: 'question_1',
      begin_message: "Hello there! I am Ryan. An AI Designed to gather feedbacks. Today I am gathering feedback on ${projectName}. This conversation will last for about 10 minutes and will include 6-10 questions. So are you ready to share your thoughts?"

    // Step 3: Update the LLM using the LLM ID
    const llmResponse = await retellClient.llm.update(llm_id,updatePayload);

    const agent_response = await retellClient.agent.update(
      agent_id, {llm_websocket_url:llmResponse.llm_websocket_url,interruption_sensitivity: 0.8, responsiveness:0.8}
  )
    // Return success response
    return res.status(200).json({
      message: 'LLM updated successfully',
      agent_id: agent_id
    });
  } catch (error) {
    console.error('Error updating LLM:', error);
    return res.status(500).json({ error: 'Failed to update LLM. Please try again later.' });
  }
});





router.post('/get-call-history', async (req, res) => {
  const { agent_id } = req.body;

  try {
    // Fetch the call list by agent ID
    const callListResponse = await retellClient.call.list({
      filter_criteria: {
        agent_id: [agent_id],
      },
    });

    // Return the call history in response
    res.status(200).json(callListResponse);
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ error: 'Failed to fetch call history.' });
  }
});



const extractQA = (transcripts) => {
  const questions = [];
  const answersMap = {};
  transcripts.forEach((transcript) => {
    if(transcript.transcript_object){
    transcript.transcript_object.forEach((entry, idx) => {
      if (entry.role === 'agent') {
        const question = entry.content.trim();

        if (!answersMap[question]) {
          answersMap[question] = [];
        }

        // Find next user response
        const nextEntry = transcript.transcript_object[idx + 1];
        if (nextEntry && nextEntry.role === 'user') {
          answersMap[question].push(nextEntry.content.trim());
        }
      }
    })};
  });

  Object.keys(answersMap).forEach((question) => {
    questions.push({ question, answers: answersMap[question] });
  });

  return questions;
};

// Format Q&A for OpenAI analysis
const formatForOpenAI = (qaList) => {
  return qaList
    .map(
      (qa, index) => `
    Question ${index + 1}: ${qa.question}
    User Answers: 
    ${qa.answers.join('\n')}
  `
    )
    .join('\n');
};

// Send formatted Q&A to OpenAI for classification
const classifyAnswers = async (qaFormatted) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an assistant that analyzes user responses to questions. Your tasks are:

1. **Identify and Group Questions**: Group similar questions (questions with similar meanings or intent) together.
2. **Provide Consolidated Responses**: For each group of similar questions, provide one consolidated response.
3. **Categorize Responses**: Categorize user responses into concise categories such as "Good", "Bad", "Yes", "No", "Can Be", "Faster", etc. Avoid using long descriptive answers.
4. **Percentage Breakdown**: Provide a percentage breakdown for each response category.
5. **Skip Descriptive Answers**: Skip questions that require descriptive answers and cannot be categorized.
6. **!!Most IMPORTANT--Exclude Irrelevant Questions**: Very strictly skip questions related to greetings, user details, etc. Focus only on questions related to the product or service.
7. **Short and Concise Categories**: Use shorter categories that best fit the responses.
8. **Highlight Responses**: Provide 1-3 bullet points highlighting the essence of the user responses. The bullet points should be summaries of the responses, not exact repetitions. Start each bullet point with an asterisk "*".
9. **Format Your Response**: Ensure the final response is formatted clearly and concisely, like this:
  
    "
    Q1: [Shorter intent or summary of question]
    [Bullet Point 1 highlighting a key response]
    [Bullet Point 2 highlighting another key response]
    [Bullet Point 3 highlighting an additional key response]
    - Good (X%)
    - Bad (Y%)
    - Not Sure (Z%)
    "
    This is the only format you should use. No additional content should be included.

10. **!!Very Important-Avoid Duplicates**: Ensure that there are no duplicate or similar responses for the same question group. Each group should have a single, concise categorization of user answers.

11. **Consolidation**: The total number of consolidated question groups should always be between 3 and 6.


 `
      },
      {
        role: 'user',
        content: qaFormatted,
      },
    ],
    max_tokens: 300,
  });

  const categorizedData = response.choices[0].message.content;
  return categorizedData
  // // Step 2: Now generate a pie chart for each question-response group
  // const pieChartResponses = [];
  // const categorizedQuestions = parseCategorizedData(categorizedData); // Function to parse the categorized data into an array
  // for (const questionGroup of categorizedQuestions) {
  //   const chartResponse = await generatePieChart('cat');
  //   pieChartResponses.push(chartResponse);
  // }
  // console.log(pieChartResponses)
  // return {
  //   categorizedData,
  //   pieCharts: pieChartResponses,
  // };
};


// const generatePieChart = async (questionGroup) => {
//   try {
//     const chartPrompt = `
//       Create a pie chart representing the following categorized data(one pie chart for each question)-

//       ${questionGroup}

//       Show the categories and their percentage breakdown in a simple pie chart. Use the percentages to visually divide the sections of the pie chart accordingly.
//     `;

//     const chartResponse = await openai.images.generate({
//       model:"dall-e-3",
//       prompt:chartPrompt,
//       size:"1024x1024",
//       quality:"standard",
//       n:1,
//   })
//     console.log(chartResponse)
//     return chartResponse.data[0].url
//   } catch (error) {
//     console.error('Error generating pie chart:', error);
//     throw error;
//   }
// };

// // Helper function to parse the categorized response data into structured question groups
// const parseCategorizedData = (categorizedData) => {
//   const questions = categorizedData.split('Q');
//   const questionGroups = questions.filter(Boolean).map((q) => `Q${q.trim()}`);
//   return questionGroups;
// };

// /get-insights route
router.post('/get-insights', async (req, res) => {
  try {
    const { calls } = req.body;

    // Step 1: Extract questions and answers from the transcripts
    const qaList = extractQA(calls);

    // Step 2: Format Q&A for OpenAI
    const qaFormatted = formatForOpenAI(qaList);

    // Step 3: Send formatted Q&A to OpenAI for classification
    const classification = await classifyAnswers(qaFormatted);
    // Step 4: Return classification results
    res.status(200).json({
      classification,
    });
  } catch (error) {
    console.error('Error processing insights:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});



module.exports = router;
