import OpenAI from "openai";
import "dotenv/config";

async function runAgent(prompt:string){
    
    
    const client = new OpenAI();

    const response = await client.responses.create({
        model: "gpt-6-luna",
        reasoning: {effort:"none"},
        input: [{"role": "user", "content": prompt}] 
    })

    console.log(response.output_text);
}

runAgent("is this agent running?");