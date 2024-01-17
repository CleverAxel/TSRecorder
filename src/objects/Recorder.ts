import { IDOMElementRecorder } from "../interfaces/IDOMElement";

const VIDEO_CONSTRAINT: MediaTrackConstraintSet = {
    width: 854,
    height: 480,
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

    constructor() {
        this.element = {
            RECORDER_CONTAINER_DIV: document.querySelector(".recorder_container")!,
            RECORDER_DIV: document.querySelector(".recorder")!,
            CLOSE_RECORDER_BUTTON: document.querySelector(".close_recorder_button")!,
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

    public setDeviceConstraint(mediaStreamConstraint: MediaStreamConstraints, audioDeviceId: string | undefined, videoDeviceId: string | undefined) {

        this.mediaStreamConstraint = mediaStreamConstraint;
        if (this.mediaStreamConstraint.audio) {
            this.mediaStreamConstraint.audio = { ...AUDIO_CONSTRAINT };
            this.mediaStreamConstraint.audio.deviceId = audioDeviceId;
        }

        if (this.mediaStreamConstraint.video) {
            this.mediaStreamConstraint.video = { ...VIDEO_CONSTRAINT };
            this.mediaStreamConstraint.video.deviceId = videoDeviceId;
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

        return this;
    }

    public startStreamingToPreviewVideo() {
        if (this.mediaStreamConstraint == null) {
            console.error("No constraint passed");
            return null;
        }

        navigator.mediaDevices.getUserMedia(this.mediaStreamConstraint)
            .then((stream) => {
                this.mediaStream = stream;
                this.element.PREVIEW_VIDEO.srcObject = this.mediaStream
                console.info("Started streaming to the preview video.");
            });
    }

    private openRecorder() {
        this.element.RECORDER_CONTAINER_DIV.classList.remove("hidden");
        document.body.style.overflowY = "hidden";
        setTimeout(() => {
            this.isRecorderContainerUp = true;
            this.element.RECORDER_DIV.classList.remove("animation_enter_recorder");
        });
    }

    private closeRecorder() {
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

}