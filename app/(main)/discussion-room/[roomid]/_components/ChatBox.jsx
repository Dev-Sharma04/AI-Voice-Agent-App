import { Button } from '@/components/ui/button'
import { CoachingOptions } from '@/services/Options';
import { LoaderCircle } from 'lucide-react';
import React, { useState } from 'react'

function ChatBox({conversation,enableFeedbackNotes, coachingOption}) {

    const [ loading,setLoading] = useState(false);
    const GenerateFeedbackNotes = async()=> {
        setLoading(true);

        const result= await AIModelToGenerateFeedbackAndNotes( coachingOption,conversation);
        console.log(result.content);

        setLoading(false);
    }
  return (
        <div>
            <div className=' h-[60vh] bg-secondary border rounded-xl flex flex-col  relative p-4 overflow-auto scrollbar-hide'>
                    {/*<div>*/}
                        {conversation.map((item,index) => (
                            <div className={`flex ${item.role=='user' && 'justify-end'}`}>
                                {item.role == 'assistant'? 
                                <h2  className='p-1 px-2 bg-primary mt-2 text-white inline-block rounded-md '>{item.content}</h2> 
                                :
                                <h2 className='p-1 px-2 bg-gray-200 mt-2 inline-block rounded-md justify-end'>{item?.content}</h2> 
                                }
                            </div>
                        ))}
                    {/*</div>*/}
            </div>
            {!enableFeedbackNotes? <h2 className='mt-4 text-gray-400 text-sm'>At the end of your conversation, we will automatically generate feedback/notes from your conversation.</h2>
            :
            <Button onClick={GenerateFeedbackNotes} disabled={loading} className='mt-7 w-full'>
            {loading&&<LoaderCircle className='animate-spin'/>}
                Generate Feedback/Notes
            </Button>}
        </div>
  )
}

export default ChatBox