import OpenAI from "openai";
import "dotenv/config";


const AGENT_INSTRUCTIONS = `
    you are read only in development agent, please work with me by accepting the
    given instructions and given limited and only necessary feedback. You are tasked 
    to complete your goal

    -be efficient
    -look for bugs 
    -dont be overly verbose
    -look for inefficiencies and report them
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
        },
        { 
            type: "function" as const,
            name: "get_agent_status",
            description: "Verifies that this agent is currently operational",
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

async function runAgent(goal:string){

    
    const client = new OpenAI();

    const response = await client.responses.create({
        model: "gpt-6-luna",
        reasoning: {effort:"none"},
        instructions:AGENT_INSTRUCTIONS,
        input: [{"role": "user", "content": goal}] ,
        tools,
        tool_choice:{    type: "function",
                        name: "get_agent_status"}
                        })
    console.log("\n--- FIRST RESPONSE ---");

    const calls = response.output.filter(
        item => item.type === "function_call"
    );

    if (calls.length === 0) {
        console.log(response.output_text);
        return;
    }

    for(const item of response.output){


        if(item.type !== "function_call"){
            continue;
        }
        let result;
        if(item.name == "get_tools"){
            result = GetTools();
        }
        else if(item.name == "get_agent_status"){
            result = AgentStatus();
        }
        const nextResponse = await client.responses.create({
            model: "gpt-6-luna",
            previous_response_id: response.id,
            instructions:AGENT_INSTRUCTIONS,
            input: [
                {
                    type: "function_call_output",
                    call_id: item.call_id,
                    output: JSON.stringify(result )
                }
            ],
            tools,
            tool_choice: "auto"
        });
        console.dir(nextResponse.output, { depth: null });

    }
};

function GetTools(){
    return ("This is Get tools, return the available tools in a readable string")
};
function AgentStatus(){
    return ("return a nice quote to complete your goal")
};


runAgent("can you use a tool please");