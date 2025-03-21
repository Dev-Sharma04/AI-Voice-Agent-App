"use client"
import { api } from '@/convex/_generated/api';
import { CoachingExpert } from '@/services/Options';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { UserButton } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
//import dynamic from 'next/dynamic';
// const RecordRTC = dynamic(() => import('recordrtc'), { ssr: false });
import RecordRTC from 'recordrtc';
import { RealtimeTranscriber } from 'assemblyai';
import { AIModel, getToken } from '@/services/GlobalServices';
import { Loader2Icon } from 'lucide-react';

function DiscussionRoom() {
    const {roomid} = useParams();
    const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom,{id:roomid});
    const [expert,setExpert] = useState();
    const [enableMic,setEnableMic] = useState(false);
    const recorder = useRef(null)
    const realtimeTranscriber = useRef(null);
    let silenceTimeout ;
    const [transcribe, setTranscribe] = useState();
    const [conversation,setConversation] = useState([]); 
    const [loading,setLoading] = useState(false);
    let texts = {};

    useEffect(()=>{
        if(DiscussionRoomData){
            const Expert=CoachingExpert.find(item=>item.name == DiscussionRoomData.expertName);
            console.log(Expert);
            setExpert(Expert);
        }
    },[DiscussionRoomData])

    const connectToServer= async ()=>{
        setEnableMic(true);
        setLoading(true);
        //intialize assembly AI

        realtimeTranscriber.current= new RealtimeTranscriber({
            token:await getToken(),
            sample_rate:16_000
        })
        //for the third commit
        realtimeTranscriber.current.on('transcript',async(transcript)=>{
            console.log(transcript);
            let msg = '';

            if(transcript.message_type == 'FinalTranscript'){
                setConversation(prev=>[...prev,{
                    role:'user',
                    content:transcript.text
                }]);

                //Calling AI text model to get response
                const aiResp=await AIModel(DiscussionRoomData.topic,DiscussionRoomData.coachingOption,transcript.text);

                console.log(aiResp);
            }
            texts[transcript.audio_start]=transcript?.text;
            const keys = Object.keys(texts);
            keys.sort((a, b) => a - b);

            for(const key of keys){
                if(texts[key]){
                    msg+=`${texts[key]}`
                }
            }

            setTranscribe(msg);
        })

        await realtimeTranscriber.current.connect();
        setLoading(false);
        if(typeof window !== "undefined" && typeof navigator !== "undefined"){
            navigator.mediaDevices.getUserMedia({audio:true})
            .then((stream) =>{
                recorder.current = new RecordRTC(stream,{
                    type: 'audio',
                    MimeType: 'audio/webm;codecs=pcm',
                    recorderType: RecordRTC.StereoAudio,
                    timeSlice: 250,
                    desiredSampRate: 16000,
                    numberOfAudioChannels: 1,
                    bufferSize: 4096,
                    audioBitsPerSecond: 128000,
                    ondataavailable: async (blob)  => {
                        if(!realtimeTranscriber.current) return;
                        //Reset the silence detection timer on audio input
                        clearTimeout(silenceTimeout);

                        const buffer = await blob.arrayBuffer();

                        console.log(buffer);
                        realtimeTranscriber.current.sendAudio(buffer);

                        //Restart the silence detection timer
                        silenceTimeout = setTimeout(() => {
                            console.log('User stopped talking');
                            //Handle user stopped talking(eg. send final transcript, stop recording, etc)
                        },2000);
                    },
                });
                recorder.current.startRecording();
            })
            .catch((err) => console.error(err));
        }
    }

    const disconnect= async(e) => {
        e.preventDefault();
        setLoading(true);
        await realtimeTranscriber.current.close();
        recorder.current.pauseRecording();
        recorder.current=null;
        setEnableMic(false);
        setLoading(false);
    }
  return (
    <div className='-mt-12'>
        <h2 className='text-lg font-bold'>{DiscussionRoomData?.coachingOption}</h2>
        <div className='mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10'>
            <div className='lg:col-span-2'>
                <div className='l h-[60vh] bg-secondary border rounded-4xl
                flex flex-col items-center justify-center relative'>
                    <Image src={expert?.avatar} alt='Avatar' width={200} height={200}
                    className='h-[80px] w-[80px] rounded-full object-cover animate-pulse'
                    />
                    <h2 className='text-gray-500'>{expert?.name}</h2>
                    <div className='p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10'>
                        <UserButton/>
                    </div>
                </div>
                <div className='mt-5 flex items-center justify-center '> 
                    {!enableMic ?<Button onClick={connectToServer} disabled={loading}> {loading&&<Loader2Icon className='animate-spin'/>}Connect</Button>
                    :
                    <Button variant="destructive" onClick={disconnect} disabled={loading}> {loading&&<Loader2Icon className='animate-spin'/>} Disconnect</Button>}
                </div>
            </div>
            <div>
                <div className=' h-[60vh] bg-secondary border rounded-4xl
                flex flex-col items-center justify-center relative'>
            
                <h2>Chat Section</h2>
                </div>
                <h2 className='mt-4 text-gray-400 text-sm'>At the end of your conversation, we will automatically generate feedbac/notes from your conversation.</h2>
            </div>
        </div>
        <div>
            <h2>{transcribe}</h2>
        </div>
    </div>
  )
}

export default DiscussionRoom