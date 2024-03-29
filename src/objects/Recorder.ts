import { IDOMElementRecorder } from "../interfaces/IDOMElement";
import { ITraductionRecorder } from "../interfaces/ITraduction";
const GAP = 5;
const VIDEO_CONSTRAINT: MediaTrackConstraintSet = {
    width: 1280, //854
    height: 720, //480
    frameRate: { ideal: 24, max: 24 },
    facingMode: "user",
    deviceId: undefined,
};

const AUDIO_CONSTRAINT: MediaTrackConstraintSet = {
    deviceId: undefined
}

export class Recorder {
    private element: IDOMElementRecorder;
    private mediaStreamConstraint: MediaStreamConstraints | null = null;
    private isRecorderContainerUp = false;

    private mediaRecorder: MediaRecorder | null = null;
    private mediaStream: MediaStream | null = null;
    private recordedChunks: Blob[] = [];

    private timeElapsedInSeconds = 0;
    private idInterval: any = null;

    private isRecording = false;
    private isPaused = false;

    constructor(private tradRecorder:ITraductionRecorder) {
        this.element = {
            VIDEO_DEVICE_DISABLED_H3: document.querySelector(".recorder_video_device_disabled")!,
            RECORDER_CONTAINER_DIV: document.querySelector(".recorder_container")!,
            RECORDER_DIV: document.querySelector(".recorder")!,
            CLOSE_RECORDER_BUTTON: document.querySelector(".close_recorder_button")!,
            OPEN_RECORDER_BUTTON: document.querySelector("#display_recorder_button")!,
            START_RECORDING_BUTTON: document.querySelector("#start_recording_button")!,
            STOP_RECORDING_BUTTON: document.querySelector("#stop_recording_button")!,
            RECORDER_ACTION_BUTTONS_CONTAINER_DIV: document.querySelector(".recorder_action_buttons_container")!,
            PAUSE_RESUME_BUTTON: document.querySelector("#pause_resume_recording_button")!,
            TOGGLE_VIDEO_DEVICE_BUTTON: document.querySelector("#toggle_video_device_button")!,
            PREVIEW_VIDEO: document.querySelector("#preview_video")!,
            RECORDED_VIDEO: null!,
            TIME_ELAPSED_SINCE_RECORD_STARTED_SPAN: document.querySelector(".time_elapsed")!
        }
    }

    public setDeviceConstraint(mediaStreamConstraint: MediaStreamConstraints, audioDeviceId: string | undefined, videoDeviceId: string | undefined) {

        this.mediaStreamConstraint = mediaStreamConstraint;
        if (this.mediaStreamConstraint.audio) {
            this.mediaStreamConstraint.audio = { ...AUDIO_CONSTRAINT };
            this.mediaStreamConstraint.audio.deviceId = audioDeviceId;
        }

        if (this.mediaStreamConstraint.video) {
            this.mediaStreamConstraint.video = { ...VIDEO_CONSTRAINT };
            this.mediaStreamConstraint.video.deviceId = videoDeviceId;
        } else {
            this.element.TOGGLE_VIDEO_DEVICE_BUTTON.disabled = true;
        }


        return this;
    }

    public initEventListeners() {
        if (this.mediaStreamConstraint == null) {
            console.error("No constraint passed");
            return null;
        }

        this.element.OPEN_RECORDER_BUTTON.addEventListener("click", this.openRecorder.bind(this));
        this.element.CLOSE_RECORDER_BUTTON.addEventListener("click", this.closeRecorder.bind(this));
        window.addEventListener("click", this.closerecorderIfClickOutsideOfIt.bind(this));

        this.element.START_RECORDING_BUTTON.addEventListener("click", this.startRecording.bind(this));
        this.element.TOGGLE_VIDEO_DEVICE_BUTTON.addEventListener("click", this.toggleVideoDevice.bind(this))

        this.element.PAUSE_RESUME_BUTTON.addEventListener("click", this.pauseOrResumeVideo.bind(this));
        this.element.STOP_RECORDING_BUTTON.addEventListener("click", this.stopRecording.bind(this));

        return this;
    }

    public startStreamingToPreviewVideo(): Promise<void> | null {
        if (this.mediaStreamConstraint == null) {
            console.error("No constraint passed");
            return null;
        }
        return new Promise((resolve) => {
            navigator.mediaDevices.getUserMedia(this.mediaStreamConstraint!)
                .then((stream) => {
                    this.mediaStream = stream;
                    this.element.PREVIEW_VIDEO.srcObject = this.mediaStream
                    console.info("Started streaming to the preview video.");
                    resolve();
                });
        })
    }

    public openRecorder() {
        if (this.mediaStream == null) {
            window.alert("No media stream available, the record will fail.");
        }

        this.element.RECORDER_CONTAINER_DIV.classList.remove("hidden");
        document.body.style.overflowY = "hidden";
        setTimeout(() => {
            this.isRecorderContainerUp = true;
            this.element.RECORDER_DIV.classList.remove("animation_enter_recorder");
        });
    }

    private toggleVideoDevice() {
        if (!this.mediaStreamConstraint?.video) {
            window.alert("Didn't get the permission to use the video device or it doesn't exist.");
            return;
        }
        if (this.mediaStream != null) {
            this.element.VIDEO_DEVICE_DISABLED_H3.classList.toggle("hidden");
            this.mediaStream.getVideoTracks()[0].enabled = !this.mediaStream.getVideoTracks()[0].enabled;
            this.element.TOGGLE_VIDEO_DEVICE_BUTTON.classList.toggle("disabled_by_user");
        }
    }

    private async closeRecorder() {
        if(this.isRecording){
            if(window.confirm(this.tradRecorder.leaveWhileRecording)){
                await this.stopRecording();
                return;
            }
        }
        
        this.element.RECORDER_CONTAINER_DIV.classList.add("hidden");
        document.body.style.overflowY = "";
        this.isRecorderContainerUp = false;
        this.element.RECORDER_DIV.classList.add("animation_enter_recorder");
    }

    private closerecorderIfClickOutsideOfIt(e: Event) {
        if (!this.isRecorderContainerUp) {
            return;
        }

        let element = e.target as Element;
        if (element.closest(".recorder") == null) {
            this.closeRecorder();
        }
    }

    private pauseOrResumeVideo(){
        if (!this.isRecording) {
            console.warn("No recording started or no recorder set.")
            return;
        }

        if (this.isPaused) {
            this.resumeRecording();
        } else {
            this.pauseRecording();
        }

        this.isPaused = !this.isPaused;
    }

    private pauseRecording() {
        clearInterval(this.idInterval);
        this.element.PAUSE_RESUME_BUTTON.querySelector(".pause_icon")?.classList.add("hidden");
        this.element.PAUSE_RESUME_BUTTON.querySelector(".resume_icon")?.classList.remove("hidden");
        this.element.PAUSE_RESUME_BUTTON.title = this.tradRecorder.video.button.resume;
        this.element.START_RECORDING_BUTTON.classList.add("paused");

    }

    private resumeRecording() {
        this.startInterval();
        this.element.PAUSE_RESUME_BUTTON.querySelector(".pause_icon")?.classList.remove("hidden");
        this.element.PAUSE_RESUME_BUTTON.querySelector(".resume_icon")?.classList.add("hidden");
        this.element.PAUSE_RESUME_BUTTON.title = this.tradRecorder.video.button.pause;
        this.element.START_RECORDING_BUTTON.classList.remove("paused");
    }

    private startRecording() {
        if (this.mediaStream == null) {
            console.warn("No media stream available");
            return;
        }

        if (this.isRecording) {
            console.warn("Recording already started");
            return;
        }

        this.isRecording = true;
        this.recordedChunks = [];

        this.animateButtonsIn();
        this.startCounterTimeElapsed();

        this.mediaRecorder = new MediaRecorder(this.mediaStream);
        this.initEventListenersOnMediaRecorder();
        this.mediaRecorder.start();
        console.info("started the recording");
    }

    private initEventListenersOnMediaRecorder(){
        if(this.mediaRecorder == null){
            console.warn("No media recorder set");
            return;
        }
        
        this.mediaRecorder.ondataavailable = (blobEvent) => {
            this.recordedChunks.push(blobEvent.data);
        }

        this.mediaRecorder.onstop = () => {
            console.info("Stopped the recording");
            // let recordedBlob = new Blob(this.recordedChunks, { type: "video/webm" });

            // this.element.RECORDED_VIDEO.src = URL.createObjectURL(recordedBlob);

            // this.downloadButton.href = this.recordedVideo.src;
            // this.downloadButton.download = "RecordedVideo.webm";
        }
    }
    
    private async stopRecording(){
        if(!this.isRecording){
            console.warn("Not recording");
            return;
        }

        this.isRecording = false;
        this.mediaRecorder?.stop();
        clearInterval(this.idInterval);
        await this.animateButtonsOut();
        this.closeRecorder();
    }

    private animateButtonsIn() {
        let buttonWidth = this.element.TOGGLE_VIDEO_DEVICE_BUTTON.getBoundingClientRect().width;
        this.element.START_RECORDING_BUTTON.classList.add("active");
        let offsetLeft = this.element.START_RECORDING_BUTTON.offsetLeft - 10;
        this.element.START_RECORDING_BUTTON.style.transform = `translateX(-${offsetLeft}px)`;

        this.element.START_RECORDING_BUTTON.addEventListener("transitionend", () => {
            if (this.mediaStreamConstraint?.video) {
                this.element.TOGGLE_VIDEO_DEVICE_BUTTON.style.transform = `translateX(-${buttonWidth + (buttonWidth / 2) + (GAP * 2)}px)`;
                this.element.RECORDER_ACTION_BUTTONS_CONTAINER_DIV.style.transform = `translateX(${(buttonWidth / 2) + GAP}px)`;
            }

            this.element.RECORDER_ACTION_BUTTONS_CONTAINER_DIV.classList.remove("off_screen");

        }, { once: true });
    }

    private animateButtonsOut():Promise<void>{
        return new Promise((resolve) => {
            this.element.RECORDER_ACTION_BUTTONS_CONTAINER_DIV.classList.add("off_screen");
            this.element.RECORDER_ACTION_BUTTONS_CONTAINER_DIV.addEventListener("transitionend", () => {
                if (this.mediaStreamConstraint?.video) {
                    this.element.TOGGLE_VIDEO_DEVICE_BUTTON.style.transform = ``;
                    this.element.RECORDER_ACTION_BUTTONS_CONTAINER_DIV.style.transform = ``;
                }
    
                this.element.START_RECORDING_BUTTON.classList.remove("active");
                this.element.START_RECORDING_BUTTON.style.transform = ``;
                resolve();
            }, {once: true});
        })
    }

    private startCounterTimeElapsed() {
        this.timeElapsedInSeconds = 0;
        this.formaTimeInCounter();
        this.startInterval();
    }

    private startInterval() {
        this.idInterval = setInterval(() => {
            this.timeElapsedInSeconds++;
            this.formaTimeInCounter();
        }, 1000);
    }

    private formaTimeInCounter() {
        let minute = Math.floor(this.timeElapsedInSeconds / 60);
        let second = this.timeElapsedInSeconds % 60;

        let minuteFormat = minute < 10 ? `0${minute}` : minute;
        let secondFormat = second < 10 ? `0${second}` : second;

        this.element.TIME_ELAPSED_SINCE_RECORD_STARTED_SPAN.innerText = `${minuteFormat}:${secondFormat}`;
    }

}