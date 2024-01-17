import { IDOMElementRecorder } from "../interfaces/IDOMElement";
import { IDeviceConstraint } from "../interfaces/IDeviceConstraint";

const VIDEO_CONSTRAINT = {
    width: 854,
    height: 480,
    frameRate: { ideal: 24, max: 24 },
    facingMode: "user",
    deviceId: null,
};

const AUDIO_CONSTRAINT = {
    deviceId: null
};

export class Recorder{
    private element:IDOMElementRecorder;
    private deviceConstraint!:IDeviceConstraint;
    constructor(){
        this.element = {
            OPEN_RECORDER_BUTTON: document.querySelector("#display_recorder_button")!,
            START_RECORDING_BUTTON: document.querySelector("#start_recording_button")!,
            STOP_RECORDING_BUTTON: document.querySelector("#stop_recording_button")!,
            PAUSE_RESUME_BUTTON: document.querySelector("#pause_resume_recording_button")!,
            TOGGLE_VIDEO_DEVICE_BUTTON: document.querySelector("#toggle_video_device_button")!,
            PREVIEW_VIDEO: document.querySelector("#preview_video")!,
            RECORDED_VIDEO: null!,
            TIME_ELAPSED_SINCE_RECORD_STARTED_SPAN: document.querySelector(".time_elapsed")!
        }
    }

    setDeviceConstraint(deviceConstraint:IDeviceConstraint, audioDeviceId:string|null, videoDeviceId:string|null){
        this.deviceConstraint = deviceConstraint;
        if(this.deviceConstraint.audio){
            this.deviceConstraint.audio = {...AUDIO_CONSTRAINT};
            this.deviceConstraint.audio.deviceId = audioDeviceId;
        }

        if(this.deviceConstraint.video){
            this.deviceConstraint.video = {...VIDEO_CONSTRAINT};
            this.deviceConstraint.video.deviceId = videoDeviceId;
        }

        console.log(deviceConstraint);
        
    }
}