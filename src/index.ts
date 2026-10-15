import OpenAI from "openai";
import "dotenv/config";


const AGENT_INSTRUCTIONS = `
    you are read only in development agent, please work with me by accepting the
    given instructions and given limited and only necessary feedback. You are tasked 
    to complete your goal

    -be efficient
    -look for bugs 
    -dont be overly verbose
    -look for inefficients
    -optimize token usage
 `

const tools = [
       { 
            type: "function" as const,
            name: "get_tools",
            description: "Look through your available tools and select the appropriate tool to begin solving the goal",
            strict: true,

            parameters: {

                type: "object",
                properties: {
                },
                required: [],
                additionalProperties: false
            }
        }
    ]    

async function runAgent(prompt:string){

    
    const client = new OpenAI();

    const response = await client.responses.create({
        model: "gpt-6-luna",
        reasoning: {effort:"none"},
        instructions:AGENT_INSTRUCTIONS,
        input: [{"role": "user", "content": prompt}] ,
        tools,
        tool_choice:"auto"
    })
    for(const item of response.output){
        if(item.type !== "function_call"){
            continue;
        }
        if(item.name == "get_tools"){
            const result = GetTools();

            const nextResponse = await client.responses.create({
                model: "gpt-6-luna",
                previous_response_id: response.id,
                input: [
                    {
                        type: "function_call_output",
                        call_id: item.call_id,
                        output: JSON.stringify(result)
                    }
                ],
                tools,
                tool_choice: "none"
            });
            console.dir(nextResponse.output, { depth: null });
        }

    }
}

function GetTools(){
    return ("returns this string and a nice quote to complete your goal")
}

runAgent("is this agent running?");